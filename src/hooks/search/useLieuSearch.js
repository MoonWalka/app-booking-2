import { useState, useCallback } from 'react';
import useGenericEntitySearch from '../common/useGenericEntitySearch';

/**
 * Hook pour la recherche de lieux
 * Version migrée utilisant useGenericEntitySearch
 * 
 * @param {string} initialTerm - Terme de recherche initial
 * @returns {Object} API de recherche de lieux
 */
const useLieuSearch = (initialTerm = '') => {
  // Utilisation du hook générique avec configuration pour les lieux
  const searchHook = useGenericEntitySearch({
    collectionName: 'lieux',
    searchFields: ['nom', 'ville', 'codePostal'],
    initialSearchTerm: initialTerm,
    transformResult: (lieu) => ({
      ...lieu,
      // Formatage pour affichage dans les dropdowns
      displayName: lieu.nom ? `${lieu.nom}${lieu.ville ? ` (${lieu.ville}${lieu.codePostal ? `, ${lieu.codePostal}` : ''})` : ''}` : 'Lieu sans nom'
    })
  });

  // État local pour gérer le lieu sélectionné (pour compatibilité API)
  const [selectedLieu, setSelectedLieu] = useState(null);

  // Synchroniser le lieu sélectionné avec l'entité sélectionnée du hook générique
  const handleLieuSelect = useCallback((lieu) => {
    setSelectedLieu(lieu);
    searchHook.setSelectedEntity(lieu);
  }, [searchHook]);

  // Effacer la sélection de lieu
  const clearLieuSelection = useCallback(() => {
    setSelectedLieu(null);
    searchHook.clearSelection();
  }, [searchHook]);

  // API retournée (pour compatibilité avec le code existant)
  return {
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés et méthodes spécifiques à useLieuSearch (pour compatibilité)
    lieu: searchHook.selectedEntity || selectedLieu,
    setLieu: handleLieuSelect,
    clearLieu: clearLieuSelection,
    
    // Aliases supplémentaires pour compatibilité
    searchLieux: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch
  };
};

export default useLieuSearch;