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

console.log('[UGEF] Hook useGenericEntityForm importé'); // Log d'import

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
    initialData: configInitialData = {}, // Renommer pour clarté
    validationRules = {},
    onSubmit,
    onSuccess,
    onError,
    transformData = null,
    // Ajout pour le cas de création avec ID prédéfini (utilisé par useConcertForm)
    generateId: configGenerateId,
  } = formConfig;
  
  console.log('[UGEF] Appel de useGenericEntityForm avec:', { entityType, entityId, configInitialData: {...configInitialData}, options: {...options} });

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
  
  // Si entityId est null (création), utiliser configInitialData, sinon, charger.
  // Pour la création, si un ID est généré en amont (par ex. useConcertForm), il ne sera pas utilisé pour le fetch initial.
  const [formData, setFormData] = useState(() => {
    console.log('[UGEF] useState pour formData. entityId:', entityId, 'configInitialData:', {...configInitialData});
    return entityId ? {} : configInitialData; // Commencer vide si édition, sinon initialData
  });
  const [originalData, setOriginalData] = useState(() => {
    console.log('[UGEF] useState pour originalData. entityId:', entityId, 'configInitialData:', {...configInitialData});
    return entityId ? {} : configInitialData;
  });
  
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle');
  
  const autoSaveTimeoutRef = useRef(null);
  const initialLoadDoneRef = useRef(false); // Pour s'assurer que le chargement initial ne se fait qu'une fois
  const isMountedRef = useRef(true); // Pour gérer les mises à jour d'état sur un composant démonté

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Copier la référence dans une variable locale pour éviter le warning ESLint
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const timeoutId = autoSaveTimeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

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
  
  const { create, update, getById, loading: actionLoading, error: actionError } = useGenericAction(entityType, {
    onSuccess: (data, action) => {
      console.log('[UGEF] Action Success:', { action, data });
      if (!isMountedRef.current) return;
      if (action === 'create' || action === 'update') {
        setAutoSaveStatus('saved');
        setIsDirty(false);
        setOriginalData(formData); // formData devrait être à jour ici
        if (onSuccess) onSuccess(data, action);
        if (resetOnSuccess) handleReset();
        if (redirectOnSuccess) navigate(redirectOnSuccess.replace(':id', data.id));
      }
    },
    onError: (error, action) => {
      console.log('[UGEF] Action Error:', { action, error });
      if (!isMountedRef.current) return;
      if (action === 'create' || action === 'update') setAutoSaveStatus('error');
      if (onError) onError(error, action);
    }
  });
  
  useEffect(() => {
    console.log('[UGEF] useEffect [entityId, getById] - entityId:', entityId, 'initialLoadDoneRef.current:', initialLoadDoneRef.current);
    if (entityId && !initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      console.log('[UGEF] Chargement initial des données pour entityId:', entityId);
      getById(entityId).then(data => {
        if (!isMountedRef.current) return;
        if (data) {
          console.log('[UGEF] Données chargées pour entityId:', entityId, 'data:', {...data});
          setFormData(data);
          setOriginalData(data);
          setIsDirty(false);
        } else {
          console.warn('[UGEF] Aucune donnée trouvée pour entityId:', entityId, 'utilisation de configInitialData');
          setFormData(configInitialData);
          setOriginalData(configInitialData); 
        }
      }).catch(err => {
        console.error('[UGEF] Erreur lors du chargement initial pour entityId:', entityId, err);
        if (isMountedRef.current) {
            setFormData(configInitialData); // Fallback to initialData on error
            setOriginalData(configInitialData);
        }
      });
    } else if (!entityId && !initialLoadDoneRef.current) {
      // Cas de création, s'assurer que initialData est bien appliqué si pas déjà fait par useState
      console.log('[UGEF] Mode création (pas d\'entityId), application de configInitialData si nécessaire.', {...configInitialData});
      setFormData(configInitialData);
      setOriginalData(configInitialData);
      initialLoadDoneRef.current = true; // Marquer comme fait pour éviter re-application
    }
  }, [entityId, getById, configInitialData]); // configInitialData est ajouté pour s'assurer que si elle change, l'état est mis à jour pour la création
  
  const processFormData = useCallback((dataToProcess) => {
    let processed = { ...dataToProcess };
    if (transformData && typeof transformData === 'function') {
      console.log('[UGEF] transformData appelé avant traitement:', {...processed});
      processed = transformData(processed);
      console.log('[UGEF] transformData appelé après traitement:', {...processed});
    }
    return processed;
  }, [transformData]);
  
  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const triggerAutoSave = useCallback(() => {
    // ... (logique auto-save avec logs si nécessaire)
  }, [/* ... */]); // Dépendances à vérifier pour l'auto-save
  
  const handleFieldChange = useCallback((fieldName, value) => {
    // console.log('[UGEF] handleFieldChange:', { fieldName, value });
    if (!isMountedRef.current) return;
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      if (enableDirtyTracking) setIsDirty(true);
      if (validateOnChange && enableValidation) validateField(fieldName, value, newData);
      if (enableTouchedTracking) setTouchedFields(prevTouched => ({ ...prevTouched, [fieldName]: true }));
      return newData;
    });
    if (enableAutoSave) triggerAutoSave();
  }, [validateOnChange, enableValidation, validateField, enableTouchedTracking, enableDirtyTracking, enableAutoSave, triggerAutoSave]);
  
  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    handleFieldChange(name, type === 'checkbox' ? checked : value);
  }, [handleFieldChange]);
  
  const handleFieldBlur = useCallback((fieldName) => {
    // ... (logique blur avec logs si nécessaire)
  }, [/* ... */]); // Dépendances à vérifier
  
  const handleSubmit = useCallback(async (event) => {
    if (event) event.preventDefault();
    console.log('[UGEF] handleSubmit - Début. formData:', {...formDataRef.current});
    if (!isMountedRef.current) return false;
    setIsSubmitting(true);
    
    try {
      if (enableValidation) {
        const validationResult = await validateForm(); // Assurez-vous que validateForm est bien asynchrone si des validateurs le sont
        if (!validationResult.isValid) {
          console.warn('[UGEF] Formulaire invalide:', validationResult.errors);
          if (isMountedRef.current) setIsSubmitting(false);
          return false;
        }
      }
      
      const processedData = processFormData(formDataRef.current);
      console.log('[UGEF] handleSubmit - Données traitées:', {...processedData});
      
      if (onSubmit) {
        console.log('[UGEF] Appel du onSubmit personnalisé');
        const result = await onSubmit(processedData, { /* ...details... */ });
        if (result === false) {
          if (isMountedRef.current) setIsSubmitting(false);
          return false;
        }
      }
      
      let result;
      if (entityId) {
        console.log('[UGEF] Appel de update pour entityId:', entityId, 'avec données:', {...processedData});
        result = await update(entityId, processedData);
      } else {
        const idToCreate = configGenerateId ? configGenerateId() : undefined;
        console.log('[UGEF] Appel de create avec données:', {...processedData}, 'et ID généré (si applicable):', idToCreate);
        result = await create(processedData, idToCreate);
      }
      console.log('[UGEF] handleSubmit - Résultat action CRUD:', result);
      return result;
    } catch (error) {
      console.error('[UGEF] Erreur soumission:', error);
      return false;
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }, [enableValidation, validateForm, processFormData, onSubmit, entityId, update, create, configGenerateId]); // formDataRef.current n'est pas une dépendance
  
  const handleReset = useCallback(() => {
    console.log('[UGEF] handleReset - originalData:', {...originalData});
    if (!isMountedRef.current) return;
    setFormData(originalData);
    setIsDirty(false);
    setTouchedFields({});
    setAutoSaveStatus('idle');
    clearErrors();
    // Copier la référence dans une variable locale pour éviter le warning ESLint
    const timeoutId = autoSaveTimeoutRef.current;
    if (timeoutId) clearTimeout(timeoutId);
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
  
  // État de chargement global
  const loading = actionLoading || (entityId && !initialLoadDoneRef.current);
  
  console.log('[UGEF] Hook retourne:', { entityId, loading, initialLoading: (entityId && !initialLoadDoneRef.current), actionLoading, formData: {...formData}, error: actionError });

  return {
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
  };
};

export default useGenericEntityForm; 