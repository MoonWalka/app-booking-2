/**
 * Point d'entrée pour les hooks relatifs aux lieux
 * Permet d'importer tous les hooks depuis un seul endroit
 * Exemple: import { useLieuDetailsV2, useLieuSearch } from '@/hooks/lieux';
 */

export { default as useLieuDetails } from './useLieuDetails';

// Export de la version migrée avec son nom original
export { default as useLieuDetailsMigrated } from './useLieuDetailsMigrated';

/**
 * @recommended La version migrée du hook useLieuDetails basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as useLieuDetailsV2 } from './useLieuDetailsMigrated';

export { default as useLieuDelete } from './useLieuDelete';
export { default as useLieuForm } from './useLieuForm';
export { default as useLieuFormComplete } from './useLieuFormComplete';
export { default as useLieuSearch } from './useLieuSearch';
export { default as useLieuxFilters } from './useLieuxFilters';

// Export de la version migrée avec son nom original
export { default as useLieuxFiltersMigrated } from './useLieuxFiltersMigrated';

/**
 * @recommended La version migrée du hook useLieuxFilters basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as useLieuxFiltersV2 } from './useLieuxFiltersMigrated';

export { default as useLieuxQuery } from './useLieuxQuery';
export { default as useAddressSearch } from './useAddressSearch';
export { default as useProgrammateurSearch } from './useProgrammateurSearch';