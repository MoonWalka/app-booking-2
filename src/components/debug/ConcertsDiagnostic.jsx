import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';

/**
 * Composant de diagnostic pour analyser les problèmes de chargement des concerts
 */
const ConcertsDiagnostic = () => {
  const { currentOrg } = useOrganization();
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = useCallback(async () => {
    setLoading(true);
    const results = {
      timestamp: new Date().toISOString(),
      currentOrg: currentOrg,
      tests: []
    };

    try {
      // Test 1: Chargement direct
      try {
        const concertsRef = collection(db, 'concerts');
        const snapshot = await getDocs(concertsRef);
        results.tests.push({
          name: 'Chargement direct collection concerts',
          status: 'success',
          data: { count: snapshot.docs.length },
          message: `${snapshot.docs.length} concerts trouvés`
        });

        // Analyser les champs des premiers documents
        if (snapshot.docs.length > 0) {
          const firstDoc = snapshot.docs[0].data();
          const fields = Object.keys(firstDoc);
          const hasDate = fields.includes('date');
          const hasDateEvenement = fields.includes('dateEvenement');
          
          results.tests.push({
            name: 'Analyse des champs de date',
            status: hasDateEvenement ? 'success' : 'warning',
            data: { fields, hasDate, hasDateEvenement },
            message: `Champs trouvés: ${fields.join(', ')}`
          });
        }
      } catch (error) {
        results.tests.push({
          name: 'Chargement direct collection concerts',
          status: 'error',
          error: error.message
        });
      }

      // Test 2: Tri par dateEvenement
      try {
        const concertsRef = collection(db, 'concerts');
        const sortedQuery = query(concertsRef, orderBy('dateEvenement', 'desc'));
        const snapshot = await getDocs(sortedQuery);
        results.tests.push({
          name: 'Tri par dateEvenement',
          status: 'success',
          data: { count: snapshot.docs.length },
          message: `Tri réussi, ${snapshot.docs.length} concerts`
        });
      } catch (error) {
        results.tests.push({
          name: 'Tri par dateEvenement',
          status: 'error',
          error: error.message,
          message: 'Échec du tri - champ manquant ou index absent'
        });
      }

      // Test 3: Tri par date (fallback)
      try {
        const concertsRef = collection(db, 'concerts');
        const sortedQuery = query(concertsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(sortedQuery);
        results.tests.push({
          name: 'Tri par date (fallback)',
          status: 'success',
          data: { count: snapshot.docs.length },
          message: `Tri réussi, ${snapshot.docs.length} concerts`
        });
      } catch (error) {
        results.tests.push({
          name: 'Tri par date (fallback)',
          status: 'error',
          error: error.message
        });
      }

      // Test 4: Tri par createdAt
      try {
        const concertsRef = collection(db, 'concerts');
        const sortedQuery = query(concertsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(sortedQuery);
        results.tests.push({
          name: 'Tri par createdAt',
          status: 'success',
          data: { count: snapshot.docs.length },
          message: `Tri réussi, ${snapshot.docs.length} concerts`
        });
      } catch (error) {
        results.tests.push({
          name: 'Tri par createdAt',
          status: 'error',
          error: error.message
        });
      }

    } catch (globalError) {
      results.tests.push({
        name: 'Diagnostic global',
        status: 'error',
        error: globalError.message
      });
    }

    setDiagnosticResults(results);
    setLoading(false);
  }, [currentOrg]);

  useEffect(() => {
    runDiagnostic();
  }, [currentOrg, runDiagnostic]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔍';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
        <h3>🔍 Diagnostic des concerts en cours...</h3>
        <div>Analyse de la configuration et des données...</div>
      </div>
    );
  }

  if (!diagnosticResults) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
        <button onClick={runDiagnostic}>Lancer le diagnostic</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0', fontFamily: 'monospace' }}>
      <h3>🔍 Diagnostic des concerts</h3>
      <div style={{ marginBottom: '15px' }}>
        <strong>Organisation:</strong> {diagnosticResults.currentOrg?.nom || 'Aucune'}
        <br />
        <strong>Timestamp:</strong> {new Date(diagnosticResults.timestamp).toLocaleString()}
      </div>
      
      <div>
        <h4>Tests effectués:</h4>
        {diagnosticResults.tests.map((test, index) => (
          <div key={index} style={{ 
            marginBottom: '10px', 
            padding: '10px', 
            border: '1px solid #eee', 
            borderLeft: `4px solid ${getStatusColor(test.status)}`,
            borderRadius: '4px'
          }}>
            <div style={{ fontWeight: 'bold' }}>
              {getStatusIcon(test.status)} {test.name}
            </div>
            {test.message && (
              <div style={{ color: '#666', marginTop: '5px' }}>
                {test.message}
              </div>
            )}
            {test.error && (
              <div style={{ color: '#dc3545', marginTop: '5px', fontSize: '12px' }}>
                Erreur: {test.error}
              </div>
            )}
            {test.data && (
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                Données: {JSON.stringify(test.data, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '15px' }}>
        <button onClick={runDiagnostic} style={{ marginRight: '10px' }}>
          🔄 Relancer le diagnostic
        </button>
        <button onClick={() => window.location.reload()}>
          🔃 Recharger la page
        </button>
      </div>
    </div>
  );
};

export default ConcertsDiagnostic;