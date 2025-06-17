/**
 * Configuration centralisée des relances automatiques
 * Permet de contrôler le comportement des relances pour éviter les boucles
 */

export const RELANCES_CONFIG = {
  // Activer/désactiver les relances automatiques globalement
  enabled: true,
  
  // Activer/désactiver le watcher (surveillance des changements)
  // IMPORTANT: Désactiver pour éviter le double déclenchement
  watcherEnabled: false,
  
  // Délai minimum entre deux évaluations pour le même concert (en ms)
  evaluationCooldown: 10000, // 10 secondes (réduit pour meilleure réactivité)
  
  // Délai après création/modification avant d'évaluer les relances (en ms)
  evaluationDelay: 5000, // 5 secondes
  
  // Maximum de relances automatiques par concert
  maxRelancesPerConcert: 10,
  
  // Types de mises à jour qui ne déclenchent PAS de réévaluation
  ignoredUpdateTypes: [
    'relance_auto_added',
    'relance_cleanup',
    'relance_evaluated',
    'auto_update'
  ],
  
  // Activer les logs détaillés pour le débogage
  debugMode: process.env.NODE_ENV === 'development',
  
  // Stratégie de déclenchement
  triggerStrategy: 'form-only' // 'form-only', 'watcher-only', 'both'
};

/**
 * Vérifie si les relances automatiques sont activées
 */
export function areRelancesEnabled() {
  // Vérifier aussi le localStorage pour une désactivation temporaire
  const tempDisabled = localStorage.getItem('relances_auto_disabled');
  if (tempDisabled === 'true') {
    return false;
  }
  
  return RELANCES_CONFIG.enabled;
}

/**
 * Vérifie si le watcher est activé
 */
export function isWatcherEnabled() {
  return RELANCES_CONFIG.enabled && RELANCES_CONFIG.watcherEnabled;
}

/**
 * Vérifie si on doit ignorer une mise à jour
 */
export function shouldIgnoreUpdate(updateType) {
  return RELANCES_CONFIG.ignoredUpdateTypes.includes(updateType);
}

/**
 * Log de debug conditionnel
 */
export function debugLog(message, data = null) {
  if (RELANCES_CONFIG.debugMode) {
    console.log(`[Relances Auto] ${message}`, data || '');
  }
}