import React, { useState } from 'react';
import { collection, getDocs, doc, setDoc, query, where, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import styles from './DataStructureFixer.module.css';

/**
 * Outil pour corriger la migration relationnelle
 * - Corrige isPersonneLibre sur les personnes
 * - Crée les structures manquantes
 * - Crée les liaisons entre structures et personnes
 */
const RelationalMigrationFixer = () => {
  const { currentEntreprise } = useEntreprise();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [dryRun, setDryRun] = useState(true);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[RelationalFixer ${type}] ${message}`);
  };

  const analyzeData = async () => {
    if (!currentEntreprise?.id) {
      setError('Veuillez sélectionner une organisation');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setLogs([]);

    try {
      addLog('📊 Analyse des données...');

      // Charger toutes les données
      const [structuresSnap, personnesSnap, liaisonsSnap, unifiedSnap] = await Promise.all([
        getDocs(query(collection(db, 'structures'), where('entrepriseId', '==', currentEntreprise.id))),
        getDocs(query(collection(db, 'personnes'), where('entrepriseId', '==', currentEntreprise.id))),
        getDocs(query(collection(db, 'liaisons'), where('entrepriseId', '==', currentEntreprise.id))),
        getDocs(query(collection(db, 'contacts_unified'), where('entrepriseId', '==', currentEntreprise.id)))
      ]);

      // Analyser les personnes libres
      const personnesAvecLiaisons = new Set();
      liaisonsSnap.forEach(doc => {
        const liaison = doc.data();
        if (liaison.actif !== false) {
          personnesAvecLiaisons.add(liaison.personneId);
        }
      });

      const personnesACorreger = [];
      personnesSnap.forEach(doc => {
        const personne = doc.data();
        const shouldBeLibre = !personnesAvecLiaisons.has(doc.id);
        if (personne.isPersonneLibre !== shouldBeLibre) {
          personnesACorreger.push({
            id: doc.id,
            nom: `${personne.prenom} ${personne.nom}`,
            actuel: personne.isPersonneLibre,
            correct: shouldBeLibre
          });
        }
      });

      // Analyser les structures manquantes
      const structuresExistantes = new Set();
      structuresSnap.forEach(doc => {
        const structure = doc.data();
        if (structure.siret) {
          structuresExistantes.add(structure.siret);
        }
      });

      const structuresACreer = [];
      unifiedSnap.forEach(doc => {
        const unified = doc.data();
        if (unified.entityType === 'structure' && unified.structure?.siret) {
          if (!structuresExistantes.has(unified.structure.siret)) {
            structuresACreer.push({
              id: doc.id,
              raisonSociale: unified.structure.raisonSociale || unified.structure.nom,
              siret: unified.structure.siret,
              ville: unified.structure.adresse?.ville || unified.structure.ville
            });
          }
        }
      });

      // Analyser les liaisons manquantes
      const liaisonsExistantes = new Set();
      liaisonsSnap.forEach(doc => {
        const liaison = doc.data();
        liaisonsExistantes.add(`${liaison.structureId}-${liaison.personneId}`);
      });

      let liaisonsManquantes = 0;
      unifiedSnap.forEach(doc => {
        const unified = doc.data();
        if (unified.entityType === 'structure' && unified.personnes?.length > 0) {
          liaisonsManquantes += unified.personnes.length;
        }
      });

      const analysisData = {
        personnes: {
          total: personnesSnap.size,
          aCorreger: personnesACorreger.length,
          details: personnesACorreger
        },
        structures: {
          total: structuresSnap.size,
          aCreer: structuresACreer.length,
          details: structuresACreer
        },
        liaisons: {
          total: liaisonsSnap.size,
          estimees: liaisonsManquantes
        },
        sources: {
          unified: unifiedSnap.size
        }
      };

      setAnalysis(analysisData);
      addLog(`✅ Analyse terminée: ${personnesACorreger.length} personnes à corriger, ${structuresACreer.length} structures à créer`);

    } catch (err) {
      console.error('Erreur analyse:', err);
      setError(err.message);
      addLog(`❌ Erreur: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeFix = async () => {
    if (!analysis || !currentEntreprise?.id) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setLogs([]);

    try {
      const results = {
        personnesCorrigees: 0,
        structuresCreees: 0,
        liaisonsCreees: 0
      };

      // 1. Corriger isPersonneLibre
      addLog('🔄 Correction des personnes libres...');
      
      if (!dryRun && analysis.personnes.details.length > 0) {
        const batch = writeBatch(db);
        let batchCount = 0;

        for (const personne of analysis.personnes.details) {
          addLog(`- ${personne.nom}: isPersonneLibre ${personne.actuel} → ${personne.correct}`);
          
          batch.update(doc(db, 'personnes', personne.id), {
            isPersonneLibre: personne.correct,
            updatedAt: serverTimestamp()
          });
          
          batchCount++;
          results.personnesCorrigees++;
          
          if (batchCount >= 400) {
            await batch.commit();
            batchCount = 0;
          }
        }
        
        if (batchCount > 0) {
          await batch.commit();
        }
      }

      // 2. Créer les structures manquantes
      addLog('🏢 Création des structures manquantes...');
      
      if (!dryRun && analysis.structures.details.length > 0) {
        // Recharger les contacts unifiés pour avoir toutes les données
        const unifiedSnap = await getDocs(query(collection(db, 'contacts_unified'), where('entrepriseId', '==', currentEntreprise.id)));
        
        for (const structureInfo of analysis.structures.details) {
          const unifiedDoc = unifiedSnap.docs.find(doc => doc.id === structureInfo.id);
          if (!unifiedDoc) continue;
          
          const unified = unifiedDoc.data();
          const structure = unified.structure;
          
          const structureId = `structure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const structureData = {
            entrepriseId: currentEntreprise.id,
            raisonSociale: structure.raisonSociale || structure.nom || 'Structure sans nom',
            type: structure.type || 'autre',
            email: structure.email || '',
            telephone1: structure.telephone1 || '',
            telephone2: structure.telephone2 || '',
            fax: structure.fax || '',
            siteWeb: structure.siteWeb || '',
            adresse: structure.adresse?.adresse || '',
            codePostal: structure.adresse?.codePostal || structure.codePostal || '',
            ville: structure.adresse?.ville || structure.ville || '',
            departement: structure.departement || '',
            region: structure.region || '',
            pays: structure.adresse?.pays || structure.pays || 'France',
            siret: structure.siret,
            tags: unified.qualification?.tags || unified.tags || [],
            notes: '',
            isClient: unified.client || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            migrationNote: `Créée depuis ${unifiedDoc.id}`
          };
          
          addLog(`- Création: ${structureData.raisonSociale} (SIRET: ${structure.siret})`);
          
          await setDoc(doc(db, 'structures', structureId), structureData);
          results.structuresCreees++;
        }
      }

      // 3. Créer les liaisons
      addLog('🔗 Création des liaisons...');
      
      if (!dryRun) {
        // Recharger toutes les données pour avoir les nouvelles structures
        const [structuresSnap, personnesSnap, unifiedSnap] = await Promise.all([
          getDocs(query(collection(db, 'structures'), where('entrepriseId', '==', currentEntreprise.id))),
          getDocs(query(collection(db, 'personnes'), where('entrepriseId', '==', currentEntreprise.id))),
          getDocs(query(collection(db, 'contacts_unified'), where('entrepriseId', '==', currentEntreprise.id)))
        ]);

        // Créer les index
        const structuresBySiret = new Map();
        structuresSnap.forEach(doc => {
          const structure = doc.data();
          if (structure.siret) {
            structuresBySiret.set(structure.siret, { id: doc.id, ...structure });
          }
        });

        const personnesByEmail = new Map();
        const personnesByNom = new Map();
        personnesSnap.forEach(doc => {
          const personne = doc.data();
          if (personne.email) {
            personnesByEmail.set(personne.email.toLowerCase(), { id: doc.id, ...personne });
          }
          const nomComplet = `${personne.prenom} ${personne.nom}`.toLowerCase().trim();
          personnesByNom.set(nomComplet, { id: doc.id, ...personne });
        });

        // Créer les liaisons
        const batch = writeBatch(db);
        let batchCount = 0;

        for (const unifiedDoc of unifiedSnap.docs) {
          const unified = unifiedDoc.data();
          
          if (unified.entityType === 'structure' && unified.structure?.siret && unified.personnes?.length > 0) {
            const structureData = structuresBySiret.get(unified.structure.siret);
            if (!structureData) continue;

            for (const personneUnified of unified.personnes) {
              let personneData = null;
              
              // Chercher par email ou par nom
              const email = (personneUnified.email || personneUnified.mailDirect || '').toLowerCase();
              if (email) {
                personneData = personnesByEmail.get(email);
              }
              
              if (!personneData && personneUnified.prenom && personneUnified.nom) {
                const nomComplet = `${personneUnified.prenom} ${personneUnified.nom}`.toLowerCase().trim();
                personneData = personnesByNom.get(nomComplet);
              }
              
              if (personneData) {
                const liaisonId = `liaison_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const liaisonData = {
                  entrepriseId: currentEntreprise.id,
                  structureId: structureData.id,
                  personneId: personneData.id,
                  fonction: personneUnified.fonction || '',
                  actif: true,
                  prioritaire: false,
                  interesse: false,
                  dateDebut: serverTimestamp(),
                  notes: '',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                };
                
                addLog(`- Liaison: ${personneData.prenom} ${personneData.nom} ↔ ${structureData.raisonSociale}`);
                
                batch.set(doc(db, 'liaisons', liaisonId), liaisonData);
                batchCount++;
                results.liaisonsCreees++;
                
                if (batchCount >= 400) {
                  await batch.commit();
                  batchCount = 0;
                }
              }
            }
          }
        }
        
        if (batchCount > 0) {
          await batch.commit();
        }
      }

      setResults(results);
      addLog(`✅ Correction terminée: ${results.personnesCorrigees} personnes, ${results.structuresCreees} structures, ${results.liaisonsCreees} liaisons`);

    } catch (err) {
      console.error('Erreur correction:', err);
      setError(err.message);
      addLog(`❌ Erreur: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h2>🔧 Correction Migration Relationnelle</h2>
          <p>Corrige les données migrées : isPersonneLibre, structures manquantes, liaisons</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
              />
              Mode simulation (dry run)
            </label>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={analyzeData}
              disabled={loading || !currentEntreprise}
              variant="secondary"
            >
              {loading ? 'Analyse...' : '📊 Analyser'}
            </Button>

            {analysis && (
              <Button
                onClick={executeFix}
                disabled={loading}
                variant={dryRun ? 'warning' : 'danger'}
              >
                {loading ? 'Correction...' : dryRun ? '🔍 Simuler correction' : '⚡ Exécuter correction'}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="danger" className={styles.alert}>
            <strong>Erreur :</strong> {error}
          </Alert>
        )}

        {analysis && (
          <div className={styles.section}>
            <h3>📊 Analyse</h3>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{analysis.personnes.aCorreger}</div>
                <div className={styles.statLabel}>Personnes à corriger</div>
                <div className={styles.statDetail}>sur {analysis.personnes.total}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{analysis.structures.aCreer}</div>
                <div className={styles.statLabel}>Structures à créer</div>
                <div className={styles.statDetail}>depuis {analysis.sources.unified} unifiés</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>~{analysis.liaisons.estimees}</div>
                <div className={styles.statLabel}>Liaisons estimées</div>
                <div className={styles.statDetail}>actuellement {analysis.liaisons.total}</div>
              </div>
            </div>

            {analysis.personnes.details.length > 0 && (
              <details className={styles.details}>
                <summary>Personnes à corriger ({analysis.personnes.details.length})</summary>
                <ul>
                  {analysis.personnes.details.slice(0, 10).map((p, i) => (
                    <li key={i}>
                      {p.nom}: isPersonneLibre {p.actuel ? '✓' : '✗'} → {p.correct ? '✓' : '✗'}
                    </li>
                  ))}
                  {analysis.personnes.details.length > 10 && (
                    <li>... et {analysis.personnes.details.length - 10} autres</li>
                  )}
                </ul>
              </details>
            )}

            {analysis.structures.details.length > 0 && (
              <details className={styles.details}>
                <summary>Structures à créer ({analysis.structures.details.length})</summary>
                <ul>
                  {analysis.structures.details.slice(0, 10).map((s, i) => (
                    <li key={i}>
                      {s.raisonSociale} (SIRET: {s.siret})
                    </li>
                  ))}
                  {analysis.structures.details.length > 10 && (
                    <li>... et {analysis.structures.details.length - 10} autres</li>
                  )}
                </ul>
              </details>
            )}
          </div>
        )}

        {results && (
          <div className={styles.section}>
            <h3>✅ Résultats</h3>
            <div className={styles.results}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Personnes corrigées:</span>
                <span className={styles.resultValue}>{results.personnesCorrigees}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Structures créées:</span>
                <span className={styles.resultValue}>{results.structuresCreees}</span>
              </div>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Liaisons créées:</span>
                <span className={styles.resultValue}>{results.liaisonsCreees}</span>
              </div>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className={styles.section}>
            <h3>📝 Journal</h3>
            <div className={styles.logs}>
              {logs.map((log, i) => (
                <div key={i} className={`${styles.logEntry} ${styles[log.type]}`}>
                  <span className={styles.logTime}>{log.timestamp}</span>
                  <span className={styles.logMessage}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RelationalMigrationFixer;