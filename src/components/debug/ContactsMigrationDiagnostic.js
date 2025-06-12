import React, { useState } from 'react';
import { collection, getDocs, doc, getDoc, db } from '@/services/firebase-service';
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
    </div>
  );
};

export default ContactsMigrationDiagnostic;