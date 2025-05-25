/**
 * @fileoverview Hook générique pour la récupération de données
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 2
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 2
 */

import { useState, useCallback, useEffect, useRef } from 'react';
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
 * const { data, isStale, invalidateCache } = useGenericDataFetcher('programmateurs', {
 *   mode: 'collection',
 *   cacheKey: 'active-programmateurs',
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
  const {
    mode = 'collection', // 'single' | 'collection'
    id = null, // Pour mode 'single'
    filters = {},
    orderBy: orderByConfig = null,
    limit: limitCount = null,
    cacheKey = null,
    onData,
    onError,
    transformData = null
  } = fetchConfig;
  
  const {
    enableCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes par défaut
    enableRealTime = false,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    autoFetch = true,
    enableStaleWhileRevalidate = true
  } = options;
  
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
  
  // Génération de la clé de cache
  const generateCacheKey = useCallback(() => {
    if (cacheKey) return cacheKey;
    
    const baseKey = `${entityType}_${mode}`;
    if (mode === 'single') {
      return `${baseKey}_${id}`;
    }
    
    const filtersKey = Object.keys(filters).length > 0 ? 
      `_${JSON.stringify(filters)}` : '';
    const orderKey = orderByConfig ? 
      `_${orderByConfig.field}_${orderByConfig.direction}` : '';
    const limitKey = limitCount ? `_limit${limitCount}` : '';
    
    return `${baseKey}${filtersKey}${orderKey}${limitKey}`;
  }, [entityType, mode, id, filters, orderByConfig, limitCount, cacheKey]);
  
  // Gestion du cache
  const getCachedData = useCallback(() => {
    if (!enableCache) return null;
    
    const key = generateCacheKey();
    const cached = cacheRef.current.get(key);
    
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > cacheTTL;
      if (!isExpired) {
        return cached.data;
      } else if (enableStaleWhileRevalidate) {
        setIsStale(true);
        return cached.data; // Retourner les données obsolètes en attendant
      }
    }
    
    return null;
  }, [enableCache, generateCacheKey, cacheTTL, enableStaleWhileRevalidate]);
  
  const setCachedData = useCallback((newData) => {
    if (!enableCache) return;
    
    const key = generateCacheKey();
    cacheRef.current.set(key, {
      data: newData,
      timestamp: Date.now()
    });
    setIsStale(false);
  }, [enableCache, generateCacheKey]);
  
  const invalidateCache = useCallback((specificKey = null) => {
    if (specificKey) {
      cacheRef.current.delete(specificKey);
    } else {
      const key = generateCacheKey();
      cacheRef.current.delete(key);
    }
    setIsStale(false);
  }, [generateCacheKey]);
  
  // Construction de la requête Firebase
  const buildQuery = useCallback(() => {
    if (mode === 'single') {
      if (!id) {
        throw new Error('ID requis pour le mode single');
      }
      return doc(db, entityType, id);
    }
    
    // Mode collection
    let q = collection(db, entityType);
    const constraints = [];
    
    // Filtres
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Pour les filtres de type "in"
          constraints.push(where(field, 'in', value));
        } else if (typeof value === 'object' && value.operator) {
          // Pour les filtres avec opérateurs personnalisés
          constraints.push(where(field, value.operator, value.value));
        } else {
          constraints.push(where(field, '==', value));
        }
      }
    });
    
    // Tri
    if (orderByConfig) {
      constraints.push(orderBy(orderByConfig.field, orderByConfig.direction || 'asc'));
    }
    
    // Limite
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    return q;
  }, [mode, id, entityType, filters, orderByConfig, limitCount]);
  
  // Transformation des données
  const processData = useCallback((rawData) => {
    let processedData = rawData;
    
    // Transformation personnalisée
    if (transformData && typeof transformData === 'function') {
      processedData = transformData(processedData);
    }
    
    // Callback de données
    if (onData) {
      onData(processedData);
    }
    
    return processedData;
  }, [transformData, onData]);
  
  // Fonction de récupération principale
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
      
      if (mode === 'single') {
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
        
        if (onError) {
          onError(err);
        }
        
        console.error('❌', errorMessage, err);
        
        // Mécanisme de retry
        if (enableRetry && retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          
          retryTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 Retry ${retryCount + 1}/${maxRetries} pour ${entityType}`);
            fetchData(false); // Ne pas utiliser le cache lors du retry
          }, retryDelay * Math.pow(2, retryCount)); // Backoff exponentiel
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
    mode,
    entityType,
    processData,
    setCachedData,
    onError,
    enableRetry,
    retryCount,
    maxRetries,
    retryDelay
  ]);
  
  // Configuration de l'écoute en temps réel
  const setupRealTimeListener = useCallback(() => {
    if (!enableRealTime) return;
    
    try {
      const q = buildQuery();
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          let result;
          
          if (mode === 'single') {
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
          
          console.log(`🔄 Données ${entityType} mises à jour en temps réel`);
        },
        (err) => {
          const errorMessage = `Erreur temps réel ${entityType}: ${err.message}`;
          setError(errorMessage);
          
          if (onError) {
            onError(err);
          }
          
          console.error('❌', errorMessage, err);
        }
      );
      
      unsubscribeRef.current = unsubscribe;
      
    } catch (err) {
      console.error('❌ Erreur configuration temps réel:', err);
    }
  }, [enableRealTime, buildQuery, mode, entityType, processData, setCachedData, onError]);
  
  // Fonction de re-récupération
  const refetch = useCallback(() => {
    invalidateCache();
    return fetchData(false);
  }, [invalidateCache, fetchData]);
  
  // Effet de récupération automatique
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    
    if (enableRealTime) {
      setupRealTimeListener();
    }
    
    return () => {
      // Nettoyage
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, enableRealTime, fetchData, setupRealTimeListener]);
  
  // Effet de vérification de fraîcheur des données
  useEffect(() => {
    if (!enableCache || !lastFetch) return;
    
    const checkStaleData = () => {
      const timeSinceLastFetch = Date.now() - lastFetch.getTime();
      if (timeSinceLastFetch > cacheTTL) {
        setIsStale(true);
      }
    };
    
    const interval = setInterval(checkStaleData, cacheTTL / 4); // Vérifier 4 fois par période TTL
    
    return () => clearInterval(interval);
  }, [enableCache, lastFetch, cacheTTL]);
  
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