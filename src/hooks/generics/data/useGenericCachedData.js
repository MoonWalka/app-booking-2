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
 * const { data, invalidate } = useGenericCachedData('programmateurs', {
 *   cacheKey: 'active-programmateurs',
 *   strategy: 'tags',
 *   tags: ['programmateurs', 'users'],
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
  
  // Fonction unifiée de récupération du cache
  const getCacheData = useCallback((key) => {
    // Ordre de priorité : memory > session > local
    let cachedData = null;
    
    if (levels.includes('memory')) {
      cachedData = getFromMemoryCache(key);
      if (cachedData) {
        setIsFromCache(true);
        return cachedData;
      }
    }
    
    if (levels.includes('session')) {
      cachedData = getFromSessionCache(key);
      if (cachedData) {
        // Remonter vers le cache mémoire
        if (levels.includes('memory')) {
          setToMemoryCache(key, cachedData);
        }
        setIsFromCache(true);
        return cachedData;
      }
    }
    
    if (levels.includes('local')) {
      cachedData = getFromLocalCache(key);
      if (cachedData) {
        // Remonter vers les caches supérieurs
        if (levels.includes('memory')) {
          setToMemoryCache(key, cachedData);
        }
        if (levels.includes('session')) {
          setToSessionCache(key, cachedData);
        }
        setIsFromCache(true);
        return cachedData;
      }
    }
    
    setIsFromCache(false);
    return null;
  }, [levels, getFromMemoryCache, getFromSessionCache, getFromLocalCache, setToMemoryCache, setToSessionCache]);
  
  // Fonction unifiée de mise en cache
  const setCacheData = useCallback((key, data) => {
    if (levels.includes('memory')) {
      setToMemoryCache(key, data);
    }
    if (levels.includes('session')) {
      setToSessionCache(key, data);
    }
    if (levels.includes('local')) {
      setToLocalCache(key, data);
    }
    
    // Mise à jour des statistiques
    if (enableStats) {
      setCacheStats(prev => ({
        ...prev,
        size: memoryCacheRef.current.size,
        lastHit: new Date()
      }));
    }
  }, [levels, setToMemoryCache, setToSessionCache, setToLocalCache, enableStats]);
  
  // Invalidation du cache
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
      const fullKey = generateCacheKey(keyOrTags);
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
        const prefix = generateCacheKey('');
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
    if (onCacheInvalidate) {
      onCacheInvalidate(keyOrTags, {
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
  }, [strategy, generateCacheKey, enableStats, onCacheInvalidate]);
  
  // Mise à jour des statistiques de cache
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
    if (isHit && onCacheHit) {
      onCacheHit({
        cacheKey,
        strategy,
        level: 'memory', // TODO: détecter le niveau réel
        timestamp: new Date()
      });
    } else if (!isHit && onCacheMiss) {
      onCacheMiss({
        cacheKey,
        strategy,
        timestamp: new Date(),
        willFetch: true
      });
    }
    
    // Fallback vers les callbacks des options si définis
    if (isHit && onCacheHitOption) {
      onCacheHitOption();
    } else if (!isHit && onCacheMissOption) {
      onCacheMissOption();
    }
  }, [enableStats, onCacheHit, onCacheMiss, onCacheHitOption, onCacheMissOption, cacheKey, strategy]);
  
  // Effet de récupération des données avec cache
  useEffect(() => {
    if (!cacheKey) return;
    
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      updateCacheStats(true);
      // Les données sont déjà définies via le DataFetcher
    } else {
      updateCacheStats(false);
      refetch(); // Déclencher la récupération
    }
  }, [cacheKey, getCacheData, updateCacheStats, refetch]);
  
  // Préchauffage du cache
  const warmCache = useCallback(async (warmingQueries = []) => {
    if (!warmingQueries.length) return;
    
    console.log(`🔥 Préchauffage du cache ${entityType}:`, warmingQueries.length, 'requêtes');
    
    try {
      for (const queryConfig of warmingQueries) {
        const warmKey = `warm_${JSON.stringify(queryConfig)}`;
        
        // Vérifier si déjà en cache
        const cached = getCacheData(warmKey);
        if (cached) continue;
        
        // Simuler une requête de préchauffage
        // En production, cela ferait une vraie requête avec queryConfig
        const warmData = await refetch(queryConfig);
        if (warmData) {
          setCacheData(warmKey, warmData);
        }
      }
      
      console.log(`✅ Préchauffage terminé pour ${entityType}`);
    } catch (error) {
      console.error(`❌ Erreur préchauffage ${entityType}:`, error);
    }
  }, [entityType, getCacheData, setCacheData, refetch]);
  
  // Nettoyage complet du cache
  const clearCache = useCallback(() => {
    console.log(`🧹 Nettoyage complet du cache ${entityType}`);
    
    // Vider tous les niveaux de cache
    memoryCacheRef.current.clear();
    lruOrderRef.current = [];
    tagsMapRef.current.clear();
    
    if (typeof window !== 'undefined') {
      const prefix = generateCacheKey('');
      
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
    
    console.log(`✅ Cache ${entityType} nettoyé`);
  }, [entityType, generateCacheKey]);

  // Gestion du temps réel
  useEffect(() => {
    if (!enableRealTime || !enableCache) return;
    
    console.log(`🔄 Activation temps réel pour ${entityType}`);
    
    // Simuler un abonnement temps réel (en production, utiliser onSnapshot)
    const subscription = setInterval(() => {
      // Vérifier si les données ont changé
      const currentData = getCacheData(cacheKey);
      if (currentData) {
        // Déclencher un refetch périodique pour simuler le temps réel
        refetch();
      }
    }, 30000); // Toutes les 30 secondes
    
    setRealTimeSubscription(subscription);
    
    return () => {
      if (subscription) {
        clearInterval(subscription);
        setRealTimeSubscription(null);
        console.log(`🔄 Désactivation temps réel pour ${entityType}`);
      }
    };
  }, [enableRealTime, enableCache, entityType, cacheKey, getCacheData, refetch]);
  
  // Fonction de mise à jour optimiste
  const applyOptimisticUpdate = useCallback((key, updates) => {
    if (!enableOptimisticUpdates) return;
    
    console.log(`⚡ Mise à jour optimiste ${entityType}:`, updates);
    
    // Stocker la mise à jour optimiste
    setOptimisticUpdates(prev => new Map(prev.set(key, updates)));
    
    // Appliquer immédiatement au cache
    const currentData = getCacheData(key);
    if (currentData) {
      const optimisticData = Array.isArray(currentData) 
        ? currentData.map(item => item.id === updates.id ? { ...item, ...updates } : item)
        : { ...currentData, ...updates };
      
      setCacheData(key, optimisticData);
    }
    
    // Nettoyer après un délai
    setTimeout(() => {
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }, 5000);
  }, [enableOptimisticUpdates, entityType, getCacheData, setCacheData]);
  
  // Fonction de gestion d'erreur avancée
  const handleError = useCallback((error, context = {}) => {
    console.error(`❌ Erreur cache ${entityType}:`, error, context);
    
    if (onError) {
      onError(error, {
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
        console.log(`🔄 Retry ${retryCount + 1}/3 pour ${entityType}`);
        errorRetryRef.current.set(cacheKey, retryCount + 1);
        setTimeout(() => refetch(), Math.pow(2, retryCount) * 1000);
      }
    }
  }, [entityType, cacheKey, cacheStats, onError, refetch]);

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