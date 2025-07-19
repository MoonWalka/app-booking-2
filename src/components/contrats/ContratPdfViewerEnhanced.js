import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonGroup, Spinner } from 'react-bootstrap';
import styles from './ContratPdfViewerEnhanced.module.css';

/**
 * Composant d'aperçu PDF amélioré avec contrôles intégrés
 * Supporte l'affichage, le téléchargement et l'impression directe
 */
function ContratPdfViewerEnhanced({ 
  pdfUrl, 
  htmlContent, 
  previewType = 'html', 
  fileName = 'contrat.pdf',
  onDownload,
  onPrint,
  height = '750px' 
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const objectRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [pdfUrl, htmlContent, previewType]);

  // Gestionnaire pour l'impression
  const handlePrint = () => {
    try {
      if (previewType === 'html' && iframeRef.current) {
        // Impression du contenu HTML
        iframeRef.current.contentWindow.print();
      } else if (previewType === 'pdf' && objectRef.current) {
        // Pour PDF, ouvrir dans une nouvelle fenêtre pour impression
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          });
        }
      }
      onPrint?.();
    } catch (err) {
      console.error('Erreur lors de l\'impression:', err);
      setError('Impossible d\'imprimer le document');
    }
  };

  // Gestionnaire pour le téléchargement
  const handleDownload = async () => {
    try {
      if (previewType === 'pdf' && pdfUrl) {
        // Télécharger le PDF existant
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (previewType === 'html') {
        // Déclencher la génération PDF si nécessaire
        if (onDownload) {
          onDownload();
        } else {
          setError('La génération PDF n\'est pas disponible');
        }
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setError('Impossible de télécharger le document');
    }
  };

  // Gestionnaire pour ouvrir dans un nouvel onglet
  const handleOpenInNewTab = () => {
    if (previewType === 'pdf' && pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else if (previewType === 'html' && htmlContent) {
      const newWindow = window.open('', '_blank');
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  // Gestionnaire de chargement pour iframe
  const handleIframeLoad = () => {
    setLoading(false);
    
    // Injecter des styles d'impression si nécessaire
    if (previewType === 'html' && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        const style = iframeDoc.createElement('style');
        style.textContent = `
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            @page { margin: 2cm; }
          }
        `;
        iframeDoc.head.appendChild(style);
      }
    }
  };

  // Gestionnaire de chargement pour object (PDF)
  const handleObjectLoad = () => {
    setLoading(false);
  };

  // Gestionnaire d'erreur
  const handleError = () => {
    setLoading(false);
    setError('Impossible de charger le document');
  };

  return (
    <div className={styles.pdfViewerContainer}>
      {/* Barre d'outils */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h5 className={styles.title}>
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Aperçu du contrat
          </h5>
        </div>
        
        <ButtonGroup className={styles.toolbarRight}>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handlePrint}
            disabled={loading}
            title="Imprimer"
          >
            <i className="bi bi-printer"></i>
            <span className="d-none d-md-inline ms-2">Imprimer</span>
          </Button>
          
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleDownload}
            disabled={loading}
            title="Télécharger"
          >
            <i className="bi bi-download"></i>
            <span className="d-none d-md-inline ms-2">Télécharger</span>
          </Button>
          
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleOpenInNewTab}
            disabled={loading}
            title="Ouvrir dans un nouvel onglet"
          >
            <i className="bi bi-box-arrow-up-right"></i>
            <span className="d-none d-md-inline ms-2">Nouvel onglet</span>
          </Button>
        </ButtonGroup>
      </div>

      {/* Zone de visualisation */}
      <div className={styles.viewerWrapper} style={{ height }}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </Spinner>
            <p className="mt-3">Chargement du document...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorOverlay}>
            <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
            <p className="mt-3 text-danger">{error}</p>
            <Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>
              Rafraîchir
            </Button>
          </div>
        )}

        {/* Affichage HTML */}
        {previewType === 'html' && htmlContent && (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className={styles.viewer}
            onLoad={handleIframeLoad}
            onError={handleError}
            title="Aperçu du contrat"
            style={{ display: loading ? 'none' : 'block' }}
          />
        )}

        {/* Affichage PDF */}
        {previewType === 'pdf' && pdfUrl && (
          <object
            ref={objectRef}
            data={pdfUrl}
            type="application/pdf"
            className={styles.viewer}
            onLoad={handleObjectLoad}
            onError={handleError}
            style={{ display: loading ? 'none' : 'block' }}
          >
            <p>
              Votre navigateur ne peut pas afficher ce PDF. 
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                Cliquez ici pour le télécharger
              </a>
            </p>
          </object>
        )}
      </div>

      {/* Barre d'état */}
      <div className={styles.statusBar}>
        <span className={styles.statusText}>
          {previewType === 'html' ? 'Aperçu HTML' : 'Document PDF'}
          {!loading && !error && ' - Prêt'}
        </span>
        <span className={styles.fileName}>
          <i className="bi bi-file-earmark me-1"></i>
          {fileName}
        </span>
      </div>
    </div>
  );
}

export default ContratPdfViewerEnhanced;