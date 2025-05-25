/**
 * Service centralisé de persistance pour TourCraft
 * Unifie tous les patterns de cache et stockage de l'application
 */

import { utilityCache } from '../utils/networkStabilizer';

/**
 * Types de stratégies de cache disponibles
 */
export const CACHE_STRATEGIES = {
  MEMORY_ONLY: 'memory',
  SESSION_ONLY: 'session', 
  LOCAL_ONLY: 'local',
  MEMORY_SESSION: 'memory_session',
  MEMORY_LOCAL: 'memory_local',
  TTL: 'ttl'
};

/**
 * Durées de TTL prédéfinies
 */
export const TTL_PRESETS = {
  SHORT: 5 * 60 * 1000,        // 5 minutes
  MEDIUM: 30 * 60 * 1000,      // 30 minutes  
  LONG: 2 * 60 * 60 * 1000,    // 2 heures
  DAY: 24 * 60 * 60 * 1000,    // 24 heures
  WEEK: 7 * 24 * 60 * 60 * 1000 // 7 jours
};

/**
 * Service principal de persistance
 */
class PersistenceService {
  constructor() {
    this.memoryCache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      removes: 0
    };
  }

  /**
   * Récupère une valeur du cache selon la stratégie
   */
  get(key, strategy = CACHE_STRATEGIES.MEMORY_SESSION) {
    try {
      // Vérifier d'abord le cache mémoire
      if (this._hasMemoryLevel(strategy)) {
        const memoryValue = this.memoryCache.get(key);
        if (memoryValue && this._isValidTTL(memoryValue)) {
          this.stats.hits++;
          return memoryValue.data;
        }
      }

      // Vérifier le cache utilitaire (session/local)
      if (this._hasUtilityLevel(strategy)) {
        const utilityValue = utilityCache.get(key);
        if (utilityValue !== null) {
          this.stats.hits++;
          // Remettre en cache mémoire si applicable
          if (this._hasMemoryLevel(strategy)) {
            this._setMemory(key, utilityValue, TTL_PRESETS.MEDIUM);
          }
          return utilityValue;
        }
      }

      // Vérifier sessionStorage direct
      if (strategy === CACHE_STRATEGIES.SESSION_ONLY) {
        const sessionValue = this._getFromSession(key);
        if (sessionValue !== null) {
          this.stats.hits++;
          return sessionValue;
        }
      }

      // Vérifier localStorage direct
      if (strategy === CACHE_STRATEGIES.LOCAL_ONLY) {
        const localValue = this._getFromLocal(key);
        if (localValue !== null) {
          this.stats.hits++;
          return localValue;
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.warn('⚠️ Erreur récupération cache:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Stocke une valeur selon la stratégie
   */
  set(key, data, strategy = CACHE_STRATEGIES.MEMORY_SESSION, ttl = TTL_PRESETS.MEDIUM) {
    try {
      this.stats.sets++;

      // Cache mémoire
      if (this._hasMemoryLevel(strategy)) {
        this._setMemory(key, data, ttl);
      }

      // Cache utilitaire (session/local avec TTL)
      if (this._hasUtilityLevel(strategy)) {
        utilityCache.set(key, data, ttl);
      }

      // SessionStorage direct
      if (strategy === CACHE_STRATEGIES.SESSION_ONLY) {
        this._setToSession(key, data);
      }

      // LocalStorage direct
      if (strategy === CACHE_STRATEGIES.LOCAL_ONLY) {
        this._setToLocal(key, data);
      }

      return true;
    } catch (error) {
      console.warn('⚠️ Erreur stockage cache:', error);
      return false;
    }
  }

  /**
   * Supprime une valeur de tous les niveaux de cache
   */
  remove(key, strategy = CACHE_STRATEGIES.MEMORY_SESSION) {
    try {
      this.stats.removes++;

      // Supprimer du cache mémoire
      if (this._hasMemoryLevel(strategy)) {
        this.memoryCache.delete(key);
      }

      // Supprimer du cache utilitaire
      if (this._hasUtilityLevel(strategy)) {
        utilityCache.remove(key);
      }

      // Supprimer de sessionStorage
      if (strategy === CACHE_STRATEGIES.SESSION_ONLY || strategy === CACHE_STRATEGIES.MEMORY_SESSION) {
        sessionStorage.removeItem(key);
      }

      // Supprimer de localStorage
      if (strategy === CACHE_STRATEGIES.LOCAL_ONLY || strategy === CACHE_STRATEGIES.MEMORY_LOCAL) {
        localStorage.removeItem(key);
      }

      return true;
    } catch (error) {
      console.warn('⚠️ Erreur suppression cache:', error);
      return false;
    }
  }

  /**
   * Nettoie tous les caches expirés
   */
  cleanup() {
    let cleaned = 0;
    
    // Nettoyer le cache mémoire
    for (const [key, value] of this.memoryCache.entries()) {
      if (!this._isValidTTL(value)) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    console.log(`🧹 Cache nettoyé: ${cleaned} entrées supprimées`);
    return cleaned;
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    return {
      ...this.stats,
      memorySize: this.memoryCache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  /**
   * Remet à zéro les statistiques
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      removes: 0
    };
  }

  // Méthodes privées
  _hasMemoryLevel(strategy) {
    return [
      CACHE_STRATEGIES.MEMORY_ONLY,
      CACHE_STRATEGIES.MEMORY_SESSION,
      CACHE_STRATEGIES.MEMORY_LOCAL,
      CACHE_STRATEGIES.TTL
    ].includes(strategy);
  }

  _hasUtilityLevel(strategy) {
    return [
      CACHE_STRATEGIES.MEMORY_SESSION,
      CACHE_STRATEGIES.MEMORY_LOCAL,
      CACHE_STRATEGIES.TTL
    ].includes(strategy);
  }

  _setMemory(key, data, ttl) {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  _isValidTTL(cacheItem) {
    if (!cacheItem.ttl) return true;
    return Date.now() - cacheItem.timestamp < cacheItem.ttl;
  }

  _getFromSession(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  _setToSession(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Erreur sessionStorage:', error);
    }
  }

  _getFromLocal(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  _setToLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Erreur localStorage:', error);
    }
  }
}

// Instance singleton
const persistenceService = new PersistenceService();

// Auto-nettoyage toutes les 30 minutes
setInterval(() => {
  persistenceService.cleanup();
}, 30 * 60 * 1000);

// Nettoyage avant fermeture de page
window.addEventListener('beforeunload', () => {
  persistenceService.cleanup();
});

export default persistenceService;

/**
 * Hook React pour utiliser le service de persistance
 */
export function usePersistence(namespace = 'default') {
  const get = (key, strategy) => persistenceService.get(`${namespace}:${key}`, strategy);
  const set = (key, data, strategy, ttl) => persistenceService.set(`${namespace}:${key}`, data, strategy, ttl);
  const remove = (key, strategy) => persistenceService.remove(`${namespace}:${key}`, strategy);
  
  return {
    get,
    set,
    remove,
    getStats: () => persistenceService.getStats(),
    cleanup: () => persistenceService.cleanup()
  };
} 