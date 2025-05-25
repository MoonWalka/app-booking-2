// src/hooks/forms/useFormValidation.js
import { useState, useCallback, useMemo } from 'react';
import { debugLog } from '@/utils/logUtils';
import useGenericValidation from '@/hooks/generics/validation/useGenericValidation';

/**
 * Hook migré pour la validation de formulaire
 * 
 * @deprecated Utilisez useGenericValidation directement pour les nouveaux développements
 * @migrationDate 2025-01-XX
 * @replaces Wrapper autour de useGenericValidation pour maintenir la compatibilité
 * 
 * Ce hook est maintenant un wrapper autour de useGenericValidation.
 * Il maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise la logique générique en arrière-plan.
 * 
 * @param {Object} options - Options de configuration
 * @param {Object} options.initialValues - Valeurs initiales du formulaire
 * @param {Object} options.validationSchema - Schéma de validation avec règles par champ
 * @param {boolean} options.validateOnChange - Valider à chaque changement de valeur
 * @param {boolean} options.validateOnBlur - Valider lors de la perte de focus
 * @param {boolean} options.validateOnSubmit - Valider lors de la soumission
 * @param {Function} options.onSubmit - Fonction appelée à la soumission si tout est valide
 * @returns {Object} API de validation de formulaire
 */
const useFormValidation = (options) => {
  const {
    initialValues = {},
    validationSchema = {},
    validateOnChange = true,
    validateOnSubmit = true,
    onSubmit = null
  } = options || {};

  // États du formulaire (maintenus pour compatibilité)
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Conversion du schéma de validation vers le format useGenericValidation
  const convertedValidationRules = useMemo(() => {
    const converted = {};
    
    Object.keys(validationSchema).forEach(fieldName => {
      const fieldRules = validationSchema[fieldName];
      
      // Conversion des règles vers le format générique
      converted[fieldName] = {
        required: fieldRules.required,
        requiredMessage: fieldRules.requiredMessage,
        
        // Conversion des règles min/max
        minLength: fieldRules.min,
        minLengthMessage: fieldRules.minMessage,
        maxLength: fieldRules.max,
        maxLengthMessage: fieldRules.maxMessage,
        
        // Conversion des règles de type
        type: fieldRules.email ? 'email' : undefined,
        typeMessage: fieldRules.emailMessage,
        
        // Conversion des patterns
        pattern: fieldRules.pattern,
        patternMessage: fieldRules.patternMessage,
        
        // Validation personnalisée
        validate: fieldRules.validate
      };
      
      // Nettoyer les propriétés undefined
      Object.keys(converted[fieldName]).forEach(key => {
        if (converted[fieldName][key] === undefined) {
          delete converted[fieldName][key];
        }
      });
    });
    
    return converted;
  }, [validationSchema]);

  // Utilisation du hook générique
  const {
    validationErrors: errors,
    isValid,
    validateField: genericValidateField,
    validateForm: genericValidateForm,
    clearErrors,
    setFieldError
  } = useGenericValidation(values, convertedValidationRules, {
    validateOnChange,
    enableValidation: true,
    debounceDelay: 300
  });

  /**
   * Valide un champ spécifique (wrapper pour compatibilité)
   */
  const validateField = useCallback((fieldName, fieldValue) => {
    return genericValidateField(fieldName, fieldValue, values);
  }, [genericValidateField, values]);

  /**
   * Valide tout le formulaire (wrapper pour compatibilité)
   */
  const validateForm = useCallback(async () => {
    const result = await genericValidateForm();
    return result.errors;
  }, [genericValidateForm]);

  /**
   * Gère les changements de valeur des champs
   */
  const handleChange = useCallback((eventOrFieldName, value) => {
    let fieldName, fieldValue;
    
    // Si le premier argument est un événement
    if (eventOrFieldName && eventOrFieldName.target) {
      const target = eventOrFieldName.target;
      fieldName = target.name;
      fieldValue = target.type === 'checkbox' ? target.checked : target.value;
    } else {
      fieldName = eventOrFieldName;
      fieldValue = value;
    }
    
    // Mettre à jour les valeurs
    setValues(prevValues => ({
      ...prevValues,
      [fieldName]: fieldValue
    }));
    
    // Marquer le formulaire comme modifié
    setIsDirty(true);
    
    // Marquer le champ comme touché
    if (!touched[fieldName]) {
      setTouched(prev => ({
        ...prev,
        [fieldName]: true
      }));
    }
  }, [touched]);

  /**
   * Gère la perte de focus des champs
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // Marquer le champ comme touché
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // La validation est gérée automatiquement par useGenericValidation
  }, []);

  /**
   * Réinitialise le formulaire
   */
  const resetForm = useCallback((newValues = null) => {
    setValues(newValues || initialValues);
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
    clearErrors();
    debugLog('Formulaire réinitialisé', 'info', 'useFormValidation');
  }, [initialValues, clearErrors]);

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    
    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(validationSchema).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Valider le formulaire si nécessaire
    let formErrors = {};
    if (validateOnSubmit) {
      const result = await genericValidateForm();
      formErrors = result.errors;
    }
    
    // Appeler onSubmit si aucune erreur et callback fourni
    if (Object.keys(formErrors).length === 0 && onSubmit) {
      debugLog('Formulaire valide, soumission en cours', 'info', 'useFormValidation');
      
      try {
        await onSubmit(values, {
          setSubmitting: setIsSubmitting,
          resetForm: resetForm
        });
      } catch (err) {
        debugLog(`Erreur lors de la soumission: ${err.message}`, 'error', 'useFormValidation');
      }
    } else {
      setIsSubmitting(false);
    }
  }, [validateOnSubmit, validationSchema, values, onSubmit, resetForm, genericValidateForm]);

  /**
   * Met à jour plusieurs valeurs à la fois
   */
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
    setIsDirty(true);
  }, []);

  /**
   * Définit une valeur pour un champ spécifique
   */
  const setFieldValue = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setIsDirty(true);
  }, []);

  /**
   * Récupère l'état complet d'un champ (valeur, erreur, touché)
   */
  const getFieldMeta = useCallback((fieldName) => {
    return {
      value: values[fieldName],
      error: errors[fieldName],
      touched: !!touched[fieldName],
      isValid: !errors[fieldName]
    };
  }, [values, errors, touched]);

  return {
    // État (API compatible)
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    
    // Gestionnaires (API compatible)
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Actions (API compatible)
    validateField,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldValues,
    setFieldError,
    getFieldMeta,
    
    // Helpers (API compatible)
    setValues,
    setErrors: (newErrors) => {
      Object.keys(newErrors).forEach(fieldName => {
        setFieldError(fieldName, newErrors[fieldName]);
      });
    },
    setTouched
  };
};

export default useFormValidation;