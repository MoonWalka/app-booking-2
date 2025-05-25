/**
 * @fileoverview Hook générique pour la recherche
 * Hook générique créé lors de la Phase 2 de généralisation
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { db } from '@/services/firebase-service';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  startAfter
} from '@/services/firebase-service';

/**
 * Hook générique pour la recherche
 * 
 * @description
 * Fonctionnalités supportées :
 * - text_search: Recherche textuelle
 * - filters: Filtres avancés
 * - suggestions: Suggestions de recherche
 * - history: Historique des recherches
 * 
 * @param {string} entityType - Type d'entité à rechercher
 * @param {Object} searchConfig - Configuration de la recherche
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {Array} returns.results - Résultats de la recherche
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {string} returns.searchTerm - Terme de recherche actuel
 * @returns {Function} returns.setSearchTerm - Fonction de mise à jour du terme
 * @returns {Function} returns.search - Fonction de recherche
 * @returns {Function} returns.clearSearch - Fonction de réinitialisation
 * @returns {Array} returns.suggestions - Suggestions de recherche
 * @returns {Array} returns.history - Historique des recherches
 * @returns {boolean} returns.hasMore - Plus de résultats disponibles
 * @returns {Function} returns.loadMore - Charger plus de résultats
 * 
 * @example
 * ```javascript
 * const { 
 *   results, 
 *   loading, 
 *   searchTerm, 
 *   setSearchTerm, 
 *   search, 
 *   suggestions,
 *   hasMore,
 *   loadMore
 * } = useGenericSearch('concerts', {
 *   searchFields: ['titre', 'artiste', 'lieu'],
 *   defaultFilters: { statut: 'actif' },
 *   enableSuggestions: true,
 *   enableHistory: true
 * });
 * 
 * // Utilisation dans un composant
 * <input 
 *   value={searchTerm}
 *   onChange={(e) => setSearchTerm(e.target.value)}
 *   onKeyPress={(e) => e.key === 'Enter' && search()}
 * />
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @generic true
 * @replaces useSearchHandler, useSearchLogic
 */
