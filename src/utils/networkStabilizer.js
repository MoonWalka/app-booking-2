// src/utils/networkStabilizer.js
/**
 * Utilitaire pour stabiliser la connexion réseau et empêcher les rechargements intempestifs
 */

// 🚀 NOUVEAU : Service de cache pour les utilitaires
class UtilityCache {
  constructor() {
    this.cache = new Map();
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Vérifier TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key, data, ttl = 30 * 60 * 1000) { // 30 minutes par défaut
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  remove(key) {
    this.cache.delete(key);
  }
  
  // Persistance en sessionStorage pour survie aux rechargements
  persist() {
    const data = {};
    this.cache.forEach((value, key) => {
      data[key] = value;
    });
    try {
      sessionStorage.setItem('utilityCache', JSON.stringify(data));
    } catch (e) {
      console.warn('⚠️ Erreur persistance cache utilitaire:', e);
    }
  }
  
  restore() {
    try {
      const stored = sessionStorage.getItem('utilityCache');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }
    } catch (e) {
      console.warn('⚠️ Erreur restauration cache utilitaire:', e);
    }
  }
}

// Instance globale du cache utilitaire
const utilityCache = new UtilityCache();

// Nombre maximum de tentatives de rechargement autorisées
const MAX_RELOAD_ATTEMPTS = 2;
// Intervalle minimum entre deux rechargements (en millisecondes)
const MIN_RELOAD_INTERVAL = 30000; // 30 secondes

// 🎯 SIMPLIFICATION : Utilisation du cache unifié
const getNetworkState = () => {
  return utilityCache.get('networkState') || {
    reloadAttempts: 0,
    lastReloadTime: 0
  };
};

const setNetworkState = (state) => {
  utilityCache.set('networkState', state, 60 * 60 * 1000); // 1 heure
};

// Vérifie si un rechargement est autorisé
const canReload = () => {
  const { reloadAttempts, lastReloadTime } = getNetworkState();
  const now = Date.now();
  
  // Si trop de tentatives ont été effectuées
  if (reloadAttempts >= MAX_RELOAD_ATTEMPTS) {
    console.log('🚫 Trop de tentatives de rechargement. Opération bloquée.');
    return false;
  }
  
  // Si un rechargement a été effectué récemment
  if (now - lastReloadTime < MIN_RELOAD_INTERVAL) {
    console.log('⏰ Dernier rechargement trop récent. Opération bloquée.');
    return false;
  }
  
  return true;
};

// Fonction pour effectuer un rechargement contrôlé
const safeReload = () => {
  if (!canReload()) return false;
  
  const state = getNetworkState();
  const newState = {
    reloadAttempts: state.reloadAttempts + 1,
    lastReloadTime: Date.now()
  };
  
  setNetworkState(newState);
  console.log(`🔄 Rechargement contrôlé (${newState.reloadAttempts}/${MAX_RELOAD_ATTEMPTS})`);
  
  // Persister avant rechargement
  utilityCache.persist();
  
  // Effectuer le rechargement
  window.location.reload();
  return true;
};

// Gestionnaire d'erreurs réseau
const handleNetworkError = (error) => {
  // Ignore chunk loading errors (lazy-loaded bundles)
  if (error && error.name === 'ChunkLoadError') {
    console.warn('⚠️ ChunkLoadError intercepté, pas de rechargement');
    return false;
  }
  console.error('❌ Erreur réseau détectée:', error);
  
  // Analyse l'erreur pour déterminer si elle est liée au réseau
  const isNetworkError = error && (
    error.message?.includes('network') || 
    error.message?.includes('connection') ||
    error.message?.includes('connexion') ||
    error.code === 'unavailable'
  );
  
  // Si c'est une erreur réseau, tenter un rechargement contrôlé
  if (isNetworkError) {
    return safeReload();
  }
  
  return false;
};

// Intercepte les erreurs non gérées au niveau global
const setupGlobalErrorHandler = () => {
  // Intercepte les erreurs non gérées
  window.addEventListener('error', (event) => {
    // Ignore les erreurs provenant des extensions ou des scripts externes
    if (event.filename && !event.filename.includes(window.location.origin)) {
      return;
    }
    
    // Traiter l'erreur
    handleNetworkError(event.error || new Error(event.message));
  });
  
  // Intercepte les rejets de promesses non gérés
  window.addEventListener('unhandledrejection', (event) => {
    handleNetworkError(event.reason);
  });
  
  // Intercepte les événements de perte de connexion
  window.addEventListener('offline', () => {
    console.log('📡 La connexion réseau a été perdue.');
    // Pas de rechargement automatique quand on perd la connexion
  });
  
  // Intercepte les événements de récupération de connexion
  window.addEventListener('online', () => {
    console.log('🌐 La connexion réseau a été rétablie.');
    // Attendre un peu avant de recharger pour laisser les connexions se stabiliser
    setTimeout(() => safeReload(), 5000);
  });
};

// 🎯 SIMPLIFICATION : Fonction d'initialisation unifiée
const initNetworkStabilizer = () => {
  // Restaurer le cache depuis sessionStorage
  utilityCache.restore();
  
  // Enregistre les handlers d'erreurs
  setupGlobalErrorHandler();
  
  // 🚀 NOUVEAU : Persistance automatique avant fermeture
  window.addEventListener('beforeunload', () => {
    utilityCache.persist();
  });
  
  console.log('🛡️ Stabilisateur de réseau initialisé avec cache unifié');
};

export { initNetworkStabilizer, handleNetworkError, safeReload, utilityCache };