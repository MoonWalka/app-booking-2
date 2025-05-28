// Fichier de diagnostic pour les problèmes liés aux programmateurs
// src/utils/diagnostic/programmateurDiagnostic.js

/**
 * Utilitaire de diagnostic pour le suivi du cycle de vie des composants de programmateur
 */

// Compteurs pour suivre les instances de montage
const mountCounters = {
  components: {},
  hooks: {},
  effects: {}
};

// Horodatages pour mesurer les durées
const timestamps = {
  components: {},
  hooks: {},
  effects: {}
};

// Configuration du diagnostic
let isVerbose = false;
let isEnabled = true;

/**
 * Configure les options de diagnostic
 * @param {Object} options - Options de configuration
 * @param {boolean} options.verbose - Activer les logs détaillés
 * @param {boolean} options.enabled - Activer/désactiver complètement le diagnostic
 */
export const configureDiagnostic = (options = {}) => {
  if (options.hasOwnProperty('verbose')) {
    isVerbose = options.verbose;
  }
  if (options.hasOwnProperty('enabled')) {
    isEnabled = options.enabled;
  }
};

/**
 * Formatte un objet pour l'affichage dans la console
 * @param {*} obj - Objet à formatter
 * @returns {string} - Représentation formatée
 */
const formatObject = (obj) => {
  if (!obj) return 'undefined';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return obj.toString();
  
  try {
    // Essayer de JSON stringify avec limitation de profondeur
    const cache = new Set();
    const formattedStr = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
        
        // Limiter la profondeur pour les grands objets
        if (cache.size > 30) {
          return '[Object]';
        }
      }
      return value;
    }, 2);
    
    if (formattedStr && formattedStr.length > 500) {
      return formattedStr.substring(0, 200) + '... (tronqué)';
    }
    return formattedStr;
  } catch (err) {
    return `[Objet non sérialisable: ${err.message}]`;
  }
};

/**
 * Fonction de log avec niveau et formatage
 */
const log = (level, ...args) => {
  if (!isEnabled) return;
  
  // Ne pas logger en niveau detail si pas en mode verbose
  if (level === 'detail' && !isVerbose) return;
  
  const timestamp = new Date().toISOString().substring(11, 23);
  let prefix = '';
  
  switch(level) {
    case 'error':
      prefix = `%c[${timestamp}] 🔴 ERROR`;
      console.error(prefix, 'color: red; font-weight: bold;', ...args);
      break;
    case 'warn':
      prefix = `%c[${timestamp}] 🟠 WARNING`;
      console.warn(prefix, 'color: orange; font-weight: bold;', ...args);
      break;
    case 'info':
      prefix = `%c[${timestamp}] 🔵 INFO`;
      console.log(prefix, 'color: blue;', ...args);
      break;
    case 'success':
      prefix = `%c[${timestamp}] 🟢 SUCCESS`;
      console.log(prefix, 'color: green;', ...args);
      break;
    case 'detail':
      prefix = `%c[${timestamp}] 🔍 DETAIL`;
      console.log(prefix, 'color: gray;', ...args);
      break;
    default:
      prefix = `%c[${timestamp}] DIAGNOSTIC`;
      console.log(prefix, 'color: purple;', ...args);
  }
};

/**
 * Trace le montage d'un composant
 * @param {string} componentName - Nom du composant
 * @param {string} id - ID de l'entité (ex: programmateur)
 * @param {Object} props - Props du composant
 */
