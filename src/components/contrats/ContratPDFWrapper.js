// src/components/contrats/ContratPDFWrapper.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import pdfService from '../../services/pdfService';

// Styles pour le PDF de fallback (mode prévisualisation simple)
const styles = StyleSheet.create({
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
 * Méthode statique pour générer le PDF avec Puppeteer via Cloud Functions
 * Cette méthode est appelée lorsque l'utilisateur télécharge le document
 * 
 * @param {string} title - Titre du document
 * @param {object} data - Données nécessaires à la génération du PDF
 * @returns {Promise<Blob>} - Le blob PDF généré
 */
const generatePuppeteerPdf = async (title, data) => {
  const { template, contratData, concertData, programmateurData, artisteData, lieuData, entrepriseInfo } = data;
  
  try {
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
    
    // Fonction pour obtenir le libellé du type de template
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
    
    // Fonction pour formater les dates de manière sécurisée
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
    
    // Fonction pour remplacer les variables dans le contenu
    const replaceVariables = (content) => {
      if (!content) return '';
      
      let processedContent = content;
      
      // Créer un objet avec toutes les variables possibles
      const variables = {
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
        'templateType': getTemplateTypeLabel(effectiveTemplate.type || 'session')
      };
      
      // Remplacer toutes les variables possibles
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        processedContent = processedContent.replace(regex, value);
      });
      
      return processedContent;
    };

    // Préparer les contenus en remplaçant les variables
    const headerContent = replaceVariables(effectiveTemplate.headerContent || '');
    const bodyContent = replaceVariables(effectiveTemplate.bodyContent || '');
    const footerContent = replaceVariables(effectiveTemplate.footerContent || '');
    const signatureContent = replaceVariables(effectiveTemplate.signatureTemplate || '');
    const titleContent = replaceVariables(effectiveTemplate.titleTemplate || title);
    
    // Construire le contenu HTML complet
    const htmlContent = `
      ${headerContent ? `<div class="header">${headerContent}</div>` : ''}
      ${titleContent ? `<h1 style="text-align: center; font-size: 16pt; margin-bottom: 20px;">${titleContent}</h1>` : ''}
      <div class="body-content">${bodyContent}</div>
      ${signatureContent ? `<div class="signature" style="margin-top: 30px;">${signatureContent}</div>` : ''}
      ${footerContent ? `<div class="footer" style="margin-top: 30px;">${footerContent}</div>` : ''}
    `;
    
    // Options pour la génération PDF
    const options = {
      displayHeaderFooter: true,
      headerTemplate: headerContent ? `
        <div style="font-size: 9pt; padding: 5px 30px; width: 100%;">
          ${headerContent}
        </div>
      ` : '',
      footerTemplate: footerContent ? `
        <div style="font-size: 9pt; padding: 5px 30px; width: 100%;">
          ${footerContent}
          <div style="text-align: center; font-size: 8pt;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>
        </div>
      ` : '<div style="text-align: center; font-size: 8pt; padding: 5px 30px; width: 100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: {
        top: headerContent ? '60px' : '30px',
        bottom: footerContent ? '60px' : '30px',
        left: '30px',
        right: '30px'
      }
    };
    
    // Télécharger directement le PDF
    await pdfService.generateAndDownloadPdf(htmlContent, titleContent || title, options);
    return true;
  } catch (error) {
    console.error('Erreur lors de la génération du PDF avec Puppeteer:', error);
    throw error;
  }
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
  
  // Fonction pour formater les dates de manière sécurisée
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
  
  // Fonction pour obtenir le libellé du type de template
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
  
  // Fonction pour remplacer les variables dans le contenu
  const replaceVariables = (content) => {
    if (!content) return '';
    
    let processedContent = content;
    
    // Créer un objet avec toutes les variables possibles
    const variables = {
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
      'templateType': getTemplateTypeLabel(effectiveTemplate.type || 'session')
    };
    
    // Remplacer toutes les variables possibles
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });
    
    return processedContent;
  };

  // Pour la prévisualisation, on affiche un document simple qui indique que le rendu final sera meilleur
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <Text style={styles.defaultTitle}>
            {replaceVariables(effectiveTemplate.titleTemplate) || 'Contrat'}
          </Text>
          
          <Text style={styles.message}>
            Prévisualisation du contrat avec mise en page simplifiée.
            Le téléchargement final utilisera un rendu Puppeteer pour une fidélité maximale.
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

// Ajouter la méthode statique au composant
ContratPDFWrapper.generatePuppeteerPdf = generatePuppeteerPdf;

export default ContratPDFWrapper;