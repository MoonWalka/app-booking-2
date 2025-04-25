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

// Fonction pour rendre les textes avec leurs styles
const renderTextWithStyles = (segments) => {
  if (!segments) return null;
  
  if (!Array.isArray(segments)) {
    segments = [segments];
  }
  
  return segments.map((segment, index) => (
    <Text key={index} style={segment.styles}>
      {segment.text}
    </Text>
  ));
};

// Fonction avancée pour parser le HTML en composants React-PDF
const parseHtmlToReactPdf = (html) => {
  if (!html) return null;
  
  // Prétraitement pour traiter les styles inline de ReactQuill
  let processedHtml = html
    // Convertir les spans avec font-weight: bold en balises <strong>
    .replace(/<span[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>(.*?)<\/span>/gi, '<strong>$1</strong>')
    .replace(/<span[^>]*style="[^"]*font-weight:\s*[7-9]00[^"]*"[^>]*>(.*?)<\/span>/gi, '<strong>$1</strong>')
    // Convertir les spans avec font-style: italic en balises <em>
    .replace(/<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/span>/gi, '<em>$1</em>')
    // Convertir les classes d'alignement
    .replace(/<p[^>]*class="[^"]*ql-align-center[^"]*"[^>]*>(.*?)<\/p>/gi, '<p style="text-align: center">$1</p>')
    .replace(/<p[^>]*class="[^"]*ql-align-right[^"]*"[^>]*>(.*?)<\/p>/gi, '<p style="text-align: right">$1</p>')
    .replace(/<p[^>]*class="[^"]*ql-align-justify[^"]*"[^>]*>(.*?)<\/p>/gi, '<p style="text-align: justify">$1</p>')
    // Gérer les sauts de ligne
    .replace(/<br\s*\/?>/g, '\n');
  
  // Fonction pour extraire les styles en ligne
  const extractInlineStyles = (styleAttr) => {
    if (!styleAttr) return {};
    
    const styles = {};
    const styleProps = styleAttr.split(';');
    
    styleProps.forEach(prop => {
      const [name, value] = prop.split(':').map(s => s.trim());
      if (!name || !value) return;
      
      // Convertir les propriétés CSS en propriétés React
      switch (name) {
        case 'text-align':
          styles.textAlign = value;
          break;
        case 'font-weight':
          if (value === 'bold' || parseInt(value) >= 700) {
            styles.fontWeight = 'bold';
          }
          break;
        case 'font-style':
          if (value === 'italic') styles.fontStyle = 'italic';
          break;
        case 'color':
          styles.color = value;
          break;
        // Ajouter d'autres propriétés CSS selon besoin
      }
    });
    
    return styles;
  };
  
  // Traiter spécifiquement les listes
  const processLists = (html) => {
    const listRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/g;
    let match;
    let processedHtml = html;
    
    while ((match = listRegex.exec(html)) !== null) {
      const listContent = match[1];
      const listItems = [];
      
      // Extraire les éléments de liste
      const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
      let itemMatch;
      
      while ((itemMatch = itemRegex.exec(listContent)) !== null) {
        listItems.push(itemMatch[1]);
      }
      
      // Remplacer la liste par des paragraphes avec puces
      const replacement = listItems.map(item => `<p>• ${item}</p>`).join('');
      
      // Remplacer la liste originale par notre version
      const fullMatch = match[0];
      processedHtml = processedHtml.replace(fullMatch, replacement);
    }
    
    return processedHtml;
  };
  
  // Fonction récursive pour traiter les éléments HTML
  const processNode = (content, baseStyles = {}) => {
    // D'abord traiter les éléments avec style inline
    const styleRegex = /<([a-z]+)[^>]*style="([^"]*)"[^>]*>(.*?)<\/\1>/gi;
    let styleMatch;
    let segments = [];
    let lastIndex = 0;
    
    while ((styleMatch = styleRegex.exec(content)) !== null) {
      // Ajouter le texte avant le match avec les styles actuels
      if (styleMatch.index > lastIndex) {
        // Traiter ce segment pour d'autres formatages (comme bold/italic)
        const prevSegments = processNode(content.substring(lastIndex, styleMatch.index), baseStyles);
        if (Array.isArray(prevSegments)) {
          segments = [...segments, ...prevSegments];
        } else if (prevSegments) {
          segments.push(prevSegments);
        }
      }
      
      // Extraire les styles de l'élément
      const tagName = styleMatch[1];
      const styleAttr = styleMatch[2];
      const innerContent = styleMatch[3];
      const extractedStyles = extractInlineStyles(styleAttr);
      
      // Combiner avec les styles de base
      const combinedStyles = { ...baseStyles, ...extractedStyles };
      
      // Traiter le contenu intérieur récursivement avec les styles combinés
      const innerSegments = processNode(innerContent, combinedStyles);
      
      if (Array.isArray(innerSegments)) {
        segments = [...segments, ...innerSegments];
      } else if (innerSegments) {
        segments.push(innerSegments);
      }
      
      lastIndex = styleMatch.index + styleMatch[0].length;
    }
    
    // Ajouter le reste du contenu
    if (lastIndex < content.length) {
      // Continuer à traiter d'autres balises comme <strong> ou <b>
      const boldRegex = /<(strong|b)>(.*?)<\/\1>/gi;
      let boldMatch;
      let boldLastIndex = lastIndex;
      let boldSegments = [];
      
      while ((boldMatch = boldRegex.exec(content.substring(lastIndex))) !== null) {
        const actualIndex = lastIndex + boldMatch.index;
        
        // Ajouter le texte avant le bold
        if (actualIndex > boldLastIndex) {
          boldSegments.push({
            text: content.substring(boldLastIndex, actualIndex),
            styles: { ...baseStyles }
          });
        }
        
        // Ajouter le texte en gras
        boldSegments.push({
          text: boldMatch[2],
          styles: { ...baseStyles, fontWeight: 'bold' }
        });
        
        boldLastIndex = actualIndex + boldMatch[0].length;
      }
      
      // Ajouter le reste
      if (boldLastIndex < content.length) {
        // Traiter l'italique de manière similaire
        const italicRegex = /<(em|i)>(.*?)<\/\1>/gi;
        let italicMatch;
        let italicLastIndex = boldLastIndex;
        let italicSegments = [];
        
        while ((italicMatch = italicRegex.exec(content.substring(boldLastIndex))) !== null) {
          const actualIndex = boldLastIndex + italicMatch.index;
          
          // Ajouter le texte avant l'italique
          if (actualIndex > italicLastIndex) {
            italicSegments.push({
              text: content.substring(italicLastIndex, actualIndex),
              styles: { ...baseStyles }
            });
          }
          
          // Ajouter le texte en italique
          italicSegments.push({
            text: italicMatch[2],
            styles: { ...baseStyles, fontStyle: 'italic' }
          });
          
          italicLastIndex = actualIndex + italicMatch[0].length;
        }
        
        // Ajouter le reste sans formatage spécial
        if (italicLastIndex < content.length) {
          const restText = content.substring(italicLastIndex)
            .replace(/<[^>]*>/g, '') // Supprimer les balises restantes
            .trim();
            
          if (restText) {
            italicSegments.push({
              text: restText,
              styles: { ...baseStyles }
            });
          }
        }
        
        boldSegments = [...boldSegments, ...italicSegments];
      }
      
      segments = [...segments, ...boldSegments];
    }
    
    // Si aucun segment n'a été créé, retourner le texte avec les styles de base
    if (segments.length === 0 && content.trim()) {
      const cleanText = content.replace(/<[^>]*>/g, '').trim();
      if (cleanText) {
        return { text: cleanText, styles: baseStyles };
      }
    }
    
    return segments;
  };
  
  // Traiter d'abord les listes
  processedHtml = processLists(processedHtml);
  
  // Diviser par paragraphes pour un meilleur contrôle
  const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
  const paragraphs = [];
  let paragraphMatch;
  
  while ((paragraphMatch = paragraphRegex.exec(processedHtml)) !== null) {
    const fullTag = paragraphMatch[0];
    const content = paragraphMatch[1];
    
    // Extraire les styles du paragraphe
    const styleMatch = fullTag.match(/style="([^"]*)"/);
    const paragraphStyles = styleMatch ? extractInlineStyles(styleMatch[1]) : {};
    
    // Détecter l'alignement basé sur les classes
    if (fullTag.includes('ql-align-center') || fullTag.includes('text-align: center')) {
      paragraphStyles.textAlign = 'center';
    } else if (fullTag.includes('ql-align-right') || fullTag.includes('text-align: right')) {
      paragraphStyles.textAlign = 'right';
    } else if (fullTag.includes('ql-align-justify') || fullTag.includes('text-align: justify')) {
      paragraphStyles.textAlign = 'justify';
    }
    
    paragraphs.push({
      content,
      styles: paragraphStyles
    });
  }
  
  // Traiter les titres et le contenu hors paragraphes
  const processHeadings = () => {
    let remainingHtml = processedHtml;
    const headingContents = [];
    
    // Traiter les h1
    const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/g;
    let h1Match;
    
    while ((h1Match = h1Regex.exec(remainingHtml)) !== null) {
      const h1Content = h1Match[1];
      const h1Segments = processNode(h1Content, { fontSize: 16, fontWeight: 'bold' });
      
      headingContents.push({
        type: 'h1',
        segments: h1Segments,
        fullMatch: h1Match[0]
      });
    }
    
    // Traiter les h2
    const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
    let h2Match;
    
    while ((h2Match = h2Regex.exec(remainingHtml)) !== null) {
      const h2Content = h2Match[1];
      const h2Segments = processNode(h2Content, { fontSize: 14, fontWeight: 'bold' });
      
      headingContents.push({
        type: 'h2',
        segments: h2Segments,
        fullMatch: h2Match[0]
      });
    }
    
    // Traiter les h3
    const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/g;
    let h3Match;
    
    while ((h3Match = h3Regex.exec(remainingHtml)) !== null) {
      const h3Content = h3Match[1];
      const h3Segments = processNode(h3Content, { fontSize: 12, fontWeight: 'bold' });
      
      headingContents.push({
        type: 'h3',
        segments: h3Segments,
        fullMatch: h3Match[0]
      });
    }
    
    return headingContents;
  };
  
  const headingContents = processHeadings();
  
  // Si nous n'avons pas trouvé de paragraphes, essayer de traiter le contenu brut
  if (paragraphs.length === 0) {
    const rawContent = processedHtml
      .replace(/<[^>]*>/g, '') // Supprimer toutes les balises
      .trim();
      
    if (rawContent) {
      paragraphs.push({
        content: rawContent,
        styles: {}
      });
    }
  }
  
  // Combiner paragraphes et titres
  const allContents = [...headingContents, ...paragraphs.map(p => ({
    type: 'p',
    segments: processNode(p.content, p.styles),
    styles: p.styles
  }))];
  
  // Trier selon l'ordre original
  // Cette approche simple gère la plupart des cas mais pourrait être améliorée
  // pour une détection d'ordre plus précise si nécessaire
  allContents.sort((a, b) => {
    const indexA = processedHtml.indexOf(a.fullMatch || '');
    const indexB = processedHtml.indexOf(b.fullMatch || '');
    
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
  
  // Traiter les paragraphes individuellement
  return (
    <View>
      {allContents.map((item, index) => {
        if (item.type === 'h1') {
          return (
            <Text key={`h1-${index}`} style={styles.h1}>
              {renderTextWithStyles(item.segments)}
            </Text>
          );
        } else if (item.type === 'h2') {
          return (
            <Text key={`h2-${index}`} style={styles.h2}>
              {renderTextWithStyles(item.segments)}
            </Text>
          );
        } else if (item.type === 'h3') {
          return (
            <Text key={`h3-${index}`} style={styles.h3}>
              {renderTextWithStyles(item.segments)}
            </Text>
          );
        } else {
          return (
            <Text key={`p-${index}`} style={{...styles.p, ...item.styles}}>
              {renderTextWithStyles(item.segments)}
            </Text>
          );
        }
      })}
    </View>
  );
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
  contratData, // NOUVEAU: Ajouter ce paramètre pour accéder aux données du contrat
  concertData, 
  programmateurData, 
  artisteData, 
  lieuData, 
  entrepriseInfo 
}) => {
  // NOUVEAU: Utiliser la snapshot du template si disponible
  const effectiveTemplate = contratData?.templateSnapshot || template;
  
  console.log("Template effectif utilisé:", effectiveTemplate);
  console.log("Source du template:", contratData?.templateSnapshot ? "Snapshot stockée" : "Template live");
  
  // Débogage pour identifier pourquoi la date apparaît encore
  console.log("Template reçu dans ContratPDFWrapper:", effectiveTemplate);
  console.log("La propriété dateTemplate existe-t-elle?", effectiveTemplate && 'dateTemplate' in effectiveTemplate);
  
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
      'templateType': getTemplateTypeLabel(effectiveTemplate.type || 'session')
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
      <Text>{parseHtmlToReactPdf(replaceVariables(effectiveTemplate.headerContent))}</Text>
    </View>
  );
  
  const renderTitle = () => (
    <View style={{marginBottom: 15}}>
      <Text style={styles.defaultTitle}>
        {parseHtmlToReactPdf(replaceVariables(effectiveTemplate.titleTemplate))}
      </Text>
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
      <Text>{parseHtmlToReactPdf(replaceVariables(effectiveTemplate.footerContent))}</Text>
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
            {parseHtmlToReactPdf(processedBodyContent)}
          </View>
          
          {/* Zone de signature (depuis le template) */}
          {effectiveTemplate.signatureTemplate && (
            <View style={{marginTop: 30}}>
              {parseHtmlToReactPdf(replaceVariables(effectiveTemplate.signatureTemplate))}
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
            {parseHtmlToReactPdf(section)}
          </View>
          
          {/* Zone de signature uniquement sur la dernière page */}
          {index === contentSections.length - 1 && effectiveTemplate.signatureTemplate && (
            <View style={{marginTop: 30}}>
              {parseHtmlToReactPdf(replaceVariables(effectiveTemplate.signatureTemplate))}
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