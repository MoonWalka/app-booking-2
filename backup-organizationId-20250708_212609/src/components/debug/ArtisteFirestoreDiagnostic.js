import React, { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  db
} from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/**
 * Diagnostic direct des requêtes Firestore pour les artistes
 */
const ArtisteFirestoreDiagnostic = () => {
  const { currentEntreprise } = useEntreprise();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const runDiagnostic = async () => {
    setLoading(true);
    const orgId = currentEntreprise?.id;
    const diagnosticResults = {
      timestamp: new Date().toISOString(),
      organizationId: orgId,
      tests: []
    };
    
    try {
      // Test 1: Requête simple sans filtre
      console.log('🔍 Test 1: Requête sans filtre...');
      const test1Query = query(
        collection(db, 'artistes'),
        limit(5)
      );
      const test1Snapshot = await getDocs(test1Query);
      
      diagnosticResults.tests.push({
        name: 'Requête sans filtre (limit 5)',
        query: 'collection(artistes).limit(5)',
        count: test1Snapshot.size,
        results: test1Snapshot.docs.map(doc => ({
          id: doc.id,
          nom: doc.data().nom,
          organizationId: doc.data().organizationId
        }))
      });
      
      // Test 2: Requête avec organizationId
      if (orgId) {
        console.log('🔍 Test 2: Requête avec organizationId...');
        const test2Query = query(
          collection(db, 'artistes'),
          where('organizationId', '==', orgId),
          limit(10)
        );
        const test2Snapshot = await getDocs(test2Query);
        
        diagnosticResults.tests.push({
          name: `Requête avec organizationId=${orgId}`,
          query: `where('organizationId', '==', '${orgId}')`,
          count: test2Snapshot.size,
          results: test2Snapshot.docs.map(doc => ({
            id: doc.id,
            nom: doc.data().nom,
            organizationId: doc.data().organizationId
          }))
        });
      }
      
      // Test 3: Requête avec orderBy
      console.log('🔍 Test 3: Requête avec orderBy...');
      try {
        const test3Query = query(
          collection(db, 'artistes'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const test3Snapshot = await getDocs(test3Query);
        
        diagnosticResults.tests.push({
          name: 'Requête avec orderBy createdAt',
          query: `orderBy('createdAt', 'desc').limit(5)`,
          count: test3Snapshot.size,
          results: test3Snapshot.docs.map(doc => ({
            id: doc.id,
            nom: doc.data().nom,
            createdAt: doc.data().createdAt,
            organizationId: doc.data().organizationId
          }))
        });
      } catch (error) {
        diagnosticResults.tests.push({
          name: 'Requête avec orderBy createdAt',
          error: error.message,
          hint: 'Index manquant ? Vérifiez firestore.indexes.json'
        });
      }
      
      // Test 4: Requête composée (organizationId + orderBy)
      if (orgId) {
        console.log('🔍 Test 4: Requête composée...');
        try {
          const test4Query = query(
            collection(db, 'artistes'),
            where('organizationId', '==', orgId),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const test4Snapshot = await getDocs(test4Query);
          
          diagnosticResults.tests.push({
            name: 'Requête composée (organizationId + orderBy)',
            query: `where('organizationId', '==', '${orgId}').orderBy('createdAt', 'desc')`,
            count: test4Snapshot.size,
            results: test4Snapshot.docs.map(doc => ({
              id: doc.id,
              nom: doc.data().nom,
              createdAt: doc.data().createdAt,
              organizationId: doc.data().organizationId
            }))
          });
        } catch (error) {
          diagnosticResults.tests.push({
            name: 'Requête composée (organizationId + orderBy)',
            error: error.message,
            hint: 'Index composite manquant pour (organizationId, createdAt)'
          });
        }
      }
      
      // Test 5: Recherche de "m'dezoen"
      console.log('🔍 Test 5: Recherche spécifique...');
      const allArtistesQuery = query(
        collection(db, 'artistes'),
        limit(100)
      );
      const allArtistesSnapshot = await getDocs(allArtistesQuery);
      
      const searchResults = [];
      allArtistesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.nom && data.nom.toLowerCase().includes("m'dezoen")) {
          searchResults.push({
            id: doc.id,
            nom: data.nom,
            organizationId: data.organizationId,
            matchesCurrentOrg: data.organizationId === orgId
          });
        }
      });
      
      diagnosticResults.tests.push({
        name: "Recherche de 'm'dezoen'",
        query: "Filtrage manuel sur 100 premiers artistes",
        count: searchResults.length,
        results: searchResults
      });
      
      // Test 6: Analyse des organizationId
      console.log('🔍 Test 6: Analyse des organizationId...');
      const orgAnalysis = {};
      let nullOrgCount = 0;
      
      allArtistesSnapshot.docs.forEach(doc => {
        const orgId = doc.data().organizationId;
        if (!orgId) {
          nullOrgCount++;
        } else {
          orgAnalysis[orgId] = (orgAnalysis[orgId] || 0) + 1;
        }
      });
      
      diagnosticResults.tests.push({
        name: 'Analyse des organizationId (sur 100)',
        nullCount: nullOrgCount,
        distribution: orgAnalysis,
        currentEntrepriseCount: orgAnalysis[orgId] || 0
      });
      
    } catch (error) {
      diagnosticResults.error = {
        message: error.message,
        code: error.code,
        stack: error.stack
      };
    }
    
    setResults(diagnosticResults);
    setLoading(false);
    console.log('📊 Diagnostic complet:', diagnosticResults);
  };
  
  return (
    <Card>
      <div className="card-header">
        <h3>🔬 Diagnostic Firestore Artistes</h3>
      </div>
      <div className="card-body">
        <div className="alert alert-info mb-3">
          <strong>Organisation actuelle :</strong> {currentEntreprise?.name || 'Aucune'}
          <br />
          <strong>ID :</strong> <code>{currentEntreprise?.id || 'N/A'}</code>
        </div>
        
        <Button 
          variant="primary" 
          onClick={runDiagnostic}
          disabled={loading}
          className="mb-3"
        >
          {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
        </Button>
        
        {results && (
          <div>
            <h5>📊 Résultats du diagnostic</h5>
            <small className="text-muted">Timestamp: {results.timestamp}</small>
            
            {results.error && (
              <div className="alert alert-danger mt-3">
                <h6>❌ Erreur globale</h6>
                <p className="mb-0">{results.error.message}</p>
                <small>{results.error.code}</small>
              </div>
            )}
            
            {results.tests.map((test, index) => (
              <div key={index} className="card mt-3">
                <div className="card-header">
                  <h6 className="mb-0">{test.name}</h6>
                  {test.query && (
                    <code className="small">{test.query}</code>
                  )}
                </div>
                <div className="card-body">
                  {test.error ? (
                    <div className="alert alert-danger">
                      <p className="mb-0">❌ {test.error}</p>
                      {test.hint && (
                        <small className="d-block mt-2">💡 {test.hint}</small>
                      )}
                    </div>
                  ) : (
                    <>
                      {test.count !== undefined && (
                        <p>Résultats trouvés : <strong>{test.count}</strong></p>
                      )}
                      
                      {test.results && test.results.length > 0 && (
                        <div className="list-group">
                          {test.results.slice(0, 5).map((result, idx) => (
                            <div key={idx} className="list-group-item">
                              <strong>{result.nom || 'Sans nom'}</strong>
                              <br />
                              <small>
                                ID: {result.id.slice(0, 8)}...
                                {result.organizationId && (
                                  <> | Org: {result.organizationId === currentEntreprise?.id ? 
                                    <span className="text-success">✓ Match</span> : 
                                    <span className="text-danger">✗ {result.organizationId.slice(0, 8)}...</span>
                                  }</>
                                )}
                                {result.matchesCurrentOrg !== undefined && (
                                  <> | {result.matchesCurrentOrg ? '✅ Organisation OK' : '❌ Mauvaise organisation'}</>
                                )}
                              </small>
                            </div>
                          ))}
                          {test.results.length > 5 && (
                            <div className="list-group-item text-muted">
                              ... et {test.results.length - 5} autres
                            </div>
                          )}
                        </div>
                      )}
                      
                      {test.distribution && (
                        <div className="mt-2">
                          <p className="mb-1">Distribution par organisation :</p>
                          <ul className="small">
                            <li>Sans organization : <strong>{test.nullCount}</strong></li>
                            {Object.entries(test.distribution).map(([orgId, count]) => (
                              <li key={orgId}>
                                {orgId}: <strong>{count}</strong>
                                {orgId === currentEntreprise?.id && ' ⭐'}
                              </li>
                            ))}
                          </ul>
                          <p className="text-primary">
                            Votre organisation : <strong>{test.currentEntrepriseCount}</strong> artistes
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ArtisteFirestoreDiagnostic;