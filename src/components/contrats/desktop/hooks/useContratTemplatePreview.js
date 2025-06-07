/**
 * Hook personnalisé pour gérer la logique de prévisualisation du modèle de contrat
 */
export const useContratTemplatePreview = (
  bodyContent,
  headerContent,
  headerHeight,
  headerBottomMargin,
  footerContent,
  footerHeight,
  footerTopMargin,
  logoUrl,
  titleTemplate,
  signatureTemplate
) => {
  // Fonction pour estimer approximativement la quantité de pages nécessaires
  const countEstimatedPages = (content, hasTitle = true, hasSignature = true) => {
    if (!content) return 1;
    
    // Compter les sauts de page explicites
    const explicitBreaks = (content.match(/\[SAUT_DE_PAGE\]/g) || []).length;
    
    // Si des sauts de page sont définis, on utilise ce nombre + 1
    if (explicitBreaks > 0) {
      return explicitBreaks + 1;
    }
    
    // Estimation très approximative basée sur le nombre de caractères
    // Une page A4 standard contient environ 3000 caractères (avec marges et taille de police standard)
    const contentLength = content.length;
    
    // Tenir compte de l'espace pris par le titre et la signature
    let totalLength = contentLength;
    if (hasTitle) totalLength += 200; // Espace approximatif du titre
    if (hasSignature) totalLength += 500; // Espace approximatif de la signature
    
    const estimatedPages = Math.max(1, Math.ceil(totalLength / 3000));
    
    return estimatedPages;
  };

  // Fonction pour remplacer les variables par des valeurs fictives
  const replaceVariables = (content) => {
    if (!content) return '';
    
    return content
      .replace(/{programmateur_nom}/g, 'Jean Dupont') // Rétrocompatibilité
      .replace(/{contact_nom}/g, 'Jean Dupont') // Version moderne
      .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ') // Rétrocompatibilité
      .replace(/{contact_structure}/g, 'Association Culturelle XYZ') // Version moderne
      .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr') // Rétrocompatibilité
      .replace(/{contact_email}/g, 'contact@asso-xyz.fr') // Version moderne
      .replace(/{programmateur_siret}/g, '123 456 789 00012') // Rétrocompatibilité
      .replace(/{contact_siret}/g, '123 456 789 00012') // Version moderne
      .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
      .replace(/{artiste_genre}/g, 'Rock Alternatif')
      .replace(/{concert_titre}/g, 'Concert de printemps')
      .replace(/{concert_date}/g, '15/05/2025')
      .replace(/{concert_montant}/g, '800')
      .replace(/{lieu_nom}/g, 'Salle des fêtes')
      .replace(/{lieu_adresse}/g, '123 rue Principale')
      .replace(/{lieu_code_postal}/g, '75001')
      .replace(/{lieu_ville}/g, 'Paris')
      .replace(/{lieu_capacite}/g, '200')
      .replace(/{date_jour}/g, '30')
      .replace(/{date_mois}/g, '04')
      .replace(/{date_annee}/g, '2025')
      .replace(/{date_complete}/g, '30/04/2025');
  };

  // Générer le HTML pour l'aperçu avec des données fictives
  const getPreviewContent = () => {
    let content = `
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
    `;
    
    // Ajouter l'en-tête
    content += `<div class="header">`;
    if (logoUrl) {
      content += `
        <div class="logo-container">
          <img src="${logoUrl}" alt="Logo" />
        </div>
      `;
    }
    
    // Contenu de l'en-tête avec les variables remplacées
    let processedHeaderContent = replaceVariables(headerContent);
    
    content += processedHeaderContent;
    content += `</div>`;
    
    // Ajouter le corps
    content += `<div class="content">`;
    
    // Contenu principal avec les variables remplacées et les sauts de page visualisés
    let processedBodyContent = replaceVariables(bodyContent)
      // Remplacer les sauts de page par des visualisations
      .replace(/\[SAUT_DE_PAGE\]/g, '<div class="page-break"></div>');
    
    content += processedBodyContent;
    
    // Simuler la zone de signature
    let processedSignatureTemplate = replaceVariables(signatureTemplate);
    
    content += processedSignatureTemplate;
    content += `</div>`;
    
    // Ajouter le pied de page
    content += `<div class="footer">`;
    
    // Contenu du pied de page avec les variables remplacées
    let processedFooterContent = replaceVariables(footerContent);
    
    content += processedFooterContent;
    content += `</div>`;
    
    content += '</div>'; // Fermer .preview-container
    
    return content;
  };

  // Fonction pour générer l'aperçu multi-page pour l'iframe
  const generateMultiPagePreviewHtml = () => {
    // Déterminer le nombre de pages nécessaires
    const explicitBreaks = (bodyContent.match(/\[SAUT_DE_PAGE\]/g) || []).length;
    
    if (explicitBreaks > 0) {
      // Diviser le contenu par les sauts de page
      const contentByPage = bodyContent.split('[SAUT_DE_PAGE]');
      
      // Générer le HTML pour chaque page
      const pagesHtml = contentByPage.map((pageContent, index) => {
        const isFirstPage = index === 0;
        const isLastPage = index === contentByPage.length - 1;
        
        return `
          <div class="page">
            <div class="page-content">
              <div class="header">
                ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" /></div>` : ''}
                ${replaceVariables(headerContent)}
              </div>
              
              ${isFirstPage ? `
                <h1 style="; margin-bottom: 1.5em;" class="tc-text-center">
                  ${replaceVariables(titleTemplate)}
                </h1>
              ` : ''}
              
              <div>
                ${replaceVariables(pageContent)}
              </div>
              
              ${isLastPage ? `
                <div class="signature-section">
                  ${replaceVariables(signatureTemplate)}
                </div>
              ` : ''}
              
              <div class="footer">
                ${replaceVariables(footerContent)}
              </div>
              
              <div class="page-number">${index + 1} / ${contentByPage.length}</div>
            </div>
          </div>
        `;
      }).join('');
      
      return pagesHtml;
    } else {
      // Estimation du nombre de pages en l'absence de sauts de page explicites
      const estimatedPages = countEstimatedPages(bodyContent);
      
      // Créer au moins une page, ou même plusieurs pages vides si nécessaire
      let pagesHtml = '';
      
      for (let i = 0; i < estimatedPages; i++) {
        const isFirstPage = i === 0;
        const isLastPage = i === estimatedPages - 1;
        
        pagesHtml += `
          <div class="page">
            <div class="page-content">
              <div class="header">
                ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" /></div>` : ''}
                ${replaceVariables(headerContent)}
              </div>
              
              ${isFirstPage ? `
                <h1 style="; margin-bottom: 1.5em;" class="tc-text-center">
                  ${replaceVariables(titleTemplate)}
                </h1>
                
                <div>
                  ${replaceVariables(bodyContent)}
                </div>
              ` : ''}
              
              ${isLastPage ? `
                <div class="signature-section">
                  ${replaceVariables(signatureTemplate)}
                </div>
              ` : ''}
              
              <div class="footer">
                ${replaceVariables(footerContent)}
              </div>
              
              <div class="page-number">${i + 1} / ${estimatedPages}</div>
            </div>
          </div>
        `;
      }
      
      return pagesHtml;
    }
  };
  
  // Fonction pour générer le HTML complet pour l'iframe d'aperçu
  const getPreviewIframeContent = () => {
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
          ${generateMultiPagePreviewHtml()}
        </div>
      </body>
      </html>
    `;
  };
  
  return {
    countEstimatedPages,
    replaceVariables,
    getPreviewContent,
    getPreviewIframeContent
  };
};