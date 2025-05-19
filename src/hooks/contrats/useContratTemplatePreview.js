// hooks/contrats/useContratTemplatePreview.js
import { useMemo } from 'react';
import { replaceVariablesWithMockData } from './contractVariables';

/**
 * Hook personnalisé pour gérer la prévisualisation des modèles de contrat
 * 
 * @param {Object} templateData - Données du modèle de contrat
 * @returns {Object} - Fonctions et données pour la prévisualisation
 */
const useContratTemplatePreview = (templateData) => {
  const {
    bodyContent,
    headerContent,
    headerHeight,
    headerBottomMargin,
    footerContent,
    footerHeight,
    footerTopMargin,
    titleTemplate,
    signatureTemplate,
    logoUrl
  } = templateData;

  /**
   * Fonction pour estimer le nombre de pages en fonction du contenu
   * @param {string} content - Contenu du contrat
   * @param {boolean} hasTitle - Si le contrat inclut un titre
   * @param {boolean} hasSignature - Si le contrat inclut une signature
   * @returns {number} - Nombre estimé de pages
   */
  const countEstimatedPages = (content, hasTitle = true, hasSignature = true) => {
    if (!content) return 1;
    
    // Compter les sauts de page explicites
    const explicitBreaks = (content.match(/\[SAUT_DE_PAGE\]/g) || []).length;
    
    // Si des sauts de page sont définis, on utilise ce nombre + 1
    if (explicitBreaks > 0) {
      return explicitBreaks + 1;
    }
    
    // Estimation très approximative basée sur le nombre de caractères
    // Une page A4 standard contient environ 3000 caractères (avec marges et taille standard)
    const contentLength = content.length;
    
    // Tenir compte de l'espace pris par le titre et la signature
    let totalLength = contentLength;
    if (hasTitle) totalLength += 200; // Espace approximatif du titre
    if (hasSignature) totalLength += 500; // Espace approximatif de la signature
    
    return Math.max(1, Math.ceil(totalLength / 3000));
  };

  /**
   * Génère le HTML pour l'aperçu avec mise en page simple
   * @returns {string} HTML pour l'aperçu simple
   */
  const generateBasicPreviewHtml = useMemo(() => {
    const processedBodyContent = replaceVariablesWithMockData(bodyContent)
      .replace(/\[SAUT_DE_PAGE\]/g, '<div class="page-break"></div>');

    return `
      <style>
        .preview-container {
          font-family: Arial, sans-serif;
          font-size: 11px;
          position: relative;
        }
        .header {
          height: ${headerHeight}mm;
          margin-bottom: ${headerBottomMargin}mm;
          position: relative;
          border-bottom: 1px solid #eee;
        }
        .content {
          min-height: calc(100% - ${headerHeight}mm - ${footerHeight}mm - ${headerBottomMargin}mm - ${footerTopMargin}mm);
        }
        .footer {
          height: ${footerHeight}mm;
          margin-top: ${footerTopMargin}mm;
          position: relative;
          border-top: 1px solid #eee;
        }
        .logo-container {
          position: absolute;
          top: 0;
          left: 0;
          max-height: ${headerHeight}mm;
          max-width: 30%;
        }
        .logo-container img {
          max-height: 100%;
          max-width: 100%;
        }
        /* Style pour les sauts de page dans l'aperçu */
        .page-break {
          display: block;
          width: 100%;
          margin: 20px 0;
          padding: 10px 0;
          border-top: 2px dashed #999;
          border-bottom: 2px dashed #999;
          text-align: center;
          background-color: #f8f9fa;
        }
        .page-break::before {
          content: "⁂ SAUT DE PAGE ⁂";
          font-size: 12px;
          color: #666;
        }
      </style>
      <div class="preview-container">
        <div class="header">
          ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" /></div>` : ''}
          ${replaceVariablesWithMockData(headerContent)}
        </div>
        
        <div class="content">
          <h1 style="; margin-bottom: 20px;" class="tc-text-center">
            ${replaceVariablesWithMockData(titleTemplate)}
          </h1>
          
          <div>
            ${processedBodyContent}
          </div>
          
          <div>
            ${replaceVariablesWithMockData(signatureTemplate)}
          </div>
        </div>
        
        <div class="footer">
          ${replaceVariablesWithMockData(footerContent)}
        </div>
      </div>
    `;
  }, [bodyContent, headerContent, footerContent, titleTemplate, signatureTemplate, logoUrl, 
      headerHeight, headerBottomMargin, footerHeight, footerTopMargin]);
  
  /**
   * Génère le HTML pour l'aperçu multipages avancé
   * @returns {string} HTML pour l'aperçu multipages
   */
  const generateMultiPagePreviewHtml = useMemo(() => {
    // Déterminer le nombre de pages nécessaires
    let pageCount = 1;
    let contentByPage = [];
    
    const explicitBreaks = (bodyContent.match(/\[SAUT_DE_PAGE\]/g) || []).length;
    if (explicitBreaks > 0) {
      pageCount = explicitBreaks + 1;
      contentByPage = bodyContent.split('[SAUT_DE_PAGE]');
    } else {
      pageCount = countEstimatedPages(bodyContent);
      contentByPage = [bodyContent];
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Aperçu du contrat</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
          }
          .contrat-preview {
            margin: 0 auto;
            width: 100%;
            max-width: 800px;
            padding: 20px;
          }
          .page {
            width: 100%;
            height: 267mm; /* Taille A4 moins marges */
            box-sizing: border-box;
            background-color: #fff;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
            page-break-after: always;
          }
          .page:last-child {
            page-break-after: avoid;
          }
          .page-content {
            padding: 20mm;
            position: relative;
            height: 100%;
          }
          .header {
            border-bottom: 1px solid #eee;
            margin-bottom: ${headerBottomMargin}mm;
            height: ${headerHeight}mm;
            position: relative;
          }
          .footer {
            border-top: 1px solid #eee;
            margin-top: ${footerTopMargin}mm;
            height: ${footerHeight}mm;
            position: relative;
          }
          .logo-container {
            position: absolute;
            top: 0;
            left: 0;
            max-height: ${headerHeight}mm;
            max-width: 30%;
          }
          .logo-container img {
            max-height: 100%;
            max-width: 100%;
          }
          .page-number {
            position: absolute;
            bottom: 5mm;
            text-align: center;
            width: 100%;
            font-size: 10px;
            color: #666;
          }
        </style>
        <script>
          // Cette fonction s'exécute au chargement de la page
          window.onload = function() {
            // Récupérer tous les éléments de page
            const pages = document.querySelectorAll('.page');
            const totalPages = pages.length;
            
            // Mettre à jour tous les numéros de page
            pages.forEach((page, index) => {
              const pageNumber = page.querySelector('.page-number');
              if (pageNumber) {
                pageNumber.textContent = (index + 1) + ' / ' + totalPages;
              }
            });
          }
        </script>
      </head>
      <body>
        <div class="contrat-preview">
          ${(() => {
            // Si nous avons des sauts de page explicites
            if (explicitBreaks > 0) {
              return contentByPage.map((pageContent, index) => {
                const isFirstPage = index === 0;
                const isLastPage = index === contentByPage.length - 1;
                
                return `
                  <div class="page">
                    <div class="page-content">
                      <div class="header">
                        ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" /></div>` : ''}
                        ${replaceVariablesWithMockData(headerContent)}
                      </div>
                      
                      ${isFirstPage ? `
                        <h1 style="; margin-bottom: 1.5em;" class="tc-text-center">
                          ${replaceVariablesWithMockData(titleTemplate)}
                        </h1>
                      ` : ''}
                      
                      <div>
                        ${replaceVariablesWithMockData(pageContent)}
                      </div>
                      
                      ${isLastPage ? `
                        <div class="signature-section">
                          ${replaceVariablesWithMockData(signatureTemplate)}
                        </div>
                      ` : ''}
                      
                      <div class="footer">
                        ${replaceVariablesWithMockData(footerContent)}
                      </div>
                      
                      <div class="page-number">${index + 1} / ${contentByPage.length}</div>
                    </div>
                  </div>
                `;
              }).join('');
            } else {
              // Estimation du nombre de pages en l'absence de sauts explicites
              let pagesHtml = '';
              
              for (let i = 0; i < pageCount; i++) {
                const isFirstPage = i === 0;
                const isLastPage = i === pageCount - 1;
                
                pagesHtml += `
                  <div class="page">
                    <div class="page-content">
                      <div class="header">
                        ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" /></div>` : ''}
                        ${replaceVariablesWithMockData(headerContent)}
                      </div>
                      
                      ${isFirstPage ? `
                        <h1 style="; margin-bottom: 1.5em;" class="tc-text-center">
                          ${replaceVariablesWithMockData(titleTemplate)}
                        </h1>
                        
                        <div>
                          ${replaceVariablesWithMockData(bodyContent)}
                        </div>
                      ` : ''}
                      
                      ${isLastPage ? `
                        <div class="signature-section">
                          ${replaceVariablesWithMockData(signatureTemplate)}
                        </div>
                      ` : ''}
                      
                      <div class="footer">
                        ${replaceVariablesWithMockData(footerContent)}
                      </div>
                      
                      <div class="page-number">${i + 1} / ${pageCount}</div>
                    </div>
                  </div>
                `;
              }
              
              return pagesHtml;
            }
          })()}
        </div>
      </body>
      </html>
    `;
  }, [bodyContent, headerContent, footerContent, titleTemplate, signatureTemplate, logoUrl,
      headerHeight, headerBottomMargin, footerHeight, footerTopMargin]);
  
  return {
    countEstimatedPages,
    generateBasicPreviewHtml,
    generateMultiPagePreviewHtml
  };
};

export default useContratTemplatePreview;