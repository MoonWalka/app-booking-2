/**
 * @fileoverview Index des hooks génériques
 * 
 * ✅ PHASE 3 COMPLÉTÉE - Hooks utilitaires génériques ajoutés ✅
 * 
 * Hooks génériques créés lors de la Phase 3 :
 * - useGenericResponsive : Gestion responsive avancée
 * - useGenericSearch : Recherche unifiée (adresses, entreprises, entités)
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 3 - Optimisation et adoption généralisée
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
export { default as useGenericFieldActions } from './actions/useGenericFieldActions'; // ✅ Phase 2

// Hooks de statut
export { default as useGenericEntityStatus } from './status/useGenericEntityStatus'; // ✅ Phase 2

// Hooks de recherche
export { default as useGenericSearch } from './search/useGenericSearch'; // ✅ NOUVEAU Phase 3

// Hooks utilitaires
export { default as useGenericResponsive } from './utils/useGenericResponsive'; // ✅ NOUVEAU Phase 3

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
  },
  
  // Configuration responsive par défaut (Phase 3)
  DEFAULT_RESPONSIVE_CONFIG: {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
      wide: 1440
    },
    enableOrientation: true,
    enableDeviceDetection: false,
    debounceDelay: 150
  },
  
  // Configuration de recherche par défaut (Phase 3)
  DEFAULT_SEARCH_CONFIG: {
    debounceDelay: 500,
    minSearchLength: 2,
    maxResults: 10,
    enableCache: true,
    enableClickOutside: true,
    enableKeyboardNavigation: true
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
   * Créer une configuration responsive
   */
  createResponsiveConfig: (breakpoints, options = {}) => ({
    breakpoints: { ...GENERIC_HOOKS_CONFIG.DEFAULT_RESPONSIVE_CONFIG.breakpoints, ...breakpoints },
    enableOrientation: options.enableOrientation !== undefined ? options.enableOrientation : true,
    enableDeviceDetection: options.enableDeviceDetection || false,
    onBreakpointChange: options.onBreakpointChange || null,
    onOrientationChange: options.onOrientationChange || null
  }),
  
  /**
   * Créer une configuration de recherche
   */
  createSearchConfig: (searchType, searchFunction, options = {}) => ({
    searchType,
    searchFunction,
    searchFields: options.searchFields || ['name'],
    formatResult: options.formatResult || ((item) => item),
    validateResult: options.validateResult || ((item) => true),
    onResultSelect: options.onResultSelect || null,
    onSearchComplete: options.onSearchComplete || null
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
