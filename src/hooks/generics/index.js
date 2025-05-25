/**
 * @fileoverview Index des hooks génériques
 * 
 * ✅ PHASE 2 COMPLÉTÉE - Nouveaux hooks génériques ajoutés ✅
 * 
 * Hooks génériques créés lors de la Phase 2 :
 * - useGenericEntityStatus : Gestion des statuts d'entités
 * - useGenericFieldActions : Actions de champs de formulaires
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation intelligente
 */

// Hooks de listes et données
export { default as useGenericEntityList } from './lists/useGenericEntityList';
export { default as useGenericCachedData } from './data/useGenericCachedData';
export { default as useGenericDataFetcher } from './data/useGenericDataFetcher';

// Hooks de formulaires
export { default as useGenericEntityForm } from './forms/useGenericEntityForm';

// Hooks de validation
export { default as useGenericValidation } from './validation/useGenericValidation';

// Hooks d'actions
export { default as useGenericFormAction } from './actions/useGenericFormAction';
export { default as useGenericFieldActions } from './actions/useGenericFieldActions'; // ✅ NOUVEAU Phase 2

// Hooks de statut
export { default as useGenericEntityStatus } from './status/useGenericEntityStatus'; // ✅ NOUVEAU Phase 2

/**
 * Configuration par défaut pour les hooks génériques
 */
export const GENERIC_HOOKS_CONFIG = {
  // Configuration des entités supportées
  SUPPORTED_ENTITIES: [
    'artiste', 'concert', 'lieu', 'programmateur', 
    'contrat', 'structure', 'entreprise', 'form'
  ],
  
  // Configuration des statuts par défaut
  DEFAULT_STATUS_CONFIG: {
    entityType: 'entity',
    allowBackwardTransitions: true,
    enableLogging: false,
    enableTransitionHistory: true
  },
  
  // Configuration des actions de champs par défaut
  DEFAULT_FIELD_ACTIONS_CONFIG: {
    entityType: 'form',
    enableHistory: true,
    enablePerformance: false,
    enableLogging: false,
    maxHistorySize: 50,
    validationDelay: 100
  },
  
  // Configuration de validation par défaut
  DEFAULT_VALIDATION_CONFIG: {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
    enableLogging: false
  }
};

/**
 * Utilitaires pour les hooks génériques
 */
export const GENERIC_HOOKS_UTILS = {
  /**
   * Créer une configuration de statut pour une entité
   */
  createStatusConfig: (entityType, statusMap, options = {}) => ({
    statusMap,
    entityType,
    allowBackwardTransitions: options.allowBackwardTransitions !== undefined ? options.allowBackwardTransitions : true,
    customTransitionRules: options.customTransitionRules || null,
    customMessageGenerator: options.customMessageGenerator || null
  }),
  
  /**
   * Créer une configuration d'actions de champs
   */
  createFieldActionsConfig: (entityType, validationRules, options = {}) => ({
    entityType,
    validationRules,
    onFieldChange: options.onFieldChange || null,
    onValidationComplete: options.onValidationComplete || null
  }),
  
  /**
   * Valider une configuration de hook générique
   */
  validateConfig: (config, requiredFields = []) => {
    const missing = requiredFields.filter(field => !config[field]);
    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  }
};
