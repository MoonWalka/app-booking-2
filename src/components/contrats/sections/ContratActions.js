// src/components/contrats/sections/ContratActions.js
import React from 'react';
import Button from '@/components/ui/Button';
import styles from '@/pages/ContratDetailsPage.module.css';

/**
 * Component for contract action buttons (send, sign, delete, etc)
 */
const ContratActions = ({ 
  contrat, 
  template, 
  concert, 
  isLoading,
  onPdfViewerToggle, 
  onSendContrat, 
  onMarkAsSigned, 
  onDownloadPdf,
  onDeleteContrat,
  onNavigateBack
}) => {
  return (
    <div className={styles.contratActions}>
      <div className={styles.actionsRow}>
        <Button 
          variant="primary" 
          onClick={onPdfViewerToggle}
          disabled={isLoading}
        >
          <i className="bi bi-eye"></i>
          Aperçu PDF
        </Button>
        
        {contrat?.status === 'generated' && (
          <Button 
            variant="warning" 
            onClick={onSendContrat}
            disabled={isLoading}
          >
            <i className="bi bi-send"></i>
            Envoyer
          </Button>
        )}
        
        {contrat?.status === 'sent' && (
          <Button 
            variant="success" 
            onClick={onMarkAsSigned}
            disabled={isLoading}
          >
            <i className="bi bi-check-circle"></i>
            Marquer comme signé
          </Button>
        )}
        
        {template && concert && (
          <Button
            variant="secondary"
            onClick={onDownloadPdf}
            disabled={isLoading}
          >
            {isLoading && !contrat?.status ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Préparation...
              </>
            ) : (
              <>
                <i className="bi bi-download"></i>
                Télécharger PDF
              </>
            )}
          </Button>
        )}
        
        {contrat && (
          <Button 
            variant="danger" 
            onClick={onDeleteContrat}
            disabled={isLoading}
            className="ms-auto"
          >
            <i className="bi bi-trash"></i>
            Supprimer
          </Button>
        )}
        
        <Button 
          variant="outline-secondary" 
          onClick={onNavigateBack}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-left"></i>
          Retour
        </Button>
      </div>
    </div>
  );
};

export default ContratActions;