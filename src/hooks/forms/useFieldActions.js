import { useState } from 'react';

const useFieldActions = (validatedFields, setValidatedFields) => {
  // NOUVEAU: État local pour les actions de champs - Finalisation intelligente
  const [fieldActions, setFieldActions] = useState({
    history: [], // Historique des actions
    pendingActions: {}, // Actions en attente
    validationStatus: {}, // Statut de validation par champ
    lastModified: {}, // Dernière modification par champ
    performance: {} // Métriques de performance
  });

  // NOUVEAU: Fonction pour enregistrer une action
  const recordAction = (actionType, fieldPath, data = {}) => {
    const action = {
      type: actionType,
      fieldPath,
      timestamp: Date.now(),
      data,
      id: `${actionType}_${fieldPath}_${Date.now()}`
    };

    setFieldActions(prev => ({
      ...prev,
      history: [...prev.history.slice(-49), action], // Garder 50 dernières actions
      lastModified: {
        ...prev.lastModified,
        [fieldPath]: action.timestamp
      }
    }));

    return action;
  };

  // NOUVEAU: Fonction pour marquer un champ comme en cours de validation
  const markFieldPending = (fieldPath) => {
    setFieldActions(prev => ({
      ...prev,
      pendingActions: {
        ...prev.pendingActions,
        [fieldPath]: { status: 'validating', startTime: Date.now() }
      },
      validationStatus: {
        ...prev.validationStatus,
        [fieldPath]: 'pending'
      }
    }));
  };

  // NOUVEAU: Fonction pour finaliser la validation d'un champ
  const finalizeFieldValidation = (fieldPath, isValid, errorMessage = null) => {
    const startTime = fieldActions.pendingActions[fieldPath]?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;

    setFieldActions(prev => ({
      ...prev,
      pendingActions: {
        ...prev.pendingActions,
        [fieldPath]: undefined
      },
      validationStatus: {
        ...prev.validationStatus,
        [fieldPath]: isValid ? 'valid' : 'invalid'
      },
      performance: {
        ...prev.performance,
        [fieldPath]: {
          lastValidationDuration: duration,
          totalValidations: (prev.performance[fieldPath]?.totalValidations || 0) + 1,
          successRate: isValid 
            ? ((prev.performance[fieldPath]?.successRate || 0) * (prev.performance[fieldPath]?.totalValidations || 0) + 1) / ((prev.performance[fieldPath]?.totalValidations || 0) + 1)
            : ((prev.performance[fieldPath]?.successRate || 0) * (prev.performance[fieldPath]?.totalValidations || 0)) / ((prev.performance[fieldPath]?.totalValidations || 0) + 1)
        }
      }
    }));

    // Enregistrer l'action
    recordAction('validation_complete', fieldPath, { 
      isValid, 
      errorMessage, 
      duration 
    });
  };

  // Gérer la validation d'un champ spécifique - AMÉLIORÉ avec tracking
  const handleValidateField = (category, fieldName, value) => {
    // Créer un objet qui représente le chemin complet du champ
    // Par exemple: contact.nom, structure.raisonSociale, lieu.adresse, etc.
    const fieldPath = `${category}.${fieldName}`;
    
    // NOUVEAU: Marquer comme en cours de validation
    markFieldPending(fieldPath);
    
    // Enregistrer l'action de validation
    recordAction('field_validate', fieldPath, { value, category, fieldName });
    
    // Mettre à jour l'état local des champs validés
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: value
    }));

    // NOUVEAU: Simuler validation et finaliser
    setTimeout(() => {
      const isValid = value && value.toString().trim().length > 0;
      finalizeFieldValidation(fieldPath, isValid, isValid ? null : 'Valeur requise');
    }, 100);
  };

  // Copier la valeur du formulaire vers la valeur finale - AMÉLIORÉ avec tracking
  const copyFormValueToFinal = (fieldPath, formValue) => {
    // Enregistrer l'action de copie
    recordAction('value_copy', fieldPath, { formValue });
    
    setValidatedFields(prev => ({
      ...prev,
      [fieldPath]: formValue
    }));

    // NOUVEAU: Marquer comme valide après copie
    setFieldActions(prev => ({
      ...prev,
      validationStatus: {
        ...prev.validationStatus,
        [fieldPath]: 'copied'
      }
    }));
  };

  // NOUVEAU: Fonction pour obtenir l'historique des actions
  const getActionHistory = (fieldPath = null) => {
    if (fieldPath) {
      return fieldActions.history.filter(action => action.fieldPath === fieldPath);
    }
    return fieldActions.history;
  };

  // NOUVEAU: Fonction pour obtenir les statistiques de performance
  const getPerformanceStats = () => {
    const stats = {
      totalFields: Object.keys(fieldActions.performance).length,
      avgValidationTime: 0,
      totalValidations: 0,
      overallSuccessRate: 0
    };

    const performances = Object.values(fieldActions.performance);
    if (performances.length > 0) {
      stats.avgValidationTime = performances.reduce((sum, p) => sum + (p.lastValidationDuration || 0), 0) / performances.length;
      stats.totalValidations = performances.reduce((sum, p) => sum + (p.totalValidations || 0), 0);
      stats.overallSuccessRate = performances.reduce((sum, p) => sum + (p.successRate || 0), 0) / performances.length;
    }

    return stats;
  };

  // NOUVEAU: Fonction pour réinitialiser l'historique
  const clearHistory = () => {
    setFieldActions(prev => ({
      ...prev,
      history: [],
      pendingActions: {},
      validationStatus: {},
      lastModified: {},
      performance: {}
    }));
  };

  return {
    handleValidateField,
    copyFormValueToFinal,
    // NOUVEAU: Fonctions étendues avec état local
    fieldActions,
    getActionHistory,
    getPerformanceStats,
    clearHistory,
    markFieldPending,
    finalizeFieldValidation,
    recordAction
  };
};

export default useFieldActions;
