import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase-service';
import { useOrganization } from '@/context/OrganizationContext';
import styles from './DateCreationModal.module.css';

/**
 * Modal de création d'une nouvelle date de concert
 */
function DateCreationModal({ show, onHide, onCreated, prefilledData = {} }) {
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [artistesData, setArtistesData] = useState([]);
  const [structuresData, setStructuresData] = useState([]);
  const [lieuxData, setLieuxData] = useState([]);
  const [artisteSearch, setArtisteSearch] = useState('');
  const [organisateurSearch, setOrganisateurSearch] = useState(prefilledData.structureName || '');
  const [lieuSearch, setLieuSearch] = useState('');
  const [showArtisteDropdown, setShowArtisteDropdown] = useState(false);
  const [showOrganisateurDropdown, setShowOrganisateurDropdown] = useState(false);
  const [showLieuDropdown, setShowLieuDropdown] = useState(false);
  
  // Refs pour gérer les clics à l'extérieur
  const artisteDropdownRef = useRef(null);
  const organisateurDropdownRef = useRef(null);
  const lieuDropdownRef = useRef(null);
  
  const [formData, setFormData] = useState({
    date: '',
    artisteId: '',
    artisteNom: '',
    projetNom: '',
    organisateurId: prefilledData.structureId || '',
    organisateurNom: prefilledData.structureName || '',
    libelle: '',
    lieuId: '',
    lieuNom: '',
    lieuVille: ''
  });

  // Charger les données au montage du composant
  useEffect(() => {
    if (show && currentOrganization?.id) {
      loadArtistes();
      loadStructures();
      loadLieux();
    }
  }, [show, currentOrganization, loadArtistes, loadLieux, loadStructures]);

  // Gérer les clics à l'extérieur des dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (artisteDropdownRef.current && !artisteDropdownRef.current.contains(event.target)) {
        setShowArtisteDropdown(false);
      }
      if (organisateurDropdownRef.current && !organisateurDropdownRef.current.contains(event.target)) {
        setShowOrganisateurDropdown(false);
      }
      if (lieuDropdownRef.current && !lieuDropdownRef.current.contains(event.target)) {
        setShowLieuDropdown(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);


  const loadArtistes = async () => {
    try {
      const q = query(
        collection(db, 'artistes'),
        where('organizationId', '==', currentOrganization.id)
      );
      const querySnapshot = await getDocs(q);
      const artistes = [];
      
      querySnapshot.forEach((doc) => {
        const artisteData = { id: doc.id, ...doc.data() };
        
        console.log('🎨 Artiste chargé:', artisteData.nom);
        console.log('📁 Format projets (array):', artisteData.projets);
        console.log('📁 Format projet (objet):', artisteData.projet);
        
        // Gérer les deux formats : projets (array) et projet (objet)
        if (artisteData.projets && artisteData.projets.length > 0) {
          // Nouveau format : array de projets
          artisteData.projets.forEach(projet => {
            artistes.push({
              id: doc.id,
              nom: artisteData.nom || artisteData.nomArtiste,
              projet: projet.nom || projet.titre,
              projetId: projet.id,
              searchText: `${artisteData.nom || artisteData.nomArtiste} ${projet.nom || projet.titre}`.toLowerCase()
            });
          });
        } else if (artisteData.projet && artisteData.projet.nom) {
          // Ancien format : objet projet unique
          artistes.push({
            id: doc.id,
            nom: artisteData.nom || artisteData.nomArtiste,
            projet: artisteData.projet.nom,
            projetId: null,
            searchText: `${artisteData.nom || artisteData.nomArtiste} ${artisteData.projet.nom}`.toLowerCase()
          });
        } else {
          // Si pas de projets, ajouter l'artiste sans projet
          artistes.push({
            id: doc.id,
            nom: artisteData.nom || artisteData.nomArtiste,
            projet: '',
            projetId: null,
            searchText: (artisteData.nom || artisteData.nomArtiste).toLowerCase()
          });
        }
      });
      
      setArtistesData(artistes);
    } catch (error) {
      console.error('Erreur lors du chargement des artistes:', error);
    }
  };

  const loadStructures = async () => {
    try {
      const q = query(
        collection(db, 'contacts'),
        where('organizationId', '==', currentOrganization.id),
        where('type', '==', 'structure')
      );
      const querySnapshot = await getDocs(q);
      const structures = [];
      
      querySnapshot.forEach((doc) => {
        const structureData = { id: doc.id, ...doc.data() };
        structures.push({
          id: doc.id,
          nom: structureData.structureRaisonSociale || structureData.nom,
          ville: structureData.structureVille || structureData.ville || '',
          searchText: `${structureData.structureRaisonSociale || structureData.nom} ${structureData.structureVille || ''}`.toLowerCase()
        });
      });
      
      setStructuresData(structures);
    } catch (error) {
      console.error('Erreur lors du chargement des structures:', error);
    }
  };

  const loadLieux = async () => {
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
          nom: lieuData.nom || lieuData.nomLieu,
          ville: lieuData.ville || lieuData.adresseVille || '',
          searchText: `${lieuData.nom || lieuData.nomLieu} ${lieuData.ville || lieuData.adresseVille || ''}`.toLowerCase()
        });
      });
      
      setLieuxData(lieux);
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filtrer les artistes selon la recherche
  const filteredArtistes = artistesData.filter(artiste =>
    artiste.searchText.includes(artisteSearch.toLowerCase())
  );

  // Filtrer les structures selon la recherche
  const filteredStructures = structuresData.filter(structure =>
    structure.searchText.includes(organisateurSearch.toLowerCase())
  );

  // Filtrer les lieux selon la recherche
  const filteredLieux = lieuxData.filter(lieu =>
    lieu.searchText.includes(lieuSearch.toLowerCase())
  );

  const handleArtisteSelect = (artiste) => {
    console.log('🎭 Sélection artiste:', artiste.nom);
    console.log('🎯 Projet associé:', artiste.projet || 'AUCUN');
    
    setFormData(prev => ({
      ...prev,
      artisteId: artiste.id,
      artisteNom: artiste.nom,
      projetNom: artiste.projet
    }));
    setArtisteSearch(artiste.projet ? `${artiste.nom} - ${artiste.projet}` : artiste.nom);
    setShowArtisteDropdown(false);
  };

  const handleOrganisateurSelect = (structure) => {
    setFormData(prev => ({
      ...prev,
      organisateurId: structure.id,
      organisateurNom: structure.nom
    }));
    setOrganisateurSearch(structure.nom);
    setShowOrganisateurDropdown(false);
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
      organisateurId: prefilledData.structureId || '',
      organisateurNom: prefilledData.structureName || '',
      libelle: '',
      lieuId: '',
      lieuNom: '',
      lieuVille: ''
    });
    setArtisteSearch('');
    setOrganisateurSearch(prefilledData.structureName || '');
    setLieuSearch('');
    setShowArtisteDropdown(false);
    setShowOrganisateurDropdown(false);
    setShowLieuDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.artisteId || !formData.organisateurId) {
      alert('La date, l\'artiste-projet et l\'organisateur sont obligatoires');
      return;
    }

    if (!currentOrganization?.id) {
      alert('Aucune organisation sélectionnée');
      return;
    }

    setLoading(true);

    try {
      console.log('=== Création de date/concert ===');
      console.log('🎭 Artiste sélectionné:', formData.artisteNom || 'AUCUN');
      console.log('🎯 Projet sélectionné:', formData.projetNom || 'AUCUN');
      console.log('🏛️ Structure organisatrice:', formData.organisateurNom || 'AUCUNE');
      
      // Créer le document date dans la collection concerts
      const dateData = {
        date: formData.date,
        artisteId: formData.artisteId,
        artisteNom: formData.artisteNom,
        projetNom: formData.projetNom,
        organisateurId: formData.organisateurId,
        organisateurNom: formData.organisateurNom,
        libelle: formData.libelle,
        lieuId: formData.lieuId || null,
        lieuNom: formData.lieuNom || '',
        lieuVille: formData.lieuVille || '',
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statut: 'En cours' // Statut par défaut
      };
      
      console.log('💾 Données à sauvegarder:', dateData);

      const docRef = await addDoc(collection(db, 'concerts'), dateData);
      
      console.log('✅ Date créée avec succès - ID:', docRef.id);
      console.log('🎯 Projet stocké dans la date:', dateData.projetNom || 'AUCUN');
      console.log('==============================');
      
      // Callback pour notifier la création
      if (onCreated) {
        onCreated({
          id: docRef.id,
          ...dateData
        });
      }

      // Réinitialiser le formulaire
      resetForm();

      // Fermer la modal
      onHide();

    } catch (error) {
      console.error('Erreur lors de la création de la date:', error);
      alert('Erreur lors de la création de la date');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-calendar-plus me-2"></i>
          Nouvelle Date
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            {/* Date */}
            <div className="col-md-6 mb-3">
              <Form.Label>Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            {/* Libellé */}
            <div className="col-md-6 mb-3">
              <Form.Label>Libellé</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom ou description de l'événement"
                value={formData.libelle}
                onChange={(e) => handleInputChange('libelle', e.target.value)}
              />
            </div>

            {/* Artiste - Projet */}
            <div className="col-12 mb-3">
              <Form.Label>Artiste - Projet *</Form.Label>
              <div className={styles.dropdownContainer} ref={artisteDropdownRef}>
                <Form.Control
                  type="text"
                  placeholder="Tapez pour rechercher un artiste et son projet..."
                  value={artisteSearch}
                  onChange={(e) => {
                    setArtisteSearch(e.target.value);
                    setShowArtisteDropdown(true);
                  }}
                  onFocus={() => setShowArtisteDropdown(true)}
                />
                {showArtisteDropdown && filteredArtistes.length > 0 && (
                  <div className={styles.dropdown}>
                    {filteredArtistes.slice(0, 10).map((artiste, index) => (
                      <div
                        key={`${artiste.id}-${artiste.projetId || index}`}
                        className={styles.dropdownItem}
                        onClick={() => handleArtisteSelect(artiste)}
                      >
                        <strong>{artiste.nom}</strong>{artiste.projet && ` - ${artiste.projet}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Organisateur */}
            <div className="col-12 mb-3">
              <Form.Label>Organisateur *</Form.Label>
              <div className={styles.dropdownContainer} ref={organisateurDropdownRef}>
                <Form.Control
                  type="text"
                  placeholder="Tapez pour rechercher une structure organisatrice..."
                  value={organisateurSearch}
                  onChange={(e) => {
                    setOrganisateurSearch(e.target.value);
                    setShowOrganisateurDropdown(true);
                  }}
                  onFocus={() => setShowOrganisateurDropdown(true)}
                />
                {showOrganisateurDropdown && filteredStructures.length > 0 && (
                  <div className={styles.dropdown}>
                    {filteredStructures.slice(0, 10).map((structure) => (
                      <div
                        key={structure.id}
                        className={styles.dropdownItem}
                        onClick={() => handleOrganisateurSelect(structure)}
                      >
                        <strong>{structure.nom}</strong>
                        {structure.ville && <span className="text-muted ms-2">({structure.ville})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lieu */}
            <div className="col-12 mb-3">
              <Form.Label>Lieu</Form.Label>
              <div className={styles.dropdownContainer} ref={lieuDropdownRef}>
                <Form.Control
                  type="text"
                  placeholder="Tapez pour rechercher un lieu..."
                  value={lieuSearch}
                  onChange={(e) => {
                    setLieuSearch(e.target.value);
                    setShowLieuDropdown(true);
                  }}
                  onFocus={() => setShowLieuDropdown(true)}
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
                        {lieu.ville && <span className="text-muted ms-2">({lieu.ville})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Création...
              </>
            ) : (
              <>
                <i className="bi bi-plus-lg me-1"></i>
                Créer la date
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default DateCreationModal; 