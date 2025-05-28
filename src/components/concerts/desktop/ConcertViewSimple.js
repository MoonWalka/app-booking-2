import React, { useState, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import styles from './ConcertView.module.css';

// Import du hook ultra-minimal
import useConcertDetailsUltraSimple from '@/hooks/concerts/useConcertDetailsUltraSimple';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';

/**
 * Composant de vue des détails d'un concert - Version SIMPLE pour VISUALISATION UNIQUEMENT
 * Optimisé pour 0 re-render avec hook ultra-simplifié
 */
const ConcertViewSimple = memo(({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  
  // Utiliser l'ID passé en prop s'il existe, sinon utiliser l'ID de l'URL
  const id = propId || urlId;

  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Hook simple pour les données
  const detailsHook = useConcertDetailsUltraSimple(id);
  
  // Extraire les données directement du hook
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    error,
    formData,
    getStatusInfo,
    formatDate,
    formatMontant,
    isDatePassed,
    copyToClipboard
  } = detailsHook || {};
  
  // Callbacks stables pour les actions - ULTRA-STABILISÉS
  const stableCallbacks = useMemo(() => ({
    handleEdit: () => {
      console.log("[🔍 ConcertViewSimple] Clic sur Modifier. Navigation vers la page d'édition");
      navigate(`/concerts/${id}/edit`);
    },
    handleCancel: () => navigate(`/concerts/${id}`),
    handleOpenDeleteModal: () => {
      console.log('[LOG][ConcertViewSimple] Ouverture de la modale suppression');
      setShowDeleteConfirm(true);
    },
    handleCloseDeleteModal: () => {
      console.log('[LOG][ConcertViewSimple] Fermeture de la modale suppression');
      setShowDeleteConfirm(false);
    }
  }), [navigate, id]);
  
  // Objets vides pour les recherches (mode visualisation uniquement)
  const searchObjects = useMemo(() => {
    const createEmptySearch = (createPath) => ({
      searchTerm: '',
      setSearchTerm: () => {},
      showResults: false,
      results: [],
      isSearching: false,
      handleLieuSelect: () => {},
      setSelectedEntity: () => {},
      handleCreateLieu: () => navigate(createPath)
    });

    return {
      lieu: createEmptySearch('/lieux/nouveau'),
      programmateur: createEmptySearch('/programmateurs/nouveau'),
      artiste: createEmptySearch('/artistes/nouveau')
    };
  }, [navigate]);

  // Système de statut intelligent - ULTRA-STABILISÉ
  const statusInfo = useMemo(() => {
    if (!getStatusInfo) return {};
    
    const basicStatus = getStatusInfo();
    
    return {
      ...basicStatus,
      statusBadge: basicStatus?.badge,
      actionButtons: [],
      urgencyLevel: 'normal'
    };
  }, [getStatusInfo]);

  // Gestion d'erreur basique
  if (!detailsHook) {
    return <Alert variant="danger">Erreur lors du chargement des données du concert</Alert>;
  }

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
        onEdit={stableCallbacks.handleEdit}
        onDelete={stableCallbacks.handleOpenDeleteModal}
        isEditMode={false}
        formatDate={formatDate}
        navigateToList={() => navigate('/concerts')}
        onSave={() => {}}
        onCancel={stableCallbacks.handleCancel}
        isSubmitting={false}
        canSave={false}
      />

      {/* Mode vue uniquement */}
      <>
        {/* Informations générales */}
        <ConcertGeneralInfo 
          concert={concert}
          isEditMode={false}
          formData={formData}
          onChange={() => {}}
          formatDate={formatDate}
          formatMontant={formatMontant}
          isDatePassed={isDatePassed}
          statusInfo={statusInfo}
          artiste={artiste}
          formDataStatus={null}
        />

        {/* Lieu */}
        <ConcertLocationSection 
          concertId={id}
          lieu={lieu}
          isEditMode={false}
          formData={formData}
          onChange={() => {}}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          selectedLieu={lieu}
          lieuSearchTerm={searchObjects.lieu.searchTerm}
          setLieuSearchTerm={searchObjects.lieu.setSearchTerm}
          showLieuResults={searchObjects.lieu.showResults}
          lieuResults={searchObjects.lieu.results}
          isSearchingLieux={searchObjects.lieu.isSearching}
          handleSelectLieu={searchObjects.lieu.handleLieuSelect}
          handleRemoveLieu={() => {}}
          handleCreateLieu={searchObjects.lieu.handleCreateLieu}
        />

        {/* Programmateur */}
        <ConcertOrganizerSection 
          concertId={id}
          programmateur={programmateur}
          isEditMode={false}
          formData={formData}
          onChange={() => {}}
          navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
          showFormGenerator={false}
          setShowFormGenerator={() => {}}
          generatedFormLink=""
          setGeneratedFormLink={() => {}}
          handleFormGenerated={() => {}}
          copyToClipboard={copyToClipboard}
          formatDate={formatDate}
          concert={concert}
          selectedProgrammateur={programmateur}
          progSearchTerm={searchObjects.programmateur.searchTerm}
          setProgSearchTerm={searchObjects.programmateur.setSearchTerm}
          showProgResults={searchObjects.programmateur.showResults}
          progResults={searchObjects.programmateur.results}
          isSearchingProgs={searchObjects.programmateur.isSearching}
          handleSelectProgrammateur={searchObjects.programmateur.setSelectedEntity}
          handleRemoveProgrammateur={() => {}}
          handleCreateProgrammateur={searchObjects.programmateur.handleCreateProgrammateur}
        />

        {/* Structure */}
        <ConcertStructureSection 
          concertId={id}
          structure={structure}
          isEditMode={false}
          formData={formData}
          onChange={() => {}}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste */}
        {artiste && (
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={false}
            formData={formData}
            onChange={() => {}}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
            selectedArtiste={artiste}
            artisteSearchTerm={searchObjects.artiste.searchTerm}
            setArtisteSearchTerm={searchObjects.artiste.setSearchTerm}
            showArtisteResults={searchObjects.artiste.showResults}
            artisteResults={searchObjects.artiste.results}
            isSearchingArtistes={searchObjects.artiste.isSearching}
            handleSelectArtiste={searchObjects.artiste.setSelectedEntity}
            handleRemoveArtiste={() => {}}
            handleCreateArtiste={searchObjects.artiste.handleCreateArtiste}
          />
        )}
      </>

      {/* Modale de confirmation de suppression */}
      <DeleteConcertModal
        show={showDeleteConfirm}
        onHide={stableCallbacks.handleCloseDeleteModal}
        onConfirm={() => {
          console.log('Suppression non implémentée en mode simple');
          setShowDeleteConfirm(false);
        }}
        concertTitle={concert?.titre}
      />
    </div>
  );
});

// Ajouter un nom d'affichage pour le debugging
ConcertViewSimple.displayName = 'ConcertViewSimple';

export default ConcertViewSimple; 