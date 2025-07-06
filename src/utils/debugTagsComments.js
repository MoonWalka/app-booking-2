/**
 * Utilitaires pour le debug des tags et commentaires
 */

/**
 * Active ou désactive le mode debug pour les tags
 */
export const DEBUG_TAGS = process.env.NODE_ENV === 'development' && false;

/**
 * Log un message de debug pour les tags
 * @param {string} context - Le contexte du log
 * @param {any} data - Les données à logger
 */
export function debugLog(context, data) {
  if (DEBUG_TAGS) {
    console.log(`[DEBUG-TAGS] ${context}:`, data);
  }
}

/**
 * Log une erreur pour les tags
 * @param {string} context - Le contexte de l'erreur
 * @param {Error} error - L'erreur
 */
export function debugError(context, error) {
  if (DEBUG_TAGS) {
    console.error(`[DEBUG-TAGS-ERROR] ${context}:`, error);
  }
}

/**
 * Analyse et log la structure des tags
 * @param {Array} tags - Les tags à analyser
 * @param {string} source - La source des tags
 */
export function analyzeTags(tags, source) {
  if (!DEBUG_TAGS) return;
  
  console.group(`[DEBUG-TAGS] Analyse des tags - ${source}`);
  console.log('Nombre de tags:', tags?.length || 0);
  console.log('Structure:', tags);
  
  if (Array.isArray(tags)) {
    tags.forEach((tag, index) => {
      console.log(`Tag ${index}:`, {
        type: typeof tag,
        value: tag,
        hasLabel: tag?.label !== undefined,
        hasValue: tag?.value !== undefined
      });
    });
  }
  
  console.groupEnd();
}

/**
 * Formate les tags pour l'affichage debug
 * @param {Array} tags - Les tags à formater
 * @returns {string} Les tags formatés
 */
export function formatTagsForDebug(tags) {
  if (!Array.isArray(tags)) return 'Pas de tags';
  
  return tags.map(tag => {
    if (typeof tag === 'string') return tag;
    if (tag?.label) return tag.label;
    if (tag?.value) return tag.value;
    return JSON.stringify(tag);
  }).join(', ');
}

/**
 * Export par défaut pour la compatibilité
 */
const debug = {
  DEBUG_TAGS,
  debugLog,
  debugError,
  analyzeTags,
  formatTagsForDebug
};

export default debug;