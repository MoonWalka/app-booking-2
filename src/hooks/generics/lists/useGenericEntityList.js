/**
 * @fileoverview Hook générique pour la gestion des listes d'entités avec pagination
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 2
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 2
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import useGenericDataFetcher from '../data/useGenericDataFetcher';
import useGenericFilteredSearch from '../search/useGenericFilteredSearch';

/**
 * Hook générique pour la gestion des listes d'entités avec pagination
 * 
 * @description
 * Fonctionnalités supportées :
 * - pagination: Pagination avancée (offset, cursor, infinite scroll)
 * - sorting: Tri multi-colonnes avec directions
 * - filtering: Intégration avec filtres avancés
 * - selection: Sélection multiple avec actions en lot
 * 
 * @param {string} entityType - Type d'entité de la liste
 * @param {Object} listConfig - Configuration de la liste
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {Array} returns.items - Éléments de la liste
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {Object} returns.pagination - Informations de pagination
 * @returns {Function} returns.goToPage - Aller à une page
 * @returns {Function} returns.loadMore - Charger plus d'éléments
 * @returns {Object} returns.sorting - Configuration du tri
 * @returns {Function} returns.setSorting - Définir le tri
 * @returns {Array} returns.selectedItems - Éléments sélectionnés
 * @returns {Function} returns.toggleSelection - Basculer la sélection
 * @returns {Function} returns.selectAll - Sélectionner tout
 * @returns {Function} returns.clearSelection - Vider la sélection
 * 
 * @example
 * ```javascript
 * // Liste simple avec pagination
 * const { 
 *   items, 
 *   loading, 
 *   pagination, 
 *   goToPage 
 * } = useGenericEntityList('concerts', {
 *   pageSize: 20,
 *   defaultSort: { field: 'date', direction: 'desc' }
 * });
 * 
 * // Liste avec filtres et sélection
 * const { 
 *   items, 
 *   selectedItems, 
 *   toggleSelection, 
 *   selectAll 
 * } = useGenericEntityList('programmateurs', {
 *   enableSelection: true,
 *   enableFilters: true,
 *   filters: {
 *     statut: { type: 'select', options: ['actif', 'inactif'] }
 *   }
 * });
 * 
 * // Liste avec infinite scroll
 * const { items, loadMore, hasMore } = useGenericEntityList('concerts', {
 *   paginationType: 'infinite',
 *   pageSize: 10
 * });
 * ```
 * 
 * @complexity HIGH
 * @businessCritical true
 * @generic true
 * @replaces useConcertsList, useProgrammateursList, useEntityList
 */
