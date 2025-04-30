// src/components/pdf/ContratPDFWrapper.js
import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import pdfService from '../../services/pdfService';
// Import du fichier CSS dédié à l'impression - Ce fichier sera utilisé pour les styles
import '@/styles/components/contrat-print.css';
// Import du fichier CSS modulaire pour les styles spécifiques au composant
import styles from './ContratPDFWrapper.module.css';

// Styles pour le PDF de fallback (mode prévisualisation simple)
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  content: {
    margin: 0,
    padding: 0,
    marginBottom: 15,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 5,
  },
  defaultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

/**
 * Fonction utilitaire pour créer des objets de données sécurisés
 * @param {Object} data - Les données brutes
 * @returns {Object} - Objet sécurisé contre les valeurs nulles/undefined
 */
const createSafeData = (data) => {
  const { 
    template, 
    contratData, 
    concertData, 
    programmateurData, 
    artisteData, 
    lieuData, 
    entrepriseInfo 
  } = data;

  // Utiliser la snapshot du template si disponible
  const effectiveTemplate = contratData?.templateSnapshot || template;
  
  // Sécuriser contre les valeurs nulles ou undefined
  const safeData = {
    template: effectiveTemplate,
    concert: concertData || {},
    programmateur: programmateurData || {},
    artiste: artisteData || {},
    lieu: lieuData || {},
    entreprise: entrepriseInfo || {}
  };

  return safeData;
};

/**
 * Fonction pour obtenir le libellé du type de template
 */
const getTemplateTypeLabel = (type) => {
  const types = {
    'session': 'Session standard',
    'co-realisation': 'Co-réalisation',
    'date-multiple': 'Dates multiples',
    'residency': 'Résidence artistique',
    'workshop': 'Atelier / Workshop',
    'custom': 'Prestation personnalisée'
  };
  
  return types[type] || type;
};

/**
 * Fonction pour formater les dates de manière sécurisée
 */
const formatSafeDate = (dateValue, formatString = "dd/MM/yyyy") => {
  if (!dateValue) return 'Non spécifiée';
  
  try {
    // Gérer les timestamps Firestore
    const date = dateValue.seconds 
      ? new Date(dateValue.seconds * 1000) 
      : new Date(dateValue);
    
    if (isNaN(date.getTime())) return 'Date invalide';
    
    return format(date, formatString, { locale: fr });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return 'Date invalide';
  }
};

/**
 * Prépare toutes les variables pour le remplacement dans le contrat
 */
const prepareContractVariables = (safeData) => {
  return {
    // Variables programmateur
    'programmateur_nom': safeData.programmateur.nom || 'Non spécifié',
    'programmateur_prenom': safeData.programmateur.prenom || '',
    'programmateur_structure': safeData.programmateur.structure || 'Non spécifiée',
    'programmateur_email': safeData.programmateur.email || 'Non spécifié',
    'programmateur_telephone': safeData.programmateur.telephone || 'Non spécifié',
    'programmateur_adresse': safeData.programmateur.adresse || 'Non spécifiée',
    'programmateur_siret': safeData.programmateur.siret || 'Non spécifié',
    
    // Variables artiste
    'artiste_nom': safeData.artiste.nom || 'Non spécifié',
    'artiste_genre': safeData.artiste.genre || 'Non spécifié',
    'artiste_contact': safeData.artiste.contact || 'Non spécifié',
    
    // Variables concert
    'concert_titre': safeData.concert.titre || 'Non spécifié',
    'concert_date': formatSafeDate(safeData.concert.date),
    'concert_heure': safeData.concert.heure || 'Non spécifiée',
    'concert_montant': safeData.concert.montant 
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(safeData.concert.montant) 
      : 'Non spécifié',
    
    // Variables lieu
    'lieu_nom': safeData.lieu.nom || 'Non spécifié',
    'lieu_adresse': safeData.lieu.adresse || 'Non spécifiée',
    'lieu_code_postal': safeData.lieu.codePostal || 'Non spécifié',
    'lieu_ville': safeData.lieu.ville || 'Non spécifiée',
    'lieu_capacite': safeData.lieu.capacite || 'Non spécifiée',
    
    // Variables de date
    'date_jour': format(new Date(), "dd", { locale: fr }),
    'date_mois': format(new Date(), "MMMM", { locale: fr }),
    'date_annee': format(new Date(), "yyyy", { locale: fr }),
    'date_complete': format(new Date(), "dd MMMM yyyy", { locale: fr }),
    
    // Ajouter le type de template comme variable
    'templateType': getTemplateTypeLabel(safeData.template.type || 'session')
  };
};

