// src/components/contrats/sections/ContratActions.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { FaEnvelope, FaFileSignature } from 'react-icons/fa';
import styles from './ContratActions.module.css';

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
    <div className={styles.actionsContainer}>
      <div className="d-flex gap-2">
        <Button 
          variant="primary" 
          onClick={onPdfViewerToggle}
        >
          <i className="bi bi-eye me-1"></i> Afficher le contrat
        </Button>
        
        {template && concert && (
          <Button
            variant="success"
            onClick={onDownloadPdf}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Préparation...
              </>
            ) : (
              <>
                <i className="bi bi-file-pdf me-1"></i> Télécharger PDF
              </>
            )}
          </Button>
        )}
        
        {contrat?.status === 'generated' && (
          <Button variant="info" onClick={onSendContrat}>
            <FaEnvelope className="me-1" /> Marquer comme envoyé
          </Button>
        )}
        
        {contrat?.status === 'sent' && (
          <Button variant="success" onClick={onMarkAsSigned}>
            <FaFileSignature className="me-1" /> Marquer comme signé
          </Button>
        )}
        
        {/* Bouton Supprimer */}
        <Button 
          variant="danger" 
          onClick={onDeleteContrat}
        >
          <i className="bi bi-trash me-1"></i> Supprimer
        </Button>
        
        {/* Bouton de retour */}
        <Button 
          variant="outline-secondary" 
          onClick={onNavigateBack}
        >
          <i className="bi bi-arrow-left me-1"></i> Retour aux contrats
        </Button>
      </div>
    </div>
  );
};

export default ContratActions;