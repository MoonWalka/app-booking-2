// src/services/loggerService.js

/**
 * Service de logging centralisé avec support pour les performances
 * Ce service permet d'unifier les logs d'application et de performance,
 * et de les désactiver automatiquement en production.
 */
class LoggerService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.perfMarks = new Map();
    this.listeners = [];
  }

  /**
   * Log standard (désactivé en production)
   */
  log(message, ...args) {
    if (!this.isProduction) {
      console.log(message, ...args);
    }
  }

  /**
   * Log d'erreur (toujours actif)
   */
  error(message, ...args) {
    console.error(message, ...args);
  }

  /**
   * Log d'avertissement (toujours actif)
   */
  warn(message, ...args) {
    console.warn(message, ...args);
  }

  /**
   * Log de performance avec émoji
   */
  performance(operationName, durationMs, details = {}) {
    if (!this.isProduction) {
      console.log(`🕒 ${operationName}: ${durationMs.toFixed(2)}ms`, details);
    }
    // Notifier tous les listeners (comme PerformanceMonitor)
    this.notifyListeners({
      type: 'performance',
      operationName,
      durationMs,
      timestamp: Date.now(),
      details
    });
  }

  /**
   * Log de début de chargement
   */
  startLoading(resource) {
    if (!this.isProduction) {
      console.log(`📥 Chargement de ${resource}...`);
    }
    this.notifyListeners({
      type: 'startLoading',
      resource,
      timestamp: Date.now()
    });
  }

  /**
   * Log de fin de chargement
   */
  endLoading(resource, durationMs) {
    if (!this.isProduction) {
      console.log(`✅ Chargement terminé en ${durationMs.toFixed(2)}ms pour ${resource}`);
    }
    this.notifyListeners({
      type: 'endLoading',
      resource,
      durationMs,
      timestamp: Date.now()
    });
  }

  /**
   * Ajoute un marqueur de performance
   */
  mark(name) {
    const now = performance.now();
    this.perfMarks.set(name, now);
    return now;
  }

  /**
   * Mesure le temps écoulé depuis un marqueur
   */
  measure(name, markName) {
    const start = this.perfMarks.get(markName);
    if (!start) {
      this.warn(`Marqueur de performance "${markName}" non trouvé`);
      return 0;
    }
    
    const duration = performance.now() - start;
    this.performance(name, duration);
    return duration;
  }

  /**
   * Enregistrer un listener pour les événements de log
   */
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifier tous les listeners d'un événement
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('Erreur dans un listener de logs:', e);
      }
    });
  }
}

// Exporter une instance singleton
const logger = new LoggerService();
export default logger;
