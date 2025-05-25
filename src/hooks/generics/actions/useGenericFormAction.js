/**
 * @fileoverview Hook générique pour les actions de formulaires
 * Hook générique créé lors de la Phase 2 de généralisation
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import useGenericAction from './useGenericAction';

/**
 * Hook générique pour les actions de formulaires
 * 
 * @description
 * Fonctionnalités supportées :
 * - submit: Soumission de formulaires avec validation
 * - reset: Réinitialisation des formulaires
 * - auto_save: Sauvegarde automatique
 * - validation: Validation en temps réel
 * 
 * @param {string} entityType - Type d'entité (concerts, programmateurs, etc.)
 * @param {Object} formConfig - Configuration du formulaire
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {Object} returns.formData - Données du formulaire
 * @returns {Function} returns.setFormData - Fonction de mise à jour des données
 * @returns {Function} returns.handleSubmit - Fonction de soumission
 * @returns {Function} returns.handleReset - Fonction de réinitialisation
 * @returns {Function} returns.handleFieldChange - Fonction de changement de champ
 * @returns {boolean} returns.isDirty - Formulaire modifié
 * @returns {boolean} returns.isValid - Formulaire valide
 * 
 * @example
 * ```javascript
 * const { 
 *   formData, 
 *   setFormData, 
 *   handleSubmit, 
 *   handleReset, 
 *   loading, 
 *   error,
 *   isDirty,
 *   isValid
 * } = useGenericFormAction('concerts', {
 *   initialData: { titre: '', date: '', statut: 'contact' },
 *   validationRules: {
 *     titre: { required: true, minLength: 3 },
 *     date: { required: true }
 *   },
 *   onSubmit: (data) => console.log('Formulaire soumis:', data),
 *   onSuccess: (result) => console.log('Succès:', result)
 * });
 * 
 * // Utilisation dans un composant
 * <form onSubmit={handleSubmit}>
 *   <input 
 *     value={formData.titre} 
 *     onChange={(e) => handleFieldChange('titre', e.target.value)}
 *   />
 *   <button type="submit" disabled={loading || !isValid}>
 *     {loading ? 'Envoi...' : 'Soumettre'}
 *   </button>
 * </form>
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @generic true
 * @replaces useFormActions, useFormSubmission
 */
const useGenericFormAction = (entityType, formConfig = {}, options = {}) => {
  const {
    initialData = {},
    validationRules = {},
    onSubmit,
    onSuccess,
    onError,
    onReset,
    onFieldChange,
    submitMode = 'create' // 'create' | 'update'
  } = formConfig;
  
  const {
    enableAutoSave = false,
    autoSaveDelay = 2000,
    enableValidation = true,
    validateOnChange = true,
    resetOnSuccess = false
  } = options;
  
  // États du formulaire
  const [formData, setFormData] = useState(initialData);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Référence pour l'auto-save
  const autoSaveTimeoutRef = useRef(null);
  const initialDataRef = useRef(initialData);
  
  // Hook d'actions CRUD
  const { create, update, loading: actionLoading, error: actionError } = useGenericAction(
    entityType,
    {
      onCreate: onSuccess,
      onUpdate: onSuccess,
      onError
    }
  );
  
  // Validation d'un champ
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;
    
    const errors = [];
    
    // Validation required
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${fieldName} est requis`);
    }
    
    // Validation minLength
    if (rules.minLength && value && value.toString().length < rules.minLength) {
      errors.push(`${fieldName} doit contenir au moins ${rules.minLength} caractères`);
    }
    
    // Validation maxLength
    if (rules.maxLength && value && value.toString().length > rules.maxLength) {
      errors.push(`${fieldName} ne peut pas dépasser ${rules.maxLength} caractères`);
    }
    
    // Validation pattern
    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || `${fieldName} n'est pas valide`);
    }
    
    // Validation custom
    if (rules.validate && typeof rules.validate === 'function') {
      const customError = rules.validate(value, formData);
      if (customError) {
        errors.push(customError);
      }
    }
    
    return errors.length > 0 ? errors : null;
  }, [validationRules, formData]);
  
  // Validation complète du formulaire
  const validateForm = useCallback(() => {
    if (!enableValidation) return true;
    
    const errors = {};
    let isValid = true;
    
    Object.keys(validationRules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, formData[fieldName]);
      if (fieldErrors) {
        errors[fieldName] = fieldErrors;
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  }, [formData, validationRules, validateField, enableValidation]);
  
  // Changement de champ
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      
      // Marquer comme modifié
      setIsDirty(true);
      
      // Validation en temps réel
      if (enableValidation && validateOnChange) {
        const fieldErrors = validateField(fieldName, value);
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: fieldErrors
        }));
      }
      
      // Auto-save
      if (enableAutoSave) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
          handleAutoSave(newData);
        }, autoSaveDelay);
      }
      
      // Callback personnalisé
      if (onFieldChange) {
        onFieldChange(fieldName, value, newData);
      }
      
      return newData;
    });
  }, [validateField, enableValidation, validateOnChange, enableAutoSave, autoSaveDelay, onFieldChange]);
  
  // Auto-save
  const handleAutoSave = useCallback(async (dataToSave) => {
    if (submitMode === 'update' && formData.id) {
      try {
        await update(formData.id, dataToSave);
        console.log('💾 Auto-save réussi');
      } catch (error) {
        console.warn('⚠️ Échec auto-save:', error);
      }
    }
  }, [submitMode, formData.id, update]);
  
  // Soumission du formulaire
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    
    try {
      // Validation
      const isValid = validateForm();
      if (!isValid) {
        throw new Error('Formulaire invalide');
      }
      
      // Callback de soumission personnalisé
      if (onSubmit) {
        const shouldContinue = await onSubmit(formData);
        if (shouldContinue === false) {
          return;
        }
      }
      
      // Action CRUD
      let result;
      if (submitMode === 'create') {
        result = await create(formData);
      } else if (submitMode === 'update' && formData.id) {
        result = await update(formData.id, formData);
      } else {
        throw new Error('Mode de soumission invalide ou ID manquant');
      }
      
      // Réinitialisation si demandée
      if (resetOnSuccess) {
        handleReset();
      } else {
        setIsDirty(false);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur soumission formulaire:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, submitMode, create, update, resetOnSuccess]);
  
  // Réinitialisation du formulaire
  const handleReset = useCallback(() => {
    setFormData(initialDataRef.current);
    setValidationErrors({});
    setIsDirty(false);
    
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
  // Mise à jour des données initiales
  const updateInitialData = useCallback((newInitialData) => {
    initialDataRef.current = newInitialData;
    setFormData(newInitialData);
    setIsDirty(false);
    setValidationErrors({});
  }, []);
  
  // Nettoyage
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  
  // État de validation
  const isValid = Object.keys(validationErrors).length === 0 && 
                  Object.values(validationErrors).every(errors => !errors || errors.length === 0);
  
  return {
    // Données
    formData,
    setFormData,
    
    // Actions
    handleSubmit,
    handleReset,
    handleFieldChange,
    updateInitialData,
    
    // États
    loading: actionLoading || isSubmitting,
    error: actionError,
    isDirty,
    isValid,
    validationErrors,
    
    // Utilitaires
    validateForm,
    validateField
  };
};

export default useGenericFormAction; 