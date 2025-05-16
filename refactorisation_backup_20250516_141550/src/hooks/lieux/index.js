/**
 * Point d'entrée pour les hooks relatifs aux lieux
 * Permet d'importer tous les hooks depuis un seul endroit
 * 
 * RECOMMANDATION: Pour les nouveaux développements, utilisez les hooks optimisés
 * marqués avec le suffixe "Optimized" (ex: useLieuFormOptimized).
 */

// ========== HOOKS OPTIMISÉS (RECOMMANDÉS) ==========
// Ces hooks suivent l'approche recommandée et utilisent directement les hooks génériques

/**
 * @recommended APPROCHE RECOMMANDÉE pour les formulaires de lieux
 * Hook optimisé utilisant directement useGenericEntityForm
 */
export { default as useLieuFormOptimized } from './useLieuFormOptimized';

/**
 * @recommended APPROCHE RECOMMANDÉE pour les détails de lieux
 * Hook optimisé utilisant directement useGenericEntityDetails
 */
export { default as useLieuDetailsOptimized } from './useLieuDetailsOptimized';

/**
 * @recommended APPROCHE RECOMMANDÉE pour les recherches de lieux
 * Hook optimisé utilisant directement useGenericEntitySearch
 */
export { default as useLieuSearchOptimized } from './useLieuSearchOptimized';

/**
 * @recommended APPROCHE RECOMMANDÉE pour les filtres de lieux
 * Hook optimisé utilisant directement useGenericEntityList
 */
export { default as useLieuxFiltersOptimized } from './useLieuxFiltersOptimized';

/**
 * @recommended APPROCHE RECOMMANDÉE pour la suppression de lieux
 * Hook optimisé utilisant directement useGenericEntityDelete
 */
export { default as useLieuDeleteOptimized } from './useLieuDeleteOptimized';

// ========== HOOKS DE COMPATIBILITÉ (DÉPRÉCIÉS) ==========
// Ces hooks sont maintenus pour la compatibilité mais seront supprimés en novembre 2025

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuFormOptimized à la place.
 */
export { default as useLieuForm } from './useLieuForm';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuFormOptimized à la place.
 */
export { default as useLieuFormV2 } from './useLieuFormMigrated';

/**
 * @deprecated Version intermédiaire pour la migration. Sera supprimée en novembre 2025.
 */
export { default as useLieuFormMigrated } from './useLieuFormMigrated';

export { default as useLieuFormComplete } from './useLieuFormComplete';

// ========== AUTRES HOOKS ==========

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuDetailsOptimized à la place.
 */
export { default as useLieuDetails } from './useLieuDetails';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuDetailsOptimized à la place.
 */
export { default as useLieuDetailsMigrated } from './useLieuDetailsMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuDetailsOptimized à la place.
 */
export { default as useLieuDetailsV2 } from './useLieuDetailsMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuDeleteOptimized à la place.
 */
export { default as useLieuDelete } from './useLieuDelete';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuDeleteOptimized à la place.
 */
export { default as useLieuDeleteMigrated } from './useLieuDeleteMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuDeleteOptimized à la place.
 */
export { default as useLieuDeleteV2 } from './useLieuDeleteMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuSearchOptimized à la place.
 */
export { default as useLieuSearch } from './useLieuSearch';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuSearchOptimized à la place.
 */
export { default as useLieuSearchMigrated } from './useLieuSearchMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuSearchOptimized à la place.
 */
export { default as useLieuSearchV2 } from './useLieuSearchMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuxFiltersOptimized à la place.
 */
export { default as useLieuxFilters } from './useLieuxFilters';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuxFiltersOptimized à la place.
 */
export { default as useLieuxFiltersMigrated } from './useLieuxFiltersMigrated';

/**
 * @deprecated Sera supprimé en novembre 2025. Utilisez useLieuxFiltersOptimized à la place.
 */
export { default as useLieuxFiltersV2 } from './useLieuxFiltersMigrated';

export { default as useLieuxQuery } from './useLieuxQuery';
export { default as useAddressSearch } from './useAddressSearch';
export { default as useProgrammateurSearch } from './useProgrammateurSearch';