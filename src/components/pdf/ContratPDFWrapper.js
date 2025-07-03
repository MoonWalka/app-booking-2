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
    contact,  // Nouveau format
    programmateur,  // Rétrocompatibilité
    artiste, 
    lieu,
    structure,
    entreprise,
    
    // Format 2 : Ancien format
    contratData, 
    concertData, 
    contactData,  // Nouveau format
    programmateurData,  // Rétrocompatibilité
    artisteData, 
    lieuData,
    structureData,
    entrepriseInfo 
  } = data;

  // Utiliser la snapshot du template si disponible
  const effectiveTemplate = contrat?.templateSnapshot || contratData?.templateSnapshot || template;
  
  // Sécuriser contre les valeurs nulles ou undefined
  const safeData = {
    template: effectiveTemplate,
    concert: concert || concertData || {},
    contact: contact || contactData || {},  // Nouveau format
    programmateur: programmateur || programmateurData || {},  // Rétrocompatibilité
    artiste: artiste || artisteData || {},
    lieu: lieu || lieuData || {},
    structure: structure || structureData || {},
    entreprise: entreprise || entrepriseInfo || {},
    contratData: contratData || data.contratData || null  // Ajout du support pour les données du formulaire
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
  console.log('[DEBUG ContratPDFWrapper] Structure data:', safeData.structure);
  
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
    
    // Variables Organisateur (Partie A - si contratData est fourni)
    ...(safeData.contratData?.organisateur && {
      'organisateur_raison_sociale': safeData.contratData.organisateur.raisonSociale || 'Non spécifié',
      'organisateur_adresse': safeData.contratData.organisateur.adresse || 'Non spécifiée',
      'organisateur_code_postal': safeData.contratData.organisateur.codePostal || 'Non spécifié',
      'organisateur_ville': safeData.contratData.organisateur.ville || 'Non spécifiée',
      'organisateur_pays': safeData.contratData.organisateur.pays || 'France',
      'organisateur_telephone': safeData.contratData.organisateur.telephone || 'Non spécifié',
      'organisateur_email': safeData.contratData.organisateur.email || 'Non spécifié',
      'organisateur_siret': safeData.contratData.organisateur.siret || 'Non spécifié',
      'organisateur_numero_tva': safeData.contratData.organisateur.numeroTva || 'Non spécifié',
      'organisateur_code_ape': safeData.contratData.organisateur.codeApe || 'Non spécifié',
      'organisateur_numero_licence': safeData.contratData.organisateur.numeroLicence || 'Non spécifié',
      'organisateur_signataire': safeData.contratData.organisateur.signataire || 'Non spécifié',
      'organisateur_qualite': safeData.contratData.organisateur.qualite || 'Non spécifiée',
    }),
    
    // Variables Producteur (Partie B - si contratData est fourni)
    ...(safeData.contratData?.producteur && {
      'producteur_raison_sociale': safeData.contratData.producteur.raisonSociale || safeData.entreprise?.nom || 'Non spécifié',
      'producteur_adresse': safeData.contratData.producteur.adresse || safeData.entreprise?.adresse || 'Non spécifiée',
      'producteur_code_postal': safeData.contratData.producteur.codePostal || 'Non spécifié',
      'producteur_ville': safeData.contratData.producteur.ville || 'Non spécifiée',
      'producteur_pays': safeData.contratData.producteur.pays || 'France',
      'producteur_telephone': safeData.contratData.producteur.telephone || safeData.entreprise?.telephone || 'Non spécifié',
      'producteur_email': safeData.contratData.producteur.email || safeData.entreprise?.email || 'Non spécifié',
      'producteur_siret': safeData.contratData.producteur.siret || safeData.entreprise?.siret || 'Non spécifié',
      'producteur_numero_tva': safeData.contratData.producteur.numeroTva || 'Non spécifié',
      'producteur_code_ape': safeData.contratData.producteur.codeApe || 'Non spécifié',
      'producteur_numero_licence': safeData.contratData.producteur.numeroLicence || 'Non spécifié',
      'producteur_signataire': safeData.contratData.producteur.signataire || safeData.entreprise?.representant || 'Non spécifié',
      'producteur_qualite': safeData.contratData.producteur.qualite || safeData.entreprise?.fonctionRepresentant || 'Non spécifiée',
    }),
    
    // Variables Prestations (si contratData est fourni)
    ...(safeData.contratData?.prestations && {
      'spectacle_nom': safeData.contratData.prestations.nomSpectacle || 'Non spécifié',
      'plateau_duree': safeData.contratData.prestations.dureePlateau || 'Non spécifiée',
      'plateau_contenu': safeData.contratData.prestations.contenuPlateau || 'Non spécifié',
      'intervenants': safeData.contratData.prestations.intervenants || 'Non spécifiés',
      'conditions_techniques': safeData.contratData.prestations.conditionsTechniques || 'Non spécifiées',
      'technique_fournie': safeData.contratData.prestations.techniqueFournie || 'Non spécifiée',
      'technique_demandee': safeData.contratData.prestations.techniqueDemandee || 'Non spécifiée',
      'dispositions_particulieres': safeData.contratData.prestations.dispositionsParticulieres || 'Non spécifiées',
    }),
    
    // Variables de calcul (si contratData est fourni)
    ...(safeData.contratData?.prestations && Array.isArray(safeData.contratData.prestations) && {
      'total_ht': (() => {
        const total = safeData.contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantHT) || 0), 0);
        return total.toFixed(2).replace('.', ',') + ' €';
      })(),
      'total_tva': (() => {
        const total = safeData.contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantTVA) || 0), 0);
        return total.toFixed(2).replace('.', ',') + ' €';
      })(),
      'total_ttc': (() => {
        const total = safeData.contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantTTC) || 0), 0);
        return total.toFixed(2).replace('.', ',') + ' €';
      })(),
      'total_ttc_lettres': (() => {
        const total = safeData.contratData.prestations.reduce((sum, p) => sum + (parseFloat(p.montantTTC) || 0), 0);
        return montantEnLettres(total);
      })(),
      // Première prestation
      ...(safeData.contratData.prestations[0] && {
        'prestation_1_description': safeData.contratData.prestations[0].description || 'Non spécifiée',
        'prestation_1_montant_ht': (parseFloat(safeData.contratData.prestations[0].montantHT) || 0).toFixed(2).replace('.', ',') + ' €',
        'prestation_1_tva': safeData.contratData.prestations[0].tauxTVA ? `${safeData.contratData.prestations[0].tauxTVA}%` : '0%',
        'prestation_1_montant_ttc': (parseFloat(safeData.contratData.prestations[0].montantTTC) || 0).toFixed(2).replace('.', ',') + ' €',
      })
    }),
    
    // Variables Règlement - pour le nouveau système
    ...(safeData.contratData?.reglement && {
      'montant_ht': safeData.contratData.reglement.montantHT ? `${safeData.contratData.reglement.montantHT.toFixed(2).replace('.', ',')} €` : 'Non spécifié',
      'taux_tva': safeData.contratData.reglement.tauxTVA ? `${safeData.contratData.reglement.tauxTVA}%` : '0%',
      'montant_tva': safeData.contratData.reglement.montantTVA ? `${safeData.contratData.reglement.montantTVA.toFixed(2).replace('.', ',')} €` : 'Non spécifié',
      'total_ttc': safeData.contratData.reglement.totalTTC ? `${safeData.contratData.reglement.totalTTC.toFixed(2).replace('.', ',')} €` : 'Non spécifié',
      'total_ttc_lettres': safeData.contratData.reglement.totalTTC ? montantEnLettres(safeData.contratData.reglement.totalTTC) : 'Non spécifié',
      'mode_reglement': safeData.contratData.reglement.modeReglement || 'Non spécifié',
      'delai_reglement': safeData.contratData.reglement.delaiReglement || 'Non spécifié',
    }),
    
    // Variables Représentations (si contratData est fourni)
    ...(safeData.contratData?.representations && {
      'representation_debut': safeData.contratData.representations.debut || 'Non spécifiée',
      'representation_fin': safeData.contratData.representations.fin || 'Non spécifiée',
      'representation_detail': safeData.contratData.representations.representation || 'Non spécifié',
      'nombre_invitations': safeData.contratData.representations.invitations && safeData.contratData.representations.nbAdmins ? safeData.contratData.representations.nbAdmins : '0',
      'salle': safeData.contratData.representations.salle || 'Non spécifiée',
      'horaire_debut': safeData.contratData.representations.horaireDebut || 'Non spécifié',
      'horaire_fin': safeData.contratData.representations.horaireFin || 'Non spécifié',
      'nombre_representations': safeData.contratData.representations.nbRepresentations || '1',
      // Variables avec préfixe pour compatibilité
      'representation_date_debut': safeData.contratData.representations.debut || 'Non spécifiée',
      'representation_date_fin': safeData.contratData.representations.fin || 'Non spécifiée',
      'representation_horaire_debut': safeData.contratData.representations.horaireDebut || 'Non spécifié',
      'representation_horaire_fin': safeData.contratData.representations.horaireFin || 'Non spécifié',
      'representation_nombre': safeData.contratData.representations.nbRepresentations || '1',
      'representation_salle': safeData.contratData.representations.salle || 'Non spécifiée',
      'representation_type': safeData.contratData.representations.type || 'Concert',
      'representation_invitations': safeData.contratData.representations.invitations ? safeData.contratData.representations.nbAdmins || '0' : '0',
    }),
    
    // Variables Logistique (si contratData est fourni)
    ...(safeData.contratData?.logistique && {
      'restauration': safeData.contratData.logistique.restauration || 'Non spécifiée',
      'hebergement': safeData.contratData.logistique.hebergement || 'Non spécifié',
      'transports': safeData.contratData.logistique.transports || 'Non spécifiés',
      'catering': safeData.contratData.logistique.catering || 'Non spécifié',
      'loges': safeData.contratData.logistique.loges || 'Non spécifiées',
      'parking': safeData.contratData.logistique.parking || 'Non spécifié',
      'autres_logistique': safeData.contratData.logistique.autres || 'Non spécifié',
    }),
    // Variables hébergement détaillées (si disponibles)
    ...(safeData.contratData?.hebergements && safeData.contratData.hebergements.length > 0 && {
      'hebergement_nombre_total': safeData.contratData.hebergements.reduce((sum, h) => sum + (parseInt(h.singles || 0) + parseInt(h.doubles || 0) * 2), 0).toString(),
      'hebergement_singles': safeData.contratData.hebergements.reduce((sum, h) => sum + parseInt(h.singles || 0), 0).toString(),
      'hebergement_doubles': safeData.contratData.hebergements.reduce((sum, h) => sum + parseInt(h.doubles || 0), 0).toString(),
      'hebergement_arrivee': safeData.contratData.hebergements[0]?.dateArrivee || 'Non spécifiée',
      'hebergement_depart': safeData.contratData.hebergements[0]?.dateDepart || 'Non spécifiée',
    }),
    ...(safeData.contratData?.restaurations && safeData.contratData.restaurations.length > 0 && {
      'restauration_nombre': safeData.contratData.restaurations.reduce((sum, r) => sum + parseInt(r.nombre || 0), 0).toString(),
    }),
    'transport_type': 'Non spécifié', // À mapper si les données sont disponibles
    
    // Variables Règlement (si contratData est fourni)
    ...(safeData.contratData?.echeances && safeData.contratData.echeances.length > 0 && {
      'echeance_1_nature': safeData.contratData.echeances[0]?.nature || 'Non spécifiée',
      'echeance_1_date': safeData.contratData.echeances[0]?.date || 'Non spécifiée',
      'echeance_1_montant': safeData.contratData.echeances[0]?.montant ? `${safeData.contratData.echeances[0].montant} €` : 'Non spécifié',
    }),
    'mode_reglement': safeData.contratData?.negociation?.moyenPaiement || 'virement',
    'delai_paiement': '30 jours', // Valeur par défaut, à ajuster selon les besoins
    
    // Variables contact (ex-contact) - Support rétrocompatibilité
    'contact_nom': safeData.contact?.nom || safeData.programmateur?.nom || 'Non spécifié',
    'contact_prenom': safeData.contact?.prenom || safeData.programmateur?.prenom || '',
    'contact_structure': safeData.contact?.structure || safeData.programmateur?.structure || 'Non spécifiée',
    'contact_email': safeData.contact?.email || safeData.programmateur?.email || 'Non spécifié',
    'contact_telephone': safeData.contact?.telephone || safeData.programmateur?.telephone || 'Non spécifié',
    'contact_adresse': safeData.contact?.adresse || safeData.programmateur?.adresse || 'Non spécifiée',
    'contact_siret': safeData.contact?.siret || safeData.programmateur?.siret || 'Non spécifié',
    'contact_numero_intracommunautaire': safeData.contact?.numeroIntracommunautaire || safeData.programmateur?.numeroIntracommunautaire || safeData.programmateur?.numero_intracommunautaire || 'Non spécifié',
    'contact_representant': safeData.contact?.representant || safeData.programmateur?.representant || safeData.contact?.nom || safeData.programmateur?.nom || 'Non spécifié',
    'contact_qualite_representant': safeData.contact?.qualiteRepresentant || safeData.programmateur?.qualiteRepresentant || safeData.programmateur?.qualite_representant || safeData.contact?.fonction || safeData.programmateur?.fonction || 'Non spécifiée',
    
    // Variables contact (DEPRECATED - pour rétrocompatibilité des anciens templates)
    'programmateur_nom': safeData.contact?.nom || safeData.programmateur?.nom || 'Non spécifié',
    'programmateur_prenom': safeData.contact?.prenom || safeData.programmateur?.prenom || '',
    'programmateur_structure': safeData.contact?.structure || safeData.programmateur?.structure || 'Non spécifiée',
    'programmateur_email': safeData.contact?.email || safeData.programmateur?.email || 'Non spécifié',
    'programmateur_telephone': safeData.contact?.telephone || safeData.programmateur?.telephone || 'Non spécifié',
    'programmateur_adresse': safeData.contact?.adresse || safeData.programmateur?.adresse || 'Non spécifiée',
    'programmateur_siret': safeData.contact?.siret || safeData.programmateur?.siret || 'Non spécifié',
    'programmateur_numero_intracommunautaire': safeData.contact?.numeroIntracommunautaire || safeData.programmateur?.numeroIntracommunautaire || safeData.programmateur?.numero_intracommunautaire || 'Non spécifié',
    'programmateur_representant': safeData.contact?.representant || safeData.programmateur?.representant || safeData.contact?.nom || safeData.programmateur?.nom || 'Non spécifié',
    'programmateur_qualite_representant': safeData.contact?.qualiteRepresentant || safeData.programmateur?.qualiteRepresentant || safeData.programmateur?.qualite_representant || safeData.contact?.fonction || safeData.programmateur?.fonction || 'Non spécifiée',
    
    // Variables artiste
    'artiste_nom': safeData.artiste?.nom || 'Non spécifié',
    'artiste_genre': safeData.artiste?.genre || 'Non spécifié',
    'artiste_contact': safeData.artiste?.contact || 'Non spécifié',
    'artiste_representant': safeData.artiste?.representant || safeData.artiste?.contact || 'Non spécifié',
    'artiste_structure_nom': safeData.artiste?.structureNom || safeData.artiste?.structure || 'Non spécifiée',
    'artiste_structure_siret': safeData.artiste?.structureSiret || 'Non spécifié',
    
    // Variables concert
    'concert_titre': safeData.concert?.titre || 'Non spécifié',
    'concert_date': formatSafeDate(safeData.concert?.date),
    'concert_heure': safeData.concert?.heure || 'Non spécifiée',
    'concert_montant': safeData.concert?.montant 
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(safeData.concert.montant) 
      : 'Non spécifié',
    'concert_montant_lettres': montantEnLettres(safeData.concert?.montant),
    'concert_type': safeData.concert?.type || 'Concert',
    
    // Variables lieu - Utiliser le libellé du concert si pas de lieu référencé
    'lieu_nom': safeData.lieu?.nom || safeData.concert?.libelle || 'Non spécifié',
    'lieu_adresse': safeData.lieu?.adresse || 'Non spécifiée',
    'lieu_code_postal': safeData.lieu?.codePostal || safeData.lieu?.code_postal || 'Non spécifié',
    'lieu_ville': safeData.lieu?.ville || safeData.concert?.lieuVille || 'Non spécifiée',
    'lieu_capacite': safeData.lieu?.capacite || 'Non spécifiée',
    
    // Variables structure (utiliser les données du contact si pas de structure séparée)
    'structure_nom': safeData.structure?.nom || safeData.structure?.raisonSociale || safeData.contact?.structure || safeData.programmateur?.structure || 'Non spécifiée',
    'structure_siret': safeData.structure?.siret || safeData.contact?.siret || safeData.programmateur?.siret || 'Non spécifié',
    'structure_adresse': (() => {
      // L'adresse peut être un objet avec {adresse, codePostal, ville, pays}
      if (safeData.structure?.adresse && typeof safeData.structure.adresse === 'object') {
        return safeData.structure.adresse.adresse || 'Non spécifiée';
      }
      return safeData.structure?.adresse || safeData.contact?.adresse || safeData.programmateur?.adresse || 'Non spécifiée';
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
    'date_signature': format(new Date(), "dd/MM/yyyy", { locale: fr }),
    
    // Variables signature
    'lieu_signature': safeData.lieu?.ville || safeData.concert?.lieuVille || 'Non spécifiée',
    'programmateur_fonction': safeData.contact?.fonction || safeData.programmateur?.fonction || 'Non spécifiée',
    
    // Variables spéciales
    'SAUT_DE_PAGE': '<div style="page-break-after: always;"></div>',
    'page': '{page}',
    'total': '{total}',
    
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
  
  // D'abord remplacer les sauts de page - Support des deux formats pour compatibilité
  const pageBreakRegexBrackets = /\[SAUT_DE_PAGE\]/gi;
  const pageBreakRegexCurly = /\{SAUT_DE_PAGE\}/gi;
  
  // Balise HTML optimisée pour Puppeteer avec tous les styles nécessaires
  const pageBreakHtml = '<div class="page-break" style="page-break-after: always !important; break-after: page !important; page-break-before: avoid !important; break-before: avoid !important; height: 0; margin: 0; padding: 0; visibility: hidden; clear: both; display: block;"></div>';
  
  let pageBreakCount = 0;
  
  // Remplacer le format avec crochets [SAUT_DE_PAGE]
  const bracketMatches = (processedContent.match(pageBreakRegexBrackets) || []).length;
  if (bracketMatches > 0) {
    processedContent = processedContent.replace(pageBreakRegexBrackets, pageBreakHtml);
    pageBreakCount += bracketMatches;
  }
  
  // Remplacer le format avec accolades {SAUT_DE_PAGE}
  const curlyMatches = (processedContent.match(pageBreakRegexCurly) || []).length;
  if (curlyMatches > 0) {
    processedContent = processedContent.replace(pageBreakRegexCurly, pageBreakHtml);
    pageBreakCount += curlyMatches;
  }
  
  if (pageBreakCount > 0) {
    console.log(`🔄 [PDF] ${pageBreakCount} saut(s) de page remplacé(s)`);
  }
  
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
  
  // Note: Les sauts de page ont déjà été traités au début de la fonction
  // avec tous les styles nécessaires pour Puppeteer
  
  return processedContent;
};

/**
 * Traite les sauts de page dans l'aperçu HTML
 */
const processPageBreaks = (htmlContent) => {
  let content = htmlContent;
  
  // 1. Remplacer les balises hr avec classe page-break (ancien format)
  content = content.replace(
    /<hr\s+class=["|']page-break["|'][^>]*>/gi,
    '<div class="page-break"></div>'
  );
  
  // 2. Traiter les divs créés par Quill avec data-page-break="true"
  // Remplacer tout le contenu interne par un div vide avec la bonne classe
  content = content.replace(
    /<div[^>]*data-page-break=["|']true["|'][^>]*>[\s\S]*?<\/div>/gi,
    '<div class="page-break"></div>'
  );
  
  return content;
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
const getContratHTML = (data, title = '', forPreview = false, editedContent = null) => {
  console.log('[DEBUG ContratPDFWrapper] getContratHTML data:', data);
  const safeData = createSafeData(data);

  // Si on a du contenu édité, l'utiliser mais remplacer les variables
  if (editedContent) {
    // Préparer les variables pour le remplacement
    const variables = prepareContractVariables(safeData);
    
    // Remplacer les variables dans le contenu édité
    const processedContent = replaceVariables(editedContent, variables);
    
    // Traiter les sauts de page
    const finalContent = processPageBreaks(processedContent);
    
    // Construire le HTML avec le contenu édité et traité
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          /* Styles critiques pour l'aperçu web */
          body.contrat-print-mode {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: normal;
            color: #000000;
            background-color: white;
            margin: 20px;
            padding: 0;
          }
          
          /* FORCER LES INTERLIGNES COMME DANS L'ÉDITEUR */
          .contrat-print-mode * {
            line-height: normal !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          
          .contrat-print-mode p {
            margin-bottom: 0 !important;
            line-height: normal !important;
          }
          
          .contrat-print-mode br {
            line-height: normal !important;
          }
          
          /* Spécifiquement pour les spans de Google Docs */
          .contrat-print-mode span {
            line-height: inherit !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .contrat-print-mode .preview-note {
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 8px 12px;
            border-radius: 4px;
            margin: 0 0 20px 0;
            font-size: 11pt;
            border-left: 4px solid #1976d2;
          }
          .contrat-print-mode h1, .contrat-print-mode h2, .contrat-print-mode h3 {
            margin-top: 0.5em;
            margin-bottom: 0.25em;
            font-weight: bold;
          }
          
          /* Styles pour les sauts de page dans l'aperçu */
          .contrat-print-mode .page-break {
            page-break-after: always;
            break-after: page;
            display: block;
            height: 0;
            margin: 20px 0;
            border-bottom: 2px dashed #999;
            position: relative;
          }
          
          /* Indicateur visuel pour l'aperçu web */
          .contrat-print-mode .page-break::after {
            content: "--- Saut de page ---";
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 10px;
            color: #999;
            font-size: 10pt;
            font-style: italic;
          }
          
          /* Support des tailles personnalisées dans les PDF */
          .contrat-print-mode .ql-size-8pt { font-size: 8pt !important; }
          .contrat-print-mode .ql-size-9pt { font-size: 9pt !important; }
          .contrat-print-mode .ql-size-10pt { font-size: 10pt !important; }
          .contrat-print-mode .ql-size-11pt { font-size: 11pt !important; }
          .contrat-print-mode .ql-size-12pt { font-size: 12pt !important; }
          .contrat-print-mode .ql-size-14pt { font-size: 14pt !important; }
          .contrat-print-mode .ql-size-16pt { font-size: 16pt !important; }
          .contrat-print-mode .ql-size-18pt { font-size: 18pt !important; }
          .contrat-print-mode .ql-size-20pt { font-size: 20pt !important; }
          .contrat-print-mode .ql-size-24pt { font-size: 24pt !important; }
          .contrat-print-mode .ql-size-28pt { font-size: 28pt !important; }
          .contrat-print-mode .ql-size-32pt { font-size: 32pt !important; }
          .contrat-print-mode .ql-size-36pt { font-size: 36pt !important; }
          .contrat-print-mode .ql-size-48pt { font-size: 48pt !important; }
          .contrat-print-mode .ql-size-72pt { font-size: 72pt !important; }
          .contrat-print-mode .ql-size-96pt { font-size: 96pt !important; }
          
          /* Support de l'interligne dans les PDF */
          .contrat-print-mode [style*="line-height: 1.0"] { line-height: 1.0 !important; }
          .contrat-print-mode [style*="line-height: 1.1"] { line-height: 1.1 !important; }
          .contrat-print-mode [style*="line-height: 1.2"] { line-height: 1.2 !important; }
          .contrat-print-mode [style*="line-height: 1.3"] { line-height: 1.3 !important; }
          .contrat-print-mode [style*="line-height: 1.4"] { line-height: 1.4 !important; }
          .contrat-print-mode [style*="line-height: 1.5"] { line-height: 1.5 !important; }
          .contrat-print-mode [style*="line-height: 1.6"] { line-height: 1.6 !important; }
          .contrat-print-mode [style*="line-height: 1.8"] { line-height: 1.8 !important; }
          .contrat-print-mode [style*="line-height: 2.0"] { line-height: 2.0 !important; }
          .contrat-print-mode [style*="line-height: 2.2"] { line-height: 2.2 !important; }
          .contrat-print-mode [style*="line-height: 2.5"] { line-height: 2.5 !important; }
          .contrat-print-mode [style*="line-height: 3.0"] { line-height: 3.0 !important; }
          
          /* Support des sauts de page - Configuration complète pour Puppeteer */
          .contrat-print-mode .page-break {
            page-break-after: always !important;
            page-break-before: avoid !important;
            break-after: page !important;
            break-before: avoid !important;
            display: block;
            height: 0;
            margin: 0;
            padding: 0;
            visibility: hidden;
            clear: both;
          }
          
          /* Forcer un nouveau contexte de formatage pour les sauts de page */
          .contrat-print-mode .page-break::before,
          .contrat-print-mode .page-break::after {
            content: "";
            display: table;
            clear: both;
          }
          
          /* Configuration spécifique pour Puppeteer */
          .contrat-print-mode div.page-break {
            page-break-after: always !important;
            break-after: page !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          
          /* Pour l'aperçu web - afficher une ligne visuelle */
          @media screen {
            .contrat-print-mode .page-break {
              border-top: 2px dashed #ccc;
              margin: 20px 0;
              padding-top: 20px;
              visibility: visible;
              position: relative;
            }
            
            .contrat-print-mode .page-break::before {
              content: "--- Saut de page ---";
              position: absolute;
              top: -10px;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 0 10px;
              color: #999;
              font-size: 12px;
              font-style: italic;
            }
          }
          
          @media print {
            .contrat-print-mode .preview-note {
              display: none !important;
            }
          }
        </style>
      </head>
      <body class="contrat-print-mode">
    `;

    if (forPreview) {
      htmlContent += `<div class="contrat-container">`;
      htmlContent += `<div class="preview-note">Aperçu du contrat - La mise en page sera identique au téléchargement PDF final</div>`;
    }

    // Ajouter le contenu traité (avec variables remplacées et sauts de page)
    htmlContent += finalContent;

    if (forPreview) {
      htmlContent += `</div>`; // Fermer .contrat-container
    }

    htmlContent += `
      </body>
      </html>
    `;

    return htmlContent;
  }
  
  // SYSTÈME UNIFIÉ UNIQUEMENT - Utiliser directement bodyContent
  // Préparer les variables pour le remplacement
  const variables = prepareContractVariables(safeData);
  
  // Utiliser uniquement le contenu unifié du template
  const content = safeData.template.bodyContent || '';
  
  // Remplacer les variables dans le contenu unifié
  const processedContent = replaceVariables(content, variables);
  
  // Traitement des sauts de page - toujours appliquer pour gérer les divs Quill
  const finalContent = processPageBreaks(processedContent);
  
  // Construire le HTML complet avec le contenu unifié
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        /* Styles critiques pour l'aperçu web */
        body.contrat-print-mode {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: normal;
          color: #000000;
          background-color: white;
          margin: 20px;
          padding: 0;
        }
        
        /* FORCER LES INTERLIGNES COMME DANS L'ÉDITEUR */
        .contrat-print-mode * {
          line-height: normal !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        
        .contrat-print-mode p {
          margin-bottom: 0 !important;
          line-height: normal !important;
        }
        
        .contrat-print-mode br {
          line-height: normal !important;
        }
        
        /* Spécifiquement pour les spans de Google Docs */
        .contrat-print-mode span {
          line-height: inherit !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .contrat-print-mode .preview-note {
          background-color: #e3f2fd;
          color: #1976d2;
          padding: 8px 12px;
          border-radius: 4px;
          margin: 0 0 20px 0;
          font-size: 11pt;
          border-left: 4px solid #1976d2;
        }
        .contrat-print-mode h1, .contrat-print-mode h2, .contrat-print-mode h3 {
          margin-top: 0.5em;
          margin-bottom: 0.25em;
          font-weight: bold;
        }
        
        /* Support des tailles personnalisées dans les PDF */
        .contrat-print-mode .ql-size-8pt { font-size: 8pt !important; }
        .contrat-print-mode .ql-size-9pt { font-size: 9pt !important; }
        .contrat-print-mode .ql-size-10pt { font-size: 10pt !important; }
        .contrat-print-mode .ql-size-11pt { font-size: 11pt !important; }
        .contrat-print-mode .ql-size-12pt { font-size: 12pt !important; }
        .contrat-print-mode .ql-size-14pt { font-size: 14pt !important; }
        .contrat-print-mode .ql-size-16pt { font-size: 16pt !important; }
        .contrat-print-mode .ql-size-18pt { font-size: 18pt !important; }
        .contrat-print-mode .ql-size-20pt { font-size: 20pt !important; }
        .contrat-print-mode .ql-size-24pt { font-size: 24pt !important; }
        .contrat-print-mode .ql-size-28pt { font-size: 28pt !important; }
        .contrat-print-mode .ql-size-32pt { font-size: 32pt !important; }
        .contrat-print-mode .ql-size-36pt { font-size: 36pt !important; }
        .contrat-print-mode .ql-size-48pt { font-size: 48pt !important; }
        .contrat-print-mode .ql-size-72pt { font-size: 72pt !important; }
        .contrat-print-mode .ql-size-96pt { font-size: 96pt !important; }
        
        /* Support de l'interligne dans les PDF */
        .contrat-print-mode [style*="line-height: 1.0"] { line-height: 1.0 !important; }
        .contrat-print-mode [style*="line-height: 1.1"] { line-height: 1.1 !important; }
        .contrat-print-mode [style*="line-height: 1.2"] { line-height: 1.2 !important; }
        .contrat-print-mode [style*="line-height: 1.3"] { line-height: 1.3 !important; }
        .contrat-print-mode [style*="line-height: 1.4"] { line-height: 1.4 !important; }
        .contrat-print-mode [style*="line-height: 1.5"] { line-height: 1.5 !important; }
        .contrat-print-mode [style*="line-height: 1.6"] { line-height: 1.6 !important; }
        .contrat-print-mode [style*="line-height: 1.8"] { line-height: 1.8 !important; }
        .contrat-print-mode [style*="line-height: 2.0"] { line-height: 2.0 !important; }
        .contrat-print-mode [style*="line-height: 2.2"] { line-height: 2.2 !important; }
        .contrat-print-mode [style*="line-height: 2.5"] { line-height: 2.5 !important; }
        .contrat-print-mode [style*="line-height: 3.0"] { line-height: 3.0 !important; }
        
        /* Support des sauts de page */
        .contrat-print-mode .page-break {
          page-break-after: always;
          break-after: page;
          height: 0;
          margin: 0;
          padding: 0;
          visibility: hidden;
        }
        
        /* Pour l'aperçu web - afficher une ligne visuelle */
        @media screen {
          .contrat-print-mode .page-break {
            border-top: 2px dashed #ccc;
            margin: 20px 0;
            padding-top: 20px;
            visibility: visible;
            position: relative;
          }
          
          .contrat-print-mode .page-break::before {
            content: "--- Saut de page ---";
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 10px;
            color: #999;
            font-size: 12px;
            font-style: italic;
          }
        }
        
        @media print {
          .contrat-print-mode .preview-note {
            display: none !important;
          }
        }
      </style>
    </head>
    <body class="contrat-print-mode">
  `;

  if (forPreview) {
    htmlContent += `<div class="contrat-container">`;
    htmlContent += `<div class="preview-note">Aperçu du contrat - La mise en page sera identique au téléchargement PDF final</div>`;
  }

  // Ajouter directement le contenu unifié (plus de sections séparées)
  htmlContent += finalContent;

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
    
    // Options pour la génération PDF - Mode unifié (pas d'en-tête/pied de page séparés)
    const options = {
      displayHeaderFooter: false, // Pas d'en-tête/pied de page séparés en mode unifié
      margin: {
        top: '30px',
        bottom: '30px', 
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
const generatePDFPreview = async (data, title = 'Apercu_Contrat') => {
  try {
    // Utiliser la même fonction que pour la génération finale
    const htmlContent = getContratHTML(data, title);
    
    // Options pour la génération PDF - Mode unifié (mêmes que pour la version finale)
    const options = {
      displayHeaderFooter: false, // Pas d'en-tête/pied de page séparés en mode unifié
      margin: {
        top: '30px',
        bottom: '30px',
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
const ContratHTMLPreview = ({ data, title = '' }) => {
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
  contactData, // Nouveau format
  artisteData, 
  lieuData,
  structureData, 
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
    contact: contactData || {},
    programmateur: programmateurData || {},
    artiste: artisteData || {},
    lieu: lieuData || {},
    structure: structureData || {},
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