const useGenericEntityList = (entityType, listConfig = {}, options = {}) => {
  const {
    pageSize = 20,
    defaultSort = null,
    defaultFilters = {},
    enableSelection = false,
    enableFilters = false,
    enableSearch = false,
    searchFields = [],
    filters = {},
    onItemSelect,
    onItemsChange,
    onPageChange,
    transformItem = null
  } = listConfig;
  
  const {
    paginationType = 'pages', // 'pages' | 'infinite' | 'cursor'
    enableVirtualization = false,
    enableCache = true,
    enableRealTime = false,
    enableBulkActions = false,
    maxSelectionSize = null,
    autoRefresh = false,
    refreshInterval = 30000 // 30 secondes
  } = options;
  
  // États de base
  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sorting, setSorting] = useState(defaultSort);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Références
  const refreshIntervalRef = useRef(null);
  const lastCursorRef = useRef(null);
  
  // Configuration de récupération des données
  const fetchConfig = {
    mode: 'collection',
    filters: defaultFilters,
    orderBy: sorting ? {
      field: sorting.field,
      direction: sorting.direction
    } : null,
    limit: pageSize,
    onData: (newData) => {
      if (newData) {
        const processedItems = newData.map(item => 
          transformItem ? transformItem(item) : item
        );
        
        if (paginationType === 'infinite') {
          setAllItems(prev => [...prev, ...processedItems]);
        } else {
          setAllItems(processedItems);
        }
        
        setTotalCount(newData.length);
        setHasMore(newData.length === pageSize);
        
        if (onItemsChange) {
          onItemsChange(processedItems);
        }
      }
    }
  };
  
  // Hook de récupération de données
  const {
    data: items,
    loading,
    error,
    refetch,
    lastFetch
  } = useGenericDataFetcher(entityType, fetchConfig, {
    enableCache,
    enableRealTime,
    autoFetch: true
  });
  
  // Hook de recherche et filtres (si activé)
  const searchAndFilterHook = useGenericFilteredSearch(
    entityType,
    enableFilters || enableSearch ? {
      availableFilters: filters,
      defaultFilters,
      searchFields,
      onResults: (results) => {
        const processedItems = results.map(item => 
          transformItem ? transformItem(item) : item
        );
        setAllItems(processedItems);
        setTotalCount(results.length);
        
        if (onItemsChange) {
          onItemsChange(processedItems);
        }
      }
    } : {},
    {
      autoApplyFilters: true,
      enableDebounce: true
    }
  );
  
  // Utiliser les résultats de recherche/filtres si disponibles
  const finalItems = (enableFilters || enableSearch) && searchAndFilterHook.results 
    ? searchAndFilterHook.results 
    : allItems;
  
  // Calcul de la pagination
  const pagination = {
    currentPage,
    pageSize,
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    hasNext: currentPage < Math.ceil(totalCount / pageSize),
    hasPrevious: currentPage > 1,
    startIndex: (currentPage - 1) * pageSize,
    endIndex: Math.min(currentPage * pageSize, totalCount)
  };
  
  // Navigation de pagination
  const goToPage = useCallback((page) => {
    if (page < 1 || page > pagination.totalPages) return;
    
    setCurrentPage(page);
    
    if (onPageChange) {
      onPageChange(page);
    }
    
    // Refetch avec la nouvelle page
    refetch();
  }, [pagination.totalPages, onPageChange, refetch]);
  
  const goToNextPage = useCallback(() => {
    if (pagination.hasNext) {
      goToPage(currentPage + 1);
    }
  }, [pagination.hasNext, currentPage, goToPage]);
  
  const goToPreviousPage = useCallback(() => {
    if (pagination.hasPrevious) {
      goToPage(currentPage - 1);
    }
  }, [pagination.hasPrevious, currentPage, goToPage]);
  
  // Chargement infini
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    if (paginationType === 'infinite') {
      // Pour l'infinite scroll, on ajoute à la liste existante
      setCurrentPage(prev => prev + 1);
      refetch();
    }
  }, [loading, hasMore, paginationType, refetch]);
  
  // Gestion du tri
  const handleSortChange = useCallback((field, direction = 'asc') => {
    const newSorting = { field, direction };
    setSorting(newSorting);
    
    // Reset à la première page lors du changement de tri
    setCurrentPage(1);
    
    if (paginationType === 'infinite') {
      setAllItems([]); // Vider la liste pour infinite scroll
    }
    
    // Refetch avec le nouveau tri
    refetch();
  }, [paginationType, refetch]);
  
  const toggleSort = useCallback((field) => {
    const newDirection = sorting?.field === field && sorting?.direction === 'asc' 
      ? 'desc' 
      : 'asc';
    handleSortChange(field, newDirection);
  }, [sorting, handleSortChange]);
  
  // Gestion de la sélection
  const isSelected = useCallback((item) => {
    return selectedItems.some(selected => selected.id === item.id);
  }, [selectedItems]);
  
  const toggleSelection = useCallback((item) => {
    if (!enableSelection) return;
    
    setSelectedItems(prev => {
      const isCurrentlySelected = prev.some(selected => selected.id === item.id);
      let newSelection;
      
      if (isCurrentlySelected) {
        newSelection = prev.filter(selected => selected.id !== item.id);
      } else {
        // Vérifier la limite de sélection
        if (maxSelectionSize && prev.length >= maxSelectionSize) {
          console.warn(`⚠️ Limite de sélection atteinte: ${maxSelectionSize}`);
          return prev;
        }
        newSelection = [...prev, item];
      }
      
      if (onItemSelect) {
        onItemSelect(item, !isCurrentlySelected, newSelection);
      }
      
      return newSelection;
    });
  }, [enableSelection, maxSelectionSize, onItemSelect]);
  
  const selectAll = useCallback(() => {
    if (!enableSelection) return;
    
    const itemsToSelect = finalItems.filter(item => !isSelected(item));
    
    // Vérifier la limite de sélection
    if (maxSelectionSize && selectedItems.length + itemsToSelect.length > maxSelectionSize) {
      const remainingSlots = maxSelectionSize - selectedItems.length;
      const limitedSelection = [...selectedItems, ...itemsToSelect.slice(0, remainingSlots)];
      setSelectedItems(limitedSelection);
      console.warn(`⚠️ Sélection limitée à ${maxSelectionSize} éléments`);
    } else {
      setSelectedItems(prev => [...prev, ...itemsToSelect]);
    }
  }, [enableSelection, finalItems, isSelected, selectedItems, maxSelectionSize]);
  
  const selectNone = useCallback(() => {
    setSelectedItems([]);
  }, []);
  
  const clearSelection = useCallback(() => {
    selectNone();
  }, [selectNone]);
  
  // Sélection par plage
  const selectRange = useCallback((startIndex, endIndex) => {
    if (!enableSelection) return;
    
    const rangeItems = finalItems.slice(startIndex, endIndex + 1);
    const newSelection = [...selectedItems];
    
    rangeItems.forEach(item => {
      if (!newSelection.some(selected => selected.id === item.id)) {
        if (!maxSelectionSize || newSelection.length < maxSelectionSize) {
          newSelection.push(item);
        }
      }
    });
    
    setSelectedItems(newSelection);
  }, [enableSelection, finalItems, selectedItems, maxSelectionSize]);
  
  // Actions en lot
  const bulkActions = {
    delete: useCallback(async (items = selectedItems) => {
      if (!enableBulkActions) return;
      
      // TODO: Implémenter la suppression en lot
      console.log('🗑️ Suppression en lot:', items.length, 'éléments');
    }, [enableBulkActions, selectedItems]),
    
    update: useCallback(async (updates, items = selectedItems) => {
      if (!enableBulkActions) return;
      
      // TODO: Implémenter la mise à jour en lot
      console.log('🔄 Mise à jour en lot:', items.length, 'éléments');
    }, [enableBulkActions, selectedItems]),
    
    export: useCallback((format = 'json', items = selectedItems) => {
      if (!enableBulkActions) return;
      
      // TODO: Implémenter l'export
      console.log('📤 Export en lot:', items.length, 'éléments', 'format:', format);
    }, [enableBulkActions, selectedItems])
  };
  
  // Rafraîchissement automatique
  const startAutoRefresh = useCallback(() => {
    if (!autoRefresh) return;
    
    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 Rafraîchissement automatique de la liste');
      refetch();
    }, refreshInterval);
  }, [autoRefresh, refreshInterval, refetch]);
  
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);
  
  // Recherche dans la liste
  const searchInList = useCallback((searchTerm) => {
    if (!enableSearch || !searchAndFilterHook.setSearchTerm) return;
    
    searchAndFilterHook.setSearchTerm(searchTerm);
  }, [enableSearch, searchAndFilterHook]);
  
  // Filtrage de la liste
  const setFilter = useCallback((filterKey, value) => {
    if (!enableFilters || !searchAndFilterHook.setFilter) return;
    
    searchAndFilterHook.setFilter(filterKey, value);
  }, [enableFilters, searchAndFilterHook]);
  
  // Réinitialisation de la liste
  const resetList = useCallback(() => {
    setCurrentPage(1);
    setAllItems([]);
    setSelectedItems([]);
    setSorting(defaultSort);
    
    if (enableFilters && searchAndFilterHook.clearFilters) {
      searchAndFilterHook.clearFilters();
    }
    
    if (enableSearch && searchAndFilterHook.clearSearch) {
      searchAndFilterHook.clearSearch();
    }
    
    refetch();
  }, [defaultSort, enableFilters, enableSearch, searchAndFilterHook, refetch]);
  
  // Effet de rafraîchissement automatique
  useEffect(() => {
    if (autoRefresh) {
      startAutoRefresh();
    }
    
    return () => {
      stopAutoRefresh();
    };
  }, [autoRefresh, startAutoRefresh, stopAutoRefresh]);
  
  // Effet de nettoyage de la sélection lors du changement d'éléments
  useEffect(() => {
    if (enableSelection && selectedItems.length > 0) {
      // Nettoyer les éléments sélectionnés qui ne sont plus dans la liste
      const validSelection = selectedItems.filter(selected =>
        finalItems.some(item => item.id === selected.id)
      );
      
      if (validSelection.length !== selectedItems.length) {
        setSelectedItems(validSelection);
      }
    }
  }, [enableSelection, selectedItems, finalItems]);
  
  return {
    // Données
    items: finalItems,
    loading,
    error,
    
    // Pagination
    pagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    loadMore,
    hasMore,
    
    // Tri
    sorting,
    setSorting: handleSortChange,
    toggleSort,
    
    // Sélection
    selectedItems,
    isSelected,
    toggleSelection,
    selectAll,
    selectNone,
    clearSelection,
    selectRange,
    
    // Actions en lot
    bulkActions,
    
    // Recherche et filtres
    searchInList,
    setFilter,
    searchTerm: searchAndFilterHook?.searchTerm,
    activeFilters: searchAndFilterHook?.activeFilters,
    
    // Utilitaires
    refetch,
    resetList,
    lastFetch,
    
    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,
    
    // Statistiques
    stats: {
      totalItems: totalCount,
      selectedCount: selectedItems.length,
      currentPageItems: finalItems.length,
      selectionRate: totalCount > 0 ? (selectedItems.length / totalCount) * 100 : 0
    }
  };
};

export default useGenericEntityList; 