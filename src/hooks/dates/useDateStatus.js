/**
 * @fileoverview Hook pour la gestion des statuts de dates
 * 
 * @deprecated Utilisez useGenericEntityStatus directement pour les nouveaux développements
 * @migrationDate 2025-01-XX
 * @replaces Wrapper autour de useGenericEntityStatus pour maintenir la compatibilité
 * 
 * Ce hook est maintenant un wrapper autour de useGenericEntityStatus.
 * Il maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise la logique générique en arrière-plan.
 * 
 * @author TourCraft Team
 * @since 2024
 * @phase Phase 2 - Migration vers hooks génériques
 */

import { useMemo } from 'react';
import useGenericEntityStatus from '@/hooks/generics/status/useGenericEntityStatus';

/**
 * Hook migré pour la gestion des statuts de dates
 * 
 * @deprecated Utilisez useGenericEntityStatus directement pour les nouveaux développements
 * 
 * Ce hook maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise useGenericEntityStatus en arrière-plan pour bénéficier des améliorations.
 * 
 * @param {Object} options - Options de configuration (optionnel)
 * @returns {Object} Interface du hook de statuts de dates
 * 
 * @example
 * ```javascript
 * // Utilisation existante (maintenue pour compatibilité)
 * const { getStatusDetails, getStatusMessage } = useDateStatus();
 * 
 * // RECOMMANDÉ pour nouveaux développements :
 * import useGenericEntityStatus from '@/hooks/generics/status/useGenericEntityStatus';
 * const { getStatusDetails, getStatusMessage } = useGenericEntityStatus({
 *   statusMap: dateStatusConfig,
 *   entityType: 'date'
 * });
 * ```
 */
