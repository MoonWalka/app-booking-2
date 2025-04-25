// src/components/contrats/ContratPDFWrapper.js
// Ce fichier est un wrapper pour la génération de PDF de contrats
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Html from 'react-pdf-html';

// Styles pour le PDF
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
  // Nouveaux styles pour l'alignement
  alignCenter: { textAlign: 'center' },
  alignRight: { textAlign: 'right' },
  alignJustify: { textAlign: 'justify' },
  // Styles pour les listes
  listItem: { 
    marginLeft: 10,
    marginBottom: 3,
    flexDirection: 'row' 
  },
  bulletPoint: {
    width: 10,
    marginRight: 5
  },
  listItemContent: {
    flex: 1
  }
});

// Stylesheet pour react-pdf-html
const htmlStylesheet = {
  p: { marginBottom: 10 },
  h1: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  h2: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
  h3: { fontSize: 12, fontWeight: 'bold', marginBottom: 6, marginTop: 6 },
  strong: { fontWeight: 'bold' },
  b: { fontWeight: 'bold' },
  em: { fontStyle: 'italic' },
  i: { fontStyle: 'italic' },
  u: { textDecoration: 'underline' },
  
  // Classes spécifiques à ReactQuill avec attributs de style en ligne
  '.ql-align-center': { textAlign: 'center' },
  '.ql-align-right': { textAlign: 'right' },
  '.ql-align-justify': { textAlign: 'justify' },
  
  // Styles pour les spans à couleur spécifique
  'span[style*="color:"]': { color: '#000000' }, // Valeur par défaut, sera remplacée
  'span[style*="color: rgb(0, 0, 0)"]': { color: '#000000' },
  'span[style*="color: rgb(230, 0, 0)"]': { color: '#E60000' },
  'span[style*="color: rgb(255, 153, 0)"]': { color: '#FF9900' },
  
  // Listes
  ul: { marginLeft: 10, marginBottom: 10 },
  ol: { marginLeft: 10, marginBottom: 10 },
  li: { marginBottom: 3 },
  
  // Autres styles
  a: { color: 'blue', textDecoration: 'underline' },
  table: { width: '100%', marginBottom: 10 },
  th: { fontWeight: 'bold', padding: 5, borderBottom: '1px solid black' },
  td: { padding: 5 },
  
  // Style pour les paragraphes vides (avec seulement <br>)
  'p:empty': { marginBottom: 10, height: 14 },
  'p > br': { display: 'block', marginBottom: 5 },
};

