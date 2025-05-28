// src/components/concerts/desktop/ConcertView.js
import React, { useState, useMemo, memo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import FormGenerator from '@/components/forms/FormGenerator';
import styles from './ConcertView.module.css';

// Import des hooks personnalisés
import { useConcertDetails } from '@/hooks/concerts';
import useConcertDetailsSimple from '@/hooks/concerts/useConcertDetailsSimple';
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
 * Composant de vue des détails d'un concert - Version Desktop ULTRA-OPTIMISÉE
 */
const ConcertView = memo(({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = propId || urlId;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = useMemo(() => location.pathname.includes('/edit'), [location.pathname]);
  const callbacksRef = useRef({});

  callbacksRef.current.onSelectLieu = useCallback((lieu) => {
    if (callbacksRef.current.setLieu) {
      callbacksRef.current.setLieu(lieu);
    }
  }, []);
  
  callbacksRef.current.onSelectProgrammateur = useCallback((programmateur) => {
    if (callbacksRef.current.setProgrammateur) {
      callbacksRef.current.setProgrammateur(programmateur);
    }
  }, []);
  
  callbacksRef.current.onSelectArtiste = useCallback((artiste) => {
    if (callbacksRef.current.setArtiste) {
      callbacksRef.current.setArtiste(artiste);
    }
  }, []);
  
  const searchConfig = useMemo(() => ({
    lieu: { onSelect: callbacksRef.current.onSelectLieu, maxResults: 10 },
    programmateur: { onSelect: callbacksRef.current.onSelectProgrammateur, maxResults: 10 },
    artiste: { onSelect: callbacksRef.current.onSelectArtiste, maxResults: 10 }
  }), []);
  
  const detailsHookComplex = useConcertDetails(id);
  const detailsHookSimple = useConcertDetailsSimple(id);
  
  const detailsHook = isEditMode ? detailsHookComplex : detailsHookSimple;
  
  const concertStatus = useConcertStatus();
  const lieuSearchHook = useLieuSearch(searchConfig.lieu);
  const programmateurSearchHook = useProgrammateurSearch(searchConfig.programmateur);
  const artisteSearchHook = useArtisteSearch('', searchConfig.artiste);
  
  if (detailsHook) {
    callbacksRef.current.setLieu = detailsHook.setLieu;
    callbacksRef.current.setProgrammateur = detailsHook.setProgrammateur;
    callbacksRef.current.setArtiste = detailsHook.setArtiste;
  }

  const {
    concert, lieu, programmateur, artiste, structure, loading, isSubmitting, formData, 
    formDataStatus, showFormGenerator, generatedFormLink, setShowFormGenerator, 
    setGeneratedFormLink, handleDelete, copyToClipboard, formatDate, formatMontant, 
    isDatePassed, handleFormGenerated, handleChange, handleSave
  } = detailsHook || {};

  const stableCallbacks = useMemo(() => ({
    handleEdit: () => navigate(`/concerts/${id}/edit`),
    handleCancel: () => navigate(`/concerts/${id}`),
    handleOpenDeleteModal: () => setShowDeleteConfirm(true),
    handleCloseDeleteModal: () => setShowDeleteConfirm(false)
  }), [navigate, id]);
  
  const searchObjects = useMemo(() => {
    if (isEditMode) {
      return {
        lieu: lieuSearchHook || {},
        programmateur: programmateurSearchHook || {},
        artiste: artisteSearchHook || {}
      };
    } else {
      const emptySearch = {
        searchTerm: '', setSearchTerm: () => {}, showResults: false, results: [],
        isSearching: false, handleLieuSelect: () => {}, setSelectedEntity: () => {},
        handleCreateLieu: () => navigate('/lieux/nouveau')
      };
      return { lieu: emptySearch, programmateur: emptySearch, artiste: emptySearch };
    }
  }, [isEditMode, lieuSearchHook, programmateurSearchHook, artisteSearchHook, navigate]);

  const statusInfo = useMemo(() => {
    if (!detailsHook?.getStatusInfo) return {};
    const basicStatus = detailsHook.getStatusInfo();
    const advancedStatus = concertStatus?.getStatusDetails?.(detailsHook.concert?.statut);
    return { ...basicStatus, ...advancedStatus, statusBadge: advancedStatus?.badge || basicStatus?.badge,
             actionButtons: advancedStatus?.actions || [], urgencyLevel: advancedStatus?.urgency || 'normal' };
  }, [detailsHook, concertStatus]);

  const navigationCallbacks = useMemo(() => ({
    navigateToList: () => navigate('/concerts'),
    navigateToLieuDetails: (lieuId) => navigate(`/lieux/${lieuId}`),
    navigateToProgrammateurDetails: (progId) => navigate(`/programmateurs/${progId}`),
    navigateToStructureDetails: (structureId) => navigate(`/structures/${structureId}`),
    navigateToArtisteDetails: (artisteId) => navigate(`/artistes/${artisteId}`),
    handleCreateLieu: () => navigate('/lieux/nouveau'),
    handleCreateProgrammateur: () => navigate('/programmateurs/nouveau'),
    handleCreateArtiste: () => navigate('/artistes/nouveau')
  }), [navigate]);

  if (!detailsHook && isEditMode) {
    console.error("[ConcertView] Erreur critique: detailsHook est indéfini en mode édition.");
    return <Alert variant="danger">Erreur lors du chargement des données d'édition du concert.</Alert>;
  }
  if (!detailsHook && !isEditMode) {
    if (!id) return <Alert variant="danger">ID de concert manquant.</Alert>;
    return <Alert variant="danger">Erreur lors du chargement des données de vue du concert.</Alert>;
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

  return (
    <div className={styles.concertViewContainer || 'concert-view-container'}>
      <ConcertHeader 
        concert={concert}
        onEdit={stableCallbacks.handleEdit}
        onDelete={stableCallbacks.handleOpenDeleteModal}
        isEditMode={isEditMode}
        formatDate={formatDate}
        navigateToList={navigationCallbacks.navigateToList}
        onSave={handleSave}
        onCancel={stableCallbacks.handleCancel}
        isSubmitting={isSubmitting}
        canSave={true}
      />

      <ConcertGeneralInfo 
        concert={concert}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        formatDate={formatDate}
        formatMontant={formatMontant}
        isDatePassed={isDatePassed}
        statusInfo={statusInfo}
        artiste={artiste}
        formDataStatus={formDataStatus}
      />
      <ConcertLocationSection 
        concertId={id}
        lieu={lieu}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToLieuDetails={navigationCallbacks.navigateToLieuDetails}
        selectedLieu={lieu}
        lieuSearchTerm={searchObjects.lieu.searchTerm}
        setLieuSearchTerm={searchObjects.lieu.setSearchTerm}
        showLieuResults={searchObjects.lieu.showResults}
        lieuResults={searchObjects.lieu.results}
        isSearchingLieux={searchObjects.lieu.isSearching}
        handleSelectLieu={searchObjects.lieu.handleLieuSelect || searchObjects.lieu.setSelectedEntity}
        handleRemoveLieu={() => callbacksRef.current.setLieu && callbacksRef.current.setLieu(null)}
        handleCreateLieu={navigationCallbacks.handleCreateLieu}
      />
      <ConcertOrganizerSection 
        concertId={id}
        programmateur={programmateur}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToProgrammateurDetails={navigationCallbacks.navigateToProgrammateurDetails}
        showFormGenerator={showFormGenerator}
        setShowFormGenerator={setShowFormGenerator}
        generatedFormLink={generatedFormLink}
        setGeneratedFormLink={setGeneratedFormLink}
        handleFormGenerated={handleFormGenerated}
        copyToClipboard={copyToClipboard}
        formatDate={formatDate}
        concert={concert}
        selectedProgrammateur={programmateur}
        progSearchTerm={searchObjects.programmateur.searchTerm}
        setProgSearchTerm={searchObjects.programmateur.setSearchTerm}
        showProgResults={searchObjects.programmateur.showResults}
        progResults={searchObjects.programmateur.results}
        isSearchingProgs={searchObjects.programmateur.isSearching}
        handleSelectProgrammateur={searchObjects.programmateur.setProgrammateur || searchObjects.programmateur.setSelectedEntity}
        handleRemoveProgrammateur={() => callbacksRef.current.setProgrammateur && callbacksRef.current.setProgrammateur(null)}
        handleCreateProgrammateur={navigationCallbacks.handleCreateProgrammateur}
      />
      <ConcertStructureSection 
        concertId={id}
        structure={structure}
        isEditMode={isEditMode}
        formData={formData}
        onChange={handleChange}
        navigateToStructureDetails={navigationCallbacks.navigateToStructureDetails}
      />
      {artiste && (
        <ConcertArtistSection 
          concertId={id}
          artiste={artiste}
          isEditMode={isEditMode}
          formData={formData}
          onChange={handleChange}
          navigateToArtisteDetails={navigationCallbacks.navigateToArtisteDetails}
          selectedArtiste={artiste}
          artisteSearchTerm={searchObjects.artiste.searchTerm}
          setArtisteSearchTerm={searchObjects.artiste.setSearchTerm}
          showArtisteResults={searchObjects.artiste.showResults}
          artisteResults={searchObjects.artiste.results}
          isSearchingArtistes={searchObjects.artiste.isSearching}
          handleSelectArtiste={searchObjects.artiste.setArtiste || searchObjects.artiste.setSelectedEntity}
          handleRemoveArtiste={() => callbacksRef.current.setArtiste && callbacksRef.current.setArtiste(null)}
          handleCreateArtiste={navigationCallbacks.handleCreateArtiste}
        />
      )}
      {showFormGenerator && (
        <FormGenerator
          concert={concert}
          programmateur={programmateur}
          onFormGenerated={handleFormGenerated}
          onClose={() => setShowFormGenerator(false)}
        />
      )}
      <DeleteConcertModal
        show={showDeleteConfirm}
        onHide={stableCallbacks.handleCloseDeleteModal}
        onConfirm={() => {
          handleDelete();
          setShowDeleteConfirm(false);
        }}
        concertTitle={concert?.titre}
      />
    </div>
  );
});

export default ConcertView;