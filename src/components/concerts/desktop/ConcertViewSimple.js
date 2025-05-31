import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useConcertDetailsSimple } from '@/hooks/concerts';
import useConcertDelete from '@/hooks/concerts/useConcertDelete';
import { useLieuSearch } from '@/hooks/lieux/useLieuSearch';
import { useProgrammateurSearch } from '@/hooks/programmateurs/useProgrammateurSearch';
import { useArtisteSearch } from '@/hooks/artistes';

import styles from './ConcertView.module.css';

// Import sections
import ConcertHeader from '../sections/ConcertHeader';
import ConcertGeneralInfo from '../sections/ConcertGeneralInfo';
import ConcertLocationSection from '../sections/ConcertLocationSection';
import ConcertOrganizerSection from '../sections/ConcertOrganizerSection';
import ConcertStructureSection from '../sections/ConcertStructureSection';
import ConcertArtistSection from '../sections/ConcertArtistSection';
// SUPPRESSION : Plus besoin de DeleteConcertModal
// import DeleteConcertModal from './DeleteConcertModal';

/**
 * ConcertViewSimple - Version simplifiée du composant de vue des détails d'un concert
 * Mode lecture seule uniquement avec suppression directe
 */
const ConcertViewSimple = React.memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Hook de suppression directe
  const {
    isDeleting,
    handleDeleteConcert
  } = useConcertDelete(() => navigate('/concerts'));

  // Hook simplifié pour les détails
  const {
    concert,
    lieu,
    programmateur,
    artiste,
    structure,
    loading,
    error,
    formDataStatus
  } = useConcertDetailsSimple(id);

  // Hooks de recherche simplifiés
  const searchObjects = useMemo(() => ({
    lieu: useLieuSearch(),
    programmateur: useProgrammateurSearch(),
    artiste: useArtisteSearch()
  }), []);

  // Gestionnaire de suppression directe
  const handleDirectDelete = useCallback(() => {
    if (id) {
      console.log('[ConcertViewSimple] Suppression directe du concert:', id);
      handleDeleteConcert(id);
    }
  }, [id, handleDeleteConcert]);

  // Callbacks stabilisés
  const stableCallbacks = useMemo(() => ({
    handleEdit: () => navigate(`/concerts/${id}/edit`),
    handleDelete: handleDirectDelete,
    navigateToList: () => navigate('/concerts'),
    handleCloseDeleteModal: () => {}, // Plus utilisé
    copyToClipboard: (text) => {
      navigator.clipboard.writeText(text)
        .then(() => alert('Copié !'))
        .catch(() => alert('Erreur de copie'));
    },
    formatDate: (date) => {
      if (!date) return 'Date non spécifiée';
      try {
        const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
        return dateObj.toLocaleDateString('fr-FR');
      } catch {
        return 'Date invalide';
      }
    },
    formatMontant: (montant) => montant ? `${montant}€` : 'Montant non spécifié',
    isDatePassed: (date) => {
      if (!date) return false;
      try {
        const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
        return dateObj < new Date();
      } catch {
        return false;
      }
    },
    getStatusInfo: () => ({ statusBadge: concert?.statut || 'inconnu', actionButtons: [], urgencyLevel: 'normal' })
  }), [navigate, id, handleDirectDelete, concert]);

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
    <div className={styles.concertViewContainer}>
      {/* Header avec titre et boutons d'action */}
      <ConcertHeader 
        concert={concert}
        onEdit={stableCallbacks.handleEdit}
        onDelete={stableCallbacks.handleDelete}
        isEditMode={false}
        formatDate={stableCallbacks.formatDate}
        navigateToList={stableCallbacks.navigateToList}
        onSave={() => {}}
        onCancel={() => {}}
        isSubmitting={isDeleting}
        canSave={false}
      />

      {/* Sections en mode lecture seule */}
      <>
        <ConcertGeneralInfo 
          concert={concert}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          formatDate={stableCallbacks.formatDate}
          formatMontant={stableCallbacks.formatMontant}
          isDatePassed={stableCallbacks.isDatePassed}
          statusInfo={stableCallbacks.getStatusInfo()}
          artiste={artiste}
          formDataStatus={formDataStatus}
        />

        <ConcertLocationSection 
          concertId={id}
          lieu={lieu}
          isEditMode={false}
          formData={{}}
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
          copyToClipboard={stableCallbacks.copyToClipboard}
          formatDate={stableCallbacks.formatDate}
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

        <ConcertStructureSection 
          concertId={id}
          structure={structure}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          navigateToStructureDetails={(structureId) => navigate(`/structures/${structureId}`)}
        />

        {artiste && (
          <ConcertArtistSection 
            concertId={id}
            artiste={artiste}
            isEditMode={false}
            formData={{}}
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

      {/* SUPPRESSION : Plus de modal de confirmation */}
      {/* Plus besoin de DeleteConcertModal */}
    </div>
  );
});

// Ajouter un nom d'affichage pour le debugging
ConcertViewSimple.displayName = 'ConcertViewSimple';

export default ConcertViewSimple;