import React from 'react';
import styles from './ConcertActions.module.css';

const ConcertActions = ({ 
  concert, 
  hasForm,
  hasUnvalidatedForm,
  hasContract,
  contractStatus,
  getContractButtonVariant,
  getContractTooltip,
  handleViewConcert,
  handleSendForm,
  handleViewForm,
  handleGenerateContract,
  handleViewContract
}) => {
  
  // Calculer le variant et tooltip pour les boutons de contrat
  const contractButtonVariant = getContractButtonVariant ? getContractButtonVariant(concert, hasContract, contractStatus) : 'primary';
  const contractButtonTooltip = getContractTooltip ? getContractTooltip(concert, hasContract, contractStatus) : 'Action contrat';
  
  // Fonction pour déterminer le statut du formulaire
  const getFormStatus = () => {
    if (!concert.programmateurId) {
      return { status: 'no_programmateur', icon: 'bi-person-x', class: 'disabled', tooltip: 'Aucun programmateur associé' };
    }
    
    if (hasUnvalidatedForm) {
      return { status: 'to_validate', icon: 'bi-check2-circle', class: 'toValidate', tooltip: 'Formulaire à valider' };
    }
    
    if (hasForm) {
      // Vérifier si le formulaire est validé
      if (concert.formValidated) {
        return { status: 'validated', icon: 'bi-check-circle-fill', class: 'validated', tooltip: 'Formulaire validé' };
      } else {
        return { status: 'filled', icon: 'bi-file-text-fill', class: 'filled', tooltip: 'Formulaire rempli' };
      }
    }
    
    if (concert.statut === 'contact') {
      return { status: 'to_send', icon: 'bi-envelope', class: 'toSend', tooltip: 'Envoyer formulaire' };
    }
    
    return { status: 'not_sent', icon: 'bi-envelope-plus', class: 'notSent', tooltip: 'Formulaire non envoyé' };
  };
  
  const formStatus = getFormStatus();
  
  // Fonction pour déterminer le statut du contrat
  const getContractStatus = () => {
    if (!hasContract) {
      // Vérifier si on peut générer un contrat (besoin d'un programmateur au minimum)
      if (!concert.programmateurId) {
        return { status: 'no_programmateur', icon: 'bi-person-x', class: 'disabled', tooltip: 'Aucun programmateur associé' };
      }
      return { status: 'not_generated', icon: 'bi-file-earmark-plus', class: 'notGenerated', tooltip: 'Générer contrat' };
    }
    
    // Si on a un contrat, vérifier son statut
    switch (contractStatus) {
      case 'signed':
        return { status: 'signed', icon: 'bi-file-earmark-check-fill', class: 'signed', tooltip: 'Contrat signé' };
      case 'sent':
        return { status: 'sent', icon: 'bi-file-earmark-arrow-up', class: 'sent', tooltip: 'Contrat envoyé' };
      case 'generated':
      default:
        return { status: 'generated', icon: 'bi-file-earmark-text', class: 'generated', tooltip: 'Contrat généré' };
    }
  };
  
  const contractStatusInfo = getContractStatus();
  
  // Fonction pour gérer le clic sur le bouton formulaire
  const handleFormClick = (e) => {
    e.stopPropagation();
    
    switch (formStatus.status) {
      case 'to_send':
        handleSendForm(concert.id);
        break;
      case 'to_validate':
      case 'filled':
      case 'validated':
        handleViewForm(concert.id);
        break;
      case 'no_programmateur':
      case 'not_sent':
      default:
        // Rediriger vers l'édition du concert pour ajouter un programmateur
        window.location.href = `/concerts/${concert.id}/edit`;
        break;
    }
  };
  
  // Fonction pour gérer le clic sur le bouton contrat
  const handleContractClick = (e) => {
    e.stopPropagation();
    
    switch (contractStatusInfo.status) {
      case 'not_generated':
        handleGenerateContract(concert.id);
        break;
      case 'generated':
      case 'sent':
      case 'signed':
        handleViewContract(concert.id);
        break;
      case 'no_programmateur':
      default:
        // Rediriger vers l'édition du concert pour ajouter un programmateur
        window.location.href = `/concerts/${concert.id}/edit`;
        break;
    }
  };
  
  return (
    <div className={styles.actionsContainer} onClick={(e) => e.stopPropagation()}>
      {/* Form Button - Toujours affiché avec statut différent */}
      <button 
        className={`${styles.actionButton} ${styles.formButton} ${styles[formStatus.class]}`}
        onClick={handleFormClick}
        title={formStatus.tooltip}
        disabled={formStatus.status === 'no_programmateur'}
      >
        <i className={formStatus.icon}></i>
      </button>
      
      {/* Contract Button - Toujours affiché avec statut différent */}
      <button 
        className={`${styles.actionButton} ${styles.contractButton} ${styles[contractStatusInfo.class]}`}
        onClick={handleContractClick}
        title={contractStatusInfo.tooltip}
        disabled={contractStatusInfo.status === 'no_programmateur'}
      >
        <i className={contractStatusInfo.icon}></i>
      </button>
    </div>
  );
};

export default ConcertActions;