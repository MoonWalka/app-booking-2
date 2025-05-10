/**
 * Point d'entrée pour les hooks relatifs aux concerts
 * Permet d'importer tous les hooks depuis un seul endroit
 * 
 * RECOMMANDATION: Pour les nouveaux développements, utilisez les hooks optimisés
 * marqués avec le suffixe "Optimized" (ex: useConcertFormOptimized).
 */

// ========== HOOKS OPTIMISÉS (RECOMMANDÉS) ==========
// Ces hooks suivent l'approche recommandée et utilisent directement les hooks génériques

/**
 * @recommended APPROCHE RECOMMANDÉE pour les formulaires de concerts
 * Hook optimisé utilisant directement useGenericEntityForm
 */
export { default as useConcertFormOptimized } from './useConcertFormOptimized';

// ========== HOOKS DE COMPATIBILITÉ (DÉPRÉCIÉS) ==========
// Ces hooks sont maintenus pour la compatibilité mais seront supprimés en novembre 2025

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useConcertFormOptimized à la place.
 */
export { default as useConcertForm } from './useConcertForm';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useConcertFormOptimized à la place.
 */
export { default as useConcertFormV2 } from './useConcertFormMigrated';

/**
 * @deprecated Version intermédiaire pour la migration. Sera supprimée en novembre 2025.
 */
export { default as useConcertFormMigrated } from './useConcertFormMigrated';

// ========== AUTRES HOOKS ==========

export { default as useConcertDetails } from './useConcertDetails';
export { default as useConcertDetailsMigrated } from './useConcertDetailsMigrated';
export { default as useConcertDetailsV2 } from './useConcertDetailsMigrated';

export { default as useConcertStatus } from './useConcertStatus';
export { default as useConcertStatusMigrated } from './useConcertStatusMigrated';
export { default as useConcertStatusV2 } from './useConcertStatusMigrated';

// Exports des autres hooks spécifiques aux concerts
export { default as useConcertListData } from './useConcertListData';
export { default as useConcertFilters } from './useConcertFilters';
export { default as useConcertActions } from './useConcertActions';
export { default as useConcerts } from './useConcerts';
export { default as useConcertAssociations } from './useConcertAssociations';
export { default as useEntitySearch } from './useEntitySearch';
export { default as useFormSubmission } from './useFormSubmission';
