// src/components/pdf/ContratPDFWrapper.js
import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import pdfService from '@/services/pdfService';
// Import du fichier CSS dédié à l'impression - Ce fichier sera utilisé pour les styles
import '@styles/index.css';
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
  logoImage: {
    maxWidth: '30%',
    maxHeight: '40mm',
    marginBottom: 10,
    alignSelf: 'center'
  },
});

/**
 * Fonction utilitaire pour créer des objets de données sécurisés
 * @param {Object} data - Les données brutes
 * @returns {Object} - Objet sécurisé contre les valeurs nulles/undefined
 */
const createSafeData = (data) => {
  // Support des deux formats de données possibles
  const { 
    // Format 1 : Depuis ContratDetailsPage
    template,
    contrat,
    concert, 
    programmateur, 
    artiste, 
    lieu, 
    entreprise,
    
    // Format 2 : Ancien format
    contratData, 
    concertData, 
    programmateurData, 
    artisteData, 
    lieuData, 
    entrepriseInfo 
  } = data;

  // Utiliser la snapshot du template si disponible
  const effectiveTemplate = contrat?.templateSnapshot || contratData?.templateSnapshot || template;
  
  // Sécuriser contre les valeurs nulles ou undefined
  const safeData = {
    template: effectiveTemplate,
    concert: concert || concertData || {},
    programmateur: programmateur || programmateurData || {},
    artiste: artiste || artisteData || {},
    lieu: lieu || lieuData || {},
    entreprise: entreprise || entrepriseInfo || {}
  };

  console.log('[DEBUG ContratPDFWrapper] createSafeData input:', data);
  console.log('[DEBUG ContratPDFWrapper] createSafeData output:', safeData);

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
  console.log('[DEBUG ContratPDFWrapper] prepareContractVariables input:', safeData);
  
  // Fonction helper pour convertir un montant en lettres
  const montantEnLettres = (montant) => {
    if (!montant) return 'Non spécifié';
    const montantNum = parseFloat(montant);
    if (isNaN(montantNum)) return 'Non spécifié';
    
    // Fonction de conversion nombre vers lettres en français
    const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    
    const convertirNombreEnLettres = (nombre) => {
      if (nombre === 0) return 'zéro';
      if (nombre < 0) return 'moins ' + convertirNombreEnLettres(-nombre);
      
      let resultat = '';
      
      // Milliers
      if (nombre >= 1000) {
        const milliers = Math.floor(nombre / 1000);
        if (milliers === 1) {
          resultat += 'mille ';
        } else {
          resultat += convertirNombreEnLettres(milliers) + ' mille ';
        }
        nombre = nombre % 1000;
      }
      
      // Centaines
      if (nombre >= 100) {
        const centaines = Math.floor(nombre / 100);
        if (centaines === 1) {
          resultat += 'cent ';
        } else {
          resultat += unites[centaines] + ' cent' + (nombre % 100 === 0 && centaines > 1 ? 's ' : ' ');
        }
        nombre = nombre % 100;
      }
      
      // Dizaines et unités
      if (nombre >= 20) {
        const dizaine = Math.floor(nombre / 10);
        const unite = nombre % 10;
        
        if (dizaine === 7 || dizaine === 9) {
          resultat += dizaines[dizaine] + '-' + teens[unite] + ' ';
        } else {
          resultat += dizaines[dizaine];
          if (unite === 1 && dizaine !== 8) {
            resultat += ' et un ';
          } else if (unite > 0) {
            resultat += '-' + unites[unite] + ' ';
          } else {
            resultat += ' ';
          }
        }
      } else if (nombre >= 10) {
        resultat += teens[nombre - 10] + ' ';
      } else if (nombre > 0) {
        resultat += unites[nombre] + ' ';
      }
      
      return resultat.trim();
    };
    
    // Séparer la partie entière et décimale
    const partieEntiere = Math.floor(montantNum);
    const partieDecimale = Math.round((montantNum - partieEntiere) * 100);
    
    let resultat = convertirNombreEnLettres(partieEntiere) + ' euro' + (partieEntiere > 1 ? 's' : '');
    
    if (partieDecimale > 0) {
      resultat += ' et ' + convertirNombreEnLettres(partieDecimale) + ' centime' + (partieDecimale > 1 ? 's' : '');
    }
    
    // Mettre la première lettre en majuscule
    return resultat.charAt(0).toUpperCase() + resultat.slice(1);
  };
  
  const variables = {
    // Variables entreprise
    'nom_entreprise': safeData.entreprise?.nom || 'Non spécifié',
    'adresse_entreprise': safeData.entreprise?.adresse || 'Non spécifiée',
    'siret_entreprise': safeData.entreprise?.siret || 'Non spécifié',
    'telephone_entreprise': safeData.entreprise?.telephone || 'Non spécifié',
    'email_entreprise': safeData.entreprise?.email || 'Non spécifié',
    'representant_entreprise': safeData.entreprise?.representant || 'Non spécifié',
    'fonction_representant': safeData.entreprise?.fonctionRepresentant || 'Non spécifiée',
    
    // Variables programmateur
    'programmateur_nom': safeData.programmateur?.nom || 'Non spécifié',
    'programmateur_prenom': safeData.programmateur?.prenom || '',
    'programmateur_structure': safeData.programmateur?.structure || 'Non spécifiée',
    'programmateur_email': safeData.programmateur?.email || 'Non spécifié',
    'programmateur_telephone': safeData.programmateur?.telephone || 'Non spécifié',
    'programmateur_adresse': safeData.programmateur?.adresse || 'Non spécifiée',
    'programmateur_siret': safeData.programmateur?.siret || 'Non spécifié',
    'programmateur_numero_intracommunautaire': safeData.programmateur?.numeroIntracommunautaire || safeData.programmateur?.numero_intracommunautaire || 'Non spécifié',
    'programmateur_representant': safeData.programmateur?.representant || safeData.programmateur?.nom || 'Non spécifié',
    'programmateur_qualite_representant': safeData.programmateur?.qualiteRepresentant || safeData.programmateur?.qualite_representant || safeData.programmateur?.fonction || 'Non spécifiée',
    
    // Variables artiste
    'artiste_nom': safeData.artiste?.nom || 'Non spécifié',
    'artiste_genre': safeData.artiste?.genre || 'Non spécifié',
    'artiste_contact': safeData.artiste?.contact || 'Non spécifié',
    
    // Variables concert
    'concert_titre': safeData.concert?.titre || 'Non spécifié',
    'concert_date': formatSafeDate(safeData.concert?.date),
    'concert_heure': safeData.concert?.heure || 'Non spécifiée',
    'concert_montant': safeData.concert?.montant 
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(safeData.concert.montant) 
      : 'Non spécifié',
    'concert_montant_lettres': montantEnLettres(safeData.concert?.montant),
    
    // Variables lieu
    'lieu_nom': safeData.lieu?.nom || 'Non spécifié',
    'lieu_adresse': safeData.lieu?.adresse || 'Non spécifiée',
    'lieu_code_postal': safeData.lieu?.codePostal || safeData.lieu?.code_postal || 'Non spécifié',
    'lieu_ville': safeData.lieu?.ville || 'Non spécifiée',
    'lieu_capacite': safeData.lieu?.capacite || 'Non spécifiée',
    
    // Variables structure (utiliser les données du programmateur si pas de structure séparée)
    'structure_nom': safeData.structure?.nom || safeData.structure?.raisonSociale || safeData.programmateur?.structure || 'Non spécifiée',
    'structure_siret': safeData.structure?.siret || safeData.programmateur?.siret || 'Non spécifié',
    'structure_adresse': (() => {
      // L'adresse peut être un objet avec {adresse, codePostal, ville, pays}
      if (safeData.structure?.adresse && typeof safeData.structure.adresse === 'object') {
        return safeData.structure.adresse.adresse || 'Non spécifiée';
      }
      return safeData.structure?.adresse || safeData.programmateur?.adresse || 'Non spécifiée';
    })(),
    'structure_code_postal': (() => {
      if (safeData.structure?.adresse && typeof safeData.structure.adresse === 'object') {
        return safeData.structure.adresse.codePostal || 'Non spécifié';
      }
      return safeData.structure?.codePostal || 'Non spécifié';
    })(),
    'structure_ville': (() => {
      if (safeData.structure?.adresse && typeof safeData.structure.adresse === 'object') {
        return safeData.structure.adresse.ville || 'Non spécifiée';
      }
      return safeData.structure?.ville || 'Non spécifiée';
    })(),
    'structure_pays': (() => {
      if (safeData.structure?.adresse && typeof safeData.structure.adresse === 'object') {
        return safeData.structure.adresse.pays || 'France';
      }
      return safeData.structure?.pays || 'France';
    })(),
    'structure_email': safeData.structure?.email || 'Non spécifié',
    'structure_telephone': safeData.structure?.telephone || 'Non spécifié',
    'structure_type': safeData.structure?.type || 'Non spécifié',
    
    // Variables de date
    'date_jour': format(new Date(), "dd", { locale: fr }),
    'date_mois': format(new Date(), "MMMM", { locale: fr }),
    'date_annee': format(new Date(), "yyyy", { locale: fr }),
    'date_complete': format(new Date(), "dd MMMM yyyy", { locale: fr }),
    
    // Ajouter le type de template comme variable
    'templateType': getTemplateTypeLabel(safeData.template?.type || 'session')
  };
  
  console.log('[DEBUG ContratPDFWrapper] prepareContractVariables output:', variables);
  
  return variables;
};

