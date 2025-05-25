/**
 * @fileoverview Hook générique pour les formulaires multi-étapes (wizard)
 * Hook générique créé lors de la Phase 2 de généralisation - Semaine 3
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation - Semaine 3
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import useGenericValidation from '../validation/useGenericValidation';

/**
 * Hook générique pour les formulaires multi-étapes (wizard)
 * 
 * @description
 * Fonctionnalités supportées :
 * - multi_step_navigation: Navigation entre étapes avec validation
 * - step_validation: Validation par étape
 * - progress_tracking: Suivi de progression
 * - conditional_steps: Étapes conditionnelles
 * 
 * @param {Object} wizardConfig - Configuration du wizard
 * @param {Array} wizardConfig.steps - Définition des étapes
 * @param {Object} wizardConfig.initialData - Données initiales
 * @param {Function} wizardConfig.onComplete - Callback de finalisation
 * @param {Function} wizardConfig.onStepChange - Callback de changement d'étape
 * 
 * @param {Object} options - Options additionnelles
 * @param {boolean} options.enableValidation - Activer la validation
 * @param {boolean} options.validateOnStepChange - Valider lors du changement d'étape
 * @param {boolean} options.allowSkipSteps - Permettre de sauter des étapes
 * @param {boolean} options.enablePersistence - Sauvegarder la progression
 * 
 * @returns {Object} Interface du hook générique
 * @returns {number} returns.currentStep - Étape actuelle (index)
 * @returns {Object} returns.currentStepData - Données de l'étape actuelle
 * @returns {Object} returns.formData - Données complètes du formulaire
 * @returns {Function} returns.nextStep - Aller à l'étape suivante
 * @returns {Function} returns.prevStep - Aller à l'étape précédente
 * @returns {Function} returns.goToStep - Aller à une étape spécifique
 * @returns {Function} returns.handleFieldChange - Gérer les changements de champs
 * @returns {Function} returns.completeWizard - Finaliser le wizard
 * @returns {boolean} returns.canGoNext - Peut aller à l'étape suivante
 * @returns {boolean} returns.canGoPrev - Peut aller à l'étape précédente
 * @returns {boolean} returns.isFirstStep - Est la première étape
 * @returns {boolean} returns.isLastStep - Est la dernière étape
 * @returns {number} returns.progress - Progression en pourcentage
 * 
 * @example
 * ```javascript
 * // Wizard simple
 * const {
 *   currentStep,
 *   currentStepData,
 *   formData,
 *   nextStep,
 *   prevStep,
 *   handleFieldChange,
 *   progress,
 *   isLastStep
 * } = useGenericFormWizard({
 *   steps: [
 *     {
 *       id: 'personal',
 *       title: 'Informations personnelles',
 *       fields: ['nom', 'prenom', 'email'],
 *       validationRules: {
 *         nom: { required: true },
 *         email: { required: true, type: 'email' }
 *       }
 *     },
 *     {
 *       id: 'company',
 *       title: 'Informations entreprise',
 *       fields: ['entreprise', 'poste'],
 *       condition: (data) => data.type === 'professionnel'
 *     }
 *   ],
 *   onComplete: (data) => console.log('Wizard terminé:', data)
 * });
 * 
 * // Wizard avec validation avancée
 * const wizard = useGenericFormWizard({
 *   steps: complexSteps,
 *   initialData: existingData
 * }, {
 *   enableValidation: true,
 *   validateOnStepChange: true,
 *   enablePersistence: true
 * });
 * ```
 * 
 * @complexity HIGH
 * @businessCritical true
 * @generic true
 * @replaces multi-step form implementations, wizard components
 */
