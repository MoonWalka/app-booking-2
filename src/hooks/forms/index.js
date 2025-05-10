// src/hooks/forms/index.js

/**
 * Ce fichier centralise les exports des hooks liés aux formulaires 
 * afin de standardiser leur utilisation à travers l'application
 */

// Hooks de validation
export { default as useFormValidation } from './useFormValidation';
export { default as useFormValidationMigrated } from './useFormValidationMigrated';

/**
 * @recommended La version migrée du hook useFormValidation avec une API complète de validation.
 * À utiliser dans les nouveaux développements.
 */
export { default as useFormValidationV2 } from './useFormValidationMigrated';

export { default as useFormValidationData } from './useFormValidationData';
export { default as useFormTokenValidation } from './useFormTokenValidation';
export { default as useAdminFormValidation } from './useAdminFormValidation';

// Hooks d'actions
export { default as useFieldActions } from './useFieldActions';
export { default as useValidationBatchActions } from './useValidationBatchActions';
export { default as useFormSubmission } from './useFormSubmission';

// Hooks de gestion d'état
export { default as useLieuFormState } from './useLieuFormState';
// export { default as useConcertForm } from './useConcertForm'; // Supprimé car le hook a été migré vers hooks/concerts/useConcertForm.js