// filepath: /Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/utils/test-helpers.js

/**
 * Utilitaires pour les tests des hooks et composants React
 */

import { act } from '@testing-library/react-hooks';

/**
 * Fonction utilitaire pour remplacer waitForNextUpdate qui est déprécié
 * dans les versions récentes de @testing-library/react-hooks
 * 
 * @param {Object} options - Options pour configurer le comportement d'attente
 * @param {number} options.timeout - Délai maximum d'attente en millisecondes (défaut: 1000ms)
 * @param {number} options.interval - Intervalle de vérification en millisecondes (défaut: 50ms)
 * @returns {Promise<void>} Promise qui se résout quand le hook est mis à jour
 */
export const waitForHookToUpdate = async (options = {}) => {
  const { timeout = 1000, interval = 50 } = options;
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    // Résoudre immédiatement pour le premier cycle de render
    setTimeout(() => {
      act(() => {
        // Exécuter un acte vide pour forcer une mise à jour
      });
      resolve();
    }, 0);
    
    // Timeout de sécurité
    setTimeout(() => {
      reject(new Error(`waitForHookToUpdate a expiré après ${timeout}ms`));
    }, timeout);
  });
};

/**
 * Wrapper autour du hook useGenericEntityDetails pour faciliter les tests
 * @param {Object} result - L'objet result retourné par renderHook
 * @param {Function} callback - Fonction callback qui sera exécutée après l'attente
 */
export const waitAndUpdateHook = async (result, callback) => {
  // Attendre que toutes les promesses soient résolues
  await waitForHookToUpdate();
  
  // Si un callback est fourni, exécuter le callback
  if (callback && typeof callback === 'function') {
    callback(result);
  }
  
  return result;
};

/**
 * Wrapper autour du hook useGenericEntityDetails pour faciliter les tests
 */
export const createMockFormatValue = () => {
  return (field, value) => {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    return String(value);
  };
};

/**
 * Fonction utilitaire pour nettoyer proprement les effets de bord après les tests
 * Utile pour éviter les fuites de timers et d'abonnements
 */
export const cleanupAfterTests = () => {
  // Nettoyer les timers
  jest.clearAllTimers();
  
  // Restaurer tous les mocks
  jest.restoreAllMocks();
  
  // Vider toutes les files d'attente de microtâches
  return new Promise(resolve => setImmediate(resolve));
};

/**
 * Utilitaire pour contourner les problèmes d'attente asynchrone dans les tests
 * en exécutant toutes les microtâches en attente
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/**
 * Fonction utilitaire pour simuler un délai dans les tests
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper pour act() qui prend en charge les opérations asynchrones
 * @param {Function} callback - Fonction à exécuter dans act
 * @returns {Promise<any>} - Résultat de la fonction
 */
export const actAsync = async (callback) => {
  let result;
  await act(async () => {
    result = await callback();
  });
  return result;
};