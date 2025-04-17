import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrer une police
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 }
  ]
});

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1px solid #ccc',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 10,
    textAlign: 'center',
  },
  date: {
    fontSize: 12,
    color: '#777',
    marginBottom: 20,
    textAlign: 'right',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  sectionContent: {
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
    borderTop: '1px solid #ccc',
    paddingTop: 10,
  },
  signature: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: {
    width: '45%',
  },
  signatureTitle: {
    fontWeight: 500,
    marginBottom: 50,
  },
  signatureLine: {
    borderTop: '1px solid #000',
    marginTop: 5,
  },
});

const parseHtmlToReactPdf = (html) => {
  // Cette fonction est une version simplifiée qui convertit le HTML basique en composants React PDF
  // Une vraie implémentation nécessiterait une bibliothèque de parsing HTML
  
  // Supprimer les balises HTML les plus courantes
  let text = html.replace(/<[^>]*>/g, '');
  
  // Convertir les entités HTML
  text = text.replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
  
  return text;
};

const ContratPDF = ({ template, concertData, programmateurData, artisteData, lieuData }) => {
  const today = new Date();
  const formattedDate = format(today, "dd MMMM yyyy", { locale: fr });
  
  // Préparer le titre du document
  const documentTitle = concertData.titre 
    ? `Contrat - ${concertData.titre}` 
    : `Contrat de prestation artistique - ${artisteData.nom}`;
  
  // Fonction pour remplacer les variables dans le contenu
  const replaceVariables = (content) => {
    let processedContent = content;
    
    // Variables programmateur
    processedContent = processedContent
      .replace(/{programmateur_nom}/g, programmateurData?.nom || 'N/A')
      .replace(/{programmateur_structure}/g, programmateurData?.structure || 'N/A')
      .replace(/{programmateur_email}/g, programmateurData?.email || 'N/A');
    
    // Variables artiste
    processedContent = processedContent
      .replace(/{artiste_nom}/g, artisteData?.nom || 'N/A')
      .replace(/{artiste_genre}/g, artisteData?.genre || 'N/A');
    
    // Variables concert
    const concertDate = concertData.date 
      ? format(new Date(concertData.date), "dd/MM/yyyy", { locale: fr }) 
      : 'N/A';
    
    processedContent = processedContent
      .replace(/{concert_titre}/g, concertData?.titre || 'N/A')
      .replace(/{concert_date}/g, concertDate)
      .replace(/{concert_montant}/g, concertData?.montant || 'N/A');
    
    // Variables lieu
    processedContent = processedContent
      .replace(/{lieu_nom}/g, lieuData?.nom || 'N/A')
      .replace(/{lieu_adresse}/g, lieuData?.adresse || 'N/A')
      .replace(/{lieu_code_postal}/g, lieuData?.codePostal || 'N/A')
      .replace(/{lieu_ville}/g, lieuData?.ville || 'N/A')
      .replace(/{lieu_capacite}/g, lieuData?.capacite || 'N/A');
    
    // Variables de date actuelle
    processedContent = processedContent
      .replace(/{date_jour}/g, format(today, "dd", { locale: fr }))
      .replace(/{date_mois}/g, format(today, "MMMM", { locale: fr }))
      .replace(/{date_annee}/g, format(today, "yyyy", { locale: fr }));
    
    return processedContent;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{documentTitle}</Text>
          <Text style={styles.date}>Fait à {lieuData?.ville || 'N/A'}, le {formattedDate}</Text>
        </View>
        
        {template.sections.map((section, index) => (
          <View style={styles.section} key={index}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>
              {parseHtmlToReactPdf(replaceVariables(section.content))}
            </Text>
          </View>
        ))}
        
        <View style={styles.signature}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>Pour l'Organisateur:</Text>
            <Text>{programmateurData?.nom || 'N/A'}</Text>
            <Text style={styles.signatureLine}></Text>
          </View>
          
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>Pour l'Artiste:</Text>
            <Text>{artisteData?.nom || 'N/A'}</Text>
            <Text style={styles.signatureLine}></Text>
          </View>
        </View>
        
        <Text style={styles.footer}>
          Document généré automatiquement par TourCraft le {formattedDate}
        </Text>
      </Page>
    </Document>
  );
};

export default ContratPDF;
