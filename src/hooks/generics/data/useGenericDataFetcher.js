/**
 * @fileoverview Hook générique pour la récupération de données
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 2
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 2
 * 
 * CORRECTIONS APPLIQUÉES POUR ÉVITER LES BOUCLES DE RE-RENDERS :
 * - Stabilisation des objets de configuration avec useMemo
 * - Mémoïsation des callbacks avec useCallback et dépendances stables
 * - Utilisation de useRef pour les callbacks onData et onError
 * - Évitement des mises à jour directes des références dans les dépendances
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { db } from '@/services/firebase-service';
import { 
  collection, 
  doc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  onSnapshot
} from '@/services/firebase-service';

/**
 * Hook générique pour la récupération de données
 * 
 * @description
 * Fonctionnalités supportées :
 * - fetch: Récupération de données avec cache
 * - real_time: Écoute en temps réel avec onSnapshot
 * - retry: Mécanisme de retry automatique
 * - cache: Cache intelligent avec invalidation
 * 
 * @param {string} entityType - Type d'entité à récupérer
 * @param {Object} fetchConfig - Configuration de récupération
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {any} returns.data - Données récupérées
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {Function} returns.refetch - Fonction de re-récupération
 * @returns {Function} returns.invalidateCache - Fonction d'invalidation du cache
 * @returns {boolean} returns.isStale - Données obsolètes
 * @returns {Date|null} returns.lastFetch - Timestamp de dernière récupération
 * @returns {number} returns.retryCount - Nombre de tentatives
 * 
 * @example
 * ```javascript
 * // Récupération d'une entité unique
 * const { data: concert, loading, error, refetch } = useGenericDataFetcher('concerts', {
 *   mode: 'single',
 *   id: 'concert123',
 *   enableRealTime: true
 * });
 * 
 * // Récupération d'une collection
 * const { data: concerts, loading, error } = useGenericDataFetcher('concerts', {
 *   mode: 'collection',
 *   filters: { statut: 'confirmé' },
 *   orderBy: { field: 'date', direction: 'asc' },
 *   limit: 50
 * });
 * 
 * // Avec cache personnalisé
 * const { data, isStale, invalidateCache } = useGenericDataFetcher('contacts', {
 *   mode: 'collection',
 *   cacheKey: 'active-contacts',
 *   cacheTTL: 10 * 60 * 1000 // 10 minutes
 * });
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @generic true
 * @replaces useDataFetcher, useEntityLoader, useCollectionLoader
 */
