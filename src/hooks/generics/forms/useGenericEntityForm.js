/**
 * @fileoverview Hook générique pour les formulaires d'entités - VERSION ROBUSTE
 * Version refactorisée pour éliminer les boucles infinies et optimiser les performances
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 3 - Refactor Robuste
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGenericAction from '../actions/useGenericAction';
import useGenericValidation from '../validation/useGenericValidation';

/**
 * Hook générique pour les formulaires d'entités - VERSION ROBUSTE
 * 
 * ✅ CORRECTIONS APPLIQUÉES :
 * - Stabilisation de toutes les dépendances avec useRef
 * - Simplification de la logique d'état initial
 * - Élimination des objets instables dans les dépendances
 * - Mémoïsation des callbacks critiques
 * - Réduction des logs pour éviter les effets de bord
 * 
 * @param {Object} formConfig - Configuration du formulaire
 * @param {Object} options - Options additionnelles
 * @returns {Object} Interface du hook générique
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
    transformData = null,
    generateId: configGenerateId,
  } = formConfig;

  const {
    enableAutoSave = false,
    enableValidation = true,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSuccess = false,
    redirectOnSuccess = null,
    enableDirtyTracking = true,
    enableTouchedTracking = true
  } = options;
  
  const navigate = useNavigate();
  
  // ✅ CORRECTION 1: Stabilisation des données initiales avec useMemo
  const stableInitialData = useMemo(() => ({ ...initialData }), [initialData]);
  
  // ✅ CORRECTION 2: État initial simplifié
  const [formData, setFormData] = useState(() => entityId ? {} : stableInitialData);
  const [originalData, setOriginalData] = useState(() => entityId ? {} : stableInitialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  
  // ✅ CORRECTION 3: Références stables pour éviter les dépendances circulaires
  const autoSaveTimeoutRef = useRef(null);
  const initialLoadDoneRef = useRef(false);
  const isMountedRef = useRef(true);
  const onSubmitRef = useRef(onSubmit);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const transformDataRef = useRef(transformData);
  
  // ✅ CORRECTION 4: Mise à jour des références sans déclencher de re-renders
  onSubmitRef.current = onSubmit;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  transformDataRef.current = transformData;

  // ✅ CORRECTION 5: Nettoyage simplifié
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const timeoutId = autoSaveTimeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // ✅ CORRECTION 6: Validation avec dépendances stables
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
  
  // ✅ CORRECTION 7: Références stables pour les callbacks de validation
  const validateFieldRef = useRef(validateField);
  const validateFormRef = useRef(validateForm);
  const clearErrorsRef = useRef(clearErrors);
  
  validateFieldRef.current = validateField;
  validateFormRef.current = validateForm;
  clearErrorsRef.current = clearErrors;

  // ✅ CORRECTION 8: Action hook avec callbacks stabilisés
  const { create, update, getById, loading: actionLoading, error: actionError } = useGenericAction(entityType, {
    onSuccess: (data, action) => {
      if (!isMountedRef.current) return;
      if (action === 'create' || action === 'update') {
        setAutoSaveStatus('saved');
        setIsDirty(false);
        setOriginalData(formData);
        if (onSuccessRef.current) onSuccessRef.current(data, action);
        if (resetOnSuccess) handleResetRef.current();
        if (redirectOnSuccess) navigate(redirectOnSuccess.replace(':id', data.id));
      }
    },
    onError: (error, action) => {
      if (!isMountedRef.current) return;
      if (action === 'create' || action === 'update') setAutoSaveStatus('error');
      if (onErrorRef.current) onErrorRef.current(error, action);
    }
  });
  
  // ✅ CORRECTION 9: Références stables pour les actions
  const createRef = useRef(create);
  const updateRef = useRef(update);
  const getByIdRef = useRef(getById);
  
  createRef.current = create;
  updateRef.current = update;
  getByIdRef.current = getById;

  // ✅ CORRECTION 10: Chargement initial avec dépendances stables
  useEffect(() => {
    if (entityId && !initialLoadDoneRef.current && getByIdRef.current) {
      initialLoadDoneRef.current = true;
      getByIdRef.current(entityId).then(data => {
        if (!isMountedRef.current) return;
        if (data) {
          setFormData(data);
          setOriginalData(data);
          setIsDirty(false);
        } else {
          setFormData(stableInitialData);
          setOriginalData(stableInitialData); 
        }
      }).catch(err => {
        console.error('[UGEF] Erreur chargement:', err);
        if (isMountedRef.current) {
          setFormData(stableInitialData);
          setOriginalData(stableInitialData);
        }
      });
    } else if (!entityId && !initialLoadDoneRef.current) {
      setFormData(stableInitialData);
      setOriginalData(stableInitialData);
      initialLoadDoneRef.current = true;
    }
  }, [entityId, stableInitialData]); // Dépendances stables uniquement
  
  // ✅ CORRECTION 11: Fonction de traitement des données stabilisée
  const processFormData = useCallback((dataToProcess) => {
    let processed = { ...dataToProcess };
    if (transformDataRef.current && typeof transformDataRef.current === 'function') {
      processed = transformDataRef.current(processed);
    }
    return processed;
  }, []); // Pas de dépendances car on utilise la ref
  
  // ✅ CORRECTION 12: Auto-save simplifié
  const triggerAutoSave = useCallback(() => {
    if (!enableAutoSave || !isMountedRef.current) return;
    
    const timeoutId = autoSaveTimeoutRef.current;
    if (timeoutId) clearTimeout(timeoutId);
    
    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;
      setAutoSaveStatus('saving');
      try {
        const processedData = processFormData(formData);
        if (entityId && updateRef.current) {
          await updateRef.current(entityId, processedData);
        }
      } catch (error) {
        console.error('[UGEF] Auto-save error:', error);
        setAutoSaveStatus('error');
      }
    }, 3000);
  }, [enableAutoSave, entityId, formData, processFormData]);
  
  // ✅ CORRECTION 13: Changement de champ stabilisé
  const handleFieldChange = useCallback((fieldName, value) => {
    if (!isMountedRef.current) return;
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      if (enableDirtyTracking) setIsDirty(true);
      if (validateOnChange && enableValidation && validateFieldRef.current) {
        validateFieldRef.current(fieldName, value, newData);
      }
      if (enableTouchedTracking) {
        setTouchedFields(prevTouched => ({ ...prevTouched, [fieldName]: true }));
      }
      return newData;
    });
    if (enableAutoSave) triggerAutoSave();
  }, [validateOnChange, enableValidation, enableTouchedTracking, enableDirtyTracking, enableAutoSave, triggerAutoSave]);
  
  // ✅ CORRECTION 14: Changement d'input stabilisé
  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    handleFieldChange(name, type === 'checkbox' ? checked : value);
  }, [handleFieldChange]);
  
  // ✅ CORRECTION 15: Blur handler stabilisé
  const handleFieldBlur = useCallback((fieldName) => {
    if (validateOnBlur && enableValidation && validateFieldRef.current) {
      validateFieldRef.current(fieldName, formData[fieldName], formData);
    }
  }, [validateOnBlur, enableValidation, formData]);
  
  // ✅ CORRECTION 16: Soumission stabilisée
  const handleSubmit = useCallback(async (event) => {
    if (event) event.preventDefault();
    if (!isMountedRef.current) return false;
    setIsSubmitting(true);
    
    try {
      if (enableValidation && validateFormRef.current) {
        const validationResult = await validateFormRef.current();
        if (!validationResult.isValid) {
          if (isMountedRef.current) setIsSubmitting(false);
          return false;
        }
      }
      
      const processedData = processFormData(formData);
      
      if (onSubmitRef.current) {
        const result = await onSubmitRef.current(processedData);
        if (result === false) {
          if (isMountedRef.current) setIsSubmitting(false);
          return false;
        }
      }
      
      let result;
      if (entityId && updateRef.current) {
        result = await updateRef.current(entityId, processedData);
      } else if (createRef.current) {
        const idToCreate = configGenerateId ? configGenerateId() : undefined;
        result = await createRef.current(processedData, idToCreate);
      }
      return result;
    } catch (error) {
      console.error('[UGEF] Erreur soumission:', error);
      return false;
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }, [enableValidation, processFormData, formData, entityId, configGenerateId]);
  
  // ✅ CORRECTION 17: Reset stabilisé avec référence
  const handleReset = useCallback(() => {
    if (!isMountedRef.current) return;
    setFormData(originalData);
    setIsDirty(false);
    setTouchedFields({});
    setAutoSaveStatus('idle');
    if (clearErrorsRef.current) clearErrorsRef.current();
    const timeoutId = autoSaveTimeoutRef.current;
    if (timeoutId) clearTimeout(timeoutId);
  }, [originalData]);
  
  // ✅ CORRECTION 18: Référence stable pour handleReset
  const handleResetRef = useRef(handleReset);
  handleResetRef.current = handleReset;
  
  // ✅ CORRECTION 19: Mise à jour des données initiales stabilisée
  const updateInitialData = useCallback((newData) => {
    setFormData(newData);
    setOriginalData(newData);
    setIsDirty(false);
    setTouchedFields({});
    if (clearErrorsRef.current) clearErrorsRef.current();
  }, []);
  
  // ✅ CORRECTION 20: État de champ stabilisé
  const getFieldState = useCallback((fieldName) => {
    return {
      value: formData[fieldName],
      error: validationErrors[fieldName],
      touched: touchedFields[fieldName],
      hasError: !!(touchedFields[fieldName] && validationErrors[fieldName]),
      isDirty: formData[fieldName] !== originalData[fieldName]
    };
  }, [formData, validationErrors, touchedFields, originalData]);
  
  // ✅ CORRECTION 21: État de chargement simplifié
  const loading = actionLoading || (entityId && !initialLoadDoneRef.current);

  // ✅ CORRECTION 22: Interface de retour stabilisée avec useMemo
  return useMemo(() => ({
    formData,
    setFormData,
    originalData,
    handleSubmit,
    handleReset,
    handleChange: handleInputChange,
    handleFieldChange,
    handleFieldBlur,
    updateInitialData,
    loading,
    error: actionError,
    isDirty,
    isValid,
    isSubmitting,
    touchedFields,
    validationErrors,
    validateField,
    validateForm,
    setFieldError,
    clearErrors,
    autoSaveStatus,
    triggerAutoSave,
    isCreating: !entityId,
    isUpdating: !!entityId,
    getFieldState,
    stats: {
      totalFields: Object.keys(formData).length,
      touchedFieldsCount: Object.keys(touchedFields).length,
      errorFieldsCount: Object.keys(validationErrors).length,
      completionRate: Object.keys(touchedFields).length / Object.keys(formData).length * 100
    },
    entityType,
    entityId,
  }), [
    formData,
    originalData,
    handleSubmit,
    handleReset,
    handleInputChange,
    handleFieldChange,
    handleFieldBlur,
    updateInitialData,
    loading,
    actionError,
    isDirty,
    isValid,
    isSubmitting,
    touchedFields,
    validationErrors,
    validateField,
    validateForm,
    setFieldError,
    clearErrors,
    autoSaveStatus,
    triggerAutoSave,
    entityId,
    getFieldState,
    entityType
  ]);
};

export default useGenericEntityForm; 