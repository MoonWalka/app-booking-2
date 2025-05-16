/**
 * Définition des variables disponibles pour l'éditeur de contrat
 */

// Variables disponibles pour le corps du contrat
export const bodyVariables = [
  "programmateur_nom", 
  "programmateur_structure", 
  "programmateur_email", 
  "programmateur_siret",
  "artiste_nom", 
  "artiste_genre",
  "concert_titre", 
  "concert_date", 
  "concert_montant",
  "lieu_nom", 
  "lieu_adresse", 
  "lieu_code_postal", 
  "lieu_ville", 
  "lieu_capacite",
  "date_jour", 
  "date_mois", 
  "date_annee", 
  "date_complete"
];

// Variables disponibles pour l'en-tête et le pied de page
export const headerFooterVariables = [
  "programmateur_nom", 
  "programmateur_structure", 
  "programmateur_email", 
  "programmateur_siret", 
  "artiste_nom"
];

// Variables disponibles pour la zone de signature
export const signatureVariables = [
  "programmateur_nom", 
  "programmateur_structure", 
  "artiste_nom", 
  "lieu_ville",
  "date_jour", 
  "date_mois", 
  "date_annee", 
  "date_complete"
];

// Valeurs fictives pour l'aperçu
export const dummyValues = {
  programmateur_nom: 'Jean Dupont',
  programmateur_structure: 'Association Culturelle XYZ',
  programmateur_email: 'contact@asso-xyz.fr',
  programmateur_siret: '123 456 789 00012',
  artiste_nom: 'Les Rockeurs du Dimanche',
  artiste_genre: 'Rock Alternatif',
  concert_titre: 'Concert de printemps',
  concert_date: '15/05/2025',
  concert_montant: '800',
  lieu_nom: 'Salle des fêtes',
  lieu_adresse: '123 rue Principale',
  lieu_code_postal: '75001',
  lieu_ville: 'Paris',
  lieu_capacite: '200',
  date_jour: '30',
  date_mois: '04',
  date_annee: '2025',
  date_complete: '30/04/2025'
};