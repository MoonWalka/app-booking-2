/**
 * Composant de debug pour diagnostiquer les organizationId manquants
 * Intégré dans l'application pour vérifier pourquoi contacts et lieux ne s'affichent pas
 */
import React, { useState, useEffect } from 'react';
import { collection, getDocs, db, updateDoc, doc } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './OrganizationIdDebug.module.css';

const OrganizationIdDebug = () => {
  const { currentOrganization } = useOrganization();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState(null);

  const collections = ['contacts', 'lieux', 'concerts', 'structures'];

  const checkOrganizationIds = async () => {
    setLoading(true);
    const checkResults = {};

    for (const collectionName of collections) {
      try {
        console.log(`🔍 Vérification de ${collectionName}...`);
        
        // Récupérer TOUS les documents de la collection
        const allSnapshot = await getDocs(collection(db, collectionName));
        const totalDocs = allSnapshot.docs.length;
        
        let withOrgId = 0;
        let withoutOrgId = 0;
        const samplesWithout = [];
        const samplesWithOrgId = [];
        const orgIds = new Set();

        allSnapshot.docs.forEach(docSnapshot => {
          const data = docSnapshot.data();
          
          if (data.organizationId) {
            withOrgId++;
            orgIds.add(data.organizationId);
            if (samplesWithOrgId.length < 3) {
              samplesWithOrgId.push({
                id: docSnapshot.id,
                name: data.nom || data.titre || data.raisonSociale || 'Sans nom',
                organizationId: data.organizationId
              });
            }
          } else {
            withoutOrgId++;
            if (samplesWithout.length < 5) {
              samplesWithout.push({
                id: docSnapshot.id,
                name: data.nom || data.titre || data.raisonSociale || 'Sans nom',
                createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Date inconnue'
              });
            }
          }
        });

        checkResults[collectionName] = {
          total: totalDocs,
          withOrgId,
          withoutOrgId,
          orgIds: Array.from(orgIds),
          samplesWithout,
          samplesWithOrgId,
          status: withoutOrgId > 0 ? 'NEEDS_FIX' : 'OK'
        };

        console.log(`📊 ${collectionName}: ${totalDocs} total, ${withOrgId} avec orgId, ${withoutOrgId} sans orgId`);
        
      } catch (error) {
        console.error(`❌ Erreur ${collectionName}:`, error);
        checkResults[collectionName] = {
          error: error.message,
          status: 'ERROR'
        };
      }
    }

    setResults(checkResults);
    setLoading(false);
  };

  const fixMissingOrganizationIds = async () => {
    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée !');
      return;
    }

    setFixing(true);
    const fixes = {};

    for (const collectionName of collections) {
      const collectionResult = results[collectionName];
      if (!collectionResult || collectionResult.withoutOrgId === 0) continue;

      try {
        console.log(`🔧 Correction de ${collectionName}...`);
        
        // Récupérer tous les documents sans organizationId
        const allSnapshot = await getDocs(collection(db, collectionName));
        const docsToFix = [];

        allSnapshot.docs.forEach(docSnapshot => {
          const data = docSnapshot.data();
          if (!data.organizationId) {
            docsToFix.push(docSnapshot.id);
          }
        });

        // Corriger chaque document
        const fixPromises = docsToFix.map(async (docId) => {
          try {
            await updateDoc(doc(db, collectionName, docId), {
              organizationId: currentOrganization.id
            });
            return { id: docId, success: true };
          } catch (error) {
            console.error(`Erreur correction ${docId}:`, error);
            return { id: docId, success: false, error: error.message };
          }
        });

        const fixResults = await Promise.all(fixPromises);
        const successCount = fixResults.filter(r => r.success).length;
        const errorCount = fixResults.filter(r => !r.success).length;

        fixes[collectionName] = {
          total: docsToFix.length,
          success: successCount,
          errors: errorCount
        };

        console.log(`✅ ${collectionName}: ${successCount} corrigés, ${errorCount} erreurs`);

      } catch (error) {
        console.error(`❌ Erreur correction ${collectionName}:`, error);
        fixes[collectionName] = {
          error: error.message
        };
      }
    }

    setFixResults(fixes);
    setFixing(false);
    
    // Refaire la vérification après correction
    setTimeout(checkOrganizationIds, 1000);
  };

  useEffect(() => {
    if (currentOrganization?.id) {
      checkOrganizationIds();
    }
  }, [currentOrganization]);

  if (!currentOrganization?.id) {
    return (
      <Card title="Debug OrganizationId">
        <Alert variant="warning">
          Aucune organisation sélectionnée. Impossible de faire le diagnostic.
        </Alert>
      </Card>
    );
  }

  return (
    <div className={styles.debugContainer}>
      <Card 
        title="🔍 Diagnostic OrganizationId" 
        className={styles.debugCard}
      >
        <div className={styles.organizationInfo}>
          <strong>Organisation courante :</strong> {currentOrganization.nom} ({currentOrganization.id})
        </div>

        <div className={styles.actions}>
          <Button 
            onClick={checkOrganizationIds}
            disabled={loading}
            className={styles.checkButton}
          >
            {loading ? 'Vérification...' : '🔍 Vérifier les OrganizationId'}
          </Button>

          {Object.keys(results).length > 0 && (
            <Button 
              onClick={fixMissingOrganizationIds}
              disabled={fixing}
              variant="primary"
              className={styles.fixButton}
            >
              {fixing ? 'Correction...' : '🔧 Corriger les OrganizationId manquants'}
            </Button>
          )}
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className="spinner-border spinner-border-sm" />
            <span>Analyse en cours...</span>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className={styles.results}>
            <h4>📊 Résultats de l'analyse</h4>
            
            {collections.map(collectionName => {
              const result = results[collectionName];
              if (!result) return null;

              return (
                <div key={collectionName} className={styles.collectionResult}>
                  <h5>
                    📂 {collectionName.toUpperCase()}
                    <span className={`${styles.status} ${styles[result.status?.toLowerCase() || 'unknown']}`}>
                      {result.status}
                    </span>
                  </h5>

                  {result.error ? (
                    <Alert variant="danger">Erreur : {result.error}</Alert>
                  ) : (
                    <div className={styles.collectionStats}>
                      <div className={styles.statRow}>
                        <span>📊 Total documents :</span>
                        <span>{result.total}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>✅ Avec organizationId :</span>
                        <span>{result.withOrgId}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span>❌ Sans organizationId :</span>
                        <span>{result.withoutOrgId}</span>
                      </div>
                      
                      {result.orgIds.length > 0 && (
                        <div className={styles.statRow}>
                          <span>🏢 OrganizationIds trouvés :</span>
                          <span>{result.orgIds.join(', ')}</span>
                        </div>
                      )}

                      {result.samplesWithout.length > 0 && (
                        <div className={styles.samples}>
                          <strong>Échantillons sans organizationId :</strong>
                          <ul>
                            {result.samplesWithout.map(sample => (
                              <li key={sample.id}>
                                {sample.name} (ID: {sample.id}, créé: {sample.createdAt})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.samplesWithOrgId.length > 0 && (
                        <div className={styles.samples}>
                          <strong>Échantillons avec organizationId :</strong>
                          <ul>
                            {result.samplesWithOrgId.map(sample => (
                              <li key={sample.id}>
                                {sample.name} (orgId: {sample.organizationId})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {fixResults && (
          <div className={styles.fixResults}>
            <h4>🔧 Résultats de la correction</h4>
            {Object.entries(fixResults).map(([collection, result]) => (
              <div key={collection} className={styles.fixResult}>
                <strong>{collection} :</strong>
                {result.error ? (
                  <span className={styles.error}> Erreur - {result.error}</span>
                ) : (
                  <span className={styles.success}>
                    {result.success} corrigés / {result.total} total
                    {result.errors > 0 && <span className={styles.error}> ({result.errors} erreurs)</span>}
                  </span>
                )}
              </div>
            ))}
            
            <Alert variant="success" className={styles.successMessage}>
              ✅ Correction terminée ! Rafraîchissez la page pour voir les contacts et lieux.
            </Alert>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrganizationIdDebug; 