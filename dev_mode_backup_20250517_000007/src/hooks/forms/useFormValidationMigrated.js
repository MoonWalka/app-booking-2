// src/hooks/forms/useFormValidationMigrated.js
import { useState, useCallback, useEffect } from 'react';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook migré pour la validation de formulaire
 * Fournit une API complète pour gérer la validation des champs de formulaire
 * et suivre les erreurs et l'état de validation
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
const useFormValidationMigrated = (options) => {
  const {
    initialValues = {},
    validationSchema = {},
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    onSubmit = null
  } = options || {};

  // États du formulaire
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Valide un champ spécifique
   * 
   * @param {string} fieldName - Nom du champ à valider
   * @param {any} fieldValue - Valeur du champ
   * @returns {string|null} Message d'erreur ou null si valide
   */
  const validateField = useCallback((fieldName, fieldValue) => {
    // Si aucune règle de validation pour ce champ, considérer comme valide
    if (!validationSchema[fieldName]) return null;
    
    const fieldRules = validationSchema[fieldName];
    
    // Vérifier la règle required
    if (fieldRules.required && 
        (fieldValue === undefined || 
         fieldValue === null || 
         fieldValue === '' || 
         (Array.isArray(fieldValue) && fieldValue.length === 0))) {
      return fieldRules.requiredMessage || 'Ce champ est requis';
    }
    
    // Vérifier la règle min (longueur minimale pour les chaînes, valeur minimale pour les nombres)
    if (fieldRules.min !== undefined && fieldValue !== undefined && fieldValue !== null) {
      if (typeof fieldValue === 'string' && fieldValue.length < fieldRules.min) {
        return fieldRules.minMessage || `Minimum ${fieldRules.min} caractères requis`;
      } 
      if (typeof fieldValue === 'number' && fieldValue < fieldRules.min) {
        return fieldRules.minMessage || `La valeur doit être au moins ${fieldRules.min}`;
      }
    }
    
    // Vérifier la règle max (longueur maximale pour les chaînes, valeur maximale pour les nombres)
    if (fieldRules.max !== undefined && fieldValue !== undefined && fieldValue !== null) {
      if (typeof fieldValue === 'string' && fieldValue.length > fieldRules.max) {
        return fieldRules.maxMessage || `Maximum ${fieldRules.max} caractères autorisés`;
      } 
      if (typeof fieldValue === 'number' && fieldValue > fieldRules.max) {
        return fieldRules.maxMessage || `La valeur doit être au plus ${fieldRules.max}`;
      }
    }
    
    // Vérifier la règle email
    if (fieldRules.email && typeof fieldValue === 'string' && fieldValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fieldValue)) {
        return fieldRules.emailMessage || 'Format d\'email invalide';
      }
    }
    
    // Vérifier la règle pattern (regex)
    if (fieldRules.pattern && typeof fieldValue === 'string' && fieldValue) {
      const regex = new RegExp(fieldRules.pattern);
      if (!regex.test(fieldValue)) {
        return fieldRules.patternMessage || 'Format invalide';
      }
    }
    
    // Vérifier la règle custom (fonction personnalisée)
    if (typeof fieldRules.validate === 'function') {
      const customError = fieldRules.validate(fieldValue, values);
      if (customError) {
        return customError;
      }
    }
    
    // Le champ est valide
    return null;
  }, [validationSchema, values]);

  /**
   * Valide tout le formulaire
   * 
   * @returns {Object} Erreurs par champ
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;
    
    // Valider chaque champ du formulaire
    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    setIsValid(!hasErrors);
    
    return newErrors;
  }, [validateField, validationSchema, values]);

  /**
   * Gère les changements de valeur des champs
   * 
   * @param {Event|string} eventOrFieldName - Événement ou nom du champ
   * @param {any} [value] - Valeur du champ (si le nom du champ est passé directement)
   */
  const handleChange = useCallback((eventOrFieldName, value) => {
    let fieldName, fieldValue;
    
    // Si le premier argument est un événement
    if (eventOrFieldName && eventOrFieldName.target) {
      const target = eventOrFieldName.target;
      fieldName = target.name;
      
      // Adapter la valeur selon le type d'élément
      fieldValue = target.type === 'checkbox' ? target.checked : target.value;
    } else {
      // Si le premier argument est directement le nom du champ
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
    
    // Valider le champ si nécessaire
    if (validateOnChange) {
      const fieldError = validateField(fieldName, fieldValue);
      
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: fieldError
      }));
    }
  }, [touched, validateField, validateOnChange]);

  /**
   * Gère la perte de focus des champs
   * 
   * @param {Event} e - Événement blur
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // Marquer le champ comme touché
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Valider le champ si nécessaire
    if (validateOnBlur) {
      const fieldError = validateField(name, values[name]);
      
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: fieldError
      }));
    }
  }, [validateField, validateOnBlur, values]);

  /**
   * Gère la soumission du formulaire
   * 
   * @param {Event} e - Événement submit
   */
  const handleSubmit = useCallback((e) => {
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
      formErrors = validateForm();
    }
    
    // Appeler onSubmit si aucune erreur et callback fourni
    if (Object.keys(formErrors).length === 0 && onSubmit) {
      debugLog('Formulaire valide, soumission en cours', 'info', 'useFormValidationMigrated');
      
      try {
        onSubmit(values, {
          setSubmitting: setIsSubmitting,
          resetForm: resetForm
        });
      } catch (err) {
        debugLog(`Erreur lors de la soumission: ${err.message}`, 'error', 'useFormValidationMigrated');
      }
    } else {
      setIsSubmitting(false);
    }
  }, [validateForm, validateOnSubmit, validationSchema, values, onSubmit]);

  /**
   * Réinitialise le formulaire
   * 
   * @param {Object} [newValues] - Nouvelles valeurs initiales (optionnel)
   */
  const resetForm = useCallback((newValues = null) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsDirty(false);
    debugLog('Formulaire réinitialisé', 'info', 'useFormValidationMigrated');
  }, [initialValues]);

  /**
   * Met à jour plusieurs valeurs à la fois
   * 
   * @param {Object} newValues - Nouvelles valeurs à appliquer
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
   * 
   * @param {string} fieldName - Nom du champ
   * @param {any} value - Valeur à définir
   */
  const setFieldValue = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setIsDirty(true);
    
    // Valider le champ si nécessaire
    if (validateOnChange) {
      const fieldError = validateField(fieldName, value);
      
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: fieldError
      }));
    }
  }, [validateField, validateOnChange]);

  /**
   * Définit une erreur pour un champ spécifique
   * 
   * @param {string} fieldName - Nom du champ
   * @param {string} errorMessage - Message d'erreur
   */
  const setFieldError = useCallback((fieldName, errorMessage) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));
    
    // Mettre à jour l'état de validité global
    setIsValid(Object.values({
      ...errors,
      [fieldName]: errorMessage
    }).every(error => !error));
  }, [errors]);

  /**
   * Récupère l'état complet d'un champ (valeur, erreur, touché)
   * 
   * @param {string} fieldName - Nom du champ
   * @returns {Object} État complet du champ
   */
  const getFieldMeta = useCallback((fieldName) => {
    return {
      value: values[fieldName],
      error: errors[fieldName],
      touched: !!touched[fieldName],
      isValid: !errors[fieldName]
    };
  }, [values, errors, touched]);

  // Effet pour mettre à jour l'état de validité global lorsque les erreurs changent
  useEffect(() => {
    const formIsValid = Object.values(errors).every(error => !error);
    setIsValid(formIsValid);
  }, [errors]);

  return {
    // État
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    
    // Gestionnaires
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Actions
    validateField,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldValues,
    setFieldError,
    getFieldMeta,
    
    // Helpers
    setValues,
    setErrors,
    setTouched
  };
};

export default useFormValidationMigrated;