const useGenericFormWizard = (wizardConfig = {}, options = {}) => {
  const {
    steps = [],
    initialData = {},
    onComplete,
    onStepChange,
    onStepValidation,
    persistenceKey = null
  } = wizardConfig;
  
  const {
    enableValidation = true,
    validateOnStepChange = true,
    allowSkipSteps = false,
    enablePersistence = false,
    enableConditionalSteps = true,
    enableStepHistory = true
  } = options;
  
  // États de base
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [stepHistory, setStepHistory] = useState([0]);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepErrors, setStepErrors] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Filtrer les étapes selon les conditions
  const visibleSteps = useMemo(() => {
    if (!enableConditionalSteps) return steps;
    
    return steps.filter(step => {
      if (!step.condition || typeof step.condition !== 'function') {
        return true;
      }
      return step.condition(formData);
    });
  }, [steps, formData, enableConditionalSteps]);
  
  // Données de l'étape actuelle
  const currentStepData = useMemo(() => {
    if (currentStep >= 0 && currentStep < visibleSteps.length) {
      return visibleSteps[currentStep];
    }
    return null;
  }, [currentStep, visibleSteps]);
  
  // Règles de validation pour l'étape actuelle
  const currentStepValidationRules = useMemo(() => {
    return currentStepData?.validationRules || {};
  }, [currentStepData]);
  
  // Hook de validation pour l'étape actuelle
  const {
    validationErrors,
    isValid: isCurrentStepValid,
    validateForm: validateCurrentStep,
    clearErrors
  } = useGenericValidation(formData, currentStepValidationRules, {
    enableValidation,
    validateOnChange: false // On valide manuellement
  });
  
  // Chargement de la progression sauvegardée
  useEffect(() => {
    if (enablePersistence && persistenceKey) {
      try {
        const saved = localStorage.getItem(`wizard_${persistenceKey}`);
        if (saved) {
          const { step, data, completed } = JSON.parse(saved);
          setCurrentStep(step || 0);
          setFormData(prev => ({ ...prev, ...data }));
          setCompletedSteps(new Set(completed || []));
        }
      } catch (error) {
        console.warn('⚠️ Erreur chargement progression wizard:', error);
      }
    }
  }, [enablePersistence, persistenceKey]);
  
  // Sauvegarde de la progression
  const saveProgress = useCallback(() => {
    if (enablePersistence && persistenceKey) {
      try {
        const progressData = {
          step: currentStep,
          data: formData,
          completed: Array.from(completedSteps)
        };
        localStorage.setItem(`wizard_${persistenceKey}`, JSON.stringify(progressData));
      } catch (error) {
        console.warn('⚠️ Erreur sauvegarde progression wizard:', error);
      }
    }
  }, [enablePersistence, persistenceKey, currentStep, formData, completedSteps]);
  
  // Validation d'une étape spécifique
  const validateStep = useCallback(async (stepIndex = currentStep) => {
    if (!enableValidation || stepIndex < 0 || stepIndex >= visibleSteps.length) {
      return { isValid: true, errors: {} };
    }
    
    const step = visibleSteps[stepIndex];
    if (!step.validationRules) {
      return { isValid: true, errors: {} };
    }
    
    // Créer un sous-ensemble des données pour cette étape
    const stepData = {};
    if (step.fields) {
      step.fields.forEach(field => {
        stepData[field] = formData[field];
      });
    } else {
      // Si pas de champs spécifiés, utiliser toutes les données
      Object.assign(stepData, formData);
    }
    
    // Validation avec les règles de l'étape
    const validationResult = await validateCurrentStep();
    
    // Mettre à jour les erreurs de l'étape
    setStepErrors(prev => ({
      ...prev,
      [stepIndex]: validationResult.errors
    }));
    
    // Callback de validation d'étape
    if (onStepValidation) {
      onStepValidation(stepIndex, validationResult, step);
    }
    
    return validationResult;
  }, [currentStep, visibleSteps, enableValidation, formData, validateCurrentStep, onStepValidation]);
  
  // Gestion des changements de champs
  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Effacer l'erreur du champ si elle existe
    if (validationErrors[fieldName]) {
      clearErrors(fieldName);
    }
    
    // Sauvegarder la progression
    saveProgress();
  }, [validationErrors, clearErrors, saveProgress]);
  
  // Navigation vers l'étape suivante
  const nextStep = useCallback(async () => {
    if (currentStep >= visibleSteps.length - 1) return false;
    
    // Validation de l'étape actuelle si activée
    if (validateOnStepChange) {
      const validation = await validateStep(currentStep);
      if (!validation.isValid) {
        console.warn('⚠️ Étape invalide, impossible de continuer');
        return false;
      }
    }
    
    // Marquer l'étape comme complétée
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    // Passer à l'étape suivante
    const nextStepIndex = currentStep + 1;
    setCurrentStep(nextStepIndex);
    
    // Ajouter à l'historique
    if (enableStepHistory) {
      setStepHistory(prev => [...prev, nextStepIndex]);
    }
    
    // Callback de changement d'étape
    if (onStepChange) {
      onStepChange(nextStepIndex, visibleSteps[nextStepIndex], 'next');
    }
    
    // Sauvegarder la progression
    saveProgress();
    
    return true;
  }, [currentStep, visibleSteps, validateOnStepChange, validateStep, enableStepHistory, onStepChange, saveProgress]);
  
  // Navigation vers l'étape précédente
  const prevStep = useCallback(() => {
    if (currentStep <= 0) return false;
    
    const prevStepIndex = currentStep - 1;
    setCurrentStep(prevStepIndex);
    
    // Mettre à jour l'historique
    if (enableStepHistory) {
      setStepHistory(prev => prev.slice(0, -1));
    }
    
    // Callback de changement d'étape
    if (onStepChange) {
      onStepChange(prevStepIndex, visibleSteps[prevStepIndex], 'prev');
    }
    
    // Sauvegarder la progression
    saveProgress();
    
    return true;
  }, [currentStep, enableStepHistory, onStepChange, visibleSteps, saveProgress]);
  
  // Navigation vers une étape spécifique
  const goToStep = useCallback(async (stepIndex) => {
    if (stepIndex < 0 || stepIndex >= visibleSteps.length) return false;
    
    // Vérifier si on peut aller à cette étape
    if (!allowSkipSteps && stepIndex > currentStep) {
      // Valider toutes les étapes intermédiaires
      for (let i = currentStep; i < stepIndex; i++) {
        const validation = await validateStep(i);
        if (!validation.isValid) {
          console.warn(`⚠️ Étape ${i} invalide, impossible d'aller à l'étape ${stepIndex}`);
          return false;
        }
        setCompletedSteps(prev => new Set(prev).add(i));
      }
    }
    
    setCurrentStep(stepIndex);
    
    // Mettre à jour l'historique
    if (enableStepHistory) {
      setStepHistory(prev => [...prev, stepIndex]);
    }
    
    // Callback de changement d'étape
    if (onStepChange) {
      onStepChange(stepIndex, visibleSteps[stepIndex], 'goto');
    }
    
    // Sauvegarder la progression
    saveProgress();
    
    return true;
  }, [visibleSteps, allowSkipSteps, currentStep, validateStep, enableStepHistory, onStepChange, saveProgress]);
  
  // Finalisation du wizard
  const completeWizard = useCallback(async () => {
    setIsCompleting(true);
    
    try {
      // Valider toutes les étapes
      if (enableValidation) {
        for (let i = 0; i < visibleSteps.length; i++) {
          const validation = await validateStep(i);
          if (!validation.isValid) {
            console.warn(`⚠️ Étape ${i} invalide, impossible de finaliser`);
            setIsCompleting(false);
            return false;
          }
        }
      }
      
      // Marquer toutes les étapes comme complétées
      setCompletedSteps(new Set(Array.from({ length: visibleSteps.length }, (_, i) => i)));
      
      // Callback de finalisation
      if (onComplete) {
        const result = await onComplete(formData, {
          steps: visibleSteps,
          completedSteps: Array.from(completedSteps),
          stepHistory
        });
        
        if (result === false) {
          setIsCompleting(false);
          return false;
        }
      }
      
      // Nettoyer la progression sauvegardée
      if (enablePersistence && persistenceKey) {
        localStorage.removeItem(`wizard_${persistenceKey}`);
      }
      
      console.log('✅ Wizard terminé avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur finalisation wizard:', error);
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [enableValidation, visibleSteps, validateStep, onComplete, formData, completedSteps, stepHistory, enablePersistence, persistenceKey]);
  
  // Réinitialisation du wizard
  const resetWizard = useCallback(() => {
    setCurrentStep(0);
    setFormData(initialData);
    setStepHistory([0]);
    setCompletedSteps(new Set());
    setStepErrors({});
    clearErrors();
    
    // Nettoyer la progression sauvegardée
    if (enablePersistence && persistenceKey) {
      localStorage.removeItem(`wizard_${persistenceKey}`);
    }
    
    console.log('🔄 Wizard réinitialisé');
  }, [initialData, clearErrors, enablePersistence, persistenceKey]);
  
  // États calculés
  const canGoNext = useMemo(() => {
    return currentStep < visibleSteps.length - 1;
  }, [currentStep, visibleSteps]);
  
  const canGoPrev = useMemo(() => {
    return currentStep > 0;
  }, [currentStep]);
  
  const isFirstStep = useMemo(() => {
    return currentStep === 0;
  }, [currentStep]);
  
  const isLastStep = useMemo(() => {
    return currentStep === visibleSteps.length - 1;
  }, [currentStep, visibleSteps]);
  
  const progress = useMemo(() => {
    if (visibleSteps.length === 0) return 0;
    return Math.round(((currentStep + 1) / visibleSteps.length) * 100);
  }, [currentStep, visibleSteps]);
  
  const completionRate = useMemo(() => {
    if (visibleSteps.length === 0) return 0;
    return Math.round((completedSteps.size / visibleSteps.length) * 100);
  }, [completedSteps, visibleSteps]);
  
  return {
    // Navigation
    currentStep,
    currentStepData,
    nextStep,
    prevStep,
    goToStep,
    completeWizard,
    resetWizard,
    
    // Données
    formData,
    setFormData,
    handleFieldChange,
    
    // États
    canGoNext,
    canGoPrev,
    isFirstStep,
    isLastStep,
    isCompleting,
    
    // Validation
    validationErrors,
    isCurrentStepValid,
    stepErrors,
    validateStep,
    
    // Progression
    progress,
    completionRate,
    completedSteps: Array.from(completedSteps),
    stepHistory,
    
    // Configuration
    steps: visibleSteps,
    totalSteps: visibleSteps.length,
    
    // Utilitaires
    isStepCompleted: (stepIndex) => completedSteps.has(stepIndex),
    isStepAccessible: (stepIndex) => allowSkipSteps || stepIndex <= Math.max(...Array.from(completedSteps)) + 1,
    getStepError: (stepIndex) => stepErrors[stepIndex],
    
    // Statistiques
    stats: {
      totalSteps: visibleSteps.length,
      completedSteps: completedSteps.size,
      currentStepIndex: currentStep,
      stepsRemaining: visibleSteps.length - currentStep - 1,
      progressPercentage: progress,
      completionPercentage: completionRate
    }
  };
};

export default useGenericFormWizard; 