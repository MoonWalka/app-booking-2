import { useCallback, useState } from 'react';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import structuresService from '@/services/contacts/structuresService';
import personnesService from '@/services/contacts/personnesService';

/**
 * Hook pour gérer la suppression des contacts dans le modèle relationnel
 * Gère à la fois les structures et les personnes
 * 
 * @param {Function} onDeleteSuccess - Callback appelé après suppression réussie
 * @returns {Object} États et méthodes pour gérer la suppression
 */
const useDeleteContactRelational = (onDeleteSuccess) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasRelatedEntities, setHasRelatedEntities] = useState(false);
  const [relatedEntitiesMessage, setRelatedEntitiesMessage] = useState('');

  /**
   * Gérer la suppression d'un contact (structure ou personne)
   * 
   * @param {string} contactId - ID du contact à supprimer
   * @param {string} contactType - Type du contact ('structure' ou 'personne')
   * @returns {Promise<boolean>} True si la suppression a réussi
   */
  const handleDelete = useCallback(async (contactId, contactType = 'structure') => {
    if (!contactId) {
      showErrorToast('ID du contact manquant');
      return false;
    }

    // Déterminer le type de contact et le message approprié
    const entityType = contactType === 'structure' ? 'structure' : 'personne';
    const entityTypeLabel = contactType === 'structure' ? 'cette structure' : 'cette personne';
    
    // Demander confirmation
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${entityTypeLabel} ? Cette action est irréversible.`;
    if (!window.confirm(confirmMessage)) {
      return false;
    }

    setIsDeleting(true);
    setHasRelatedEntities(false);
    setRelatedEntitiesMessage('');

    try {
      let result;
      
      if (contactType === 'structure') {
        // Supprimer une structure
        result = await structuresService.deleteStructure(contactId);
      } else {
        // Supprimer une personne
        result = await personnesService.deletePersonne(contactId);
      }

      if (result.success) {
        showSuccessToast(`${entityType === 'structure' ? 'Structure' : 'Personne'} supprimée avec succès`);
        
        // Appeler le callback de succès si fourni
        if (onDeleteSuccess) {
          onDeleteSuccess(contactId, contactType);
        }
        
        return true;
      } else {
        // Gérer les erreurs spécifiques (entités liées)
        if (result.error && result.error.includes('associé')) {
          setHasRelatedEntities(true);
          setRelatedEntitiesMessage(result.error);
        }
        
        showErrorToast(result.error || 'Erreur lors de la suppression');
        return false;
      }
    } catch (error) {
      console.error('[useDeleteContactRelational] Erreur:', error);
      showErrorToast(`Erreur lors de la suppression: ${error.message}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [onDeleteSuccess]);

  /**
   * Version du handleDelete qui accepte aussi l'event pour la compatibilité
   */
  const handleDeleteContact = useCallback((contactId, event, contactType = 'structure') => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    return handleDelete(contactId, contactType);
  }, [handleDelete]);

  return {
    isDeleting,
    hasRelatedEntities,
    relatedEntitiesMessage,
    handleDelete,
    handleDeleteContact,
    // Alias pour compatibilité avec l'ancien hook
    deleting: isDeleting
  };
};

export default useDeleteContactRelational;