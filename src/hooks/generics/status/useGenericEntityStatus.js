/**
 * @fileoverview Hook générique pour la gestion des statuts d'entités
 * Hook générique créé lors de la Phase 2 de généralisation - Approche intelligente
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Généralisation intelligente
 */

import { useMemo, useCallback } from 'react';

/**
 * Hook générique pour la gestion des statuts d'entités
 * 
 * @description
 * Fonctionnalités supportées :
 * - status_mapping: Configuration des statuts avec icônes, libellés, variants
 * - status_transitions: Validation des transitions de statuts
 * - status_messages: Messages contextuels basés sur l'état de l'entité
 * - status_actions: Actions recommandées selon le statut
 * 
 * @param {Object} statusConfig - Configuration des statuts
 * @param {Object} options - Options additionnelles
 * 
 * @returns {Object} Interface du hook générique
 * @returns {Object} returns.statusDetailsMap - Mapping complet des statuts
 * @returns {Function} returns.getStatusDetails - Obtenir les détails d'un statut
 * @returns {Function} returns.getStatusMessage - Obtenir un message contextuel
 * @returns {Function} returns.isStatusChangeAllowed - Vérifier si une transition est autorisée
 * @returns {Function} returns.getNextStatuses - Obtenir les statuts suivants possibles
 * @returns {Function} returns.getStatusProgress - Calculer le pourcentage de progression
 * 
 * @example
 * ```javascript
 * // Configuration pour les concerts
 * const concertStatusConfig = {
 *   contact: { icon: '📞', label: 'Contact établi', variant: 'info', step: 1 },
 *   preaccord: { icon: '✅', label: 'Pré-accord', variant: 'primary', step: 2 },
 *   contrat: { icon: '📄', label: 'Contrat signé', variant: 'success', step: 3 },
 *   annule: { icon: '❌', label: 'Annulé', variant: 'danger', step: 0 }
 * };
 * 
 * const { getStatusDetails, isStatusChangeAllowed } = useGenericEntityStatus({
 *   statusMap: concertStatusConfig,
 *   entityType: 'concert'
 * });
 * 
 * // Configuration pour les contrats
 * const contratStatusConfig = {
 *   draft: { icon: '📝', label: 'Brouillon', variant: 'secondary', step: 1 },
 *   sent: { icon: '📤', label: 'Envoyé', variant: 'info', step: 2 },
 *   signed: { icon: '✍️', label: 'Signé', variant: 'success', step: 3 }
 * };
 * ```
 * 
 * @complexity MEDIUM
 * @businessCritical true
 * @generic true
 * @replaces useDateStatus, useContratStatus, useArtisteStatus
 */
