import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Form } from 'react-bootstrap';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import { useTabs } from '@/context/TabsContext';
import styles from './DateCreationPage.module.css';

/**
 * Page de création d'une nouvelle date de concert
 */
function DateCreationPage({ params = {} }) {
  // Mode debug (à activer temporairement)
  const DEBUG_MODE = false;
  
  const { currentOrganization } = useOrganization();
  const { openConcertsListTab, openDateDetailsTab, getActiveTab, closeTab } = useTabs();
  
  // Récupérer les données pré-remplies depuis les paramètres de l'onglet
  const activeTab = getActiveTab();
  const prefilledData = activeTab?.params?.prefilledData || params.prefilledData || {};
  const [loading, setLoading] = useState(false);
  const [artistesData, setArtistesData] = useState([]);
  const [structuresData, setStructuresData] = useState([]);
  const [lieuxData, setLieuxData] = useState([]);
  const [artisteSearch, setArtisteSearch] = useState('');
  const [structureSearch, setStructureSearch] = useState(prefilledData.structureName || '');
  const [lieuSearch, setLieuSearch] = useState('');
  const [showArtisteDropdown, setShowArtisteDropdown] = useState(false);
  const [showStructureDropdown, setShowStructureDropdown] = useState(false);
  const [showLieuDropdown, setShowLieuDropdown] = useState(false);
  
  // Refs pour gérer les clics à l'extérieur
  const artisteDropdownRef = useRef(null);
  const structureDropdownRef = useRef(null);
  const lieuDropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    date: '',
    artisteId: '',
    artisteNom: '',
    projetNom: '',
    structureId: prefilledData.structureId || '',
    structureNom: prefilledData.structureName || '',
    libelle: '',
    lieuId: '',
    lieuNom: '',
    lieuVille: ''
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
      if (lieuDropdownRef.current && !lieuDropdownRef.current.contains(event.target)) {
        setShowLieuDropdown(false);
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
        where('organizationId', '==', currentOrganization.id)
      );
      const artistesSnapshot = await getDocs(qArtistes);
      
      // Charger les projets
      const qProjets = query(
        collection(db, 'projets'),
        where('organizationId', '==', currentOrganization.id)
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
        const artisteNom = artisteData.nom || artisteData.nomArtiste;
        
        // Ajouter les projets de la nouvelle collection
        const projetsFromCollection = projetsByArtiste[doc.id] || [];
        
        // Ajouter chaque projet de l'artiste comme une option séparée
        if (projetsFromCollection.length > 0) {
          projetsFromCollection.forEach(projet => {
            artistes.push({
              id: doc.id,
              nom: artisteNom,
              projet: projet.nom,
              projetId: projet.id,
              searchText: `${artisteNom} ${projet.nom}`.toLowerCase()
            });
          });
        }
        
        // Ajouter aussi les anciens projets (pour compatibilité)
        if (artisteData.projets && artisteData.projets.length > 0) {
          artisteData.projets.forEach(projet => {
            artistes.push({
              id: doc.id,
              nom: artisteNom,
              projet: projet.nom || projet.titre,
              projetId: projet.id,
              searchText: `${artisteNom} ${projet.nom || projet.titre}`.toLowerCase()
            });
          });
        }
        
        // Si aucun projet, ajouter l'artiste sans projet
        if (projetsFromCollection.length === 0 && (!artisteData.projets || artisteData.projets.length === 0)) {
          artistes.push({
            id: doc.id,
            nom: artisteNom,
            projet: '',
            projetId: null,
            searchText: (artisteNom || '').toLowerCase()
          });
        }
      });
      
      setArtistesData(artistes);
    } catch (error) {
      console.error('Erreur lors du chargement des artistes:', error);
    }
  }, [currentOrganization?.id]);

  const loadStructures = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'structures'),
        where('organizationId', '==', currentOrganization.id)
      );
      const querySnapshot = await getDocs(q);
      const structures = [];
      
      querySnapshot.forEach((doc) => {
        const structureData = { id: doc.id, ...doc.data() };
        structures.push({
          id: doc.id,
          nom: structureData.structureRaisonSociale || structureData.nom,
          searchText: (structureData.structureRaisonSociale || structureData.nom || '').toLowerCase()
        });
      });
      
      setStructuresData(structures);
    } catch (error) {
      console.error('Erreur lors du chargement des structures:', error);
    }
  }, [currentOrganization?.id]);

  const loadLieux = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'lieux'),
        where('organizationId', '==', currentOrganization.id)
      );
      const querySnapshot = await getDocs(q);
      const lieux = [];
      
      querySnapshot.forEach((doc) => {
        const lieuData = { id: doc.id, ...doc.data() };
        lieux.push({
          id: doc.id,
          nom: lieuData.nom,
          ville: lieuData.structureVille || lieuData.ville || '',
          searchText: `${lieuData.nom || ''} ${lieuData.structureVille || lieuData.ville || ''}`.toLowerCase()
        });
      });
      
      setLieuxData(lieux);
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
    }
  }, [currentOrganization?.id]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (currentOrganization?.id) {
      loadArtistes();
      loadStructures();
      loadLieux();
    }
  }, [currentOrganization, loadArtistes, loadLieux, loadStructures]);

  // Filtrer les résultats pour les dropdowns
  const filteredArtistes = artistesData.filter(artiste =>
    artiste.searchText.includes(artisteSearch.toLowerCase())
  );

  const filteredStructures = structuresData.filter(structure =>
    structure.searchText.includes(structureSearch.toLowerCase())
  );

  const filteredLieux = lieuxData.filter(lieu =>
    lieu.searchText.includes(lieuSearch.toLowerCase())
  );

  const handleArtisteSelect = (artiste) => {
    setFormData(prev => ({
      ...prev,
      artisteId: artiste.id,
      artisteNom: artiste.nom,
      projetNom: artiste.projet
    }));
    setArtisteSearch(`${artiste.nom} - ${artiste.projet}`);
    setShowArtisteDropdown(false);
  };

  const handleStructureSelect = (structure) => {
    setFormData(prev => ({
      ...prev,
      structureId: structure.id,
      structureNom: structure.nom
    }));
    setStructureSearch(structure.nom);
    setShowStructureDropdown(false);
  };

  const handleLieuSelect = (lieu) => {
    setFormData(prev => ({
      ...prev,
      lieuId: lieu.id,
      lieuNom: lieu.nom,
      lieuVille: lieu.ville
    }));
    setLieuSearch(`${lieu.nom}${lieu.ville ? ` - ${lieu.ville}` : ''}`);
    setShowLieuDropdown(false);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      artisteId: '',
      artisteNom: '',
      projetNom: '',
      structureId: prefilledData.structureId || '',
      structureNom: prefilledData.structureName || '',
      libelle: '',
      lieuId: '',
      lieuNom: '',
      lieuVille: ''
    });
    setArtisteSearch('');
    setStructureSearch(prefilledData.structureName || '');
    setLieuSearch('');
    setShowArtisteDropdown(false);
    setShowStructureDropdown(false);
    setShowLieuDropdown(false);
  };

  const handleSubmit = async (e, shouldContinue = false) => {
    e.preventDefault();
    
    if (!formData.date || !formData.artisteId || !formData.structureId) {
      alert('La date, l\'artiste-projet et la structure sont obligatoires');
      return;
    }

    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      // Créer le document date dans la collection concerts
      const dateData = {
        date: formData.date,
        artisteId: formData.artisteId,
        artisteNom: formData.artisteNom,
        projetNom: formData.projetNom,
        structureId: formData.structureId,
        structureNom: formData.structureNom,
        // Compatibilité avec l'ancien système (organisateur)
        organisateurId: formData.structureId,
        organisateurNom: formData.structureNom,
        libelle: formData.libelle,
        lieuId: formData.lieuId || null,
        lieuNom: formData.lieuNom || '',
        lieuVille: formData.lieuVille || '',
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statut: 'En cours' // Statut par défaut
      };

      console.log('🔍 DEBUG - Sauvegarde de la date:', dateData);
      
      const docRef = await addDoc(collection(db, 'concerts'), dateData);
      
      console.log('✅ Date créée avec succès! ID:', docRef.id);
      
      // Afficher un message de succès
      alert('Date créée avec succès !');

      if (shouldContinue) {
        // Ouvrir la fiche détaillée de la date créée
        const dateTitle = formData.artisteNom 
          ? `${formData.artisteNom} - ${new Date(formData.date).toLocaleDateString('fr-FR')}`
          : 'Détails de la date';
        openDateDetailsTab(docRef.id, dateTitle);
      } else {
        // Ouvrir l'onglet des concerts pour voir la nouvelle date
        openConcertsListTab();
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
        <h1 className={styles.pageTitle}>
          <i className="bi bi-calendar-plus me-3"></i>
          Nouvelle Date de Concert
        </h1>
        <p className={styles.pageSubtitle}>
          Créez une nouvelle date en associant un artiste/projet avec un organisateur
        </p>
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
                      {i+1}. {a.nom} {a.projet ? `- ${a.projet}` : ''}
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
                      {i+1}. {a.nom} {a.projet ? `- ${a.projet}` : ''}
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
            
            {currentOrganization && (
              <div>
                <strong>Organization:</strong><br/>
                ID: {currentOrganization.id}<br/>
                Nom: {currentOrganization.name}
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
                          <strong>{artiste.nom}</strong>
                          {artiste.projet && <span className={styles.projet}> - {artiste.projet}</span>}
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
                  {showStructureDropdown && filteredStructures.length > 0 && (
                    <div className={styles.dropdown}>
                      {filteredStructures.slice(0, 10).map((structure) => (
                        <div
                          key={structure.id}
                          className={styles.dropdownItem}
                          onClick={() => handleStructureSelect(structure)}
                        >
                          {structure.nom}
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>

                {/* Lieu */}
                <Form.Group className="mb-4" ref={lieuDropdownRef} style={{ position: 'relative' }}>
                  <Form.Label className={styles.label}>
                    <i className="bi bi-geo-alt me-2"></i>
                    Lieu (optionnel)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher un lieu..."
                    value={lieuSearch}
                    onChange={(e) => {
                      setLieuSearch(e.target.value);
                      setShowLieuDropdown(true);
                    }}
                    onFocus={() => setShowLieuDropdown(true)}
                    className={styles.input}
                  />
                  {showLieuDropdown && filteredLieux.length > 0 && (
                    <div className={styles.dropdown}>
                      {filteredLieux.slice(0, 10).map((lieu) => (
                        <div
                          key={lieu.id}
                          className={styles.dropdownItem}
                          onClick={() => handleLieuSelect(lieu)}
                        >
                          <strong>{lieu.nom}</strong>
                          {lieu.ville && <span className={styles.ville}> - {lieu.ville}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>

                {/* Libellé */}
                <Form.Group className="mb-4">
                  <Form.Label className={styles.label}>
                    <i className="bi bi-tag me-2"></i>
                    Libellé (optionnel)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ex: Concert de lancement, Festival d'été..."
                    value={formData.libelle}
                    onChange={(e) => setFormData(prev => ({ ...prev, libelle: e.target.value }))}
                    className={styles.input}
                  />
                  <Form.Text className="text-muted">
                    Un libellé descriptif pour cette date
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
  lieuId: formData.lieuId || null,
  lieuNom: formData.lieuNom || '',
  lieuVille: formData.lieuVille || '',
  organizationId: currentOrganization?.id,
  statut: 'En cours'
}, null, 2)}
                    </pre>
                    <small className="text-muted">Ces données seront envoyées à la collection "concerts"</small>
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
                      type="submit"
                      variant="outline-primary"
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
                      type="button"
                      variant="primary"
                      onClick={(e) => handleSubmit(e, true)}
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