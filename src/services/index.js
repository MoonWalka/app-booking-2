/**
 * Index centralisé pour les services
 * Facilite l'importation de tous les services dans les composants
 */

// Import des services
import FirestoreService from './FirestoreService';
import CacheService from './CacheService';
import EmailService from './emailService';

// Services Firebase optimisés
export { default as FirestoreService } from './FirestoreService';
export { default as CacheService } from './CacheService';
export { default as EmailService } from './emailService';

// Facilité pour l'importation en une ligne
export const Services = {
  FirestoreService,
  CacheService,
  EmailService
};

// Export par défaut avec tous les services
const services = {
  FirestoreService,
  CacheService,
  EmailService
};

export default services;