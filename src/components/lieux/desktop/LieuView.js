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
 * Séparé du mode édition pour une meilleure séparation des préoccupations
 */
const LieuView = () => {
  const { id: lieuId } = useParams();
  const navigate = useNavigate();

  // MIGRATION: Utilisation du hook optimisé
  const {
    lieu,
    loading,
    error,
    isEditing,
    isDeleting,
    showDeleteModal,
    relatedData,
    loadingRelated,
    handleEdit,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete
  } = useLieuDetails(lieuId);

  // Récupérer le programmateur depuis les entités liées
  const programmateur = relatedData?.programmateur;
  const loadingProgrammateur = loadingRelated?.programmateur;

  // Information sur les concerts associés (à implémenter dans le hook si nécessaire)
  const hasAssociatedConcerts = lieu?.concerts?.length > 0 || false;

  // Handlers améliorés avec notifications - NOUVEAU: Finalisation intelligente
  const handleEditWithNotification = () => {
    toast.info('Passage en mode édition', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
    });
    handleEdit();
  };

  const handleDeleteWithNotification = async () => {
    try {
      const result = await handleConfirmDelete();
      if (result !== false) {
        toast.success('Lieu supprimé avec succès !', {
          position: 'top-right',
          autoClose: 3000,
        });
        // Redirection après suppression réussie
        setTimeout(() => navigate('/lieux'), 1500);
      }
      return result;
    } catch (error) {
      toast.error('Erreur lors de la suppression du lieu', {
        position: 'top-right',
        autoClose: 5000,
      });
      throw error;
    }
  };

  // Mode édition rapide basé sur isEditing du hook
  const effectiveEditMode = isEditing;

  // If loading, show a spinner
  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <LoadingSpinner variant="primary" message="Chargement du lieu..." />
      </div>
    );
  }

  // If error, show an error message
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage variant="danger" icon="exclamation-triangle-fill">
          {error}
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
  if (!lieu && !loading) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage variant="warning" icon="exclamation-triangle-fill">
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
        isEditing={effectiveEditMode}
        onEdit={handleEditWithNotification}
        onDelete={handleDeleteClick}
      />

      {/* Nouvelle structure : sections empilées verticalement */}
      <div className={styles.sectionsStack}>
        <LieuGeneralInfo lieu={lieu} isEditing={effectiveEditMode} />
        <LieuAddressSection lieu={lieu} isEditing={effectiveEditMode} />
        <LieuInfoSection lieu={lieu} />
        <LieuContactSection lieu={lieu} isEditing={effectiveEditMode} />
        <LieuOrganizerSection
          isEditing={effectiveEditMode}
          programmateur={programmateur}
          loadingProgrammateur={loadingProgrammateur}
          lieu={lieu}
        />
        <LieuConcertsSection lieu={lieu} isEditing={effectiveEditMode} />
        <LieuStructuresSection lieu={lieu} isEditing={effectiveEditMode} />
      </div>

      {/* Delete confirmation modal */}
      <DeleteLieuModal
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteWithNotification}
        lieu={lieu}
        isDeleting={isDeleting}
        hasAssociatedConcerts={hasAssociatedConcerts}
      />
    </div>
  );
};

export default LieuView;
