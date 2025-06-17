import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import styles from './RelancesCompleteDiagnostic.module.css';

/**
 * Outil de diagnostic complet pour les relances automatiques
 * Identifie les doublons, les relances invisibles, et les problèmes de tri
 */
const RelancesCompleteDiagnostic = () => {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [relances, setRelances] = useState([]);
  const [stats, setStats] = useState(null);
  const [doublons, setDoublons] = useState([]);
  const [relancesInvisibles, setRelancesInvisibles] = useState([]);
  const [message, setMessage] = useState('');

  // Charger toutes les relances
  const loadAllRelances = useCallback(async () => {
    if (!currentOrganization?.id) {
      setMessage('❌ Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Charger TOUTES les relances sans filtrage
      // Suppression du orderBy pour éviter le besoin d'index composite
      const relancesQuery = query(
        collection(db, 'relances'),
        where('organizationId', '==', currentOrganization.id)
      );

      const snapshot = await getDocs(relancesQuery);
      const allRelances = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Trier manuellement par date de création après récupération
      allRelances.sort((a, b) => {
        const dateA = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
        const dateB = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
        return dateB - dateA; // Tri décroissant (plus récent en premier)
      });

      setRelances(allRelances);
      analyzeRelances(allRelances);
      
    } catch (error) {
      console.error('Erreur chargement relances:', error);
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);

  // Analyser les relances
  const analyzeRelances = (relancesList) => {
    // Statistiques générales
    const statsData = {
      total: relancesList.length,
      manuelles: relancesList.filter(r => !r.automatique).length,
      automatiques: relancesList.filter(r => r.automatique).length,
      
      // Relances manuelles par statut
      manuellesPending: relancesList.filter(r => !r.automatique && r.status === 'pending').length,
      manuellesCompleted: relancesList.filter(r => !r.automatique && r.status === 'completed').length,
      manuellesAutres: relancesList.filter(r => !r.automatique && !r.status).length,
      
      // Relances automatiques par statut
      automatiquesNonTerminees: relancesList.filter(r => r.automatique && r.terminee === false).length,
      automatiquesTerminees: relancesList.filter(r => r.automatique && r.terminee === true).length,
      automatiquesSansStatut: relancesList.filter(r => r.automatique && r.terminee === undefined).length,
      
      // Problèmes potentiels
      sansType: relancesList.filter(r => r.automatique === undefined).length,
      sansStatutNiTerminee: relancesList.filter(r => !r.status && r.terminee === undefined).length
    };

    setStats(statsData);

    // Identifier les doublons (relances très similaires)
    const doublonsPotentiels = [];
    const relancesParConcert = {};

    relancesList.forEach(relance => {
      if (relance.concertId) {
        if (!relancesParConcert[relance.concertId]) {
          relancesParConcert[relance.concertId] = [];
        }
        relancesParConcert[relance.concertId].push(relance);
      }
    });

    // Chercher les doublons par concert
    Object.entries(relancesParConcert).forEach(([concertId, relancesConcert]) => {
      if (relancesConcert.length > 1) {
        // Grouper par type et date proche (même jour)
        const groupes = {};
        
        relancesConcert.forEach(relance => {
          const dateKey = relance.dateCreation ? new Date(relance.dateCreation).toDateString() : 'no-date';
          const typeKey = relance.type || 'no-type';
          const key = `${typeKey}-${dateKey}`;
          
          if (!groupes[key]) {
            groupes[key] = [];
          }
          groupes[key].push(relance);
        });

        // Identifier les vrais doublons
        Object.values(groupes).forEach(groupe => {
          if (groupe.length > 1) {
            doublonsPotentiels.push({
              concertId,
              relances: groupe,
              count: groupe.length
            });
          }
        });
      }
    });

    setDoublons(doublonsPotentiels);

    // Identifier les relances "invisibles" (non affichées dans l'UI)
    const invisibles = relancesList.filter(relance => {
      // Une relance est invisible si elle n'a ni status ni terminee correctement défini
      if (relance.automatique) {
        // Relance automatique sans champ terminee
        return relance.terminee === undefined;
      } else {
        // Relance manuelle sans status
        return !relance.status;
      }
    });

    setRelancesInvisibles(invisibles);
  };

  // Corriger une relance invisible
  const fixRelanceInvisible = async (relance) => {
    try {
      const updates = {};
      
      if (relance.automatique) {
        // Pour les relances automatiques, ajouter terminee: false si manquant
        updates.terminee = false;
      } else {
        // Pour les relances manuelles, ajouter status: 'pending' si manquant
        updates.status = 'pending';
      }

      await updateDoc(doc(db, 'relances', relance.id), updates);
      setMessage(`✅ Relance ${relance.id} corrigée`);
      loadAllRelances(); // Recharger
      
    } catch (error) {
      setMessage(`❌ Erreur correction: ${error.message}`);
    }
  };

  // Supprimer un doublon
  const deleteDoublon = async (relanceId) => {
    if (!window.confirm('Supprimer cette relance ?')) return;

    try {
      await deleteDoc(doc(db, 'relances', relanceId));
      setMessage(`✅ Relance ${relanceId} supprimée`);
      loadAllRelances(); // Recharger
    } catch (error) {
      setMessage(`❌ Erreur suppression: ${error.message}`);
    }
  };

  // Corriger tous les problèmes
  const fixAllProblems = async () => {
    if (!window.confirm('Corriger tous les problèmes détectés ?')) return;

    setLoading(true);
    let fixed = 0;
    let errors = 0;

    // Corriger les relances invisibles
    for (const relance of relancesInvisibles) {
      try {
        await fixRelanceInvisible(relance);
        fixed++;
      } catch (error) {
        errors++;
      }
    }

    setMessage(`✅ Corrections: ${fixed} réussies, ${errors} erreurs`);
    setLoading(false);
    loadAllRelances();
  };

  useEffect(() => {
    loadAllRelances();
  }, [currentOrganization, loadAllRelances]);

  return (
    <div className={styles.container}>
      <Card className={styles.header}>
        <h2>🔍 Diagnostic Complet des Relances</h2>
        <p>Analyse approfondie pour identifier doublons et relances invisibles</p>
        
        <div className={styles.actions}>
          <Button onClick={loadAllRelances} disabled={loading}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Rafraîchir
          </Button>
          
          {(doublons.length > 0 || relancesInvisibles.length > 0) && (
            <Button 
              variant="warning" 
              onClick={fixAllProblems} 
              disabled={loading}
            >
              <i className="bi bi-tools me-2"></i>
              Corriger tous les problèmes
            </Button>
          )}
        </div>
      </Card>

      {message && (
        <Alert type={message.startsWith('✅') ? 'success' : 'error'}>
          {message}
        </Alert>
      )}

      {loading && <LoadingSpinner />}

      {stats && (
        <>
          {/* Statistiques générales */}
          <Card className={styles.statsCard}>
            <h3>📊 Statistiques Générales</h3>
            
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.total}</div>
                <div className={styles.statLabel}>Total relances</div>
              </div>
              
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.manuelles}</div>
                <div className={styles.statLabel}>Manuelles</div>
              </div>
              
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.automatiques}</div>
                <div className={styles.statLabel}>Automatiques</div>
              </div>
              
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.sansType}</div>
                <div className={styles.statLabel}>Sans type défini</div>
              </div>
            </div>

            <div className={styles.subStats}>
              <h4>Relances Manuelles</h4>
              <ul>
                <li>En attente (status=pending): <strong>{stats.manuellesPending}</strong></li>
                <li>Terminées (status=completed): <strong>{stats.manuellesCompleted}</strong></li>
                <li>Sans status: <strong className={styles.warning}>{stats.manuellesAutres}</strong></li>
              </ul>

              <h4>Relances Automatiques</h4>
              <ul>
                <li>Non terminées (terminee=false): <strong>{stats.automatiquesNonTerminees}</strong></li>
                <li>Terminées (terminee=true): <strong>{stats.automatiquesTerminees}</strong></li>
                <li>Sans champ terminee: <strong className={styles.warning}>{stats.automatiquesSansStatut}</strong></li>
              </ul>
            </div>
          </Card>

          {/* Relances invisibles */}
          {relancesInvisibles.length > 0 && (
            <Card className={styles.problemCard}>
              <h3>⚠️ Relances Invisibles ({relancesInvisibles.length})</h3>
              <p className={styles.problemDescription}>
                Ces relances n'apparaissent pas dans l'interface car elles n'ont pas les bons champs de statut
              </p>
              
              <div className={styles.relancesList}>
                {relancesInvisibles.map(relance => (
                  <div key={relance.id} className={styles.relanceItem}>
                    <div className={styles.relanceInfo}>
                      <strong>{relance.type || 'Sans type'}</strong>
                      <span className={styles.relanceId}>ID: {relance.id}</span>
                      <span className={styles.relanceType}>
                        {relance.automatique ? '🤖 Automatique' : '👤 Manuelle'}
                      </span>
                      <span className={styles.problemTag}>
                        {relance.automatique 
                          ? 'Manque: terminee' 
                          : 'Manque: status'
                        }
                      </span>
                    </div>
                    <div className={styles.relanceDetails}>
                      Concert: {relance.concertTitre || relance.concertId || 'Non spécifié'}
                      <br />
                      Créée le: {relance.dateCreation ? new Date(relance.dateCreation).toLocaleDateString() : 'Date inconnue'}
                    </div>
                    <Button 
                      size="small" 
                      variant="success"
                      onClick={() => fixRelanceInvisible(relance)}
                    >
                      Corriger
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Doublons potentiels */}
          {doublons.length > 0 && (
            <Card className={styles.problemCard}>
              <h3>🔄 Doublons Potentiels ({doublons.length} groupes)</h3>
              <p className={styles.problemDescription}>
                Plusieurs relances similaires pour le même concert créées le même jour
              </p>
              
              {doublons.map((groupe, idx) => (
                <div key={idx} className={styles.doublonGroupe}>
                  <h4>Concert ID: {groupe.concertId} ({groupe.count} relances)</h4>
                  
                  <div className={styles.relancesList}>
                    {groupe.relances.map(relance => (
                      <div key={relance.id} className={styles.relanceItem}>
                        <div className={styles.relanceInfo}>
                          <strong>{relance.type || 'Sans type'}</strong>
                          <span className={styles.relanceId}>ID: {relance.id}</span>
                          <span className={styles.relanceType}>
                            {relance.automatique ? '🤖 Auto' : '👤 Manuel'}
                          </span>
                          <span>
                            {relance.automatique 
                              ? `terminee: ${relance.terminee}`
                              : `status: ${relance.status || 'none'}`
                            }
                          </span>
                        </div>
                        <div className={styles.relanceDetails}>
                          {relance.concertTitre && `Titre: ${relance.concertTitre}`}
                          <br />
                          Créée: {relance.dateCreation ? new Date(relance.dateCreation).toLocaleString() : 'Date inconnue'}
                        </div>
                        <Button 
                          size="small" 
                          variant="danger"
                          onClick={() => deleteDoublon(relance.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Liste complète des relances */}
          <Card className={styles.allRelancesCard}>
            <h3>📋 Toutes les Relances ({relances.length})</h3>
            
            <div className={styles.tableWrapper}>
              <table className={styles.relancesTable}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Concert</th>
                    <th>Auto/Manuel</th>
                    <th>Statut</th>
                    <th>Date création</th>
                    <th>Date échéance</th>
                    <th>Visible UI?</th>
                  </tr>
                </thead>
                <tbody>
                  {relances.map(relance => {
                    const isVisible = relance.automatique 
                      ? relance.terminee !== undefined
                      : !!relance.status;
                    
                    return (
                      <tr key={relance.id} className={!isVisible ? styles.invisible : ''}>
                        <td>{relance.type || 'Sans type'}</td>
                        <td>{relance.concertTitre || relance.concertId || '-'}</td>
                        <td>
                          {relance.automatique ? '🤖 Auto' : '👤 Manuel'}
                        </td>
                        <td>
                          {relance.automatique 
                            ? `terminee: ${relance.terminee}`
                            : `status: ${relance.status || 'none'}`
                          }
                        </td>
                        <td>
                          {relance.dateCreation 
                            ? new Date(relance.dateCreation).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td>
                          {relance.dateEcheance 
                            ? new Date(relance.dateEcheance).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td>
                          {isVisible ? '✅' : '❌'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default RelancesCompleteDiagnostic;