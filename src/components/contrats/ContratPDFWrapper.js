// src/components/contrats/ContratPDFWrapper.js
// Ce fichier est un wrapper pour la génération de PDF de contrats
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import parse from 'html-react-parser';

// Styles pour le PDF (simplifiés)
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
  defaultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  // Styles pour les éléments HTML basiques
  p: { marginBottom: 10 },
  h1: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  h2: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
  h3: { fontSize: 12, fontWeight: 'bold', marginBottom: 6, marginTop: 6 },
  strong: { fontWeight: 'bold' },
  em: { fontStyle: 'italic' },
  ul: { marginLeft: 10, marginBottom: 10 },
  li: { marginBottom: 3 },
});

// Fonction améliorée pour convertir HTML en composants React-PDF
const parseHtmlToReactPdf = (html) => {
  if (!html) return null;
  
  // Version améliorée: mieux préserver la structure des paragraphes, titres, etc.
  let content = html
    // Remplacer les balises de titre
    .replace(/<h1.*?>(.*?)<\/h1>/g, (_, text) => `\n# ${text}\n`)
    .replace(/<h2.*?>(.*?)<\/h2>/g, (_, text) => `\n## ${text}\n`)
    .replace(/<h3.*?>(.*?)<\/h3>/g, (_, text) => `\n### ${text}\n`)
    
    // Remplacer les paragraphes
    .replace(/<p.*?>(.*?)<\/p>/g, (_, text) => `\n${text}\n`)
    
    // Gérer les sauts de ligne
    .replace(/<br\s*\/?>/g, '\n')
    
    // Supprimer les autres balises HTML mais conserver le texte
    .replace(/<[^>]*>/g, '')
    
    // Gérer les entités HTML communes
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  // Découper en lignes pour préserver les sauts de ligne
  const lines = content.split('\n');
  
  return (
    <View>
      {lines.map((line, index) => {
        if (line.startsWith('#')) {
          if (line.startsWith('# ')) {
            return <Text key={index} style={styles.h1}>{line.substring(2).trim()}</Text>;
          } else if (line.startsWith('## ')) {
            return <Text key={index} style={styles.h2}>{line.substring(3).trim()}</Text>;
          } else if (line.startsWith('### ')) {
            return <Text key={index} style={styles.h3}>{line.substring(4).trim()}</Text>;
          }
        } else if (line.trim()) {
          return <Text key={index} style={styles.p}>{line}</Text>;
        }
        return null;
      })}
    </View>
  );
};

