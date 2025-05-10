// src/hooks/lieux/useLieuDeleteMigrated.js
import { useCallback } from 'react';
import useGenericEntityDelete from '@/hooks/common/useGenericEntityDelete';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook migré pour gérer la suppression des lieux
 * Utilise le hook générique useGenericEntityDelete
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après une suppression réussie
 * @returns {Object} État et fonctions pour la gestion de la suppression
 */
const useLieuDeleteMigrated = (onDeleteSuccess) => {
  // Utiliser le hook générique avec la configuration spécifique aux lieux
  const deleteHook = useGenericEntityDelete({
    entityType: 'lieu',
    collectionName: 'lieux',
    onSuccess: onDeleteSuccess,
    showConfirmation: true,
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer ce lieu ?',
    relatedEntities: [
      {
        collection: 'concerts',
        field: 'lieuId',
        referenceType: 'direct',
        message: 'Ce lieu ne peut pas être supprimé car il a des concerts associés.',
        detailsField: 'titre' // Champ à utiliser pour afficher les détails des entités liées
      },
      {
        collection: 'evenements',
        field: 'lieu',
        referenceType: 'object',
        objectIdPath: 'id',
        message: 'Ce lieu ne peut pas être supprimé car il est utilisé dans des événements.',
        detailsField: 'nom'
      },
      {
        collection: 'programmations',
        field: 'lieuxAssocies',
        referenceType: 'array',
        message: 'Ce lieu ne peut pas être supprimé car il est utilisé dans des programmations.'
      }
    ],
    onError: (error) => {
      debugLog(`Erreur lors de la suppression du lieu: ${error.message}`, 'error', 'useLieuDeleteMigrated');
    }
  });

  // Renommer la fonction handleDelete en handleDeleteLieu pour la compatibilité API
  const handleDeleteLieu = useCallback((id, e) => {
    return deleteHook.handleDelete(id, e);
  }, [deleteHook]);

  // Fonction pour vérifier si un lieu peut être supprimé sans effectuer la suppression
  const canDeleteLieu = useCallback(async (id) => {
    return await deleteHook.checkRelatedEntities(id);
  }, [deleteHook]);

  return {
    isDeleting: deleteHook.isDeleting,
    hasAssociatedEntities: deleteHook.hasRelatedEntities,
    associatedEntitiesDetails: deleteHook.relatedEntitiesDetails,
    handleDeleteLieu,
    canDeleteLieu
  };
};

export default useLieuDeleteMigrated;