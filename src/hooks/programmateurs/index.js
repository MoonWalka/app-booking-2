// src/hooks/programmateurs/index.js
// Re-export hooks specific to programmateurs
export { default as useAddressSearch } from './useAddressSearch';
export { default as useProgrammateurDetails } from './useProgrammateurDetails';
export { default as useProgrammateurSearch } from './useProgrammateurSearch';

// Exporter les hooks migrés avec un nom explicite (pour la transition progressive)
export { default as useProgrammateurDetailsMigrated } from './useProgrammateurDetailsMigrated';

/**
 * @recommended La version migrée du hook useProgrammateurDetails basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as useProgrammateurDetailsV2 } from './useProgrammateurDetailsMigrated';

// Exports des autres hooks spécifiques aux programmateurs
export { default as useAdresseValidation } from './useAdresseValidation';
export { default as useLieuSearch } from './useLieuSearch';
export { default as useCompanySearch } from './useCompanySearch';
export { default as useConcertSearch } from './useConcertSearch';
export { default as useFormSubmission } from './useFormSubmission';
export { default as useProgrammateurForm } from './useProgrammateurForm';