// Fonction pour diviser le contenu aux sauts de page
const splitContentByPageBreaks = (content) => {
  if (!content) return [content];
  
  // Les sauts de page seront des balises <hr class="page-break"> dans le HTML
  const pageBreakPattern = /<hr\s+class=["|']page-break["|'][^>]*>/gi;
  return content.split(pageBreakPattern);
};

const ContratPDFWrapper = ({ template, concertData, programmateurData, artisteData, lieuData, entrepriseInfo }) => {
  // Débogage pour identifier pourquoi la date apparaît encore
  console.log("Template reçu dans ContratPDFWrapper:", template);
  console.log("La propriété dateTemplate existe-t-elle?", template && 'dateTemplate' in template);
  
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
  
  // Fonction pour remplacer les variables dans le contenu
  const replaceVariables = (content) => {
    if (!content) return '';
    
    let processedContent = content;
    
    // IMPORTANT: Ne pas ajouter automatiquement de date actuelle ici
    // Nous n'utiliserons que les variables explicitement demandées
    
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
      
      // Variables de date - Ne les inclure QUE si explicitement demandées via le template
      // Ne pas utiliser ces variables automatiquement, elles doivent être explicitement référencées
      ...(content.includes('{date_jour}') ? {'date_jour': format(new Date(), "dd", { locale: fr })} : {}),
      ...(content.includes('{date_mois}') ? {'date_mois': format(new Date(), "MMMM", { locale: fr })} : {}),
      ...(content.includes('{date_annee}') ? {'date_annee': format(new Date(), "yyyy", { locale: fr })} : {}),
      ...(content.includes('{date_complete}') ? {'date_complete': format(new Date(), "dd MMMM yyyy", { locale: fr })} : {}),
      
      // Ajouter le type de template comme variable
      'templateType': getTemplateTypeLabel(template.type || 'session')
    };
    
    // Remplacer toutes les variables possibles
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });
    
    return processedContent;
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

  // Vérifier si le template est valide
  if (!template || !template.bodyContent) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Le modèle de contrat est invalide ou incomplet.</Text>
        </Page>
      </Document>
    );
  }

  // Fonctions pour rendre les parties communes
  const renderHeader = () => (
    <View style={{
      height: `${template.headerHeight || 20}mm`,
      marginBottom: `${template.headerBottomMargin || 10}mm`,
      borderBottom: '1px solid #ccc',
      paddingBottom: 5,
    }}>
      {template.logoUrl && (
        <Image src={template.logoUrl} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          maxWidth: '30%',
          maxHeight: '100%',
        }} />
      )}
      <Text>{parseHtmlToReactPdf(replaceVariables(template.headerContent))}</Text>
    </View>
  );
  
  const renderTitle = () => (
    <View style={{marginBottom: 15}}>
      <Text style={styles.defaultTitle}>
        {parseHtmlToReactPdf(replaceVariables(template.titleTemplate))}
      </Text>
    </View>
  );
  
  const renderDate = () => (
    <View style={{marginBottom: 10}}>
      {parseHtmlToReactPdf(replaceVariables(template.dateTemplate))}
    </View>
  );
  
  const renderFooter = () => (
    <View style={{
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      height: `${template.footerHeight || 15}mm`,
      marginTop: `${template.footerTopMargin || 10}mm`,
      borderTop: '1px solid #ccc',
      paddingTop: 5,
    }}>
      <Text>{parseHtmlToReactPdf(replaceVariables(template.footerContent))}</Text>
    </View>
  );

  // Gérer les sauts de page
  const processedBodyContent = replaceVariables(template.bodyContent);
  const contentSections = splitContentByPageBreaks(processedBodyContent);

  // Si pas de sauts de page ou un seul contenu, rendu normal sur une seule page
  if (contentSections.length <= 1) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* En-tête (uniquement si défini dans le template) */}
          {template.headerContent && renderHeader()}
          
          {/* Titre (depuis le template) */}
          {template.titleTemplate && renderTitle()}
          
          {/* Date (si définie dans le template) */}
          {template.dateTemplate && renderDate()}
          
          {/* Contenu principal */}
          <View style={styles.content}>
            {parseHtmlToReactPdf(processedBodyContent)}
          </View>
          
          {/* Zone de signature (depuis le template) */}
          {template.signatureTemplate && (
            <View style={{marginTop: 30}}>
              {parseHtmlToReactPdf(replaceVariables(template.signatureTemplate))}
            </View>
          )}
          
          {/* Pied de page (uniquement si défini dans le template) */}
          {template.footerContent && renderFooter()}
        </Page>
      </Document>
    );
  }
  
  // Sinon, créer plusieurs pages en fonction des sauts de page
  return (
    <Document>
      {contentSections.map((section, index) => (
        <Page key={index} size="A4" style={styles.page}>
          {/* En-tête sur chaque page */}
          {template.headerContent && renderHeader()}
          
          {/* Titre uniquement sur la première page */}
          {index === 0 && template.titleTemplate && renderTitle()}
          
          {/* Date uniquement sur la première page */}
          {index === 0 && template.dateTemplate && renderDate()}
          
          {/* Contenu de cette section */}
          <View style={styles.content}>
            {parseHtmlToReactPdf(section)}
          </View>
          
          {/* Zone de signature uniquement sur la dernière page */}
          {index === contentSections.length - 1 && template.signatureTemplate && (
            <View style={{marginTop: 30}}>
              {parseHtmlToReactPdf(replaceVariables(template.signatureTemplate))}
            </View>
          )}
          
          {/* Pied de page sur chaque page */}
          {template.footerContent && renderFooter()}
        </Page>
      ))}
    </Document>
  );
};

export default ContratPDFWrapper;