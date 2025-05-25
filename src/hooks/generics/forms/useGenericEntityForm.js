/**
 * @fileoverview Hook générique pour les formulaires d'entités
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 3
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 3
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useGenericAction from '../actions/useGenericAction';
import useGenericValidation from '../validation/useGenericValidation';

/**
 * Hook générique pour les formulaires d'entités
 * 
 * @description
 * Fonctionnalités supportées :
 * - form_management: Gestion complète des formulaires d'entités
 * - validation: Validation intégrée avec règles personnalisables
 * - auto_save: Sauvegarde automatique avec debounce
 * - state_management: Gestion d'état avancée (dirty, touched, submitting)
 * 
 * @param {Object} formConfig - Configuration du formulaire
 * @param {string} formConfig.entityType - Type d'entité
 * @param {string|null} formConfig.entityId - ID de l'entité (null pour création)
 * @param {Object} formConfig.initialData - Données initiales
 * @param {Object} formConfig.validationRules - Règles de validation
 * @param {Function} formConfig.onSubmit - Callback de soumission
 * @param {Function} formConfig.onSuccess - Callback de succès
 * @param {Function} formConfig.onError - Callback d'erreur
 * 
 * @param {Object} options - Options additionnelles
 * @param {boolean} options.enableAutoSave - Activer la sauvegarde automatique
 * @param {number} options.autoSaveDelay - Délai de sauvegarde automatique (ms)
 * @param {boolean} options.enableValidation - Activer la validation
 * @param {boolean} options.validateOnChange - Valider à chaque changement
 * @param {boolean} options.resetOnSuccess - Réinitialiser après succès
 * @param {string} options.redirectOnSuccess - URL de redirection après succès
 * 
 * @returns {Object} Interface du hook générique
 * @returns {Object} returns.formData - Données du formulaire
 * @returns {Function} returns.setFormData - Fonction de mise à jour des données
 * @returns {Function} returns.handleSubmit - Fonction de soumission
 * @returns {Function} returns.handleReset - Fonction de réinitialisation
 * @returns {Function} returns.handleFieldChange - Fonction de changement de champ
 * @returns {boolean} returns.loading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur
 * @returns {boolean} returns.isDirty - Formulaire modifié
 * @returns {boolean} returns.isValid - Formulaire valide
 * @returns {Object} returns.validationErrors - Erreurs de validation
 * @returns {boolean} returns.isSubmitting - Soumission en cours
 * @returns {Object} returns.touchedFields - Champs touchés
 * 
 * @example
 * ```javascript
 * // Formulaire de création
 * const {
 *   formData,
 *   handleSubmit,
 *   handleFieldChange,
 *   loading,
 *   isValid,
 *   validationErrors
 * } = useGenericEntityForm({
 *   entityType: 'concerts',
 *   entityId: null,
 *   initialData: { titre: '', date: '', lieu: '' },
 *   validationRules: {
 *     titre: { required: true, minLength: 3 },
 *     date: { required: true, type: 'date' }
 *   }
 * });
 * 
 * // Formulaire d'édition avec auto-save
 * const {
 *   formData,
 *   handleFieldChange,
 *   isDirty,
 *   autoSaveStatus
 * } = useGenericEntityForm({
 *   entityType: 'programmateurs',
 *   entityId: 'prog123',
 *   initialData: existingData,
 *   validationRules: programmateurRules
 * }, {
 *   enableAutoSave: true,
 *   autoSaveDelay: 3000
 * });
 * ```
 * 
 * @complexity HIGH
 * @businessCritical true
 * @generic true
 * @replaces useStructureForm, useEntrepriseForm, useFormValidation
 */
