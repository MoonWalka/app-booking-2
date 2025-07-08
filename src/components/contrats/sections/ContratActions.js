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
  onNavigateBack,
  onViewFacture,
  onGenerateFacture
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
            title="Marquer le contrat comme envoyé manuellement"
          >
            <i className="bi bi-send"></i>
            Marquer comme envoyé
          </Button>
        )}
        
        {contrat?.status === 'sent' && (
          <>
            <Button 
              variant="outline-warning" 
              onClick={onSendContrat}
              disabled={isLoading}
              title="Cliquer pour annuler l'envoi et revenir au statut 'généré'"
            >
              <i className="bi bi-send-check"></i>
              Contrat envoyé
            </Button>
            <Button 
              variant="success" 
              onClick={onMarkAsSigned}
              disabled={isLoading}
              title="Marquer le contrat comme signé"
            >
              <i className="bi bi-pen-fill"></i>
              Marquer comme signé
            </Button>
          </>
        )}
        
        {contrat?.status === 'signed' && (
          <Button 
            variant="info" 
            onClick={onMarkAsSigned}
            disabled={isLoading}
            title="Cliquer pour annuler la signature et revenir au statut 'envoyé'"
          >
            <i className="bi bi-check-circle-fill"></i>
            Contrat signé
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
        
        {/* Boutons facture */}
        {contrat && (contrat.status === 'signed' || contrat.status === 'sent') && (
          <>
            {contrat.factureId ? (
              <Button 
                variant="success" 
                onClick={() => onViewFacture && onViewFacture(contrat.factureId)}
                disabled={isLoading}
                title="Voir la facture générée"
              >
                <i className="bi bi-receipt-cutoff"></i>
                Voir la facture
              </Button>
            ) : (
              <Button 
                variant="info" 
                onClick={() => onGenerateFacture && onGenerateFacture(concert.id)}
                disabled={isLoading}
                title="Générer une facture depuis ce contrat"
              >
                <i className="bi bi-receipt"></i>
                Générer facture
              </Button>
            )}
          </>
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