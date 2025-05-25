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
    cacheKey,
    strategy = 'ttl', // 'ttl' | 'lru' | 'tags' | 'manual'
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    maxSize = 50,
    levels = ['memory'], // 'memory' | 'session' | 'local'
    tags = [],
    fetchConfig = {},
    onCacheHit,
    onCacheMiss,
    onCacheInvalidate
  } = cacheConfig;
  
  const {
    enablePersistence = true,
    enableCompression = false,
    enableWarming = false,
    warmingQueries = [],
    enableStats = true,
    enableAutoCleanup = true,
    cleanupInterval = 60 * 1000 // 1 minute
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
  
  // Références pour les différents niveaux de cache
  const memoryCacheRef = useRef(new Map());
  const lruOrderRef = useRef([]);
  const tagsMapRef = useRef(new Map());
  const cleanupIntervalRef = useRef(null);
  
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
      }
      if (fetchConfig.onData) {
        fetchConfig.onData(newData);
      }
    }
  }, {
    enableCache: false, // Désactiver le cache du DataFetcher, on gère le nôtre
    autoFetch: false // On contrôle le fetch manuellement
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
    
    if (onCacheInvalidate) {
      onCacheInvalidate(keyOrTags);
    }
    
    // Mise à jour des statistiques
    if (enableStats) {
      setCacheStats(prev => ({
        ...prev,
        size: memoryCacheRef.current.size
      }));
    }
  }, [strategy, generateCacheKey, onCacheInvalidate, enableStats]);
  
  // Préchauffage du cache
  const warmCache = useCallback(async () => {
    if (!enableWarming || warmingQueries.length === 0) return;
    
    console.log(`🔥 Préchauffage du cache ${entityType}...`);
    
    for (const query of warmingQueries) {
      try {
        // Utiliser le DataFetcher pour récupérer les données
        // Les données seront automatiquement mises en cache via onData
        await refetch();
      } catch (err) {
        console.warn(`⚠️ Erreur préchauffage cache:`, err);
      }
    }
  }, [enableWarming, warmingQueries, entityType, refetch]);
  
  // Nettoyage automatique du cache
  const cleanupCache = useCallback(() => {
    if (!enableAutoCleanup) return;
    
    const now = Date.now();
    let cleanedCount = 0;
    
    // Nettoyage du cache mémoire
    memoryCacheRef.current.forEach((value, key) => {
      if (strategy === 'ttl' && now - value.timestamp > ttl) {
        memoryCacheRef.current.delete(key);
        cleanedCount++;
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cache nettoyé: ${cleanedCount} entrées supprimées`);
      
      // Mise à jour des statistiques
      if (enableStats) {
        setCacheStats(prev => ({
          ...prev,
          size: memoryCacheRef.current.size
        }));
      }
    }
  }, [enableAutoCleanup, strategy, ttl, enableStats]);
  
  // Fonction de nettoyage complet
  const clearCache = useCallback(() => {
    invalidate();
  }, [invalidate]);
  
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
    
    if (isHit && onCacheHit) {
      onCacheHit();
    } else if (!isHit && onCacheMiss) {
      onCacheMiss();
    }
  }, [enableStats, onCacheHit, onCacheMiss]);
  
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
  
  // Effet de nettoyage automatique
  useEffect(() => {
    if (enableAutoCleanup) {
      cleanupIntervalRef.current = setInterval(cleanupCache, cleanupInterval);
    }
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [enableAutoCleanup, cleanupCache, cleanupInterval]);
  
  // Effet de préchauffage initial
  useEffect(() => {
    if (enableWarming) {
      warmCache();
    }
  }, [enableWarming, warmCache]);
  
  return {
    // Données
    data,
    loading,
    error,
    
    // Métadonnées du cache
    isFromCache,
    cacheStats,
    lastFetch,
    
    // Actions
    invalidate,
    warmCache,
    clearCache,
    
    // Utilitaires
    getCacheData,
    setCacheData,
    generateCacheKey
  };
};

export default useGenericCachedData; 