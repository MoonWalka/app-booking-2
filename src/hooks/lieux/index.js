/**
 * Point d'entrée pour les hooks relatifs aux lieux
 * Permet d'importer tous les hooks depuis un seul endroit
 * Exemple: import { useLieuDetails, useLieuSearch } from '@/hooks/lieux';
 */

export { default as useLieuDetails } from './useLieuDetails';
export { default as useLieuDelete } from './useLieuDelete';
export { default as useLieuForm } from './useLieuForm';
export { default as useLieuFormComplete } from './useLieuFormComplete';
export { default as useLieuSearch } from './useLieuSearch';
export { default as useLieuxFilters } from './useLieuxFilters';
export { default as useLieuxQuery } from './useLieuxQuery';
export { default as useAddressSearch } from './useAddressSearch';
export { default as useProgrammateurSearch } from './useProgrammateurSearch';