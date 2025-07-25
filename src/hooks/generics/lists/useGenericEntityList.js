/**
 * @fileoverview Hook générique pour la gestion des listes d'entités avec pagination
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 2
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 2
 * 
 * CORRECTIONS APPLIQUÉES POUR ÉVITER LES BOUCLES DE RE-RENDERS :
 * - Stabilisation des objets de configuration avec useMemo
 * - Mémoïsation des callbacks avec useCallback et dépendances stables
 * - Utilisation de useRef pour les fonctions transformItem
 * - Évitement des mises à jour directes des références
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
 * } = useGenericEntityList('contacts', {
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
 * @replaces useDatesList (SUPPRIMÉ), useContactsList, useEntityList
 */
const useGenericEntityList = (entityType, listConfig = {}, options = {}) => {
  console.log(`[${Date.now()}][useGenericEntityList] RENDER START - entityType: ${entityType}`);
  // ✅ CORRECTION 1: Stabiliser la configuration avec useMemo
  const stableListConfig = useMemo(() => {
    console.log(`[${Date.now()}][stableListConfig] MEMO RECALC`);
    return {
      pageSize: listConfig.pageSize || 20,
      defaultSort: listConfig.defaultSort || null,
      defaultFilters: listConfig.defaultFilters || {},
      enableSelection: listConfig.enableSelection || false,
      enableFilters: listConfig.enableFilters || false,
      enableSearch: listConfig.enableSearch || false,
      searchFields: listConfig.searchFields || [],
      filters: listConfig.filters || {},
      // ✅ CORRECTION 2: Ne pas inclure les fonctions dans la configuration stable
      // onItemSelect, onItemsChange, onPageChange, transformItem seront gérées séparément
    };
  }, [
    listConfig.pageSize,
    listConfig.defaultSort,
    listConfig.defaultFilters,
    listConfig.enableSelection,
    listConfig.enableFilters,
    listConfig.enableSearch,
    listConfig.searchFields,
    listConfig.filters
  ]);

  const stableOptions = useMemo(() => {
    console.log(`[${Date.now()}][stableOptions] MEMO RECALC`);
    return {
    paginationType: options.paginationType || 'pages',
    enableVirtualization: options.enableVirtualization || false,
    enableCache: options.enableCache !== false, // true par défaut
    enableRealTime: options.enableRealTime || false,
    enableBulkActions: options.enableBulkActions || false,
    maxSelectionSize: options.maxSelectionSize || null,
    autoRefresh: options.autoRefresh || false,
    refreshInterval: options.refreshInterval || 30000
    };
  }, [
    options.paginationType,
    options.enableVirtualization,
    options.enableCache,
    options.enableRealTime,
    options.enableBulkActions,
    options.maxSelectionSize,
    options.autoRefresh,
    options.refreshInterval
  ]);

  // ✅ CORRECTION 3: Utiliser des références stables pour les callbacks
  console.log(`[${Date.now()}][callbacksRef] Initialisation`);
  const callbacksRef = useRef({
    onItemSelect: listConfig.onItemSelect,
    onItemsChange: listConfig.onItemsChange,
    onPageChange: listConfig.onPageChange,
    transformItem: listConfig.transformItem
  });

  // ✅ CORRECTION 4: Mettre à jour les callbacks uniquement quand nécessaire
  useEffect(() => {
    console.log(`[${Date.now()}][EFFECT-callbacks] DÉBUT`);
    callbacksRef.current = {
      onItemSelect: listConfig.onItemSelect,
      onItemsChange: listConfig.onItemsChange,
      onPageChange: listConfig.onPageChange,
      transformItem: listConfig.transformItem
    };
    console.log(`[${Date.now()}][EFFECT-callbacks] FIN - callbacks mis à jour`);
  }, [listConfig.onItemSelect, listConfig.onItemsChange, listConfig.onPageChange, listConfig.transformItem]);
  
  // États de base
  console.log(`[${Date.now()}][STATES] Initialisation des états`);
  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sorting, setSorting] = useState(stableListConfig.defaultSort);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  console.log(`[${Date.now()}][RENDER-VALUES] currentPage: ${currentPage}, allItems.length: ${allItems.length}, totalCount: ${totalCount}`);
  
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
  
  // ✅ CORRECTION 5: Fonction de transformation stable
  const transformItemStable = useCallback((item) => {
    console.log(`[${Date.now()}][transformItemStable] CALL`);
    const transformFn = callbacksRef.current.transformItem;
    return transformFn ? transformFn(item) : item;
  }, []); // Pas de dépendances car utilise une ref

  // ✅ CORRECTION 6: Configuration de récupération des données stable
  const fetchConfig = useMemo(() => {
    console.log(`[${Date.now()}][fetchConfig] MEMO RECALC - sorting:`, sorting);
    return {
      mode: 'collection',
      filters: stableListConfig.defaultFilters,
      orderBy: sorting ? {
        field: sorting.field,
        direction: sorting.direction
      } : null,
      limit: stableListConfig.pageSize,
      // ✅ CORRECTION 7: Callback onData stable - NE PAS passer directement pour éviter les boucles
      // Le traitement des données sera fait dans l'effet useEffect
    };
  }, [
    stableListConfig.defaultFilters,
    stableListConfig.pageSize,
    stableOptions.paginationType,
    sorting
  ]);
  
  // Hook de récupération de données
  const {
    data: fetchedItems,
    loading,
    error,
    refetch,
    lastFetch
  } = useGenericDataFetcher(entityType, fetchConfig, {
    enableCache: stableOptions.enableCache,
    enableRealTime: stableOptions.enableRealTime,
    autoFetch: true
  });
  
  // ✅ CORRECTION 8: Configuration de recherche et filtres stable
  const searchConfig = useMemo(() => {
    if (!stableListConfig.enableFilters && !stableListConfig.enableSearch) {
      return {};
    }
    
    return {
      availableFilters: stableListConfig.filters,
      defaultFilters: stableListConfig.defaultFilters,
      searchFields: stableListConfig.searchFields,
      enableFirestore: true,
      collectionName: entityType,
      // NE PAS passer onResults directement pour éviter les boucles
    };
  }, [
    stableListConfig.enableFilters,
    stableListConfig.enableSearch,
    stableListConfig.filters,
    stableListConfig.defaultFilters,
    stableListConfig.searchFields,
    entityType
  ]);

  const searchOptions = useMemo(() => {
    console.log(`[${Date.now()}][searchOptions] MEMO RECALC`);
    return {
    autoApplyFilters: true,
    enableDebounce: true
    };
  }, []);

  // Hook de recherche et filtres (si activé)
  console.log(`[${Date.now()}][useGenericFilteredSearch] BEFORE CALL`);
  const searchAndFilterHook = useGenericFilteredSearch(
    entityType,
    searchConfig,
    searchOptions
  );
  console.log(`[${Date.now()}][useGenericFilteredSearch] AFTER CALL`);
  
  // ✅ CORRECTION 9: Calcul des éléments finaux stable
  const finalItems = useMemo(() => {
    console.log(`[${Date.now()}][finalItems] MEMO RECALC - allItems.length: ${allItems.length}`);
    const hasActiveSearch = searchAndFilterHook?.searchTerm && searchAndFilterHook.searchTerm.length > 0;
    const hasActiveFilters = searchAndFilterHook?.activeFilters && Object.keys(searchAndFilterHook.activeFilters).length > 0;
    
    return (stableListConfig.enableFilters || stableListConfig.enableSearch) && 
           (hasActiveSearch || hasActiveFilters) && 
           searchAndFilterHook.results 
      ? searchAndFilterHook.results 
      : allItems;
  }, [
    stableListConfig.enableFilters,
    stableListConfig.enableSearch,
    searchAndFilterHook?.searchTerm,
    searchAndFilterHook?.activeFilters,
    searchAndFilterHook?.results,
    allItems
  ]);
  
  // ✅ CORRECTION 10: Calcul de la pagination stable
  const pagination = useMemo(() => {
    console.log(`[${Date.now()}][pagination] MEMO RECALC - currentPage: ${currentPage}, totalCount: ${totalCount}`);
    return {
    currentPage,
    pageSize: stableListConfig.pageSize,
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / stableListConfig.pageSize),
    hasNext: currentPage < Math.ceil(totalCount / stableListConfig.pageSize),
    hasPrevious: currentPage > 1,
    startIndex: (currentPage - 1) * stableListConfig.pageSize,
    endIndex: Math.min(currentPage * stableListConfig.pageSize, totalCount)
    };
  }, [currentPage, stableListConfig.pageSize, totalCount]);
  
  // Cache des curseurs pour navigation bidirectionnelle
  const [cursorCache, setCursorCache] = useState(new Map());
  const [currentCursor, setCurrentCursor] = useState(null);
  const [cursorLoading, setCursorLoading] = useState(false);
  const [cursorError, setCursorError] = useState(null);
  
  // Sauvegarde d'un curseur pour une page donnée
  const saveCursor = useCallback((page, cursor) => {
    if (stableOptions.paginationType !== 'cursor') return;
    
    setCursorCache(prev => {
      const newCache = new Map(prev);
      newCache.set(page, cursor);
      return newCache;
    });
  }, [stableOptions.paginationType]);
  
  // Récupération d'un curseur pour une page donnée
  const getCursor = useCallback((page) => {
    if (stableOptions.paginationType !== 'cursor') return null;
    return cursorCache.get(page) || null;
  }, [stableOptions.paginationType, cursorCache]);
  
  // Reconstruction du cache de curseurs (pour navigation vers une page éloignée)
  const rebuildCursorCache = useCallback(async (targetPage) => {
    if (stableOptions.paginationType !== 'cursor' || !refetch) return;
    
    
    let currentCursor = null;
    setCursorCache(new Map()); // Reset du cache
    
    // Parcourir page par page jusqu'à la cible
    for (let page = 1; page < targetPage; page++) {
      try {
        const result = await refetch({
          startAfter: currentCursor,
          limit: stableListConfig.pageSize
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
  }, [stableOptions.paginationType, refetch, stableListConfig.pageSize, saveCursor]);
  
  // Navigation vers une page avec curseur
  const goToPageWithCursor = useCallback(async (targetPage) => {
    if (stableOptions.paginationType !== 'cursor' || !refetch) return;
    
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
        limit: stableListConfig.pageSize
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
  }, [stableOptions.paginationType, refetch, stableListConfig.pageSize, getCursor, saveCursor, rebuildCursorCache]);
  
  // Navigation de pagination
  const goToPage = useCallback((page) => {
    console.log(`[${Date.now()}][goToPage] CALL - page: ${page}`);
    if (page < 1 || page > pagination.totalPages) return;
    
    setCurrentPage(page);
    
    if (callbacksRef.current.onPageChange) {
      callbacksRef.current.onPageChange(page);
    }
    
    // Refetch avec la nouvelle page
    refetch();
  }, [pagination.totalPages, refetch]);
  
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
    console.log(`[${Date.now()}][loadMore] CALL - loading: ${loading}, hasMore: ${hasMore}`);
    if (loading || !hasMore) return;
    
    if (stableOptions.paginationType === 'infinite') {
      // Pour l'infinite scroll, on ajoute à la liste existante
      setCurrentPage(prev => prev + 1);
      refetch();
    }
  }, [loading, hasMore, stableOptions.paginationType, refetch]);
  
  // Gestion du tri
  const handleSortChange = useCallback((field, direction = 'asc') => {
    console.log(`[${Date.now()}][handleSortChange] CALL - field: ${field}, direction: ${direction}`);
    const newSorting = { field, direction };
    console.log(`[${Date.now()}][setSorting] BEFORE - old:`, sorting, 'new:', newSorting);
    setSorting(newSorting);
    
    // Reset à la première page lors du changement de tri
    console.log(`[${Date.now()}][setCurrentPage] RESET to 1 (sort change)`);
    setCurrentPage(1);
    
    if (stableOptions.paginationType === 'infinite') {
      setAllItems([]); // Vider la liste pour infinite scroll
    }
    
    // Refetch avec le nouveau tri
    refetch();
  }, [stableOptions.paginationType, refetch]);
  
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
    if (!stableListConfig.enableSelection) return;
    
    setSelectedItems(prev => {
      const isCurrentlySelected = prev.some(selected => selected.id === item.id);
      let newSelection;
      
      if (isCurrentlySelected) {
        newSelection = prev.filter(selected => selected.id !== item.id);
      } else {
        // Vérifier la limite de sélection
        if (stableOptions.maxSelectionSize && prev.length >= stableOptions.maxSelectionSize) {
          console.warn(`⚠️ Limite de sélection atteinte: ${stableOptions.maxSelectionSize}`);
          return prev;
        }
        newSelection = [...prev, item];
      }
      
      if (callbacksRef.current.onItemSelect) {
        callbacksRef.current.onItemSelect(item, !isCurrentlySelected, newSelection);
      }
      
      return newSelection;
    });
  }, [stableListConfig.enableSelection, stableOptions.maxSelectionSize]);
  
  const selectAll = useCallback(() => {
    if (!stableListConfig.enableSelection) return;
    
    const itemsToSelect = finalItems.filter(item => !isSelected(item));
    
    // Vérifier la limite de sélection
    if (stableOptions.maxSelectionSize && selectedItems.length + itemsToSelect.length > stableOptions.maxSelectionSize) {
      const remainingSlots = stableOptions.maxSelectionSize - selectedItems.length;
      const limitedSelection = [...selectedItems, ...itemsToSelect.slice(0, remainingSlots)];
      setSelectedItems(limitedSelection);
      console.warn(`⚠️ Sélection limitée à ${stableOptions.maxSelectionSize} éléments`);
    } else {
      setSelectedItems(prev => [...prev, ...itemsToSelect]);
    }
  }, [stableListConfig.enableSelection, finalItems, isSelected, selectedItems, stableOptions.maxSelectionSize]);
  
  const selectNone = useCallback(() => {
    setSelectedItems([]);
  }, []);
  
  const clearSelection = useCallback(() => {
    selectNone();
  }, [selectNone]);
  
  // Sélection par plage
  const selectRange = useCallback((startIndex, endIndex) => {
    if (!stableListConfig.enableSelection) return;
    
    const rangeItems = finalItems.slice(startIndex, endIndex + 1);
    const newSelection = [...selectedItems];
    
    rangeItems.forEach(item => {
      if (!newSelection.some(selected => selected.id === item.id)) {
        if (!stableOptions.maxSelectionSize || newSelection.length < stableOptions.maxSelectionSize) {
          newSelection.push(item);
        }
      }
    });
    
    setSelectedItems(newSelection);
  }, [stableListConfig.enableSelection, finalItems, selectedItems, stableOptions.maxSelectionSize]);
  
  // Actions en lot
  const bulkActions = {
    delete: useCallback(async (items = selectedItems) => {
      if (!stableOptions.enableBulkActions) return;
      
      // TODO: Implémenter la suppression en lot
      console.log('🗑️ Suppression en lot:', items.length, 'éléments');
    }, [stableOptions.enableBulkActions, selectedItems]),
    
    update: useCallback(async (updates, items = selectedItems) => {
      if (!stableOptions.enableBulkActions) return;
      
      // TODO: Implémenter la mise à jour en lot
      console.log('🔄 Mise à jour en lot:', items.length, 'éléments');
    }, [stableOptions.enableBulkActions, selectedItems]),
    
    export: useCallback((format = 'json', items = selectedItems) => {
      if (!stableOptions.enableBulkActions) return;
      
      // TODO: Implémenter l'export
      console.log('📤 Export en lot:', items.length, 'éléments', 'format:', format);
    }, [stableOptions.enableBulkActions, selectedItems])
  };
  
  // ===== FONCTIONS DE VIRTUALISATION =====
  
  // Calcul de la plage visible pour la virtualisation
  const calculateVisibleRange = useCallback(() => {
    if (!stableOptions.enableVirtualization || finalItems.length === 0) {
      return { start: 0, end: finalItems.length };
    }
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      finalItems.length
    );
    
    return { start: Math.max(0, startIndex), end: endIndex };
  }, [stableOptions.enableVirtualization, finalItems.length, scrollTop, itemHeight, containerHeight]);
  
  // Mise à jour des éléments virtualisés
  const updateVirtualizedItems = useCallback(() => {
    if (!stableOptions.enableVirtualization) {
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
  }, [stableOptions.enableVirtualization, finalItems, calculateVisibleRange, itemHeight]);
  
  // Gestion du scroll pour la virtualisation
  const handleVirtualScroll = useCallback((event) => {
    if (!stableOptions.enableVirtualization) return;
    
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    
    // Mise à jour de la plage visible avec throttling
    requestAnimationFrame(() => {
      updateVirtualizedItems();
    });
  }, [stableOptions.enableVirtualization, updateVirtualizedItems]);
  
  // Calcul de la hauteur totale virtualisée
  const getTotalVirtualHeight = useCallback(() => {
    if (!stableOptions.enableVirtualization) return 'auto';
    return finalItems.length * itemHeight;
  }, [stableOptions.enableVirtualization, finalItems.length, itemHeight]);
  
  // Mise à jour de la hauteur d'un élément (pour les hauteurs variables)
  const updateItemHeight = useCallback((index, height) => {
    if (!stableOptions.enableVirtualization) return;
    
    itemHeightsRef.current.set(index, height);
    
    // Recalculer la hauteur moyenne si on a assez d'échantillons
    const heights = Array.from(itemHeightsRef.current.values());
    if (heights.length > 10) {
      const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;
      setItemHeight(Math.round(avgHeight));
    }
  }, [stableOptions.enableVirtualization]);
  
  // Observer pour mesurer automatiquement les hauteurs d'éléments
  const setupItemHeightObserver = useCallback(() => {
    if (!stableOptions.enableVirtualization || !virtualScrollRef.current) return;
    
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
  }, [stableOptions.enableVirtualization, updateItemHeight, containerHeight]);
  
  // Fonction de redimensionnement manuel du conteneur
  const resizeContainer = useCallback((newHeight) => {
    if (!stableOptions.enableVirtualization) return;
    
    setContainerHeight(newHeight);
    
    // Recalculer la plage visible avec la nouvelle hauteur
    requestAnimationFrame(() => {
      updateVirtualizedItems();
    });
    
  }, [stableOptions.enableVirtualization, updateVirtualizedItems]);
  
  // Fonction d'auto-ajustement de la hauteur du conteneur
  const autoResizeContainer = useCallback(() => {
    if (!stableOptions.enableVirtualization || !virtualScrollRef.current) return;
    
    const parentElement = virtualScrollRef.current.parentElement;
    if (parentElement) {
      const availableHeight = parentElement.clientHeight;
      const newHeight = Math.max(200, availableHeight - 20); // Minimum 200px, avec marge
      
      if (newHeight !== containerHeight) {
        setContainerHeight(newHeight);
      }
    }
  }, [stableOptions.enableVirtualization, containerHeight]);
  
  // ===== FIN FONCTIONS DE VIRTUALISATION =====
  
  // ===== AUTO-REFRESH =====
  
  const [autoRefreshStatus, setAutoRefreshStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [isPageVisible, setIsPageVisible] = useState(true);
  
  // Gestion de la visibilité de la page pour l'auto-refresh
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    setIsPageVisible(isVisible);
    
    if (stableOptions.autoRefresh) {
      if (isVisible && autoRefreshStatus === 'paused') {
        setAutoRefreshStatus('running');
        console.log('🔄 Auto-refresh repris (page visible)');
      } else if (!isVisible && autoRefreshStatus === 'running') {
        setAutoRefreshStatus('paused');
        console.log('⏸️ Auto-refresh mis en pause (page cachée)');
      }
    }
  }, [stableOptions.autoRefresh, autoRefreshStatus]);
  
  // Démarrage de l'auto-refresh
  const startAutoRefresh = useCallback(() => {
    if (!stableOptions.autoRefresh || autoRefreshStatus === 'running') return;
    
    setAutoRefreshStatus('running');
    
    refreshIntervalRef.current = setInterval(() => {
      if (isPageVisible && !loading) {
        console.log('🔄 Auto-refresh des données');
        refetch();
      }
    }, stableOptions.refreshInterval);
    
  }, [stableOptions.autoRefresh, autoRefreshStatus, isPageVisible, loading, refetch, stableOptions.refreshInterval]);
  
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
    
    if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
      setSearchInListResults([]);
      return finalItems;
    }
    
    const term = searchTerm.toLowerCase();
    const results = finalItems.filter(item => {
      // Recherche dans les champs configurés
      if (stableListConfig.searchFields.length > 0) {
        return stableListConfig.searchFields.some(field => {
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
  }, [finalItems, stableListConfig.searchFields]);
  
  // Effacement de la recherche dans la liste
  const clearSearchInList = useCallback(() => {
    setSearchInListTerm('');
    setSearchInListResults([]);
  }, []);
  
  // ===== EFFETS =====
  
  // Effet pour traiter les données récupérées
  useEffect(() => {
    console.log(`[${Date.now()}][EFFECT-754] START - lastFetch: ${lastFetch}, fetchedItems:`, fetchedItems?.length);
    if (!fetchedItems || !lastFetch) {
      console.log(`[${Date.now()}][EFFECT-754] EARLY RETURN - no data`);
      return;
    }
    
    const processedItems = fetchedItems.map(transformItemStable);
    console.log(`[${Date.now()}][EFFECT-754] processedItems.length: ${processedItems.length}`);
    
    setAllItems(prev => {
      console.log(`[${Date.now()}][setAllItems] BEFORE - prev.length: ${prev.length}`);
      if (stableOptions.paginationType === 'infinite') {
        const newItems = [...prev, ...processedItems];
        console.log(`[${Date.now()}][setAllItems] AFTER (infinite) - new.length: ${newItems.length}`);
        return newItems;
      }
      console.log(`[${Date.now()}][setAllItems] AFTER (normal) - new.length: ${processedItems.length}`);
      return processedItems;
    });
    
    console.log(`[${Date.now()}][setTotalCount] SET to ${processedItems.length}`);
    setTotalCount(processedItems.length);
    console.log(`[${Date.now()}][setHasMore] SET to ${processedItems.length === stableListConfig.pageSize}`);
    setHasMore(processedItems.length === stableListConfig.pageSize);
    
    const onItemsChange = callbacksRef.current.onItemsChange;
    if (onItemsChange) {
      console.log(`[${Date.now()}][EFFECT-754] Calling onItemsChange`);
      onItemsChange(processedItems);
    }
    console.log(`[${Date.now()}][EFFECT-754] END`);
  }, [lastFetch, stableOptions.paginationType, stableListConfig.pageSize, transformItemStable]);
  
  // Effet pour le nettoyage de la sélection
  useEffect(() => {
    console.log(`[${Date.now()}][EFFECT-selection-cleanup] START - enabled: ${stableListConfig.enableSelection}`);
    // Désactiver temporairement pour éviter la boucle infinie
    // TODO: Revoir cette logique pour éviter les re-renders infinis
    return;
    
    /*
    if (!stableListConfig.enableSelection || selectedItems.length === 0) return;
    
    const validSelection = selectedItems.filter(selected =>
      finalItems.some(item => item.id === selected.id)
    );
    
    if (validSelection.length !== selectedItems.length) {
      setSelectedItems(validSelection);
    }
    */
  }, [stableListConfig.enableSelection, finalItems]);
  
  // Effet d'initialisation de l'observer de virtualisation (exécuté une seule fois)
  useEffect(() => {
    if (!stableOptions.enableVirtualization) return;

    // Met en place l'observateur pour mesurer les hauteurs réelles
    setupItemHeightObserver();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableOptions.enableVirtualization]);

  // Effet de mise à jour des éléments virtualisés
  useEffect(() => {
    if (!stableOptions.enableVirtualization) {
      // Virtualisation désactivée : on renvoie simplement la liste complète
      setVirtualizedItems(finalItems);
      return;
    }

    // Recalcule la plage visible et met à jour les éléments virtualisés
    updateVirtualizedItems();
  }, [stableOptions.enableVirtualization, updateVirtualizedItems]);
  
  // Effet pour l'auto-refresh
  useEffect(() => {
    console.log(`[${Date.now()}][EFFECT-auto-refresh] START - enabled: ${stableOptions.autoRefresh}`);
    if (!stableOptions.autoRefresh) return;
    
    // Utiliser handleVisibilityChange pour gérer la visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const startRefresh = () => {
      if (refreshIntervalRef.current) return;
      
      refreshIntervalRef.current = setInterval(() => {
        if (isPageVisible && !loading) {
          refetch();
        }
      }, stableOptions.refreshInterval);
    };
    
    const stopRefresh = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
    
    console.log(`[${Date.now()}][EFFECT-auto-refresh] Starting refresh interval`);
    startRefresh();
    
    return () => {
      console.log(`[${Date.now()}][EFFECT-auto-refresh] CLEANUP`);
      stopRefresh();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stableOptions.autoRefresh, isPageVisible, loading, refetch, stableOptions.refreshInterval, handleVisibilityChange]);
  
  return {
    // Données
    items: finalItems,
    loading,
    error,
    
    // Virtualisation
    virtualizedItems: stableOptions.enableVirtualization ? virtualizedItems : finalItems,
    visibleRange,
    virtualScrollRef,
    handleVirtualScroll,
    getTotalVirtualHeight,
    updateItemHeight,
    resizeContainer,
    autoResizeContainer,
    isVirtualized: stableOptions.enableVirtualization,
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
      setSorting(stableListConfig.defaultSort);
      clearSearchInList();
      
      if (stableListConfig.enableFilters && searchAndFilterHook?.clearFilters) {
        searchAndFilterHook.clearFilters();
      }
      
      if (stableListConfig.enableSearch && searchAndFilterHook?.clearSearch) {
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