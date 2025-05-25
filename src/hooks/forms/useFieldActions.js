/**
 * @fileoverview Hook pour les actions de champs de formulaires
 * 
 * @deprecated Utilisez useGenericFieldActions directement pour les nouveaux développements
 * @migrationDate 2025-01-XX
 * @replaces Wrapper autour de useGenericFieldActions pour maintenir la compatibilité
 * 
 * Ce hook est maintenant un wrapper autour de useGenericFieldActions.
 * Il maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise la logique générique en arrière-plan.
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Migration vers hooks génériques
 */

import { useMemo } from 'react';
import useGenericFieldActions from '@/hooks/generics/actions/useGenericFieldActions';

/**
 * Hook migré pour les actions de champs de formulaires
 * 
 * @deprecated Utilisez useGenericFieldActions directement pour les nouveaux développements
 * 
 * Ce hook maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise useGenericFieldActions en arrière-plan pour bénéficier des améliorations.
 * 
 * @param {Object} config - Configuration du hook (optionnel)
 * @param {Object} options - Options additionnelles (optionnel)
 * @returns {Object} Interface du hook d'actions de champs
 * 
 * @example
 * ```javascript
 * // Utilisation existante (maintenue pour compatibilité)
 * const { validateField, copyFieldValue } = useFieldActions();
 * 
 * // RECOMMANDÉ pour nouveaux développements :
 * import useGenericFieldActions from '@/hooks/generics/actions/useGenericFieldActions';
 * const { validateField, copyFieldValue } = useGenericFieldActions({
 *   entityType: 'form',
 *   validationRules: { ... }
 * });
 * ```
 */
const useFieldActions = (config = {}, options = {}) => {
  // Configuration par défaut pour maintenir la compatibilité
  const fieldActionsConfig = useMemo(() => ({
    entityType: config.entityType || 'form',
    validationRules: config.validationRules || {
      // Règles de validation par défaut pour la compatibilité
      'nom': { required: true, minLength: 2 },
      'email': { required: true, type: 'email' },
      'telephone': { type: 'phone' },
      'description': { maxLength: 500 }
    },
    onFieldChange: config.onFieldChange || null,
    onValidationComplete: config.onValidationComplete || null
  }), [config]);
  
  // Options par défaut pour maintenir la compatibilité
  const fieldActionsOptions = useMemo(() => ({
    enableHistory: options.enableHistory !== undefined ? options.enableHistory : true,
    enablePerformance: options.enablePerformance !== undefined ? options.enablePerformance : false,
    enableLogging: options.enableLogging || false,
    maxHistorySize: options.maxHistorySize || 20,
    validationDelay: options.validationDelay || 300
  }), [options]);
  
  // Utiliser le hook générique avec la configuration des champs
  const genericHook = useGenericFieldActions(fieldActionsConfig, fieldActionsOptions);
  
  // Retourner l'interface compatible avec l'ancienne API
  return {
    // API existante maintenue
    validateField: genericHook.validateField,
    copyFieldValue: genericHook.copyFieldValue,
    fieldState: genericHook.fieldState,
    
    // Nouvelles fonctionnalités disponibles via le hook générique
    getFieldState: genericHook.getFieldState,
    getFieldHistory: genericHook.getFieldHistory,
    getPerformanceStats: genericHook.getPerformanceStats,
    clearHistory: genericHook.clearHistory,
    
    // Utilitaires
    markFieldPending: genericHook.markFieldPending,
    finalizeFieldValidation: genericHook.finalizeFieldValidation,
    recordAction: genericHook.recordAction,
    
    // Statistiques
    getTotalFields: genericHook.getTotalFields,
    getPendingValidations: genericHook.getPendingValidations,
    getValidFields: genericHook.getValidFields,
    getInvalidFields: genericHook.getInvalidFields,
    
    // Fonctions spécifiques aux champs (wrappers pour compatibilité)
    validateFormField: genericHook.validateField,
    copyFormFieldValue: genericHook.copyFieldValue,
    getFormFieldState: genericHook.getFieldState,
    
    // Informations de migration
    _migrationInfo: {
      isWrapper: true,
      originalHook: 'useFieldActions',
      genericHook: 'useGenericFieldActions',
      migrationDate: '2025-01-XX',
      phase: 'Phase 2'
    }
  };
};

export default useFieldActions;
