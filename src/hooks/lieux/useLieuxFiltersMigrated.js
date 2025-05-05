// src/hooks/lieux/useLieuxFiltersMigrated.js
import { useMemo } from 'react';
import { useGenericEntityList } from '@/hooks/common';

/**
 * Hook migré pour la gestion des filtres et de la recherche de lieux
 * 
 * Utilise useGenericEntityList comme base tout en maintenant l'API compatible 
 * avec le hook original useLieuxFilters
 * 
 * @param {Array} lieux - Liste de lieux préchargés (optionnel)
 * @returns {Object} API de filtrage et recherche de lieux
 */
const useLieuxFiltersMigrated = (lieux = []) => {
  // Configuration du hook générique
  const filterConfig = {
    type: { type: 'equals' },
    region: { type: 'equals' },
    ville: { type: 'equals' }
  };
  
  // Utiliser useGenericEntityList avec la bonne configuration
  const genericList = useGenericEntityList({
    // Configuration de base
    collectionName: 'lieux',
    initialItems: lieux,
    paginationMode: lieux.length > 0 ? 'client' : 'server',
    
    // Configuration de recherche et filtrage
    filterConfig,
    searchFields: ['nom', 'ville', 'adresse'],
    
    // Configuration du tri
    initialSortField: 'nom',
    initialSortDirection: 'asc',
    
    // Options avancées
    transformItem: (lieu) => ({
      ...lieu,
      displayLabel: lieu.nom ? `${lieu.nom} - ${lieu.ville || 'Ville non spécifiée'}` : 'Lieu sans nom',
    }),
    cacheResults: true,
  });
  
  // Adaptation de l'API pour assurer la compatibilité avec l'ancien hook
  const compatibleAPI = {
    // Données principales
    lieux: genericList.allItems,
    filteredLieux: genericList.items,
    loading: genericList.loading,
    error: genericList.error,
    
    // Recherche
    searchTerm: genericList.searchTerm,
    setSearchTerm: genericList.setSearchTerm,
    
    // Filtres spécifiques aux lieux
    filterType: genericList.filters.type || 'tous',
    setFilterType: (type) => genericList.setFilter('type', type === 'tous' ? null : type),
    
    filterRegion: genericList.filters.region || 'toutes',
    setFilterRegion: (region) => genericList.setFilter('region', region === 'toutes' ? null : region),
    
    filterVille: genericList.filters.ville || 'toutes',
    setFilterVille: (ville) => genericList.setFilter('ville', ville === 'toutes' ? null : ville),
    
    // Réinitialisation des filtres
    resetFilters: genericList.resetFilters,
    
    // Fonctions supplémentaires
    refresh: genericList.refresh,
  };
  
  // Calculs dérivés pour la compatibilité avec l'ancien hook
  const types = useMemo(() => {
    // Extraire les types uniques des lieux pour les options de filtrage
    const uniqueTypes = [...new Set(genericList.allItems
      .map(lieu => lieu.type)
      .filter(Boolean))];
    return ['tous', ...uniqueTypes];
  }, [genericList.allItems]);
  
  const regions = useMemo(() => {
    // Extraire les régions uniques des lieux pour les options de filtrage
    const uniqueRegions = [...new Set(genericList.allItems
      .map(lieu => lieu.region)
      .filter(Boolean))];
    return ['toutes', ...uniqueRegions];
  }, [genericList.allItems]);
  
  const villes = useMemo(() => {
    // Extraire les villes uniques des lieux pour les options de filtrage
    const uniqueVilles = [...new Set(genericList.allItems
      .map(lieu => lieu.ville)
      .filter(Boolean))];
    return ['toutes', ...uniqueVilles];
  }, [genericList.allItems]);
  
  return {
    ...compatibleAPI,
    types,
    regions,
    villes
  };
};

export default useLieuxFiltersMigrated;