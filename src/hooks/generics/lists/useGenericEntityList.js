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
 * @replaces useConcertsList (SUPPRIMÉ), useProgrammateursList, useEntityList
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
  
  // États pour la virtualisation
  const [virtualizedItems, setVirtualizedItems] = useState([]);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);
  const [itemHeight, setItemHeight] = useState(50);
  
  // Références
  const refreshIntervalRef = useRef(null);
  const lastCursorRef = useRef(null);
  const virtualScrollRef = useRef(null);
  const itemHeightsRef = useRef(new Map());
  const observerRef = useRef(null);
  
  // Références pour stabiliser les fonctions
  const onItemSelectRef = useRef(onItemSelect);
  const onItemsChangeRef = useRef(onItemsChange);
  const onPageChangeRef = useRef(onPageChange);
  const transformItemRef = useRef(transformItem);
  
  // Mettre à jour les références
  onItemSelectRef.current = onItemSelect;
  onItemsChangeRef.current = onItemsChange;
  onPageChangeRef.current = onPageChange;
  transformItemRef.current = transformItem;
  
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
          transformItemRef.current ? transformItemRef.current(item) : item
        );
        
        if (paginationType === 'infinite') {
          setAllItems(prev => [...prev, ...processedItems]);
        } else {
          setAllItems(processedItems);
        }
        
        setTotalCount(newData.length);
        setHasMore(newData.length === pageSize);
        
        if (onItemsChangeRef.current) {
          onItemsChangeRef.current(processedItems);
        }
      }
    }
  };
  
  // Hook de récupération de données
  const {
    data: fetchedItems,
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
      enableFirestore: true,
      collectionName: entityType,
      onResults: (results) => {
        const processedItems = results.map(item => 
          transformItemRef.current ? transformItemRef.current(item) : item
        );
        setAllItems(processedItems);
        setTotalCount(results.length);
        
        if (onItemsChangeRef.current) {
          onItemsChangeRef.current(processedItems);
        }
      }
    } : {},
    {
      autoApplyFilters: true,
      enableDebounce: true
    }
  );
  
  // Utiliser les résultats de recherche/filtres si disponibles, mais seulement s'il y a une recherche active ou des filtres
  const hasActiveSearch = searchAndFilterHook?.searchTerm && searchAndFilterHook.searchTerm.length > 0;
  const hasActiveFilters = searchAndFilterHook?.activeFilters && Object.keys(searchAndFilterHook.activeFilters).length > 0;
  
  const finalItems = (enableFilters || enableSearch) && (hasActiveSearch || hasActiveFilters) && searchAndFilterHook.results 
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
  
  // Cache des curseurs pour navigation bidirectionnelle
  const [cursorCache, setCursorCache] = useState(new Map());
  const [currentCursor, setCurrentCursor] = useState(null);
  const [cursorLoading, setCursorLoading] = useState(false);
  const [cursorError, setCursorError] = useState(null);
  
  // Sauvegarde d'un curseur pour une page donnée
  const saveCursor = useCallback((page, cursor) => {
    if (paginationType !== 'cursor') return;
    
    setCursorCache(prev => {
      const newCache = new Map(prev);
      newCache.set(page, cursor);
      return newCache;
    });
  }, [paginationType]);
  
  // Récupération d'un curseur pour une page donnée
  const getCursor = useCallback((page) => {
    if (paginationType !== 'cursor') return null;
    return cursorCache.get(page) || null;
  }, [paginationType, cursorCache]);
  
  // Reconstruction du cache de curseurs (pour navigation vers une page éloignée)
  const rebuildCursorCache = useCallback(async (targetPage) => {
    if (paginationType !== 'cursor' || !refetch) return;
    
    
    let currentCursor = null;
    setCursorCache(new Map()); // Reset du cache
    
    // Parcourir page par page jusqu'à la cible
    for (let page = 1; page < targetPage; page++) {
      try {
        const result = await refetch({
          startAfter: currentCursor,
          limit: pageSize
        });
        
        if (result && result.length > 0) {
          const lastDoc = result[result.length - 1];
          saveCursor(page, lastDoc);
          currentCursor = lastDoc;
        } else {
          break; // Plus de données
        }
      } catch (error) {
        console.error(`❌ Erreur reconstruction page ${page}:`, error);
        break;
      }
    }
  }, [paginationType, refetch, pageSize, saveCursor]);
  
  // Navigation vers une page avec curseur
  const goToPageWithCursor = useCallback(async (targetPage) => {
    if (paginationType !== 'cursor' || !refetch) return;
    
    setCursorLoading(true);
    setCursorError(null);
    
    try {
      let cursor = null;
      
      if (targetPage > 1) {
        // Récupérer le curseur de la page précédente
        cursor = getCursor(targetPage - 1);
        
        if (!cursor) {
          console.warn(`⚠️ Curseur manquant pour la page ${targetPage - 1}`);
          // Fallback: reconstruire depuis le début
          await rebuildCursorCache(targetPage);
          cursor = getCursor(targetPage - 1);
        }
      }
      
      // Mettre à jour la référence du curseur
      lastCursorRef.current = cursor;
      setCurrentCursor(cursor);
      
      // Déclencher la requête avec le curseur
      const result = await refetch({
        startAfter: cursor,
        limit: pageSize
      });
      
      // Sauvegarder le nouveau curseur si on a des résultats
      if (result && result.length > 0) {
        const lastDoc = result[result.length - 1];
        saveCursor(targetPage, lastDoc);
      }
      
      setCurrentPage(targetPage);
      
    } catch (error) {
      console.error('❌ Erreur navigation curseur:', error);
      setCursorError(`Erreur de navigation: ${error.message}`);
    } finally {
      setCursorLoading(false);
    }
  }, [paginationType, refetch, pageSize, getCursor, saveCursor, rebuildCursorCache]);
  
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
  
  // ===== FONCTIONS DE VIRTUALISATION =====
  
  // Calcul de la plage visible pour la virtualisation
  const calculateVisibleRange = useCallback(() => {
    if (!enableVirtualization || finalItems.length === 0) {
      return { start: 0, end: finalItems.length };
    }
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      finalItems.length
    );
    
    return { start: Math.max(0, startIndex), end: endIndex };
  }, [enableVirtualization, finalItems.length, scrollTop, itemHeight, containerHeight]);
  
  // Mise à jour des éléments virtualisés
  const updateVirtualizedItems = useCallback(() => {
    if (!enableVirtualization) {
      setVirtualizedItems(finalItems);
      return;
    }
    
    const range = calculateVisibleRange();
    setVisibleRange(range);
    
    const visibleItems = finalItems.slice(range.start, range.end).map((item, index) => ({
      ...item,
      virtualIndex: range.start + index,
      virtualTop: (range.start + index) * itemHeight
    }));
    
    setVirtualizedItems(visibleItems);
  }, [enableVirtualization, finalItems, calculateVisibleRange, itemHeight]);
  
  // Gestion du scroll pour la virtualisation
  const handleVirtualScroll = useCallback((event) => {
    if (!enableVirtualization) return;
    
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    
    // Mise à jour de la plage visible avec throttling
    requestAnimationFrame(() => {
      updateVirtualizedItems();
    });
  }, [enableVirtualization, updateVirtualizedItems]);
  
  // Calcul de la hauteur totale virtualisée
  const getTotalVirtualHeight = useCallback(() => {
    if (!enableVirtualization) return 'auto';
    return finalItems.length * itemHeight;
  }, [enableVirtualization, finalItems.length, itemHeight]);
  
  // Mise à jour de la hauteur d'un élément (pour les hauteurs variables)
  const updateItemHeight = useCallback((index, height) => {
    if (!enableVirtualization) return;
    
    itemHeightsRef.current.set(index, height);
    
    // Recalculer la hauteur moyenne si on a assez d'échantillons
    const heights = Array.from(itemHeightsRef.current.values());
    if (heights.length > 10) {
      const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;
      setItemHeight(Math.round(avgHeight));
    }
  }, [enableVirtualization]);
  
  // Observer pour mesurer automatiquement les hauteurs d'éléments
  const setupItemHeightObserver = useCallback(() => {
    if (!enableVirtualization || !virtualScrollRef.current) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.dataset.virtualIndex);
        if (!isNaN(index)) {
          updateItemHeight(index, entry.contentRect.height);
        }
        
        // Mise à jour de la hauteur du conteneur si c'est le conteneur principal
        if (entry.target === virtualScrollRef.current) {
          const newHeight = entry.contentRect.height;
          if (newHeight !== containerHeight) {
            setContainerHeight(newHeight);
          }
        }
      });
    });
    
    // Observer tous les éléments visibles
    const items = virtualScrollRef.current.querySelectorAll('[data-virtual-index]');
    items.forEach(item => observerRef.current.observe(item));
    
    // Observer aussi le conteneur principal pour détecter les changements de taille
    observerRef.current.observe(virtualScrollRef.current);
  }, [enableVirtualization, updateItemHeight, containerHeight]);
  
  // Fonction de redimensionnement manuel du conteneur
  const resizeContainer = useCallback((newHeight) => {
    if (!enableVirtualization) return;
    
    setContainerHeight(newHeight);
    
    // Recalculer la plage visible avec la nouvelle hauteur
    requestAnimationFrame(() => {
      updateVirtualizedItems();
    });
    
  }, [enableVirtualization, updateVirtualizedItems]);
  
  // Fonction d'auto-ajustement de la hauteur du conteneur
  const autoResizeContainer = useCallback(() => {
    if (!enableVirtualization || !virtualScrollRef.current) return;
    
    const parentElement = virtualScrollRef.current.parentElement;
    if (parentElement) {
      const availableHeight = parentElement.clientHeight;
      const newHeight = Math.max(200, availableHeight - 20); // Minimum 200px, avec marge
      
      if (newHeight !== containerHeight) {
        setContainerHeight(newHeight);
      }
    }
  }, [enableVirtualization, containerHeight]);
  
  // ===== FIN FONCTIONS DE VIRTUALISATION =====
  
  // ===== AUTO-REFRESH =====
  
  const [autoRefreshStatus, setAutoRefreshStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [isPageVisible, setIsPageVisible] = useState(true);
  
  // Gestion de la visibilité de la page pour l'auto-refresh
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    setIsPageVisible(isVisible);
    
    if (autoRefresh) {
      if (isVisible && autoRefreshStatus === 'paused') {
        setAutoRefreshStatus('running');
        console.log('🔄 Auto-refresh repris (page visible)');
      } else if (!isVisible && autoRefreshStatus === 'running') {
        setAutoRefreshStatus('paused');
        console.log('⏸️ Auto-refresh mis en pause (page cachée)');
      }
    }
  }, [autoRefresh, autoRefreshStatus]);
  
  // Démarrage de l'auto-refresh
  const startAutoRefresh = useCallback(() => {
    if (!autoRefresh || autoRefreshStatus === 'running') return;
    
    setAutoRefreshStatus('running');
    
    refreshIntervalRef.current = setInterval(() => {
      if (isPageVisible && !loading) {
        console.log('🔄 Auto-refresh des données');
        refetch();
      }
    }, refreshInterval);
    
  }, [autoRefresh, autoRefreshStatus, isPageVisible, loading, refetch, refreshInterval]);
  
  // Arrêt de l'auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    setAutoRefreshStatus('idle');
    console.log('⏹️ Auto-refresh arrêté');
  }, []);
  
  // ===== RECHERCHE DANS LA LISTE =====
  
  const [searchInListTerm, setSearchInListTerm] = useState('');
  const [searchInListResults, setSearchInListResults] = useState([]);
  
  // Recherche locale dans les éléments chargés
  const searchInList = useCallback((searchTerm) => {
    setSearchInListTerm(searchTerm);
    
    if (!searchTerm.trim()) {
      setSearchInListResults([]);
      return finalItems;
    }
    
    const term = searchTerm.toLowerCase();
    const results = finalItems.filter(item => {
      // Recherche dans les champs configurés
      if (searchFields.length > 0) {
        return searchFields.some(field => {
          const value = item[field];
          return value && typeof value === 'string' && 
                 value.toLowerCase().includes(term);
        });
      }
      
      // Recherche générale dans toutes les propriétés string
      return Object.values(item).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(term)
      );
    });
    
    setSearchInListResults(results);
    return results;
  }, [finalItems, searchFields]);
  
  // Effacement de la recherche dans la liste
  const clearSearchInList = useCallback(() => {
    setSearchInListTerm('');
    setSearchInListResults([]);
  }, []);
  
  // ===== EFFETS =====
  
  // Effet pour traiter les données récupérées
  useEffect(() => {
    if (!fetchedItems) return;
    
    const processedItems = fetchedItems.map(item => 
      transformItemRef.current ? transformItemRef.current(item) : item
    );
    
    setAllItems(prev => {
      if (paginationType === 'infinite') {
        return [...prev, ...processedItems];
      }
      return processedItems;
    });
    
    setTotalCount(processedItems.length);
    setHasMore(processedItems.length === pageSize);
    
    if (onItemsChangeRef.current) {
      onItemsChangeRef.current(processedItems);
    }
  }, [fetchedItems, paginationType, pageSize]);
  
  // Effet pour le nettoyage de la sélection
  useEffect(() => {
    if (!enableSelection || selectedItems.length === 0) return;
    
    const validSelection = selectedItems.filter(selected =>
      finalItems.some(item => item.id === selected.id)
    );
    
    if (validSelection.length !== selectedItems.length) {
      setSelectedItems(validSelection);
    }
  }, [enableSelection, finalItems, selectedItems]);
  
  // Effet pour la virtualisation
  useEffect(() => {
    if (!enableVirtualization) return;
    
    // Utiliser setupItemHeightObserver pour initialiser l'observateur
    setupItemHeightObserver();
    
    const updateItems = () => {
      const range = calculateVisibleRange();
      setVisibleRange(range);
      
      const visibleItems = finalItems.slice(range.start, range.end).map((item, index) => ({
        ...item,
        virtualIndex: range.start + index,
        virtualTop: (range.start + index) * itemHeight
      }));
      
      setVirtualizedItems(visibleItems);
    };
    
    updateItems();
  }, [enableVirtualization, finalItems, calculateVisibleRange, itemHeight, setupItemHeightObserver]);
  
  // Effet pour l'auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    // Utiliser handleVisibilityChange pour gérer la visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const startRefresh = () => {
      if (refreshIntervalRef.current) return;
      
      refreshIntervalRef.current = setInterval(() => {
        if (isPageVisible && !loading) {
          refetch();
        }
      }, refreshInterval);
    };
    
    const stopRefresh = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
    
    startRefresh();
    
    return () => {
      stopRefresh();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoRefresh, isPageVisible, loading, refetch, refreshInterval, handleVisibilityChange]);
  
  return {
    // Données
    items: finalItems,
    loading,
    error,
    
    // Virtualisation
    virtualizedItems: enableVirtualization ? virtualizedItems : finalItems,
    visibleRange,
    virtualScrollRef,
    handleVirtualScroll,
    getTotalVirtualHeight,
    updateItemHeight,
    resizeContainer,
    autoResizeContainer,
    isVirtualized: enableVirtualization,
    virtualStats: {
      totalItems: finalItems.length,
      visibleItems: virtualizedItems.length,
      itemHeight,
      containerHeight,
      scrollTop
    },
    
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
    setFilter: searchAndFilterHook?.setFilter || (() => {}),
    searchTerm: searchAndFilterHook?.searchTerm || '',
    activeFilters: searchAndFilterHook?.activeFilters || {},
    
    // Auto-refresh
    autoRefreshStatus,
    startAutoRefresh,
    stopAutoRefresh,
    
    // Utilitaires
    refetch,
    resetList: () => {
      setCurrentPage(1);
      setAllItems([]);
      setSelectedItems([]);
      setSorting(defaultSort);
      clearSearchInList();
      
      if (enableFilters && searchAndFilterHook?.clearFilters) {
        searchAndFilterHook.clearFilters();
      }
      
      if (enableSearch && searchAndFilterHook?.clearSearch) {
        searchAndFilterHook.clearSearch();
      }
      
      refetch();
    },
    lastFetch,
    
    // Statistiques
    stats: {
      totalItems: totalCount,
      selectedCount: selectedItems.length,
      currentPageItems: finalItems.length,
      selectionRate: totalCount > 0 ? (selectedItems.length / totalCount) * 100 : 0
    },
    
    // Pagination par curseur
    cursorPagination: {
      goToPage: goToPageWithCursor,
      currentCursor,
      loading: cursorLoading,
      error: cursorError,
      hasCursor: (page) => cursorCache.has(page),
      getCursorInfo: () => ({
        currentPage,
        currentCursor,
        cacheSize: cursorCache.size,
        cachedPages: Array.from(cursorCache.keys()).sort((a, b) => a - b)
      }),
      clearCache: () => {
        setCursorCache(new Map());
        setCurrentCursor(null);
        lastCursorRef.current = null;
      }
    },
    
    // Recherche dans la liste
    searchInListTerm,
    searchInListResults,
    clearSearchInList
  };
};

export default useGenericEntityList; 