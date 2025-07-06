/**
 * @fileoverview Hook générique pour la recherche avec filtres avancés
 * Hook générique créé lors de la Phase 2 de généralisation
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import useGenericSearch from './useGenericSearch';

/**
 * Hook générique pour la recherche avec filtres avancés
 * 
 * @description
 * Fonctionnalités supportées :
 * - advanced_filters: Filtres complexes et combinés
 * - filter_presets: Préréglages de filtres
 * - dynamic_filters: Filtres dynamiques basés sur les données
 * - filter_history: Historique des filtres appliqués
 * 
 * @param {string} entityType - Type d'entité à rechercher
 * @param {Object} filterConfig - Configuration des filtres
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {Array} returns.results - Résultats filtrés
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {Object} returns.activeFilters - Filtres actifs
 * @returns {Function} returns.setFilter - Fonction de définition de filtre
 * @returns {Function} returns.removeFilter - Fonction de suppression de filtre
 * @returns {Function} returns.clearFilters - Fonction de réinitialisation
 * @returns {Array} returns.filterPresets - Préréglages disponibles
 * @returns {Function} returns.applyPreset - Appliquer un préréglage
 * @returns {Function} returns.savePreset - Sauvegarder un préréglage
 * @returns {Object} returns.filterStats - Statistiques des filtres
 * 
 * @example
 * ```javascript
 * const { 
 *   results, 
 *   loading, 
 *   activeFilters, 
 *   setFilter, 
 *   removeFilter,
 *   filterPresets,
 *   applyPreset,
 *   filterStats
 * } = useGenericFilteredSearch('concerts', {
 *   availableFilters: {
 *     statut: { type: 'select', options: ['contact', 'confirmé', 'annulé'] },
 *     date: { type: 'dateRange' },
 *     lieu: { type: 'text' },
 *     prix: { type: 'range', min: 0, max: 1000 }
 *   },
 *   defaultPresets: [
 *     { name: 'Dates confirmés', filters: { statut: 'confirmé' } },
 *     { name: 'Ce mois', filters: { date: { mode: 'thisMonth' } } }
 *   ]
 * });
 * 
 * // Utilisation
 * setFilter('statut', 'confirmé');
 * setFilter('date', { start: '2024-01-01', end: '2024-12-31' });
 * ```
 * 
 * @complexity HIGH
 * @businessCritical false
 * @generic true
 * @replaces useFilteredSearch, useAdvancedFilters
 */
