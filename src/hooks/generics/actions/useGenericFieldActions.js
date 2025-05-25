/**
 * @fileoverview Hook générique pour les actions de champs de formulaires
 * Hook générique créé lors de la Phase 2 de généralisation - Approche intelligente
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation intelligente
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Hook générique pour les actions de champs de formulaires
 * 
 * @description
 * Fonctionnalités supportées :
 * - field_validation: Validation de champs avec tracking
 * - field_history: Historique des actions sur les champs
 * - field_performance: Métriques de performance de validation
 * - field_state: Gestion d'état avancée des champs
 * 
 * @param {Object} config - Configuration du hook
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {Function} returns.validateField - Valider un champ
 * @returns {Function} returns.copyFieldValue - Copier une valeur de champ
 * @returns {Function} returns.getFieldHistory - Obtenir l'historique d'un champ
 * @returns {Function} returns.getPerformanceStats - Obtenir les statistiques de performance
 * @returns {Function} returns.clearHistory - Effacer l'historique
 * @returns {Object} returns.fieldState - État actuel des champs
 * 
 * @example
 * ```javascript
 * const { 
 *   validateField, 
 *   copyFieldValue, 
 *   getPerformanceStats,
 *   fieldState 
 * } = useGenericFieldActions({
 *   entityType: 'concert',
 *   validationRules: {
 *     'contact.nom': { required: true, minLength: 2 },
 *     'contact.email': { required: true, type: 'email' }
 *   }
 * });
 * 
 * // Valider un champ
 * validateField('contact.nom', 'John Doe');
 * 
 * // Copier une valeur
 * copyFieldValue('contact.nom', formData.nom);
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical false
 * @generic true
 * @replaces useFieldActions, useFormFieldTracking
 */
