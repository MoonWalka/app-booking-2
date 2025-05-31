// src/components/contrats/sections/ContratPdfViewer.js
import React from 'react';
import styles from '@/pages/ContratDetailsPage.module.css';

/**
 * Component for displaying different types of PDF previews
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

  // Créer le titre au format "nom_du_concert date_du_concert"
  const createCustomTitle = () => {
    const concertName = pdfData.concert?.titre || 'Concert';
    const concertDate = pdfData.concert?.date;
    
    if (concertDate) {
      // Gérer les timestamps Firestore
      let dateObj;
      if (concertDate.seconds) {
        dateObj = new Date(concertDate.seconds * 1000);
      } else {
        dateObj = new Date(concertDate);
      }
      
      if (!isNaN(dateObj.getTime())) {
        const formattedDate = dateObj.toLocaleDateString('fr-FR');
        return `${concertName} ${formattedDate}`;
      }
    }
    
    return concertName;
  };

  return (
    <div ref={forwardedRef} className={styles.pdfViewer}>
      {previewType === 'html' && (
        <div className={styles.pdfContent}>
          <ContratPDFWrapper.HTMLPreview 
            data={data}
            title={createCustomTitle()}
          />
        </div>
      )}
      
      {previewType === 'pdf' && (
        <>
          {isGeneratingPdfPreview ? (
            <div className={styles.pdfContent} style={{ textAlign: 'center', padding: 'var(--tc-space-10)' }}>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Génération de l'aperçu PDF...</span>
              </div>
              <h4>Génération de l'aperçu PDF en cours...</h4>
              <p className="text-muted">Cela peut prendre quelques secondes</p>
            </div>
          ) : pdfPreviewUrl ? (
            <div style={{ height: '600px' }}>
              <iframe 
                src={pdfPreviewUrl} 
                width="100%" 
                height="100%" 
                title="Aperçu PDF"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <div className={styles.pdfContent} style={{ textAlign: 'center', padding: 'var(--tc-space-10)' }}>
              <i className="bi bi-file-earmark-pdf" style={{ fontSize: '4rem', color: 'var(--tc-color-gray-300)', marginBottom: 'var(--tc-space-4)' }}></i>
              <h4>Aperçu PDF</h4>
              <p className="text-muted">Cliquez sur "Générer PDF" pour voir l'aperçu du contrat au format PDF.</p>
              <button 
                className="tc-btn tc-btn-primary mt-3" 
                onClick={onGeneratePreview}
                disabled={isGeneratingPdfPreview}
              >
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Générer PDF
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContratPdfViewer;