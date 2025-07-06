// src/hooks/lieux/useLieuDelete.js
import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour gérer la suppression des lieux
 * Version améliorée avec meilleure gestion des erreurs et vérifications de sécurité
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après une suppression réussie
 * @returns {Object} État et fonctions pour la gestion de la suppression
 */
const useLieuDelete = (onDeleteSuccess) => {
  // Utiliser le hook générique avec la configuration spécifique aux lieux
  const {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    handleDelete,
    checkRelatedEntities
  } = useGenericEntityDelete({
    entityType: 'lieu',
    collectionName: 'lieux',
    
    // Configuration des messages
    confirmationTitle: 'Supprimer ce lieu',
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer ce lieu ? Cette action est irréversible.',
    
    // Entités liées à vérifier
    relatedEntities: [
      {
        collection: 'dates',
        field: 'lieuId',
        referenceType: 'direct',
        message: 'Ce lieu ne peut pas être supprimé car il a des dates associées.',
        detailsField: 'titre',
        detailsLimit: 5
      },
      {
        collection: 'evenements',
        field: 'lieu',
        referenceType: 'object',
        objectIdPath: 'id',
        message: 'Ce lieu ne peut pas être supprimé car il est utilisé dans des événements.',
        detailsField: 'nom',
        detailsLimit: 5
      },
      {
        collection: 'programmations',
        field: 'lieuxAssocies',
        referenceType: 'array',
        message: 'Ce lieu ne peut pas être supprimé car il est utilisé dans des programmations.'
      }
    ],
    
    // Callbacks
    onSuccess: (id) => {
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useLieuDelete] Erreur de suppression:', error);
      showErrorToast(`Erreur lors de la suppression: ${error.message}`);
    },
    
    // Configuration avancée
    validateBeforeDelete: true,  // Valide les entités liées avant suppression
    showConfirmation: true,      // Montrer un dialogue de confirmation
    cacheResults: false          // Ne pas mettre en cache les résultats de la validation
  });

  // Fonction adaptée avec meilleure gestion des erreurs
  const handleDeleteLieu = useCallback((id, event) => {
    if (event) event.stopPropagation();
    
    // Vérifications de sécurité
    if (!id) {
      showErrorToast('ID du lieu manquant, impossible de supprimer');
      return Promise.reject(new Error('ID manquant'));
    }
    
    return handleDelete(id);
  }, [handleDelete]);

  // Fonction pour vérifier si un lieu peut être supprimé sans effectuer la suppression
  const canDeleteLieu = useCallback(async (id) => {
    if (!id) return { canDelete: false, reason: 'ID manquant' };
    
    try {
      const result = await checkRelatedEntities(id);
      return { 
        canDelete: !result.hasRelatedEntities, 
        reason: result.hasRelatedEntities ? result.message : null,
        details: result.relatedEntitiesDetails 
      };
    } catch (error) {
      console.error('[useLieuDelete] Erreur de vérification:', error);
      return { canDelete: false, reason: error.message };
    }
  }, [checkRelatedEntities]);

  return {
    // État
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    
    // Actions
    handleDeleteLieu,
    canDeleteLieu
  };
};

export default useLieuDelete;