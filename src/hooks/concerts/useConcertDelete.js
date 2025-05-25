import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour gérer la suppression des concerts
 * Version améliorée avec meilleure gestion des erreurs et vérifications de sécurité
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après une suppression réussie
 * @returns {Object} État et fonctions pour la gestion de la suppression
 */
const useConcertDelete = (onDeleteSuccess) => {
  // Utiliser le hook générique avec la configuration spécifique aux concerts
  const {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    handleDelete,
    checkRelatedEntities,
    showConfirmationDialog,
    closeConfirmationDialog
  } = useGenericEntityDelete({
    entityType: 'concert',
    collectionName: 'concerts',
    
    // Configuration des messages
    confirmationTitle: 'Supprimer ce concert',
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer ce concert ? Cette action est irréversible.',
    successMessage: 'Le concert a été supprimé avec succès',
    
    // Entités liées à vérifier
    relatedEntities: [
      {
        collection: 'programmateurs',
        field: 'concertsAssocies',
        referenceType: 'array',
        message: 'Ce concert ne peut pas être supprimé car il est utilisé par des programmateurs.',
        detailsField: 'nom',
        detailsLimit: 3
      },
      {
        collection: 'artistes',
        field: 'concertsAssocies',
        referenceType: 'array',
        message: 'Ce concert ne peut pas être supprimé car il est utilisé par des artistes.',
        detailsField: 'nom',
        detailsLimit: 3
      }
    ],
    
    // Callbacks
    onSuccess: (id) => {
      showSuccessToast('Le concert a été supprimé avec succès');
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useConcertDelete] Erreur de suppression:', error);
      showErrorToast(`Erreur lors de la suppression: ${error.message}`);
    },
    
    // Configuration avancée
    validateBeforeDelete: true,
    showConfirmation: true,
    cacheResults: false
  });

  // Fonction adaptée pour les concerts avec logs et vérifications
  const handleDeleteConcert = useCallback((id, event) => {
    if (event) event.stopPropagation();
    
    // Vérifications de sécurité
    if (!id) {
      console.error('[useConcertDelete] ID du concert manquant');
      showErrorToast('ID du concert manquant, impossible de supprimer');
      return Promise.reject(new Error('ID manquant'));
    }
    
    return handleDelete(id);
  }, [handleDelete]);

  // Fonction pour vérifier si un concert peut être supprimé sans effectuer la suppression
  const canDeleteConcert = useCallback(async (id) => {
    if (!id) return { canDelete: false, reason: 'ID manquant' };
    
    try {
      const result = await checkRelatedEntities(id);
      return { 
        canDelete: !result.hasRelatedEntities, 
        reason: result.hasRelatedEntities ? result.message : null,
        details: result.relatedEntitiesDetails 
      };
    } catch (error) {
      console.error('[useConcertDelete] Erreur de vérification:', error);
      return { canDelete: false, reason: error.message };
    }
  }, [checkRelatedEntities]);

  return {
    // État
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    
    // Actions
    handleDeleteConcert,
    canDeleteConcert,
    
    // Gestion du dialogue de confirmation
    showConfirmationDialog,
    closeConfirmationDialog
  };
};

export default useConcertDelete; 