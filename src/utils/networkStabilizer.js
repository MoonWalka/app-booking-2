// src/utils/networkStabilizer.js
/**
 * Utilitaire pour stabiliser la connexion réseau et empêcher les rechargements intempestifs
 */

// Nombre maximum de tentatives de rechargement autorisées
const MAX_RELOAD_ATTEMPTS = 2;
// Intervalle minimum entre deux rechargements (en millisecondes)
const MIN_RELOAD_INTERVAL = 30000; // 30 secondes

// Variables pour suivre les rechargements
let reloadAttempts = 0;
let lastReloadTime = 0;

// Vérifie si un rechargement est autorisé
const canReload = () => {
  const now = Date.now();
  
  // Si trop de tentatives ont été effectuées
  if (reloadAttempts >= MAX_RELOAD_ATTEMPTS) {
    console.log('Trop de tentatives de rechargement. Opération bloquée.');
    return false;
  }
  
  // Si un rechargement a été effectué récemment
  if (now - lastReloadTime < MIN_RELOAD_INTERVAL) {
    console.log('Dernier rechargement trop récent. Opération bloquée.');
    return false;
  }
  
  return true;
};

// Fonction pour effectuer un rechargement contrôlé
const safeReload = () => {
  if (!canReload()) return false;
  
  reloadAttempts++;
  lastReloadTime = Date.now();
  console.log(`Rechargement contrôlé (${reloadAttempts}/${MAX_RELOAD_ATTEMPTS})`);
  
  // Effectuer le rechargement
  window.location.reload();
  return true;
};

// Gestionnaire d'erreurs réseau
const handleNetworkError = (error) => {
  // Ignore chunk loading errors (lazy-loaded bundles)
  if (error && error.name === 'ChunkLoadError') {
    console.warn('ChunkLoadError intercepté, pas de rechargement');
    return false;
  }
  console.error('Erreur réseau détectée:', error);
  
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
    console.log('La connexion réseau a été perdue.');
    // Pas de rechargement automatique quand on perd la connexion
  });
  
  // Intercepte les événements de récupération de connexion
  window.addEventListener('online', () => {
    console.log('La connexion réseau a été rétablie.');
    // Attendre un peu avant de recharger pour laisser les connexions se stabiliser
    setTimeout(() => safeReload(), 5000);
  });
};

// Fonction d'initialisation
const initNetworkStabilizer = () => {
  // Récupère les données stockées s'il y en a
  const storedData = sessionStorage.getItem('networkStabilizer');
  if (storedData) {
    try {
      const data = JSON.parse(storedData);
      reloadAttempts = data.reloadAttempts || 0;
      lastReloadTime = data.lastReloadTime || 0;
    } catch (e) {
      console.error('Erreur lors de la lecture des données de session:', e);
    }
  }
  
  // Enregistre les handlers d'erreurs
  setupGlobalErrorHandler();
  
  // Sauvegarde les données avant que la page ne soit fermée
  window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('networkStabilizer', JSON.stringify({
      reloadAttempts,
      lastReloadTime
    }));
  });
  
  console.log('Stabilisateur de réseau initialisé');
};

export { initNetworkStabilizer, handleNetworkError, safeReload };