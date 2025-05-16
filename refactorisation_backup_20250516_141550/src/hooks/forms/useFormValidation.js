// src/hooks/forms/useFormValidation.js
/**
 * @deprecated Ce hook est maintenant un wrapper vers useFormValidationMigrated.
 * Veuillez utiliser useFormValidationV2 pour les nouveaux développements.
 */

import useFormValidationMigrated from './useFormValidationMigrated';

const useFormValidation = (options) => {
  // Réutiliser la version migrée
  return useFormValidationMigrated(options);
};

export default useFormValidation;
