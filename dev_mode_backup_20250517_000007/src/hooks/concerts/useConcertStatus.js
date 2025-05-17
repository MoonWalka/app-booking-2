import { useMemo } from 'react';

/**
 * Hook to manage concert status information and display utilities
 */
export const useConcertStatus = () => {
  // Status details mapping with icons, labels, variants and tooltips
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
  
  // Function to get status details
  const getStatusDetails = (statut) => {
    return statusDetailsMap[statut] || {
      icon: '❓',
      label: statut || 'Non défini',
      variant: 'light',
      tooltip: 'Statut non défini',
      step: 0
    };
  };

  // Function to get contract button variant
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
  
  // Function to get contract tooltip text
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

  // Function to get status message and action recommendation
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
  
  return {
    statusDetailsMap,
    getStatusDetails,
    getContractButtonVariant,
    getContractTooltip,
    getStatusMessage
  };
};

export default useConcertStatus;