/**
 * Fonction pour remplacer les variables dans le contenu
 */
const replaceVariables = (content, variables) => {
  if (!content) return '';
  
  console.log('🔄 [PDF] Remplacement des variables:', {
    contentLength: content.length,
    variablesCount: Object.keys(variables).length,
    sampleVariables: Object.entries(variables).slice(0, 5)
  });
  
  let processedContent = content;
  let replacementCount = 0;
  
  // Remplacer toutes les variables possibles
  Object.entries(variables).forEach(([key, value]) => {
    // Support des deux formats : {variable} et [variable]
    // D'abord essayer avec les accolades
    const regexCurly = new RegExp(`\\{${key}\\}`, 'g');
    const beforeCurly = processedContent.length;
    processedContent = processedContent.replace(regexCurly, value || '');
    
    if (beforeCurly !== processedContent.length) {
      replacementCount++;
    }
    
    // Ensuite essayer avec les crochets (pour compatibilité)
    const regexSquare = new RegExp(`\\[${key}\\]`, 'g');
    const beforeSquare = processedContent.length;
    processedContent = processedContent.replace(regexSquare, value || '');
    
    if (beforeSquare !== processedContent.length) {
      replacementCount++;
    }
  });
  
  console.log(`📊 [PDF] Total remplacements: ${replacementCount}`);
  
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
 * @param {String} editedContent - Contenu édité manuellement (optionnel)
 * @returns {String} - Le HTML complet du contrat
 */
const getContratHTML = (data, title = 'Contrat', forPreview = false, editedContent = null) => {
  // Si on a du contenu édité, l'utiliser directement
  if (editedContent) {
    // Construire le HTML avec le contenu édité
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <!-- Style externe contrat-print.css appliqué via Puppeteer -->
      </head>
      <body class="contrat-print-mode">
    `;

    if (forPreview) {
      htmlContent += `<div class="contrat-container">`;
      htmlContent += `<div class="preview-note">Aperçu du contrat - La mise en page sera identique au téléchargement PDF final</div>`;
    }

    // Ajouter directement le contenu édité
    htmlContent += editedContent;

    if (forPreview) {
      htmlContent += `</div>`; // Fermer .contrat-container
    }

    htmlContent += `
      </body>
      </html>
    `;

    return htmlContent;
  }
  
  // Sinon, utiliser le processus normal
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
  
  // Construire le contenu HTML complet
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${titleContent}</title>
      <!-- Style externe contrat-print.css appliqué via Puppeteer -->
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
          <img src="${safeData.template.logoUrl}" alt="Logo" style={pdfStyles.logoImage} />
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
 * @param {string} editedContent - Contenu édité manuellement (optionnel)
 * @returns {Promise<Blob>} - Le blob PDF généré
 */
const generatePuppeteerPdf = async (title, data, editedContent = null) => {
  try {
    // Utiliser la fonction commune pour générer le HTML avec le contenu édité si fourni
    const htmlContent = getContratHTML(data, title, false, editedContent);
    
    // Récupérer les données sécurisées pour les options
    const safeData = createSafeData(data);
    
    // Options pour la génération PDF
    const options = {
      displayHeaderFooter: true,
      headerTemplate: safeData.template.headerContent ? `
        <div style="; padding: 5px 30px; width: 100%;" class="tc-text-xs">
          ${replaceVariables(safeData.template.headerContent, prepareContractVariables(safeData))}
        </div>
      ` : '',
      footerTemplate: safeData.template.footerContent ? `
        <div style="; padding: 5px 30px; width: 100%;" class="tc-text-xs">
          ${replaceVariables(safeData.template.footerContent, prepareContractVariables(safeData))}
          <div style="; ;" class="tc-text-xs tc-text-center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>
        </div>
      ` : '<div style="; ; padding: 5px 30px; width: 100%;" class="tc-text-xs tc-text-center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
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
        <div style="; padding: 5px 30px; width: 100%;" class="tc-text-xs">
          ${replaceVariables(safeData.template.headerContent, prepareContractVariables(safeData))}
        </div>
      ` : '',
      footerTemplate: safeData.template.footerContent ? `
        <div style="; padding: 5px 30px; width: 100%;" class="tc-text-xs">
          ${replaceVariables(safeData.template.footerContent, prepareContractVariables(safeData))}
          <div style="; ;" class="tc-text-xs tc-text-center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>
        </div>
      ` : '<div style="; ; padding: 5px 30px; width: 100%;" class="tc-text-xs tc-text-center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
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
    return <div className={styles.loading}>Chargement de l'aperçu...</div>;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.previewContainer}>
        <iframe
          srcDoc={htmlContent}
          title="Aperçu du contrat"
          className={styles.previewFrame}
        />
      </div>
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
  entrepriseInfo,
  editedContent 
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
  
  // Stocker editedContent dans une variable accessible aux méthodes statiques
  // (Cette approche n'est pas idéale mais nécessaire avec PDFDownloadLink)
  if (editedContent) {
    ContratPDFWrapper._lastEditedContent = editedContent;
  }

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.content}>
          <Text style={pdfStyles.message}>
            Prévisualisation du contrat avec mise en page simplifiée.
            Utilisez l'aperçu HTML pour un rendu plus fidèle.
          </Text>
          
          {effectiveTemplate && effectiveTemplate.logoUrl && (
            <Image src={effectiveTemplate.logoUrl} style={pdfStyles.logoImage} />
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

// Variable statique pour stocker le contenu édité
ContratPDFWrapper._lastEditedContent = null;

// Modifier les méthodes statiques pour utiliser le contenu édité
const originalGeneratePuppeteerPdf = generatePuppeteerPdf;
ContratPDFWrapper.generatePuppeteerPdf = async (title, data) => {
  const editedContent = ContratPDFWrapper._lastEditedContent;
  ContratPDFWrapper._lastEditedContent = null; // Réinitialiser après utilisation
  return originalGeneratePuppeteerPdf(title, data, editedContent);
};

// Ajouter les autres méthodes pour être utilisées par les composants parents
ContratPDFWrapper.generatePDFPreview = generatePDFPreview;
ContratPDFWrapper.getContratHTML = getContratHTML;
ContratPDFWrapper.HTMLPreview = ContratHTMLPreview;

export default ContratPDFWrapper;