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
  
  // Utiliser l'entrée lieux si fournie, sinon utiliser les entités du hook générique
  // Ajouter un fallback sur un tableau vide pour éviter les erreurs "undefined is not an object"
  const currentLieux = lieux.length > 0 ? lieux : (genericList.entities || []);
  
  // Adaptation de l'API pour assurer la compatibilité avec l'ancien hook
  const compatibleAPI = {
    // Données principales
    lieux: currentLieux,
    // S'assurer que filteredLieux est toujours un tableau pour éviter l'erreur "undefined is not an object"
    filteredLieux: genericList.entities || [],
    loading: genericList.loading,
    error: genericList.error,
    
    // Recherche
    searchTerm: genericList.search || '', // Assurer une valeur par défaut
    setSearchTerm: genericList.setSearch,
    
    // Filtres spécifiques aux lieux
    filterType: genericList.filters && genericList.filters.length > 0 
      ? genericList.filters.find(f => f.field === 'type')?.value || 'tous' 
      : 'tous',
    setFilterType: (type) => {
      if (type === 'tous') {
        genericList.removeFilter('type');
      } else {
        genericList.applyFilter({ field: 'type', operator: '==', value: type });
      }
    },
    
    filterRegion: genericList.filters && genericList.filters.length > 0 
      ? genericList.filters.find(f => f.field === 'region')?.value || 'toutes' 
      : 'toutes',
    setFilterRegion: (region) => {
      if (region === 'toutes') {
        genericList.removeFilter('region');
      } else {
        genericList.applyFilter({ field: 'region', operator: '==', value: region });
      }
    },
    
    filterVille: genericList.filters && genericList.filters.length > 0 
      ? genericList.filters.find(f => f.field === 'ville')?.value || 'toutes' 
      : 'toutes',
    setFilterVille: (ville) => {
      if (ville === 'toutes') {
        genericList.removeFilter('ville');
      } else {
        genericList.applyFilter({ field: 'ville', operator: '==', value: ville });
      }
    },
    
    // Réinitialisation des filtres
    resetFilters: () => {
      if (genericList.filters && genericList.filters.length > 0) {
        genericList.filters.forEach(filter => genericList.removeFilter(filter.field));
      }
      genericList.setSearch('');
    },
    
    // Fonctions supplémentaires
    refresh: genericList.refresh,
  };
  
  // Calculs dérivés pour la compatibilité avec l'ancien hook
  const types = useMemo(() => {
    // Protéger contre undefined en utilisant un tableau vide comme fallback
    if (!currentLieux || !Array.isArray(currentLieux)) return ['tous'];
    
    // Extraire les types uniques des lieux pour les options de filtrage
    const uniqueTypes = [...new Set(currentLieux
      .map(lieu => lieu?.type)
      .filter(Boolean))];
    return ['tous', ...uniqueTypes];
  }, [currentLieux]);
  
  const regions = useMemo(() => {
    // Protéger contre undefined en utilisant un tableau vide comme fallback
    if (!currentLieux || !Array.isArray(currentLieux)) return ['toutes'];
    
    // Extraire les régions uniques des lieux pour les options de filtrage
    const uniqueRegions = [...new Set(currentLieux
      .map(lieu => lieu?.region)
      .filter(Boolean))];
    return ['toutes', ...uniqueRegions];
  }, [currentLieux]);
  
  const villes = useMemo(() => {
    // Protéger contre undefined en utilisant un tableau vide comme fallback
    if (!currentLieux || !Array.isArray(currentLieux)) return ['toutes'];
    
    // Extraire les villes uniques des lieux pour les options de filtrage
    const uniqueVilles = [...new Set(currentLieux
      .map(lieu => lieu?.ville)
      .filter(Boolean))];
    return ['toutes', ...uniqueVilles];
  }, [currentLieux]);
  
  return {
    ...compatibleAPI,
    types,
    regions,
    villes
  };
};

export default useLieuxFiltersMigrated;