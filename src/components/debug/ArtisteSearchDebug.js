import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, writeBatch, doc, deleteDoc } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import styles from './OrganizationIdDebug.module.css';

/**
 * Composant de debug pour tester la recherche d'artistes
 */
const ArtisteSearchDebug = () => {
  const { currentOrganization } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [directResults, setDirectResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [fixProgress, setFixProgress] = useState(null);
  const [artistesWithoutOrgId, setArtistesWithoutOrgId] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [mergeInProgress, setMergeInProgress] = useState(false);
  const [showAllNoms, setShowAllNoms] = useState(false);
  const [allArtistesNoms, setAllArtistesNoms] = useState([]);

  // Utiliser le hook de recherche
  const {
    results: hookResults,
    isSearching: hookSearching,
    searchTerm: hookSearchTerm,
    setSearchTerm: hookHandleSearch
  } = useEntitySearch({
    entityType: 'artistes',
    searchField: 'nom',
    additionalSearchFields: ['style'],
    maxResults: 10
  });

  // Log de debug pour identifier le problème
  useEffect(() => {
    console.log('[ArtisteSearchDebug] Organization Context:', {
      currentOrganization,
      organizationId: currentOrganization?.id,
      organizationName: currentOrganization?.name
    });
  }, [currentOrganization]);

  // Recherche directe dans Firestore
  const searchDirectly = async () => {
    setLoading(true);
    setDebugInfo(null);

    try {
      const info = {
        organizationId: currentOrganization?.id || 'AUCUNE',
        searchTerm,
        timestamp: new Date().toISOString()
      };

      // Requête 1 : Avec organizationId
      let results1 = [];
      if (currentOrganization?.id) {
        const q1 = query(
          collection(db, 'artistes'),
          where('organizationId', '==', currentOrganization.id),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot1 = await getDocs(q1);
        results1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        info.withOrgId = results1.length;
      }

      // Requête 2 : Sans organizationId (tous les artistes)
      const q2 = query(
        collection(db, 'artistes'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot2 = await getDocs(q2);
      const results2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      info.totalArtistes = results2.length;

      // Filtrer par nom
      const filtered1 = results1.filter(a => 
        a.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filtered2 = results2.filter(a => 
        a.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      info.filteredWithOrgId = filtered1.length;
      info.filteredTotal = filtered2.length;

      setDirectResults(filtered2);
      setDebugInfo(info);

      console.log('[ArtisteSearchDebug] Résultats:', {
        avecOrgId: results1,
        tous: results2,
        filtrésAvecOrgId: filtered1,
        filtrésTous: filtered2
      });

    } catch (error) {
      console.error('[ArtisteSearchDebug] Erreur:', error);
      setDebugInfo({ error: error.message });
    }

    setLoading(false);
  };

  // Analyser un artiste
  const analyzeArtiste = (artiste) => {
    const hasOrgId = !!artiste.organizationId;
    const orgIdMatch = artiste.organizationId === currentOrganization?.id;
    const hasNom = !!artiste.nom;

    return {
      hasOrgId,
      orgIdMatch,
      hasNom,
      canBeFound: hasOrgId && orgIdMatch && hasNom
    };
  };

  // Analyser tous les artistes
  const analyzeAllArtistes = async () => {
    setLoading(true);
    setFixProgress('Analyse en cours...');

    try {
      const artistesRef = collection(db, 'artistes');
      const snapshot = await getDocs(artistesRef);
      
      const stats = {
        total: snapshot.size,
        withOrganizationId: 0,
        withoutOrganizationId: 0,
        withNom: 0,
        withoutNom: 0
      };
      
      const artistesByName = new Map();
      const artistesWithoutOrgIdList = [];
      const allArtistesAvecNom = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Vérifier organizationId
        if (data.organizationId) {
          stats.withOrganizationId++;
        } else {
          stats.withoutOrganizationId++;
          artistesWithoutOrgIdList.push({ id: doc.id, ...data });
        }
        
        // Vérifier nom
        if (data.nom) {
          stats.withNom++;
          
          // Ajouter à la liste complète
          allArtistesAvecNom.push({ id: doc.id, ...data });
          
          // Détecter les doublons
          const nomLower = data.nom.toLowerCase().trim();
          if (!artistesByName.has(nomLower)) {
            artistesByName.set(nomLower, []);
          }
          artistesByName.get(nomLower).push({ id: doc.id, ...data });
        } else {
          stats.withoutNom++;
        }
      });
      
      // Identifier les doublons
      const duplicatesList = [];
      artistesByName.forEach((artistes, nom) => {
        if (artistes.length > 1) {
          duplicatesList.push({ nom, artistes });
        }
      });
      
      // Trier la liste complète par nom
      const allArtistesTries = allArtistesAvecNom.sort((a, b) => 
        (a.nom || '').toLowerCase().localeCompare((b.nom || '').toLowerCase())
      );
      
      setArtistesWithoutOrgId(artistesWithoutOrgIdList);
      setDuplicates(duplicatesList);
      setAllArtistesNoms(allArtistesTries);
      setDebugInfo(stats);
      setFixProgress(null);
      
    } catch (error) {
      console.error('Erreur analyse:', error);
      setFixProgress(`Erreur: ${error.message}`);
    }
    
    setLoading(false);
  };

  // Corriger les organizationId manquants
  const fixOrganizationIds = async () => {
    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }
    
    if (artistesWithoutOrgId.length === 0) {
      alert('Aucun artiste à corriger');
      return;
    }
    
    const confirm = window.confirm(
      `Voulez-vous ajouter l'organizationId "${currentOrganization.id}" à ${artistesWithoutOrgId.length} artistes ?`
    );
    
    if (!confirm) return;
    
    setLoading(true);
    setFixProgress('Correction en cours...');
    
    try {
      let count = 0;
      const batchSize = 500; // Limite Firestore
      
      // Traiter par lots de 500
      for (let i = 0; i < artistesWithoutOrgId.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchArtistes = artistesWithoutOrgId.slice(i, i + batchSize);
        
        for (const artiste of batchArtistes) {
          const ref = doc(db, 'artistes', artiste.id);
          batch.update(ref, {
            organizationId: currentOrganization.id,
            updatedAt: new Date()
          });
          count++;
        }
        
        await batch.commit();
        setFixProgress(`${count}/${artistesWithoutOrgId.length} artistes corrigés...`);
      }
      setFixProgress(`✅ ${count} artistes corrigés avec succès !`);
      
      // Recharger l'analyse
      setTimeout(() => {
        analyzeAllArtistes();
      }, 2000);
      
    } catch (error) {
      console.error('Erreur correction:', error);
      setFixProgress(`❌ Erreur: ${error.message}`);
    }
    
    setLoading(false);
  };

  // Fusionner les doublons d'artistes
  const mergeDuplicates = async (duplicateGroup) => {
    const { nom, artistes } = duplicateGroup;
    
    // Trier pour trouver l'artiste principal (le plus ancien ou avec le plus de données)
    const sorted = [...artistes].sort((a, b) => {
      // Priorité à celui qui a une date de création
      const dateA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
      const dateB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
      return dateA - dateB;
    });
    
    const principal = sorted[0];
    const doublons = sorted.slice(1);
    
    const confirm = window.confirm(
      `Fusionner les ${artistes.length} occurrences de "${nom}" ?\n\n` +
      `Artiste principal : ${principal.id}\n` +
      `Doublons à supprimer : ${doublons.map(d => d.id).join(', ')}\n\n` +
      `⚠️ Cette action mettra à jour tous les concerts liés.`
    );
    
    if (!confirm) return;
    
    setMergeInProgress(true);
    setFixProgress(`Fusion de "${nom}" en cours...`);
    
    try {
      // 1. Trouver tous les concerts qui utilisent les doublons
      const concertsRef = collection(db, 'concerts');
      let concertsToUpdate = [];
      
      for (const doublon of doublons) {
        const q = query(concertsRef, where('artisteId', '==', doublon.id));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          concertsToUpdate.push({ id: doc.id, artisteId: doublon.id });
        });
      }
      
      setFixProgress(`Mise à jour de ${concertsToUpdate.length} concerts...`);
      
      // 2. Mettre à jour les concerts par batch
      const batchSize = 500;
      for (let i = 0; i < concertsToUpdate.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchConcerts = concertsToUpdate.slice(i, i + batchSize);
        
        for (const concert of batchConcerts) {
          const ref = doc(db, 'concerts', concert.id);
          batch.update(ref, {
            artisteId: principal.id,
            artisteNom: principal.nom,
            updatedAt: new Date()
          });
        }
        
        await batch.commit();
        setFixProgress(`${Math.min(i + batchSize, concertsToUpdate.length)}/${concertsToUpdate.length} concerts mis à jour...`);
      }
      
      // 3. Supprimer les doublons
      setFixProgress(`Suppression des doublons...`);
      for (const doublon of doublons) {
        await deleteDoc(doc(db, 'artistes', doublon.id));
      }
      
      setFixProgress(`✅ Fusion réussie ! ${doublons.length} doublons supprimés, ${concertsToUpdate.length} concerts mis à jour.`);
      
      // Recharger l'analyse après 2 secondes
      setTimeout(() => {
        analyzeAllArtistes();
      }, 2000);
      
    } catch (error) {
      console.error('Erreur fusion:', error);
      setFixProgress(`❌ Erreur lors de la fusion: ${error.message}`);
    }
    
    setMergeInProgress(false);
  };

  return (
    <Card className={styles.container}>
      <div className="card-header">
        <h3>🔍 Debug Recherche d'Artistes</h3>
      </div>

      <div className="card-body">
        {/* Info organisation */}
        <div className={`alert ${currentOrganization?.id ? 'alert-info' : 'alert-warning'} mb-3`}>
          <strong>Organisation actuelle :</strong> {currentOrganization?.name || 'Aucune'} 
          <br />
          <small className="text-muted">ID: {currentOrganization?.id || 'N/A'}</small>
          {!currentOrganization?.id && (
            <>
              <hr />
              <strong>⚠️ Attention :</strong> Aucune organisation sélectionnée. 
              La recherche d'artistes ne fonctionnera pas correctement car elle filtre par organisation.
              <br />
              <small>Assurez-vous d'être connecté avec une organisation active.</small>
            </>
          )}
        </div>

        {/* Recherche */}
        <div className="mb-4">
          <label className="form-label">Rechercher un artiste :</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                hookHandleSearch(e.target.value);
              }}
              placeholder="Tapez le nom de l'artiste..."
            />
            <Button 
              variant="primary" 
              onClick={searchDirectly}
              disabled={loading || !searchTerm}
            >
              Recherche directe
            </Button>
          </div>
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className="alert alert-warning mb-3">
            <h6>📊 Informations de debug :</h6>
            <ul className="mb-0">
              <li>Organisation ID : <code>{debugInfo.organizationId || 'AUCUNE'}</code></li>
              <li>Artistes avec cet orgId : <strong>{debugInfo.withOrgId || 0}</strong></li>
              <li>Total artistes (tous) : <strong>{debugInfo.totalArtistes || 0}</strong></li>
              <li>Correspondances avec orgId : <strong>{debugInfo.filteredWithOrgId || 0}</strong></li>
              <li>Correspondances totales : <strong>{debugInfo.filteredTotal || 0}</strong></li>
            </ul>
            {debugInfo.error && (
              <div className="text-danger mt-2">Erreur : {debugInfo.error}</div>
            )}
          </div>
        )}

        {/* Résultats du hook */}
        <div className="mb-4">
          <h5>Résultats via useEntitySearch ({hookResults.length}) :</h5>
          {hookSearching && <div className="text-muted">Recherche en cours...</div>}
          {hookResults.length === 0 && !hookSearching && hookSearchTerm && (
            <div className="alert alert-warning">
              Aucun résultat trouvé via le hook pour "{hookSearchTerm}"
            </div>
          )}
          <div className="list-group">
            {hookResults.map(artiste => {
              const analysis = analyzeArtiste(artiste);
              return (
                <div key={artiste.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{artiste.nom || 'Sans nom'}</h6>
                      <small className="text-muted">
                        ID: {artiste.id} | Style: {artiste.style || 'N/A'}
                      </small>
                    </div>
                    <div className="text-end">
                      {analysis.canBeFound ? (
                        <span className="badge bg-success">✓ Trouvable</span>
                      ) : (
                        <span className="badge bg-danger">✗ Non trouvable</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <small>
                      {analysis.hasOrgId ? '✓' : '✗'} OrganizationId présent
                      {analysis.hasOrgId && !analysis.orgIdMatch && ' (ne correspond pas)'}
                      <br />
                      {analysis.hasNom ? '✓' : '✗'} Nom présent
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Résultats directs */}
        {directResults.length > 0 && (
          <div>
            <h5>Résultats directs Firestore ({directResults.length}) :</h5>
            <div className="list-group">
              {directResults.map(artiste => {
                const analysis = analyzeArtiste(artiste);
                return (
                  <div key={artiste.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{artiste.nom || 'Sans nom'}</h6>
                        <small className="text-muted">
                          ID: {artiste.id} | OrgId: {artiste.organizationId || 'AUCUN'}
                        </small>
                      </div>
                      <div className="text-end">
                        {analysis.canBeFound ? (
                          <span className="badge bg-success">✓ Devrait être trouvé</span>
                        ) : (
                          <span className="badge bg-warning">⚠ Ne sera pas trouvé</span>
                        )}
                      </div>
                    </div>
                    {!analysis.canBeFound && (
                      <div className="mt-2 text-danger">
                        <small>
                          Raison : 
                          {!analysis.hasOrgId && 'Pas d\'organizationId. '}
                          {analysis.hasOrgId && !analysis.orgIdMatch && 'OrganizationId ne correspond pas. '}
                          {!analysis.hasNom && 'Pas de nom. '}
                        </small>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analyse complète */}
        <div className="mt-4">
          <h5>🔧 Outils de correction</h5>
          <div className="d-flex gap-2 mb-3">
            <Button 
              variant="info" 
              onClick={analyzeAllArtistes}
              disabled={loading}
            >
              <i className="bi bi-search me-2"></i>
              Analyser tous les artistes
            </Button>
            
            {artistesWithoutOrgId.length > 0 && (
              <Button 
                variant="warning" 
                onClick={fixOrganizationIds}
                disabled={loading}
              >
                <i className="bi bi-wrench me-2"></i>
                Corriger {artistesWithoutOrgId.length} artistes sans organization
              </Button>
            )}
          </div>

          {/* Progress */}
          {fixProgress && (
            <div className="alert alert-info">
              {fixProgress}
            </div>
          )}

          {/* Statistiques d'analyse */}
          {debugInfo?.total !== undefined && (
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">📊 Statistiques</h6>
                    <ul className="list-unstyled mb-0">
                      <li>Total artistes : <strong>{debugInfo.total}</strong></li>
                      <li className="text-success">
                        ✓ Avec organizationId : <strong>{debugInfo.withOrganizationId}</strong>
                      </li>
                      <li className="text-danger">
                        ✗ Sans organizationId : <strong>{debugInfo.withoutOrganizationId}</strong>
                      </li>
                      <li>Avec nom : <strong>{debugInfo.withNom}</strong></li>
                      <li>Sans nom : <strong>{debugInfo.withoutNom}</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">⚠️ Problèmes détectés</h6>
                    <ul className="list-unstyled mb-0">
                      <li>Doublons : <strong>{duplicates.length}</strong></li>
                      <li>À corriger : <strong>{artistesWithoutOrgId.length}</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tous les noms d'artistes */}
          {allArtistesNoms.length > 0 && (
            <div className="card mb-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">📋 Tous les noms d'artistes ({allArtistesNoms.length})</h6>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setShowAllNoms(!showAllNoms)}
                >
                  {showAllNoms ? 'Masquer' : 'Afficher'} la liste
                </Button>
              </div>
              {showAllNoms && (
                <div className="card-body" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  <div className="row">
                    {allArtistesNoms.map((artiste, index) => (
                      <div key={artiste.id} className="col-md-6 mb-2">
                        <div className="d-flex align-items-center p-2 border rounded">
                          <div className="flex-grow-1">
                            <strong>{artiste.nom}</strong>
                            <br />
                            <small className="text-muted">
                              ID: {artiste.id.slice(0, 8)}... 
                              {artiste.organizationId ? (
                                <span className="text-success ms-2">✓ Org</span>
                              ) : (
                                <span className="text-danger ms-2">✗ Sans Org</span>
                              )}
                              {artiste.style && (
                                <span className="text-info ms-2">• {artiste.style}</span>
                              )}
                            </small>
                          </div>
                          <small className="text-muted">#{index + 1}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Liste des artistes sans organizationId */}
          {artistesWithoutOrgId.length > 0 && (
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-0">Artistes sans organizationId ({artistesWithoutOrgId.length})</h6>
              </div>
              <div className="card-body" style={{ maxHeight: '200px', overflow: 'auto' }}>
                <div className="list-group list-group-flush">
                  {artistesWithoutOrgId.slice(0, 20).map(artiste => (
                    <div key={artiste.id} className="list-group-item">
                      <strong>{artiste.nom || 'Sans nom'}</strong>
                      <small className="text-muted ms-2">ID: {artiste.id}</small>
                    </div>
                  ))}
                  {artistesWithoutOrgId.length > 20 && (
                    <div className="list-group-item text-muted">
                      ... et {artistesWithoutOrgId.length - 20} autres
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Liste des doublons */}
          {duplicates.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Doublons détectés ({duplicates.length})</h6>
              </div>
              <div className="card-body" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {duplicates.map((duplicateGroup) => (
                  <div key={duplicateGroup.nom} className="mb-3 p-2 border rounded">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{duplicateGroup.nom}</strong> ({duplicateGroup.artistes.length} occurrences)
                        <ul className="small mb-0">
                          {duplicateGroup.artistes.map(artiste => (
                            <li key={artiste.id}>
                              ID: {artiste.id} 
                              {artiste.organizationId && <span className="text-success ms-2">✓ Org</span>}
                              {artiste.createdAt && <span className="text-muted ms-2">
                                (créé le {new Date(artiste.createdAt.seconds * 1000).toLocaleDateString()})
                              </span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => mergeDuplicates(duplicateGroup)}
                        disabled={mergeInProgress || loading}
                      >
                        <i className="bi bi-merge me-1"></i>
                        Fusionner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="alert alert-info mt-4">
          <h6>💡 Diagnostic :</h6>
          <p>Si la recherche ne fonctionne pas, cliquez sur "Analyser tous les artistes" puis corrigez les problèmes détectés.</p>
          <p className="mb-0">Les artistes doivent avoir :</p>
          <ol className="mb-0">
            <li>Un champ <code>organizationId</code> qui correspond à votre organisation actuelle</li>
            <li>Un champ <code>nom</code> correctement rempli</li>
            <li>Un champ <code>createdAt</code> pour le tri</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};

export default ArtisteSearchDebug;