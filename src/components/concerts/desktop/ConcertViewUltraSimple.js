import React, { useState, useEffect, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, db } from '@/services/firebase-service';
import { Alert } from 'react-bootstrap';
import styles from './ConcertView.module.css';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';

/**
 * Version ULTRA-SIMPLIFIÉE de ConcertView
 * ZÉRO re-render garanti - Aucun hook générique
 * MÉTHODOLOGIE SÉCURISÉE : Approche minimaliste documentée
 * 
 * ⚠️ FICHIER DE BACKUP - Conservé en cas de régression des re-renders
 * Version active : ConcertView.js (version robuste)
 */
const ConcertViewUltraSimple = memo(({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  
  // Utiliser l'ID passé en prop s'il existe, sinon utiliser l'ID de l'URL
  const id = propId || urlId;

  // États ultra-simples
  const [concert, setConcert] = useState(null);
  const [lieu, setLieu] = useState(null);
  const [programmateur, setProgrammateur] = useState(null);
  const [artiste, setArtiste] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Chargement des données - ULTRA-SIMPLE avec entités liées
  useEffect(() => {
    if (!id) return;

    const loadConcertAndRelatedData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger le concert principal
        const concertDoc = await getDoc(doc(db, 'concerts', id));
        
        if (!concertDoc.exists()) {
          setError('Concert non trouvé');
          setLoading(false);
          return;
        }

        const concertData = { id: concertDoc.id, ...concertDoc.data() };
        setConcert(concertData);

        // Charger les entités liées en parallèle
        const promises = [];

        // Charger le lieu si lieuId existe
        if (concertData.lieuId) {
          promises.push(
            getDoc(doc(db, 'lieux', concertData.lieuId))
              .then(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null)
              .then(data => {
                setLieu(data);
              })
              .catch(() => setLieu(null))
          );
        }

        // Charger le programmateur si programmateurId existe
        if (concertData.programmateurId) {
          promises.push(
            getDoc(doc(db, 'programmateurs', concertData.programmateurId))
              .then(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null)
              .then(data => {
                setProgrammateur(data);
              })
              .catch(() => setProgrammateur(null))
          );
        }

        // Charger l'artiste si artisteId existe
        if (concertData.artisteId) {
          promises.push(
            getDoc(doc(db, 'artistes', concertData.artisteId))
              .then(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null)
              .then(data => setArtiste(data))
              .catch(() => setArtiste(null))
          );
        }

        // Charger la structure si structureId existe
        if (concertData.structureId) {
          promises.push(
            getDoc(doc(db, 'structures', concertData.structureId))
              .then(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null)
              .then(data => setStructure(data))
              .catch(() => setStructure(null))
          );
        }

        // Attendre toutes les entités liées
        await Promise.all(promises);
        
      } catch (err) {
        console.error('Erreur lors du chargement du concert:', err);
        setError('Erreur lors du chargement du concert');
      } finally {
        setLoading(false);
      }
    };

    loadConcertAndRelatedData();
  }, [id]);

  // Callbacks ultra-stables
  const callbacks = useMemo(() => ({
    handleEdit: () => navigate(`/concerts/${id}/edit`),
    handleCancel: () => navigate(`/concerts/${id}`),
    handleOpenDeleteModal: () => setShowDeleteConfirm(true),
    handleCloseDeleteModal: () => setShowDeleteConfirm(false),
    navigateToList: () => navigate('/concerts'),
    handleDelete: () => {
      // Implémentation simple de suppression
      console.log('Suppression du concert:', id);
      setShowDeleteConfirm(false);
      navigate('/concerts');
    }
  }), [navigate, id]);

  // Fonctions utilitaires ultra-simples
  const formatDate = (date) => {
    if (!date) return 'Date non spécifiée';
    try {
      const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return dateObj.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const formatMontant = (montant) => {
    if (!montant) return 'Montant non spécifié';
    return `${montant}€`;
  };

  const isDatePassed = (date) => {
    if (!date) return false;
    try {
      const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
      return dateObj < new Date();
    } catch {
      return false;
    }
  };

  // Objets vides pour les entités liées (mode visualisation uniquement)
  const emptyEntities = useMemo(() => ({
    lieu: null,
    programmateur: null,
    artiste: null,
    structure: null
  }), []);

  // Objets vides pour les hooks de recherche
  const emptySearchObjects = useMemo(() => {
    const emptySearch = {
      searchTerm: '',
      setSearchTerm: () => {},
      showResults: false,
      results: [],
      isSearching: false,
      handleLieuSelect: () => {},
      setSelectedEntity: () => {},
      handleCreateLieu: () => navigate('/lieux/nouveau')
    };

    return {
      lieu: emptySearch,
      programmateur: emptySearch,
      artiste: emptySearch
    };
  }, [navigate]);

  // Statut info ultra-simple
  const statusInfo = useMemo(() => ({
    statusBadge: concert?.statut || 'inconnu',
    actionButtons: [],
    urgencyLevel: 'normal'
  }), [concert?.statut]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement du concert...</span>
          </div>
          <p className="mt-2">Chargement du concert...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!concert) {
    return <Alert variant="danger">Concert non trouvé</Alert>;
  }

  return (
    <div className={styles.concertViewContainer || 'concert-view-container'}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeader 
        concert={concert}
        onEdit={callbacks.handleEdit}
        onDelete={callbacks.handleOpenDeleteModal}
        isEditMode={false}
        formatDate={formatDate}
        navigateToList={callbacks.navigateToList}
        onSave={() => {}}
        onCancel={callbacks.handleCancel}
        isSubmitting={false}
        canSave={false}
      />

      {/* Mode vue uniquement */}
      <>
        {/* Informations générales */}
        <ConcertGeneralInfo 
          concert={concert}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          formatDate={formatDate}
          formatMontant={formatMontant}
          isDatePassed={isDatePassed}
          statusInfo={statusInfo}
          artiste={artiste}
          formDataStatus={{}}
        />

        {/* Lieu */}
        <ConcertLocationSection 
          concertId={id}
          lieu={lieu}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          selectedLieu={lieu}
          lieuSearchTerm={emptySearchObjects.lieu.searchTerm}
          setLieuSearchTerm={emptySearchObjects.lieu.setSearchTerm}
          showLieuResults={emptySearchObjects.lieu.showResults}
          lieuResults={emptySearchObjects.lieu.results}
          isSearchingLieux={emptySearchObjects.lieu.isSearching}
          handleSelectLieu={emptySearchObjects.lieu.handleLieuSelect}
          handleRemoveLieu={() => {}}
          handleCreateLieu={() => navigate('/lieux/nouveau')}
        />

        {/* Programmateur */}
        <ConcertOrganizerSection 
          concertId={id}
          programmateur={programmateur}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
          showFormGenerator={false}
          setShowFormGenerator={() => {}}
          generatedFormLink=""
          setGeneratedFormLink={() => {}}
          handleFormGenerated={() => {}}
          copyToClipboard={() => {}}
          formatDate={formatDate}
          concert={concert}
          selectedProgrammateur={programmateur}
          progSearchTerm={emptySearchObjects.programmateur.searchTerm}
          setProgSearchTerm={emptySearchObjects.programmateur.setSearchTerm}
          showProgResults={emptySearchObjects.programmateur.showResults}
          progResults={emptySearchObjects.programmateur.results}
          isSearchingProgs={emptySearchObjects.programmateur.isSearching}
          handleSelectProgrammateur={emptySearchObjects.programmateur.setSelectedEntity}
          handleRemoveProgrammateur={() => {}}
          handleCreateProgrammateur={() => navigate('/programmateurs/nouveau')}
        />

        {/* Structure */}
        <ConcertStructureSection 
          concertId={id}
          structure={structure}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste - seulement si présent */}
        {artiste && (
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={false}
            formData={{}}
            onChange={() => {}}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
            selectedArtiste={artiste}
            artisteSearchTerm={emptySearchObjects.artiste.searchTerm}
            setArtisteSearchTerm={emptySearchObjects.artiste.setSearchTerm}
            showArtisteResults={emptySearchObjects.artiste.showResults}
            artisteResults={emptySearchObjects.artiste.results}
            isSearchingArtistes={emptySearchObjects.artiste.isSearching}
            handleSelectArtiste={emptySearchObjects.artiste.setSelectedEntity}
            handleRemoveArtiste={() => {}}
            handleCreateArtiste={() => navigate('/artistes/nouveau')}
          />
        )}
      </>

      {/* Modale de confirmation de suppression */}
      <DeleteConcertModal
        show={showDeleteConfirm}
        onHide={callbacks.handleCloseDeleteModal}
        onConfirm={callbacks.handleDelete}
        concertTitle={concert?.titre}
      />
    </div>
  );
});

// Ajouter un nom d'affichage pour le debugging
ConcertViewUltraSimple.displayName = 'ConcertViewUltraSimple';

export default ConcertViewUltraSimple; 