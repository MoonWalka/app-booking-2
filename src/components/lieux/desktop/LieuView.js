// src/components/lieux/desktop/LieuView.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

// Import du hook standardisé
import useLieuDetails from '@/hooks/lieux/useLieuDetails';

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

// Import styles
import styles from './LieuDetails.module.css';

/**
 * LieuView component - displays a venue's details in read-only mode
 * Séparé du mode édition pour une meilleure séparation des préoccupations
 */
const LieuView = () => {
  const { id: lieuId } = useParams();
  const navigate = useNavigate();

  // Use custom hooks
  const {
    lieu,
    loading,
    error,
    isEditing,
    isDeleting,
    showDeleteModal,
    hasAssociatedConcerts,
    handleEdit,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    programmateur,
    loadingProgrammateur
  } = useLieuDetails(lieuId);

  // If loading, show a spinner
  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <Spinner variant="primary" message="Chargement du lieu..." />
      </div>
    );
  }

  // If error, show an error message
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/lieux')}
          icon={<i className="bi bi-arrow-left"></i>}
        >
          Retour à la liste des lieux
        </Button>
      </div>
    );
  }

  // If no lieu or lieu not found, show a message
  if (!lieu) {
    return (
      <div className={styles.errorContainer}>
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Ce lieu n'existe pas ou n'a pas pu être chargé.
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/lieux')}
          icon={<i className="bi bi-arrow-left"></i>}
        >
          Retour à la liste des lieux
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.lieuDetailsContainer}>
      {/* Header with title and action buttons */}
      <LieuHeader 
        lieu={lieu}
        isEditing={false}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <div className={styles.twoColumnsLayout}>
        <div className={styles.leftColumn}>
          {/* General information section */}
          <LieuGeneralInfo
            lieu={lieu}
            isEditing={false}
          />

          {/* Address section */}
          <LieuAddressSection
            lieu={lieu}
            isEditing={false}
          />

          {/* Additional information section (created/updated) */}
          <LieuInfoSection lieu={lieu} />
        </div>

        <div className={styles.rightColumn}>
          {/* Contact information section */}
          <LieuContactSection
            lieu={lieu}
            isEditing={false}
          />

          {/* Programmateur section */}
          <LieuOrganizerSection
            isEditing={false}
            programmateur={programmateur}
            loadingProgrammateur={loadingProgrammateur}
            lieu={lieu}
          />

          {/* Associated concerts section */}
          <LieuConcertsSection lieu={lieu} isEditing={false} />
          
          {/* Associated structures section */}
          <LieuStructuresSection lieu={lieu} isEditing={false} />
        </div>
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