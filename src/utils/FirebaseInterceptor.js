/**
 * Intercepteur Firebase pour le debug et le monitoring
 */

class FirebaseInterceptor {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development' && false;
    this.logs = [];
    this.maxLogs = 100;
  }

  /**
   * Active ou désactive l'intercepteur
   * @param {boolean} enabled 
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      console.log('[FirebaseInterceptor] Activé');
    } else {
      console.log('[FirebaseInterceptor] Désactivé');
    }
  }

  /**
   * Log une opération Firebase
   * @param {string} operation - Le type d'opération (get, set, update, delete)
   * @param {string} collection - La collection concernée
   * @param {string} docId - L'ID du document (optionnel)
   * @param {any} data - Les données (optionnel)
   */
  log(operation, collection, docId = null, data = null) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      operation,
      collection,
      docId,
      data: data ? JSON.stringify(data).substring(0, 200) : null,
      stack: new Error().stack
    };

    this.logs.push(logEntry);

    // Garder seulement les derniers logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.log(`[Firebase] ${operation} ${collection}${docId ? '/' + docId : ''}`, data);
  }

  /**
   * Log une requête
   * @param {string} collection - La collection
   * @param {Array} constraints - Les contraintes de la requête
   */
  logQuery(collection, constraints = []) {
    if (!this.enabled) return;

    console.log(`[Firebase Query] ${collection}`, constraints);
  }

  /**
   * Log une erreur
   * @param {string} operation - L'opération qui a échoué
   * @param {Error} error - L'erreur
   */
  logError(operation, error) {
    if (!this.enabled) return;

    console.error(`[Firebase Error] ${operation}:`, error);
  }

  /**
   * Obtenir les logs
   * @returns {Array} Les logs
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Effacer les logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Exporter les logs
   * @returns {string} Les logs en JSON
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instance singleton
const firebaseInterceptor = new FirebaseInterceptor();

/**
 * Initialise l'intercepteur Firebase
 * @param {boolean} enabled - Activer ou désactiver
 */
export function initializeFirebaseInterceptor(enabled = false) {
  firebaseInterceptor.setEnabled(enabled);
  
  if (enabled) {
    console.log('[FirebaseInterceptor] Initialisé et activé');
    
    // Hook sur les méthodes Firebase si nécessaire
    // (À implémenter selon les besoins)
  }
}

export default firebaseInterceptor;