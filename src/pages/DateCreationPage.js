import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Form } from 'react-bootstrap';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useEntreprise } from '@/context/EntrepriseContext';
import { useAuth } from '@/context/AuthContext';
import { useTabs } from '@/context/TabsContext';
import { toast } from 'react-toastify';
import styles from './DateCreationPage.module.css';

// Import conditionnel du bouton de test - DÉSACTIVÉ
// Le test de workflow est maintenant dans Debug Tools
// let TestWorkflowButton = null;
// if (process.env.NODE_ENV === 'development') {
//   TestWorkflowButton = require('@/components/debug/TestWorkflowButton2').default;
// }

/**
 * Page de création d'une nouvelle date
 */
function DateCreationPage({ params = {} }) {
  // Mode debug (à activer temporairement)
  const DEBUG_MODE = false;
  
  const { currentEntreprise } = useEntreprise();
  const { currentUser } = useAuth();
  const { openDatesListTab, openDateDetailsTab, getActiveTab, closeTab } = useTabs();
  
  // Récupérer les données pré-remplies depuis les paramètres de l'onglet
  const activeTab = getActiveTab();
  const prefilledData = activeTab?.params?.prefilledData || params.prefilledData || {};
  const [loading, setLoading] = useState(false);
  const [artistesData, setArtistesData] = useState([]);
  const [structuresData, setStructuresData] = useState([]);
  const [artisteSearch, setArtisteSearch] = useState('');
  const [structureSearch, setStructureSearch] = useState(prefilledData.structureName || '');
  const [showArtisteDropdown, setShowArtisteDropdown] = useState(false);
  const [showStructureDropdown, setShowStructureDropdown] = useState(false);
  
  // Refs pour gérer les clics à l'extérieur
  const artisteDropdownRef = useRef(null);
  const structureDropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    date: '',
    artisteId: '',
    artisteNom: '',
    projetNom: '',
    structureId: prefilledData.structureId || '',
    structureNom: prefilledData.structureName || '',
    libelle: ''
  });

  // Gérer les clics à l'extérieur des dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (artisteDropdownRef.current && !artisteDropdownRef.current.contains(event.target)) {
        if (DEBUG_MODE) console.log('🔍 DEBUG: Click outside artiste dropdown detected');
        setShowArtisteDropdown(false);
      }
      if (structureDropdownRef.current && !structureDropdownRef.current.contains(event.target)) {
        setShowStructureDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [DEBUG_MODE]);

  const loadArtistes = useCallback(async () => {
    try {
      // Charger les artistes
      const qArtistes = query(
        collection(db, 'artistes'),
        where('entrepriseId', '==', currentEntreprise.id)
      );
      const artistesSnapshot = await getDocs(qArtistes);
      
      // Charger les projets
      const qProjets = query(
        collection(db, 'projets'),
        where('entrepriseId', '==', currentEntreprise.id)
      );
      const projetsSnapshot = await getDocs(qProjets);
      
      // Créer un map des projets par artiste
      const projetsByArtiste = {};
      projetsSnapshot.forEach((doc) => {
        const projetData = { id: doc.id, ...doc.data() };
        if (projetData.artistesSelectionnes && projetData.artistesSelectionnes.length > 0) {
          projetData.artistesSelectionnes.forEach(artisteId => {
            if (!projetsByArtiste[artisteId]) {
              projetsByArtiste[artisteId] = [];
            }
            projetsByArtiste[artisteId].push({
              id: doc.id,
              nom: projetData.intitule || 'Sans nom'
            });
          });
        }
      });
      
      const artistes = [];
      
      artistesSnapshot.forEach((doc) => {
        const artisteData = { id: doc.id, ...doc.data() };
        const artisteNom = artisteData.artisteNom || artisteData.nomArtiste || artisteData.nom;
        
        // Ajouter les projets de la nouvelle collection
        const projetsFromCollection = projetsByArtiste[doc.id] || [];
        
        // Ajouter chaque projet de l'artiste comme une option séparée
        if (projetsFromCollection.length > 0) {
          projetsFromCollection.forEach(projet => {
            const projetNom = projet.projetNom || projet.nom || projet.titre;
            artistes.push({
              id: doc.id,
              artisteNom: artisteNom,  // Variable standardisée
              projetNom: projetNom,    // Variable standardisée
              projetId: projet.id,
              searchText: `${artisteNom} ${projetNom}`.toLowerCase()
            });
          });
        }
        
        // Ajouter aussi les anciens projets (pour compatibilité)
        if (artisteData.projets && artisteData.projets.length > 0) {
          artisteData.projets.forEach(projet => {
            const projetNom = projet.projetNom || projet.nom || projet.titre;
            artistes.push({
              id: doc.id,
              artisteNom: artisteNom,  // Variable standardisée
              projetNom: projetNom,    // Variable standardisée
              projetId: projet.id,
              searchText: `${artisteNom} ${projetNom}`.toLowerCase()
            });
          });
        }
        
        // Si aucun projet, ajouter l'artiste sans projet
        if (projetsFromCollection.length === 0 && (!artisteData.projets || artisteData.projets.length === 0)) {
          artistes.push({
            id: doc.id,
            artisteNom: artisteNom,  // Variable standardisée
            projetNom: '',          // Variable standardisée
            projetId: null,
            searchText: (artisteNom || '').toLowerCase()
          });
        }
      });
      
      setArtistesData(artistes);
    } catch (error) {
      console.error('Erreur lors du chargement des artistes:', error);
    }
  }, [currentEntreprise?.id]);

  const loadStructures = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'structures'),
        where('entrepriseId', '==', currentEntreprise.id)
      );
      const querySnapshot = await getDocs(q);
      const structures = [];
      
      querySnapshot.forEach((doc) => {
        const structureData = { id: doc.id, ...doc.data() };
        
        // Debug : afficher les champs disponibles pour chaque structure
        console.log('[DateCreationPage] Structure chargée:', {
          id: doc.id,
          data: structureData,
          nomFinal: structureData.raisonSociale || structureData.nom || structureData.structureRaisonSociale || 'Structure sans nom'
        });
        
        // Chercher le nom dans différents champs possibles
        // raisonSociale est le champ principal dans Firebase
        const nomStructure = structureData.raisonSociale || 
                           structureData.nom || 
                           structureData.structureRaisonSociale || 
                           'Structure sans nom';
        
        structures.push({
          id: doc.id,
          structureNom: nomStructure,  // Variable standardisée
          raisonSociale: structureData.raisonSociale,  // Garder pour compatibilité
          searchText: nomStructure.toLowerCase()
        });
      });
      
      setStructuresData(structures);
      console.log(`[DateCreationPage] ${structures.length} structures chargées`);
      if (structures.length > 0) {
        console.log('[DateCreationPage] Échantillon des structures chargées:', 
          structures.slice(0, 3).map(s => ({ id: s.id, structureNom: s.structureNom }))
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement des structures:', error);
    }
  }, [currentEntreprise?.id]);


  // Charger les données au montage du composant
  useEffect(() => {
    if (currentEntreprise?.id) {
      loadArtistes();
      loadStructures();
    }
  }, [currentEntreprise, loadArtistes, loadStructures]);

  // Filtrer les résultats pour les dropdowns
  const filteredArtistes = artistesData.filter(artiste =>
    artiste.searchText.includes(artisteSearch.toLowerCase())
  );

  const filteredStructures = structuresData.filter(structure =>
    structure.searchText.includes(structureSearch.toLowerCase())
  );

  const handleArtisteSelect = (artiste) => {
    setFormData(prev => ({
      ...prev,
      artisteId: artiste.id,
      artisteNom: artiste.artisteNom,  // Utiliser la variable standardisée
      projetNom: artiste.projetNom      // Utiliser la variable standardisée
    }));
    setArtisteSearch(`${artiste.artisteNom} - ${artiste.projetNom}`);
    setShowArtisteDropdown(false);
  };

  const handleStructureSelect = (structure) => {
    setFormData(prev => ({
      ...prev,
      structureId: structure.id,
      structureNom: structure.structureNom // Utiliser la variable standardisée
    }));
    setStructureSearch(structure.structureNom);
    setShowStructureDropdown(false);
  };

  /**
   * Gère la création d'un workflow complet de test
   */
  const handleTestWorkflow = async (workflowData) => {
    if (workflowData) {
      // Le workflow a créé toutes les données, on peut fermer cette page
      toast.info('📋 Workflow de test créé ! Vous pouvez accéder au formulaire via le lien dans la notification.');
      
      // Attendre un peu pour que l'événement de rafraîchissement soit traité
      setTimeout(() => {
        // Ouvrir la liste des dates pour voir la nouvelle date
        openDatesListTab();
        
        // Fermer l'onglet actuel
        const currentTab = getActiveTab();
        if (currentTab) {
          closeTab(currentTab.id);
        }
      }, 100); // 100ms devrait suffire
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      artisteId: '',
      artisteNom: '',
      projetNom: '',
      structureId: prefilledData.structureId || '',
      structureNom: prefilledData.structureName || '',
      libelle: ''
    });
    setArtisteSearch('');
    setStructureSearch(prefilledData.structureName || '');
    setShowArtisteDropdown(false);
    setShowStructureDropdown(false);
  };

  const handleSubmit = async (e, shouldContinue = false) => {
    e.preventDefault();
    
    if (!formData.date || !formData.artisteId || !formData.structureId) {
      alert('La date, l\'artiste-projet et la structure sont obligatoires');
      return;
    }

    if (!currentEntreprise?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      // Créer le document date dans la collection dates
      // REFACTORISATION : on ne stocke plus structureNom, seulement structureId
      const dateData = {
        // Données principales
        date: formData.date,
        artisteId: formData.artisteId,
        artisteNom: formData.artisteNom,
        projetNom: formData.projetNom,
        structureId: formData.structureId,      // On garde uniquement l'ID !
        // structureNom supprimé - sera chargé dynamiquement
        libelle: formData.libelle,
        montant: 0, // À définir plus tard
        statut: 'En cours',
        
        // Métadonnées
        priseOption: new Date().toISOString().split('T')[0],
        entrepriseId: currentEntreprise.id,
        // Métadonnées en français
        creePar: currentUser?.uid || null,
        creeParNom: currentUser?.displayName || currentUser?.email || null,
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp()
      };

      console.log('🔍 DEBUG - Sauvegarde de la date:', dateData);
      
      const docRef = await addDoc(collection(db, 'dates'), dateData);
      
      console.log('✅ Date créée avec succès! ID:', docRef.id);
      
      // Émettre un événement pour forcer le rafraîchissement des listes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dateCreated', { 
          detail: { dateId: docRef.id } 
        }));
      }
      
      // Afficher un message de succès
      alert('Date créée avec succès !');

      if (shouldContinue) {
        // Ouvrir la fiche détaillée de la date créée
        const dateTitle = formData.artisteNom 
          ? `${formData.artisteNom} - ${new Date(formData.date).toLocaleDateString('fr-FR')}`
          : 'Détails de la date';
        openDateDetailsTab(docRef.id, dateTitle);
      } else {
        // Ouvrir l'onglet des dates pour voir la nouvelle date
        openDatesListTab();
      }
      
      // Fermer l'onglet actuel
      const currentTab = getActiveTab();
      if (currentTab) {
        closeTab(currentTab.id);
      }

    } catch (error) {
      console.error('Erreur lors de la création de la date:', error);
      alert('Erreur lors de la création de la date');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className={styles.pageTitle}>
              <i className="bi bi-calendar-plus me-3"></i>
              Nouvelle Date
            </h1>
            <p className={styles.pageSubtitle}>
              Créez une nouvelle date en associant un artiste/projet avec un organisateur
            </p>
          </div>
        </div>
      </div>
      
      {/* PANNEAU DE DEBUG */}
      {DEBUG_MODE && (
        <div style={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          width: 300, 
          background: 'white', 
          border: '2px solid #007bff',
          borderRadius: '8px',
          padding: '15px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          zIndex: 9999,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h5 style={{ marginBottom: '10px', color: '#007bff' }}>🔍 Debug Recherche Artiste</h5>
          
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>États:</strong><br/>
              - artisteSearch: "{artisteSearch}"<br/>
              - showArtisteDropdown: {showArtisteDropdown ? '✅' : '❌'}<br/>
              - artistesData.length: {artistesData.length}<br/>
              - filteredArtistes.length: {filteredArtistes.length}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Artistes chargés:</strong><br/>
              {artistesData.length === 0 ? (
                <span style={{ color: 'red' }}>❌ Aucun artiste chargé!</span>
              ) : (
                <>
                  {artistesData.slice(0, 3).map((a, i) => (
                    <div key={i} style={{ fontSize: '11px' }}>
                      {i+1}. {a.artisteNom} {a.projetNom ? `- ${a.projetNom}` : ''}
                    </div>
                  ))}
                  {artistesData.length > 3 && <div>... et {artistesData.length - 3} autres</div>}
                </>
              )}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Résultats filtrés:</strong><br/>
              {filteredArtistes.length === 0 ? (
                <span style={{ color: 'orange' }}>⚠️ Aucun résultat pour "{artisteSearch}"</span>
              ) : (
                <>
                  {filteredArtistes.slice(0, 3).map((a, i) => (
                    <div key={i} style={{ fontSize: '11px' }}>
                      {i+1}. {a.artisteNom} {a.projetNom ? `- ${a.projetNom}` : ''}
                    </div>
                  ))}
                  {filteredArtistes.length > 3 && <div>... et {filteredArtistes.length - 3} autres</div>}
                </>
              )}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Condition dropdown:</strong><br/>
              showArtisteDropdown: {showArtisteDropdown ? '✅' : '❌'}<br/>
              filteredArtistes.length > 0: {filteredArtistes.length > 0 ? '✅' : '❌'}<br/>
              <strong>Dropdown visible: {showArtisteDropdown && filteredArtistes.length > 0 ? '✅ OUI' : '❌ NON'}</strong>
            </div>
            
            {currentEntreprise && (
              <div>
                <strong>Organization:</strong><br/>
                ID: {currentEntreprise.id}<br/>
                Nom: {currentEntreprise.name}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('artistesData:', artistesData);
              console.log('filteredArtistes:', filteredArtistes);
              console.log('showArtisteDropdown:', showArtisteDropdown);
              console.log('artisteSearch:', artisteSearch);
            }}
            style={{ 
              marginTop: '10px', 
              padding: '5px 10px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📋 Log dans la console
          </button>
        </div>
      )}
      
      <div className={styles.formContainer}>
        <div className={styles.formCard}>
            <div className={styles.formBody}>
              <Form onSubmit={handleSubmit}>
                {/* Date */}
                <Form.Group className="mb-4">
                  <Form.Label className={styles.label}>
                    <i className="bi bi-calendar me-2"></i>
                    Date *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className={styles.input}
                  />
                </Form.Group>

                {/* Artiste - Projet */}
                <Form.Group className="mb-4" ref={artisteDropdownRef} style={{ position: 'relative' }}>
                  <Form.Label className={styles.label}>
                    <i className="bi bi-music-note-beamed me-2"></i>
                    Artiste - Projet *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un artiste et son projet..."
                    value={artisteSearch}
                    onChange={(e) => {
                      setArtisteSearch(e.target.value);
                      setShowArtisteDropdown(true);
                      if (DEBUG_MODE) console.log('🔍 DEBUG: onChange - dropdown should show');
                    }}
                    onFocus={() => {
                      setShowArtisteDropdown(true);
                      if (DEBUG_MODE) console.log('🔍 DEBUG: onFocus - dropdown should show');
                    }}
                    className={styles.input}
                  />
                  {showArtisteDropdown && filteredArtistes.length > 0 && (
                    <div className={styles.dropdown}>
                      {filteredArtistes.slice(0, 10).map((artiste, index) => (
                        <div
                          key={`${artiste.id}-${artiste.projetId || 'no-project'}`}
                          className={styles.dropdownItem}
                          onClick={() => handleArtisteSelect(artiste)}
                        >
                          <strong>{artiste.artisteNom}</strong>
                          {artiste.projetNom && <span className={styles.projet}> - {artiste.projetNom}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>

                {/* Structure organisatrice */}
                <Form.Group className="mb-4" ref={structureDropdownRef} style={{ position: 'relative' }}>
                  <Form.Label className={styles.label}>
                    <i className="bi bi-building me-2"></i>
                    Structure organisatrice *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher une structure organisatrice..."
                    value={structureSearch}
                    onChange={(e) => {
                      setStructureSearch(e.target.value);
                      setShowStructureDropdown(true);
                    }}
                    onFocus={() => setShowStructureDropdown(true)}
                    className={styles.input}
                  />
                  {showStructureDropdown && (
                    <div className={styles.dropdown}>
                      {console.log('[DateCreationPage] Affichage dropdown structures:', filteredStructures.length)}
                      {filteredStructures.length > 0 ? (
                        filteredStructures.slice(0, 10).map((structure) => (
                          <div
                            key={structure.id}
                            className={styles.dropdownItem}
                            onClick={() => handleStructureSelect(structure)}
                          >
                            {structure.structureNom || 'Structure sans nom'}
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownItem} style={{ color: '#6c757d', fontStyle: 'italic' }}>
                          Aucune structure trouvée
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>

                {/* Lieu/Libellé */}
                <Form.Group className="mb-4">
                  <Form.Label className={styles.label}>
                    <i className="bi bi-geo-alt me-2"></i>
                    Lieu/Libellé
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Salle, festival ou description de l'événement"
                    value={formData.libelle}
                    onChange={(e) => setFormData(prev => ({ ...prev, libelle: e.target.value }))}
                    className={styles.input}
                  />
                  <Form.Text className="text-muted">
                    Indiquez la salle, le festival ou une description de l'événement
                  </Form.Text>
                </Form.Group>

                {/* Debug - Données qui seront sauvegardées */}
                {false && ( // Changez false en true pour activer
                  <div className="alert alert-info mb-4">
                    <h6>🔍 Debug - Données à sauvegarder:</h6>
                    <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
{JSON.stringify({
  date: formData.date,
  artisteId: formData.artisteId,
  artisteNom: formData.artisteNom,
  projetNom: formData.projetNom,
  structureId: formData.structureId,
  structureNom: formData.structureNom,
  libelle: formData.libelle,
  entrepriseId: currentEntreprise?.id,
  statut: 'En cours'
}, null, 2)}
                    </pre>
                    <small className="text-muted">Ces données seront envoyées à la collection "dates"</small>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className={styles.actions}>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={resetForm}
                    disabled={loading}
                    className="me-3"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Réinitialiser
                  </Button>
                  
                  <div className={styles.submitButtons}>
                    <Button
                      type="button"
                      variant="outline-primary"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={loading}
                      className="me-2"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Création...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          Créer la Date
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Création...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-right me-2"></i>
                          Continuer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
        </div>
      </div>
    </div>
  );
}

export default DateCreationPage;