export const traceComponentMount = (componentName, id, props = {}) => {
  if (!isEnabled) return;
  
  if (!mountCounters.components[componentName]) {
    mountCounters.components[componentName] = 0;
  }
  
  mountCounters.components[componentName]++;
  const mountCount = mountCounters.components[componentName];
  const now = performance.now();
  
  // Enregistrer l'horodatage pour ce composant
  if (!timestamps.components[componentName]) {
    timestamps.components[componentName] = {};
  }
  
  const key = `${componentName}-${id}-${mountCount}`;
  timestamps.components[componentName][key] = now;
  
  log('info', `🟢 MONTAGE #${mountCount} - Composant ${componentName} avec ID ${id || 'N/A'}`);
  
  if (isVerbose) {
    log('detail', `Props pour ${componentName}:`, formatObject(props));
  }
  
  return () => {
    const unmountTime = performance.now();
    const mountTime = timestamps.components[componentName][key];
    const duration = mountTime ? (unmountTime - mountTime).toFixed(2) : '?';
    
    log('info', `🔴 DÉMONTAGE #${mountCount} - Composant ${componentName} avec ID ${id || 'N/A'} - Durée de vie: ${duration}ms`);
    
    // Détecter les démontages très rapides (potentiellement problématiques)
    if (mountTime && (unmountTime - mountTime) < 50) {
      log('warn', `⚠️ CYCLE RAPIDE DÉTECTÉ pour ${componentName} avec ID ${id} - Durée: ${duration}ms`);
    }
  };
};

/**
 * Trace l'initialisation d'un hook
 * @param {string} hookName - Nom du hook
 * @param {string} id - ID de l'entité
 * @param {Object} params - Paramètres du hook
 */
export const traceHookInit = (hookName, id, params = {}) => {
  if (!isEnabled) return;
  
  if (!mountCounters.hooks[hookName]) {
    mountCounters.hooks[hookName] = 0;
  }
  
  mountCounters.hooks[hookName]++;
  const initCount = mountCounters.hooks[hookName];
  const now = performance.now();
  
  // Enregistrer l'horodatage pour ce hook
  if (!timestamps.hooks[hookName]) {
    timestamps.hooks[hookName] = {};
  }
  
  const key = `${hookName}-${id}-${initCount}`;
  timestamps.hooks[hookName][key] = now;
  
  log('info', `🔄 INIT #${initCount} - Hook ${hookName} avec ID ${id || 'N/A'}`);
  
  if (isVerbose) {
    log('detail', `Paramètres pour ${hookName}:`, formatObject(params));
  }
  
  return {
    traceHookCleanup: () => {
      const cleanupTime = performance.now();
      const initTime = timestamps.hooks[hookName][key];
      const duration = initTime ? (cleanupTime - initTime).toFixed(2) : '?';
      
      log('info', `🧹 NETTOYAGE #${initCount} - Hook ${hookName} avec ID ${id || 'N/A'} - Durée: ${duration}ms`);
    },
    
    traceHookSuccess: (result) => {
      const successTime = performance.now();
      const initTime = timestamps.hooks[hookName][key];
      const duration = initTime ? (successTime - initTime).toFixed(2) : '?';
      
      log('success', `✅ SUCCÈS #${initCount} - Hook ${hookName} avec ID ${id || 'N/A'} - Durée: ${duration}ms`);
      
      if (isVerbose) {
        log('detail', `Résultat pour ${hookName}:`, formatObject(result));
      }
    },
    
    traceHookError: (error) => {
      const errorTime = performance.now();
      const initTime = timestamps.hooks[hookName][key];
      const duration = initTime ? (errorTime - initTime).toFixed(2) : '?';
      
      log('error', `❌ ERREUR #${initCount} - Hook ${hookName} avec ID ${id || 'N/A'} - Durée: ${duration}ms`);
      log('error', `Message d'erreur:`, error.message);
      
      if (isVerbose) {
        log('detail', `Trace de l'erreur:`, error.stack);
      }
    }
  };
};

/**
 * Trace l'exécution d'un effet
 * @param {string} effectName - Nom de l'effet (useEffect)
 * @param {string} id - ID de l'entité
 * @param {Array} dependencies - Dépendances de l'effet
 */
