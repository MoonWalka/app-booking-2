// src/components/concerts/desktop/ConcertView.js
import React, { useState, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertView.module.css';

// Import des hooks personnalisés
import { useConcertDetails } from '@/hooks/concerts';
import { useConcertStatus } from '@/hooks/concerts';
import { useLieuSearch } from '@/hooks/lieux/useLieuSearch';
import { useProgrammateurSearch } from '@/hooks/programmateurs/useProgrammateurSearch';
import useArtisteSearch from '@/hooks/artistes/useArtisteSearch';

// Import des composants
import ConcertHeader from './ConcertHeader';
import ConcertGeneralInfo from './ConcertGeneralInfo';
import ConcertLocationSection from './ConcertLocationSection';
import ConcertOrganizerSection from './ConcertOrganizerSection';
import ConcertArtistSection from './ConcertArtistSection';
import ConcertStructureSection from './ConcertStructureSection';
import DeleteConcertModal from './DeleteConcertModal';

/**
 * Composant de vue des détails d'un concert - Version Desktop
 * Gère ses propres données via les hooks
 */
const ConcertView = memo(({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  
  // Utiliser l'ID passé en prop s'il existe, sinon utiliser l'ID de l'URL
  const id = propId || urlId;

  // État pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Utiliser le hook pour récupérer les données du concert
  const detailsHook = useConcertDetails(id);
  
  // ✅ DEBUG: Tracer les changements de detailsHook
  // console.log('[DEBUG][ConcertView] detailsHook changed:', {
  //   loading: detailsHook?.loading,
  //   concert: !!detailsHook?.concert,
  //   error: !!detailsHook?.error,
  //   timestamp: Date.now()
  // });
  
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    isSubmitting,
    formData,
    formDataStatus,
    showFormGenerator,
    setShowFormGenerator,
    generatedFormLink,
    setGeneratedFormLink,
    handleDelete,
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    getStatusInfo,
    handleFormGenerated,
    isEditMode: detailsEditMode
  } = detailsHook || {};

  // Hook de statut avancé pour fonctionnalités sophistiquées
  const concertStatus = useConcertStatus();
  
  // Extraire les setters stables pour éviter les re-renders
  const setLieu = detailsHook?.setLieu;
  const setProgrammateur = detailsHook?.setProgrammateur;
  const setArtiste = detailsHook?.setArtiste;
  
  // Callbacks stables pour les hooks de recherche
  const handleLieuSelect = useCallback((lieu) => {
    if (setLieu) {
      setLieu(lieu);
    }
  }, [setLieu]);
  
  const handleProgrammateurSelect = useCallback((programmateur) => {
    if (setProgrammateur) {
      setProgrammateur(programmateur);
    }
  }, [setProgrammateur]);
  
  const handleArtisteSelect = useCallback((artiste) => {
    if (setArtiste) {
      setArtiste(artiste);
    }
  }, [setArtiste]);
  
  // Hooks de recherche pour les sections (toujours appelés pour respecter les règles des hooks)
  const lieuSearchHook = useLieuSearch({
    onSelect: handleLieuSelect,
    maxResults: 10
  });
  
  const programmateurSearchHook = useProgrammateurSearch({
    onSelect: handleProgrammateurSelect,
    maxResults: 10
  });
  
  const artisteSearchHook = useArtisteSearch('', {
    onSelect: handleArtisteSelect,
    maxResults: 10
  });
  
  // Objets optimisés selon le mode édition avec dépendances stables
  const lieuSearch = useMemo(() => {
    if (detailsEditMode) {
      return lieuSearchHook;
    }
    return {
      searchTerm: '',
      setSearchTerm: () => {},
      showResults: false,
      results: [],
      isSearching: false,
      handleLieuSelect: () => {},
      setSelectedEntity: () => {},
      handleCreateLieu: () => navigate('/lieux/nouveau')
    };
  }, [detailsEditMode, lieuSearchHook, navigate]);
  
  const programmateurSearch = useMemo(() => {
    if (detailsEditMode) {
      return programmateurSearchHook;
    }
    return {
      searchTerm: '',
      setSearchTerm: () => {},
      showResults: false,
      results: [],
      isSearching: false,
      setProgrammateur: () => {},
      setSelectedEntity: () => {},
      handleCreateProgrammateur: () => navigate('/programmateurs/nouveau')
    };
  }, [detailsEditMode, programmateurSearchHook, navigate]);
  
  const artisteSearch = useMemo(() => {
    if (detailsEditMode) {
      return artisteSearchHook;
    }
    return {
      searchTerm: '',
      setSearchTerm: () => {},
      showResults: false,
      results: [],
      isSearching: false,
      setArtiste: () => {},
      setSelectedEntity: () => {},
      handleCreateArtiste: () => navigate('/artistes/nouveau')
    };
  }, [detailsEditMode, artisteSearchHook, navigate]);

  // Système de statut intelligent combinant les deux hooks
  const getAdvancedStatusInfo = () => {
    if (!getStatusInfo) return {};
    
    const basicStatus = getStatusInfo();
    const advancedStatus = concertStatus.getStatusDetails?.(concert?.statut);
    
    return {
      ...basicStatus,
      ...advancedStatus,
      // Combinaison intelligente des informations
      statusBadge: advancedStatus?.badge || basicStatus?.badge,
      actionButtons: advancedStatus?.actions || [],
      urgencyLevel: advancedStatus?.urgency || 'normal'
    };
  };

  // Fonction pour passer en mode édition
  const handleEdit = () => {
    console.log("[🔍 ConcertView] Clic sur Modifier. Navigation vers la page d'édition");
    navigate(`/concerts/${id}/edit`);
  };

  // Fonction pour annuler l'édition
  const handleCancel = () => {
    navigate(`/concerts/${id}`);
  };

  // Fonction pour gérer les changements dans les inputs
  const handleChange = (e) => {
    if (detailsHook && detailsHook.handleChange) {
      detailsHook.handleChange(e);
    }
  };

  // Fonction pour enregistrer les modifications
  const handleSave = async () => {
    if (detailsHook && detailsHook.handleSave) {
      await detailsHook.handleSave();
    }
  };

  // Gestion d'erreur basique - si le hook principal échoue
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

  if (!concert) {
    return <Alert variant="danger">Concert non trouvé</Alert>;
  }

  // Utiliser soit getStatusInfo du hook useConcertDetails ou du hook useConcertStatus
  const statusInfo = getAdvancedStatusInfo();

  // Ajout log ouverture modale suppression
  const handleOpenDeleteModal = () => {
    console.log('[LOG][ConcertView] Ouverture de la modale suppression');
    setShowDeleteConfirm(true);
  };
  
  // Ajout log fermeture modale suppression
  const handleCloseDeleteModal = () => {
    console.log('[LOG][ConcertView] Fermeture de la modale suppression');
    setShowDeleteConfirm(false);
  };



  return (
    <div className={styles.concertViewContainer || 'concert-view-container'}>
      {/* En-tête avec titre et boutons d'action */}
      <ConcertHeader 
        concert={concert}
        onEdit={handleEdit}
        onDelete={handleOpenDeleteModal}
        isEditMode={detailsEditMode}
        formatDate={formatDate}
        navigateToList={() => {
          navigate('/concerts');
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        canSave={true}
      />

      {/* Mode vue */}
      <>
        {/* Informations générales */}
        <ConcertGeneralInfo 
          concert={concert}
          isEditMode={detailsEditMode}
          formData={formData}
          onChange={handleChange}
          formatDate={formatDate}
          formatMontant={formatMontant}
          isDatePassed={isDatePassed}
          statusInfo={statusInfo}
          artiste={artiste}
          formDataStatus={formDataStatus}
        />

        {/* Lieu */}
        <ConcertLocationSection 
          concertId={id}
          lieu={lieu}
          isEditMode={detailsEditMode}
          formData={formData}
          onChange={handleChange}
          navigateToLieuDetails={(lieuId) => navigate(`/lieux/${lieuId}`)}
          selectedLieu={lieu}
          lieuSearchTerm={lieuSearch.searchTerm}
          setLieuSearchTerm={lieuSearch.setSearchTerm}
          showLieuResults={lieuSearch.showResults}
          lieuResults={lieuSearch.results}
          isSearchingLieux={lieuSearch.isSearching}
          handleSelectLieu={lieuSearch.handleLieuSelect || lieuSearch.setSelectedEntity}
          handleRemoveLieu={() => setLieu && setLieu(null)}
          handleCreateLieu={lieuSearch.handleCreateLieu || (() => navigate('/lieux/nouveau'))}
        />

        {/* Programmateur */}
        <ConcertOrganizerSection 
          concertId={id}
          programmateur={programmateur}
          isEditMode={detailsEditMode}
          formData={formData}
          onChange={handleChange}
          navigateToProgrammateurDetails={(progId) => navigate(`/programmateurs/${progId}`)}
          showFormGenerator={showFormGenerator}
          setShowFormGenerator={setShowFormGenerator}
          generatedFormLink={generatedFormLink}
          setGeneratedFormLink={setGeneratedFormLink}
          handleFormGenerated={handleFormGenerated}
          copyToClipboard={copyToClipboard}
          formatDate={formatDate}
          concert={concert}
          selectedProgrammateur={programmateur}
          progSearchTerm={programmateurSearch.searchTerm}
          setProgSearchTerm={programmateurSearch.setSearchTerm}
          showProgResults={programmateurSearch.showResults}
          progResults={programmateurSearch.results}
          isSearchingProgs={programmateurSearch.isSearching}
          handleSelectProgrammateur={programmateurSearch.setProgrammateur || programmateurSearch.setSelectedEntity}
          handleRemoveProgrammateur={() => setProgrammateur && setProgrammateur(null)}
          handleCreateProgrammateur={programmateurSearch.handleCreateProgrammateur || (() => navigate('/programmateurs/nouveau'))}
        />

        {/* Structure */}
        <ConcertStructureSection 
          concertId={id}
          structure={structure}
          isEditMode={detailsEditMode}
          formData={formData}
          onChange={handleChange}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {/* Artiste */}
        {artiste && (
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={detailsEditMode}
            formData={formData}
            onChange={handleChange}
            navigateToArtisteDetails={(artisteId) => navigate(`/artistes/${artisteId}`)}
            selectedArtiste={artiste}
            artisteSearchTerm={artisteSearch.searchTerm}
            setArtisteSearchTerm={artisteSearch.setSearchTerm}
            showArtisteResults={artisteSearch.showResults}
            artisteResults={artisteSearch.results}
            isSearchingArtistes={artisteSearch.isSearching}
            handleSelectArtiste={artisteSearch.setArtiste || artisteSearch.setSelectedEntity}
            handleRemoveArtiste={() => setArtiste && setArtiste(null)}
            handleCreateArtiste={artisteSearch.handleCreateArtiste || (() => navigate('/artistes/nouveau'))}
          />
        )}
      </>

      {/* Composant pour l'envoi de formulaire */}
      {showFormGenerator && (
        <FormGenerator
          concert={concert}
          programmateur={programmateur}
          onFormGenerated={handleFormGenerated}
          onClose={() => setShowFormGenerator(false)}
        />
      )}

      {/* Modale de confirmation de suppression */}
      <DeleteConcertModal
        show={showDeleteConfirm}
        onHide={handleCloseDeleteModal}
        onConfirm={() => {
          handleDelete();
          setShowDeleteConfirm(false);
        }}
        concertTitle={concert?.titre}
      />
    </div>
  );
});

// Ajouter un nom d'affichage pour le debugging
ConcertView.displayName = 'ConcertView';

export default ConcertView;