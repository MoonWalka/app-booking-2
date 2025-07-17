import React from 'react';
import styles from './DateActions.module.css';

const DateActions = ({ 
  date, 
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
  handleViewFacture,
  handleViewDate,
  handleEditDate,
  handleDeleteDate,
  handleViewStructure
}) => {
  
  // Fonction pour déterminer le statut du formulaire
  const getFormStatus = () => {
    // Vérifier les contacts (nouveau format contactIds ou ancien format contactId)
    const hasContact = (date.contactIds && date.contactIds.length > 0) || date.contactId;
    if (!hasContact) {
      return { status: 'no_contact', icon: 'bi-person-x', class: 'disabled', tooltip: 'Aucun contact associé' };
    }
    
    if (hasUnvalidatedForm) {
      return { status: 'to_validate', icon: 'bi-check2-circle', class: 'toValidate', tooltip: 'Formulaire à valider' };
    }
    
    if (hasForm) {
      // Vérifier si le formulaire est validé
      if (date.formValidated) {
        return { status: 'validated', icon: 'bi-check-circle-fill', class: 'validated', tooltip: 'Formulaire validé' };
      } else {
        return { status: 'filled', icon: 'bi-file-text-fill', class: 'filled', tooltip: 'Formulaire rempli' };
      }
    }
    
    if (date.statut === 'contact') {
      return { status: 'to_send', icon: 'bi-envelope', class: 'toSend', tooltip: 'Envoyer formulaire' };
    }
    
    return { status: 'not_sent', icon: 'bi-envelope-plus', class: 'notSent', tooltip: 'Formulaire non envoyé' };
  };
  
  const formStatus = getFormStatus();
  
  // Fonction pour déterminer le statut du contrat
  const getContractStatus = () => {
    if (!hasContract) {
      // Vérifier si on peut générer un contrat (besoin d'un contact au minimum)
      const hasContact = (date.contactIds && date.contactIds.length > 0) || date.contactId;
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
    // D'abord vérifier si le contrat a une facture liée
    if (contractData && contractData.factureId) {
      // Si le contrat a une facture, utiliser le statut de la facture du contrat
      const factureStatusFromContract = contractData.factureStatus || 'generated';
      switch (factureStatusFromContract) {
        case 'paid':
          return { status: 'paid', icon: 'bi-receipt-cutoff', class: 'paid', tooltip: 'Facture payée' };
        case 'sent':
          return { status: 'sent', icon: 'bi-receipt', class: 'sent', tooltip: 'Facture envoyée' };
        case 'generated':
        default:
          return { status: 'generated', icon: 'bi-receipt', class: 'generated', tooltip: 'Facture générée' };
      }
    }
    
    // Sinon vérifier s'il y a une facture directe
    if (!hasFacture) {
      // Vérifier si on peut générer une facture
      const hasContact = (date.contactIds && date.contactIds.length > 0) || date.contactId;
      if (!hasContact) {
        return { status: 'no_contact', icon: 'bi-person-x', class: 'disabled', tooltip: 'Aucun contact associé' };
      }
      if (!date.structureId) {
        return { status: 'no_structure', icon: 'bi-building-x', class: 'disabled', tooltip: 'Aucune structure associée' };
      }
      // Si pas de contrat, on ne peut pas générer de facture
      if (!hasContract) {
        return { status: 'no_contract', icon: 'bi-file-earmark-x', class: 'disabled', tooltip: 'Contrat requis pour facturer' };
      }
      // Si le contrat n'est pas signé, on ne peut pas facturer
      if (contractStatus !== 'signed') {
        return { status: 'contract_not_signed', icon: 'bi-pen', class: 'disabled', tooltip: 'Contrat non signé' };
      }
      return { status: 'not_generated', icon: 'bi-receipt', class: 'notGenerated', tooltip: 'Générer facture' };
    }
    
    // Si on a une facture directe, vérifier son statut
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
        handleSendForm(date.id);
        break;
      case 'to_validate':
      case 'filled':
      case 'validated':
        handleViewForm(date.id);
        break;
      case 'no_contact':
        // Rediriger vers l'édition du date pour ajouter un contact
        window.location.href = `/dates/${date.id}/edit`;
        break;
      case 'not_sent':
        // Aller à la page de gestion du formulaire pour générer un lien
        handleSendForm(date.id);
        break;
      default:
        // Par défaut, aller à la page de gestion du formulaire
        handleSendForm(date.id);
        break;
    }
  };
  
  // Fonction pour gérer le clic sur le bouton contrat
  const handleContractClick = (e) => {
    e.stopPropagation();
    
    switch (contractStatusInfo.status) {
      case 'not_generated':
        handleGenerateContract(date.id);
        break;
      case 'generated':
      case 'sent':
      case 'signed':
        // Utiliser l'ID du contrat depuis contractData
        if (contractData && contractData.id) {
          handleViewContract(contractData.id);
        } else {
          // Fallback si pas d'ID de contrat (ne devrait pas arriver)
          console.error('ID du contrat non trouvé pour le date:', date.id);
        }
        break;
      case 'no_contact':
      default:
        // Rediriger vers l'édition du date pour ajouter un contact
        window.location.href = `/dates/${date.id}/edit`;
        break;
    }
  };
  
  // Fonction pour gérer le clic sur le bouton facture
  const handleFactureClick = (e) => {
    e.stopPropagation();
    
    switch (factureStatusInfo.status) {
      case 'not_generated':
        // Générer la facture depuis le contrat
        handleGenerateFacture(date.id);
        break;
      case 'generated':
      case 'sent':
      case 'paid':
        // D'abord vérifier si la facture est liée au contrat
        if (contractData && contractData.factureId) {
          handleViewFacture(contractData.factureId);
        } else if (factureData && factureData.id) {
          // Sinon utiliser l'ID de la facture directe
          handleViewFacture(factureData.id);
        } else {
          // Fallback si pas d'ID de facture (ne devrait pas arriver)
          console.error('ID de la facture non trouvé pour le date:', date.id);
        }
        break;
      case 'no_contact':
      case 'no_structure':
        // Rediriger vers l'édition du date pour ajouter un contact/structure
        window.location.href = `/dates/${date.id}/edit`;
        break;
      case 'no_contract':
      case 'contract_not_signed':
        // Ne rien faire, le bouton est désactivé
        break;
      default:
        break;
    }
  };
  
  return (
    <div className={styles.actionsContainer} onClick={(e) => e.stopPropagation()}>
      {/* Modifier Button */}
      <button 
        className={`${styles.actionButton} ${styles.editButton}`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleEditDate) {
            handleEditDate(date.id);
          } else {
            // Fallback: navigation directe vers la page d'édition
            window.location.href = `/dates/${date.id}/edit`;
          }
        }}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </button>
      
      {/* Supprimer Button */}
      <button 
        className={`${styles.actionButton} ${styles.deleteButton}`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleDeleteDate) {
            handleDeleteDate(date.id);
          }
        }}
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </button>
      
      {/* Structure Button */}
      <button 
        className={`${styles.actionButton} ${styles.structureButton}`}
        onClick={(e) => {
          e.stopPropagation();
          // Vérifier si la date a une structure associée
          const structureId = date.structureId || date.organisateurId;
          if (structureId && handleViewStructure) {
            handleViewStructure(structureId);
          }
        }}
        title="Fiche structure"
        disabled={!date.structureId && !date.organisateurId}
      >
        <i className="bi bi-building"></i>
      </button>
    </div>
  );
};

export default DateActions;