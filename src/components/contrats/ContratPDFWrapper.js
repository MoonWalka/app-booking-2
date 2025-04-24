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
  
  // Fonction récursive pour traiter les éléments HTML
  const processNode = (content, styles = {}) => {
    // Traiter d'abord le gras
    const boldRegex = /<(strong|b)>(.*?)<\/(strong|b)>/g;
    let boldMatch;
    let segments = [];
    let lastIndex = 0;
    
    // Trouver tous les segments en gras
    while ((boldMatch = boldRegex.exec(content)) !== null) {
      // Ajouter le texte avant le match avec les styles actuels
      if (boldMatch.index > lastIndex) {
        segments.push({
          text: content.substring(lastIndex, boldMatch.index),
          styles: { ...styles }
        });
      }
      
      // Traiter récursivement le contenu en gras avec le style bold ajouté
      const boldContent = processNode(boldMatch[2], { 
        ...styles, 
        fontWeight: 'bold' 
      });
      
      // Si le traitement récursif a retourné des segments, les ajouter
      if (Array.isArray(boldContent)) {
        segments = [...segments, ...boldContent];
      } else if (boldContent) {
        segments.push(boldContent);
      }
      
      lastIndex = boldMatch.index + boldMatch[0].length;
    }
    
    // Ajouter le reste du contenu avec les styles actuels
    if (lastIndex < content.length) {
      // Traiter l'italique dans le reste
      const italicRegex = /<(em|i)>(.*?)<\/(em|i)>/g;
      let italicMatch;
      let lastItalicIndex = lastIndex;
      let italicSegments = [];
      
      while ((italicMatch = italicRegex.exec(content.substring(lastIndex))) !== null) {
        const actualIndex = lastIndex + italicMatch.index;
        
        // Ajouter le texte avant l'italique
        if (actualIndex > lastItalicIndex) {
          italicSegments.push({
            text: content.substring(lastItalicIndex, actualIndex),
            styles: { ...styles }
          });
        }
        
        // Ajouter le texte en italique
        italicSegments.push({
          text: italicMatch[2],
          styles: { ...styles, fontStyle: 'italic' }
        });
        
        lastItalicIndex = actualIndex + italicMatch[0].length;
      }
      
      // Ajouter le reste sans formatage spécial
      if (lastItalicIndex < content.length) {
        italicSegments.push({
          text: content.substring(lastItalicIndex),
          styles: { ...styles }
        });
      }
      
      segments = [...segments, ...italicSegments];
    }
    
    // Si aucun formatage n'a été trouvé, retourner un segment unique
    if (segments.length === 0 && content.trim()) {
      return { text: content, styles };
    }
    
    return segments;
  };
  
  // Traiter les titres et paragraphes d'abord
  let processedHtml = html
    // Gérer les sauts de ligne
    .replace(/<br\s*\/?>/g, '\n')
    // Remplacer temporairement les balises spéciales par des marqueurs
    .replace(/<(strong|b)>(.*?)<\/(strong|b)>/g, (match) => match)
    .replace(/<(em|i)>(.*?)<\/(em|i)>/g, (match) => match);
  
  // Diviser par paragraphes et titres
  const sections = [];
  
  // Traiter les titres h1
  const h1Regex = /<h1[^>]*>(.*?)<\/h1>/g;
  let h1Match;
  let lastH1Index = 0;
  
  while ((h1Match = h1Regex.exec(processedHtml)) !== null) {
    // Ajouter le contenu avant le h1
    if (h1Match.index > lastH1Index) {
      sections.push({
        type: 'content',
        content: processedHtml.substring(lastH1Index, h1Match.index)
      });
    }
    
    // Ajouter le h1
    sections.push({
      type: 'h1',
      content: h1Match[1]
    });
    
    lastH1Index = h1Match.index + h1Match[0].length;
  }
  
  // Ajouter le reste
  if (lastH1Index < processedHtml.length) {
    sections.push({
      type: 'content',
      content: processedHtml.substring(lastH1Index)
    });
  }
  
  // Traiter les autres niveaux de titre et paragraphes dans chaque section
  const processedSections = sections.map(section => {
    if (section.type === 'h1') {
      return {
        type: 'h1',
        segments: processNode(section.content, { fontSize: 16, fontWeight: 'bold' })
      };
    }
    
    // Traiter les h2 dans la section content
    const h2Sections = [];
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/g;
    let h2Match;
    let lastH2Index = 0;
    
    while ((h2Match = h2Regex.exec(section.content)) !== null) {
      // Ajouter le contenu avant le h2
      if (h2Match.index > lastH2Index) {
        h2Sections.push({
          type: 'content',
          content: section.content.substring(lastH2Index, h2Match.index)
        });
      }
      
      // Ajouter le h2
      h2Sections.push({
        type: 'h2',
        content: h2Match[1]
      });
      
      lastH2Index = h2Match.index + h2Match[0].length;
    }
    
    // Ajouter le reste
    if (lastH2Index < section.content.length) {
      h2Sections.push({
        type: 'content',
        content: section.content.substring(lastH2Index)
      });
    }
    
    // Traiter les paragraphes dans chaque section h2
    return h2Sections.map(h2Section => {
      if (h2Section.type === 'h2') {
        return {
          type: 'h2',
          segments: processNode(h2Section.content, { fontSize: 14, fontWeight: 'bold' })
        };
      }
      
      // Traiter les paragraphes
      const pSections = [];
      const pRegex = /<p[^>]*>(.*?)<\/p>/g;
      let pMatch;
      let lastPIndex = 0;
      
      while ((pMatch = pRegex.exec(h2Section.content)) !== null) {
        // Ajouter le contenu avant le p
        if (pMatch.index > lastPIndex) {
          const textContent = h2Section.content
            .substring(lastPIndex, pMatch.index)
            .replace(/<[^>]*>/g, '') // Supprimer les balises restantes
            .trim();
            
          if (textContent) {
            pSections.push({
              type: 'text',
              segments: processNode(textContent)
            });
          }
        }
        
        // Ajouter le p
        pSections.push({
          type: 'p',
          segments: processNode(pMatch[1])
        });
        
        lastPIndex = pMatch.index + pMatch[0].length;
      }
      
      // Ajouter le reste
      if (lastPIndex < h2Section.content.length) {
        const textContent = h2Section.content
          .substring(lastPIndex)
          .replace(/<[^>]*>/g, '') // Supprimer les balises restantes
          .trim();
          
        if (textContent) {
          pSections.push({
            type: 'text',
            segments: processNode(textContent)
          });
        }
      }
      
      return pSections;
    }).flat();
  }).flat();
  
  // Transformer les sections traitées en composants React-PDF
  return (
    <View>
      {processedSections.map((section, sectionIndex) => {
        if (section.type === 'h1') {
          return (
            <Text key={`h1-${sectionIndex}`} style={styles.h1}>
              {renderTextWithStyles(section.segments)}
            </Text>
          );
        } else if (section.type === 'h2') {
          return (
            <Text key={`h2-${sectionIndex}`} style={styles.h2}>
              {renderTextWithStyles(section.segments)}
            </Text>
          );
        } else if (section.type === 'p') {
          return (
            <Text key={`p-${sectionIndex}`} style={styles.p}>
              {renderTextWithStyles(section.segments)}
            </Text>
          );
        } else if (section.type === 'text') {
          return (
            <Text key={`text-${sectionIndex}`}>
              {renderTextWithStyles(section.segments)}
            </Text>
          );
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