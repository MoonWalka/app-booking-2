import React, { useState } from 'react';
import { collection, getDocs, query, where } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './DataStructureFixer.module.css';

const ListDebugger = () => {
  const { currentEntreprise } = useEntreprise();
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Scanner pourquoi les listes ne s'affichent pas
  const debugLists = async () => {
    setScanning(true);
    setError(null);
    setResults(null);
    
    try {
      const collections = ['contacts', 'lieux', 'concerts', 'structures'];
      const debugResults = {};
      
      for (const collName of collections) {
        console.log(`🔍 Debug de la collection: ${collName}`);
        
        // 1. Compter TOUS les documents
        const allDocsSnapshot = await getDocs(collection(db, collName));
        
        // 2. Compter les documents avec entrepriseId correct
        let orgDocsCount = 0;
        if (currentEntreprise?.id) {
          const orgQuery = query(
            collection(db, collName),
            where('entrepriseId', '==', currentEntreprise.id)
          );
          const orgSnapshot = await getDocs(orgQuery);
          orgDocsCount = orgSnapshot.size;
        }
        
        // 3. Analyser la structure des documents
        const structures = {
          total: allDocsSnapshot.size,
          withOrgId: orgDocsCount,
          nested: 0,
          flat: 0,
          missingOrgId: 0,
          wrongOrgId: 0,
          samples: []
        };
        
        allDocsSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          
          // Vérifier structure imbriquée
          const nestedField = collName.slice(0, -1); // contacts -> contact
          if (data[nestedField] && typeof data[nestedField] === 'object') {
            structures.nested++;
            
            // Prendre un échantillon
            if (structures.samples.length < 3) {
              structures.samples.push({
                id: docSnap.id,
                type: 'nested',
                topLevel: Object.keys(data).filter(k => k !== nestedField),
                nestedKeys: Object.keys(data[nestedField]),
                entrepriseId: data.entrepriseId
              });
            }
          } else {
            structures.flat++;
          }
          
          // Vérifier entrepriseId
          if (!data.entrepriseId) {
            structures.missingOrgId++;
          } else if (currentEntreprise?.id && data.entrepriseId !== currentEntreprise.id) {
            structures.wrongOrgId++;
          }
        });
        
        debugResults[collName] = structures;
      }
      
      setResults(debugResults);
      console.log('✅ Debug terminé:', debugResults);
      
    } catch (err) {
      console.error('❌ Erreur debug:', err);
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  // Générer un rapport de diagnostic
  const generateReport = () => {
    if (!results) return null;
    
    const report = [];
    
    Object.entries(results).forEach(([collName, data]) => {
      const status = data.withOrgId > 0 ? '✅' : '❌';
      const nestedWarning = data.nested > 0 ? '⚠️' : '✅';
      
      report.push({
        collection: collName,
        status,
        visible: data.withOrgId,
        total: data.total,
        nested: data.nested,
        flat: data.flat,
        missingOrgId: data.missingOrgId,
        wrongOrgId: data.wrongOrgId,
        nestedWarning
      });
    });
    
    return report;
  };

  const report = generateReport();

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <h3>🔍 Diagnostic des listes</h3>
          <p className={styles.description}>
            Analyser pourquoi certaines listes ne s'affichent pas
          </p>
        </div>

        {error && (
          <Alert variant="danger" className={styles.alert}>
            {error}
          </Alert>
        )}

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={debugLists}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Analyse en cours...
              </>
            ) : (
              <>
                <i className="bi bi-bug me-2"></i>
                Lancer le diagnostic
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className={styles.results}>
            <h4>📊 Rapport de diagnostic</h4>
            
            {!currentEntreprise?.id && (
              <Alert variant="warning">
                ⚠️ Aucune organisation sélectionnée - Les filtres ne peuvent pas fonctionner
              </Alert>
            )}
            
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>État</th>
                  <th>Visibles</th>
                  <th>Total</th>
                  <th>Imbriqués</th>
                  <th>Sans Org</th>
                  <th>Mauvaise Org</th>
                </tr>
              </thead>
              <tbody>
                {report.map(row => (
                  <tr key={row.collection} className={row.visible === 0 ? styles.problemRow : ''}>
                    <td>
                      <strong>{row.collection}</strong>
                    </td>
                    <td className={styles.statusCell}>
                      {row.status}
                    </td>
                    <td className={row.visible === 0 ? styles.errorText : styles.successText}>
                      {row.visible}
                    </td>
                    <td>{row.total}</td>
                    <td className={row.nested > 0 ? styles.warningText : ''}>
                      {row.nestedWarning} {row.nested}
                    </td>
                    <td className={row.missingOrgId > 0 ? styles.warningText : ''}>
                      {row.missingOrgId}
                    </td>
                    <td className={row.wrongOrgId > 0 ? styles.warningText : ''}>
                      {row.wrongOrgId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Diagnostic détaillé */}
            {Object.entries(results).map(([collName, data]) => (
              <div key={collName} className={styles.collectionDetail}>
                <h5>{collName}</h5>
                
                {data.withOrgId === 0 && data.total > 0 && (
                  <Alert variant="danger">
                    <strong>Problème identifié :</strong>
                    <ul>
                      {data.nested > 0 && (
                        <li>{data.nested} documents ont une structure imbriquée</li>
                      )}
                      {data.missingOrgId > 0 && (
                        <li>{data.missingOrgId} documents n'ont pas d'entrepriseId</li>
                      )}
                      {data.wrongOrgId > 0 && (
                        <li>{data.wrongOrgId} documents appartiennent à une autre organisation</li>
                      )}
                    </ul>
                    <strong>Solution :</strong> Utilisez l'outil "Structure des données" pour corriger
                  </Alert>
                )}
                
                {data.samples.length > 0 && (
                  <details className={styles.samples}>
                    <summary>Voir des exemples de structures imbriquées</summary>
                    <pre>{JSON.stringify(data.samples, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}

            {/* Résumé et recommandations */}
            <div className={styles.summary}>
              <h4>💡 Recommandations</h4>
              {report.some(r => r.nested > 0) && (
                <Alert variant="warning">
                  <strong>Structures imbriquées détectées !</strong>
                  <p>Certains documents ont une structure imbriquée qui empêche leur affichage.</p>
                  <p>→ Utilisez l'outil "Structure des données" pour les corriger automatiquement.</p>
                </Alert>
              )}
              
              {report.some(r => r.missingOrgId > 0) && (
                <Alert variant="warning">
                  <strong>EntrepriseId manquants !</strong>
                  <p>Certains documents n'ont pas d'entrepriseId.</p>
                  <p>→ Utilisez l'outil "Structure des données" pour les ajouter.</p>
                </Alert>
              )}
              
              {report.every(r => r.visible > 0) && (
                <Alert variant="success">
                  <strong>Tout semble correct !</strong>
                  <p>Les données sont bien structurées et devraient s'afficher.</p>
                </Alert>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ListDebugger;