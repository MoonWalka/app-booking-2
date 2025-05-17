import { useState, useCallback } from 'react';
import useGenericEntitySearch from '../common/useGenericEntitySearch';

/**
 * Hook pour la recherche d'artistes
 * Version migrée utilisant useGenericEntitySearch
 * 
 * @param {string} initialTerm - Terme de recherche initial
 * @returns {Object} API de recherche d'artistes
 */
const useArtisteSearch = (initialTerm = '') => {
  // Utilisation du hook générique avec configuration pour les artistes
  const searchHook = useGenericEntitySearch({
    collectionName: 'artistes',
    searchFields: ['nom', 'style', 'tags'],
    initialSearchTerm: initialTerm,
    transformResult: (artiste) => ({
      ...artiste,
      // Formatage pour affichage dans les dropdowns
      displayName: formatArtisteName(artiste)
    })
  });

  // État local pour gérer l'artiste sélectionné (pour compatibilité API)
  const [selectedArtiste, setSelectedArtiste] = useState(null);

  // Fonction utilitaire pour formater le nom d'affichage d'un artiste
  const formatArtisteName = (artiste) => {
    if (!artiste) return 'Artiste inconnu';
    
    const nom = artiste.nom || '';
    const style = artiste.style || '';
    
    return style ? `${nom} (${style})` : nom || 'Artiste sans nom';
  };

  // Synchroniser l'artiste sélectionné avec l'entité sélectionnée du hook générique
  const handleArtisteSelect = useCallback((artiste) => {
    setSelectedArtiste(artiste);
    searchHook.setSelectedEntity(artiste);
  }, [searchHook]);

  // Effacer la sélection d'artiste
  const clearArtisteSelection = useCallback(() => {
    setSelectedArtiste(null);
    searchHook.clearSelection();
  }, [searchHook]);

  // API retournée (pour compatibilité avec le code existant)
  return {
    // Propriétés et méthodes du hook générique
    ...searchHook,
    
    // Propriétés et méthodes spécifiques à useArtisteSearch (pour compatibilité)
    artiste: searchHook.selectedEntity || selectedArtiste,
    setArtiste: handleArtisteSelect,
    clearArtiste: clearArtisteSelection,
    
    // Aliases supplémentaires pour compatibilité
    searchArtistes: searchHook.refreshSearch,
    resetSearch: searchHook.clearSearch
  };
};

export default useArtisteSearch;