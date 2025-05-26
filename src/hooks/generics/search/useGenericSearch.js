/**
 * @fileoverview Hook générique pour la recherche
 * Hook générique créé lors de la Phase 3 - Optimisation et adoption généralisée
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 3 - Optimisation et adoption généralisée
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook générique pour la recherche avancée
 * 
 * @description
 * Fonctionnalités supportées :
 * - search_types: Recherche par différents types (nom, ID, adresse, etc.)
 * - search_cache: Cache intelligent des résultats avec TTL
 * - search_debounce: Debounce configurable pour optimiser les performances
 * - search_filters: Filtres avancés et tri des résultats
 * - search_pagination: Pagination automatique des résultats
 * - search_callbacks: Callbacks pour les événements de recherche
 * 
 * @param {Object} config - Configuration du hook
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {string} returns.searchTerm - Terme de recherche actuel
 * @returns {Array} returns.results - Résultats de recherche
 * @returns {boolean} returns.isSearching - Indique si une recherche est en cours
 * @returns {Object} returns.selectedItem - Élément sélectionné
 * @returns {Function} returns.search - Fonction de recherche
 * @returns {Function} returns.selectItem - Sélectionner un élément
 * @returns {Function} returns.clearResults - Effacer les résultats
 * 
 * @example
 * ```javascript
 * // Recherche d'adresses
 * const addressSearch = useGenericSearch({
 *   searchType: 'address',
 *   apiEndpoint: 'https://api.locationiq.com/v1/search.php',
 *   searchFunction: async (term) => {
 *     // Logique de recherche d'adresses
 *   },
 *   formatResult: (item) => ({
 *     id: item.place_id,
 *     label: item.display_name,
 *     value: item
 *   })
 * });
 * 
 * // Recherche d'entreprises
 * const companySearch = useGenericSearch({
 *   searchType: 'company',
 *   searchFunction: async (term, type) => {
 *     // Logique de recherche d'entreprises
 *   },
 *   searchTypes: ['siret', 'name'],
 *   minSearchLength: 3
 * });
 * 
 * // Recherche d'entités
 * const entitySearch = useGenericSearch({
 *   searchType: 'entity',
 *   collectionName: 'artistes',
 *   searchFields: ['nom', 'email'],
 *   enableFirestore: true
 * });
 * ```
 * 
 * @complexity HIGH
 * @businessCritical true
 * @generic true
 * @replaces useAddressSearch, useCompanySearch, useEntitySearch
 */
