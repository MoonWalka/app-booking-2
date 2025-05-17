/**
 * Factory pour la gestion des services Firebase et leurs mocks
 * Centralise la logique de sélection du mode (local vs production)
 * Élimine les dépendances circulaires entre firebaseInit.js et mockStorage.js
 */

// Détecter le mode d'exécution
const MODE = process.env.REACT_APP_MODE || 'production';
const IS_LOCAL_MODE = MODE === 'local';

/**
 * Détermine si l'application doit utiliser le mode local ou non
 * @returns {boolean} - true si l'application est en mode local
 */
export const isLocalMode = () => {
  return IS_LOCAL_MODE;
};

/**
 * Retourne le mode actuel de l'application (local ou production)
 * @returns {string} - le mode actuel
 */
export const getCurrentMode = () => {
  return MODE;
};

/**
 * Fonction factory pour obtenir les implémentations appropriées des services
 * @param {Object} realImplementation - L'implémentation réelle de Firebase
 * @param {Object} mockImplementation - L'implémentation simulée pour le mode local
 * @returns {Object} - L'implémentation à utiliser en fonction du mode
 */
export const getImplementation = (realImplementation, mockImplementation) => {
  if (IS_LOCAL_MODE) {
    console.log(`[Firebase Factory] Mode local activé - Utilisation de l'implémentation mock pour ${Object.keys(mockImplementation).join(', ')}`);
    return mockImplementation;
  }
  return realImplementation;
};