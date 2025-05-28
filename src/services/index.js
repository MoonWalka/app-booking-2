/**
 * Index centralisé pour les services
 * Facilite l'importation de tous les services dans les composants
 */

// Import des services
import FirestoreService from './FirestoreService';
import CacheService from './CacheService';

// Services Firebase optimisés
export { default as FirestoreService } from './FirestoreService';
export { default as CacheService } from './CacheService';

// Facilité pour l'importation en une ligne
export const Services = {
  FirestoreService,
  CacheService
};

// Export par défaut avec tous les services
const services = {
  FirestoreService,
  CacheService
};

export default services;