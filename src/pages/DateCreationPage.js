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
  const { currentOrganization } = useOrganization();
  const { openConcertsListTab, getActiveTab } = useTabs();
  
  // Récupérer les données pré-remplies depuis les paramètres de l'onglet
  const activeTab = getActiveTab();
  const prefilledData = activeTab?.params?.prefilledData || params.prefilledData || {};
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

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadArtistes = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'artistes'),
        where('organizationId', '==', currentOrganization.id)
      );
      const querySnapshot = await getDocs(q);
      const artistes = [];
      
      querySnapshot.forEach((doc) => {
        const artisteData = { id: doc.id, ...doc.data() };
        
        // Ajouter chaque projet de l'artiste comme une option séparée
        if (artisteData.projets && artisteData.projets.length > 0) {
          artisteData.projets.forEach(projet => {
            artistes.push({
              id: doc.id,
              nom: artisteData.nom || artisteData.nomArtiste,
              projet: projet.nom || projet.titre,
              projetId: projet.id,
              searchText: `${artisteData.nom || artisteData.nomArtiste} ${projet.nom || projet.titre}`.toLowerCase()
            });
          });
        } else {
          // Si pas de projets, ajouter l'artiste sans projet
          artistes.push({
            id: doc.id,
            nom: artisteData.nom || artisteData.nomArtiste,
            projet: '',
            projetId: null,
            searchText: (artisteData.nom || artisteData.nomArtiste || '').toLowerCase()
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
    structure.searchText.includes(organisateurSearch.toLowerCase())
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

  const handleSubmit = async (e, shouldContinue = false) => {
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

      const docRef = await addDoc(collection(db, 'concerts'), dateData);
      
      console.log('Date créée avec ID:', docRef.id);
      
      // Afficher un message de succès
      alert('Date créée avec succès !');

      if (shouldContinue) {
        // TODO: Ouvrir la fiche détaillée de la date créée
        // openConcertDetailsTab(docRef.id, `${formData.artisteNom} - ${formData.date}`);
        console.log('TODO: Ouvrir la fiche de la date', docRef.id);
      } else {
        // Ouvrir l'onglet des concerts pour voir la nouvelle date
        openConcertsListTab();
      }

      // Réinitialiser le formulaire
      resetForm();

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
                <Form.Group className="mb-4" ref={artisteDropdownRef}>
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
                    }}
                    onFocus={() => setShowArtisteDropdown(true)}
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

                {/* Organisateur */}
                <Form.Group className="mb-4" ref={organisateurDropdownRef}>
                  <Form.Label className={styles.label}>
                    <i className="bi bi-building me-2"></i>
                    Organisateur *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher une structure organisatrice..."
                    value={organisateurSearch}
                    onChange={(e) => {
                      setOrganisateurSearch(e.target.value);
                      setShowOrganisateurDropdown(true);
                    }}
                    onFocus={() => setShowOrganisateurDropdown(true)}
                    className={styles.input}
                  />
                  {showOrganisateurDropdown && filteredStructures.length > 0 && (
                    <div className={styles.dropdown}>
                      {filteredStructures.slice(0, 10).map((structure) => (
                        <div
                          key={structure.id}
                          className={styles.dropdownItem}
                          onClick={() => handleOrganisateurSelect(structure)}
                        >
                          {structure.nom}
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>

                {/* Lieu */}
                <Form.Group className="mb-4" ref={lieuDropdownRef}>
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