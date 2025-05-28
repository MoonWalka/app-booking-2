// src/hooks/programmateurs/useDeleteProgrammateur.js
import { useState, useCallback } from 'react';
import { useGenericEntityDelete } from '@/hooks/common';
import { toast } from 'react-toastify';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook optimisé pour la suppression des programmateurs
 * Utilise le hook générique useGenericEntityDelete avec une modale de confirmation
 * 
 * @param {Function} onSuccess - Callback appelé après une suppression réussie
 * @returns {Object} - État et méthodes pour gérer la suppression de programmateurs
 */
const useDeleteProgrammateur = (onSuccess) => {
  // État pour la modale de confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [programmateurToDelete, setProgrammateurToDelete] = useState(null);

  // Utiliser le hook générique avec une configuration spécifique aux programmateurs
  const deleteHook = useGenericEntityDelete({
    entityType: 'programmateur',
    collectionName: 'programmateurs',
    
    // Désactiver la confirmation automatique pour utiliser notre modale
    showConfirmation: false,
    
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
      debugLog(`Programmateur supprimé avec succès: ${programmateurId}`, 'info', 'useDeleteProgrammateur');
      toast.success('Le programmateur a été supprimé avec succès');
      
      // Fermer la modale
      setShowDeleteModal(false);
      setProgrammateurToDelete(null);
      
      // Exécuter le callback personnalisé si fourni
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(programmateurId);
      }
    },
    onError: (error) => {
      debugLog(`Erreur lors de la suppression du programmateur: ${error.message}`, 'error', 'useDeleteProgrammateur');
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  // Gérer le clic sur le bouton supprimer (ouvre la modale)
  const handleDeleteClick = useCallback((programmateurData) => {
    debugLog(`Ouverture de la modale de suppression pour le programmateur ${programmateurData?.id || 'inconnu'}`, 'debug', 'useDeleteProgrammateur');
    setProgrammateurToDelete(programmateurData);
    setShowDeleteModal(true);
  }, []);

  // Fermer la modale de suppression
  const handleCloseDeleteModal = useCallback(() => {
    debugLog('Fermeture de la modale de suppression', 'debug', 'useDeleteProgrammateur');
    setShowDeleteModal(false);
    setProgrammateurToDelete(null);
  }, []);

  // Confirmer la suppression
  const handleConfirmDelete = useCallback(async () => {
    if (!programmateurToDelete?.id) {
      debugLog('Aucun programmateur sélectionné pour suppression', 'warn', 'useDeleteProgrammateur');
      return false;
    }

    debugLog(`Confirmation de suppression du programmateur ${programmateurToDelete.id}`, 'info', 'useDeleteProgrammateur');
    return await deleteHook.handleDelete(programmateurToDelete.id);
  }, [programmateurToDelete, deleteHook]);

  // Fonction utilitaire pour supprimer un programmateur spécifique (legacy)
  const handleDeleteProgrammateur = useCallback((programmateurId, event) => {
    debugLog(`Tentative de suppression du programmateur ${programmateurId}`, 'debug', 'useDeleteProgrammateur');
    return deleteHook.handleDelete(programmateurId, event);
  }, [deleteHook]);

  // Renvoyer une API adaptée aux composants qui utilisent ce hook
  return {
    // État de la modale
    showDeleteModal,
    programmateurToDelete,
    
    // Exposer les propriétés et méthodes du hook générique
    isDeleting: deleteHook.isDeleting,
    hasRelatedEntities: deleteHook.hasRelatedEntities,
    relatedEntitiesDetails: deleteHook.relatedEntitiesDetails,
    
    // Méthodes pour la gestion de la modale
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    
    // Méthodes spécifiques aux programmateurs
    handleDelete: handleDeleteProgrammateur,
    
    // Alias pour compatibilité avec le code existant
    deleting: deleteHook.isDeleting,
    checkRelatedEntities: deleteHook.checkRelatedEntities
  };
};

export default useDeleteProgrammateur;