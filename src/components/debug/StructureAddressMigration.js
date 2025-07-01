import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteField } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './DataStructureFixer.module.css';

const StructureAddressMigration = () => {
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState(null);
  const [fixResults, setFixResults] = useState(null);
  const [error, setError] = useState(null);

  // Scanner les structures pour trouver les adresses imbriquées
  const scanStructures = async () => {
    setScanning(true);
    setError(null);
    setResults(null);
    
    try {
      console.log('🔍 Scan des structures pour adresses imbriquées...');
      const snapshot = await getDocs(collection(db, 'structures'));
      
      const issues = {
        total: 0,
        nestedAddress: []
      };
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        issues.total++;
        
        // Vérifier adresse imbriquée (adresseLieu ou adresse comme objet)
        if ((data.adresseLieu && typeof data.adresseLieu === 'object') ||
            (data.adresse && typeof data.adresse === 'object')) {
          issues.nestedAddress.push({
            id: docSnap.id,
            nom: data.raisonSociale || data.nom || 'Sans nom',
            adresseActuelle: data.adresseLieu || data.adresse,
            data: data
          });
        }
      });
      
      setResults(issues);
      console.log('✅ Scan terminé:', issues);
      
    } catch (err) {
      console.error('❌ Erreur scan:', err);
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  // Corriger les adresses imbriquées
  const fixNestedAddresses = async () => {
    if (!results || results.nestedAddress.length === 0) {
      setError('Aucune adresse imbriquée à corriger');
      return;
    }
    
    setFixing(true);
    setError(null);
    setFixResults(null);
    
    try {
      let fixed = 0;
      let errors = 0;
      const details = [];
      
      for (const item of results.nestedAddress) {
        try {
          const docRef = doc(db, 'structures', item.id);
          const data = item.data;
          
          // Extraire l'adresse de l'objet imbriqué
          const addressObj = data.adresseLieu || data.adresse;
          
          // Préparer les données aplaties
          const updateData = {
            adresse: addressObj.adresse || null,
            suiteAdresse: addressObj.suiteAdresse || null,
            codePostal: addressObj.codePostal || null,
            ville: addressObj.ville || null,
            departement: addressObj.departement || null,
            region: addressObj.region || null,
            pays: addressObj.pays || 'France',
            // Supprimer les champs imbriqués
            adresseLieu: deleteField()
          };
          
          // Si l'adresse était stockée directement comme objet
          if (data.adresse && typeof data.adresse === 'object') {
            updateData.adresse = data.adresse.adresse || null;
            updateData.codePostal = data.adresse.codePostal || null;
            updateData.ville = data.adresse.ville || null;
            updateData.pays = data.adresse.pays || 'France';
          }
          
          await updateDoc(docRef, updateData);
          fixed++;
          
          details.push({
            nom: item.nom,
            id: item.id,
            status: 'success',
            ancienneAdresse: addressObj,
            nouvelleAdresse: `${updateData.adresse || ''}, ${updateData.codePostal || ''} ${updateData.ville || ''}`
          });
          
          console.log(`✅ Adresse aplatie pour ${item.nom} (${item.id})`);
          
        } catch (err) {
          errors++;
          details.push({
            nom: item.nom,
            id: item.id,
            status: 'error',
            error: err.message
          });
          console.error(`❌ Erreur correction adresse ${item.id}:`, err);
        }
      }
      
      setFixResults({ fixed, errors, details });
      console.log(`✅ Migration terminée: ${fixed} adresses corrigées, ${errors} erreurs`);
      
      // Relancer le scan pour vérifier
      setTimeout(() => scanStructures(), 1000);
      
    } catch (err) {
      console.error('❌ Erreur migration adresses:', err);
      setError(err.message);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <h3>🏠 Migration des adresses de structures</h3>
          <p className={styles.description}>
            Cet outil corrige les adresses imbriquées dans les structures pour qu'elles soient correctement affichées dans les pré-contrats
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
            onClick={scanStructures}
            disabled={scanning || fixing}
          >
            {scanning ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Scan en cours...
              </>
            ) : (
              <>
                <i className="bi bi-search me-2"></i>
                Scanner les structures
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className={styles.results}>
            <h4>📊 Résultats du scan</h4>
            
            <div className={styles.collectionResult}>
              <h5 className={styles.collectionName}>
                <i className="bi bi-building me-2"></i>
                Structures
              </h5>
              
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total scanné:</span>
                  <span className={styles.statValue}>{results.total}</span>
                </div>
                
                <div className={`${styles.stat} ${results.nestedAddress.length > 0 ? styles.statWarning : styles.statSuccess}`}>
                  <span className={styles.statLabel}>Adresses imbriquées:</span>
                  <span className={styles.statValue}>{results.nestedAddress.length}</span>
                </div>
              </div>

              {results.nestedAddress.length > 0 && (
                <div className={styles.issuesList}>
                  <h6>Structures avec adresse imbriquée:</h6>
                  <ul>
                    {results.nestedAddress.map(item => (
                      <li key={item.id}>
                        <strong>{item.nom}</strong> <span className={styles.docId}>({item.id})</span>
                        <br />
                        <small className="text-muted">
                          Adresse actuelle: {JSON.stringify(item.adresseActuelle)}
                        </small>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {results.nestedAddress.length > 0 && (
              <div className={styles.fixActions}>
                <Button
                  variant="success"
                  size="lg"
                  onClick={fixNestedAddresses}
                  disabled={fixing}
                  className={styles.mainFixButton}
                >
                  {fixing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Migration en cours...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-magic me-2"></i>
                      Corriger toutes les adresses
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {fixResults && (
          <div className={styles.fixResults}>
            <Alert variant={fixResults.errors === 0 ? "success" : "warning"}>
              <h5>📝 Résultats de la migration</h5>
              <p>
                ✅ {fixResults.fixed} adresses corrigées<br />
                {fixResults.errors > 0 && `❌ ${fixResults.errors} erreurs`}
              </p>
            </Alert>

            {fixResults.details && (
              <div className={styles.detailsList}>
                <h6>Détails des corrections:</h6>
                {fixResults.details.map((detail, index) => (
                  <div key={index} className={styles.detailItem}>
                    {detail.status === 'success' ? (
                      <>
                        <span className="text-success">✅</span> <strong>{detail.nom}</strong>
                        <br />
                        <small>Nouvelle adresse: {detail.nouvelleAdresse}</small>
                      </>
                    ) : (
                      <>
                        <span className="text-danger">❌</span> <strong>{detail.nom}</strong>
                        <br />
                        <small className="text-danger">Erreur: {detail.error}</small>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StructureAddressMigration;