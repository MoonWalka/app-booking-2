// hooks/contrats/contractVariables.js

/**
 * Variables disponibles pour le corps du contrat
 * Ces variables seront remplacées par les valeurs réelles lors de la génération du contrat
 */
export const bodyVariables = [
  "programmateur_nom", "programmateur_structure", "programmateur_email", "programmateur_siret",
  "programmateur_numero_intracommunautaire",
  "programmateur_adresse",
  "programmateur_representant",
  "programmateur_qualite_representant",
  "artiste_nom", "artiste_genre",
  "concert_titre", "concert_date", "concert_montant",
  "concert_montant_lettres",
  "lieu_nom", "lieu_adresse", "lieu_code_postal", "lieu_ville", "lieu_capacite",
  "date_jour", "date_mois", "date_annee", "date_complete"
];

/**
 * Variables disponibles pour l'en-tête et le pied de page
 * Sous-ensemble des variables complètes, adapté pour ces sections
 */
export const headerFooterVariables = [
  "programmateur_nom", "programmateur_structure", "programmateur_email", "programmateur_siret",
  "programmateur_numero_intracommunautaire",
  "programmateur_adresse",
  "programmateur_representant",
  "programmateur_qualite_representant",
  "artiste_nom"
];

/**
 * Variables disponibles pour la zone de signature
 * Sous-ensemble focalisé sur les informations pertinentes pour la signature
 */
export const signatureVariables = [
  "programmateur_nom", "programmateur_structure", "artiste_nom", "lieu_ville",
  "programmateur_representant",
  "programmateur_qualite_representant",
  "date_jour", "date_mois", "date_annee", "date_complete"
];

/**
 * Types de modèles de contrat disponibles
 * Pour alimenter les menus déroulants et autres sélecteurs
 */
export const templateTypes = [
  { value: 'session', label: 'Session standard' },
  { value: 'co-realisation', label: 'Co-réalisation' },
  { value: 'dates-multiples', label: 'Dates multiples' },
  { value: 'residence', label: 'Résidence artistique' },
  { value: 'atelier', label: 'Atelier / Workshop' }
];

/**
 * Remplace les variables dans un texte par des valeurs fictives pour prévisualisation
 * Utilisé pour l'aperçu du modèle de contrat
 * 
 * @param {string} content - Le contenu avec des variables à remplacer
 * @returns {string} - Le contenu avec des variables remplacées par des valeurs fictives
 */
export const replaceVariablesWithMockData = (content) => {
  if (!content) return '';
  
  return content
    .replace(/{programmateur_nom}/g, 'Jean Dupont')
    .replace(/{programmateur_structure}/g, 'Association Culturelle XYZ')
    .replace(/{programmateur_email}/g, 'contact@asso-xyz.fr')
    .replace(/{programmateur_siret}/g, '123 456 789 00012')
    .replace(/{programmateur_numero_intracommunautaire}/g, 'FR12345678901')
    .replace(/{programmateur_adresse}/g, '456 Rue des Spectacles, 75002 Paris')
    .replace(/{programmateur_representant}/g, 'Marie Martin')
    .replace(/{programmateur_qualite_representant}/g, 'Présidente')
    .replace(/{artiste_nom}/g, 'Les Rockeurs du Dimanche')
    .replace(/{artiste_genre}/g, 'Rock Alternatif')
    .replace(/{concert_titre}/g, 'Concert de printemps')
    .replace(/{concert_date}/g, '15/05/2025')
    .replace(/{concert_montant}/g, '800')
    .replace(/{concert_montant_lettres}/g, 'Huit cents euros')
    .replace(/{lieu_nom}/g, 'Salle des fêtes')
    .replace(/{lieu_adresse}/g, '123 rue Principale')
    .replace(/{lieu_code_postal}/g, '75001')
    .replace(/{lieu_ville}/g, 'Paris')
    .replace(/{lieu_capacite}/g, '200')
    .replace(/{date_jour}/g, '30')
    .replace(/{date_mois}/g, '04')
    .replace(/{date_annee}/g, '2025')
    .replace(/{date_complete}/g, '30/04/2025');
};