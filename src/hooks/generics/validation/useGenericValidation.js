/**
 * @fileoverview Hook générique pour la validation de données
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 3
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 3
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Hook générique pour la validation de données
 * 
 * @description
 * Fonctionnalités supportées :
 * - validation_rules: Règles de validation extensibles
 * - custom_validators: Validateurs personnalisés
 * - async_validation: Validation asynchrone
 * - conditional_validation: Validation conditionnelle
 * 
 * @param {Object} data - Données à valider
 * @param {Object} validationRules - Règles de validation
 * @param {Object} options - Options de validation
 * 
 * @returns {Object} Interface du hook générique
 * @returns {Object} returns.validationErrors - Erreurs de validation par champ
 * @returns {boolean} returns.isValid - Données valides globalement
 * @returns {Function} returns.validateField - Valider un champ spécifique
 * @returns {Function} returns.validateForm - Valider tout le formulaire
 * @returns {Function} returns.clearErrors - Effacer les erreurs
 * @returns {Function} returns.setFieldError - Définir une erreur pour un champ
 * @returns {Function} returns.addAsyncValidator - Ajouter un validateur asynchrone
 * 
 * @example
 * ```javascript
 * // Validation simple
 * const { validationErrors, isValid, validateField } = useGenericValidation(
 *   formData,
 *   {
 *     email: { 
 *       required: true, 
 *       email: true,
 *       message: 'Email requis et valide'
 *     },
 *     password: { 
 *       required: true, 
 *       minLength: 8,
 *       pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
 *       message: 'Mot de passe complexe requis'
 *     }
 *   }
 * );
 * 
 * // Validation avec règles personnalisées
 * const { validateForm } = useGenericValidation(
 *   userData,
 *   {
 *     username: {
 *       required: true,
 *       custom: async (value) => {
 *         const exists = await checkUsernameExists(value);
 *         return exists ? 'Nom d\'utilisateur déjà pris' : null;
 *       }
 *     }
 *   }
 * );
 * ```
 * 
 * @complexity HIGH
 * @businessCritical true
 * @generic true
 * @replaces useFormValidation, useStructureValidation, validateForm functions
 */
