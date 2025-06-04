/**
 * @fileoverview Hook générique pour la gestion avancée du cache de données
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 2
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 2
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import useGenericDataFetcher from './useGenericDataFetcher';

/**
 * Hook générique pour la gestion avancée du cache de données
 * 
 * @description
 * Fonctionnalités supportées :
 * - multi_level_cache: Cache multi-niveaux (mémoire, session, local)
 * - cache_strategies: Stratégies de cache avancées
 * - cache_invalidation: Invalidation intelligente du cache
 * - cache_warming: Préchauffage du cache
 * 
 * @param {string} entityType - Type d'entité à mettre en cache
 * @param {Object} cacheConfig - Configuration du cache
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {any} returns.data - Données en cache
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {Function} returns.invalidate - Fonction d'invalidation
 * @returns {Function} returns.warmCache - Fonction de préchauffage
 * @returns {Object} returns.cacheStats - Statistiques du cache
 * @returns {Function} returns.clearCache - Fonction de nettoyage
 * @returns {boolean} returns.isFromCache - Données proviennent du cache
 * 
 * @example
 * ```javascript
 * // Cache simple avec TTL
 * const { data, loading, cacheStats } = useGenericCachedData('concerts', {
 *   cacheKey: 'all-concerts',
 *   strategy: 'ttl',
 *   ttl: 10 * 60 * 1000, // 10 minutes
 *   levels: ['memory', 'session']
 * });
 * 
 * // Cache avec invalidation basée sur les tags
 * const { data, invalidate } = useGenericCachedData('contacts', {
 *   cacheKey: 'active-contacts',
 *   strategy: 'tags',
 *   tags: ['contacts', 'users'],
 *   levels: ['memory', 'local']
 * });
 * 
 * // Cache avec préchauffage
 * const { warmCache, cacheStats } = useGenericCachedData('concerts', {
 *   strategy: 'lru',
 *   maxSize: 100,
 *   enableWarming: true,
 *   warmingQueries: [
 *     { filters: { statut: 'confirmé' } },
 *     { filters: { statut: 'contact' } }
 *   ]
 * });
 * ```
 * 
 * @complexity HIGH
 * @businessCritical false
 * @generic true
 * @replaces useCachedData, useCacheManager, useDataCache
 */