const useGenericDataFetcher = (entityType, fetchConfig = {}, options = {}) => {
  // ✅ CORRECTION 1: Stabiliser la configuration avec useMemo
  const stableFetchConfig = useMemo(() => ({
    mode: fetchConfig.mode || 'collection',
    id: fetchConfig.id || null,
    filters: fetchConfig.filters || {},
    orderBy: fetchConfig.orderBy || null,
    limit: fetchConfig.limit || null,
    cacheKey: fetchConfig.cacheKey || null,
    // onData, onError, transformData seront gérées séparément
  }), [
    fetchConfig.mode,
    fetchConfig.id,
    fetchConfig.filters,
    fetchConfig.orderBy,
    fetchConfig.limit,
    fetchConfig.cacheKey
  ]);

  const stableOptions = useMemo(() => ({
    enableCache: options.enableCache !== false,
    cacheTTL: options.cacheTTL || 5 * 60 * 1000,
    enableRealTime: options.enableRealTime || false,
    enableRetry: options.enableRetry !== false,
    maxRetries: options.maxRetries || 3,
    retryDelay: options.retryDelay || 1000,
    autoFetch: options.autoFetch !== false,
    enableStaleWhileRevalidate: options.enableStaleWhileRevalidate !== false
  }), [
    options.enableCache,
    options.cacheTTL,
    options.enableRealTime,
    options.enableRetry,
    options.maxRetries,
    options.retryDelay,
    options.autoFetch,
    options.enableStaleWhileRevalidate
  ]);
  
  // États de base
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isStale, setIsStale] = useState(false);
  
  // Références
  const cacheRef = useRef(new Map());
  const unsubscribeRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // ✅ CORRECTION 2: Références stables pour les callbacks
  const callbacksRef = useRef({
    onData: fetchConfig.onData,
    onError: fetchConfig.onError,
    transformData: fetchConfig.transformData
  });

  // ✅ CORRECTION 3: Mettre à jour les callbacks uniquement quand nécessaire
  useEffect(() => {
    callbacksRef.current = {
      onData: fetchConfig.onData,
      onError: fetchConfig.onError,
      transformData: fetchConfig.transformData
    };
  }, [fetchConfig.onData, fetchConfig.onError, fetchConfig.transformData]);
  
  // ✅ CORRECTION 4: Génération de la clé de cache stable
  const generateCacheKey = useCallback(() => {
    if (stableFetchConfig.cacheKey) return stableFetchConfig.cacheKey;
    
    const baseKey = `${entityType}_${stableFetchConfig.mode}`;
    if (stableFetchConfig.mode === 'single') {
      return `${baseKey}_${stableFetchConfig.id}`;
    }
    
    const filtersKey = Object.keys(stableFetchConfig.filters).length > 0 ? 
      `_${JSON.stringify(stableFetchConfig.filters)}` : '';
    const orderKey = stableFetchConfig.orderBy ? 
      `_${stableFetchConfig.orderBy.field}_${stableFetchConfig.orderBy.direction}` : '';
    const limitKey = stableFetchConfig.limit ? `_limit${stableFetchConfig.limit}` : '';
    
    return `${baseKey}${filtersKey}${orderKey}${limitKey}`;
  }, [entityType, stableFetchConfig]);
  
  // ✅ CORRECTION 5: Gestion du cache stable
  const getCachedData = useCallback(() => {
    if (!stableOptions.enableCache) return null;
    
    const key = generateCacheKey();
    const cached = cacheRef.current.get(key);
    
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > stableOptions.cacheTTL;
      if (!isExpired) {
        return cached.data;
      } else if (stableOptions.enableStaleWhileRevalidate) {
        setIsStale(true);
        return cached.data;
      }
    }
    
    return null;
  }, [stableOptions.enableCache, stableOptions.cacheTTL, stableOptions.enableStaleWhileRevalidate, generateCacheKey]);
  
  const setCachedData = useCallback((newData) => {
    if (!stableOptions.enableCache) return;
    
    const key = generateCacheKey();
    cacheRef.current.set(key, {
      data: newData,
      timestamp: Date.now()
    });
    setIsStale(false);
  }, [stableOptions.enableCache, generateCacheKey]);
  
  const invalidateCache = useCallback((specificKey = null) => {
    if (specificKey) {
      cacheRef.current.delete(specificKey);
    } else {
      const key = generateCacheKey();
      cacheRef.current.delete(key);
    }
    setIsStale(false);
  }, [generateCacheKey]);
  
  // ✅ CORRECTION 6: Construction de la requête Firebase stable
  const buildQuery = useCallback(() => {
    if (stableFetchConfig.mode === 'single') {
      if (!stableFetchConfig.id) {
        throw new Error('ID requis pour le mode single');
      }
      return doc(db, entityType, stableFetchConfig.id);
    }
    
    // Mode collection
    let q = collection(db, entityType);
    const constraints = [];
    
    // Filtres
    Object.entries(stableFetchConfig.filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          constraints.push(where(field, 'in', value));
        } else if (typeof value === 'object' && value.operator) {
          constraints.push(where(field, value.operator, value.value));
        } else {
          constraints.push(where(field, '==', value));
        }
      }
    });
    
    // Tri
    if (stableFetchConfig.orderBy) {
      constraints.push(orderBy(stableFetchConfig.orderBy.field, stableFetchConfig.orderBy.direction || 'asc'));
    }
    
    // Limite
    if (stableFetchConfig.limit) {
      constraints.push(limit(stableFetchConfig.limit));
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    return q;
  }, [entityType, stableFetchConfig]);
  
  // ✅ CORRECTION 7: Transformation des données stable
  const processData = useCallback((rawData) => {
    let processedData = rawData;
    
    // Transformation personnalisée
    const transformFn = callbacksRef.current.transformData;
    if (transformFn && typeof transformFn === 'function') {
      processedData = transformFn(processedData);
    }
    
    // Callback de données
    const onDataFn = callbacksRef.current.onData;
    if (onDataFn) {
      onDataFn(processedData);
    }
    
    return processedData;
  }, []); // Pas de dépendances car utilise des refs
  
  // ✅ CORRECTION 8: Fonction de récupération principale stable
  const fetchData = useCallback(async (useCache = true) => {
    // Vérifier le cache d'abord
    if (useCache) {
      const cached = getCachedData();
      if (cached && !isStale) {
        setData(cached);
        setLoading(false);
        return cached;
      }
    }
    
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    
    try {
      const q = buildQuery();
      let result;
      
      if (stableFetchConfig.mode === 'single') {
        const docSnap = await getDoc(q);
        if (docSnap.exists()) {
          result = { id: docSnap.id, ...docSnap.data() };
        } else {
          result = null;
        }
      } else {
        const querySnapshot = await getDocs(q);
        result = [];
        querySnapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() });
        });
      }
      
      // Traitement des données
      const processedData = processData(result);
      
      // Mise à jour des états
      setData(processedData);
      setCachedData(processedData);
      setLastFetch(new Date());
      setRetryCount(0);
      
      return processedData;
      
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = `Erreur lors de la récupération ${entityType}: ${err.message}`;
        setError(errorMessage);
        
        const onErrorFn = callbacksRef.current.onError;
        if (onErrorFn) {
          onErrorFn(err);
        }
        
        console.error('❌', errorMessage, err);
        
        // Mécanisme de retry
        if (stableOptions.enableRetry && retryCount < stableOptions.maxRetries) {
          setRetryCount(prev => prev + 1);
          
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(false);
          }, stableOptions.retryDelay * Math.pow(2, retryCount));
        }
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [
    getCachedData,
    isStale,
    buildQuery,
    stableFetchConfig.mode,
    entityType,
    processData,
    setCachedData,
    stableOptions.enableRetry,
    stableOptions.maxRetries,
    stableOptions.retryDelay,
    retryCount
  ]);
  
  // ✅ CORRECTION 9: Configuration de l'écoute en temps réel stable
  const setupRealTimeListener = useCallback(() => {
    if (!stableOptions.enableRealTime) return;
    
    try {
      const q = buildQuery();
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          let result;
          
          if (stableFetchConfig.mode === 'single') {
            if (snapshot.exists()) {
              result = { id: snapshot.id, ...snapshot.data() };
            } else {
              result = null;
            }
          } else {
            result = [];
            snapshot.forEach((doc) => {
              result.push({ id: doc.id, ...doc.data() });
            });
          }
          
          const processedData = processData(result);
          setData(processedData);
          setCachedData(processedData);
          setLastFetch(new Date());
          setError(null);
          
        },
        (err) => {
          const errorMessage = `Erreur temps réel ${entityType}: ${err.message}`;
          setError(errorMessage);
          
          const onErrorFn = callbacksRef.current.onError;
          if (onErrorFn) {
            onErrorFn(err);
          }
          
          console.error('❌', errorMessage, err);
        }
      );
      
      unsubscribeRef.current = unsubscribe;
      
    } catch (err) {
      console.error('❌ Erreur configuration temps réel:', err);
    }
  }, [stableOptions.enableRealTime, buildQuery, stableFetchConfig.mode, entityType, processData, setCachedData]);
  
  // ✅ CORRECTION 10: Fonction de re-récupération stable
  const refetch = useCallback(() => {
    invalidateCache();
    return fetchData(false);
  }, [invalidateCache, fetchData]);
  
  // ✅ CORRECTION 11: Effet de récupération automatique optimisé
  useEffect(() => {
    if (stableOptions.autoFetch) {
      fetchData();
    }
    
    if (stableOptions.enableRealTime) {
      setupRealTimeListener();
    }
    
    return () => {
      // Nettoyage
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [stableOptions.autoFetch, stableOptions.enableRealTime, fetchData, setupRealTimeListener]);
  
  // ✅ CORRECTION 12: Effet de vérification de fraîcheur des données optimisé
  useEffect(() => {
    if (!stableOptions.enableCache || !lastFetch) return;
    
    const checkStaleData = () => {
      const timeSinceLastFetch = Date.now() - lastFetch.getTime();
      if (timeSinceLastFetch > stableOptions.cacheTTL) {
        setIsStale(true);
      }
    };
    
    const interval = setInterval(checkStaleData, stableOptions.cacheTTL / 4);
    
    return () => clearInterval(interval);
  }, [stableOptions.enableCache, stableOptions.cacheTTL, lastFetch]);
  
  return {
    // Données
    data,
    loading,
    error,
    
    // Métadonnées
    lastFetch,
    retryCount,
    isStale,
    
    // Actions
    refetch,
    invalidateCache,
    
    // Utilitaires
    fetchData: () => fetchData(false),
    getCachedData,
    generateCacheKey
  };
};

export default useGenericDataFetcher; 