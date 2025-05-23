// src/hooks/structures/useDeleteStructure.js
import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la suppression des structures
 * Version améliorée utilisant le hook générique useGenericEntityDelete
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après suppression réussie
 * @returns {Object} États et méthodes pour gérer la suppression
 */
const useDeleteStructure = (onDeleteSuccess) => {
  // Utiliser le hook générique avec configuration spécifique aux structures
  const {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    handleDelete,
    checkRelatedEntities,
    showConfirmationDialog,
    closeConfirmationDialog
  } = useGenericEntityDelete({
    entityType: 'structure',
    collectionName: 'structures',
    
    // Messages personnalisés
    confirmationTitle: 'Supprimer cette structure',
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer cette structure ? Cette action est irréversible.',
    successMessage: 'La structure a été supprimée avec succès',
    
    // Entités liées à vérifier
    relatedEntities: [
      {
        collection: 'programmateurs',
        field: 'structureId',
        referenceType: 'direct',
        message: 'Cette structure ne peut pas être supprimée car des programmateurs y sont associés.',
        detailsField: 'nom',
        detailsLimit: 5
      },
      {
        collection: 'lieux',
        field: 'structureId',
        referenceType: 'direct',
        message: 'Cette structure ne peut pas être supprimée car des lieux y sont associés.',
        detailsField: 'nom',
        detailsLimit: 5
      }
    ],
    
    // Callbacks
    onSuccess: (id) => {
      showSuccessToast('La structure a été supprimée avec succès');
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useDeleteStructure] Erreur de suppression:', error);
      showErrorToast(`Erreur lors de la suppression: ${error.message}`);
    },
    
    // Configuration avancée
    cleanupBeforeDelete: async (id, db) => {
      // Nettoyage avant suppression - Aucune action supplémentaire requise
      // car la vérification des entités liées est gérée par le hook générique
      return true;
    },
    validateBeforeDelete: true, // Valider les entités liées avant suppression
    showConfirmation: true,     // Montrer un dialogue de confirmation
    cacheResults: false         // Ne pas mettre en cache les résultats de validation
  });

  // Fonction adaptée pour la suppression d'une structure spécifique
  const handleDeleteStructure = useCallback((structure) => {
    if (!structure) return Promise.reject(new Error('Structure non définie'));
    
    // On peut passer l'objet structure complet ou juste l'ID
    const structureId = typeof structure === 'object' ? structure.id : structure;
    
    if (!structureId) {
      showErrorToast('ID de structure manquant, impossible de supprimer');
      return Promise.reject(new Error('ID manquant'));
    }
    
    return handleDelete(structureId);
  }, [handleDelete]);

  // Fonction pour vérifier si une structure peut être supprimée
  const canDeleteStructure = useCallback(async (structureId) => {
    if (!structureId) return { canDelete: false, reason: 'ID manquant' };
    
    try {
      const result = await checkRelatedEntities(structureId);
      return { 
        canDelete: !result.hasRelatedEntities, 
        reason: result.hasRelatedEntities ? result.message : null,
        details: result.relatedEntitiesDetails 
      };
    } catch (error) {
      console.error('[useDeleteStructure] Erreur de vérification:', error);
      return { canDelete: false, reason: error.message };
    }
  }, [checkRelatedEntities]);

  return {
    // État
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    
    // Pour compatibilité avec l'ancienne API
    deleting: isDeleting,
    showDeleteModal: hasRelatedEntities,
    setShowDeleteModal: showConfirmationDialog,
    
    // Actions
    handleDelete: handleDeleteStructure,
    handleDeleteStructure,
    canDeleteStructure,
    
    // Gestion du dialogue de confirmation
    showConfirmationDialog,
    closeConfirmationDialog
  };
};

export default useDeleteStructure;