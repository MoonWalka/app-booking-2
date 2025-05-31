import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { showSuccessToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la suppression des concerts
 * Version améliorée utilisant le hook générique useGenericEntityDelete
 * Suppression directe sans confirmation modale
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après suppression réussie
 * @returns {Object} États et méthodes pour gérer la suppression
 */
const useConcertDelete = (onDeleteSuccess) => {
  // Utiliser le hook générique avec configuration spécifique aux concerts
  const {
    isDeleting,
    handleDelete: genericDelete
  } = useGenericEntityDelete({
    entityType: 'concert',
    collectionName: 'concerts',
    
    // Messages personnalisés
    successMessage: 'Le concert a été supprimé avec succès',
    
    // Callbacks
    onSuccess: (id) => {
      showSuccessToast('Concert supprimé avec succès');
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useConcertDelete] Erreur de suppression:', error);
    },
    
    // Configuration - pas de confirmation modale, suppression directe
    validateBeforeDelete: false,
    showConfirmation: false,
    cacheResults: false,
    directDelete: true // Suppression immédiate sans modal
  });

  // Fonction adaptée pour la suppression directe
  const handleDeleteConcert = useCallback((id, event) => {
    if (event) event.stopPropagation();
    
    // Vérifications de sécurité
    if (!id) {
      console.error('[useConcertDelete] ID du concert manquant');
      return Promise.reject(new Error('ID manquant'));
    }
    
    // Effectuer la suppression directement sans confirmation
    console.log('[useConcertDelete] Suppression directe du concert:', id);
    return genericDelete(id);
  }, [genericDelete]);

  return {
    // État
    isDeleting,
    
    // Actions
    handleDeleteConcert,
    
    // Alias pour compatibilité avec le code existant
    handleDelete: handleDeleteConcert,
    deleting: isDeleting
  };
};

export default useConcertDelete;