const useGenericFieldActions = (config = {}, options = {}) => {
  const {
    entityType = 'entity',
    validationRules = {},
    onFieldChange = null,
    onValidationComplete = null
  } = config;
  
  const {
    enableHistory = true,
    enablePerformance = true,
    enableLogging = false,
    maxHistorySize = 50,
    validationDelay = 100
  } = options;
  
  // État des champs
  const [fieldState, setFieldState] = useState({
    values: {}, // Valeurs actuelles des champs
    validationStatus: {}, // Statut de validation par champ
    pendingActions: {}, // Actions en attente
    lastModified: {}, // Dernière modification par champ
    errors: {} // Erreurs de validation
  });
  
  // Historique et performance
  const [actionHistory, setActionHistory] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  
  // Références pour les timeouts
  const validationTimeouts = useRef({});
  
  // Fonction pour enregistrer une action dans l'historique
  const recordAction = useCallback((actionType, fieldPath, data = {}) => {
    if (!enableHistory) return null;
    
    const action = {
      type: actionType,
      fieldPath,
      timestamp: Date.now(),
      data,
      id: `${actionType}_${fieldPath}_${Date.now()}`,
      entityType
    };
    
    if (enableLogging) {
    }
    
    setActionHistory(prev => {
      const newHistory = [...prev, action];
      // Limiter la taille de l'historique
      return newHistory.slice(-maxHistorySize);
    });
    
    // Mettre à jour la dernière modification
    setFieldState(prev => ({
      ...prev,
      lastModified: {
        ...prev.lastModified,
        [fieldPath]: action.timestamp
      }
    }));
    
    return action;
  }, [enableHistory, enableLogging, entityType, maxHistorySize]);
  
  // Fonction pour marquer un champ comme en cours de validation
  const markFieldPending = useCallback((fieldPath) => {
    setFieldState(prev => ({
      ...prev,
      pendingActions: {
        ...prev.pendingActions,
        [fieldPath]: { 
          status: 'validating', 
          startTime: Date.now() 
        }
      },
      validationStatus: {
        ...prev.validationStatus,
        [fieldPath]: 'pending'
      }
    }));
    
    recordAction('validation_start', fieldPath);
  }, [recordAction]);
  
  // Fonction pour finaliser la validation d'un champ
  const finalizeFieldValidation = useCallback((fieldPath, isValid, errorMessage = null) => {
    const startTime = fieldState.pendingActions[fieldPath]?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;
    
    setFieldState(prev => ({
      ...prev,
      pendingActions: {
        ...prev.pendingActions,
        [fieldPath]: undefined
      },
      validationStatus: {
        ...prev.validationStatus,
        [fieldPath]: isValid ? 'valid' : 'invalid'
      },
      errors: {
        ...prev.errors,
        [fieldPath]: errorMessage
      }
    }));
    
    // Mettre à jour les métriques de performance
    if (enablePerformance) {
      setPerformanceMetrics(prev => {
        const fieldMetrics = prev[fieldPath] || {
          totalValidations: 0,
          totalDuration: 0,
          successCount: 0,
          errorCount: 0
        };
        
        return {
          ...prev,
          [fieldPath]: {
            totalValidations: fieldMetrics.totalValidations + 1,
            totalDuration: fieldMetrics.totalDuration + duration,
            successCount: fieldMetrics.successCount + (isValid ? 1 : 0),
            errorCount: fieldMetrics.errorCount + (isValid ? 0 : 1),
            lastValidationDuration: duration,
            avgValidationDuration: (fieldMetrics.totalDuration + duration) / (fieldMetrics.totalValidations + 1),
            successRate: ((fieldMetrics.successCount + (isValid ? 1 : 0)) / (fieldMetrics.totalValidations + 1)) * 100
          }
        };
      });
    }
    
    // Enregistrer l'action
    recordAction('validation_complete', fieldPath, { 
      isValid, 
      errorMessage, 
      duration 
    });
    
    // Callback de validation terminée
    if (onValidationComplete) {
      onValidationComplete(fieldPath, isValid, errorMessage, duration);
    }
  }, [fieldState.pendingActions, enablePerformance, recordAction, onValidationComplete]);
  
  // Fonction de validation d'un champ
  const validateField = useCallback((fieldPath, value, immediate = false) => {
    if (enableLogging) {
    }
    
    // Annuler la validation précédente si elle existe
    if (validationTimeouts.current[fieldPath]) {
      clearTimeout(validationTimeouts.current[fieldPath]);
    }
    
    // Mettre à jour la valeur
    setFieldState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [fieldPath]: value
      }
    }));
    
    // Callback de changement de champ
    if (onFieldChange) {
      onFieldChange(fieldPath, value);
    }
    
    // Fonction de validation
    const performValidation = () => {
      markFieldPending(fieldPath);
      
      // Règles de validation pour ce champ
      const rules = validationRules[fieldPath];
      let isValid = true;
      let errorMessage = null;
      
      if (rules) {
        // Validation required
        if (rules.required && (!value || value.toString().trim() === '')) {
          isValid = false;
          errorMessage = rules.requiredMessage || 'Ce champ est requis';
        }
        
        // Validation minLength
        else if (rules.minLength && value && value.toString().length < rules.minLength) {
          isValid = false;
          errorMessage = rules.minLengthMessage || `Minimum ${rules.minLength} caractères`;
        }
        
        // Validation maxLength
        else if (rules.maxLength && value && value.toString().length > rules.maxLength) {
          isValid = false;
          errorMessage = rules.maxLengthMessage || `Maximum ${rules.maxLength} caractères`;
        }
        
        // Validation type
        else if (rules.type && value) {
          switch (rules.type) {
            case 'email':
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = rules.typeMessage || 'Format d\'email invalide';
              }
              break;
            case 'phone':
              const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
              if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = rules.typeMessage || 'Numéro de téléphone invalide';
              }
              break;
            default:
              // Type de validation non reconnu - ignorer silencieusement
              // ou utiliser une validation personnalisée si définie
              if (enableLogging) {
                console.warn(`[${entityType}FieldActions] Type de validation non reconnu: ${rules.type}`);
              }
              break;
          }
        }
        
        // Validation personnalisée
        if (isValid && rules.validate && typeof rules.validate === 'function') {
          try {
            const customResult = rules.validate(value, fieldState.values);
            if (customResult !== true && customResult !== null && customResult !== undefined) {
              isValid = false;
              errorMessage = customResult;
            }
          } catch (error) {
            isValid = false;
            errorMessage = 'Erreur de validation';
          }
        }
      }
      
      finalizeFieldValidation(fieldPath, isValid, errorMessage);
    };
    
    // Validation immédiate ou avec délai
    if (immediate) {
      performValidation();
    } else {
      validationTimeouts.current[fieldPath] = setTimeout(performValidation, validationDelay);
    }
  }, [entityType, validationRules, onFieldChange, markFieldPending, finalizeFieldValidation, fieldState.values, enableLogging, validationDelay]);
  
  // Fonction pour copier une valeur de champ
  const copyFieldValue = useCallback((fieldPath, sourceValue) => {
    if (enableLogging) {
    }
    
    setFieldState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [fieldPath]: sourceValue
      },
      validationStatus: {
        ...prev.validationStatus,
        [fieldPath]: 'copied'
      },
      errors: {
        ...prev.errors,
        [fieldPath]: null
      }
    }));
    
    recordAction('value_copy', fieldPath, { sourceValue });
  }, [entityType, recordAction, enableLogging]);
  
  // Fonction pour obtenir l'historique d'un champ
  const getFieldHistory = useCallback((fieldPath = null) => {
    if (fieldPath) {
      return actionHistory.filter(action => action.fieldPath === fieldPath);
    }
    return actionHistory;
  }, [actionHistory]);
  
  // Fonction pour obtenir les statistiques de performance
  const getPerformanceStats = useCallback((fieldPath = null) => {
    if (fieldPath) {
      return performanceMetrics[fieldPath] || null;
    }
    
    // Statistiques globales
    const allMetrics = Object.values(performanceMetrics);
    if (allMetrics.length === 0) {
      return {
        totalFields: 0,
        avgValidationTime: 0,
        totalValidations: 0,
        overallSuccessRate: 0
      };
    }
    
    return {
      totalFields: allMetrics.length,
      avgValidationTime: allMetrics.reduce((sum, m) => sum + (m.avgValidationDuration || 0), 0) / allMetrics.length,
      totalValidations: allMetrics.reduce((sum, m) => sum + (m.totalValidations || 0), 0),
      overallSuccessRate: allMetrics.reduce((sum, m) => sum + (m.successRate || 0), 0) / allMetrics.length
    };
  }, [performanceMetrics]);
  
  // Fonction pour effacer l'historique
  const clearHistory = useCallback(() => {
    setActionHistory([]);
    setPerformanceMetrics({});
    setFieldState(prev => ({
      ...prev,
      validationStatus: {},
      pendingActions: {},
      lastModified: {},
      errors: {}
    }));
    
    if (enableLogging) {
    }
  }, [entityType, enableLogging]);
  
  // Fonction pour obtenir l'état d'un champ
  const getFieldState = useCallback((fieldPath) => {
    return {
      value: fieldState.values[fieldPath],
      status: fieldState.validationStatus[fieldPath],
      error: fieldState.errors[fieldPath],
      isPending: !!fieldState.pendingActions[fieldPath],
      lastModified: fieldState.lastModified[fieldPath],
      performance: performanceMetrics[fieldPath]
    };
  }, [fieldState, performanceMetrics]);
  
  return {
    // Actions principales
    validateField,
    copyFieldValue,
    
    // État et données
    fieldState,
    getFieldState,
    
    // Historique et performance
    getFieldHistory,
    getPerformanceStats,
    clearHistory,
    
    // Utilitaires
    markFieldPending,
    finalizeFieldValidation,
    recordAction,
    
    // Statistiques
    getTotalFields: () => Object.keys(fieldState.values).length,
    getPendingValidations: () => Object.keys(fieldState.pendingActions).length,
    getValidFields: () => Object.values(fieldState.validationStatus).filter(status => status === 'valid').length,
    getInvalidFields: () => Object.values(fieldState.validationStatus).filter(status => status === 'invalid').length
  };
};

export default useGenericFieldActions; 