const useGenericCachedData = (entityType, cacheConfig = {}, options = {}) => {
  const {
    cacheKey = 'default',
    strategy = 'lru',
    levels = ['memory'],
    maxSize = 100,
    ttl = 5 * 60 * 1000,
    tags = [],
    fetchConfig = {},
    onCacheInvalidate,
    onCacheHit,
    onCacheMiss
  } = cacheConfig;
  
  const {
    enableCache = true,
    enableRealTime = false,
    enableOptimisticUpdates = true,
    enableStats = true,
    enableCompression = false,
    onCacheHit: onCacheHitOption,
    onCacheMiss: onCacheMissOption,
    onError
  } = options;
  
  // États de base
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0,
    lastHit: null,
    lastMiss: null,
    hitRate: 0
  });
  const [isFromCache, setIsFromCache] = useState(false);
  const [realTimeSubscription, setRealTimeSubscription] = useState(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map());
  
  // Références pour les différents niveaux de cache
  const memoryCacheRef = useRef(new Map());
  const lruOrderRef = useRef([]);
  const tagsMapRef = useRef(new Map());
  const errorRetryRef = useRef(new Map());
  
  // Hook de récupération de données de base
  const {
    data,
    loading,
    error,
    refetch,
    lastFetch
  } = useGenericDataFetcher(entityType, {
    ...fetchConfig,
    cacheKey,
    onData: (newData) => {
      if (newData) {
        setCacheData(cacheKey, newData);
        
        // Appliquer les mises à jour optimistes si activées
        if (enableOptimisticUpdates && optimisticUpdates.has(cacheKey)) {
          const optimisticData = optimisticUpdates.get(cacheKey);
          const mergedData = { ...newData, ...optimisticData };
          setCacheData(cacheKey, mergedData);
        }
      }
      if (fetchConfig.onData) {
        fetchConfig.onData(newData);
      }
    },
    onError: (err) => {
      // Gestion d'erreur avec retry si activé
      if (onError) {
        onError(err);
      }
      
      // Retry automatique pour certaines erreurs
      const retryCount = errorRetryRef.current.get(cacheKey) || 0;
      if (retryCount < 3 && err.code !== 'permission-denied') {
        errorRetryRef.current.set(cacheKey, retryCount + 1);
        setTimeout(() => refetch(), Math.pow(2, retryCount) * 1000);
      }
    }
  }, {
    enableCache: false, // Désactiver le cache du DataFetcher, on gère le nôtre
    autoFetch: !enableCache // Fetch automatique seulement si cache désactivé
  });
  
  // Génération de clé de cache
  const generateCacheKey = useCallback((key) => {
    return `${entityType}_${key || 'default'}`;
  }, [entityType]);
  
  // Compression des données (si activée)
  const compressData = useCallback((data) => {
    if (!enableCompression) return data;
    
    try {
      return JSON.stringify(data);
    } catch (err) {
      console.warn('⚠️ Erreur compression données:', err);
      return data;
    }
  }, [enableCompression]);
  
  const decompressData = useCallback((data) => {
    if (!enableCompression || typeof data !== 'string') return data;
    
    try {
      return JSON.parse(data);
    } catch (err) {
      console.warn('⚠️ Erreur décompression données:', err);
      return data;
    }
  }, [enableCompression]);
  
  // Gestion du cache mémoire
  const getFromMemoryCache = useCallback((key) => {
    const fullKey = generateCacheKey(key);
    const cached = memoryCacheRef.current.get(fullKey);
    
    if (!cached) return null;
    
    // Vérification TTL
    if (strategy === 'ttl' && Date.now() - cached.timestamp > ttl) {
      memoryCacheRef.current.delete(fullKey);
      return null;
    }
    
    // Mise à jour LRU
    if (strategy === 'lru') {
      const index = lruOrderRef.current.indexOf(fullKey);
      if (index > -1) {
        lruOrderRef.current.splice(index, 1);
      }
      lruOrderRef.current.unshift(fullKey);
    }
    
    return decompressData(cached.data);
  }, [generateCacheKey, strategy, ttl, decompressData]);
  
  const setToMemoryCache = useCallback((key, data) => {
    const fullKey = generateCacheKey(key);
    const compressedData = compressData(data);
    
    memoryCacheRef.current.set(fullKey, {
      data: compressedData,
      timestamp: Date.now(),
      tags: tags
    });
    
    // Gestion LRU
    if (strategy === 'lru') {
      const index = lruOrderRef.current.indexOf(fullKey);
      if (index > -1) {
        lruOrderRef.current.splice(index, 1);
      }
      lruOrderRef.current.unshift(fullKey);
      
      // Éviction si dépassement de taille
      while (lruOrderRef.current.length > maxSize) {
        const oldestKey = lruOrderRef.current.pop();
        memoryCacheRef.current.delete(oldestKey);
      }
    }
    
    // Gestion des tags
    if (strategy === 'tags' && tags.length > 0) {
      tags.forEach(tag => {
        if (!tagsMapRef.current.has(tag)) {
          tagsMapRef.current.set(tag, new Set());
        }
        tagsMapRef.current.get(tag).add(fullKey);
      });
    }
  }, [generateCacheKey, compressData, tags, strategy, maxSize]);
  
  // Gestion du cache de session
  const getFromSessionCache = useCallback((key) => {
    if (!levels.includes('session') || typeof window === 'undefined') return null;
    
    try {
      const fullKey = generateCacheKey(key);
      const cached = sessionStorage.getItem(fullKey);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached);
      
      // Vérification TTL
      if (strategy === 'ttl' && Date.now() - parsedCache.timestamp > ttl) {
        sessionStorage.removeItem(fullKey);
        return null;
      }
      
      return decompressData(parsedCache.data);
    } catch (err) {
      console.warn('⚠️ Erreur lecture session cache:', err);
      return null;
    }
  }, [levels, generateCacheKey, strategy, ttl, decompressData]);
  
  const setToSessionCache = useCallback((key, data) => {
    if (!levels.includes('session') || typeof window === 'undefined') return;
    
    try {
      const fullKey = generateCacheKey(key);
      const cacheData = {
        data: compressData(data),
        timestamp: Date.now(),
        tags: tags
      };
      sessionStorage.setItem(fullKey, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('⚠️ Erreur écriture session cache:', err);
    }
  }, [levels, generateCacheKey, compressData, tags]);
  
  // Gestion du cache local
  const getFromLocalCache = useCallback((key) => {
    if (!levels.includes('local') || typeof window === 'undefined') return null;
    
    try {
      const fullKey = generateCacheKey(key);
      const cached = localStorage.getItem(fullKey);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached);
      
      // Vérification TTL
      if (strategy === 'ttl' && Date.now() - parsedCache.timestamp > ttl) {
        localStorage.removeItem(fullKey);
        return null;
      }
      
      return decompressData(parsedCache.data);
    } catch (err) {
      console.warn('⚠️ Erreur lecture local cache:', err);
      return null;
    }
  }, [levels, generateCacheKey, strategy, ttl, decompressData]);
  
  const setToLocalCache = useCallback((key, data) => {
    if (!levels.includes('local') || typeof window === 'undefined') return;
    
    try {
      const fullKey = generateCacheKey(key);
      const cacheData = {
        data: compressData(data),
        timestamp: Date.now(),
        tags: tags
      };
      localStorage.setItem(fullKey, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('⚠️ Erreur écriture local cache:', err);
    }
  }, [levels, generateCacheKey, compressData, tags]);
  
  // ✅ CORRECTION: Références stables pour éviter les dépendances circulaires
  const levelsRef = useRef(levels);
  const getFromMemoryCacheRef = useRef(getFromMemoryCache);
  const getFromSessionCacheRef = useRef(getFromSessionCache);
  const getFromLocalCacheRef = useRef(getFromLocalCache);
  const setToMemoryCacheRef = useRef(setToMemoryCache);
  const setToSessionCacheRef = useRef(setToSessionCache);
  
  levelsRef.current = levels;
  getFromMemoryCacheRef.current = getFromMemoryCache;
  getFromSessionCacheRef.current = getFromSessionCache;
  getFromLocalCacheRef.current = getFromLocalCache;
  setToMemoryCacheRef.current = setToMemoryCache;
  setToSessionCacheRef.current = setToSessionCache;
  
  // Fonction unifiée de récupération du cache - CORRIGÉ
  const getCacheData = useCallback((key) => {
    // Ordre de priorité : memory > session > local
    let cachedData = null;
    
    if (levelsRef.current.includes('memory')) {
      cachedData = getFromMemoryCacheRef.current(key);
      if (cachedData) {
        setIsFromCache(true);
        return cachedData;
      }
    }
    
    if (levelsRef.current.includes('session')) {
      cachedData = getFromSessionCacheRef.current(key);
      if (cachedData) {
        // Remonter vers le cache mémoire
        if (levelsRef.current.includes('memory')) {
          setToMemoryCacheRef.current(key, cachedData);
        }
        setIsFromCache(true);
        return cachedData;
      }
    }
    
    if (levelsRef.current.includes('local')) {
      cachedData = getFromLocalCacheRef.current(key);
      if (cachedData) {
        // Remonter vers les caches supérieurs
        if (levelsRef.current.includes('memory')) {
          setToMemoryCacheRef.current(key, cachedData);
        }
        if (levelsRef.current.includes('session')) {
          setToSessionCacheRef.current(key, cachedData);
        }
        setIsFromCache(true);
        return cachedData;
      }
    }
    
    setIsFromCache(false);
    return null;
  }, []); // ✅ Aucune dépendance car on utilise les références
  
  // ✅ CORRECTION: Références stables pour setCacheData
  const setToLocalCacheRef = useRef(setToLocalCache);
  setToLocalCacheRef.current = setToLocalCache;
  
  // Fonction unifiée de mise en cache - CORRIGÉ
  const setCacheData = useCallback((key, data) => {
    if (levelsRef.current.includes('memory')) {
      setToMemoryCacheRef.current(key, data);
    }
    if (levelsRef.current.includes('session')) {
      setToSessionCacheRef.current(key, data);
    }
    if (levelsRef.current.includes('local')) {
      setToLocalCacheRef.current(key, data);
    }
    
    // Mise à jour des statistiques
    if (enableStats) {
      setCacheStats(prev => ({
        ...prev,
        size: memoryCacheRef.current.size,
        lastHit: new Date()
      }));
    }
  }, [enableStats]); // ✅ Dépendances stables uniquement
  
  // ✅ CORRECTION: Références stables pour invalidate
  const generateCacheKeyRef = useRef(generateCacheKey);
  const onCacheInvalidateRef = useRef(onCacheInvalidate);
  
  generateCacheKeyRef.current = generateCacheKey;
  onCacheInvalidateRef.current = onCacheInvalidate;
  
  // Invalidation du cache - CORRIGÉ
  const invalidate = useCallback((keyOrTags = null) => {
    if (strategy === 'tags' && keyOrTags && Array.isArray(keyOrTags)) {
      // Invalidation par tags
      keyOrTags.forEach(tag => {
        const keysToInvalidate = tagsMapRef.current.get(tag);
        if (keysToInvalidate) {
          keysToInvalidate.forEach(key => {
            memoryCacheRef.current.delete(key);
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem(key);
              localStorage.removeItem(key);
            }
          });
          tagsMapRef.current.delete(tag);
        }
      });
    } else if (keyOrTags) {
      // Invalidation par clé spécifique
      const fullKey = generateCacheKeyRef.current(keyOrTags);
      memoryCacheRef.current.delete(fullKey);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(fullKey);
        localStorage.removeItem(fullKey);
      }
    } else {
      // Invalidation complète
      memoryCacheRef.current.clear();
      lruOrderRef.current = [];
      tagsMapRef.current.clear();
      if (typeof window !== 'undefined') {
        // Nettoyer seulement les clés de cette entité
        const prefix = generateCacheKeyRef.current('');
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith(prefix)) {
            sessionStorage.removeItem(key);
          }
        });
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        });
      }
    }
    
    // Callback d'invalidation
    if (onCacheInvalidateRef.current) {
      onCacheInvalidateRef.current(keyOrTags, {
        strategy,
        invalidatedKeys: keyOrTags ? (Array.isArray(keyOrTags) ? keyOrTags : [keyOrTags]) : ['all'],
        timestamp: new Date(),
        cacheSize: memoryCacheRef.current.size
      });
    }
    
    // Mise à jour des statistiques
    if (enableStats) {
      setCacheStats(prev => ({
        ...prev,
        size: memoryCacheRef.current.size
      }));
    }
  }, [strategy, enableStats]); // ✅ Dépendances stables uniquement
  
  // ✅ CORRECTION: Références stables pour updateCacheStats
  const onCacheHitRef = useRef(onCacheHit);
  const onCacheMissRef = useRef(onCacheMiss);
  const onCacheHitOptionRef = useRef(onCacheHitOption);
  const onCacheMissOptionRef = useRef(onCacheMissOption);
  
  onCacheHitRef.current = onCacheHit;
  onCacheMissRef.current = onCacheMiss;
  onCacheHitOptionRef.current = onCacheHitOption;
  onCacheMissOptionRef.current = onCacheMissOption;
  
  // Mise à jour des statistiques de cache - CORRIGÉ
  const updateCacheStats = useCallback((isHit) => {
    if (!enableStats) return;
    
    setCacheStats(prev => {
      const newStats = {
        ...prev,
        [isHit ? 'hits' : 'misses']: prev[isHit ? 'hits' : 'misses'] + 1,
        [isHit ? 'lastHit' : 'lastMiss']: new Date()
      };
      
      const totalRequests = newStats.hits + newStats.misses;
      newStats.hitRate = totalRequests > 0 ? (newStats.hits / totalRequests) * 100 : 0;
      
      return newStats;
    });
    
    // Callbacks de cache avec métadonnées
    if (isHit && onCacheHitRef.current) {
      onCacheHitRef.current({
        cacheKey,
        strategy,
        level: 'memory', // TODO: détecter le niveau réel
        timestamp: new Date()
      });
    } else if (!isHit && onCacheMissRef.current) {
      onCacheMissRef.current({
        cacheKey,
        strategy,
        timestamp: new Date(),
        willFetch: true
      });
    }
    
    // Fallback vers les callbacks des options si définis
    if (isHit && onCacheHitOptionRef.current) {
      onCacheHitOptionRef.current();
    } else if (!isHit && onCacheMissOptionRef.current) {
      onCacheMissOptionRef.current();
    }
  }, [enableStats, cacheKey, strategy]); // ✅ Dépendances stables uniquement
  
  // ✅ CORRECTION: Références stables pour l'effet de cache
  const updateCacheStatsRef = useRef(updateCacheStats);
  updateCacheStatsRef.current = updateCacheStats;
  
  // Effet de récupération des données avec cache - CORRIGÉ
  useEffect(() => {
    if (!cacheKey) return;
    
    const cachedData = getCacheDataRef.current(cacheKey);
    if (cachedData) {
      updateCacheStatsRef.current(true);
      // Les données sont déjà définies via le DataFetcher
    } else {
      updateCacheStatsRef.current(false);
      refetchRef.current(); // Déclencher la récupération
    }
  }, [cacheKey]); // ✅ Dépendances stables uniquement
  
  // ✅ CORRECTION: Références stables pour warmCache
  const getCacheDataRef = useRef(getCacheData);
  const setCacheDataRef = useRef(setCacheData);
  const refetchRef = useRef(refetch);
  
  getCacheDataRef.current = getCacheData;
  setCacheDataRef.current = setCacheData;
  refetchRef.current = refetch;
  
  // Préchauffage du cache - CORRIGÉ
  const warmCache = useCallback(async (warmingQueries = []) => {
    if (!warmingQueries.length) return;
    
    try {
      for (const queryConfig of warmingQueries) {
        const warmKey = `warm_${JSON.stringify(queryConfig)}`;
        
        // Vérifier si déjà en cache
        const cached = getCacheDataRef.current(warmKey);
        if (cached) continue;
        
        // Simuler une requête de préchauffage
        // En production, cela ferait une vraie requête avec queryConfig
        const warmData = await refetchRef.current(queryConfig);
        if (warmData) {
          setCacheDataRef.current(warmKey, warmData);
        }
      }
      
    } catch (error) {
      console.error(`❌ Erreur préchauffage ${entityType}:`, error);
    }
  }, [entityType]); // ✅ Dépendances stables uniquement
  
  // Nettoyage complet du cache - CORRIGÉ
  const clearCache = useCallback(() => {
    // Vider tous les niveaux de cache
    memoryCacheRef.current.clear();
    lruOrderRef.current = [];
    tagsMapRef.current.clear();
    
    if (typeof window !== 'undefined') {
      const prefix = generateCacheKeyRef.current('');
      
      // Nettoyer sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Nettoyer localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Réinitialiser les statistiques
    setCacheStats({
      hits: 0,
      misses: 0,
      size: 0,
      lastHit: null,
      lastMiss: null,
      hitRate: 0
    });
    
    setIsFromCache(false);
  }, []); // ✅ Aucune dépendance car on utilise la référence

  // Gestion du temps réel - CORRIGÉ
  useEffect(() => {
    if (!enableRealTime || !enableCache) return;
    
    // Simuler un abonnement temps réel (en production, utiliser onSnapshot)
    const subscription = setInterval(() => {
      // Vérifier si les données ont changé
      const currentData = getCacheDataRef.current(cacheKey);
      if (currentData) {
        // Déclencher un refetch périodique pour simuler le temps réel
        refetchRef.current();
      }
    }, 30000); // Toutes les 30 secondes
    
    setRealTimeSubscription(subscription);
    
    return () => {
      if (subscription) {
        clearInterval(subscription);
        setRealTimeSubscription(null);
      }
    };
  }, [enableRealTime, enableCache, cacheKey]); // ✅ Dépendances stables uniquement
  
  // Fonction de mise à jour optimiste - CORRIGÉ
  const applyOptimisticUpdate = useCallback((key, updates) => {
    if (!enableOptimisticUpdates) return;
    
    // Stocker la mise à jour optimiste
    setOptimisticUpdates(prev => new Map(prev.set(key, updates)));
    
    // Appliquer immédiatement au cache
    const currentData = getCacheDataRef.current(key);
    if (currentData) {
      const optimisticData = Array.isArray(currentData) 
        ? currentData.map(item => item.id === updates.id ? { ...item, ...updates } : item)
        : { ...currentData, ...updates };
      
      setCacheDataRef.current(key, optimisticData);
    }
    
    // Nettoyer après un délai
    setTimeout(() => {
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }, 5000);
  }, [enableOptimisticUpdates]); // ✅ Dépendances stables uniquement
  
  // ✅ CORRECTION: Références stables pour handleError
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  
  // Fonction de gestion d'erreur avancée - CORRIGÉ
  const handleError = useCallback((error, context = {}) => {
    console.error(`❌ Erreur cache ${entityType}:`, error, context);
    
    if (onErrorRef.current) {
      onErrorRef.current(error, {
        entityType,
        cacheKey,
        context,
        cacheStats,
        timestamp: new Date()
      });
    }
    
    // Retry logic basée sur le type d'erreur
    if (error.code === 'network-error' && context.retryable !== false) {
      const retryCount = errorRetryRef.current.get(cacheKey) || 0;
      if (retryCount < 3) {
        errorRetryRef.current.set(cacheKey, retryCount + 1);
        setTimeout(() => refetchRef.current(), Math.pow(2, retryCount) * 1000);
      }
    }
  }, [entityType, cacheKey, cacheStats]); // ✅ Dépendances stables uniquement

  return {
    // Données
    data,
    loading,
    error,
    
    // Métadonnées du cache
    isFromCache,
    cacheStats,
    lastFetch,
    realTimeSubscription,
    optimisticUpdates: Array.from(optimisticUpdates.entries()),
    
    // Actions
    invalidate,
    warmCache,
    clearCache,
    applyOptimisticUpdate,
    handleError,
    
    // Utilitaires
    getCacheData,
    setCacheData,
    generateCacheKey
  };
};

export default useGenericCachedData; 