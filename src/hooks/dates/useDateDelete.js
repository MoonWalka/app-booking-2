import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';

/**
 * Hook optimisé pour la suppression des dates
 * Version améliorée utilisant le hook générique useGenericEntityDelete
 * Suppression directe sans confirmation modale
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après suppression réussie
 * @returns {Object} États et méthodes pour gérer la suppression
 */
const useDateDelete = (onDeleteSuccess) => {
  // Utiliser le hook générique avec configuration spécifique aux dates
  const {
    isDeleting,
    handleDelete: genericDelete
  } = useGenericEntityDelete({
    entityType: 'date',
    collectionName: 'dates',
    
    // Callbacks
    onSuccess: (id) => {
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useDateDelete] Erreur de suppression:', error);
    },
    
    // Configuration - pas de confirmation modale, suppression directe
    validateBeforeDelete: false,
    showConfirmation: false,
    cacheResults: false,
    directDelete: true // Suppression immédiate sans modal
  });

  // Fonction adaptée pour la suppression directe
  const handleDeleteDate = useCallback((id, event) => {
    if (event) event.stopPropagation();
    
    // Vérifications de sécurité
    if (!id) {
      console.error('[useDateDelete] ID du date manquant');
      return Promise.reject(new Error('ID manquant'));
    }
    
    // Effectuer la suppression directement sans confirmation
    console.log('[useDateDelete] Suppression directe du date:', id);
    return genericDelete(id);
  }, [genericDelete]);

  return {
    // État
    isDeleting,
    
    // Actions
    handleDeleteDate,
    
    // Alias pour compatibilité avec le code existant
    handleDelete: handleDeleteDate,
    deleting: isDeleting
  };
};

export default useDateDelete;