// Fonction pour diviser le contenu aux sauts de page
const splitContentByPageBreaks = (content) => {
  if (!content) return [content];
  
  // Les sauts de page seront des balises <hr class="page-break"> dans le HTML
  const pageBreakPattern = /<hr\s+class=["|']page-break["|'][^>]*>/gi;
  
  // Diviser et filtrer les sections vides
  const sections = content.split(pageBreakPattern);
  const nonEmptySections = sections
    .map(section => section.trim())
    .filter(section => section.length > 0);
  
  // Log de débogage pour voir les sections
  console.log("Sections après filtrage:", nonEmptySections.length, "sections non vides");
  
  return nonEmptySections.length > 0 ? nonEmptySections : [content];
};

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
  
  console.log("Template effectif utilisé:", effectiveTemplate);
  console.log("Source du template:", contratData?.templateSnapshot ? "Snapshot stockée" : "Template live");
  
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
      
      // Variables de date - Ne les inclure QUE si explicitement demandées via le template
      ...(content.includes('{date_jour}') ? {'date_jour': format(new Date(), "dd", { locale: fr })} : {}),
      ...(content.includes('{date_mois}') ? {'date_mois': format(new Date(), "MMMM", { locale: fr })} : {}),
      ...(content.includes('{date_annee}') ? {'date_annee': format(new Date(), "yyyy", { locale: fr })} : {}),
      ...(content.includes('{date_complete}') ? {'date_complete': format(new Date(), "dd MMMM yyyy", { locale: fr })} : {}),
      
      // Ajouter le type de template comme variable
      'templateType': getTemplateTypeLabel(effectiveTemplate.type || 'session')
    };
    
    // Remplacer toutes les variables possibles
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      processedContent = processedContent.replace(regex, value);
    });
    
    // Prétraitement pour améliorer le rendu HTML
    processedContent = preprocessHtml(processedContent);
    
    return processedContent;
  };
  
  // Fonction de prétraitement pour améliorer le rendu HTML
  const preprocessHtml = (html) => {
    if (!html) return '';
    
    // Prétraitement spécifique pour ReactQuill
    let processedHtml = html
      // Convertir les styles de gras
      .replace(/<span[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>(.*?)<\/span>/gi, '<b>$1</b>')
      .replace(/<span[^>]*style="[^"]*font-weight:\s*[7-9]00[^"]*"[^>]*>(.*?)<\/span>/gi, '<b>$1</b>')
      // Convertir les styles d'italique
      .replace(/<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/span>/gi, '<i>$1</i>')
      // Traiter les paragraphes vides ou contenant uniquement <br>
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '<p class="empty-paragraph">&nbsp;</p>')
      // Remplacer les classes ql-align avec des styles inline
      .replace(/<p\s+class="ql-align-center"([^>]*)>(.*?)<\/p>/gi, '<p style="text-align: center"$1>$2</p>')
      .replace(/<p\s+class="ql-align-right"([^>]*)>(.*?)<\/p>/gi, '<p style="text-align: right"$1>$2</p>')
      .replace(/<p\s+class="ql-align-justify"([^>]*)>(.*?)<\/p>/gi, '<p style="text-align: justify"$1>$2</p>');
    
    // Traiter les couleurs
    const colorRegex = /<span\s+style="color:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)[^"]*"([^>]*)>(.*?)<\/span>/gi;
    processedHtml = processedHtml.replace(colorRegex, (match, r, g, b, attrs, content) => {
      // Convertir RGB en hexadécimal
      const hex = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
      return `<span style="color: ${hex}"${attrs}>${content}</span>`;
    });
    
    return processedHtml;
  };

  // Vérifier si le template est valide
  if (!effectiveTemplate || !effectiveTemplate.bodyContent) {
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
      height: `${effectiveTemplate.headerHeight || 20}mm`,
      marginBottom: `${effectiveTemplate.headerBottomMargin || 10}mm`,
      borderBottom: '1px solid #ccc',
      paddingBottom: 5,
    }}>
      {effectiveTemplate.logoUrl && (
        <Image src={effectiveTemplate.logoUrl} style={{
          position: 'absolute',
          top: 0,
          left: 0,
          maxWidth: '30%',
          maxHeight: '100%',
        }} />
      )}
      <Html stylesheet={htmlStylesheet}>
        {replaceVariables(effectiveTemplate.headerContent)}
      </Html>
    </View>
  );
  
  const renderTitle = () => (
    <View style={{marginBottom: 15}}>
      <Html stylesheet={{...htmlStylesheet, p: {...htmlStylesheet.p, fontSize: 16, fontWeight: 'bold', textAlign: 'center'}}}>
        {replaceVariables(effectiveTemplate.titleTemplate)}
      </Html>
    </View>
  );
  
  const renderFooter = () => (
    <View style={{
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      height: `${effectiveTemplate.footerHeight || 15}mm`,
      marginTop: `${effectiveTemplate.footerTopMargin || 10}mm`,
      borderTop: '1px solid #ccc',
      paddingTop: 5,
    }}>
      <Html stylesheet={htmlStylesheet}>
        {replaceVariables(effectiveTemplate.footerContent)}
      </Html>
    </View>
  );

  // Gérer les sauts de page
  const processedBodyContent = replaceVariables(effectiveTemplate.bodyContent);
  const contentSections = splitContentByPageBreaks(processedBodyContent);

  // Si pas de sauts de page ou un seul contenu, rendu normal sur une seule page
  if (contentSections.length <= 1) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* En-tête (uniquement si défini dans le template) */}
          {effectiveTemplate.headerContent && renderHeader()}
          
          {/* Titre (depuis le template) */}
          {effectiveTemplate.titleTemplate && renderTitle()}
          
          {/* Contenu principal */}
          <View style={styles.content}>
            <Html stylesheet={htmlStylesheet}>
              {processedBodyContent}
            </Html>
          </View>
          
          {/* Zone de signature (depuis le template) */}
          {effectiveTemplate.signatureTemplate && (
            <View style={{marginTop: 30}}>
              <Html stylesheet={htmlStylesheet}>
                {replaceVariables(effectiveTemplate.signatureTemplate)}
              </Html>
            </View>
          )}
          
          {/* Pied de page (uniquement si défini dans le template) */}
          {effectiveTemplate.footerContent && renderFooter()}
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
          {effectiveTemplate.headerContent && renderHeader()}
          
          {/* Titre uniquement sur la première page */}
          {index === 0 && effectiveTemplate.titleTemplate && renderTitle()}
          
          {/* Contenu de cette section */}
          <View style={styles.content}>
            <Html stylesheet={htmlStylesheet}>
              {section}
            </Html>
          </View>
          
          {/* Zone de signature uniquement sur la dernière page */}
          {index === contentSections.length - 1 && effectiveTemplate.signatureTemplate && (
            <View style={{marginTop: 30}}>
              <Html stylesheet={htmlStylesheet}>
                {replaceVariables(effectiveTemplate.signatureTemplate)}
              </Html>
            </View>
          )}
          
          {/* Pied de page sur chaque page */}
          {effectiveTemplate.footerContent && renderFooter()}
        </Page>
      ))}
    </Document>
  );
};

export default ContratPDFWrapper;