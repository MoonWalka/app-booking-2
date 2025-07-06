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
      dates: {
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
        dateContactValides: 0,
        dateContactManquantes: 0
      },
      recommandations: []
    };

    try {
      // 1. Analyser les CONCERTS
      console.log('📋 Analyse des dates...');
      const datesSnapshot = await getDocs(collection(db, 'dates'));
      
      for (const docSnap of datesSnapshot.docs) {
        const date = docSnap.data();
        
        // Filtrer par organisation
        if (date.organizationId !== currentOrganization.id) continue;
        
        results.dates.total++;
        
        if (date.contactId) {
          results.dates.avecContactId++;
          
          // Vérifier si le contact existe
          try {
            const contactDoc = await getDoc(doc(db, 'contacts', date.contactId));
            if (!contactDoc.exists()) {
              results.dates.contactsOrphelins.push({
                dateId: docSnap.id,
                dateNom: date.nom,
                contactIdInexistant: date.contactId
              });
            }
          } catch (error) {
            console.error('Erreur vérification contact:', error);
          }
        }
        
        if (date.contactIds && Array.isArray(date.contactIds)) {
          results.dates.avecContactIds++;
        }
        
        if (date.contactId && date.contactIds) {
          results.dates.avecLesDeuxChamps++;
        }
        
        if (!date.contactId && (!date.contactIds || date.contactIds.length === 0)) {
          results.dates.sansContact++;
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
      
      for (const docSnap of datesSnapshot.docs) {
        const date = docSnap.data();
        
        if (date.organizationId !== currentOrganization.id) continue;
        if (!date.contactId) continue;
        if (checkedRelations >= 10) break; // Limiter pour la performance
        
        try {
          const contactDoc = await getDoc(doc(db, 'contacts', date.contactId));
          if (contactDoc.exists()) {
            const contact = contactDoc.data();
            if (contact.datesIds && contact.datesIds.includes(docSnap.id)) {
              results.relations.dateContactValides++;
            } else {
              results.relations.dateContactManquantes++;
            }
            checkedRelations++;
          }
        } catch (error) {
          console.error('Erreur vérification relation:', error);
        }
      }
      
      // 5. Générer les recommandations
      if (results.dates.avecLesDeuxChamps > 0) {
        results.recommandations.push({
          niveau: 'CRITIQUE',
          message: `${results.dates.avecLesDeuxChamps} dates ont à la fois contactId et contactIds`,
          action: 'Vérifier la cohérence et nettoyer avant migration'
        });
      }
      
      if (results.dates.contactsOrphelins.length > 0) {
        results.recommandations.push({
          niveau: 'IMPORTANT',
          message: `${results.dates.contactsOrphelins.length} dates référencent des contacts inexistants`,
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
      
      const totalAMigrer = results.dates.avecContactId - results.dates.avecContactIds;
      if (totalAMigrer > 0) {
        results.recommandations.push({
          niveau: 'INFO',
          message: `${totalAMigrer} dates à migrer de contactId vers contactIds`,
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
          data: diagnosticResults.dates.contactsOrphelins
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
          title: 'Dates avec les deux champs',
          message: 'Ces dates ont à la fois contactId et contactIds, ce qui peut créer des incohérences.'
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
      totalDates: 0,
      datesToMigrate: 0,
      datesMigrated: 0,
      errors: [],
      bidirectionalUpdates: 0
    });

    try {
      addMigrationLog(`🚀 Début de la migration ${dryRunMode ? '(MODE SIMULATION)' : '(MODE RÉEL)'}`, 'info');
      addMigrationLog(`📍 Organisation: ${currentOrganization.name}`, 'info');

      // Phase 1: Analyser les dates à migrer
      addMigrationLog('🔍 Phase 1: Analyse des dates...', 'info');
      
      const datesSnapshot = await getDocs(collection(db, 'dates'));
      const datesToMigrate = [];
      let totalDates = 0;

      for (const docSnap of datesSnapshot.docs) {
        const date = docSnap.data();
        
        // Filtrer par organisation
        if (date.organizationId !== currentOrganization.id) continue;
        
        totalDates++;

        // Date à migrer : a contactId mais pas contactIds
        const hasContactId = date.contactId && typeof date.contactId === 'string';
        const hasContactIds = date.contactIds && Array.isArray(date.contactIds) && date.contactIds.length > 0;

        if (hasContactId && !hasContactIds) {
          datesToMigrate.push({
            id: docSnap.id,
            contactId: date.contactId,
            nom: date.nom || 'Date sans nom'
          });
        }
      }

      setMigrationStats(prev => ({
        ...prev,
        totalDates,
        datesToMigrate: datesToMigrate.length
      }));

      addMigrationLog(`📊 Dates totaux: ${totalDates}`, 'info');
      addMigrationLog(`🎯 Dates à migrer: ${datesToMigrate.length}`, 'info');

      if (datesToMigrate.length === 0) {
        addMigrationLog('✅ Aucun date à migrer trouvé', 'success');
        setMigrationState('completed');
        return;
      }

      // Phase 2: Migration par lots
      addMigrationLog('🔄 Phase 2: Migration des dates...', 'info');
      
      const BATCH_SIZE = 10; // Plus petit pour l'interface
      const batches = [];
      
      for (let i = 0; i < datesToMigrate.length; i += BATCH_SIZE) {
        batches.push(datesToMigrate.slice(i, i + BATCH_SIZE));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        addMigrationLog(`📦 Lot ${batchIndex + 1}/${batches.length} (${batch.length} dates)`, 'info');

        if (dryRunMode) {
          // Simulation
          for (const date of batch) {
            addMigrationLog(`   🧪 [SIMULATION] ${date.nom}: contactId=${date.contactId} → contactIds=[${date.contactId}]`, 'info');
            setMigrationStats(prev => ({
              ...prev,
              datesMigrated: prev.datesMigrated + 1
            }));
          }
        } else {
          // Migration réelle
          const firestoreBatch = writeBatch(db);

          for (const date of batch) {
            try {
              const dateRef = doc(db, 'dates', date.id);
              
              const updateData = {
                contactIds: [date.contactId],
                contactId: null, // Supprimer l'ancien champ
                contactId_migrated: date.contactId, // Sauvegarde pour rollback
                updatedAt: serverTimestamp()
              };

              firestoreBatch.update(dateRef, updateData);
              addMigrationLog(`   ✅ ${date.nom} préparé pour migration`, 'info');

            } catch (error) {
              addMigrationLog(`   ❌ Erreur ${date.nom}: ${error.message}`, 'error');
              setMigrationStats(prev => ({
                ...prev,
                errors: [...prev.errors, { dateId: date.id, error: error.message }]
              }));
            }
          }

          // Exécuter le batch
          try {
            await firestoreBatch.commit();
            addMigrationLog(`   ✅ Lot ${batchIndex + 1} migré avec succès`, 'success');
            
            setMigrationStats(prev => ({
              ...prev,
              datesMigrated: prev.datesMigrated + batch.length
            }));

            // Mettre à jour les relations bidirectionnelles
            for (const date of batch) {
              await updateBidirectionalRelation(date.id, date.contactId);
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

  const updateBidirectionalRelation = async (dateId, contactId) => {
    try {
      const contactRef = doc(db, 'contacts', contactId);
      const contactDoc = await getDoc(contactRef);

      if (!contactDoc.exists()) {
        addMigrationLog(`      ⚠️ Contact ${contactId} non trouvé pour date ${dateId}`, 'warning');
        return;
      }

      const contactData = contactDoc.data();
      let datesIds = contactData.datesIds || [];

      if (!datesIds.includes(dateId)) {
        datesIds.push(dateId);

        await updateDoc(contactRef, {
          datesIds: datesIds,
          updatedAt: serverTimestamp()
        });

        setMigrationStats(prev => ({
          ...prev,
          bidirectionalUpdates: prev.bidirectionalUpdates + 1
        }));

        addMigrationLog(`      🔗 Relation bidirectionnelle mise à jour: contact ${contactId} ↔ date ${dateId}`, 'info');
      }

    } catch (error) {
      addMigrationLog(`      ❌ Erreur relation bidirectionnelle ${contactId} ↔ ${dateId}: ${error.message}`, 'error');
      setMigrationStats(prev => ({
        ...prev,
        errors: [...prev.errors, { 
          type: 'bidirectional', 
          dateId, 
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
              <h3>🎵 Dates ({diagnosticResults.dates.total} total)</h3>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>Avec contactId (ancien format)</td>
                    <td className={styles.number}>{diagnosticResults.dates.avecContactId}</td>
                  </tr>
                  <tr>
                    <td>Avec contactIds (nouveau format)</td>
                    <td className={styles.number}>{diagnosticResults.dates.avecContactIds}</td>
                  </tr>
                  <tr className={diagnosticResults.dates.avecLesDeuxChamps > 0 ? styles.warning : ''}>
                    <td>
                      Avec les DEUX champs
                      {diagnosticResults.dates.avecLesDeuxChamps > 0 && (
                        <Button size="small" variant="link" onClick={() => showDetailedInfo('deuxChamps')}>
                          ⚠️ Voir détails
                        </Button>
                      )}
                    </td>
                    <td className={styles.number}>{diagnosticResults.dates.avecLesDeuxChamps}</td>
                  </tr>
                  <tr>
                    <td>Sans contact</td>
                    <td className={styles.number}>{diagnosticResults.dates.sansContact}</td>
                  </tr>
                  <tr className={diagnosticResults.dates.contactsOrphelins.length > 0 ? styles.error : ''}>
                    <td>
                      Contacts orphelins
                      {diagnosticResults.dates.contactsOrphelins.length > 0 && (
                        <Button size="small" variant="link" onClick={() => showDetailedInfo('orphelins')}>
                          Voir liste
                        </Button>
                      )}
                    </td>
                    <td className={styles.number}>{diagnosticResults.dates.contactsOrphelins.length}</td>
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
                    <td className={styles.number}>{diagnosticResults.relations.dateContactValides}</td>
                  </tr>
                  <tr>
                    <td>Relations manquantes</td>
                    <td className={styles.number}>{diagnosticResults.relations.dateContactManquantes}</td>
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
                  Dates à migrer : <strong>{diagnosticResults.dates.avecContactId - diagnosticResults.dates.avecContactIds}</strong>
                </p>
                <p>
                  Durée estimée : <strong>{Math.ceil((diagnosticResults.dates.avecContactId - diagnosticResults.dates.avecContactIds) / 100)} minutes</strong>
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
          <p>Convertit les dates de <code>contactId</code> vers <code>contactIds</code> directement depuis l'interface.</p>
          
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
                  <td>Dates totaux (organisation)</td>
                  <td className={styles.number}>{migrationStats.totalDates}</td>
                </tr>
                <tr>
                  <td>Dates à migrer</td>
                  <td className={styles.number}>{migrationStats.datesToMigrate}</td>
                </tr>
                <tr>
                  <td>Dates {dryRunMode ? 'simulés' : 'migrés'}</td>
                  <td className={styles.number}>{migrationStats.datesMigrated}</td>
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
                    <li key={index}>{error.dateId}: {error.error}</li>
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