import React, { useState, useRef, useEffect } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import styles from './ContratPdfViewerWithControls.module.css';

/**
 * Composant PDF avec contrôles personnalisés pour tous les navigateurs
 * Inclut zoom, navigation et impression même sur Safari
 */
function ContratPdfViewerWithControls({ 
  pdfUrl,
  width = "100%",
  height = "750px"
}) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  // Gérer le chargement pour les data URLs HTML
  useEffect(() => {
    if (pdfUrl.startsWith('data:text/html')) {
      setLoading(false);
    }
  }, [pdfUrl]);

  // Fonction pour changer le zoom
  const handleZoom = (newZoom) => {
    setZoom(newZoom);
  };

  // Fonction d'impression
  const handlePrint = () => {
    // Pour les data URLs HTML, créer une fenêtre temporaire pour l'impression
    if (pdfUrl.startsWith('data:text/html')) {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      const htmlContent = decodeURIComponent(pdfUrl.split(',')[1]);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Impression du contrat</title>
          <style>
            @media print {
              body { 
                margin: 0;
                font-size: 12pt;
              }
              @page { 
                margin: 2cm;
                size: A4;
              }
              /* Sauts de page */
              .page-break, .saut-de-page {
                page-break-after: always;
                break-after: always;
              }
              .page-break-before {
                page-break-before: always;
                break-before: always;
              }
              .avoid-break {
                page-break-inside: avoid;
                break-inside: avoid;
              }
              /* Éviter les sauts dans les paragraphes et titres */
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
                break-after: avoid;
              }
              p {
                orphans: 3;
                widows: 3;
              }
              /* Images et tableaux */
              img, table {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
              color: #000;
            }
            /* Classes pour forcer les sauts de page */
            .page-break, .saut-de-page {
              display: block;
              height: 0;
              visibility: hidden;
            }
            /* Styles Quill */
            .ql-align-center { text-align: center; }
            .ql-align-right { text-align: right; }
            .ql-align-justify { text-align: justify; }
            /* Conserver les styles des images */
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>${htmlContent}</body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Fermer la fenêtre après l'impression (l'utilisateur peut annuler)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } else if (iframeRef.current) {
      // Pour les vrais PDF, utiliser la méthode iframe
      try {
        iframeRef.current.contentWindow.print();
      } catch (e) {
        // Fallback : ouvrir dans nouvel onglet pour imprimer
        window.open(pdfUrl, '_blank');
      }
    }
  };

  // Fonction de téléchargement
  const handleDownload = async () => {
    if (pdfUrl.startsWith('data:text/html')) {
      // Pour les data URLs HTML, créer un fichier HTML téléchargeable
      const htmlContent = decodeURIComponent(pdfUrl.split(',')[1]);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contrat.html';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // Pour les vrais PDF
      try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        // Fallback : ouvrir dans nouvel onglet
        window.open(pdfUrl, '_blank');
      }
    }
  };

  const zoomLevels = [50, 75, 100, 125, 150, 200];

  return (
    <div className={styles.container} style={{ width: width, height: height }}>
      {/* Barre de contrôles personnalisée */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <span className={styles.label}>Zoom :</span>
          <ButtonGroup size="sm">
            <Button 
              variant="outline-secondary"
              onClick={() => handleZoom(Math.max(50, zoom - 25))}
              title="Zoom arrière"
            >
              <i className="bi bi-zoom-out"></i>
            </Button>
            
            <select 
              className={styles.zoomSelect}
              value={zoom}
              onChange={(e) => handleZoom(parseInt(e.target.value))}
            >
              {zoomLevels.map(level => (
                <option key={level} value={level}>{level}%</option>
              ))}
            </select>
            
            <Button 
              variant="outline-secondary"
              onClick={() => handleZoom(Math.min(200, zoom + 25))}
              title="Zoom avant"
            >
              <i className="bi bi-zoom-in"></i>
            </Button>
          </ButtonGroup>
        </div>

        <div className={styles.toolbarGroup}>
          <Button 
            variant="outline-primary"
            size="sm"
            onClick={handlePrint}
            title="Imprimer"
          >
            <i className="bi bi-printer"></i> Imprimer
          </Button>
          
          <Button 
            variant="outline-primary"
            size="sm"
            onClick={handleDownload}
            title="Télécharger"
          >
            <i className="bi bi-download"></i> Télécharger
          </Button>
        </div>
      </div>

      {/* Zone d'affichage du PDF avec zoom appliqué */}
      <div className={styles.viewerContainer}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Chargement du PDF...</p>
          </div>
        )}
        
        {pdfUrl.startsWith('data:text/html') ? (
          // Pour le contenu HTML, utiliser un div avec dangerouslySetInnerHTML
          <div
            className={styles.pdfViewer}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              width: `${100 / (zoom / 100)}%`,
              height: `${100 / (zoom / 100)}%`,
              maxWidth: 'none',
              padding: '40px',
              overflow: 'auto',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          >
            <style dangerouslySetInnerHTML={{ __html: `
              /* Visualisation des sauts de page dans l'aperçu */
              .page-break, .saut-de-page {
                display: block;
                position: relative;
                height: 60px;
                margin: 40px -40px;
                background: repeating-linear-gradient(
                  to bottom,
                  transparent,
                  transparent 10px,
                  #f0f0f0 10px,
                  #f0f0f0 20px
                );
                border-top: 2px dashed #999;
                border-bottom: 2px dashed #999;
                page-break-after: always;
              }
              .page-break::before, .saut-de-page::before {
                content: "--- Saut de page ---";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #f8f8f8;
                padding: 5px 20px;
                color: #666;
                font-size: 14px;
                font-family: Arial, sans-serif;
                font-weight: bold;
                border: 1px solid #ddd;
                border-radius: 20px;
              }
              /* Styles Quill */
              .ql-align-center { text-align: center; }
              .ql-align-right { text-align: right; }
              .ql-align-justify { text-align: justify; }
              /* Images */
              img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 10px auto;
              }
              /* Améliorer la lisibilité */
              p {
                margin-bottom: 1em;
                line-height: 1.6;
              }
              h1, h2, h3, h4, h5, h6 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
              }
            ` }} />
            <div 
              dangerouslySetInnerHTML={{ 
                __html: decodeURIComponent(pdfUrl.split(',')[1])
              }}
            />
          </div>
        ) : (
          // Pour les vrais PDF, utiliser iframe
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            width="100%"
            height="100%"
            className={styles.pdfViewer}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              width: `${100 / (zoom / 100)}%`,
              height: `${100 / (zoom / 100)}%`,
              maxWidth: 'none'
            }}
            title="Document PDF"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              console.error('Erreur de chargement du PDF');
            }}
          />
        )}
        
        {/* Fallback si le PDF ne charge pas */}
        {!loading && (
          <noscript>
            <div className={styles.fallback}>
              <p>Si le PDF ne s'affiche pas, 
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  cliquez ici pour l'ouvrir
                </a>
              </p>
            </div>
          </noscript>
        )}
      </div>
    </div>
  );
}

export default ContratPdfViewerWithControls;