const useGenericEntityForm = (formConfig = {}, options = {}) => {
  const {
    entityType,
    entityId = null,
    initialData = {},
    validationRules = {},
    onSubmit,
    onSuccess,
    onError,
    transformData = null
  } = formConfig;
  
  const {
    enableAutoSave = false,
    autoSaveDelay = 3000,
    enableValidation = true,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSuccess = false,
    redirectOnSuccess = null,
    enableDirtyTracking = true,
    enableTouchedTracking = true
  } = options;
  
  // Navigation hook
  const navigate = useNavigate();
  
  // États de base
  const [formData, setFormData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  
  // Références
  const autoSaveTimeoutRef = useRef(null);
  const initialLoadRef = useRef(false);
  
  // Hook de validation générique
  const {
    validationErrors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    setFieldError
  } = useGenericValidation(formData, validationRules, {
    validateOnChange,
    validateOnBlur,
    enableValidation
  });
  
  // Hook d'actions CRUD
  const {
    create,
    update,
    getById,
    loading: actionLoading,
    error: actionError
  } = useGenericAction(entityType, {
    onSuccess: (data, action) => {
      if (action === 'create' || action === 'update') {
        setAutoSaveStatus('saved');
        setIsDirty(false);
        setOriginalData(formData);
        
        if (onSuccess) {
          onSuccess(data, action);
        }
        
        if (resetOnSuccess) {
          handleReset();
        }
        
        if (redirectOnSuccess) {
          navigate(redirectOnSuccess.replace(':id', data.id));
        }
      }
    },
    onError: (error, action) => {
      if (action === 'create' || action === 'update') {
        setAutoSaveStatus('error');
      }
      
      if (onError) {
        onError(error, action);
      }
    }
  });
  
  // Chargement des données existantes
  useEffect(() => {
    if (entityId && !initialLoadRef.current) {
      initialLoadRef.current = true;
      
      getById(entityId).then(data => {
        if (data) {
          setFormData(data);
          setOriginalData(data);
          setIsDirty(false);
        }
      });
    }
  }, [entityId, getById]);
  
  // Fonction de transformation des données
  const processFormData = useCallback((data) => {
    if (transformData && typeof transformData === 'function') {
      return transformData(data);
    }
    return data;
  }, [transformData]);
  
  // Gestion des changements de champs
  const handleFieldChange = useCallback((fieldName, value, options = {}) => {
    const { markTouched = true, triggerValidation = validateOnChange } = options;
    
    // Mise à jour des données
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldName]: value
      };
      
      // Validation du champ si activée
      if (triggerValidation && enableValidation) {
        setTimeout(() => {
          validateField(fieldName, value, newData);
        }, 0);
      }
      
      return newData;
    });
    
    // Marquer comme touché
    if (markTouched && enableTouchedTracking) {
      setTouchedFields(prev => ({
        ...prev,
        [fieldName]: true
      }));
    }
    
    // Marquer comme modifié
    if (enableDirtyTracking) {
      setIsDirty(true);
    }
    
    // Déclencher l'auto-save
    if (enableAutoSave) {
      triggerAutoSave();
    }
  }, [validateOnChange, enableValidation, validateField, enableTouchedTracking, enableDirtyTracking, enableAutoSave]);
  
  // Gestion des changements par événement
  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    handleFieldChange(name, fieldValue);
  }, [handleFieldChange]);
  
  // Gestion du blur
  const handleFieldBlur = useCallback((fieldName) => {
    // Marquer comme touché
    if (enableTouchedTracking) {
      setTouchedFields(prev => ({
        ...prev,
        [fieldName]: true
      }));
    }
    
    // Validation si activée
    if (validateOnBlur && enableValidation) {
      validateField(fieldName, formData[fieldName], formData);
    }
  }, [enableTouchedTracking, validateOnBlur, enableValidation, validateField, formData]);
  
  // Auto-save avec debounce
  const triggerAutoSave = useCallback(() => {
    if (!enableAutoSave) return;
    
    // Annuler le timeout précédent
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    setAutoSaveStatus('saving');
    
    // Programmer la sauvegarde
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const processedData = processFormData(formData);
        
        if (entityId) {
          await update(entityId, processedData);
        } else {
          // Pour l'auto-save d'une nouvelle entité, on peut créer un brouillon
          console.log('🔄 Auto-save brouillon:', processedData);
          setAutoSaveStatus('saved');
        }
      } catch (error) {
        console.error('❌ Erreur auto-save:', error);
        setAutoSaveStatus('error');
      }
    }, autoSaveDelay);
  }, [enableAutoSave, autoSaveDelay, processFormData, formData, entityId, update]);
  
  // Soumission du formulaire
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    setIsSubmitting(true);
    
    try {
      // Validation complète
      if (enableValidation) {
        const validationResult = validateForm();
        if (!validationResult.isValid) {
          console.warn('⚠️ Formulaire invalide:', validationResult.errors);
          setIsSubmitting(false);
          return false;
        }
      }
      
      // Traitement des données
      const processedData = processFormData(formData);
      
      // Callback personnalisé de soumission
      if (onSubmit) {
        const result = await onSubmit(processedData, {
          isCreating: !entityId,
          isUpdating: !!entityId,
          originalData,
          formData,
          entityId
        });
        
        if (result === false) {
          setIsSubmitting(false);
          return false;
        }
      }
      
      // Action CRUD
      let result;
      if (entityId) {
        result = await update(entityId, processedData);
      } else {
        result = await create(processedData);
      }
      
      console.log(`✅ ${entityId ? 'Mise à jour' : 'Création'} réussie:`, result);
      return result;
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [enableValidation, validateForm, processFormData, formData, onSubmit, entityId, originalData, update, create]);
  
  // Réinitialisation du formulaire
  const handleReset = useCallback(() => {
    setFormData(originalData);
    setIsDirty(false);
    setTouchedFields({});
    setAutoSaveStatus('idle');
    clearErrors();
    
    // Annuler l'auto-save en cours
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    console.log('🔄 Formulaire réinitialisé');
  }, [originalData, clearErrors]);
  
  // Mise à jour des données initiales
  const updateInitialData = useCallback((newData) => {
    setFormData(newData);
    setOriginalData(newData);
    setIsDirty(false);
    setTouchedFields({});
    clearErrors();
  }, [clearErrors]);
  
  // Vérification si un champ est touché et a une erreur
  const getFieldState = useCallback((fieldName) => {
    return {
      value: formData[fieldName],
      error: validationErrors[fieldName],
      touched: touchedFields[fieldName],
      hasError: !!(touchedFields[fieldName] && validationErrors[fieldName]),
      isDirty: formData[fieldName] !== originalData[fieldName]
    };
  }, [formData, validationErrors, touchedFields, originalData]);
  
  // Nettoyage
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);
  
  // État de chargement global
  const loading = actionLoading || (entityId && !initialLoadRef.current);
  
  return {
    // Données
    formData,
    setFormData,
    originalData,
    
    // Actions principales
    handleSubmit,
    handleReset,
    handleFieldChange,
    handleInputChange,
    handleFieldBlur,
    updateInitialData,
    
    // États
    loading,
    error: actionError,
    isDirty,
    isValid,
    isSubmitting,
    touchedFields,
    
    // Validation
    validationErrors,
    validateField,
    validateForm,
    setFieldError,
    clearErrors,
    
    // Auto-save
    autoSaveStatus,
    triggerAutoSave,
    
    // Utilitaires
    getFieldState,
    isCreating: !entityId,
    isUpdating: !!entityId,
    
    // Métadonnées
    entityType,
    entityId,
    
    // Statistiques
    stats: {
      totalFields: Object.keys(formData).length,
      touchedFieldsCount: Object.keys(touchedFields).length,
      errorFieldsCount: Object.keys(validationErrors).length,
      completionRate: Object.keys(touchedFields).length / Object.keys(formData).length * 100
    }
  };
};

export default useGenericEntityForm; 