// src/components/contrats/ContratPDF.js
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
  // Suppression du style defaultDate qui n'est plus nécessaire
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
  
  // Version simplifiée: supprimer les balises HTML pour l'instant
  // À remplacer par une conversion plus sophistiquée plus tard
  return <Text>{html.replace(/<[^>]*>/g, '')}</Text>;
};

const ContratPDF = ({ template, concertData, programmateurData, artisteData, lieuData, entrepriseInfo }) => {
  // Débogage pour identifier pourquoi la date apparaît encore
  console.log("Template reçu dans ContratPDF:", template);
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
    const today = new Date();
    const formattedDate = format(today, "dd MMMM yyyy", { locale: fr });
    
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
      
      // Variables de date actuelle
      'date_jour': format(today, "dd", { locale: fr }),
      'date_mois': format(today, "MMMM", { locale: fr }),
      'date_annee': format(today, "yyyy", { locale: fr }),
      'date_complete': formattedDate,
      
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête (si défini dans le template) */}
        {template.headerContent && (
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
        )}
        
        {/* Titre (depuis le template) */}
        <Text style={styles.defaultTitle}>
          {parseHtmlToReactPdf(replaceVariables(template.titleTemplate || `Contrat - {concert_titre}`))}
        </Text>
        
        {/* Suppression de la ligne de date - Si vous voyez encore une date, elle vient d'ailleurs */}
        
        {/* Contenu principal */}
        <View style={styles.content}>
          {parseHtmlToReactPdf(replaceVariables(template.bodyContent))}
        </View>
        
        {/* Zone de signature (depuis le template) */}
        <View>
          {parseHtmlToReactPdf(replaceVariables(template.signatureTemplate || 
            `<div style="display: flex; justify-content: space-between; margin-top: 30px;">
              <div style="width: 45%;">
                <div style="margin-bottom: 50px;"><strong>Pour l'Organisateur:</strong></div>
                <div>{programmateur_nom}</div>
                <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
              </div>
              <div style="width: 45%;">
                <div style="margin-bottom: 50px;"><strong>Pour l'Artiste:</strong></div>
                <div>{artiste_nom}</div>
                <div style="border-top: 1px solid #000; margin-top: 5px;"></div>
              </div>
            </div>`
          ))}
        </View>
        
        {/* Pied de page (si défini dans le template) */}
        {template.footerContent && (
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
        )}
      </Page>
    </Document>
  );
};

export default ContratPDF;
