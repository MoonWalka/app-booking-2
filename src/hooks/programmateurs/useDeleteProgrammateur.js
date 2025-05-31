// src/hooks/programmateurs/useDeleteProgrammateur.js
import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la suppression des programmateurs
 * Version améliorée utilisant le hook générique useGenericEntityDelete
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après suppression réussie
 * @returns {Object} États et méthodes pour gérer la suppression
 */
const useDeleteProgrammateur = (onDeleteSuccess) => {
  // Utiliser le hook générique avec configuration spécifique aux programmateurs
  const {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    handleDelete,
    checkRelatedEntities
  } = useGenericEntityDelete({
    entityType: 'programmateur',
    collectionName: 'programmateurs',
    
    // Messages personnalisés
    confirmationTitle: 'Supprimer ce programmateur',
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer ce programmateur ? Cette action est irréversible.',
    
    // Entités liées à vérifier
    relatedEntities: [
      {
        collection: 'concerts',
        field: 'programmateurId',
        referenceType: 'direct',
        message: 'Ce programmateur ne peut pas être supprimé car il a des concerts associés.',
        detailsField: 'titre',
        detailsLimit: 5
      },
      {
        collection: 'lieux',
        field: 'programmateurId',
        referenceType: 'direct',
        message: 'Ce programmateur ne peut pas être supprimé car il est associé à des lieux.',
        detailsField: 'nom',
        detailsLimit: 5
      },
      {
        collection: 'structures',
        field: 'programmateurIds',
        referenceType: 'array',
        message: 'Ce programmateur ne peut pas être supprimé car il est associé à des structures.',
        detailsField: 'raisonSociale',
        detailsLimit: 5
      }
    ],
    
    // Callbacks
    onSuccess: (id) => {
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useDeleteProgrammateur] Erreur de suppression:', error);
      showErrorToast(`Erreur lors de la suppression: ${error.message}`);
    },
    
    // Configuration avancée
    validateBeforeDelete: true, // Valider les entités liées avant suppression
    showConfirmation: true,     // Montrer un dialogue de confirmation
    cacheResults: false         // Ne pas mettre en cache les résultats de validation
  });

  // Fonction adaptée avec meilleure gestion des erreurs
  const handleDeleteProgrammateur = useCallback((id, event) => {
    if (event) event.stopPropagation();
    
    // Vérifications de sécurité
    if (!id) {
      showErrorToast('ID du programmateur manquant, impossible de supprimer');
      return Promise.reject(new Error('ID manquant'));
    }
    
    return handleDelete(id);
  }, [handleDelete]);

  // Fonction pour vérifier si un programmateur peut être supprimé sans effectuer la suppression
  const canDeleteProgrammateur = useCallback(async (id) => {
    if (!id) return { canDelete: false, reason: 'ID manquant' };
    
    try {
      const result = await checkRelatedEntities(id);
      return { 
        canDelete: !result.hasRelatedEntities, 
        reason: result.hasRelatedEntities ? result.message : null,
        details: result.relatedEntitiesDetails 
      };
    } catch (error) {
      console.error('[useDeleteProgrammateur] Erreur de vérification:', error);
      return { canDelete: false, reason: error.message };
    }
  }, [checkRelatedEntities]);

  return {
    // État
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    
    // Actions
    handleDeleteProgrammateur,
    canDeleteProgrammateur,
    
    // Alias pour compatibilité avec le code existant
    handleDelete: handleDeleteProgrammateur,
    deleting: isDeleting
  };
};

export default useDeleteProgrammateur;