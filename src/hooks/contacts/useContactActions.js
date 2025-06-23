import { useContactActionsRelational } from './useContactActionsRelational';

/**
 * Hook personnalisé pour gérer toutes les actions liées aux contacts
 * MIGRATION: Simple ré-export de useContactActionsRelational pour compatibilité
 */
export function useContactActions(contactId, contactType = 'structure') {
  return useContactActionsRelational(contactId, contactType);
}