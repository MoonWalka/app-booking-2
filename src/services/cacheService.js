/**
 * Service de cache centralisé pour les hooks
 * 
 * Fournit un système de cache partagé entre les hooks avec gestion d'expiration
 * et possibilités de configuration avancées.
 */

// Configuration par défaut
const DEFAULT_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutes en ms
  maxSize: 100, // Nombre maximal d'entrées dans le cache
  debug: process.env.NODE_ENV !== 'production',
  logLevel: 'warn'
};

// État interne du cache
const state = {
  cache: new Map(),
  config: { ...DEFAULT_CONFIG },
  timestamps: new Map(), // Timestamps pour chaque entrée
  accessCount: new Map(), // Nombre d'accès pour chaque entrée
  hits: 0,
  misses: 0,
  cleanupTimer: null
};

/**
 * Initialise le service de cache avec la configuration spécifiée
 * @param {Object} config - Configuration du cache
 */
export const initCache = (config = {}) => {
  state.config = {
    ...DEFAULT_CONFIG,
    ...config
  };

  // Démarrer le nettoyage périodique
  if (state.cleanupTimer) {
    clearInterval(state.cleanupTimer);
  }
  
  if (state.config.ttl > 0) {
    state.cleanupTimer = setInterval(() => {
      cleanupExpiredEntries();
    }, Math.min(state.config.ttl / 2, 60000)); // Maximum toutes les minutes
  }
  
  debugLog('Cache initialisé avec config:', state.config);
};

/**
 * Stocke une valeur dans le cache
 * @param {string} key - Clé du cache (ex: "entityType:id")
 * @param {*} value - Valeur à stocker
 * @param {Object} options - Options spécifiques à cette entrée
 * @returns {boolean} - Succès de l'opération
 */
export const setCache = (key, value, options = {}) => {
  if (!key) return false;
  
  // Éviter de stocker null/undefined sauf si explicitement permis
  if (value === null || value === undefined) {
    if (!options.allowNull) {
      debugLog(`Tentative de mettre en cache une valeur null/undefined pour ${key}, ignoré`);
      return false;
    }
  }
  
  // Si le cache est plein et que cette clé n'existe pas, supprimer l'entrée la moins utilisée
  if (!state.cache.has(key) && state.cache.size >= state.config.maxSize) {
    evictLeastUsed();
  }
  
  const ttl = options.ttl || state.config.ttl;
  const now = Date.now();
  
  state.cache.set(key, value);
  state.timestamps.set(key, now + ttl);
  state.accessCount.set(key, state.accessCount.get(key) || 0);
  
  debugLog(`Cache SET: ${key}`, 'debug');
  return true;
};

/**
 * Récupère une valeur du cache
 * @param {string} key - Clé du cache
 * @param {Object} options - Options de récupération
 * @returns {*} - Valeur en cache ou undefined si non trouvé
 */
export const getCache = (key, options = {}) => {
  if (!key || !state.cache.has(key)) {
    state.misses++;
    debugLog(`Cache MISS: ${key}`, 'debug');
    return undefined;
  }
  
  const now = Date.now();
  const expiry = state.timestamps.get(key);
  
  // Vérifier si l'entrée a expiré
  if (expiry && now > expiry) {
    state.misses++;
    removeCache(key);
    debugLog(`Cache EXPIRED: ${key}`, 'debug');
    return undefined;
  }
  
  // Incrémenter le compteur d'accès
  state.accessCount.set(key, (state.accessCount.get(key) || 0) + 1);
  state.hits++;
  
  debugLog(`Cache HIT: ${key}`, 'debug');
  return state.cache.get(key);
};

/**
 * Supprime une entrée spécifique du cache
 * @param {string} key - Clé à supprimer
 * @returns {boolean} - Succès de l'opération
 */
export const removeCache = (key) => {
  if (!key || !state.cache.has(key)) {
    return false;
  }
  
  state.cache.delete(key);
  state.timestamps.delete(key);
  state.accessCount.delete(key);
  
  debugLog(`Cache REMOVE: ${key}`, 'info');
  return true;
};

