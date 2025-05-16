// src/hooks/programmateurs/useDeleteProgrammateurOptimized.js
import { useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { toast } from 'react-toastify';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook optimisé pour la suppression des programmateurs
 * Utilise le hook générique useGenericEntityDelete
 * 
 * @param {Function} onSuccess - Callback appelé après une suppression réussie
 * @returns {Object} - État et méthodes pour gérer la suppression de programmateurs
 */
const useDeleteProgrammateurOptimized = (onSuccess) => {
  // Utiliser le hook générique avec une configuration spécifique aux programmateurs
  const deleteHook = useGenericEntityDelete({
    entityType: 'programmateur',
    collectionName: 'programmateurs',
    
    // Messages
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer ce programmateur ? Cette action est irréversible.',
    
    // Vérification des entités liées
    relatedEntities: [
      {
        collection: 'lieux',
        field: 'programmateurId',
        referenceType: 'direct',
        message: 'Ce programmateur est associé à un ou plusieurs lieux et ne peut pas être supprimé.',
        detailsField: 'nom'
      },
      {
        collection: 'concerts',
        field: 'programmateurId',
        referenceType: 'direct',
        message: 'Ce programmateur est associé à un ou plusieurs concerts et ne peut pas être supprimé.',
        detailsField: 'titre'
      },
      {
        collection: 'structures',
        field: 'programmateurIds',
        referenceType: 'array',
        message: 'Ce programmateur est associé à une ou plusieurs structures et ne peut pas être supprimé.',
        detailsField: 'nom'
      }
    ],
    
    // Callbacks
    onSuccess: (programmateurId) => {
      debugLog(`Programmateur supprimé avec succès: ${programmateurId}`, 'info', 'useDeleteProgrammateurOptimized');
      toast.success('Le programmateur a été supprimé avec succès');
      
      // Exécuter le callback personnalisé si fourni
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(programmateurId);
      }
    },
    onError: (error) => {
      debugLog(`Erreur lors de la suppression du programmateur: ${error.message}`, 'error', 'useDeleteProgrammateurOptimized');
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  // Fonction utilitaire pour supprimer un programmateur spécifique
  const handleDeleteProgrammateur = useCallback((programmateurId, event) => {
    debugLog(`Tentative de suppression du programmateur ${programmateurId}`, 'debug', 'useDeleteProgrammateurOptimized');
    return deleteHook.handleDelete(programmateurId, event);
  }, [deleteHook]);

  // Renvoyer une API adaptée aux composants qui utilisent ce hook
  return {
    // Exposer les propriétés et méthodes du hook générique
    isDeleting: deleteHook.isDeleting,
    hasRelatedEntities: deleteHook.hasRelatedEntities,
    relatedEntitiesDetails: deleteHook.relatedEntitiesDetails,
    
    // Méthodes spécifiques aux programmateurs
    handleDelete: handleDeleteProgrammateur,
    
    // Alias pour compatibilité avec le code existant
    deleting: deleteHook.isDeleting,
    checkRelatedEntities: deleteHook.checkRelatedEntities
  };
};

export default useDeleteProgrammateurOptimized;