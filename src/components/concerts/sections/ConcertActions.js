import React from 'react';
import styles from './ConcertActions.module.css';

const ConcertActions = ({ 
  concert, 
  hasForm,
  hasUnvalidatedForm,
  hasContract,
  contractStatus,
  contractData,
  hasFacture,
  factureStatus,
  factureData,
  handleSendForm,
  handleViewForm,
  handleGenerateContract,
  handleViewContract,
  handleGenerateFacture,
  handleViewFacture
}) => {
  
  // Fonction pour déterminer le statut du formulaire
  const getFormStatus = () => {
    // Vérifier les contacts (nouveau format contactIds ou ancien format contactId)
    const hasContact = (concert.contactIds && concert.contactIds.length > 0) || concert.contactId;
    if (!hasContact) {
      return { status: 'no_contact', icon: 'bi-person-x', class: 'disabled', tooltip: 'Aucun contact associé' };
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
      // Vérifier si on peut générer un contrat (besoin d'un contact au minimum)
      const hasContact = (concert.contactIds && concert.contactIds.length > 0) || concert.contactId;
      if (!hasContact) {
        return { status: 'no_contact', icon: 'bi-person-x', class: 'disabled', tooltip: 'Aucun contact associé' };
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
  
  // Fonction pour déterminer le statut de la facture
  const getFactureStatus = () => {
    if (!hasFacture) {
      // Vérifier si on peut générer une facture (besoin d'un contact et d'une structure au minimum)
      const hasContact = (concert.contactIds && concert.contactIds.length > 0) || concert.contactId;
      if (!hasContact) {
        return { status: 'no_contact', icon: 'bi-person-x', class: 'disabled', tooltip: 'Aucun contact associé' };
      }
      if (!concert.structureId) {
        return { status: 'no_structure', icon: 'bi-building-x', class: 'disabled', tooltip: 'Aucune structure associée' };
      }
      return { status: 'not_generated', icon: 'bi-receipt', class: 'notGenerated', tooltip: 'Générer facture' };
    }
    
    // Si on a une facture, vérifier son statut
    switch (factureStatus) {
      case 'paid':
        return { status: 'paid', icon: 'bi-receipt-cutoff', class: 'paid', tooltip: 'Facture payée' };
      case 'sent':
        return { status: 'sent', icon: 'bi-receipt', class: 'sent', tooltip: 'Facture envoyée' };
      case 'generated':
      default:
        return { status: 'generated', icon: 'bi-receipt', class: 'generated', tooltip: 'Facture générée' };
    }
  };
  
  const factureStatusInfo = getFactureStatus();
  
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
      case 'no_contact':
        // Rediriger vers l'édition du concert pour ajouter un contact
        window.location.href = `/concerts/${concert.id}/edit`;
        break;
      case 'not_sent':
        // Aller à la page de gestion du formulaire pour générer un lien
        handleSendForm(concert.id);
        break;
      default:
        // Par défaut, aller à la page de gestion du formulaire
        handleSendForm(concert.id);
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
        // Utiliser l'ID du contrat depuis contractData
        if (contractData && contractData.id) {
          handleViewContract(contractData.id);
        } else {
          // Fallback si pas d'ID de contrat (ne devrait pas arriver)
          console.error('ID du contrat non trouvé pour le concert:', concert.id);
        }
        break;
      case 'no_contact':
      default:
        // Rediriger vers l'édition du concert pour ajouter un contact
        window.location.href = `/concerts/${concert.id}/edit`;
        break;
    }
  };
  
  // Fonction pour gérer le clic sur le bouton facture
  const handleFactureClick = (e) => {
    e.stopPropagation();
    
    switch (factureStatusInfo.status) {
      case 'not_generated':
        handleGenerateFacture(concert.id);
        break;
      case 'generated':
      case 'sent':
      case 'paid':
        // Utiliser l'ID de la facture depuis factureData
        if (factureData && factureData.id) {
          handleViewFacture(factureData.id);
        } else {
          // Fallback si pas d'ID de facture (ne devrait pas arriver)
          console.error('ID de la facture non trouvé pour le concert:', concert.id);
        }
        break;
      case 'no_contact':
      case 'no_structure':
      default:
        // Rediriger vers l'édition du concert pour ajouter un contact/structure
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
        disabled={formStatus.status === 'no_contact'}
      >
        <i className={formStatus.icon}></i>
      </button>
      
      {/* Contract Button - Toujours affiché avec statut différent */}
      <button 
        className={`${styles.actionButton} ${styles.contractButton} ${styles[contractStatusInfo.class]}`}
        onClick={handleContractClick}
        title={contractStatusInfo.tooltip}
        disabled={contractStatusInfo.status === 'no_contact'}
      >
        <i className={contractStatusInfo.icon}></i>
      </button>
      
      {/* Facture Button - Toujours affiché avec statut différent */}
      <button 
        className={`${styles.actionButton} ${styles.factureButton} ${styles[factureStatusInfo.class]}`}
        onClick={handleFactureClick}
        title={factureStatusInfo.tooltip}
        disabled={factureStatusInfo.status === 'no_contact' || factureStatusInfo.status === 'no_structure'}
      >
        <i className={factureStatusInfo.icon}></i>
      </button>
    </div>
  );
};

export default ConcertActions;