const useGenericValidation = (data = {}, validationRules = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    enableValidation = true,
    debounceDelay = 300,
    enableAsyncValidation = true
  } = options;
  
  // États de validation
  const [validationErrors, setValidationErrors] = useState({});
  const [asyncValidationErrors, setAsyncValidationErrors] = useState({});
  const [validatingFields, setValidatingFields] = useState(new Set());
  
  // Validateurs intégrés
  const builtInValidators = useMemo(() => ({
    // Validation required
    required: (value, rule) => {
      if (rule.required) {
        if (value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)) {
          return rule.requiredMessage || 'Ce champ est requis';
        }
      }
      return null;
    },
    
    // Validation de type
    type: (value, rule) => {
      if (!value || !rule.type) return null;
      
      switch (rule.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return rule.typeMessage || 'Format d\'email invalide';
          }
          break;
          
        case 'url':
          try {
            new URL(value);
          } catch {
            return rule.typeMessage || 'URL invalide';
          }
          break;
          
        case 'number':
          if (isNaN(Number(value))) {
            return rule.typeMessage || 'Doit être un nombre';
          }
          break;
          
        case 'date':
          if (isNaN(Date.parse(value))) {
            return rule.typeMessage || 'Date invalide';
          }
          break;
          
        case 'phone':
          const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
          if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            return rule.typeMessage || 'Numéro de téléphone invalide';
          }
          break;
          
        case 'siret':
          const siretRegex = /^\d{14}$/;
          if (!siretRegex.test(value.replace(/\s/g, ''))) {
            return rule.typeMessage || 'SIRET doit contenir 14 chiffres';
          }
          break;
      }
      return null;
    },
    
    // Validation de longueur
    length: (value, rule) => {
      if (!value) return null;
      
      const length = typeof value === 'string' ? value.length : String(value).length;
      
      if (rule.minLength && length < rule.minLength) {
        return rule.minLengthMessage || `Minimum ${rule.minLength} caractères`;
      }
      
      if (rule.maxLength && length > rule.maxLength) {
        return rule.maxLengthMessage || `Maximum ${rule.maxLength} caractères`;
      }
      
      if (rule.exactLength && length !== rule.exactLength) {
        return rule.exactLengthMessage || `Doit contenir exactement ${rule.exactLength} caractères`;
      }
      
      return null;
    },
    
    // Validation de valeur numérique
    numeric: (value, rule) => {
      if (!value) return null;
      
      const numValue = Number(value);
      if (isNaN(numValue)) return null;
      
      if (rule.min !== undefined && numValue < rule.min) {
        return rule.minMessage || `Valeur minimale: ${rule.min}`;
      }
      
      if (rule.max !== undefined && numValue > rule.max) {
        return rule.maxMessage || `Valeur maximale: ${rule.max}`;
      }
      
      return null;
    },
    
    // Validation par pattern regex
    pattern: (value, rule) => {
      if (!value || !rule.pattern) return null;
      
      const regex = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern);
      if (!regex.test(value)) {
        return rule.patternMessage || 'Format invalide';
      }
      
      return null;
    },
    
    // Validation de correspondance
    match: (value, rule) => {
      if (!value || !rule.match) return null;
      
      const matchValue = typeof rule.match === 'string' ? data[rule.match] : rule.match;
      if (value !== matchValue) {
        return rule.matchMessage || 'Les valeurs ne correspondent pas';
      }
      
      return null;
    },
    
    // Validation dans une liste
    oneOf: (value, rule) => {
      if (!value || !rule.oneOf || !Array.isArray(rule.oneOf)) return null;
      
      if (!rule.oneOf.includes(value)) {
        return rule.oneOfMessage || `Valeur doit être parmi: ${rule.oneOf.join(', ')}`;
      }
      
      return null;
    },
    
    // Validation de fichier
    file: (value, rule) => {
      if (!value || !rule.file) return null;
      
      // Si c'est un objet File
      if (value instanceof File) {
        if (rule.file.maxSize && value.size > rule.file.maxSize) {
          return rule.file.maxSizeMessage || `Fichier trop volumineux (max: ${rule.file.maxSize} bytes)`;
        }
        
        if (rule.file.allowedTypes && !rule.file.allowedTypes.includes(value.type)) {
          return rule.file.allowedTypesMessage || `Type de fichier non autorisé`;
        }
      }
      
      return null;
    }
  }), [data]);
  
  // Validation d'un champ
  const validateField = useCallback(async (fieldName, value = data[fieldName], contextData = data) => {
    if (!enableValidation || !validationRules[fieldName]) {
      return null;
    }
    
    const rule = validationRules[fieldName];
    
    // Validation conditionnelle
    if (rule.when && typeof rule.when === 'function') {
      if (!rule.when(contextData)) {
        return null;
      }
    }
    
    // Validation synchrone avec validateurs intégrés
    for (const [validatorName, validator] of Object.entries(builtInValidators)) {
      const error = validator(value, rule);
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: error
        }));
        return error;
      }
    }
    
    // Validation personnalisée synchrone
    if (rule.validate && typeof rule.validate === 'function') {
      try {
        const error = rule.validate(value, contextData);
        if (error) {
          setValidationErrors(prev => ({
            ...prev,
            [fieldName]: error
          }));
          return error;
        }
      } catch (err) {
        const error = 'Erreur de validation';
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: error
        }));
        return error;
      }
    }
    
    // Validation asynchrone
    if (enableAsyncValidation && rule.asyncValidate && typeof rule.asyncValidate === 'function') {
      setValidatingFields(prev => new Set(prev).add(fieldName));
      
      try {
        const error = await rule.asyncValidate(value, contextData);
        if (error) {
          setAsyncValidationErrors(prev => ({
            ...prev,
            [fieldName]: error
          }));
          setValidationErrors(prev => ({
            ...prev,
            [fieldName]: error
          }));
          return error;
        } else {
          setAsyncValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      } catch (err) {
        const error = 'Erreur de validation asynchrone';
        setAsyncValidationErrors(prev => ({
          ...prev,
          [fieldName]: error
        }));
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: error
        }));
        return error;
      } finally {
        setValidatingFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(fieldName);
          return newSet;
        });
      }
    }
    
    // Aucune erreur trouvée
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    
    return null;
  }, [data, validationRules, enableValidation, builtInValidators, enableAsyncValidation]);
  
  // Validation complète du formulaire
  const validateForm = useCallback(async () => {
    if (!enableValidation) {
      return { isValid: true, errors: {} };
    }
    
    const errors = {};
    const fieldNames = Object.keys(validationRules);
    
    // Validation synchrone de tous les champs
    const validationPromises = fieldNames.map(async (fieldName) => {
      const error = await validateField(fieldName, data[fieldName], data);
      if (error) {
        errors[fieldName] = error;
      }
    });
    
    await Promise.all(validationPromises);
    
    const isValid = Object.keys(errors).length === 0;
    
    return {
      isValid,
      errors,
      message: isValid ? null : 'Veuillez corriger les erreurs du formulaire'
    };
  }, [data, validationRules, enableValidation, validateField]);
  
  // Effacer les erreurs
  const clearErrors = useCallback((fieldName = null) => {
    if (fieldName) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      setAsyncValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } else {
      setValidationErrors({});
      setAsyncValidationErrors({});
    }
  }, []);
  
  // Définir une erreur pour un champ
  const setFieldError = useCallback((fieldName, error) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);
  
  // Ajouter un validateur asynchrone
  const addAsyncValidator = useCallback((fieldName, validator) => {
    // Cette fonction permet d'ajouter dynamiquement des validateurs
    // Utile pour des validations qui dépendent du contexte
    if (validationRules[fieldName]) {
      validationRules[fieldName].asyncValidate = validator;
    }
  }, [validationRules]);
  
  // Validation en temps réel des champs modifiés
  useEffect(() => {
    if (!validateOnChange || !enableValidation) return;
    
    const timeouts = {};
    
    Object.keys(data).forEach(fieldName => {
      if (validationRules[fieldName]) {
        // Debounce pour éviter trop de validations
        timeouts[fieldName] = setTimeout(() => {
          validateField(fieldName, data[fieldName], data);
        }, debounceDelay);
      }
    });
    
    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [data, validateOnChange, enableValidation, debounceDelay, validateField, validationRules]);
  
  // État de validation global
  const isValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0 && 
           Object.keys(asyncValidationErrors).length === 0;
  }, [validationErrors, asyncValidationErrors]);
  
  // Statistiques de validation
  const validationStats = useMemo(() => {
    const totalFields = Object.keys(validationRules).length;
    const errorFields = Object.keys(validationErrors).length;
    const validatingFieldsCount = validatingFields.size;
    
    return {
      totalFields,
      errorFields,
      validFields: totalFields - errorFields,
      validatingFields: validatingFieldsCount,
      validationRate: totalFields > 0 ? ((totalFields - errorFields) / totalFields) * 100 : 100
    };
  }, [validationRules, validationErrors, validatingFields]);
  
  return {
    // États de validation
    validationErrors,
    asyncValidationErrors,
    isValid,
    validatingFields: Array.from(validatingFields),
    
    // Actions de validation
    validateField,
    validateForm,
    clearErrors,
    setFieldError,
    addAsyncValidator,
    
    // Utilitaires
    hasError: (fieldName) => !!validationErrors[fieldName],
    getError: (fieldName) => validationErrors[fieldName],
    isValidating: (fieldName) => validatingFields.has(fieldName),
    
    // Statistiques
    validationStats,
    
    // Configuration
    validationRules,
    enableValidation
  };
};

export default useGenericValidation; 