const useGenericEntityStatus = (statusConfig = {}, options = {}) => {
  const {
    statusMap = {},
    entityType = 'entity',
    allowBackwardTransitions = true,
    customTransitionRules = null,
    customMessageGenerator = null
  } = statusConfig;
  
  const {
    enableLogging = false
  } = options;
  
  // Mapping des détails de statut mémorisé
  const statusDetailsMap = useMemo(() => {
    // Ajouter des valeurs par défaut si nécessaire
    const enrichedMap = {};
    
    Object.keys(statusMap).forEach(statusKey => {
      const status = statusMap[statusKey];
      enrichedMap[statusKey] = {
        icon: status.icon || '❓',
        label: status.label || statusKey,
        variant: status.variant || 'light',
        tooltip: status.tooltip || status.label || statusKey,
        step: status.step !== undefined ? status.step : 999,
        color: status.color || null,
        description: status.description || null,
        category: status.category || 'default',
        ...status // Préserver les propriétés personnalisées
      };
    });
    
    return enrichedMap;
  }, [statusMap]);
  
  // Fonction pour obtenir les détails d'un statut
  const getStatusDetails = useCallback((status) => {
    if (enableLogging) {
    }
    
    return statusDetailsMap[status] || {
      icon: '❓',
      label: status || 'Non défini',
      variant: 'light',
      tooltip: 'Statut non défini',
      step: 0,
      category: 'unknown'
    };
  }, [statusDetailsMap, enableLogging]);
  
  // Fonction pour vérifier si un changement de statut est autorisé
  const isStatusChangeAllowed = useCallback((currentStatus, targetStatus) => {
    if (enableLogging) {
    }
    
    // Règles personnalisées si fournies
    if (customTransitionRules && typeof customTransitionRules === 'function') {
      return customTransitionRules(currentStatus, targetStatus, statusDetailsMap);
    }
    
    const currentDetails = getStatusDetails(currentStatus);
    const targetDetails = getStatusDetails(targetStatus);
    
    // Règles par défaut
    // 1. Statuts d'annulation/suppression généralement autorisés depuis n'importe où
    if (targetDetails.category === 'cancel' || targetDetails.category === 'delete') {
      return true;
    }
    
    // 2. Transitions vers le même statut autorisées
    if (currentStatus === targetStatus) {
      return true;
    }
    
    // 3. Transitions arrière autorisées si configuré
    if (allowBackwardTransitions) {
      return true;
    }
    
    // 4. Transitions progressives (step suivant ou même step)
    return targetDetails.step <= currentDetails.step + 1;
  }, [statusDetailsMap, getStatusDetails, customTransitionRules, allowBackwardTransitions, enableLogging]);
  
  // Fonction pour obtenir les statuts suivants possibles
  const getNextStatuses = useCallback((currentStatus) => {
    const possibleStatuses = [];
    
    Object.keys(statusDetailsMap).forEach(statusKey => {
      if (isStatusChangeAllowed(currentStatus, statusKey) && statusKey !== currentStatus) {
        possibleStatuses.push({
          key: statusKey,
          ...getStatusDetails(statusKey)
        });
      }
    });
    
    // Trier par step
    return possibleStatuses.sort((a, b) => a.step - b.step);
  }, [statusDetailsMap, isStatusChangeAllowed, getStatusDetails]);
  
  // Fonction pour calculer le pourcentage de progression
  const getStatusProgress = useCallback((currentStatus) => {
    const currentDetails = getStatusDetails(currentStatus);
    const maxStep = Math.max(...Object.values(statusDetailsMap).map(s => s.step));
    
    if (maxStep === 0) return 0;
    
    return Math.round((currentDetails.step / maxStep) * 100);
  }, [statusDetailsMap, getStatusDetails]);
  
  // Fonction pour obtenir un message contextuel
  const getStatusMessage = useCallback((entity, context = {}) => {
    if (enableLogging) {
    }
    
    // Générateur de message personnalisé si fourni
    if (customMessageGenerator && typeof customMessageGenerator === 'function') {
      return customMessageGenerator(entity, context, statusDetailsMap);
    }
    
    // Générateur par défaut
    const status = entity?.status || entity?.statut;
    if (!status) {
      return { 
        message: 'Statut non défini', 
        action: 'define_status', 
        variant: 'warning' 
      };
    }
    
    const statusDetails = getStatusDetails(status);
    
    return {
      message: statusDetails.label,
      action: `action_${status}`,
      variant: statusDetails.variant,
      tooltip: statusDetails.tooltip,
      progress: getStatusProgress(status)
    };
  }, [statusDetailsMap, getStatusDetails, getStatusProgress, customMessageGenerator, enableLogging]);
  
  // Fonction pour obtenir les statuts par catégorie
  const getStatusesByCategory = useCallback((category = null) => {
    if (!category) {
      // Retourner toutes les catégories
      const categories = {};
      Object.entries(statusDetailsMap).forEach(([key, details]) => {
        const cat = details.category || 'default';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ key, ...details });
      });
      return categories;
    }
    
    // Retourner une catégorie spécifique
    return Object.entries(statusDetailsMap)
      .filter(([, details]) => details.category === category)
      .map(([key, details]) => ({ key, ...details }));
  }, [statusDetailsMap]);
  
  // Fonction pour valider la configuration des statuts
  const validateStatusConfig = useCallback(() => {
    const issues = [];
    
    // Vérifier les steps dupliqués
    const steps = Object.values(statusDetailsMap).map(s => s.step);
    const duplicateSteps = steps.filter((step, index) => steps.indexOf(step) !== index);
    if (duplicateSteps.length > 0) {
      issues.push(`Steps dupliqués détectés: ${duplicateSteps.join(', ')}`);
    }
    
    // Vérifier les variants valides
    const validVariants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    Object.entries(statusDetailsMap).forEach(([key, details]) => {
      if (!validVariants.includes(details.variant)) {
        issues.push(`Variant invalide pour ${key}: ${details.variant}`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }, [statusDetailsMap]);
  
  return {
    // Configuration
    statusDetailsMap,
    entityType,
    
    // Fonctions principales
    getStatusDetails,
    getStatusMessage,
    isStatusChangeAllowed,
    getNextStatuses,
    getStatusProgress,
    
    // Fonctions utilitaires
    getStatusesByCategory,
    validateStatusConfig,
    
    // Statistiques
    getTotalStatuses: () => Object.keys(statusDetailsMap).length,
    getMaxStep: () => Math.max(...Object.values(statusDetailsMap).map(s => s.step))
  };
};

export default useGenericEntityStatus; 