/**
 * Utilitaires de logging conditionnel pour les hooks
 * 
 * Ces fonctions permettent d'avoir des logs en développement mais pas en production,
 * sauf si explicitement activés via DEBUG_HOOKS=true dans l'environnement.
 */

/**
 * Détermine si les logs de débogage sont activés
 * - En développement : toujours activés
 * - En production : activés seulement si DEBUG_HOOKS=true
 */
const isDebugEnabled = () => {
  return process.env.NODE_ENV !== 'production' || process.env.DEBUG_HOOKS === 'true';
};

/**
 * Log conditionnel pour le débogage des hooks
 * 
 * @param {string} message - Message à logger
 * @param {Object} data - Données additionnelles à logger (optionnel)
 * @param {string} level - Niveau de log (debug, info, warn, error, success, trace)
 * @param {string} hookName - Nom du hook émettant le log (optionnel)
 */
export const debugLog = (message, data = null, level = 'debug', hookName = '') => {
  if (!isDebugEnabled()) return;

  // Assurer que level est une chaîne valide
  const safeLevel = (typeof level === 'string' ? level : 'debug').toLowerCase();
  const prefix = hookName ? `[${hookName}] ` : '';
  const formattedMessage = `${prefix}${message}`;
  
  switch (safeLevel) {
    case 'info':
      console.info(`[INFO] ${formattedMessage}`, data || '');
      break;
    case 'warn':
      console.warn(`[WARN] ${formattedMessage}`, data || '');
      break;
    case 'error':
      console.error(`[ERROR] ${formattedMessage}`, data || '');
      break;
    case 'success':
      console.log(`[SUCCESS] ${formattedMessage}`, data || '');
      break;
    case 'trace':
      console.trace(`[TRACE] ${formattedMessage}`, data || '');
      break;
    default:
      console.log(`[DEBUG] ${formattedMessage}`, data || '');
  }
};

/**
 * Variante pour les logs de performance
 * 
 * @param {string} message - Message décrivant l'opération mesurée
 * @param {string} hookName - Nom du hook émettant le log
 */
export const perfLog = (message, hookName = '') => {
  if (!isDebugEnabled()) return;
  
  const prefix = hookName ? `[${hookName}] ` : '';
  console.log(`[PERF] ${prefix}${message}`);
};

const logUtils = {
  debugLog,
  perfLog,
  isDebugEnabled
};

export default logUtils;