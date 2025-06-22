/**
 * Hook pour la recherche de contacts
 * MIGRATION: Maintenant utilise le modèle relationnel via useContactSearchRelational
 * Garde la même interface pour compatibilité avec les composants existants
 */
import { useContactSearchRelational } from './useContactSearchRelational';

/**
 * Hook pour la recherche et la sélection de contacts
 * Compatible avec l'ancienne interface, délègue au hook relationnel
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} [options.onSelect=null] - Callback appelé quand un contact est sélectionné
 * @param {string} [options.initialSearchTerm=''] - Terme de recherche initial
 * @param {number} [options.maxResults=50] - Nombre maximum de résultats à afficher
 * @returns {Object} API pour la recherche et la sélection de contacts
 */
export const useContactSearch = (options = {}) => {
  // Déléguer complètement au hook relationnel
  return useContactSearchRelational(options);
};

export default useContactSearch;