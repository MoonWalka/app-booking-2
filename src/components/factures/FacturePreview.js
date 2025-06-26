import React, { useRef, useEffect } from 'react';
import styles from './FacturePreview.module.css';

const FacturePreview = ({ html }) => {
  const iframeRef = useRef(null);
  
  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                font-size: 12px;
                line-height: 1.5;
                color: #212529;
                margin: 0;
                padding: 20px;
                background: white;
              }
              
              .facture-container {
                max-width: 800px;
                margin: 0 auto;
              }
              
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
              }
              
              .diffuseur, .client {
                width: 45%;
              }
              
              .titre-facture {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin: 30px 0;
                color: #000;
              }
              
              .info-ligne {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 4px;
              }
              
              .info-ligne strong {
                color: #495057;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              
              th, td {
                padding: 10px;
                text-align: left;
                border: 1px solid #dee2e6;
              }
              
              th {
                background-color: #f8f9fa;
                font-weight: 600;
              }
              
              .montant {
                text-align: right;
              }
              
              .total {
                font-weight: bold;
                font-size: 14px;
              }
              
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                font-size: 11px;
                color: #6c757d;
              }
              
              .coordonnees-bancaires {
                margin-top: 30px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 4px;
              }
              
              .montant-lettres {
                margin: 20px 0;
                padding: 15px;
                background-color: #e9ecef;
                border-radius: 4px;
                text-align: center;
                font-style: italic;
              }
              
              @media print {
                body {
                  padding: 0;
                }
                
                .facture-container {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            ${html || '<div class="facture-container"><p>Aperçu en cours de génération...</p></div>'}
          </body>
        </html>
      `);
      doc.close();
    }
  }, [html]);
  
  return (
    <div className={styles.preview}>
      <iframe
        ref={iframeRef}
        className={styles.iframe}
        title="Aperçu de la facture"
      />
    </div>
  );
};

export default FacturePreview;