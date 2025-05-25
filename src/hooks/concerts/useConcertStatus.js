/**
 * @fileoverview Hook pour la gestion des statuts de concerts
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
 * Hook migré pour la gestion des statuts de concerts
 * 
 * @deprecated Utilisez useGenericEntityStatus directement pour les nouveaux développements
 * 
 * Ce hook maintient l'API existante pour la compatibilité avec le code existant,
 * mais utilise useGenericEntityStatus en arrière-plan pour bénéficier des améliorations.
 * 
 * @param {Object} options - Options de configuration (optionnel)
 * @returns {Object} Interface du hook de statuts de concerts
 * 
 * @example
 * ```javascript
 * // Utilisation existante (maintenue pour compatibilité)
 * const { getStatusDetails, getStatusMessage } = useConcertStatus();
 * 
 * // RECOMMANDÉ pour nouveaux développements :
 * import useGenericEntityStatus from '@/hooks/generics/status/useGenericEntityStatus';
 * const { getStatusDetails, getStatusMessage } = useGenericEntityStatus({
 *   statusMap: concertStatusConfig,
 *   entityType: 'concert'
 * });
 * ```
 */
const useConcertStatus = (options = {}) => {
  // Configuration des statuts de concerts
  const concertStatusConfig = useMemo(() => ({
    statusMap: {
      contact: {
        icon: '📞',
        label: 'Contact établi',
        variant: 'info',
        step: 1,
        tooltip: 'Premier contact établi avec l\'artiste',
        category: 'progress',
        description: 'Phase initiale de prise de contact'
      },
      preaccord: {
        icon: '✅',
        label: 'Pré-accord',
        variant: 'primary',
        step: 2,
        tooltip: 'Accord de principe obtenu',
        category: 'progress',
        description: 'Accord de principe pour la date et les conditions'
      },
      contrat: {
        icon: '📄',
        label: 'Contrat signé',
        variant: 'success',
        step: 3,
        tooltip: 'Contrat officiel signé',
        category: 'progress',
        description: 'Contrat finalisé et signé par toutes les parties'
      },
      confirme: {
        icon: '🎯',
        label: 'Confirmé',
        variant: 'success',
        step: 4,
        tooltip: 'Concert confirmé et planifié',
        category: 'progress',
        description: 'Concert définitivement confirmé'
      },
      annule: {
        icon: '❌',
        label: 'Annulé',
        variant: 'danger',
        step: 0,
        tooltip: 'Concert annulé',
        category: 'cancel',
        description: 'Concert annulé pour diverses raisons'
      },
      reporte: {
        icon: '📅',
        label: 'Reporté',
        variant: 'warning',
        step: 0,
        tooltip: 'Concert reporté à une date ultérieure',
        category: 'postponed',
        description: 'Concert reporté à une nouvelle date'
      }
    },
    entityType: 'concert',
    allowBackwardTransitions: true,
    customTransitionRules: (currentStatus, targetStatus, statusMap) => {
      // Règles spécifiques aux concerts
      
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
          message: 'Statut du concert non défini',
          action: 'define_concert_status',
          variant: 'warning'
        };
      }
      
      const statusDetails = statusMap[status];
      if (!statusDetails) {
        return {
          message: `Statut inconnu: ${status}`,
          action: 'fix_concert_status',
          variant: 'danger'
        };
      }
      
      // Messages contextuels spécifiques aux concerts
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
          recommendedAction = 'confirm_concert';
          break;
        case 'confirme':
          contextualMessage = `Concert confirmé${entity.date && entity.lieu ? ` le ${new Date(entity.date).toLocaleDateString()} au ${entity.lieu.nom}` : ''}`;
          recommendedAction = 'manage_concert';
          break;
        case 'annule':
          contextualMessage = `Concert annulé${entity.raisonAnnulation ? ` (${entity.raisonAnnulation})` : ''}`;
          recommendedAction = 'handle_cancellation';
          break;
        case 'reporte':
          contextualMessage = `Concert reporté${entity.nouvelleDateProposee ? ` au ${new Date(entity.nouvelleDateProposee).toLocaleDateString()}` : ''}`;
          recommendedAction = 'reschedule_concert';
          break;
      }
      
      return {
        message: contextualMessage,
        action: recommendedAction,
        variant: statusDetails.variant,
        tooltip: statusDetails.tooltip,
        progress: Math.round((statusDetails.step / 4) * 100) // 4 étapes max pour les concerts
      };
    }
  }), []);
  
  // Utiliser le hook générique avec la configuration des concerts
  const genericHook = useGenericEntityStatus(concertStatusConfig, {
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
    
    // Fonctions spécifiques aux concerts (wrappers)
    getConcertStatusDetails: genericHook.getStatusDetails,
    getConcertStatusMessage: genericHook.getStatusMessage,
    isConcertStatusChangeAllowed: genericHook.isStatusChangeAllowed,
    
    // Informations de migration
    _migrationInfo: {
      isWrapper: true,
      originalHook: 'useConcertStatus',
      genericHook: 'useGenericEntityStatus',
      migrationDate: '2025-01-XX',
      phase: 'Phase 2'
    }
  };
};

export default useConcertStatus;