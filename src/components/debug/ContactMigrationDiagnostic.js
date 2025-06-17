import React, { useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { analyzeContact, detectMigrationStatus } from '@/utils/contactMigrationDetection';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './ContactMigrationDiagnostic.module.css';

/**
 * Composant de diagnostic pour tester la nouvelle logique de détection de migration
 */
const ContactMigrationDiagnostic = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🔍 Début du diagnostic de migration...');
      
      // Rechercher dans la collection contacts globale
      const contactsRef = collection(db, 'contacts');
      const contactsQuery = query(contactsRef, limit(10));
      const snapshot = await getDocs(contactsQuery);
      
      console.log(`📊 ${snapshot.size} contacts trouvés`);
      
      const diagnosticResults = [];
      
      snapshot.forEach((doc, index) => {
        const contactData = doc.data();
        const contactId = doc.id;
        
        console.log(`📋 Analyse contact ${index + 1}: ${contactData.prenom || '[Sans prénom]'} ${contactData.nom || '[Sans nom]'}`);
        
        // Analyser avec l'ancienne logique (pour comparaison)
        const oldLogic = contactData.hasOwnProperty('structureRaisonSociale') || 
                        contactData.hasOwnProperty('salleNom') || 
                        contactData.hasOwnProperty('nomFestival') ||
                        contactData.hasOwnProperty('civilite2') ||
                        contactData.hasOwnProperty('prenom2');
        
        // Analyser avec la nouvelle logique
        const newAnalysis = analyzeContact(contactData);
        
        // Résumé des champs présents
        const fieldsSummary = {
          structureRaisonSociale: !!contactData.structureRaisonSociale,
          structureAdresse: !!contactData.structureAdresse,
          salleNom: !!contactData.salleNom,
          nomFestival: !!contactData.nomFestival,
          prenom2: !!contactData.prenom2,
          civilite2: !!contactData.civilite2,
          migrationVersion: !!contactData.migrationVersion,
          organizationId: !!contactData.organizationId
        };
        
        diagnosticResults.push({
          contactId,
          displayName: contactData.prenom && contactData.nom 
            ? `${contactData.prenom} ${contactData.nom}`
            : contactData.structureRaisonSociale || contactData.structureNom || 'Contact sans nom',
          oldLogicResult: oldLogic ? 'Déjà migré' : 'Pas migré',
          newLogicResult: newAnalysis.migrationStatus,
          sectionsPresent: newAnalysis.sectionsPresent,
          sectionsTotal: newAnalysis.sectionsTotal,
          migrationRequired: newAnalysis.migrationRequired,
          recommendations: newAnalysis.recommendations,
          fieldsSummary,
          rawData: {
            prenom: contactData.prenom,
            nom: contactData.nom,
            structureRaisonSociale: contactData.structureRaisonSociale,
            structureNom: contactData.structureNom,
            email: contactData.email,
            organizationId: contactData.organizationId
          },
          analysis: newAnalysis
        });
      });
      
      setResults(diagnosticResults);
      console.log('✅ Diagnostic terminé', diagnosticResults);
      
    } catch (err) {
      console.error('❌ Erreur diagnostic:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fully-migrated': return '#28a745';
      case 'legacy-migrated': return '#fd7e14';
      case 'partially-migrated': return '#ffc107';
      case 'not-migrated': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'fully-migrated': return '✅';
      case 'legacy-migrated': return '🔄';
      case 'partially-migrated': return '⚠️';
      case 'not-migrated': return '❌';
      default: return '❓';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <h2>🔍 Diagnostic de migration des contacts</h2>
          <p>
            Teste la nouvelle logique de détection de migration pour éviter les faux positifs.
          </p>
          
          {currentOrganization?.id && (
            <p><strong>Organisation:</strong> {currentOrganization.name} (ID: {currentOrganization.id})</p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Button 
            onClick={runDiagnostic} 
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
          </Button>
        </div>

        {error && (
          <div style={{ 
            color: '#dc3545', 
            background: '#f8d7da', 
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <strong>Erreur:</strong> {error}
          </div>
        )}

        {results && (
          <div>
            <h3>📋 Résultats du diagnostic ({results.length} contacts)</h3>
            
            {/* Résumé */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px', 
              marginBottom: '30px' 
            }}>
              {['fully-migrated', 'legacy-migrated', 'partially-migrated', 'not-migrated'].map(status => {
                const count = results.filter(r => r.newLogicResult === status).length;
                return (
                  <div key={status} style={{
                    background: '#f8f9fa',
                    border: `2px solid ${getStatusColor(status)}`,
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                      {getStatusIcon(status)}
                    </div>
                    <div style={{ fontWeight: 'bold', color: getStatusColor(status) }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                      {status.replace('-', ' ')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Détail par contact */}
            <div style={{ display: 'grid', gap: '20px' }}>
              {results.map((result, index) => (
                <div key={index} style={{
                  border: `2px solid ${getStatusColor(result.newLogicResult)}`,
                  borderRadius: '8px',
                  padding: '20px',
                  background: '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                        {getStatusIcon(result.newLogicResult)} {result.displayName}
                      </h4>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        ID: {result.contactId}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        background: getStatusColor(result.newLogicResult), 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginBottom: '5px'
                      }}>
                        {result.newLogicResult}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {result.sectionsPresent}/{result.sectionsTotal} sections
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {/* Comparaison logiques */}
                    <div>
                      <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Comparaison des logiques</h5>
                      <div style={{ fontSize: '14px' }}>
                        <div style={{ marginBottom: '5px' }}>
                          <strong>Ancienne logique:</strong> 
                          <span style={{ 
                            color: result.oldLogicResult === 'Déjà migré' ? '#dc3545' : '#28a745',
                            marginLeft: '8px'
                          }}>
                            {result.oldLogicResult}
                          </span>
                        </div>
                        <div>
                          <strong>Nouvelle logique:</strong> 
                          <span style={{ 
                            color: getStatusColor(result.newLogicResult),
                            marginLeft: '8px'
                          }}>
                            {result.newLogicResult}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Champs présents */}
                    <div>
                      <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Champs de détection</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px', fontSize: '12px' }}>
                        {Object.entries(result.fieldsSummary).map(([field, present]) => (
                          <div key={field} style={{ color: present ? '#28a745' : '#6c757d' }}>
                            {present ? '✅' : '❌'} {field}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Données brutes importantes */}
                    <div>
                      <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>Données principales</h5>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {Object.entries(result.rawData)
                          .filter(([_, value]) => value)
                          .map(([key, value]) => (
                            <div key={key} style={{ marginBottom: '2px' }}>
                              <strong>{key}:</strong> {String(value).substring(0, 30)}
                              {String(value).length > 30 && '...'}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>

                  {/* Recommandations */}
                  {result.recommendations.length > 0 && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                      <h6 style={{ margin: '0 0 5px 0', color: '#333' }}>Recommandations</h6>
                      <ul style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                        {result.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', padding: '15px', background: '#e9ecef', borderRadius: '5px' }}>
          <h4>ℹ️ Nouvelle logique de détection</h4>
          <ul style={{ fontSize: '14px', marginBottom: '0' }}>
            <li><strong>fully-migrated:</strong> Marqueur unified-v1 présent</li>
            <li><strong>legacy-migrated:</strong> 6+ sections présentes mais sans marqueur</li>
            <li><strong>partially-migrated:</strong> 3-5 sections présentes</li>
            <li><strong>not-migrated:</strong> Moins de 3 sections présentes</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ContactMigrationDiagnostic;