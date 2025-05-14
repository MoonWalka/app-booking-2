// src/hooks/programmateurs/index.js
// Re-export hooks specific to programmateurs
export { default as useAddressSearch } from './useAddressSearch';
export { default as useProgrammateurDetails } from './useProgrammateurDetails';
export { default as useProgrammateurSearch } from './useProgrammateurSearch';

// Exporter les hooks migrés avec un nom explicite (pour la transition progressive)

/**
 * @recommended La version migrée du hook useProgrammateurDetails basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */

// Exporter le hook de recherche migré
export { default as useProgrammateurSearchMigrated } from './useProgrammateurSearchMigrated';

/**
 * @recommended La version migrée du hook useProgrammateurSearch basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as useProgrammateurSearchV2 } from './useProgrammateurSearchMigrated';

// Exports des hooks de formulaire
export { default as useProgrammateurForm } from './useProgrammateurForm';

/**
 * @recommended APPROCHE RECOMMANDÉE - Versions optimisées des hooks pour les programmateurs
 * utilisant directement les hooks génériques.
 * Ces versions sont conformes au plan de dépréciation qui prévoit la suppression 
 * des hooks spécifiques d'ici novembre 2025.
 */
export { default as useProgrammateurFormOptimized } from './useProgrammateurFormOptimized';
export { default as useProgrammateurDetailsOptimized } from './useProgrammateurDetailsOptimized';
export { default as useProgrammateurSearchOptimized } from './useProgrammateurSearchOptimized';
export { default as useDeleteProgrammateurOptimized } from './useDeleteProgrammateurOptimized';

// Add alias for migrated details hook
export { default as useProgrammateurDetailsMigrated } from './useProgrammateurDetailsMigrated';

// Exports des autres hooks spécifiques aux programmateurs
export { default as useAdresseValidation } from './useAdresseValidation';
export { default as useLieuSearch } from './useLieuSearch';
export { default as useCompanySearch } from './useCompanySearch';
export { default as useConcertSearch } from './useConcertSearch';
export { default as useFormSubmission } from './useFormSubmission';
export { default as useDeleteProgrammateur } from './useDeleteProgrammateur';