// diagnostic.js - Outil de diagnostic pour identifier les problèmes de performance
import logger from './src/services/loggerService';

/**
 * Cet outil analyse les logs de performance pour identifier les sources de lenteur
 * dans l'application. Il pourra être exécuté via une commande dans la console du navigateur.
 */
class PerformanceDiagnostic {
  constructor() {
    this.measures = [];
    this.slowThreshold = 200; // ms
    this.verySlowThreshold = 500; // ms
  }

  /**
   * Démarrer la session de diagnostic
   */
  start() {
    // Écouter les événements de performance
    this.removeListener = logger.addListener(this.handlePerformanceEvent.bind(this));
    
    // Installer les hooks de React DevTools
    this._installReactHooks();
    
    // Patcher les hooks React pour suivre les temps de rendu
    this._patchReactHooks();
    
    // Patcher la fonction route pour mesurer les changements de page
    this._patchRouting();
    
    console.log('📊 Diagnostic de performance démarré');
    
    return this;
  }

  /**
   * Arrêter la session de diagnostic et afficher les résultats
   */
  stop() {
    if (this.removeListener) {
      this.removeListener();
    }
    
    console.log('📊 Diagnostic de performance terminé');
    this.report();
    
    return this;
  }
  
  /**
   * Traiter un événement de performance
   */
  handlePerformanceEvent(event) {
    if (event.type === 'performance') {
      this.measures.push({
        type: 'operation',
        name: event.operationName,
        duration: event.durationMs,
        timestamp: event.timestamp,
        details: event.details || {}
      });
    }
  }
  
  /**
   * Installer des hooks pour React DevTools
   */
  _installReactHooks() {
    // Vérifier si les hooks React DevTools sont disponibles
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      
      // Hooked into React commits
      const originalOnCommitFiberRoot = hook.onCommitFiberRoot;
      hook.onCommitFiberRoot = (function(perfDiag, original) {
        return function(rendererID, root, ...args) {
          perfDiag.measures.push({
            type: 'react_commit',
            name: 'React Commit',
            timestamp: Date.now(),
          });
          return original.call(this, rendererID, root, ...args);
        };
      })(this, originalOnCommitFiberRoot);
    }
  }
  
  /**
   * Patcher les hooks React pour mesurer les temps
   */
  _patchReactHooks() {
    // Pas d'implémentation réelle ici car c'est difficile à faire correctement
    // sans risquer de casser l'application
  }
  
  /**
   * Patcher le routing pour mesurer les changements de page
   */
  _patchRouting() {
    // Patch history.pushState/replaceState
    const originalPushState = window.history.pushState;
    window.history.pushState = (function(perfDiag, original) {
      return function(state, title, url) {
        perfDiag.measures.push({
          type: 'navigation',
          name: 'Navigation',
          destination: url,
          timestamp: Date.now(),
        });
        return original.apply(this, arguments);
      };
    })(this, originalPushState);
  }
  
  /**
   * Générer un rapport de diagnostic
   */
  report() {
    // Filtre les mesures pour les trier par catégorie
    const operations = this.measures.filter(m => m.type === 'operation');
    const navigations = this.measures.filter(m => m.type === 'navigation');
    const reactEvents = this.measures.filter(m => m.type === 'react_commit');

    // Trouve les opérations lentes
    const slowOperations = operations.filter(op => op.duration > this.slowThreshold);
    
    console.group('📊 Rapport de diagnostic de performance');
    
    // Affiche un résumé
    console.log(`Total des opérations mesurées: ${operations.length}`);
    console.log(`Opérations lentes (>${this.slowThreshold}ms): ${slowOperations.length}`);
    console.log(`Navigations: ${navigations.length}`);
    console.log(`React commits: ${reactEvents.length}`);
    
    // Affiche les opérations les plus lentes
    if (slowOperations.length > 0) {
      console.group('🐢 Opérations les plus lentes:');
      slowOperations
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .forEach(op => {
          const color = op.duration > this.verySlowThreshold ? 'color: #ff0000' : 'color: #ff9900';
          console.log(
            `%c${op.name}: ${op.duration.toFixed(2)}ms`,
            color,
            op.details
          );
        });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return {
      operations,
      slowOperations,
      navigations,
      reactEvents
    };
  }
}

// Crée une instance globale pour l'accès via la console
window.performanceDiagnostic = new PerformanceDiagnostic();

// Instructions d'utilisation
console.log(`
📊 Pour utiliser l'outil de diagnostic de performance:
1. Démarrer: performanceDiagnostic.start()
2. Naviguer vers la page Concerts et interagir avec l'application
3. Arrêter et voir le rapport: performanceDiagnostic.stop()
`);

export default window.performanceDiagnostic;
