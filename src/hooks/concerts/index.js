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

/**
 * @recommended APPROCHE RECOMMANDÉE pour les détails de concerts
 * Hook optimisé utilisant directement useGenericEntityDetails 
 */
export { default as useConcertDetailsOptimized } from './useConcertDetailsOptimized';

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

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useConcertDetailsOptimized à la place.
 */
export { default as useConcertDetails } from './useConcertDetails';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useConcertDetailsOptimized à la place.
 */
export { default as useConcertDetailsMigrated } from './useConcertDetailsMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useConcertDetailsOptimized à la place.
 */
export { default as useConcertDetailsV2 } from './useConcertDetailsMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez la version optimisée correspondante.
 */
export { default as useConcertStatus } from './useConcertStatus';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez la version optimisée correspondante.
 */
export { default as useConcertStatusMigrated } from './useConcertStatusMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez la version optimisée correspondante.
 */
export { default as useConcertStatusV2 } from './useConcertStatusMigrated';

// Exports des autres hooks spécifiques aux concerts
export { default as useConcertListData } from './useConcertListData';
export { default as useConcertFilters } from './useConcertFilters';
export { default as useConcertActions } from './useConcertActions';
export { default as useConcerts } from './useConcerts';
export { default as useConcertAssociations } from './useConcertAssociations';
export { default as useEntitySearch } from './useEntitySearch';
export { default as useFormSubmission } from './useFormSubmission';
