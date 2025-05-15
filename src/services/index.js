/**
 * Index centralisé pour les services
 * Facilite l'importation de tous les services dans les composants
 */

// Services Firebase optimisés
export { default as FirestoreService } from './FirestoreService';
export { default as CacheService } from './CacheService';

// Export pour usage dans les tests et les fonctions qui ont besoin d'accès direct
import FirestoreService from './FirestoreService';
import CacheService from './CacheService';

// Facilité pour l'importation en une ligne
export const Services = {
  FirestoreService,
  CacheService
};

// Export par défaut avec tous les services
export default {
  FirestoreService,
  CacheService
};