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
                line-height: 1.4;
                color: #212529;
                margin: 0;
                padding: 20px;
                background: white;
              }
              
              .facture-container {
                max-width: 800px;
                margin: 0 auto;
                min-height: 100vh;
              }
              
              /* En-tête avec coordonnées */
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
              }
              
              .diffuseur, .client {
                width: 45%;
              }
              
              .diffuseur h3, .client h3 {
                margin-top: 0;
                font-weight: bold;
                color: #000;
              }
              
              /* 1. EN-TÊTE */
              .titre-facture {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin: 30px 0 20px 0;
                color: #000;
                text-transform: uppercase;
              }
              
              .ref-objet {
                text-align: left;
                margin-bottom: 30px;
              }
              
              .ref-objet p {
                margin: 5px 0;
                font-size: 13px;
              }
              
              /* 2. TABLEAU PRINCIPAL */
              .tableau-principal {
                border: 2px solid #000;
                padding: 15px;
                margin: 30px 0;
                position: relative;
              }
              
              .lignes-facturation {
                margin-bottom: 15px;
              }
              
              .table-lignes {
                width: 100%;
                border-collapse: collapse;
                margin: 0;
              }
              
              .table-lignes td {
                padding: 8px 12px;
                border: none;
                font-size: 13px;
              }
              
              .table-lignes .montant-ht {
                text-align: right;
                font-weight: 500;
              }
              
              .total-ht {
                text-align: right;
                font-size: 14px;
                font-weight: bold;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #ccc;
              }
              
              /* Layout en bas avec 4 sections */
              .bottom-layout {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-gap: 30px;
                margin-top: 40px;
              }
              
              /* 3. SECTION TVA */
              .section-tva {
                grid-column: 1;
                grid-row: 1;
              }
              
              .section-tva h4 {
                margin: 0 0 10px 0;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
              }
              
              .table-tva {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
              }
              
              .table-tva th, .table-tva td {
                padding: 6px 8px;
                border: 1px solid #000;
                text-align: center;
              }
              
              .table-tva th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              
              /* 4. SECTION ACOMPTE À PAYER */
              .section-paiement {
                grid-column: 2;
                grid-row: 1;
              }
              
              .montants-paiement {
                text-align: right;
              }
              
              .montants-paiement p {
                margin: 5px 0;
                font-size: 13px;
              }
              
              .montant-final {
                background-color: #e0e0e0;
                padding: 8px;
                margin: 10px 0;
                font-weight: bold !important;
              }
              
              .montant-lettres {
                font-style: italic;
                font-size: 12px;
                margin-top: 15px;
              }
              
              /* 5. TABLEAU RÉCAPITULATIF */
              .section-recapitulatif {
                grid-column: 1;
                grid-row: 2;
              }
              
              .section-recapitulatif h4 {
                margin: 0 0 10px 0;
                font-size: 13px;
                font-weight: bold;
                text-transform: uppercase;
              }
              
              .table-recapitulatif {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
              }
              
              .table-recapitulatif th, .table-recapitulatif td {
                padding: 6px 8px;
                border: 1px solid #000;
                text-align: center;
              }
              
              .table-recapitulatif th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              
              /* 6. ENCADRÉ MODALITÉS */
              .section-modalites {
                grid-column: 2;
                grid-row: 2;
              }
              
              .encadre-modalites {
                border: 2px solid #000;
                padding: 15px;
                font-size: 12px;
              }
              
              .encadre-modalites p {
                margin: 8px 0;
              }
              
              /* Coordonnées bancaires */
              .coordonnees-bancaires {
                margin-top: 30px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 4px;
                grid-column: 1 / -1;
              }
              
              .coordonnees-bancaires h4 {
                margin-top: 0;
                font-size: 14px;
              }
              
              /* Mentions légales */
              .mentions-legales {
                margin-top: 20px;
                font-size: 10px;
                font-style: italic;
                color: #666;
                grid-column: 1 / -1;
              }
              
              /* Tables générales */
              table {
                border-collapse: collapse;
              }
              
              @media print {
                body {
                  padding: 0;
                }
                
                .facture-container {
                  page-break-inside: avoid;
                }
                
                .bottom-layout {
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