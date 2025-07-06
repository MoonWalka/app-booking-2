/**
 * @fileoverview Index des hooks de formulaires
 * 
 * ⚠️ NOTICE DE MIGRATION - Phase 1 Consolidation ⚠️
 * 
 * Plusieurs hooks de ce module ont été migrés vers des versions génériques
 * pour améliorer la maintenabilité et réduire la duplication de code.
 * 
 * HOOKS MIGRÉS (wrappers de compatibilité) :
 * - useFormValidation → useGenericValidation (recommandé pour nouveaux développements)
 * - useAdminFormValidation → useGenericEntityDetails (recommandé pour nouveaux développements)
 * - useFormTokenValidation → useGenericEntityDetails + validation personnalisée
 * 
 * NOUVEAUX DÉVELOPPEMENTS :
 * Utilisez directement les hooks génériques depuis @/hooks/generics/
 * 
 * @author TourCraft Team
 * @since 2024
 * @migrationPhase Phase 1 - Consolidation des hooks de validation
 */

// Hooks de validation - MIGRÉS vers useGenericValidation
export { default as useFormValidation } from './useFormValidation'; // @deprecated - Utilisez useGenericValidation
export { default as useFormValidationData } from './useFormValidationData';
export { default as useFormTokenValidation } from './useFormTokenValidation'; // @deprecated - Utilisez useGenericEntityDetails
export { default as useAdminFormValidation } from './useAdminFormValidation'; // @deprecated - Utilisez useGenericEntityDetails

// Hooks de soumission - Candidats pour prochaine phase
export { default as useFormSubmission } from './useFormSubmission';
export { default as useValidationBatchActions } from './useValidationBatchActions';

// Hooks d'actions sur les champs
export { default as useFieldActions } from './useFieldActions';

// Hook d'état de formulaire de lieu
export { default as useLieuFormState } from './useLieuFormState';
// export { default as useDateForm } from './useDateForm'; // Supprimé car le hook a été migré vers hooks/dates/useDateForm.js