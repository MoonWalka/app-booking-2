import React from 'react';
import { Link } from 'react-router-dom';
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
  
  return (
    <div className={styles.actionsContainer} onClick={(e) => e.stopPropagation()}>
      {/* View Concert Button */}
      <button 
        className={`${styles.actionButton} ${styles.viewButton}`}
        onClick={(e) => {
          e.stopPropagation();
          handleViewConcert(concert.id);
        }}
        title="Voir les détails"
      >
        <i className="bi bi-eye"></i>
      </button>
      
      {/* Form Actions */}
      {concert.statut === 'contact' && concert.programmateurId && !hasForm && (
        <button 
          className={`${styles.actionButton} ${styles.formButton}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSendForm(concert.id);
          }}
          title="Envoyer formulaire"
        >
          <i className="bi bi-envelope"></i>
        </button>
      )}
      
      {hasUnvalidatedForm && (
        <button 
          className={`${styles.actionButton} ${styles.formButton}`}
          onClick={(e) => {
            e.stopPropagation();
            handleViewForm(concert.id);
          }}
          title="Formulaire à valider"
        >
          <i className="bi bi-check2-circle"></i>
        </button>
      )}
      
      {hasForm && !hasUnvalidatedForm && (
        <button 
          className={`${styles.actionButton} ${styles.formButton}`}
          onClick={(e) => {
            e.stopPropagation();
            handleViewForm(concert.id);
          }}
          title="Voir formulaire"
        >
          <i className="bi bi-file-text"></i>
        </button>
      )}
      
      {/* Contract Actions avec styling dynamique sophistiqué */}
      {!hasContract && (
        <button 
          className={`${styles.actionButton} ${styles.contractButton} ${styles[`variant-${contractButtonVariant}`]}`}
          onClick={(e) => {
            e.stopPropagation();
            handleGenerateContract(concert.id);
          }}
          title={contractButtonTooltip}
        >
          <i className="bi bi-file-earmark-plus"></i>
        </button>
      )}
      
      {hasContract && (
        <button 
          className={`${styles.actionButton} ${styles.contractButton} ${styles[`variant-${contractButtonVariant}`]}`}
          onClick={(e) => {
            e.stopPropagation();
            handleViewContract(concert.id);
          }}
          title={contractButtonTooltip}
        >
          {contractStatus === 'signed' ? (
            <i className="bi bi-file-earmark-check text-success"></i>
          ) : contractStatus === 'pending' ? (
            <i className="bi bi-file-earmark-arrow-up text-warning"></i>
          ) : (
            <i className="bi bi-file-earmark-text"></i>
          )}
        </button>
      )}
      
      {/* Edit Concert Button */}
      <Link 
        to={`/concerts/${concert.id}/edit`}
        className={`${styles.actionButton} ${styles.editButton}`}
        onClick={(e) => e.stopPropagation()}
        title="Modifier"
      >
        <i className="bi bi-pencil"></i>
      </Link>
    </div>
  );
};

export default ConcertActions;