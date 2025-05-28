// src/components/lieux/desktop/LieuView.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import des composants UI standardisés
import LoadingSpinner from '@components/ui/LoadingSpinner';
import Button from '@components/ui/Button';
import ErrorMessage from '@components/ui/ErrorMessage';

// MIGRATION: Utilisation du hook optimisé au lieu du hook V2
import { useLieuDetails } from '@hooks/lieux';

// Import section components
import { LieuHeader } from './sections/LieuHeader';
import LieuGeneralInfo from './sections/LieuGeneralInfo';
import LieuAddressSection from './sections/LieuAddressSection';
import LieuOrganizerSection from './sections/LieuOrganizerSection';
import LieuContactSection from './sections/LieuContactSection';
import LieuInfoSection from './sections/LieuInfoSection';
import { LieuConcertsSection } from './sections/LieuConcertsSection';
import { LieuStructuresSection } from './sections/LieuStructuresSection';
import DeleteLieuModal from './sections/DeleteLieuModal';

// Import des styles CSS Module
import styles from './LieuDetails.module.css';

/**
 * LieuView component - displays a venue's details in read-only mode
 * Edition is handled by LieuForm (like concerts system)
 */
const LieuView = ({ id: propId }) => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  
  // Utiliser l'ID passé en prop s'il existe, sinon utiliser l'ID de l'URL
  const id = propId || urlId;

  // Hook pour les détails en mode lecture seule
  const {
    lieu,
    programmateur,
    loading,
    isLoading,
    isSubmitting,
    error,
    isDeleting,
    showDeleteModal,
    loadingRelated,
    handleEdit, // Navigation vers LieuForm
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete
  } = useLieuDetails(id);

  // Information sur les concerts associés (à implémenter dans le hook si nécessaire)
  const hasAssociatedConcerts = lieu?.concerts?.length > 0 || false;

  // Handlers avec notifications
  const handleEditWithNotification = () => {
    toast.info('Redirection vers le formulaire d\'édition', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
    });
    handleEdit(); // Navigation vers /lieux/:id/edit
  };

  // If loading, show a spinner
  if (loading || isLoading) {
    return (
      <div className={styles.spinnerContainer}>
        <LoadingSpinner variant="primary" message="Chargement du lieu..." />
      </div>
    );
  }

  // If error, show an error message
  if (error) {
    // CORRECTION: error est un objet avec une propriété message
    const errorMessage = typeof error === 'string' ? error : (error?.message || 'Une erreur est survenue');
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage variant="danger">
          {errorMessage}
        </ErrorMessage>
        <Button 
          variant="primary" 
          onClick={() => navigate('/lieux')}
          iconStart="arrow-left"
        >
          Retour à la liste des lieux
        </Button>
      </div>
    );
  }

  // If no lieu or lieu not found after loading is complete, show a message
  if (!lieu && !loading && !isLoading) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage variant="warning">
          Ce lieu n'existe pas ou n'a pas pu être chargé.
        </ErrorMessage>
        <Button 
          variant="primary" 
          onClick={() => navigate('/lieux')}
          iconStart="arrow-left"
        >
          Retour à la liste des lieux
        </Button>
      </div>
    );
  }

  // La condition supplémentaire de sécurité pour éviter une erreur si lieu est null
  if (!lieu) {
    return null;
  }

  return (
    <div className={styles.lieuDetailsContainer}>
      {/* Header with title and action buttons */}
      <LieuHeader 
        lieu={lieu}
        isEditMode={false}
        onEdit={handleEditWithNotification}
        onSave={() => {}}
        onCancel={() => {}}
        onDelete={handleDeleteClick}
        isSubmitting={isSubmitting}
        canSave={false}
        navigateToList={() => navigate('/lieux')}
      />

      {/* Sections empilées verticalement avec support du mode édition */}
      <div className={styles.sectionsStack}>
        <LieuGeneralInfo 
          lieu={lieu} 
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
        />
        <LieuAddressSection 
          lieu={lieu} 
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
          updateCoordinates={() => {}}
        />
        <LieuInfoSection 
          lieu={lieu}
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
        />
        <LieuContactSection 
          lieu={lieu} 
          isEditMode={false}
          formData={{}}
          onChange={() => {}}
        />
        <LieuOrganizerSection
          isEditMode={false}
          programmateur={programmateur}
          loadingProgrammateur={loadingRelated?.programmateur}
          lieu={lieu}
          formData={{}}
          onChange={() => {}}
          onProgrammateurChange={() => {}}
        />
        <LieuConcertsSection 
          lieu={lieu} 
          isEditMode={false}
        />
        <LieuStructuresSection 
          lieu={lieu} 
          isEditMode={false}
        />
      </div>

      {/* Delete confirmation modal */}
      <DeleteLieuModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        lieu={lieu}
        isDeleting={isDeleting}
        hasAssociatedConcerts={hasAssociatedConcerts}
      />
    </div>
  );
};

export default LieuView;
