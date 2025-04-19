// src/components/contrats/ContratPDF.js
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
    fontSize: 10,
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
  // Version simplifiée de conversion HTML -> Text
  if (!html) return '';
  
  // Supprimer les balises HTML
  let text = html.replace(/<[^>]*>/g, '');
  
  // Convertir les entités HTML les plus courantes
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
  const documentTitle = concertData?.titre 
    ? `Contrat - ${concertData.titre}` 
    : `Contrat de prestation artistique${artisteData?.nom ? ` - ${artisteData.nom}` : ''}`;
  
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
        
        // Variables entreprise
        'entreprise_nom': safeData.entreprise.nom || 'Non spécifiée',
        'entreprise_adresse': safeData.entreprise.adresse || 'Non spécifiée',
        'entreprise_ville': safeData.entreprise.ville || 'Non spécifiée',
        'entreprise_code_postal': safeData.entreprise.codePostal || 'Non spécifié',
        'entreprise_telephone': safeData.entreprise.telephone || 'Non spécifié',
        'entreprise_email': safeData.entreprise.email || 'Non spécifié',
        'entreprise_siret': safeData.entreprise.siret || 'Non spécifié',
        
        // Variables de date actuelle
        'date_jour': format(today, "dd", { locale: fr }),
        'date_mois': format(today, "MMMM", { locale: fr }),
        'date_annee': format(today, "yyyy", { locale: fr }),
        'date_complete': formattedDate
      };
      
      // Remplacer toutes les variables possibles
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{${key}}`, 'g');
        processedContent = processedContent.replace(regex, value);
      });
      
      return processedContent;
    };
  
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* En-tête avec informations de l'entreprise */}
          {safeData.entreprise && (
            <View style={styles.header}>
              <View style={styles.headerRow}>
                {safeData.entreprise.logo && (
                  <Image src={safeData.entreprise.logo} style={styles.headerLogo} />
                )}
                <View style={styles.headerCompanyInfo}>
                  <Text>{safeData.entreprise.nom || ''}</Text>
                  <Text>{safeData.entreprise.adresse || ''}</Text>
                  <Text>{safeData.entreprise.codePostal || ''} {safeData.entreprise.ville || ''}</Text>
                  <Text>Tél: {safeData.entreprise.telephone || ''} - Email: {safeData.entreprise.email || ''}</Text>
                  {safeData.entreprise.siret && (
                    <Text>SIRET: {safeData.entreprise.siret} - APE: {safeData.entreprise.codeAPE || ''}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
          
          {/* Titre du document */}
          <Text style={styles.title}>{documentTitle}</Text>
          <Text style={styles.date}>Fait à {safeData.lieu.ville || safeData.entreprise.ville || 'N/A'}, le {formattedDate}</Text>
          
          {/* Contenu du contrat */}
          {template && template.sections ? (
            template.sections.map((section, index) => (
              <View style={styles.section} key={index}>
                <Text style={styles.sectionTitle}>{section.title || `Section ${index + 1}`}</Text>
                <Text style={styles.sectionContent}>
                  {parseHtmlToReactPdf(replaceVariables(section.content))}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionContent}>
                Ce document a été généré à partir d'un modèle incomplet ou manquant.
              </Text>
            </View>
          )}
          
          {/* Zone de signature */}
          <View style={styles.signature}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureTitle}>Pour l'Organisateur:</Text>
              <Text>{safeData.programmateur.prenom || ''} {safeData.programmateur.nom || 'N/A'}</Text>
              {safeData.programmateur.structure && (
                <Text>{safeData.programmateur.structure}</Text>
              )}
              <Text style={styles.signatureLine}></Text>
            </View>
            
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureTitle}>Pour l'Artiste:</Text>
              <Text>{safeData.artiste.nom || 'N/A'}</Text>
              <Text style={styles.signatureLine}></Text>
            </View>
          </View>
          
          {/* Pied de page avec mentions légales */}
          <View style={styles.footer}>
            {safeData.entreprise && (
              <>
                <Text>{safeData.entreprise.nom || ''} - {safeData.entreprise.adresse || ''}, {safeData.entreprise.codePostal || ''} {safeData.entreprise.ville || ''}</Text>
                {safeData.entreprise.siret && (
                  <Text>SIRET: {safeData.entreprise.siret} - APE: {safeData.entreprise.codeAPE || ''}</Text>
                )}
                {safeData.entreprise.mentionsLegales && (
                  <Text style={styles.legalInfo}>{safeData.entreprise.mentionsLegales}</Text>
                )}
              </>
            )}
            <Text style={styles.legalInfo}>
              Document généré automatiquement le {formattedDate}
            </Text>
          </View>
        </Page>
      </Document>
    );
  };
  
  export default ContratPDF;