export const traceEffect = (effectName, id, dependencies = []) => {
  if (!isEnabled) return;
  
  if (!mountCounters.effects[effectName]) {
    mountCounters.effects[effectName] = 0;
  }
  
  mountCounters.effects[effectName]++;
  const effectCount = mountCounters.effects[effectName];
  const now = performance.now();
  
  // Enregistrer l'horodatage pour cet effet
  if (!timestamps.effects[effectName]) {
    timestamps.effects[effectName] = {};
  }
  
  const key = `${effectName}-${id}-${effectCount}`;
  timestamps.effects[effectName][key] = now;
  
  log('info', `⚡ EFFET #${effectCount} - ${effectName} avec ID ${id || 'N/A'}`);
  
  if (isVerbose) {
    log('detail', `Dépendances pour ${effectName}:`, formatObject(dependencies));
  }
  
  return () => {
    const cleanupTime = performance.now();
    const effectTime = timestamps.effects[effectName][key];
    const duration = effectTime ? (cleanupTime - effectTime).toFixed(2) : '?';
    
    log('info', `🧹 NETTOYAGE EFFET #${effectCount} - ${effectName} avec ID ${id || 'N/A'} - Durée: ${duration}ms`);
  };
};

/**
 * Trace une requête Firebase
 * @param {string} operation - Type d'opération
 * @param {string} collection - Collection Firebase
 * @param {string} id - ID du document
 */
export const traceFirebaseOperation = (operation, collection, id) => {
  if (!isEnabled) return;
  
  const start = performance.now();
  log('info', `🔥 FIREBASE ${operation} - Collection: ${collection}, ID: ${id || 'N/A'} - DÉBUT`);
  
  return {
    success: (result) => {
      const end = performance.now();
      const duration = (end - start).toFixed(2);
      log('success', `✅ FIREBASE ${operation} - Collection: ${collection}, ID: ${id || 'N/A'} - SUCCÈS - Durée: ${duration}ms`);
      
      if (isVerbose) {
        log('detail', `Résultat:`, formatObject(result));
      }
    },
    
    error: (error) => {
      const end = performance.now();
      const duration = (end - start).toFixed(2);
      log('error', `❌ FIREBASE ${operation} - Collection: ${collection}, ID: ${id || 'N/A'} - ERREUR - Durée: ${duration}ms`);
      log('error', `Message d'erreur:`, error.message);
      
      if (isVerbose) {
        log('detail', `Trace de l'erreur:`, error.stack);
      }
    }
  };
};

/**
 * Trace l'état d'une requête async
 * @param {string} name - Nom de la requête
 * @param {string} stage - Étape (start, success, error)
 * @param {Object} details - Détails supplémentaires
 */
export const traceAsyncRequest = (name, stage, details = {}) => {
  if (!isEnabled) return;
  
  switch (stage) {
    case 'start':
      log('info', `🔄 REQUÊTE ${name} - DÉBUT`, formatObject(details));
      break;
    case 'success':
      log('success', `✅ REQUÊTE ${name} - SUCCÈS`, formatObject(details));
      break;
    case 'error':
      log('error', `❌ REQUÊTE ${name} - ERREUR`, formatObject(details));
      break;
    default:
      log('info', `REQUÊTE ${name} - ${stage}`, formatObject(details));
  }
};

/**
 * Trace un rendu de composant
 * @param {string} componentName - Nom du composant
 * @param {string} id - ID de l'entité
 * @param {string} reason - Raison du rendu
 */
export const traceRender = (componentName, id, reason = 'unknown') => {
  if (!isEnabled) return;
  
  log('info', `🔄 RENDU - Composant ${componentName} avec ID ${id || 'N/A'} - Raison: ${reason}`);
};

// Exporter un objet de trace configuré pour les programmateurs
export const ProgrammateurTrace = {
  component: (name, id, props) => traceComponentMount(`Programmateur${name}`, id, props),
  hook: (name, id, params) => traceHookInit(`useProgrammateur${name}`, id, params),
  effect: (name, id, deps) => traceEffect(`useProgrammateurEffect${name}`, id, deps),
  firebase: (operation, id) => traceFirebaseOperation(operation, 'programmateurs', id),
  request: (name, stage, details) => traceAsyncRequest(`Programmateur${name}`, stage, details),
  render: (name, id, reason) => traceRender(`Programmateur${name}`, id, reason)
};

// Activer le diagnostic par défaut
configureDiagnostic({ verbose: false, enabled: true });

const programmateurDiagnostic = {
  configureDiagnostic,
  traceComponentMount,
  traceHookInit,
  traceEffect,
  traceFirebaseOperation,
  traceAsyncRequest,
  traceRender,
  ProgrammateurTrace
};

export default programmateurDiagnostic;