/**
 * Fonction pour remplacer les variables dans le contenu
 */
const replaceVariables = (content, variables) => {
  if (!content) return '';
  
  let processedContent = content;
  
  // Remplacer toutes les variables possibles
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    processedContent = processedContent.replace(regex, value);
  });
  
  return processedContent;
};

/**
 * Traite les sauts de page dans l'aperçu HTML
 */
const processPageBreaks = (htmlContent) => {
  // Remplacer les balises de saut de page par des div avec classe spéciale
  return htmlContent.replace(
    /<hr\s+class=["|']page-break["|'][^>]*>/gi,
    '<div class="page-break"></div>'
  );
};

/**
 * Fonction centrale pour générer le HTML du contrat
 * Cette fonction est utilisée à la fois pour l'aperçu et la génération du PDF final
 * 
 * @param {Object} data - Les données du contrat
 * @param {String} title - Titre par défaut
 * @param {Boolean} forPreview - Si vrai, adapte le HTML pour l'aperçu navigateur
 * @returns {String} - Le HTML complet du contrat
 */
const getContratHTML = (data, title = 'Contrat', forPreview = false) => {
  // Sécuriser les données
  const safeData = createSafeData(data);
  
  // Préparer les variables pour le remplacement
  const variables = prepareContractVariables(safeData);
  
  // Remplacer les variables dans tous les contenus du template
  const headerContent = replaceVariables(safeData.template.headerContent || '', variables);
  const bodyContent = replaceVariables(safeData.template.bodyContent || '', variables);
  const footerContent = replaceVariables(safeData.template.footerContent || '', variables);
  const signatureContent = replaceVariables(safeData.template.signatureTemplate || '', variables);
  // Conserver titleContent pour les métadonnées du document, mais ne pas l'afficher
  const titleContent = replaceVariables(safeData.template.titleTemplate || title, variables);
  
  // Traitement des sauts de page pour l'aperçu
  let bodyContentProcessed = forPreview ? processPageBreaks(bodyContent) : bodyContent;
  
  // CSS intégré directement dans le HTML pour s'assurer qu'il est disponible lors de la génération PDF
  const printCss = `
    /* ===== RÉGLAGES DE BASE DU DOCUMENT ===== */
    @page {
      size: A4;
      margin: 25mm 20mm 25mm 20mm;
    }

    /* ===== STYLES GÉNÉRAUX ===== */
    body.contrat-print-mode {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #000000;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background-color: white;
      background-image: none;
    }

    /* ===== TITRES ===== */
    .contrat-print-mode h1, 
    .contrat-print-mode h2, 
    .contrat-print-mode h3, 
    .contrat-print-mode h4, 
    .contrat-print-mode h5, 
    .contrat-print-mode h6 {
      page-break-after: avoid;
      page-break-inside: avoid;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
      color: #000000;
    }

    .contrat-print-mode h1 {
      font-size: 18pt;
      margin-top: 0;
      text-align: center;
    }

    .contrat-print-mode h2 { font-size: 16pt; }
    .contrat-print-mode h3 { font-size: 14pt; }
    .contrat-print-mode h4, 
    .contrat-print-mode h5, 
    .contrat-print-mode h6 { font-size: 12pt; }

    /* ===== PARAGRAPHES ET TEXTE ===== */
    .contrat-print-mode p {
      margin-bottom: 0.75em;
      text-align: justify;
    }

    .contrat-print-mode strong, .contrat-print-mode b { font-weight: bold; }
    .contrat-print-mode em, .contrat-print-mode i { font-style: italic; }

    .contrat-print-mode ul, .contrat-print-mode ol {
      margin: 0.75em 0;
      padding-left: 2em;
    }

    .contrat-print-mode li { margin-bottom: 0.5em; }

    /* ===== TABLEAUX ===== */
    .contrat-print-mode table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      page-break-inside: avoid;
    }

    .contrat-print-mode table, 
    .contrat-print-mode th, 
    .contrat-print-mode td {
      border: 1px solid #000000;
    }

    .contrat-print-mode th, .contrat-print-mode td {
      padding: 0.5em;
      text-align: left;
    }

    .contrat-print-mode th { 
      background-color: #f2f2f2;
      font-weight: bold;
    }

    /* ===== GESTION DES SAUTS DE PAGE ===== */
    .contrat-print-mode .page-break {
      page-break-after: always;
      border: none;
      height: 0;
      margin: 0;
      padding: 0;
    }

    /* Éviter les sauts au milieu des éléments importants */
    .contrat-print-mode table, 
    .contrat-print-mode figure, 
    .contrat-print-mode blockquote {
      page-break-inside: avoid;
    }

    /* ===== STRUCTURE ET LAYOUT DU DOCUMENT ===== */
    .contrat-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
    }

    .contrat-print-mode .header {
      margin-bottom: 20mm;
      position: relative;
      min-height: 20mm;
    }

    .contrat-print-mode .header-content { width: 100%; }
    .contrat-print-mode .body-content { margin-bottom: 20mm; }

    .contrat-print-mode .footer {
      margin-top: 15mm;
      position: relative;
      min-height: 15mm;
    }

    /* ===== LOGO ET ÉLÉMENTS GRAPHIQUES ===== */
    .contrat-print-mode .logo-container {
      position: absolute;
      top: 0;
      left: 0;
      max-height: 20mm;
      max-width: 30%;
    }

    .contrat-print-mode .logo-container img {
      max-height: 100%;
      max-width: 100%;
    }

    /* ===== SECTIONS SPÉCIFIQUES DU CONTRAT ===== */
    .contrat-print-mode .signature-section {
      margin-top: 30mm;
      page-break-inside: avoid;
    }

    /* ===== UTILITAIRES ===== */
    .contrat-print-mode .text-center { text-align: center; }
    .contrat-print-mode .text-right { text-align: right; }
    .contrat-print-mode .text-left { text-align: left; }

    /* ===== SUPPORT ReactQuill ===== */
    .contrat-print-mode .ql-align-center, 
    .contrat-print-mode p[style*="text-align: center"] {
      text-align: center;
    }
    .contrat-print-mode .ql-align-right, 
    .contrat-print-mode p[style*="text-align: right"] {
      text-align: right;
    }
    .contrat-print-mode .ql-align-justify, 
    .contrat-print-mode p[style*="text-align: justify"] {
      text-align: justify;
    }

    /* ===== APERÇU SEULEMENT ===== */
    @media screen {
      .contrat-print-mode {
        background-color: #f8f9fa;
        padding: 20px;
      }
      
      .contrat-print-mode .contrat-container {
        padding: 30px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        background-color: white;
      }
      
      .contrat-print-mode .page-break {
        border-top: 2px dashed #999;
        margin: 20px 0;
        position: relative;
        height: 20px;
      }
      
      .contrat-print-mode .page-break::after {
        content: "⟿ SAUT DE PAGE ⟿";
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 0 10px;
        font-size: 10px;
        color: #666;
        display: block !important;
      }
      
      .contrat-print-mode .preview-note {
        display: block !important;
        background-color: #fff3cd;
        color: #856404;
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid #ffeeba;
        border-radius: 4px;
        font-size: 0.9em;
        text-align: center;
      }
    }
  `;
  
  // Construire le contenu HTML complet
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${titleContent}</title>
      <style>
        ${printCss}
      </style>
    </head>
    <body class="contrat-print-mode">
  `;

  if (forPreview) {
    htmlContent += `<div class="contrat-container">`;
    htmlContent += `<div class="preview-note">Aperçu du contrat - La mise en page sera identique au téléchargement PDF final</div>`;
  }

  // Ajouter l'en-tête si défini
  if (headerContent) {
    htmlContent += `<div class="header">`;
    if (safeData.template.logoUrl) {
      htmlContent += `
        <div class="logo-container">
          <img src="${safeData.template.logoUrl}" alt="Logo" />
        </div>
      `;
    }
    htmlContent += `<div class="header-content">${headerContent}</div></div>`;
  }

  // Ajouter le corps du document
  htmlContent += `<div class="body-content">${bodyContentProcessed}</div>`;

  // Ajouter la signature si définie
  if (signatureContent) {
    htmlContent += `<div class="signature-section">${signatureContent}</div>`;
  }

  // Ajouter le pied de page si défini
  if (footerContent) {
    htmlContent += `<div class="footer">${footerContent}</div>`;
  }

  if (forPreview) {
    htmlContent += `</div>`; // Fermer .contrat-container
  }

  htmlContent += `
    </body>
    </html>
  `;

  return htmlContent;
};

/**
 * Méthode pour générer le PDF avec Puppeteer via Cloud Functions
 * Cette méthode est appelée lorsque l'utilisateur télécharge le document
 * 
 * @param {string} title - Titre du document
 * @param {object} data - Données nécessaires à la génération du PDF
 * @returns {Promise<Blob>} - Le blob PDF généré
 */
const generatePuppeteerPdf = async (title, data) => {
  try {
    // Utiliser la fonction commune pour générer le HTML
    const htmlContent = getContratHTML(data, title);
    
    // Récupérer les données sécurisées pour les options
    const safeData = createSafeData(data);
    
    // Options pour la génération PDF
    const options = {
      displayHeaderFooter: true,
      headerTemplate: safeData.template.headerContent ? `
        <div style="font-size: 9pt; padding: 5px 30px; width: 100%;">
          ${replaceVariables(safeData.template.headerContent, prepareContractVariables(safeData))}
        </div>
      ` : '',
      footerTemplate: safeData.template.footerContent ? `
        <div style="font-size: 9pt; padding: 5px 30px; width: 100%;">
          ${replaceVariables(safeData.template.footerContent, prepareContractVariables(safeData))}
          <div style="text-align: center; font-size: 8pt;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>
        </div>
      ` : '<div style="text-align: center; font-size: 8pt; padding: 5px 30px; width: 100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: {
        top: safeData.template.headerContent ? '60px' : '30px',
        bottom: safeData.template.footerContent ? '60px' : '30px',
        left: '30px',
        right: '30px'
      }
    };
    
    // Télécharger directement le PDF
    await pdfService.generateAndDownloadPdf(htmlContent, title, options);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF avec Puppeteer:', error);
    throw error;
  }
};

/**
 * Génère un aperçu PDF exact en utilisant Puppeteer et renvoie l'URL du Blob
 * @param {Object} data - Les données du contrat
 * @param {String} title - Titre du document
 * @returns {Promise<String>} - URL du blob PDF pour l'aperçu
 */
const generatePDFPreview = async (data, title = 'Aperçu Contrat') => {
  try {
    // Utiliser la même fonction que pour la génération finale
    const htmlContent = getContratHTML(data, title);
    
    // Récupérer les données sécurisées pour les options
    const safeData = createSafeData(data);
    
    // Options pour la génération PDF (mêmes que pour la version finale)
    const options = {
      displayHeaderFooter: true,
      headerTemplate: safeData.template.headerContent ? `
        <div style="font-size: 9pt; padding: 5px 30px; width: 100%;">
          ${replaceVariables(safeData.template.headerContent, prepareContractVariables(safeData))}
        </div>
      ` : '',
      footerTemplate: safeData.template.footerContent ? `
        <div style="font-size: 9pt; padding: 5px 30px; width: 100%;">
          ${replaceVariables(safeData.template.footerContent, prepareContractVariables(safeData))}
          <div style="text-align: center; font-size: 8pt;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>
        </div>
      ` : '<div style="text-align: center; font-size: 8pt; padding: 5px 30px; width: 100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: {
        top: safeData.template.headerContent ? '60px' : '30px',
        bottom: safeData.template.footerContent ? '60px' : '30px',
        left: '30px',
        right: '30px'
      },
      // Augmentation du timeout pour éviter les problèmes réseau
      timeout: 60000  // 60 secondes
    };
    
    try {
      // Générer le PDF mais ne pas le télécharger, renvoyer le blob URL
      const pdfBlob = await pdfService.generatePdf(htmlContent, title, options);
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      return blobUrl;
    } catch (networkError) {
      console.error('Erreur réseau lors de la génération de l\'aperçu PDF:', networkError);
      
      // Vérifier si l'erreur est liée au réseau
      if (networkError.message && networkError.message.includes('Network Error')) {
        throw new Error('Impossible de se connecter au service de génération de PDF. Vérifiez votre connexion internet ou réessayez plus tard.');
      } else if (networkError.response) {
        // Erreur serveur
        const status = networkError.response.status;
        throw new Error(`Le serveur a retourné une erreur (${status}). Veuillez réessayer plus tard.`);
      } else {
        throw networkError;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la génération de l\'aperçu PDF:', error);
    throw error;
  }
};

/**
 * Composant HTML Preview pour l'aperçu du contrat 
 * Montre exactement le même rendu que le PDF final
 */
const ContratHTMLPreview = ({ data, title = 'Contrat' }) => {
  const [htmlContent, setHtmlContent] = useState('');
  
  useEffect(() => {
    // Générer le HTML avec le mode aperçu activé
    const html = getContratHTML(data, title, true);
    setHtmlContent(html);
  }, [data, title]);
  
  if (!htmlContent) {
    return <div className="loading-preview">Chargement de l'aperçu...</div>;
  }
  
  return (
    <div className="html-preview-container" style={{ width: '100%', overflow: 'auto' }}>
      <iframe
        srcDoc={htmlContent}
        title="Aperçu du contrat"
        className="html-preview-frame"
        style={{ 
          width: '100%', 
          height: '1000px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f0f0f0',
          maxWidth: '100%'
        }}
      />
    </div>
  );
};

/**
 * Composant servant de wrapper pour la génération de PDF de contrats
 * Cette version utilise Puppeteer via une fonction Cloud Firebase
 * pour une meilleure fidélité de rendu
 */
const ContratPDFWrapper = ({ 
  template, 
  contratData, 
  concertData, 
  programmateurData, 
  artisteData, 
  lieuData, 
  entrepriseInfo 
}) => {
  // Pour la prévisualisation simplifiée, on continue à utiliser react-pdf
  // Ce rendu sera remplacé par l'aperçu HTML dans la page de détails
  
  // Utiliser la snapshot du template si disponible
  const effectiveTemplate = contratData?.templateSnapshot || template;
  
  // Sécuriser contre les valeurs nulles ou undefined
  const safeData = {
    concert: concertData || {},
    programmateur: programmateurData || {},
    artiste: artisteData || {},
    lieu: lieuData || {},
    entreprise: entrepriseInfo || {}
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.content}>
          <Text style={pdfStyles.message}>
            Prévisualisation du contrat avec mise en page simplifiée.
            Utilisez l'aperçu HTML pour un rendu plus fidèle.
          </Text>
          
          {effectiveTemplate.logoUrl && (
            <Image src={effectiveTemplate.logoUrl} style={{
              maxWidth: '30%',
              maxHeight: '40mm',
              marginBottom: 10,
              alignSelf: 'center'
            }} />
          )}
          
          <Text>
            Date: {formatSafeDate(safeData.concert.date)}
          </Text>
          <Text>
            Contrat pour: {safeData.artiste.nom || 'Non spécifié'}
          </Text>
          <Text>
            Lieu: {safeData.lieu.nom || 'Non spécifié'}
          </Text>
          <Text>
            Programmateur: {safeData.programmateur.structure || 'Non spécifié'}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Ajouter les méthodes pour être utilisées par les composants parents
ContratPDFWrapper.generatePuppeteerPdf = generatePuppeteerPdf;
ContratPDFWrapper.generatePDFPreview = generatePDFPreview;
ContratPDFWrapper.getContratHTML = getContratHTML;
ContratPDFWrapper.HTMLPreview = ContratHTMLPreview;

export default ContratPDFWrapper;