import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Enregistrer Arial comme police
Font.register({
  family: 'Arial',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial@1.0.4/Arial.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial@1.0.4/Arial-Bold.ttf', fontWeight: 'bold' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/arial@1.0.4/Arial-Italic.ttf', fontStyle: 'italic' },
  ]
});

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Arial',
    fontSize: 9, // Taille de police 9 comme demandé
  },
  header: {
    fontSize: 8,
    marginBottom: 20,
    textAlign: 'center',
    paddingBottom: 10,
    borderBottom: '1px solid #ccc',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    width: 100,
    height: 40,
    objectFit: 'contain',
  },
  headerCompanyInfo: {
    flexDirection: 'column',
    textAlign: 'right',
    fontSize: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  sectionContent: {
    lineHeight: 1.5,
    textAlign: 'justify',
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
    fontWeight: 'bold',
    marginBottom: 50,
  },
  signatureLine: {
    borderTop: '1px solid #000',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: '1px solid #ccc',
    paddingTop: 10,
  },
  legalInfo: {
    fontSize: 7,
    color: '#999',
    marginTop: 5,
  }
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

const ContratPDF = ({ template, concertData, programmateurData, artisteData, lieuData, entrepriseInfo }) => {
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
        {/* En-tête avec informations de l'entreprise */}
        {entrepriseInfo && (
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {entrepriseInfo.logo && (
                <Image src={entrepriseInfo.logo} style={styles.headerLogo} />
              )}
              <View style={styles.headerCompanyInfo}>
                <Text>{entrepriseInfo.nom}</Text>
                <Text>{entrepriseInfo.adresse}</Text>
                <Text>{entrepriseInfo.codePostal} {entrepriseInfo.ville}</Text>
                <Text>Tél: {entrepriseInfo.telephone} - Email: {entrepriseInfo.email}</Text>
                {entrepriseInfo.siret && (
                  <Text>SIRET: {entrepriseInfo.siret} - APE: {entrepriseInfo.codeAPE}</Text>
                )}
              </View>
            </View>
          </View>
        )}
        
        {/* Titre du document */}
        <Text style={styles.title}>{documentTitle}</Text>
        <Text style={styles.date}>Fait à {lieuData?.ville || 'N/A'}, le {formattedDate}</Text>
        
        {/* Contenu du contrat */}
        {template.sections.map((section, index) => (
          <View style={styles.section} key={index}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>
              {parseHtmlToReactPdf(replaceVariables(section.content))}
            </Text>
          </View>
        ))}
        
        {/* Zone de signature */}
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
        
        {/* Pied de page avec mentions légales */}
        <View style={styles.footer}>
          {entrepriseInfo && (
            <>
              <Text>{entrepriseInfo.nom} - {entrepriseInfo.adresse}, {entrepriseInfo.codePostal} {entrepriseInfo.ville}</Text>
              {entrepriseInfo.siret && (
                <Text>SIRET: {entrepriseInfo.siret} - APE: {entrepriseInfo.codeAPE}</Text>
              )}
              {entrepriseInfo.mentionsLegales && (
                <Text style={styles.legalInfo}>{entrepriseInfo.mentionsLegales}</Text>
              )}
            </>
          )}
          <Text style={styles.legalInfo}>
            Document généré automatiquement par TourCraft le {formattedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ContratPDF;
