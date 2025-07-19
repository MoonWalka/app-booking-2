import React from 'react';
import styles from './ContratPdfViewerSimple.module.css';

/**
 * Composant d'aperçu PDF simple, inspiré du composant ExtJS
 * Affiche un PDF dans une balise object avec un conteneur minimaliste
 */
function ContratPdfViewerSimple({ 
  pdfUrl, 
  width = "100%", 
  height = "750",
  containerId = "contract-preview-pdf_1" 
}) {
  return (
    <div className={styles.panelBwrap}>
      <div className={styles.panelBody}>
        <div id={containerId}>
          <div className={styles.objectContainer}>
            <object 
              id={`obj-preview-pdf-${containerId}`}
              width={width}
              height={height}
              data={pdfUrl}
              type="application/pdf"
              className={styles.pdfObject}
            >
              {/* Fallback pour navigateurs ne supportant pas object */}
              <p className={styles.fallback}>
                Votre navigateur ne peut pas afficher le PDF. 
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  Téléchargez-le ici
                </a>.
              </p>
            </object>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContratPdfViewerSimple;