// src/hooks/concerts/useConcertStatusMigrated.js
import { useMemo } from 'react';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook optimisé pour gérer les informations de statut des concerts et les utilitaires d'affichage
 * Version migrée qui respecte l'architecture V2
 * 
 * @returns {Object} API pour la gestion des statuts de concert
 */
const useConcertStatusMigrated = () => {
  debugLog('Hook useConcertStatusMigrated instancié', 'debug', 'useConcertStatusMigrated');

  // Mapping des détails de statut avec icônes, libellés, variants et tooltips
  // Mémorisé pour éviter les recréations inutiles
  const statusDetailsMap = useMemo(() => ({
    contact: {
      icon: '📞',
      label: 'Contact établi',
      variant: 'info',
      tooltip: 'Premier contact établi avec le programmateur',
      step: 1
    },
    preaccord: {
      icon: '✅',
      label: 'Pré-accord',
      variant: 'primary',
      tooltip: 'Accord verbal obtenu, en attente de confirmation',
      step: 2
    },
    contrat: {
      icon: '📄',
      label: 'Contrat signé',
      variant: 'success',
      tooltip: 'Contrat signé par toutes les parties',
      step: 3
    },
    acompte: {
      icon: '💸',
      label: 'Acompte facturé',
      variant: 'warning',
      tooltip: 'Acompte facturé, en attente de paiement',
      step: 4
    },
    solde: {
      icon: '🔁',
      label: 'Solde facturé',
      variant: 'secondary',
      tooltip: 'Solde facturé, concert terminé',
      step: 5
    },
    annule: {
      icon: '❌',
      label: 'Annulé',
      variant: 'danger',
      tooltip: 'Concert annulé',
      step: 0
    }
  }), []);
  
  // Fonction pour obtenir les détails d'un statut
  const getStatusDetails = (statut) => {
    return statusDetailsMap[statut] || {
      icon: '❓',
      label: statut || 'Non défini',
      variant: 'light',
      tooltip: 'Statut non défini',
      step: 0
    };
  };

  // Fonction pour obtenir la variante de bouton de contrat
  const getContractButtonVariant = (status) => {
    if (!status) return 'outline-primary';
    
    switch (status) {
      case 'signed':
        return 'success';
      case 'sent':
        return 'success';
      case 'generated':
        return 'warning';
      default:
        return 'outline-primary';
    }
  };
  
  // Fonction pour obtenir le texte du tooltip du contrat
  const getContractTooltip = (status) => {
    if (!status) return 'Aucun contrat généré';
    
    switch (status) {
      case 'signed':
        return 'Contrat signé';
      case 'sent':
        return 'Contrat envoyé';
      case 'generated':
        return 'Contrat généré mais non envoyé';
      default:
        return 'Statut inconnu';
    }
  };

  /**
   * Fonction intelligente pour obtenir un message de statut et une recommandation d'action
   * basée sur l'état complet du concert
   * 
   * @param {Object} concert - L'objet concert
   * @param {boolean} hasForm - Indique si un formulaire est associé
   * @param {boolean} hasUnvalidatedForm - Indique si un formulaire non validé est associé
   * @param {boolean} isDatePassed - Indique si la date du concert est passée
   * @returns {Object} - Message, action recommandée et variante
   */
  const getStatusMessage = (concert, hasForm, hasUnvalidatedForm, isDatePassed) => {
    if (!concert) return { message: '', action: '', variant: 'light' };
    
    switch (concert.statut) {
      case 'contact':
        if (!hasForm && concert.programmateurId) 
          return { message: 'Formulaire à envoyer', action: 'form', variant: 'warning' };
        if (!concert.programmateurId) 
          return { message: 'Programmateur à démarcher', action: 'prog', variant: 'warning' };
        return { message: 'Contact établi', action: 'contact', variant: 'info' };
      
      case 'preaccord':
        return { message: 'Pré-accord obtenu', action: 'preaccord', variant: 'primary' };
        
      case 'contrat':
        return { message: 'Contrat signé', action: 'contrat', variant: 'success' };
      
      case 'acompte':
        return { message: 'Acompte facturé', action: 'acompte', variant: 'warning' };
      
      case 'solde':
        if (isDatePassed)
          return { message: 'Concert terminé', action: 'completed', variant: 'secondary' };
        return { message: 'Solde facturé', action: 'solde', variant: 'info' };
        
      case 'annule':
        return { message: 'Concert annulé', action: 'annule', variant: 'danger' };
        
      default:
        return { message: concert.statut || 'Non défini', action: 'unknown', variant: 'light' };
    }
  };

  /**
   * Fonction pour déterminer si un changement de statut est autorisé
   * @param {string} currentStatus - Le statut actuel
   * @param {string} targetStatus - Le statut cible
   * @returns {boolean} - True si le changement est autorisé
   */
  const isStatusChangeAllowed = (currentStatus, targetStatus) => {
    // Cas particulier: annulation possible depuis n'importe quel statut
    if (targetStatus === 'annule') return true;
    
    // Cas particulier: retour à un état précédent toujours possible
    const currentStep = getStatusDetails(currentStatus).step;
    const targetStep = getStatusDetails(targetStatus).step;
    
    // Autoriser les changements progressifs (même step ou step+1)
    return targetStep <= currentStep + 1;
  };
  
  // API retournée
  return {
    statusDetailsMap,
    getStatusDetails,
    getContractButtonVariant,
    getContractTooltip,
    getStatusMessage,
    isStatusChangeAllowed
  };
};

export default useConcertStatusMigrated;