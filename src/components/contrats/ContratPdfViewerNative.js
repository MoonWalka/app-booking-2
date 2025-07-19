import React, { useState } from 'react';
import styles from './ContratPdfViewerNative.module.css';

/**
 * Composant d'aperçu PDF avec contrôles natifs du navigateur
 * Utilise iframe ou object pour afficher les contrôles PDF natifs (zoom, impression, etc.)
 */
function ContratPdfViewerNative({ 
  pdfUrl,
  htmlContent,
  type = 'pdf', // 'pdf' ou 'html'
  width = "100%",
  height = "750px",
  title = "Aperçu du contrat"
}) {
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  if (type === 'html' && htmlContent) {
    // Pour l'HTML, on utilise un iframe avec srcDoc
    return (
      <div className={styles.container} style={{ height }}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Chargement de l'aperçu...</p>
          </div>
        )}
        <iframe
          srcDoc={htmlContent}
          width={width}
          height="100%"
          className={styles.viewer}
          onLoad={handleLoad}
          title={title}
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
    );
  }

  if (type === 'pdf' && pdfUrl) {
    // Pour le PDF, on utilise un iframe qui affichera les contrôles natifs du navigateur
    // L'iframe est préférable à object car il offre une meilleure compatibilité
    return (
      <div className={styles.container} style={{ height }}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Chargement du PDF...</p>
          </div>
        )}
        <iframe
          src={pdfUrl}
          width={width}
          height="100%"
          className={styles.viewer}
          onLoad={handleLoad}
          title={title}
          style={{ display: loading ? 'none' : 'block' }}
        />
        {/* Fallback si le navigateur ne peut pas afficher le PDF */}
        <noscript>
          <div className={styles.fallback}>
            <p>
              Votre navigateur ne peut pas afficher ce PDF.
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                Cliquez ici pour le télécharger
              </a>
            </p>
          </div>
        </noscript>
      </div>
    );
  }

  // Si pas de contenu
  return (
    <div className={styles.container} style={{ height }}>
      <div className={styles.noContent}>
        <i className="bi bi-file-earmark-pdf" style={{ fontSize: '3rem', color: '#ccc' }}></i>
        <p>Aucun aperçu disponible</p>
      </div>
    </div>
  );
}

export default ContratPdfViewerNative;