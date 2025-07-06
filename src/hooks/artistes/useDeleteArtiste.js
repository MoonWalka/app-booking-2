// src/hooks/artistes/useDeleteArtiste.js
import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la suppression des artistes
 * Version améliorée utilisant le hook générique useGenericEntityDelete
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après suppression réussie
 * @returns {Object} États et méthodes pour gérer la suppression
 */
const useDeleteArtiste = (onDeleteSuccess) => {
  // Utiliser le hook générique avec configuration spécifique aux artistes
  const {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesDetails,
    handleDelete,
    checkRelatedEntities
  } = useGenericEntityDelete({
    entityType: 'artiste',
    collectionName: 'artistes',
    
    // Messages personnalisés
    confirmationTitle: 'Supprimer cet artiste',
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer cet artiste ? Cette action est irréversible.',
    
    // Entités liées à vérifier
    relatedEntities: [
      {
        collection: 'dates',
        field: 'artisteId',
        referenceType: 'direct',
        message: 'Cet artiste ne peut pas être supprimé car il a des dates associées.',
        detailsField: 'titre',
        detailsLimit: 5
      },
      {
        collection: 'evenements',
        field: 'artistesId',
        referenceType: 'array',
        message: 'Cet artiste ne peut pas être supprimé car il est utilisé dans des événements.',
        detailsField: 'nom',
        detailsLimit: 5
      }
    ],
    
    // Callbacks
    onSuccess: (id) => {
      if (onDeleteSuccess) onDeleteSuccess(id);
    },
    onError: (error) => {
      console.error('[useDeleteArtiste] Erreur de suppression:', error);
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

  // Fonction adaptée pour la suppression d'un artiste spécifique
  const handleDeleteArtiste = useCallback((artiste) => {
    if (!artiste) return Promise.reject(new Error('Artiste non défini'));
    
    // On peut passer l'objet artiste complet ou juste l'ID
    const artisteId = typeof artiste === 'object' ? artiste.id : artiste;
    
    if (!artisteId) {
      showErrorToast('ID d\'artiste manquant, impossible de supprimer');
      return Promise.reject(new Error('ID manquant'));
    }
    
    return handleDelete(artisteId);
  }, [handleDelete]);

  // Fonction pour vérifier si un artiste peut être supprimé
  const canDeleteArtiste = useCallback(async (artisteId) => {
    if (!artisteId) return { canDelete: false, reason: 'ID manquant' };
    
    try {
      const result = await checkRelatedEntities(artisteId);
      return { 
        canDelete: !result.hasRelatedEntities, 
        reason: result.hasRelatedEntities ? result.message : null,
        details: result.relatedEntitiesDetails 
      };
    } catch (error) {
      console.error('[useDeleteArtiste] Erreur de vérification:', error);
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
    
    // Actions
    handleDelete: handleDeleteArtiste,
    handleDeleteArtiste,
    canDeleteArtiste
  };
};

export default useDeleteArtiste;