const useDateStatus = (options = {}) => {
  // Configuration des statuts de dates
  const dateStatusConfig = useMemo(() => ({
    statusMap: {
      contact: {
        icon: '📞',
        label: 'Contact établi',
        variant: 'blue',
        step: 1,
        tooltip: 'Premier contact établi avec l\'artiste',
        category: 'progress',
        description: 'Phase initiale de prise de contact'
      },
      preaccord: {
        icon: '✅',
        label: 'Pré-accord',
        variant: 'blue',
        step: 2,
        tooltip: 'Accord de principe obtenu',
        category: 'progress',
        description: 'Accord de principe pour la date et les conditions'
      },
      contrat: {
        icon: '📄',
        label: 'Contrat signé',
        variant: 'green',
        step: 3,
        tooltip: 'Contrat officiel signé',
        category: 'progress',
        description: 'Contrat finalisé et signé par toutes les parties'
      },
      confirme: {
        icon: '🎯',
        label: 'Confirmé',
        variant: 'green',
        step: 4,
        tooltip: 'Date confirmé et planifié',
        category: 'progress',
        description: 'Date définitivement confirmé'
      },
      annule: {
        icon: '❌',
        label: 'Annulé',
        variant: 'red',
        step: 0,
        tooltip: 'Date annulé',
        category: 'cancel',
        description: 'Date annulé pour diverses raisons'
      },
      reporte: {
        icon: '📅',
        label: 'Reporté',
        variant: 'yellow',
        step: 0,
        tooltip: 'Date reporté à une date ultérieure',
        category: 'postponed',
        description: 'Date reporté à une nouvelle date'
      }
    },
    entityType: 'date',
    allowBackwardTransitions: true,
    customTransitionRules: (currentStatus, targetStatus, statusMap) => {
      // Règles spécifiques aux dates
      
      // On peut toujours annuler ou reporter
      if (targetStatus === 'annule' || targetStatus === 'reporte') {
        return true;
      }
      
      // Depuis annulé, on peut seulement revenir à contact
      if (currentStatus === 'annule') {
        return targetStatus === 'contact';
      }
      
      // Depuis reporté, on peut revenir à n'importe quel statut de progression
      if (currentStatus === 'reporte') {
        const targetDetails = statusMap[targetStatus];
        return targetDetails && targetDetails.category === 'progress';
      }
      
      // Transitions normales de progression
      const currentDetails = statusMap[currentStatus];
      const targetDetails = statusMap[targetStatus];
      
      if (currentDetails && targetDetails) {
        // Progression normale ou retour en arrière autorisé
        return targetDetails.step <= currentDetails.step + 1;
      }
      
      return true;
    },
    customMessageGenerator: (entity, context, statusMap) => {
      const status = entity?.status || entity?.statut;
      if (!status) {
        return {
          message: 'Statut du date non défini',
          action: 'define_date_status',
          variant: 'yellow'
        };
      }
      
      const statusDetails = statusMap[status];
      if (!statusDetails) {
        return {
          message: `Statut inconnu: ${status}`,
          action: 'fix_date_status',
          variant: 'red'
        };
      }
      
      // Messages contextuels spécifiques aux dates
      let contextualMessage = statusDetails.label;
      let recommendedAction = `action_${status}`;
      
      switch (status) {
        case 'contact':
          contextualMessage = `Contact établi${entity.artiste ? ` avec ${entity.artiste.nom}` : ''}`;
          recommendedAction = 'negotiate_preaccord';
          break;
        case 'preaccord':
          contextualMessage = `Pré-accord obtenu${entity.date ? ` pour le ${new Date(entity.date).toLocaleDateString()}` : ''}`;
          recommendedAction = 'prepare_contract';
          break;
        case 'contrat':
          contextualMessage = `Contrat signé${entity.lieu ? ` au ${entity.lieu.nom}` : ''}`;
          recommendedAction = 'confirm_date';
          break;
        case 'confirme':
          contextualMessage = `Date confirmé${entity.date && entity.lieu ? ` le ${new Date(entity.date).toLocaleDateString()} au ${entity.lieu.nom}` : ''}`;
          recommendedAction = 'manage_date';
          break;
        case 'annule':
          contextualMessage = `Date annulé${entity.raisonAnnulation ? ` (${entity.raisonAnnulation})` : ''}`;
          recommendedAction = 'handle_cancellation';
          break;
        case 'reporte':
          contextualMessage = `Date reporté${entity.nouvelleDateProposee ? ` au ${new Date(entity.nouvelleDateProposee).toLocaleDateString()}` : ''}`;
          recommendedAction = 'reschedule_date';
          break;
        default:
          // Statut non reconnu - utiliser les valeurs par défaut
          contextualMessage = statusDetails.label;
          recommendedAction = `action_${status}`;
          break;
      }
      
      return {
        message: contextualMessage,
        action: recommendedAction,
        variant: statusDetails.variant,
        tooltip: statusDetails.tooltip,
        progress: Math.round((statusDetails.step / 4) * 100) // 4 étapes max pour les dates
      };
    }
  }), []);
  
  // Utiliser le hook générique avec la configuration des dates
  const genericHook = useGenericEntityStatus(dateStatusConfig, {
    enableLogging: options.enableLogging || false,
    enableTransitionHistory: options.enableTransitionHistory || true
  });
  
  // Retourner l'interface compatible avec l'ancienne API
  return {
    // API existante maintenue
    getStatusDetails: genericHook.getStatusDetails,
    getStatusMessage: genericHook.getStatusMessage,
    isStatusChangeAllowed: genericHook.isStatusChangeAllowed,
    
    // Nouvelles fonctionnalités disponibles via le hook générique
    getNextStatuses: genericHook.getNextStatuses,
    getStatusProgress: genericHook.getStatusProgress,
    getStatusesByCategory: genericHook.getStatusesByCategory,
    validateStatusConfig: genericHook.validateStatusConfig,
    
    // Métadonnées
    statusDetailsMap: genericHook.statusDetailsMap,
    entityType: genericHook.entityType,
    getTotalStatuses: genericHook.getTotalStatuses,
    getMaxStep: genericHook.getMaxStep,
    
    // Fonctions spécifiques aux dates (wrappers)
    getDateStatusDetails: genericHook.getStatusDetails,
    getDateStatusMessage: genericHook.getStatusMessage,
    isDateStatusChangeAllowed: genericHook.isStatusChangeAllowed,
    
    // Informations de migration
    _migrationInfo: {
      isWrapper: true,
      originalHook: 'useDateStatus',
      genericHook: 'useGenericEntityStatus',
      migrationDate: '2025-01-XX',
      phase: 'Phase 2'
    }
  };
};

export default useDateStatus;