const useGenericSearch = (config = {}, options = {}) => {
  const {
    searchType = 'generic',
    searchFunction = null,
    apiEndpoint = null,
    collectionName = null,
    searchFields = ['name'],
    searchTypes = ['default'],
    formatResult = (item) => item,
    validateResult = (item) => true,
    onResultSelect = null,
    onSearchComplete = null,
    enableFirestore = false,
    enableCache = true,
    enablePagination = false
  } = config;
  
  const {
    debounceDelay = 500,
    minSearchLength = 2,
    maxResults = 10,
    cacheTimeout = 300000, // 5 minutes
    enableLogging = false,
    enableClickOutside = true,
    enableKeyboardNavigation = true
  } = options;
  
  // État principal
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchType, setCurrentSearchType] = useState(searchTypes[0] || 'default');
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Références
  const searchTimeoutRef = useRef(null);
  const cacheRef = useRef({});
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const selectedIndexRef = useRef(-1);
  
  // Références pour stabiliser les fonctions
  const searchFunctionRef = useRef(searchFunction);
  const formatResultRef = useRef(formatResult);
  const validateResultRef = useRef(validateResult);
  const onSearchCompleteRef = useRef(onSearchComplete);
  const onResultSelectRef = useRef(onResultSelect);
  
  // Mettre à jour les références
  searchFunctionRef.current = searchFunction;
  formatResultRef.current = formatResult;
  validateResultRef.current = validateResult;
  onSearchCompleteRef.current = onSearchComplete;
  onResultSelectRef.current = onResultSelect;
  
  // Cache intelligent avec TTL
  const getCachedResult = useCallback((key) => {
    if (!enableCache) return null;
    
    const cached = cacheRef.current[key];
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      return cached.data;
    }
    
    // Nettoyer les entrées expirées
    if (cached) {
      delete cacheRef.current[key];
    }
    
    return null;
  }, [enableCache, cacheTimeout]);
  
  const setCachedResult = useCallback((key, data) => {
    if (!enableCache) return;
    
    cacheRef.current[key] = {
      data,
      timestamp: Date.now()
    };
  }, [enableCache]);
  
  // Fonction de recherche Firestore
  const searchFirestore = useCallback(async (term, searchType) => {
    console.log('🔍 [useGenericSearch] searchFirestore appelé:', { 
      term, 
      searchType, 
      enableFirestore, 
      collectionName, 
      searchFields 
    });
    
    if (!enableFirestore || !collectionName) {
      throw new Error('Firestore search not configured');
    }
    
    // Import dynamique pour éviter les dépendances circulaires
    const { collection, query, where, getDocs, orderBy, limit } = await import('@/services/firebase-service');
    const { db } = await import('@/services/firebase-service');
    
    // Si pas de terme de recherche, charger toutes les données
    if (!term || term.length === 0) {
      console.log('🔍 [useGenericSearch] Chargement de toutes les données de', collectionName);
      const q = query(collection(db, collectionName), limit(maxResults));
      const querySnapshot = await getDocs(q);
      const allDocs = [];
      
      querySnapshot.forEach(doc => {
        allDocs.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('🔍 [useGenericSearch] Données chargées:', allDocs.length, 'éléments');
      return allDocs;
    }
    
    const searchQueries = searchFields.map(field => {
      const q = query(
        collection(db, collectionName),
        where(field, '>=', term),
        where(field, '<=', term + '\uf8ff'),
        orderBy(field),
        limit(maxResults)
      );
      return getDocs(q);
    });
    
    const results = await Promise.all(searchQueries);
    const allDocs = [];
    
    results.forEach(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        if (!allDocs.find(item => item.id === data.id)) {
          allDocs.push(data);
        }
      });
    });
    
    console.log('🔍 [useGenericSearch] Résultats de recherche:', allDocs.length, 'éléments');
    return allDocs.slice(0, maxResults);
  }, [enableFirestore, collectionName, searchFields, maxResults]);
  
  // Fonction de recherche API
  const searchAPI = useCallback(async (term, searchType) => {
    if (!apiEndpoint) {
      throw new Error('API endpoint not configured');
    }
    
    const url = new URL(apiEndpoint);
    url.searchParams.append('q', term);
    url.searchParams.append('type', searchType);
    url.searchParams.append('limit', maxResults.toString());
    
    if (enablePagination) {
      url.searchParams.append('page', currentPage.toString());
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      results: data.results || data.items || data,
      total: data.total || data.count || 0,
      hasMore: data.hasMore || false
    };
  }, [apiEndpoint, maxResults, enablePagination, currentPage]);
  
  // Fonction de recherche principale
  const performSearch = useCallback(async (term, searchType = currentSearchType, page = 1) => {
    if (!term || term.length < minSearchLength) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    const cacheKey = `${searchType}_${term}_${page}`;
    
    // Vérifier le cache
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      setResults(cachedResult.results || cachedResult);
      setTotalResults(cachedResult.total || cachedResult.length || 0);
      setHasMore(cachedResult.hasMore || false);
      setIsSearching(false);
      setShowResults(true);
      
      if (enableLogging) {
      }
      
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      
      let searchResult;
      
      if (searchFunctionRef.current && typeof searchFunctionRef.current === 'function') {
        // Fonction de recherche personnalisée
        searchResult = await searchFunctionRef.current(term, searchType, page);
      } else if (enableFirestore) {
        // Recherche Firestore
        const firestoreResults = await searchFirestore(term, searchType);
        searchResult = {
          results: firestoreResults,
          total: firestoreResults.length,
          hasMore: false
        };
      } else if (apiEndpoint) {
        // Recherche API
        searchResult = await searchAPI(term, searchType);
      } else {
        throw new Error('No search method configured');
      }
      
      // Normaliser le résultat
      const normalizedResults = Array.isArray(searchResult) ? searchResult : searchResult.results || [];
      
      // Formater et valider les résultats
      const formattedResults = normalizedResults
        .map(formatResultRef.current)
        .filter(validateResultRef.current)
        .slice(0, maxResults);
      
      // Mettre en cache
      const resultToCache = {
        results: formattedResults,
        total: searchResult.total || formattedResults.length,
        hasMore: searchResult.hasMore || false
      };
      
      setCachedResult(cacheKey, resultToCache);
      
      // Mettre à jour l'état
      if (enablePagination && page > 1) {
        setResults(prev => [...prev, ...formattedResults]);
      } else {
        setResults(formattedResults);
      }
      
      setTotalResults(resultToCache.total);
      setHasMore(resultToCache.hasMore);
      setShowResults(true);
      
      if (enableLogging) {
      }
      
      // Callback de recherche terminée
      if (onSearchCompleteRef.current) {
        onSearchCompleteRef.current(formattedResults, term, searchType);
      }
      
    } catch (err) {
      console.error('[useGenericSearch] Erreur de recherche:', err);
      setError(err.message);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [
    currentSearchType,
    minSearchLength,
    getCachedResult,
    setCachedResult,
    enableFirestore,
    searchFirestore,
    apiEndpoint,
    searchAPI,
    maxResults,
    enablePagination,
    enableLogging
  ]); // CORRECTION: Retirer searchFunction, formatResult, validateResult, onSearchComplete (fonctions instables)
  
  // Effet pour la recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchTerm && searchTerm.length >= minSearchLength) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchTerm, currentSearchType, 1);
      }, debounceDelay);
    } else {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, currentSearchType, performSearch, minSearchLength, debounceDelay]);
  
  // Gestion des clics en dehors
  useEffect(() => {
    if (!enableClickOutside) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
        selectedIndexRef.current = -1;
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [enableClickOutside]);
  
  // Fonctions utilitaires (définies avant leur utilisation)
  const selectItem = useCallback((item) => {
    setSelectedItem(item);
    setSearchTerm('');
    setShowResults(false);
    selectedIndexRef.current = -1;
    
    if (onResultSelectRef.current) {
      onResultSelectRef.current(item);
    }
    
    if (enableLogging) {
    }
  }, [enableLogging]); // CORRECTION: Retirer onResultSelect car on utilise onResultSelectRef
  
  // Navigation au clavier
  useEffect(() => {
    if (!enableKeyboardNavigation) return;
    
    const handleKeyDown = (event) => {
      if (!showResults || results.length === 0) return;
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          selectedIndexRef.current = Math.min(selectedIndexRef.current + 1, results.length - 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          selectedIndexRef.current = Math.max(selectedIndexRef.current - 1, -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndexRef.current >= 0) {
            selectItem(results[selectedIndexRef.current]);
          }
          break;
        case 'Escape':
          setShowResults(false);
          selectedIndexRef.current = -1;
          break;
        default:
          // Aucune action pour les autres touches
          break;
      }
    };
    
    const currentInput = inputRef.current;
    if (currentInput) {
      currentInput.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (currentInput) {
        currentInput.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [enableKeyboardNavigation, showResults, results, selectItem]);
  
  // Autres fonctions utilitaires
  const clearResults = useCallback(() => {
    setResults([]);
    setShowResults(false);
    setSearchTerm('');
    setSelectedItem(null);
    setError(null);
    selectedIndexRef.current = -1;
  }, []);
  
  const loadMore = useCallback(() => {
    if (enablePagination && hasMore && !isSearching) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      performSearch(searchTerm, currentSearchType, nextPage);
    }
  }, [enablePagination, hasMore, isSearching, currentPage, performSearch, searchTerm, currentSearchType]);
  
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);
  
  // Propriétés calculées
  const searchState = useMemo(() => ({
    hasResults: results.length > 0,
    isEmpty: !isSearching && searchTerm.length >= minSearchLength && results.length === 0,
    canSearch: searchTerm.length >= minSearchLength,
    selectedIndex: selectedIndexRef.current
  }), [results.length, isSearching, searchTerm.length, minSearchLength]);
  
  return {
    // État principal
    searchTerm,
    setSearchTerm,
    currentSearchType,
    setCurrentSearchType,
    results,
    selectedItem,
    isSearching,
    showResults,
    setShowResults,
    error,
    
    // Pagination
    currentPage,
    totalResults,
    hasMore,
    loadMore,
    
    // Fonctions principales
    search: performSearch,
    selectItem,
    clearResults,
    clearCache,
    
    // Références
    dropdownRef,
    inputRef,
    
    // État calculé
    searchState,
    
    // Configuration
    searchTypes,
    minSearchLength,
    maxResults,
    
    // Métadonnées
    _config: {
      searchType,
      enableFirestore,
      enableCache,
      enablePagination,
      debounceDelay
    }
  };
};

export default useGenericSearch; 