/**
 * Invalide les entrées du cache selon un filtre
 * @param {Function|string} filter - Fonction de filtre ou préfixe de clé
 * @returns {number} - Nombre d'entrées supprimées
 */
export const invalidateCache = (filter) => {
  if (!filter) return 0;
  
  let count = 0;
  const keys = [...state.cache.keys()];
  
  keys.forEach(key => {
    if (
      (typeof filter === 'function' && filter(key, state.cache.get(key))) ||
      (typeof filter === 'string' && key.startsWith(filter))
    ) {
      state.cache.delete(key);
      state.timestamps.delete(key);
      state.accessCount.delete(key);
      count++;
    }
  });
  
  debugLog(`Cache INVALIDATE: ${count} entrées supprimées`, 'info');
  return count;
};

/**
 * Vide complètement le cache
 */
export const clearCache = () => {
  const size = state.cache.size;
  state.cache.clear();
  state.timestamps.clear();
  state.accessCount.clear();
  
  debugLog(`Cache CLEAR: ${size} entrées supprimées`, 'info');
  return size;
};

/**
 * Obtient des statistiques sur le cache
 * @returns {Object} - Statistiques du cache
 */
export const getCacheStats = () => {
  return {
    size: state.cache.size,
    maxSize: state.config.maxSize,
    hits: state.hits,
    misses: state.misses,
    hitRate: state.hits + state.misses > 0
      ? Math.round((state.hits / (state.hits + state.misses)) * 100)
      : 0,
    ttl: state.config.ttl,
    oldestEntry: getOldestEntryAge(),
    config: { ...state.config }
  };
};

// Fonctions utilitaires internes

/**
 * Nettoie les entrées expirées du cache
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  let count = 0;
  
  [...state.timestamps.entries()].forEach(([key, expiry]) => {
    if (now > expiry) {
      state.cache.delete(key);
      state.timestamps.delete(key);
      state.accessCount.delete(key);
      count++;
    }
  });
  
  if (count > 0) {
    debugLog(`Cache CLEANUP: ${count} entrées expirées supprimées`, 'info');
  }
};

/**
 * Supprime l'entrée la moins utilisée du cache
 */
const evictLeastUsed = () => {
  if (state.cache.size === 0) return;
  
  let leastUsedKey = null;
  let leastUsedCount = Infinity;
  
  [...state.accessCount.entries()].forEach(([key, count]) => {
    if (count < leastUsedCount) {
      leastUsedKey = key;
      leastUsedCount = count;
    }
  });
  
  if (leastUsedKey) {
    removeCache(leastUsedKey);
    debugLog(`Cache EVICT: ${leastUsedKey} (utilisé ${leastUsedCount} fois)`, 'info');
  }
};

/**
 * Obtient l'âge de l'entrée la plus ancienne en secondes
 */
const getOldestEntryAge = () => {
  if (state.timestamps.size === 0) return 0;
  
  const now = Date.now();
  const ttl = state.config.ttl;
  let oldest = 0;
  
  [...state.timestamps.values()].forEach(timestamp => {
    const age = Math.max(0, (now - (timestamp - ttl)) / 1000);
    if (age > oldest) oldest = age;
  });
  
  return Math.round(oldest);
};

/**
 * Fonction de log conditionnelle
 */
const debugLog = (message, level = 'debug', ...args) => {
  if (!state.config.debug) return;
  if (!shouldLog(level)) return;
  
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  const logLevel = level in levels ? level : 'debug';
  
  console[logLevel](`[CacheService][${logLevel.toUpperCase()}] ${message}`, ...args);
};

/**
 * Détermine si un message de log doit être affiché selon le niveau configuré
 */
const shouldLog = (level) => {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  const configLevel = state.config.logLevel in levels ? state.config.logLevel : 'warn';
  
  return levels[level] >= levels[configLevel];
};

// Initialiser le cache avec la configuration par défaut
initCache();

// Exporter les fonctions publiques
export default {
  init: initCache,
  set: setCache,
  get: getCache,
  remove: removeCache,
  invalidate: invalidateCache,
  clear: clearCache,
  getStats: getCacheStats
};