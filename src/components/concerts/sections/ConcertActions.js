import React from 'react';
import ActionButton from '@/components/common/ActionButton';
import styles from './ConcertActions.module.css';

const ConcertActions = ({ 
  concert, 
  hasForm,
  hasUnvalidatedForm,
  hasContract,
  contractStatus,
  handleViewConcert,
  handleSendForm,
  handleViewForm,
  handleGenerateContract,
  handleViewContract
}) => {
  return (
    <div className={styles.actionsContainer} onClick={(e) => e.stopPropagation()}>
      {/* View Concert Button */}
      <ActionButton
        to={`/concerts/${concert.id}`}
        tooltip="Voir les détails du concert"
        icon={<i className="bi bi-eye"></i>}
        variant="outline-primary"
      />
      
      {/* Form Actions */}
      {concert.statut === 'contact' && concert.programmateurId && !hasForm && (
        <ActionButton
          tooltip="Envoyer formulaire"
          icon={<i className="bi bi-envelope"></i>}
          variant="outline-warning"
          onClick={() => handleSendForm(concert.id)}
        />
      )}
      
      {hasUnvalidatedForm && (
        <ActionButton
          tooltip="Formulaire à valider"
          icon={<i className="bi bi-check2-circle"></i>}
          variant="outline-warning"
          onClick={() => handleViewForm(concert.id)}
        />
      )}
      
      {hasForm && !hasUnvalidatedForm && (
        <ActionButton
          tooltip="Voir formulaire"
          icon={<i className="bi bi-file-text"></i>}
          variant="outline-info"
          onClick={() => handleViewForm(concert.id)}
        />
      )}
      
      {/* Contract Actions */}
      {!hasContract && (
        <ActionButton
          tooltip="Générer contrat"
          icon={<i className="bi bi-file-earmark-plus"></i>}
          variant="outline-primary"
          onClick={() => handleGenerateContract(concert.id)}
        />
      )}
      
      {hasContract && (
        <ActionButton
          tooltip={contractStatus === 'signed' ? 'Contrat signé' : 'Voir contrat'}
          icon={<i className="bi bi-file-earmark-text"></i>}
          variant={contractStatus === 'signed' ? 'success' : 'outline-success'}
          onClick={() => handleViewContract(concert.id)}
        />
      )}
    </div>
  );
};

export default ConcertActions;