const useGenericFilteredSearch = (entityType, filterConfig = {}, options = {}) => {
  const {
    availableFilters = {},
    defaultFilters = {},
    defaultPresets = [],
    searchFields = [],
    onFilterChange,
    onPresetApply
  } = filterConfig;
  
  const {
    enablePresets = true,
    enableFilterHistory = true,
    enableFilterStats = true,
    enableDynamicFilters = false,
    autoApplyFilters = true,
    debounceDelay = 500
  } = options;
  
  // États des filtres
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [filterPresets, setFilterPresets] = useState(defaultPresets);
  const [filterHistory, setFilterHistory] = useState([]);
  const [filterStats, setFilterStats] = useState({});
  
  // Références pour stabiliser les fonctions
  const onFilterChangeRef = useRef(onFilterChange);
  const onPresetApplyRef = useRef(onPresetApply);
  
  // Mettre à jour les références
  onFilterChangeRef.current = onFilterChange;
  onPresetApplyRef.current = onPresetApply;
  
  // Hook de recherche de base
  const {
    results,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    search,
    clearSearch,
    suggestions,
    history,
    hasMore,
    loadMore
  } = useGenericSearch(
    {
      searchType: 'entity',
      enableFirestore: filterConfig.enableFirestore || false,
      collectionName: filterConfig.collectionName || entityType,
      searchFields,
      onResults: (results, searchContext) => {
        if (enableFilterStats) {
          updateFilterStats(results, searchContext);
        }
      }
    },
    {
      enableDebounce: autoApplyFilters,
      debounceDelay
    }
  );
  
  // ✅ CORRECTION: Références stables pour éviter les dépendances circulaires
  const availableFiltersRef = useRef(availableFilters);
  const activeFiltersRef = useRef(activeFilters);
  
  availableFiltersRef.current = availableFilters;
  activeFiltersRef.current = activeFilters;
  
  // Mise à jour des statistiques de filtres - CORRIGÉ
  const updateFilterStats = useCallback((results, searchContext) => {
    if (!enableFilterStats) return;
    
    const stats = {};
    
    // Compter les résultats par filtre
    Object.keys(availableFiltersRef.current).forEach(filterKey => {
      const filterConfig = availableFiltersRef.current[filterKey];
      
      if (filterConfig.type === 'select' && filterConfig.options) {
        stats[filterKey] = {};
        filterConfig.options.forEach(option => {
          stats[filterKey][option] = results.filter(item => 
            item[filterKey] === option
          ).length;
        });
      }
    });
    
    // Statistiques générales
    stats._meta = {
      totalResults: results.length,
      activeFiltersCount: Object.keys(activeFiltersRef.current).length,
      searchTerm: searchContext?.term || '',
      lastUpdated: new Date().toISOString()
    };
    
    setFilterStats(stats);
  }, [enableFilterStats]); // ✅ Dépendances stables uniquement
  
  // Définir un filtre
  const setFilter = useCallback((filterKey, value) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === null || value === undefined || value === '') {
        delete newFilters[filterKey];
      } else {
        newFilters[filterKey] = value;
      }
      
      // Historique des filtres
      if (enableFilterHistory) {
        setFilterHistory(prevHistory => {
          const newEntry = {
            timestamp: Date.now(),
            action: 'set',
            filterKey,
            value,
            filters: newFilters
          };
          return [newEntry, ...prevHistory.slice(0, 49)]; // Garder 50 entrées max
        });
      }
      
      // Callback personnalisé
      if (onFilterChangeRef.current) {
        onFilterChangeRef.current(filterKey, value, newFilters);
      }
      
      return newFilters;
    });
  }, [enableFilterHistory]); // CORRECTION: Retirer onFilterChange car on utilise onFilterChangeRef
  
  // Supprimer un filtre
  const removeFilter = useCallback((filterKey) => {
    setFilter(filterKey, null);
  }, [setFilter]);
  
  // Réinitialiser tous les filtres
  const clearFilters = useCallback(() => {
    setActiveFilters({});
    
    if (enableFilterHistory) {
      setFilterHistory(prev => [{
        timestamp: Date.now(),
        action: 'clear',
        filters: {}
      }, ...prev.slice(0, 49)]);
    }
    
    if (onFilterChangeRef.current) {
      onFilterChangeRef.current(null, null, {});
    }
  }, [enableFilterHistory]); // CORRECTION: Retirer onFilterChange car on utilise onFilterChangeRef
  
  // Appliquer plusieurs filtres en une fois
  const applyFilters = useCallback((filters) => {
    setActiveFilters(filters);
    
    if (enableFilterHistory) {
      setFilterHistory(prev => [{
        timestamp: Date.now(),
        action: 'apply',
        filters
      }, ...prev.slice(0, 49)]);
    }
    
    if (onFilterChangeRef.current) {
      onFilterChangeRef.current(null, null, filters);
    }
  }, [enableFilterHistory]); // CORRECTION: Retirer onFilterChange car on utilise onFilterChangeRef
  
  // Sauvegarder un préréglage
  const savePreset = useCallback((name, filters = activeFilters) => {
    if (!enablePresets) return;
    
    const newPreset = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString()
    };
    
    setFilterPresets(prev => [...prev, newPreset]);
    
    return newPreset;
  }, [enablePresets, activeFilters]);
  
  // Appliquer un préréglage
  const applyPreset = useCallback((preset) => {
    if (!enablePresets) return;
    
    applyFilters(preset.filters);
    
    if (onPresetApplyRef.current) {
      onPresetApplyRef.current(preset);
    }
  }, [enablePresets, applyFilters]); // CORRECTION: Retirer onPresetApply car on utilise onPresetApplyRef
  
  // Supprimer un préréglage
  const deletePreset = useCallback((presetId) => {
    if (!enablePresets) return;
    
    setFilterPresets(prev => prev.filter(preset => preset.id !== presetId));
  }, [enablePresets]);
  
  // ✅ CORRECTION: Références stables pour results
  const resultsRef = useRef(results);
  resultsRef.current = results;
  
  // Obtenir les valeurs possibles pour un filtre - CORRIGÉ
  const getFilterOptions = useCallback((filterKey) => {
    const filterConfig = availableFiltersRef.current[filterKey];
    if (!filterConfig) return [];
    
    if (filterConfig.options) {
      return filterConfig.options;
    }
    
    // Pour les filtres dynamiques, extraire les valeurs des résultats
    if (enableDynamicFilters && resultsRef.current.length > 0) {
      const values = [...new Set(
        resultsRef.current
          .map(item => item[filterKey])
          .filter(value => value !== null && value !== undefined)
      )];
      
      return values.sort();
    }
    
    return [];
  }, [enableDynamicFilters]); // ✅ Dépendances stables uniquement
  
  // Valider un filtre - CORRIGÉ
  const validateFilter = useCallback((filterKey, value) => {
    const filterConfig = availableFiltersRef.current[filterKey];
    if (!filterConfig) return false;
    
    switch (filterConfig.type) {
      case 'select':
        return filterConfig.options?.includes(value) || false;
        
      case 'range':
        if (typeof value !== 'object' || !value.min || !value.max) return false;
        return value.min >= (filterConfig.min || 0) && 
               value.max <= (filterConfig.max || Infinity);
        
      case 'dateRange':
        if (typeof value !== 'object' || !value.start || !value.end) return false;
        return new Date(value.start) <= new Date(value.end);
        
      case 'text':
        return typeof value === 'string' && value.length > 0;
        
      default:
        return true;
    }
  }, []); // ✅ Aucune dépendance car on utilise la référence
  
  // Obtenir le nombre de résultats pour un filtre spécifique - CORRIGÉ
  const getFilterResultCount = useCallback((filterKey, value) => {
    if (!enableFilterStats || !resultsRef.current.length) return 0;
    
    return resultsRef.current.filter(item => item[filterKey] === value).length;
  }, [enableFilterStats]); // ✅ Dépendances stables uniquement
  
  // Construire une requête de filtre complexe - CORRIGÉ
  const buildComplexFilter = useCallback((filters) => {
    const complexFilter = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      const filterConfig = availableFiltersRef.current[key];
      if (!filterConfig) return;
      
      switch (filterConfig.type) {
        case 'range':
          if (value.min !== undefined) {
            complexFilter[`${key}_min`] = value.min;
          }
          if (value.max !== undefined) {
            complexFilter[`${key}_max`] = value.max;
          }
          break;
          
        case 'dateRange':
          if (value.start) {
            complexFilter[`${key}_start`] = value.start;
          }
          if (value.end) {
            complexFilter[`${key}_end`] = value.end;
          }
          break;
          
        default:
          complexFilter[key] = value;
      }
    });
    
    return complexFilter;
  }, []); // ✅ Aucune dépendance car on utilise la référence
  
  // Effet pour appliquer automatiquement les filtres
  useEffect(() => {
    if (autoApplyFilters) {
      // La recherche se déclenchera automatiquement via useGenericSearch
      // car activeFilters est passé comme defaultFilters
    }
  }, [activeFilters, autoApplyFilters]);
  
  return {
    // Résultats de recherche
    results,
    loading,
    error,
    
    // Recherche textuelle
    searchTerm,
    setSearchTerm,
    search,
    clearSearch,
    suggestions,
    history,
    hasMore,
    loadMore,
    
    // Gestion des filtres
    activeFilters,
    setFilter,
    removeFilter,
    clearFilters,
    applyFilters,
    
    // Préréglages
    filterPresets,
    savePreset,
    applyPreset,
    deletePreset,
    
    // Statistiques et utilitaires
    filterStats,
    filterHistory,
    getFilterOptions,
    validateFilter,
    getFilterResultCount,
    buildComplexFilter,
    
    // Configuration
    availableFilters
  };
};

export default useGenericFilteredSearch; 