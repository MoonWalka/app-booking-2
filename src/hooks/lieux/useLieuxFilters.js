// src/hooks/lieux/useLieuxFilters.js
import { useState, useMemo, useCallback } from 'react';
import { useGenericEntityList } from '@/hooks/generics';

/**
 * Hook optimisé pour la gestion des filtres et de la recherche de lieux
 * 
 * Version améliorée avec une API plus directe et une meilleure performance
 * 
 * @param {Array} lieux - Liste de lieux préchargés (optionnel)
 * @returns {Object} API de filtrage et recherche de lieux
 */
const useLieuxFilters = (lieux = []) => {
  // Options de tri disponibles
  const [sortOption, setSortOption] = useState('nomAsc');

  // Configuration du hook générique
  const filterConfig = {
    type: { type: 'equals' },
    region: { type: 'equals' },
    ville: { type: 'equals' },
    actif: { type: 'equals' }
  };
  
  // Utiliser useGenericEntityList avec la bonne configuration
  const {
    entities: filteredLieux,
    loading,
    error,
    search: searchTerm,
    setSearch: setSearchTerm,
    filters = [], // Added default empty array in case filters is undefined
    applyFilter,
    removeFilter,
    resetFilters: clearAllFilters,
    refresh
  } = useGenericEntityList({
    // Configuration de base
    collectionName: 'lieux',
    initialItems: lieux,
    paginationMode: lieux.length > 0 ? 'client' : 'server',
    
    // Configuration de recherche et filtrage
    filterConfig,
    searchFields: ['nom', 'ville', 'adresse', 'codePostal'],
    
    // Configuration du tri initiale
    initialSortField: 'nom',
    initialSortDirection: 'asc',
    
    // Options avancées
    transformItem: (lieu) => ({
      ...lieu,
      displayLabel: lieu.nom ? `${lieu.nom} - ${lieu.ville || 'Ville non spécifiée'}` : 'Lieu sans nom',
    }),
    cacheResults: false, // Désactiver le cache pour les performances
  });

  // Gestion du tri des lieux
  const sortedLieux = useMemo(() => {
    if (!filteredLieux || filteredLieux.length === 0) return [];
    
    const sorted = [...filteredLieux];
    
    switch (sortOption) {
      case 'nomAsc':
        return sorted.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
      case 'nomDesc':
        return sorted.sort((a, b) => (b.nom || '').localeCompare(a.nom || ''));
      case 'villeAsc':
        return sorted.sort((a, b) => (a.ville || '').localeCompare(b.ville || ''));
      case 'villeDesc':
        return sorted.sort((a, b) => (b.ville || '').localeCompare(a.ville || ''));
      case 'capaciteAsc':
        return sorted.sort((a, b) => ((a.capacite || 0) - (b.capacite || 0)));
      case 'capaciteDesc':
        return sorted.sort((a, b) => ((b.capacite || 0) - (a.capacite || 0)));
      case 'dateCreationAsc':
        return sorted.sort((a, b) => (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0));
      case 'dateCreationDesc':
        return sorted.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      default:
        return sorted;
    }
  }, [filteredLieux, sortOption]);

  // Extraction du filtre par type actuel
  const filterType = useMemo(() => {
    const typeFilter = filters.find(f => f.field === 'type');
    return typeFilter ? typeFilter.value : 'tous';
  }, [filters]);
  
  // Méthode pour définir le filtre par type
  const setFilterType = useCallback((type) => {
    if (type === 'tous') {
      removeFilter('type');
    } else {
      applyFilter({ field: 'type', operator: '==', value: type });
    }
  }, [applyFilter, removeFilter]);

  // Extraction des options de filtre disponibles
  const types = useMemo(() => {
    if (!lieux || !Array.isArray(lieux)) return ['tous'];
    
    const uniqueTypes = [...new Set(lieux
      .map(lieu => lieu?.type)
      .filter(Boolean))];
    return ['tous', ...uniqueTypes];
  }, [lieux]);

  // Fonction de réinitialisation complète
  const resetFilters = useCallback(() => {
    clearAllFilters();
    setSearchTerm('');
    setSortOption('nomAsc');
  }, [clearAllFilters, setSearchTerm]);

  return {
    // Données
    filteredLieux: sortedLieux,
    loading,
    error,
    
    // Recherche
    searchTerm: searchTerm || '',
    setSearchTerm,
    
    // Filtres
    filterType,
    setFilterType,
    types,
    
    // Tri
    sortOption,
    setSortOption,
    
    // Actions
    resetFilters,
    refresh
  };
};

export default useLieuxFilters;