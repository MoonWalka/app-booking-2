// src/components/contrats/desktop/sections/ContratGenerationActions.js
import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Button from '@ui/Button';
import styles from './ContratGenerationActions.module.css';
import ContratPDFWrapper from '@/components/pdf/ContratPDFWrapper.js';

const ContratGenerationActions = ({
  validateDataBeforeGeneration,
  selectedTemplate,
  contratId,
  concert,
  programmateur,
  artiste,
  lieu,
  entrepriseInfo,
  pdfUrl,
  setPdfUrl,
  saveGeneratedContract,
  showSuccess
}) => {
  const isValid = validateDataBeforeGeneration();

  return (
    <div className={styles.actionsContainer}>
      {contratId && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Un contrat a déjà été généré pour ce concert. Vous pouvez le régénérer avec un nouveau modèle.
        </div>
      )}
      
      <div className={styles.buttonsContainer}>
        {isValid ? (
          <PDFDownloadLink
            document={
              <ContratPDFWrapper 
                template={selectedTemplate}
                contratData={contratId ? { templateSnapshot: selectedTemplate } : null}
                concertData={concert}
                programmateurData={programmateur}
                artisteData={artiste}
                lieuData={lieu}
                entrepriseInfo={entrepriseInfo}
              />
            }
            fileName={`Contrat_${concert.titre || 'Concert'}.pdf`}
            className={styles.pdfDownloadButton}
          >
            {({ blob, url, loading, error }) => {
              if (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                return (
                  <Button variant="danger" disabled>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Erreur de génération
                  </Button>
                );
              }
              
              if (loading) {
                return (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Préparation du PDF...
                  </>
                );
              }
              
              // Une fois que le PDF est prêt, sauvegarder l'URL
              if (url && url !== pdfUrl) {
                setPdfUrl(url);
                saveGeneratedContract(url)
                  .then(id => {
                    console.log(`Contrat sauvegardé avec l'ID: ${id}`);
                    showSuccess();
                  })
                  .catch(err => {
                    console.error('Erreur de sauvegarde:', err);
                  });
              }
              
              return (
                <>
                  <i className="bi bi-file-pdf me-2"></i>
                  {contratId ? "Régénérer et télécharger" : "Générer et télécharger"}
                </>
              );
            }}
          </PDFDownloadLink>
        ) : (
          <Button variant="warning" disabled>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Données insuffisantes pour générer le contrat
          </Button>
        )}
        
        {contratId && (
          <Button 
            variant="outline-info" 
            className="ms-2"
            onClick={() => window.location.href = `/contrats/${contratId}`}
          >
            <i className="bi bi-eye me-2"></i>
            Voir le contrat généré
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContratGenerationActions;