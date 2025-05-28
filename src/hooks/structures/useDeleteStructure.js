// src/hooks/structures/useDeleteStructure.js
import { useState, useCallback } from 'react';
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
  // État local pour gérer le modal de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);

  // Utiliser le hook générique avec configuration spécifique aux structures
  const {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    handleDelete,
    checkRelatedEntities
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
      setShowDeleteModal(false);
      setStructureToDelete(null);
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useDeleteStructure] Erreur de suppression:', error);
      showErrorToast(`Erreur lors de la suppression: ${error.message}`);
    },
    
    // Configuration avancée - Désactiver la confirmation automatique car on utilise le modal
    showConfirmation: false,  // On gère la confirmation via le modal
    validateBeforeDelete: true,
    cacheResults: false
  });

  // Fonction pour ouvrir le modal de suppression
  const handleDeleteClick = useCallback((structure) => {
    if (!structure) return;
    
    setStructureToDelete(structure);
    setShowDeleteModal(true);
  }, []);

  // Fonction pour fermer le modal
  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setStructureToDelete(null);
  }, []);

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = useCallback(async () => {
    if (!structureToDelete) return;
    
    const structureId = typeof structureToDelete === 'object' ? structureToDelete.id : structureToDelete;
    
    if (!structureId) {
      showErrorToast('ID de structure manquant, impossible de supprimer');
      return;
    }
    
    // Appeler le handleDelete du hook générique
    await handleDelete(structureId);
  }, [structureToDelete, handleDelete]);

  // Fonction adaptée pour la suppression d'une structure spécifique (rétrocompatibilité)
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
    
    // État du modal
    showDeleteModal,
    setShowDeleteModal,
    structureToDelete,
    
    // Pour compatibilité avec l'ancienne API
    deleting: isDeleting,
    
    // Actions
    handleDelete: handleDeleteStructure,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleDeleteStructure,
    canDeleteStructure
  };
};

export default useDeleteStructure;