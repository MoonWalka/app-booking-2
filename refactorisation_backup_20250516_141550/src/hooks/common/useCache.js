import { useCallback, useEffect, useRef } from 'react';
import cacheService from '@/services/cacheService';
import { debugLog as log } from '@/utils/logUtils';

/**
 * Hook personnalisé pour utiliser le service de cache centralisé
 * 
 * @param {string} namespace - Espace de noms pour les clés du cache (ex: 'lieux', 'concerts')
 * @param {Object} options - Options de configuration du cache pour ce composant
 * @returns {Object} - Méthodes pour interagir avec le cache
 */
const useCache = (namespace, options = {}) => {
  const {
    enabled = true,        // Activer/désactiver le cache pour ce hook
    ttl,                   // Durée de vie en ms (prioritaire sur la config globale)
    prefixKey = true,      // Préfixer automatiquement les clés avec le namespace
    invalidateOnUnmount = false // Invalider le cache de ce namespace au démontage
  } = options;
  
  // Garder trace des clés utilisées par cette instance du hook
  const instanceRef = useRef({
    usedKeys: new Set(),
    namespace
  });
  
  // Fonction pour préfixer une clé avec le namespace si nécessaire
  const getFullKey = useCallback((key) => {
    if (!key) return null;
    if (!prefixKey) return key;
    return `${namespace}:${key}`;
  }, [namespace, prefixKey]);
  
  // Récupérer une valeur du cache
  const get = useCallback((key, defaultValue) => {
    if (!enabled) return defaultValue;
    
    const fullKey = getFullKey(key);
    if (!fullKey) return defaultValue;
    
    // Ajouter à la liste des clés utilisées
    instanceRef.current.usedKeys.add(fullKey);
    
    const value = cacheService.get(fullKey);
    return value !== undefined ? value : defaultValue;
  }, [enabled, getFullKey]);
  
  // Stocker une valeur dans le cache
  const set = useCallback((key, value, itemOptions = {}) => {
    if (!enabled) return false;
    
    const fullKey = getFullKey(key);
    if (!fullKey) return false;
    
    // Ajouter à la liste des clés utilisées
    instanceRef.current.usedKeys.add(fullKey);
    
    // Appliquer les options spécifiques à cet élément, avec fallback sur les options du hook
    const mergedOptions = {
      ...itemOptions,
      ttl: itemOptions.ttl || ttl
    };
    
    return cacheService.set(fullKey, value, mergedOptions);
  }, [enabled, getFullKey, ttl]);
  
  // Supprimer une valeur du cache
  const remove = useCallback((key) => {
    const fullKey = getFullKey(key);
    if (!fullKey) return false;
    
    // Retirer de la liste des clés utilisées
    instanceRef.current.usedKeys.delete(fullKey);
    
    return cacheService.remove(fullKey);
  }, [getFullKey]);
  
  // Invalider tout le cache de ce namespace
  const invalidateNamespace = useCallback(() => {
    log(`Invalidation du cache pour le namespace ${namespace}`, 'info', 'useCache');
    return cacheService.invalidate(namespace + ':');
  }, [namespace]);
  
  // Vérifier si une clé est en cache
  const has = useCallback((key) => {
    if (!enabled) return false;
    
    const fullKey = getFullKey(key);
    if (!fullKey) return false;
    
    // Ne pas modifier usedKeys ici car on vérifie juste l'existence
    return cacheService.get(fullKey) !== undefined;
  }, [enabled, getFullKey]);
  
  // Invalider uniquement les clés utilisées par cette instance du hook
  const invalidateUsed = useCallback(() => {
    if (instanceRef.current.usedKeys.size === 0) return 0;
    
    let count = 0;
    for (const key of instanceRef.current.usedKeys) {
      if (cacheService.remove(key)) {
        count++;
      }
    }
    
    if (count > 0) {
      log(`${count} entrées invalidées pour le namespace ${namespace}`, 'info', 'useCache');
    }
    
    instanceRef.current.usedKeys.clear();
    return count;
  }, [namespace]);
  
  // Obtenir les statistiques globales du cache
  const getStats = useCallback(() => {
    return {
      ...cacheService.getStats(),
      namespaceUsedKeys: instanceRef.current.usedKeys.size,
      namespace
    };
  }, [namespace]);
  
  // Nettoyer le cache au démontage si configuré
  useEffect(() => {
    return () => {
      if (invalidateOnUnmount) {
        invalidateNamespace();
      }
    };
  }, [invalidateOnUnmount, invalidateNamespace]);
  
  return {
    get,
    set,
    remove,
    has,
    invalidateNamespace,
    invalidateUsed,
    getStats,
    enabled
  };
};

export default useCache;