const useGenericSearch = (entityType, searchConfig = {}, options = {}) => {
  const {
    searchFields = [],
    defaultFilters = {},
    orderByField = 'createdAt',
    orderDirection = 'desc',
    pageSize = 20,
    onSearch,
    onResults,
    onError
  } = searchConfig;
  
  const {
    enableSuggestions = false,
    enableHistory = false,
    enableDebounce = true,
    debounceDelay = 300,
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    minSearchLength = 2
  } = options;
  
  // États de base
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  
  // Références
  const debounceTimeoutRef = useRef(null);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  
  // Cache des résultats
  const getCacheKey = useCallback((term, filters) => {
    return `${entityType}_${term}_${JSON.stringify(filters)}`;
  }, [entityType]);
  
  const getCachedResults = useCallback((cacheKey) => {
    if (!enableCache) return null;
    
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      return cached.data;
    }
    
    return null;
  }, [enableCache, cacheTimeout]);
  
  const setCachedResults = useCallback((cacheKey, data) => {
    if (!enableCache) return;
    
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, [enableCache]);
  
  // Historique des recherches
  const addToHistory = useCallback((term) => {
    if (!enableHistory || !term.trim()) return;
    
    setHistory(prev => {
      const filtered = prev.filter(item => item !== term);
      return [term, ...filtered].slice(0, 10); // Garder les 10 dernières
    });
  }, [enableHistory]);
  
  // Suggestions de recherche
  const generateSuggestions = useCallback(async (term) => {
    if (!enableSuggestions || term.length < minSearchLength) {
      setSuggestions([]);
      return;
    }
    
    try {
      // Recherche dans l'historique
      const historySuggestions = history.filter(item => 
        item.toLowerCase().includes(term.toLowerCase())
      );
      
      // Recherche dans les données (limitée)
      const q = query(
        collection(db, entityType),
        orderBy(searchFields[0] || 'createdAt'),
        limit(5)
      );
      
      const snapshot = await getDocs(q);
      const dataSuggestions = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        searchFields.forEach(field => {
          const value = data[field];
          if (value && typeof value === 'string' && 
              value.toLowerCase().includes(term.toLowerCase()) &&
              !dataSuggestions.includes(value)) {
            dataSuggestions.push(value);
          }
        });
      });
      
      const allSuggestions = [...new Set([...historySuggestions, ...dataSuggestions])];
      setSuggestions(allSuggestions.slice(0, 8));
      
    } catch (err) {
      console.warn('⚠️ Erreur génération suggestions:', err);
      setSuggestions([]);
    }
  }, [enableSuggestions, minSearchLength, history, entityType, searchFields]);
  
  // Fonction de recherche principale
  const performSearch = useCallback(async (term, filters = {}, loadMoreMode = false) => {
    // Annuler la recherche précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    if (!loadMoreMode) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const searchTerm = term.trim();
      const allFilters = { ...defaultFilters, ...filters };
      const cacheKey = getCacheKey(searchTerm, allFilters);
      
      // Vérifier le cache
      if (!loadMoreMode) {
        const cached = getCachedResults(cacheKey);
        if (cached) {
          setResults(cached.results);
          setHasMore(cached.hasMore);
          setLastDoc(cached.lastDoc);
          setLoading(false);
          return cached.results;
        }
      }
      
      // Construire la requête
      let q = collection(db, entityType);
      const constraints = [];
      
      // Filtres par défaut
      Object.entries(allFilters).forEach(([field, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          constraints.push(where(field, '==', value));
        }
      });
      
      // Recherche textuelle (simulation avec where)
      if (searchTerm && searchFields.length > 0) {
        // Note: Firebase ne supporte pas la recherche full-text native
        // Cette implémentation utilise des requêtes where pour une recherche basique
        const primaryField = searchFields[0];
        if (searchTerm.length >= minSearchLength) {
          constraints.push(where(primaryField, '>=', searchTerm));
          constraints.push(where(primaryField, '<=', searchTerm + '\uf8ff'));
        }
      }
      
      // Tri
      constraints.push(orderBy(orderByField, orderDirection));
      
      // Pagination
      if (loadMoreMode && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      
      constraints.push(limit(pageSize));
      
      // Exécuter la requête
      q = query(q, ...constraints);
      const snapshot = await getDocs(q);
      
      const newResults = [];
      let newLastDoc = null;
      
      snapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        
        // Filtrage côté client pour la recherche textuelle avancée
        if (searchTerm && searchFields.length > 0) {
          const matchesSearch = searchFields.some(field => {
            const value = data[field];
            return value && typeof value === 'string' && 
                   value.toLowerCase().includes(searchTerm.toLowerCase());
          });
          
          if (matchesSearch) {
            newResults.push(data);
          }
        } else {
          newResults.push(data);
        }
        
        newLastDoc = doc;
      });
      
      // Mettre à jour les résultats
      if (loadMoreMode) {
        setResults(prev => [...prev, ...newResults]);
      } else {
        setResults(newResults);
      }
      
      const hasMoreResults = newResults.length === pageSize;
      setHasMore(hasMoreResults);
      setLastDoc(newLastDoc);
      
      // Cache
      if (!loadMoreMode) {
        setCachedResults(cacheKey, {
          results: newResults,
          hasMore: hasMoreResults,
          lastDoc: newLastDoc
        });
      }
      
      // Callbacks
      if (onResults) {
        onResults(newResults, { term: searchTerm, filters: allFilters });
      }
      
      // Historique
      if (searchTerm) {
        addToHistory(searchTerm);
      }
      
      return newResults;
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = `Erreur lors de la recherche ${entityType}: ${err.message}`;
        setError(errorMessage);
        
        if (onError) {
          onError(err);
        }
        
        console.error('❌', errorMessage, err);
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [
    entityType, 
    defaultFilters, 
    orderByField, 
    orderDirection, 
    pageSize,
    searchFields,
    minSearchLength,
    getCacheKey,
    getCachedResults,
    setCachedResults,
    onResults,
    onError,
    addToHistory,
    lastDoc
  ]);
  
  // Fonction de recherche avec debounce
  const search = useCallback((term = searchTerm, filters = {}) => {
    if (enableDebounce) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(term, filters);
      }, debounceDelay);
    } else {
      performSearch(term, filters);
    }
    
    if (onSearch) {
      onSearch(term, filters);
    }
  }, [searchTerm, enableDebounce, debounceDelay, performSearch, onSearch]);
  
  // Charger plus de résultats
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      performSearch(searchTerm, {}, true);
    }
  }, [loading, hasMore, searchTerm, performSearch]);
  
  // Réinitialiser la recherche
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setError(null);
    setSuggestions([]);
    setHasMore(false);
    setLastDoc(null);
    
    // Annuler les timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);
  
  // Mise à jour du terme de recherche
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
    
    // Générer des suggestions
    if (enableSuggestions) {
      generateSuggestions(term);
    }
  }, [enableSuggestions, generateSuggestions]);
  
  // Recherche automatique lors du changement de terme
  useEffect(() => {
    if (searchTerm.length >= minSearchLength) {
      search(searchTerm);
    } else if (searchTerm.length === 0) {
      setResults([]);
      setSuggestions([]);
    }
  }, [searchTerm, minSearchLength]); // Attention: ne pas inclure 'search' pour éviter les boucles
  
  // Nettoyage
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    // Résultats
    results,
    loading,
    error,
    
    // Recherche
    searchTerm,
    setSearchTerm: updateSearchTerm,
    search,
    clearSearch,
    
    // Fonctionnalités avancées
    suggestions,
    history,
    hasMore,
    loadMore,
    
    // Utilitaires
    performSearch
  };
};

export default useGenericSearch; 