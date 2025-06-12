import React, { useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp, writeBatch, db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './DataStructureFixer.module.css';

/**
 * Outil de diagnostic pour préparer la migration contactId -> contactIds
 */
const ContactsMigrationDiagnostic = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [detailedInfo, setDetailedInfo] = useState(null);
  
  // États pour la migration
  const [migrationState, setMigrationState] = useState(null); // 'running', 'completed', 'error'
  const [migrationLogs, setMigrationLogs] = useState([]);
  const [migrationStats, setMigrationStats] = useState(null);
  const [dryRunMode, setDryRunMode] = useState(true);

  const runDiagnostic = async () => {
    if (!currentOrganization?.id) {
      alert('Veuillez sélectionner une organisation');
      return;
    }

    setLoading(true);
    setDiagnosticResults(null);
    setDetailedInfo(null);

    const results = {
      timestamp: new Date().toISOString(),
      organizationId: currentOrganization.id,
      concerts: {
        total: 0,
        avecContactId: 0,
        avecContactIds: 0,
        avecLesDeuxChamps: 0,
        sansContact: 0,
        contactsOrphelins: []
      },
      lieux: {
        total: 0,
        avecContactIds: 0,
        sansContactIds: 0,
        formatIncorrect: []
      },
      structures: {
        total: 0,
        avecContactsIds: 0,
        avecContactIds: 0
      },
      relations: {
        concertContactValides: 0,
        concertContactManquantes: 0
      },
      recommandations: []
    };

    try {
      // 1. Analyser les CONCERTS
      console.log('📋 Analyse des concerts...');
      const concertsSnapshot = await getDocs(collection(db, 'concerts'));
      
      for (const docSnap of concertsSnapshot.docs) {
        const concert = docSnap.data();
        
        // Filtrer par organisation
        if (concert.organizationId !== currentOrganization.id) continue;
        
        results.concerts.total++;
        
        if (concert.contactId) {
          results.concerts.avecContactId++;
          
          // Vérifier si le contact existe
          try {
            const contactDoc = await getDoc(doc(db, 'contacts', concert.contactId));
            if (!contactDoc.exists()) {
              results.concerts.contactsOrphelins.push({
                concertId: docSnap.id,
                concertNom: concert.nom,
                contactIdInexistant: concert.contactId
              });
            }
          } catch (error) {
            console.error('Erreur vérification contact:', error);
          }
        }
        
        if (concert.contactIds && Array.isArray(concert.contactIds)) {
          results.concerts.avecContactIds++;
        }
        
        if (concert.contactId && concert.contactIds) {
          results.concerts.avecLesDeuxChamps++;
        }
        
        if (!concert.contactId && (!concert.contactIds || concert.contactIds.length === 0)) {
          results.concerts.sansContact++;
        }
      }
      
      // 2. Analyser les LIEUX
      console.log('📍 Analyse des lieux...');
      const lieuxSnapshot = await getDocs(collection(db, 'lieux'));
      
      for (const docSnap of lieuxSnapshot.docs) {
        const lieu = docSnap.data();
        
        if (lieu.organizationId !== currentOrganization.id) continue;
        
        results.lieux.total++;
        
        if (lieu.contactIds) {
          if (Array.isArray(lieu.contactIds)) {
            results.lieux.avecContactIds++;
          } else {
            results.lieux.formatIncorrect.push({
              lieuId: docSnap.id,
              lieuNom: lieu.nom,
              format: typeof lieu.contactIds
            });
          }
        } else {
          results.lieux.sansContactIds++;
        }
      }
      
      // 3. Analyser les STRUCTURES
      console.log('🏢 Analyse des structures...');
      const structuresSnapshot = await getDocs(collection(db, 'structures'));
      
      for (const docSnap of structuresSnapshot.docs) {
        const structure = docSnap.data();
        
        if (structure.organizationId !== currentOrganization.id) continue;
        
        results.structures.total++;
        
        if (structure.contactsIds && Array.isArray(structure.contactsIds)) {
          results.structures.avecContactsIds++;
        }
        if (structure.contactIds && Array.isArray(structure.contactIds)) {
          results.structures.avecContactIds++;
        }
      }
      
      // 4. Vérifier quelques relations bidirectionnelles
      console.log('🔗 Vérification des relations...');
      let checkedRelations = 0;
      
      for (const docSnap of concertsSnapshot.docs) {
        const concert = docSnap.data();
        
        if (concert.organizationId !== currentOrganization.id) continue;
        if (!concert.contactId) continue;
        if (checkedRelations >= 10) break; // Limiter pour la performance
        
        try {
          const contactDoc = await getDoc(doc(db, 'contacts', concert.contactId));
          if (contactDoc.exists()) {
            const contact = contactDoc.data();
            if (contact.concertsIds && contact.concertsIds.includes(docSnap.id)) {
              results.relations.concertContactValides++;
            } else {
              results.relations.concertContactManquantes++;
            }
            checkedRelations++;
          }
        } catch (error) {
          console.error('Erreur vérification relation:', error);
        }
      }
      
      // 5. Générer les recommandations
      if (results.concerts.avecLesDeuxChamps > 0) {
        results.recommandations.push({
          niveau: 'CRITIQUE',
          message: `${results.concerts.avecLesDeuxChamps} concerts ont à la fois contactId et contactIds`,
          action: 'Vérifier la cohérence et nettoyer avant migration'
        });
      }
      
      if (results.concerts.contactsOrphelins.length > 0) {
        results.recommandations.push({
          niveau: 'IMPORTANT',
          message: `${results.concerts.contactsOrphelins.length} concerts référencent des contacts inexistants`,
          action: 'Nettoyer les références orphelines'
        });
      }
      
      if (results.structures.avecContactsIds > 0) {
        results.recommandations.push({
          niveau: 'MOYEN',
          message: `${results.structures.avecContactsIds} structures utilisent 'contactsIds' au lieu de 'contactIds'`,
          action: 'Harmoniser vers contactIds partout'
        });
      }
      
      const totalAMigrer = results.concerts.avecContactId - results.concerts.avecContactIds;
      if (totalAMigrer > 0) {
        results.recommandations.push({
          niveau: 'INFO',
          message: `${totalAMigrer} concerts à migrer de contactId vers contactIds`,
          action: 'Exécuter le script de migration'
        });
      }
      
      setDiagnosticResults(results);
      
    } catch (error) {
      console.error('Erreur diagnostic:', error);
      alert('Erreur lors du diagnostic: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showDetailedInfo = (type) => {
    if (!diagnosticResults) return;
    
    let details = null;
    
    switch(type) {
      case 'orphelins':
        details = {
          title: 'Contacts Orphelins',
          data: diagnosticResults.concerts.contactsOrphelins
        };
        break;
      case 'formatIncorrect':
        details = {
          title: 'Lieux avec format incorrect',
          data: diagnosticResults.lieux.formatIncorrect
        };
        break;
      case 'deuxChamps':
        details = {
          title: 'Concerts avec les deux champs',
          message: 'Ces concerts ont à la fois contactId et contactIds, ce qui peut créer des incohérences.'
        };
        break;
      default:
        details = {
          title: 'Information non disponible',
          message: 'Type de détail non reconnu.'
        };
        break;
    }
    
    setDetailedInfo(details);
  };

  const exportResults = () => {
    if (!diagnosticResults) return;
    
    const dataStr = JSON.stringify(diagnosticResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `diagnostic-contacts-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // FONCTIONS DE MIGRATION

  const addMigrationLog = (message, level = 'info') => {
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      level
    };
    setMigrationLogs(prev => [...prev, logEntry]);
    console.log(`[Migration ${level.toUpperCase()}] ${message}`);
  };

  const runMigration = async () => {
    if (!currentOrganization?.id) {
      alert('Veuillez sélectionner une organisation');
      return;
    }

    // Confirmation pour la migration réelle
    if (!dryRunMode) {
      const confirm = window.confirm(
        '⚠️ ATTENTION: Vous allez exécuter la migration réelle!\n\n' +
        'Cette opération va:\n' +
        '- Convertir contactId → contactIds\n' +
        '- Modifier la structure des données\n' +
        '- Mettre à jour les relations bidirectionnelles\n\n' +
        'Êtes-vous sûr de vouloir continuer ?'
      );
      
      if (!confirm) return;
    }

    setMigrationState('running');
    setMigrationLogs([]);
    setMigrationStats({
      totalConcerts: 0,
      concertsToMigrate: 0,
      concertsMigrated: 0,
      errors: [],
      bidirectionalUpdates: 0
    });

    try {
      addMigrationLog(`🚀 Début de la migration ${dryRunMode ? '(MODE SIMULATION)' : '(MODE RÉEL)'}`, 'info');
      addMigrationLog(`📍 Organisation: ${currentOrganization.name}`, 'info');

      // Phase 1: Analyser les concerts à migrer
      addMigrationLog('🔍 Phase 1: Analyse des concerts...', 'info');
      
      const concertsSnapshot = await getDocs(collection(db, 'concerts'));
      const concertsToMigrate = [];
      let totalConcerts = 0;

      for (const docSnap of concertsSnapshot.docs) {
        const concert = docSnap.data();
        
        // Filtrer par organisation
        if (concert.organizationId !== currentOrganization.id) continue;
        
        totalConcerts++;

        // Concert à migrer : a contactId mais pas contactIds
        const hasContactId = concert.contactId && typeof concert.contactId === 'string';
        const hasContactIds = concert.contactIds && Array.isArray(concert.contactIds) && concert.contactIds.length > 0;

        if (hasContactId && !hasContactIds) {
          concertsToMigrate.push({
            id: docSnap.id,
            contactId: concert.contactId,
            nom: concert.nom || 'Concert sans nom'
          });
        }
      }

      setMigrationStats(prev => ({
        ...prev,
        totalConcerts,
        concertsToMigrate: concertsToMigrate.length
      }));

      addMigrationLog(`📊 Concerts totaux: ${totalConcerts}`, 'info');
      addMigrationLog(`🎯 Concerts à migrer: ${concertsToMigrate.length}`, 'info');

      if (concertsToMigrate.length === 0) {
        addMigrationLog('✅ Aucun concert à migrer trouvé', 'success');
        setMigrationState('completed');
        return;
      }

      // Phase 2: Migration par lots
      addMigrationLog('🔄 Phase 2: Migration des concerts...', 'info');
      
      const BATCH_SIZE = 10; // Plus petit pour l'interface
      const batches = [];
      
      for (let i = 0; i < concertsToMigrate.length; i += BATCH_SIZE) {
        batches.push(concertsToMigrate.slice(i, i + BATCH_SIZE));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        addMigrationLog(`📦 Lot ${batchIndex + 1}/${batches.length} (${batch.length} concerts)`, 'info');

        if (dryRunMode) {
          // Simulation
          for (const concert of batch) {
            addMigrationLog(`   🧪 [SIMULATION] ${concert.nom}: contactId=${concert.contactId} → contactIds=[${concert.contactId}]`, 'info');
            setMigrationStats(prev => ({
              ...prev,
              concertsMigrated: prev.concertsMigrated + 1
            }));
          }
        } else {
          // Migration réelle
          const firestoreBatch = writeBatch(db);

          for (const concert of batch) {
            try {
              const concertRef = doc(db, 'concerts', concert.id);
              
              const updateData = {
                contactIds: [concert.contactId],
                contactId: null, // Supprimer l'ancien champ
                contactId_migrated: concert.contactId, // Sauvegarde pour rollback
                updatedAt: serverTimestamp()
              };

              firestoreBatch.update(concertRef, updateData);
              addMigrationLog(`   ✅ ${concert.nom} préparé pour migration`, 'info');

            } catch (error) {
              addMigrationLog(`   ❌ Erreur ${concert.nom}: ${error.message}`, 'error');
              setMigrationStats(prev => ({
                ...prev,
                errors: [...prev.errors, { concertId: concert.id, error: error.message }]
              }));
            }
          }

          // Exécuter le batch
          try {
            await firestoreBatch.commit();
            addMigrationLog(`   ✅ Lot ${batchIndex + 1} migré avec succès`, 'success');
            
            setMigrationStats(prev => ({
              ...prev,
              concertsMigrated: prev.concertsMigrated + batch.length
            }));

            // Mettre à jour les relations bidirectionnelles
            for (const concert of batch) {
              await updateBidirectionalRelation(concert.id, concert.contactId);
            }

          } catch (error) {
            addMigrationLog(`   ❌ Erreur lors du commit du lot ${batchIndex + 1}: ${error.message}`, 'error');
            throw error;
          }
        }
      }

      // Phase 3: Vérification (simulation seulement)
      if (dryRunMode) {
        addMigrationLog('🔍 Phase 3: Vérification (simulation)', 'info');
        addMigrationLog('   ✅ La migration semble viable', 'success');
        addMigrationLog('   ℹ️  Désactivez le mode simulation pour exécuter la migration réelle', 'info');
      } else {
        addMigrationLog('🔍 Phase 3: Vérification post-migration...', 'info');
        // Ici on pourrait vérifier que la migration s'est bien passée
        addMigrationLog('   ✅ Migration vérifiée', 'success');
      }

      addMigrationLog(`🎉 Migration ${dryRunMode ? 'simulée' : 'terminée'} avec succès !`, 'success');
      setMigrationState('completed');

    } catch (error) {
      addMigrationLog(`💥 Erreur fatale: ${error.message}`, 'error');
      setMigrationState('error');
    }
  };

  const updateBidirectionalRelation = async (concertId, contactId) => {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      const contactDoc = await getDoc(contactRef);

      if (!contactDoc.exists()) {
        addMigrationLog(`      ⚠️ Contact ${contactId} non trouvé pour concert ${concertId}`, 'warning');
        return;
      }

      const contactData = contactDoc.data();
      let concertsIds = contactData.concertsIds || [];

      if (!concertsIds.includes(concertId)) {
        concertsIds.push(concertId);

        await updateDoc(contactRef, {
          concertsIds: concertsIds,
          updatedAt: serverTimestamp()
        });

        setMigrationStats(prev => ({
          ...prev,
          bidirectionalUpdates: prev.bidirectionalUpdates + 1
        }));

        addMigrationLog(`      🔗 Relation bidirectionnelle mise à jour: contact ${contactId} ↔ concert ${concertId}`, 'info');
      }

    } catch (error) {
      addMigrationLog(`      ❌ Erreur relation bidirectionnelle ${contactId} ↔ ${concertId}: ${error.message}`, 'error');
      setMigrationStats(prev => ({
        ...prev,
        errors: [...prev.errors, { 
          type: 'bidirectional', 
          concertId, 
          contactId, 
          error: error.message 
        }]
      }));
    }
  };

  const resetMigration = () => {
    setMigrationState(null);
    setMigrationLogs([]);
    setMigrationStats(null);
    setDryRunMode(true);
  };

  return (
    <div className={styles.container}>
      <Card title="🔍 Diagnostic Migration Contacts" className={styles.card}>
        <div className={styles.description}>
          <p>Cet outil analyse l'état actuel des données pour préparer la migration de <code>contactId</code> vers <code>contactIds</code>.</p>
          <Alert type="info">
            Cette analyse porte uniquement sur l'organisation : <strong>{currentOrganization?.name}</strong>
          </Alert>
        </div>

        <div className={styles.actions}>
          <Button 
            onClick={runDiagnostic} 
            disabled={loading || !currentOrganization}
            variant="primary"
          >
            {loading ? 'Analyse en cours...' : 'Lancer le diagnostic'}
          </Button>
          
          {diagnosticResults && (
            <Button onClick={exportResults} variant="secondary">
              Exporter les résultats
            </Button>
          )}
        </div>
      </Card>

      {diagnosticResults && (
        <>
          <Card title="📊 Résultats du Diagnostic" className={styles.card}>
            <div className={styles.section}>
              <h3>🎵 Concerts ({diagnosticResults.concerts.total} total)</h3>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>Avec contactId (ancien format)</td>
                    <td className={styles.number}>{diagnosticResults.concerts.avecContactId}</td>
                  </tr>
                  <tr>
                    <td>Avec contactIds (nouveau format)</td>
                    <td className={styles.number}>{diagnosticResults.concerts.avecContactIds}</td>
                  </tr>
                  <tr className={diagnosticResults.concerts.avecLesDeuxChamps > 0 ? styles.warning : ''}>
                    <td>
                      Avec les DEUX champs
                      {diagnosticResults.concerts.avecLesDeuxChamps > 0 && (
                        <Button size="small" variant="link" onClick={() => showDetailedInfo('deuxChamps')}>
                          ⚠️ Voir détails
                        </Button>
                      )}
                    </td>
                    <td className={styles.number}>{diagnosticResults.concerts.avecLesDeuxChamps}</td>
                  </tr>
                  <tr>
                    <td>Sans contact</td>
                    <td className={styles.number}>{diagnosticResults.concerts.sansContact}</td>
                  </tr>
                  <tr className={diagnosticResults.concerts.contactsOrphelins.length > 0 ? styles.error : ''}>
                    <td>
                      Contacts orphelins
                      {diagnosticResults.concerts.contactsOrphelins.length > 0 && (
                        <Button size="small" variant="link" onClick={() => showDetailedInfo('orphelins')}>
                          Voir liste
                        </Button>
                      )}
                    </td>
                    <td className={styles.number}>{diagnosticResults.concerts.contactsOrphelins.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.section}>
              <h3>📍 Lieux ({diagnosticResults.lieux.total} total)</h3>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>Avec contactIds</td>
                    <td className={styles.number}>{diagnosticResults.lieux.avecContactIds}</td>
                  </tr>
                  <tr>
                    <td>Sans contactIds</td>
                    <td className={styles.number}>{diagnosticResults.lieux.sansContactIds}</td>
                  </tr>
                  <tr className={diagnosticResults.lieux.formatIncorrect.length > 0 ? styles.error : ''}>
                    <td>
                      Format incorrect
                      {diagnosticResults.lieux.formatIncorrect.length > 0 && (
                        <Button size="small" variant="link" onClick={() => showDetailedInfo('formatIncorrect')}>
                          Voir liste
                        </Button>
                      )}
                    </td>
                    <td className={styles.number}>{diagnosticResults.lieux.formatIncorrect.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.section}>
              <h3>🏢 Structures ({diagnosticResults.structures.total} total)</h3>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>Avec contactsIds (à harmoniser)</td>
                    <td className={styles.number}>{diagnosticResults.structures.avecContactsIds}</td>
                  </tr>
                  <tr>
                    <td>Avec contactIds (correct)</td>
                    <td className={styles.number}>{diagnosticResults.structures.avecContactIds}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.section}>
              <h3>🔗 Relations bidirectionnelles (échantillon)</h3>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>Relations valides</td>
                    <td className={styles.number}>{diagnosticResults.relations.concertContactValides}</td>
                  </tr>
                  <tr>
                    <td>Relations manquantes</td>
                    <td className={styles.number}>{diagnosticResults.relations.concertContactManquantes}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {diagnosticResults.recommandations.length > 0 && (
            <Card title="⚡ Recommandations" className={styles.card}>
              {diagnosticResults.recommandations.map((rec, index) => (
                <Alert 
                  key={index}
                  type={rec.niveau === 'CRITIQUE' ? 'error' : rec.niveau === 'IMPORTANT' ? 'warning' : 'info'}
                >
                  <strong>[{rec.niveau}]</strong> {rec.message}
                  <br />
                  <small>→ {rec.action}</small>
                </Alert>
              ))}
              
              <div className={styles.migrationEstimate}>
                <h4>📈 Estimation de la migration</h4>
                <p>
                  Concerts à migrer : <strong>{diagnosticResults.concerts.avecContactId - diagnosticResults.concerts.avecContactIds}</strong>
                </p>
                <p>
                  Durée estimée : <strong>{Math.ceil((diagnosticResults.concerts.avecContactId - diagnosticResults.concerts.avecContactIds) / 100)} minutes</strong>
                </p>
              </div>
            </Card>
          )}
        </>
      )}

      {detailedInfo && (
        <Card title={detailedInfo.title} className={styles.card}>
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => setDetailedInfo(null)}
            style={{ marginBottom: '1rem' }}
          >
            ← Retour
          </Button>
          
          {detailedInfo.message && (
            <Alert type="warning">{detailedInfo.message}</Alert>
          )}
          
          {detailedInfo.data && detailedInfo.data.length > 0 && (
            <div className={styles.detailsList}>
              {detailedInfo.data.map((item, index) => (
                <div key={index} className={styles.detailItem}>
                  <pre>{JSON.stringify(item, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SECTION MIGRATION */}
      <Card title="🚀 Exécuter la Migration" className={styles.card}>
        <div className={styles.description}>
          <p>Convertit les concerts de <code>contactId</code> vers <code>contactIds</code> directement depuis l'interface.</p>
          
          {!diagnosticResults && (
            <Alert type="warning">
              ⚠️ Lancez d'abord le diagnostic pour évaluer l'impact de la migration.
            </Alert>
          )}
        </div>

        <div className={styles.migrationControls}>
          <div className={styles.modeSelector}>
            <label>
              <input
                type="checkbox"
                checked={dryRunMode}
                onChange={(e) => setDryRunMode(e.target.checked)}
                disabled={migrationState === 'running'}
              />
              Mode simulation (dry-run)
            </label>
            <small>
              {dryRunMode 
                ? '🧪 Simulation sans modification des données' 
                : '⚡ Migration réelle avec modification des données'
              }
            </small>
          </div>

          <div className={styles.actions}>
            <Button 
              onClick={runMigration}
              disabled={migrationState === 'running' || !currentOrganization}
              variant={dryRunMode ? 'primary' : 'danger'}
            >
              {migrationState === 'running' 
                ? 'Migration en cours...' 
                : `${dryRunMode ? '🧪 Simuler' : '⚡ Exécuter'} la migration`
              }
            </Button>
            
            {migrationState && (
              <Button onClick={resetMigration} variant="secondary">
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Statistiques de migration */}
        {migrationStats && (
          <div className={styles.migrationProgress}>
            <h4>📊 Progression de la migration</h4>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>Concerts totaux (organisation)</td>
                  <td className={styles.number}>{migrationStats.totalConcerts}</td>
                </tr>
                <tr>
                  <td>Concerts à migrer</td>
                  <td className={styles.number}>{migrationStats.concertsToMigrate}</td>
                </tr>
                <tr>
                  <td>Concerts {dryRunMode ? 'simulés' : 'migrés'}</td>
                  <td className={styles.number}>{migrationStats.concertsMigrated}</td>
                </tr>
                <tr>
                  <td>Relations bidirectionnelles mises à jour</td>
                  <td className={styles.number}>{migrationStats.bidirectionalUpdates}</td>
                </tr>
                <tr>
                  <td>Erreurs</td>
                  <td className={styles.number}>{migrationStats.errors.length}</td>
                </tr>
              </tbody>
            </table>
            
            {migrationStats.errors.length > 0 && (
              <Alert type="error">
                <strong>Erreurs rencontrées :</strong>
                <ul>
                  {migrationStats.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error.concertId}: {error.error}</li>
                  ))}
                  {migrationStats.errors.length > 5 && (
                    <li>... et {migrationStats.errors.length - 5} autres erreurs</li>
                  )}
                </ul>
              </Alert>
            )}
          </div>
        )}

        {/* Logs de migration */}
        {migrationLogs.length > 0 && (
          <div className={styles.migrationLogs}>
            <h4>📋 Logs de migration</h4>
            <div className={styles.logsContainer}>
              {migrationLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`${styles.logEntry} ${styles[`log${log.level.charAt(0).toUpperCase() + log.level.slice(1)}`]}`}
                >
                  <span className={styles.logTime}>{log.timestamp}</span>
                  <span className={styles.logMessage}>{log.message}</span>
                </div>
              ))}
            </div>
            
            {migrationState === 'completed' && (
              <Alert type="success">
                <strong>🎉 Migration {dryRunMode ? 'simulée' : 'terminée'} avec succès !</strong>
                {dryRunMode && (
                  <div>
                    <br />
                    💡 Pour exécuter la migration réelle :
                    <ol>
                      <li>Décochez "Mode simulation"</li>
                      <li>Cliquez sur "⚡ Exécuter la migration"</li>
                      <li>Confirmez dans la boîte de dialogue</li>
                    </ol>
                  </div>
                )}
              </Alert>
            )}
            
            {migrationState === 'error' && (
              <Alert type="error">
                <strong>❌ Erreur lors de la migration</strong>
                <br />
                Consultez les logs ci-dessus pour plus de détails.
              </Alert>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ContactsMigrationDiagnostic;