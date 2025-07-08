import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteField } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './DataStructureFixer.module.css';

const DataStructureFixer = () => {
  const { currentEntreprise } = useEntreprise();
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState(null);
  const [fixResults, setFixResults] = useState(null);
  const [error, setError] = useState(null);

  // Scanner les collections pour trouver les structures imbriquées
  const scanCollections = async () => {
    setScanning(true);
    setError(null);
    setResults(null);
    
    try {
      const collections = ['contacts', 'lieux', 'artistes', 'structures'];
      const scanResults = {};
      
      for (const collName of collections) {
        console.log(`🔍 Scan de la collection: ${collName}`);
        const snapshot = await getDocs(collection(db, collName));
        
        const issues = {
          total: 0,
          nested: [],
          missingOrgId: []
        };
        
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          issues.total++;
          
          // Vérifier les structures imbriquées
          if (
            (collName === 'contacts' && data.contact && typeof data.contact === 'object') ||
            (collName === 'lieux' && data.lieu && typeof data.lieu === 'object') ||
            (collName === 'artistes' && data.artiste && typeof data.artiste === 'object') ||
            (collName === 'structures' && data.structure && typeof data.structure === 'object')
          ) {
            issues.nested.push({
              id: docSnap.id,
              nom: data.nom || data[collName]?.nom || 'Sans nom',
              data: data
            });
          }
          
          // Vérifier entrepriseId manquant
          if (!data.entrepriseId) {
            issues.missingOrgId.push({
              id: docSnap.id,
              nom: data.nom || 'Sans nom'
            });
          }
        });
        
        scanResults[collName] = issues;
      }
      
      setResults(scanResults);
      console.log('✅ Scan terminé:', scanResults);
      
    } catch (err) {
      console.error('❌ Erreur scan:', err);
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  // Corriger les structures imbriquées
  const fixNestedStructures = async () => {
    if (!results) return;
    
    setFixing(true);
    setError(null);
    setFixResults(null);
    
    try {
      const fixStats = {};
      
      for (const [collName, issues] of Object.entries(results)) {
        if (issues.nested.length === 0) continue;
        
        console.log(`🔧 Correction de ${collName}...`);
        let fixed = 0;
        let errors = 0;
        
        for (const item of issues.nested) {
          try {
            const docRef = doc(db, collName, item.id);
            const data = item.data;
            let flattenedData = {};
            
            // Extraire les données selon le type
            if (collName === 'contacts' && data.contact) {
              flattenedData = {
                nom: data.contact.nom || '',
                prenom: data.contact.prenom || '',
                fonction: data.contact.fonction || '',
                email: data.contact.email || '',
                telephone: data.contact.telephone || '',
                structureId: data.structureId || '',
                structureNom: data.structureNom || data.structure?.raisonSociale || '',
                entrepriseId: data.entrepriseId || currentEntreprise?.id,
                concertsAssocies: data.concertsAssocies || [],
                createdAt: data.createdAt,
                updatedAt: data.updatedAt || new Date()
              };
              
              // Supprimer les champs imbriqués
              await updateDoc(docRef, {
                ...flattenedData,
                contact: deleteField(),
                structure: deleteField()
              });
              
            } else if (collName === 'lieux' && data.lieu) {
              flattenedData = {
                nom: data.lieu.nom || '',
                type: data.lieu.type || '',
                adresse: data.lieu.adresse || '',
                codePostal: data.lieu.codePostal || '',
                ville: data.lieu.ville || '',
                pays: data.lieu.pays || 'France',
                telephone: data.lieu.telephone || '',
                email: data.lieu.email || '',
                siteWeb: data.lieu.siteWeb || '',
                capacite: data.lieu.capacite || 0,
                equipements: data.lieu.equipements || [],
                entrepriseId: data.entrepriseId || currentEntreprise?.id,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt || new Date()
              };
              
              await updateDoc(docRef, {
                ...flattenedData,
                lieu: deleteField()
              });
              
            } else if (collName === 'artistes' && data.artiste) {
              flattenedData = {
                nom: data.artiste.nom || '',
                style: data.artiste.style || '',
                email: data.artiste.email || '',
                telephone: data.artiste.telephone || '',
                siteWeb: data.artiste.siteWeb || '',
                entrepriseId: data.entrepriseId || currentEntreprise?.id,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt || new Date()
              };
              
              await updateDoc(docRef, {
                ...flattenedData,
                artiste: deleteField()
              });
              
            } else if (collName === 'structures' && data.structure) {
              flattenedData = {
                nom: data.structure.nom || data.structure.raisonSociale || '',
                raisonSociale: data.structure.raisonSociale || '',
                type: data.structure.type || '',
                adresse: data.structure.adresse || '',
                codePostal: data.structure.codePostal || '',
                ville: data.structure.ville || '',
                pays: data.structure.pays || 'France',
                siret: data.structure.siret || '',
                tva: data.structure.tva || '',
                entrepriseId: data.entrepriseId || currentEntreprise?.id,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt || new Date()
              };
              
              await updateDoc(docRef, {
                ...flattenedData,
                structure: deleteField()
              });
            }
            
            fixed++;
            console.log(`✅ ${collName}/${item.id} corrigé`);
            
          } catch (err) {
            errors++;
            console.error(`❌ Erreur ${collName}/${item.id}:`, err);
          }
        }
        
        fixStats[collName] = { fixed, errors };
      }
      
      setFixResults(fixStats);
      console.log('✅ Corrections terminées:', fixStats);
      
      // Relancer le scan pour vérifier
      setTimeout(() => scanCollections(), 1000);
      
    } catch (err) {
      console.error('❌ Erreur correction:', err);
      setError(err.message);
    } finally {
      setFixing(false);
    }
  };

  // Corriger les adresses imbriquées dans les structures
  const fixNestedAddresses = async () => {
    if (!results) return;
    
    setFixing(true);
    setError(null);
    
    try {
      const structuresIssues = results.structures;
      if (!structuresIssues || structuresIssues.nestedAddress.length === 0) {
        setError('Aucune adresse imbriquée à corriger');
        return;
      }
      
      let fixed = 0;
      let errors = 0;
      
      for (const item of structuresIssues.nestedAddress) {
        try {
          const docRef = doc(db, 'structures', item.id);
          const data = item.data;
          
          // Extraire l'adresse de l'objet imbriqué
          const addressObj = data.adresseLieu || data.adresse;
          
          // Préparer les données aplaties
          const updateData = {
            adresse: addressObj.adresse || null,
            codePostal: addressObj.codePostal || null,
            ville: addressObj.ville || null,
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
          console.log(`✅ Adresse aplatie pour ${item.nom} (${item.id})`);
          
        } catch (err) {
          errors++;
          console.error(`❌ Erreur correction adresse ${item.id}:`, err);
        }
      }
      
      setFixResults({ addressesFixes: { fixed, errors } });
      console.log(`✅ Migration terminée: ${fixed} adresses corrigées, ${errors} erreurs`);
      
      // Relancer le scan pour vérifier
      setTimeout(() => scanCollections(), 1000);
      
    } catch (err) {
      console.error('❌ Erreur migration adresses:', err);
      setError(err.message);
    } finally {
      setFixing(false);
    }
  };

  // Corriger les entrepriseId manquants
  const fixMissingOrgIds = async () => {
    if (!results || !currentEntreprise?.id) {
      setError('Aucune organisation sélectionnée');
      return;
    }
    
    setFixing(true);
    setError(null);
    
    try {
      const fixStats = {};
      
      for (const [collName, issues] of Object.entries(results)) {
        if (issues.missingOrgId.length === 0) continue;
        
        let fixed = 0;
        
        for (const item of issues.missingOrgId) {
          try {
            const docRef = doc(db, collName, item.id);
            await updateDoc(docRef, {
              entrepriseId: currentEntreprise.id
            });
            fixed++;
          } catch (err) {
            console.error(`Erreur fix orgId ${collName}/${item.id}:`, err);
          }
        }
        
        fixStats[collName] = fixed;
      }
      
      setFixResults({ orgIds: fixStats });
      setTimeout(() => scanCollections(), 1000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <h3>🔧 Outil de correction des données</h3>
          <p className={styles.description}>
            Cet outil permet de détecter et corriger les problèmes de structure de données
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
            onClick={scanCollections}
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
                Scanner les collections
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className={styles.results}>
            <h4>📊 Résultats du scan</h4>
            
            {Object.entries(results).map(([collName, issues]) => (
              <div key={collName} className={styles.collectionResult}>
                <h5 className={styles.collectionName}>
                  <i className="bi bi-folder me-2"></i>
                  {collName}
                </h5>
                
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Total:</span>
                    <span className={styles.statValue}>{issues.total}</span>
                  </div>
                  
                  <div className={`${styles.stat} ${issues.nested.length > 0 ? styles.statDanger : styles.statSuccess}`}>
                    <span className={styles.statLabel}>Structures imbriquées:</span>
                    <span className={styles.statValue}>{issues.nested.length}</span>
                  </div>
                  
                  <div className={`${styles.stat} ${issues.missingOrgId.length > 0 ? styles.statWarning : styles.statSuccess}`}>
                    <span className={styles.statLabel}>Sans entrepriseId:</span>
                    <span className={styles.statValue}>{issues.missingOrgId.length}</span>
                  </div>
                  
                  {collName === 'structures' && issues.nestedAddress && (
                    <div className={`${styles.stat} ${issues.nestedAddress.length > 0 ? styles.statWarning : styles.statSuccess}`}>
                      <span className={styles.statLabel}>Adresses imbriquées:</span>
                      <span className={styles.statValue}>{issues.nestedAddress.length}</span>
                    </div>
                  )}
                </div>

                {issues.nested.length > 0 && (
                  <div className={styles.issuesList}>
                    <h6>Documents avec structure imbriquée:</h6>
                    <ul>
                      {issues.nested.slice(0, 5).map(item => (
                        <li key={item.id}>
                          {item.nom} <span className={styles.docId}>({item.id})</span>
                        </li>
                      ))}
                      {issues.nested.length > 5 && (
                        <li className={styles.more}>... et {issues.nested.length - 5} autres</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {collName === 'structures' && issues.nestedAddress?.length > 0 && (
                  <div className={styles.issuesList}>
                    <h6>Structures avec adresse imbriquée:</h6>
                    <ul>
                      {issues.nestedAddress.slice(0, 5).map(item => (
                        <li key={item.id}>
                          {item.nom} <span className={styles.docId}>({item.id})</span>
                        </li>
                      ))}
                      {issues.nestedAddress.length > 5 && (
                        <li className={styles.more}>... et {issues.nestedAddress.length - 5} autres</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            <div className={styles.fixActions}>
              {/* Bouton principal pour tout corriger */}
              {(Object.values(results).some(r => r.nested.length > 0) || 
                Object.values(results).some(r => r.missingOrgId.length > 0)) && (
                <Button
                  variant="danger"
                  size="lg"
                  onClick={async () => {
                    if (Object.values(results).some(r => r.nested.length > 0)) {
                      await fixNestedStructures();
                    }
                    if (Object.values(results).some(r => r.missingOrgId.length > 0) && currentEntreprise?.id) {
                      await fixMissingOrgIds();
                    }
                  }}
                  disabled={fixing}
                  className={styles.mainFixButton}
                >
                  {fixing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Correction en cours...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-magic me-2"></i>
                      Corriger TOUS les problèmes
                    </>
                  )}
                </Button>
              )}
              
              <div className={styles.secondaryActions}>
                {Object.values(results).some(r => r.nested.length > 0) && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={fixNestedStructures}
                    disabled={fixing}
                  >
                    <i className="bi bi-wrench me-2"></i>
                    Structures imbriquées seulement
                  </Button>
                )}
                
                {Object.values(results).some(r => r.missingOrgId.length > 0) && (
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={fixMissingOrgIds}
                    disabled={fixing || !currentEntreprise?.id}
                  >
                    <i className="bi bi-building me-2"></i>
                    EntrepriseId seulement
                  </Button>
                )}
                
                {results.structures?.nestedAddress?.length > 0 && (
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={fixNestedAddresses}
                    disabled={fixing}
                  >
                    <i className="bi bi-geo-alt me-2"></i>
                    Aplatir adresses seulement
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {fixResults && (
          <Alert variant="success" className={styles.fixResults}>
            <h5>✅ Corrections effectuées</h5>
            {fixResults.orgIds ? (
              <ul>
                {Object.entries(fixResults.orgIds).map(([coll, count]) => (
                  <li key={coll}>{coll}: {count} entrepriseId ajoutés</li>
                ))}
              </ul>
            ) : (
              <ul>
                {Object.entries(fixResults).map(([coll, stats]) => (
                  <li key={coll}>
                    {coll}: {stats.fixed} corrigés, {stats.errors} erreurs
                  </li>
                ))}
              </ul>
            )}
          </Alert>
        )}
      </Card>
    </div>
  );
};

export default DataStructureFixer;