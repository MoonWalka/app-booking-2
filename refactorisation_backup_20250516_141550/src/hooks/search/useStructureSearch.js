import { useState, useCallback } from 'react';
import useGenericEntitySearch from '../common/useGenericEntitySearch';

/**
 * Hook pour la recherche de structures
 * Version migrée utilisant useGenericEntitySearch
 * 
 * @param {string} initialTerm - Terme de recherche initial
 * @returns {Object} API de recherche de structures
 */
const useStructureSearch = (initialTerm = '') => {
  // Utilisation du hook générique avec configuration pour les structures
  const searchHook = useGenericEntitySearch({
    collectionName: 'structures',
    searchFields: ['raisonSociale', 'siret', 'type'],
    initialSearchTerm: initialTerm,
    transformResult: (structure) => ({
      ...structure,
      // Formatage pour affichage dans les dropdowns
      displayName: formatStructureName(structure)
    })
  });

  // État local pour gérer la structure sélectionnée (pour compatibilité API)
  const [selectedStructure, setSelectedStructure] = useState(null);

  // Fonction utilitaire pour formater le nom d'affichage d'une structure
  const formatStructureName = (structure) => {
    if (!structure) return 'Structure inconnue';
    
    const raisonSociale = structure.raisonSociale || '';
    const type = structure.type ? `(${structure.type})` : '';
    const ville = structure.ville ? `- ${structure.ville}` : '';
    
    return `${raisonSociale} ${type} ${ville}`.trim() || 'Structure sans nom';
  };

  // Synchroniser la structure sélectionnée avec l'entité sélectionnée du hook générique
  const handleStructureSelect = useCallback((structure) => {
    setSelectedStructure(structure);
    searchHook.setSelectedEntity(structure);
  }, [searchHook]);

  // Effacer la sélection de structure
  const clearStructureSelection = useCallback(() => {
    setSelectedStructure(null);
    searchHook.clearSelection();
  }, [searchHook]);

  // API retournée (pour compatibilité avec le code existant)
  return {
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés et méthodes spécifiques à useStructureSearch (pour compatibilité)
    structure: searchHook.selectedEntity || selectedStructure,
    setStructure: handleStructureSelect,
    clearStructure: clearStructureSelection,
    
    // Aliases supplémentaires pour compatibilité
    searchStructures: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch
  };
};

export default useStructureSearch;