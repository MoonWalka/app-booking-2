import { useState, useCallback } from 'react';
import useGenericEntitySearch from '../common/useGenericEntitySearch';

/**
 * Hook pour la recherche de programmateurs
 * Version migrée utilisant useGenericEntitySearch
 * 
 * @param {string} initialTerm - Terme de recherche initial
 * @returns {Object} API de recherche de programmateurs
 */
const useProgrammateurSearch = (initialTerm = '') => {
  // Utilisation du hook générique avec configuration pour les programmateurs
  const searchHook = useGenericEntitySearch({
    collectionName: 'programmateurs',
    searchFields: ['nom', 'prenom', 'email', 'structureCache.raisonSociale'],
    initialSearchTerm: initialTerm,
    transformResult: (programmateur) => ({
      ...programmateur,
      // Formatage pour affichage dans les dropdowns
      displayName: formatProgrammateurName(programmateur)
    })
  });

  // État local pour gérer le programmateur sélectionné (pour compatibilité API)
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);

  // Fonction utilitaire pour formater le nom d'affichage d'un programmateur
  const formatProgrammateurName = (programmateur) => {
    if (!programmateur) return 'Programmateur inconnu';
    
    const nom = programmateur.nom || '';
    const prenom = programmateur.prenom || '';
    const structure = programmateur.structureCache?.raisonSociale || programmateur.structure || '';
    
    let displayName = `${prenom} ${nom}`.trim();
    if (structure) {
      displayName += ` (${structure})`;
    }
    
    return displayName || 'Programmateur sans nom';
  };

  // Synchroniser le programmateur sélectionné avec l'entité sélectionnée du hook générique
  const handleProgrammateurSelect = useCallback((programmateur) => {
    setSelectedProgrammateur(programmateur);
    searchHook.setSelectedEntity(programmateur);
  }, [searchHook]);

  // Effacer la sélection de programmateur
  const clearProgrammateurSelection = useCallback(() => {
    setSelectedProgrammateur(null);
    searchHook.clearSelection();
  }, [searchHook]);

  // API retournée (pour compatibilité avec le code existant)
  return {
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés et méthodes spécifiques à useProgrammateurSearch (pour compatibilité)
    programmateur: searchHook.selectedEntity || selectedProgrammateur,
    setProgrammateur: handleProgrammateurSelect,
    clearProgrammateur: clearProgrammateurSelection,
    
    // Aliases supplémentaires pour compatibilité
    searchProgrammateurs: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch
  };
};

export default useProgrammateurSearch;