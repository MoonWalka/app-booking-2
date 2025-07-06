// src/hooks/contacts/useDeleteContact.js
import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la suppression des contacts
 * Version améliorée utilisant le hook générique useGenericEntityDelete
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après suppression réussie
 * @returns {Object} États et méthodes pour gérer la suppression
 */
const useDeleteContact = (onDeleteSuccess) => {
  // Utiliser le hook générique avec configuration spécifique aux contacts
  const {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    handleDelete,
    checkRelatedEntities
  } = useGenericEntityDelete({
    entityType: 'contact',
    collectionName: 'contacts_unified',
    
    // Messages personnalisés
    confirmationTitle: 'Supprimer ce contact',
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible.',
    
    // Entités liées à vérifier
    relatedEntities: [
      {
        collection: 'dates',
        field: 'contactIds', // Nouveau format
        referenceType: 'array', // Nouveau format array
        message: 'Ce contact ne peut pas être supprimé car il a des dates associées.',
        detailsField: 'titre',
        detailsLimit: 5
      },
      {
        collection: 'lieux',
        field: 'contactIds', // Nouveau format
        referenceType: 'array', // Nouveau format array
        message: 'Ce contact ne peut pas être supprimé car il est associé à des lieux.',
        detailsField: 'nom',
        detailsLimit: 5
      },
      {
        collection: 'structures',
        field: 'contactIds',
        referenceType: 'array',
        message: 'Ce contact ne peut pas être supprimé car il est associé à des structures.',
        detailsField: 'raisonSociale',
        detailsLimit: 5
      }
    ],
    
    // Callbacks
    onSuccess: (id) => {
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useDeleteContact] Erreur de suppression:', error);
      showErrorToast(`Erreur lors de la suppression: ${error.message}`);
    },
    
    // Configuration avancée
    validateBeforeDelete: true, // Valider les entités liées avant suppression
    showConfirmation: true,     // Montrer un dialogue de confirmation
    cacheResults: false         // Ne pas mettre en cache les résultats de validation
  });

  // Fonction adaptée avec meilleure gestion des erreurs
  const handleDeleteContact = useCallback((id, event) => {
    if (event) event.stopPropagation();
    
    // Vérifications de sécurité
    if (!id) {
      showErrorToast('ID du contact manquant, impossible de supprimer');
      return Promise.reject(new Error('ID manquant'));
    }
    
    return handleDelete(id);
  }, [handleDelete]);

  // Fonction pour vérifier si un contact peut être supprimé sans effectuer la suppression
  const canDeleteContact = useCallback(async (id) => {
    if (!id) return { canDelete: false, reason: 'ID manquant' };
    
    try {
      const result = await checkRelatedEntities(id);
      return { 
        canDelete: !result.hasRelatedEntities, 
        reason: result.hasRelatedEntities ? result.message : null,
        details: result.relatedEntitiesDetails 
      };
    } catch (error) {
      console.error('[useDeleteContact] Erreur de vérification:', error);
      return { canDelete: false, reason: error.message };
    }
  }, [checkRelatedEntities]);

  return {
    // État
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    
    // Actions
    handleDeleteContact,
    canDeleteContact,
    
    // Alias pour compatibilité avec le code existant
    handleDelete: handleDeleteContact,
    deleting: isDeleting
  };
};

export default useDeleteContact;