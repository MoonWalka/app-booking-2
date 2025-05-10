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

export { default as useLieuDetails } from './useLieuDetails';
export { default as useLieuDetailsMigrated } from './useLieuDetailsMigrated';
export { default as useLieuDetailsV2 } from './useLieuDetailsMigrated';

export { default as useLieuDelete } from './useLieuDelete';
export { default as useLieuDeleteMigrated } from './useLieuDeleteMigrated';
export { default as useLieuDeleteV2 } from './useLieuDeleteMigrated';

export { default as useLieuSearch } from './useLieuSearch';
export { default as useLieuSearchMigrated } from './useLieuSearchMigrated';
export { default as useLieuSearchV2 } from './useLieuSearchMigrated';

export { default as useLieuxFilters } from './useLieuxFilters';
export { default as useLieuxFiltersMigrated } from './useLieuxFiltersMigrated';
export { default as useLieuxFiltersV2 } from './useLieuxFiltersMigrated';

export { default as useLieuxQuery } from './useLieuxQuery';
export { default as useAddressSearch } from './useAddressSearch';
export { default as useProgrammateurSearch } from './useProgrammateurSearch';