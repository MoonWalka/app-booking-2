// src/components/contrats/sections/ContratPdfViewer.js
import React from 'react';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { PDFViewer } from '@react-pdf/renderer';
import styles from './ContratPdfViewer.module.css';

/**
 * Component for displaying different types of PDF previews
 * Migré vers le composant Alert standardisé TourCraft
 */
const ContratPdfViewer = ({
  previewType,
  forwardedRef,
  pdfData,
  ContratPDFWrapper,
  isGeneratingPdfPreview,
  pdfPreviewUrl,
  onGeneratePreview
}) => {
  const data = {
    template: pdfData.template,
    contratData: pdfData.contrat,
    concertData: pdfData.concert,
    programmateurData: pdfData.programmateur,
    artisteData: pdfData.artiste,
    lieuData: pdfData.lieu,
    entrepriseInfo: pdfData.entreprise
  };

  return (
    <div ref={forwardedRef} className={styles.pdfViewerContainer}>
      <Card title="Aperçu du contrat">
        <div className="preview-content mt-3">
          {previewType === 'html' && (
            <div className={styles.htmlPreview}>
              <ContratPDFWrapper.HTMLPreview 
                data={data}
                title={`Contrat - ${pdfData.concert?.titre || 'Concert'}`}
              />
            </div>
          )}
          
          {previewType === 'react-pdf' && (
            <div className={styles.reactPdfPreview}>
              <Alert variant="warning">
                Cet aperçu est simplifié. La mise en page peut différer du résultat final.
              </Alert>
              <PDFViewer width="100%" height={550}>
                <ContratPDFWrapper 
                  template={pdfData.template}
                  contratData={pdfData.contrat}
                  concertData={pdfData.concert}
                  programmateurData={pdfData.programmateur}
                  artisteData={pdfData.artiste}
                  lieuData={pdfData.lieu}
                  entrepriseInfo={pdfData.entreprise}
                />
              </PDFViewer>
            </div>
          )}
          
          {previewType === 'pdf' && (
            <div className={styles.pdfExactPreview}>
              {isGeneratingPdfPreview ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Génération de l'aperçu PDF...</span>
                  </div>
                  <p className="mt-3">Génération de l'aperçu PDF en cours...</p>
                  <p className="text-muted small">Cela peut prendre quelques secondes</p>
                </div>
              ) : pdfPreviewUrl ? (
                <div className={styles.pdfContainer}>
                  <Alert variant="success">
                    Cet aperçu est identique au PDF qui sera téléchargé.
                  </Alert>
                  <iframe 
                    src={pdfPreviewUrl} 
                    width="100%" 
                    height={550} 
                    title="Aperçu PDF"
                    className={styles.pdfIframe}
                  />
                </div>
              ) : (
                <div className="text-center p-5">
                  <button 
                    className="tc-btn-primary" 
                    onClick={onGeneratePreview}
                    disabled={isGeneratingPdfPreview}
                  >
                    <i className="bi bi-file-earmark-pdf me-2"></i>
                    Générer l'aperçu PDF exact
                  </button>
                  <p className="text-muted mt-3">
                    L'aperçu PDF utilise le même moteur de rendu que le PDF final
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ContratPdfViewer;