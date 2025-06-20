// hooks/contrats/contractVariables.js

/**
 * Configuration et mapping des variables de contrat
 * Ce fichier définit toutes les variables disponibles pour les modèles de contrat
 * ainsi que leur mapping avec les données des entités
 */

// Variables disponibles pour les templates de contrat
export const CONTRACT_VARIABLES = {
  // Variables entreprise
  'nom_entreprise': { label: 'Nom de votre entreprise', category: 'entreprise', source: 'entreprise.nom' },
  'adresse_entreprise': { label: 'Adresse de votre entreprise', category: 'entreprise', source: 'entreprise.adresse' },
  'siret_entreprise': { label: 'SIRET de votre entreprise', category: 'entreprise', source: 'entreprise.siret' },
  'telephone_entreprise': { label: 'Téléphone de votre entreprise', category: 'entreprise', source: 'entreprise.telephone' },
  'email_entreprise': { label: 'Email de votre entreprise', category: 'entreprise', source: 'entreprise.email' },
  'representant_entreprise': { label: 'Représentant de votre entreprise', category: 'entreprise', source: 'entreprise.representant' },
  'fonction_representant': { label: 'Fonction du représentant', category: 'entreprise', source: 'entreprise.fonctionRepresentant' },
  
  // Variables contact  
  'contact_nom': { label: 'Nom du contact', category: 'contact', source: 'contact.nom' },
  'contact_prenom': { label: 'Prénom du contact', category: 'contact', source: 'contact.prenom' },
  'contact_structure': { label: 'Structure du contact', category: 'contact', source: 'contact.structure' },
  'contact_email': { label: 'Email du contact', category: 'contact', source: 'contact.email' },
  'contact_telephone': { label: 'Téléphone du contact', category: 'contact', source: 'contact.telephone' },
  'contact_adresse': { label: 'Adresse du contact', category: 'contact', source: 'contact.adresse' },
  'contact_siret': { label: 'SIRET du contact', category: 'contact', source: 'contact.siret' },
  'contact_numero_intracommunautaire': { label: 'N° TVA Intracommunautaire', category: 'contact', source: 'contact.numeroIntracommunautaire' },
  'contact_representant': { label: 'Représentant légal', category: 'contact', source: 'contact.representant' },
  'contact_qualite_representant': { label: 'Qualité du représentant', category: 'contact', source: 'contact.qualiteRepresentant' },
  
  // Variables programmateur (compatibilité rétrograde - maintenant équivalent aux variables contact)
  'programmateur_nom': { label: 'Nom du contact', category: 'contact', source: 'programmateur.nom' },
  'programmateur_prenom': { label: 'Prénom du contact', category: 'contact', source: 'programmateur.prenom' },
  'programmateur_structure': { label: 'Structure du contact', category: 'contact', source: 'programmateur.structure' },
  'programmateur_email': { label: 'Email du contact', category: 'contact', source: 'programmateur.email' },
  'programmateur_telephone': { label: 'Téléphone du contact', category: 'contact', source: 'programmateur.telephone' },
  'programmateur_adresse': { label: 'Adresse du contact', category: 'contact', source: 'programmateur.adresse' },
  'programmateur_siret': { label: 'SIRET du contact', category: 'contact', source: 'programmateur.siret' },
  'programmateur_numero_intracommunautaire': { label: 'N° TVA du contact', category: 'contact', source: 'programmateur.numeroIntracommunautaire' },
  'programmateur_representant': { label: 'Représentant légal', category: 'contact', source: 'programmateur.representant' },
  'programmateur_qualite_representant': { label: 'Qualité du représentant', category: 'contact', source: 'programmateur.qualiteRepresentant' },
  
  // Variables structure (ajout des variables manquantes)
  'structure_nom': { label: 'Nom de la structure', category: 'structure', source: 'structure.nom' },
  'structure_siret': { label: 'SIRET de la structure', category: 'structure', source: 'structure.siret' },
  'structure_adresse': { label: 'Adresse de la structure', category: 'structure', source: 'structure.adresse.adresse' },
  'structure_code_postal': { label: 'Code postal de la structure', category: 'structure', source: 'structure.adresse.codePostal' },
  'structure_ville': { label: 'Ville de la structure', category: 'structure', source: 'structure.adresse.ville' },
  'structure_pays': { label: 'Pays de la structure', category: 'structure', source: 'structure.adresse.pays' },
  'structure_numero_intracommunautaire': { label: 'N° TVA de la structure', category: 'structure', source: 'structure.numeroIntracommunautaire' },
  'structure_type': { label: 'Type de structure', category: 'structure', source: 'structure.type' },
  
  // Variables artiste
  'artiste_nom': { label: 'Nom de l\'artiste', category: 'artiste', source: 'artiste.nom' },
  'artiste_genre': { label: 'Genre musical', category: 'artiste', source: 'artiste.genre' },
  'artiste_contact': { label: 'Contact de l\'artiste', category: 'artiste', source: 'artiste.contact' },
  
  // Variables concert
  'concert_titre': { label: 'Titre du concert', category: 'concert', source: 'concert.titre' },
  'concert_date': { label: 'Date du concert', category: 'concert', source: 'concert.date', format: 'date' },
  'concert_heure': { label: 'Heure du concert', category: 'concert', source: 'concert.heure' },
  'concert_montant': { label: 'Montant (en chiffres)', category: 'concert', source: 'concert.montant', format: 'currency' },
  'concert_montant_lettres': { label: 'Montant (en lettres)', category: 'concert', source: 'concert.montant', format: 'currency_letters' },
  
  // Variables lieu
  'lieu_nom': { label: 'Nom du lieu', category: 'lieu', source: 'lieu.nom' },
  'lieu_adresse': { label: 'Adresse du lieu', category: 'lieu', source: 'lieu.adresse' },
  'lieu_code_postal': { label: 'Code postal du lieu', category: 'lieu', source: 'lieu.codePostal' },
  'lieu_ville': { label: 'Ville du lieu', category: 'lieu', source: 'lieu.ville' },
  'lieu_capacite': { label: 'Capacité du lieu', category: 'lieu', source: 'lieu.capacite' },
  
  // Variables de date dynamiques
  'date_jour': { label: 'Jour actuel', category: 'date', format: 'day' },
  'date_mois': { label: 'Mois actuel', category: 'date', format: 'month' },
  'date_annee': { label: 'Année actuelle', category: 'date', format: 'year' },
  'date_complete': { label: 'Date complète', category: 'date', format: 'full_date' }
};

/**
 * Obtenir les variables par catégorie
 * @param {string} category - La catégorie de variables à récupérer
 * @returns {Object} Les variables de la catégorie
 */
export const getVariablesByCategory = (category) => {
  return Object.entries(CONTRACT_VARIABLES)
    .filter(([key, config]) => config.category === category)
    .reduce((acc, [key, config]) => {
      acc[key] = config;
      return acc;
    }, {});
};

/**
 * Obtenir toutes les catégories de variables
 * @returns {string[]} Les catégories disponibles
 */
export const getVariableCategories = () => {
  const categories = new Set();
  Object.values(CONTRACT_VARIABLES).forEach(config => {
    categories.add(config.category);
  });
  return Array.from(categories);
};

/**
 * Mapper les données de la structure depuis le formulaire public vers les variables de contrat
 * @param {Object} structureData - Les données de la structure depuis le formulaire
 * @returns {Object} Les variables mappées pour le contrat
 */
export const mapStructureDataToVariables = (structureData) => {
  if (!structureData) return {};
  
  return {
    'structure_nom': structureData.nom || '',
    'structure_siret': structureData.siret || '',
    'structure_adresse': structureData.adresse || '',
    'structure_code_postal': structureData.codePostal || '',
    'structure_ville': structureData.ville || '',
    'structure_pays': structureData.pays || 'France',
    'structure_numero_intracommunautaire': structureData.numeroIntracommunautaire || ''
  };
};

/**
 * Mapper les données du contact pour inclure les infos de structure (nouvelle nomenclature)
 * @param {Object} contactData - Les données du contact
 * @param {Object} structureData - Les données de la structure associée
 * @returns {Object} Les variables mappées pour le contrat
 */
export const mapContactWithStructure = (contactData, structureData) => {
  const contact = {
    'contact_nom': contactData?.nom || '',
    'contact_prenom': contactData?.prenom || '',
    'contact_email': contactData?.email || '',
    'contact_telephone': contactData?.telephone || '',
    'contact_representant': `${contactData?.prenom || ''} ${contactData?.nom || ''}`.trim(),
    'contact_qualite_representant': contactData?.fonction || ''
  };
  
  // Si la structure est fournie, utiliser ses données pour l'adresse et le SIRET
  if (structureData) {
    contact['contact_structure'] = structureData.nom || '';
    contact['contact_siret'] = structureData.siret || '';
    contact['contact_adresse'] = structureData.adresse || '';
    contact['contact_numero_intracommunautaire'] = structureData.numeroIntracommunautaire || '';
  }
  
  return contact;
};

/**
 * Mapper les données du contact pour inclure les infos de structure (compatibilité rétrograde)
 * @param {Object} contactData - Les données du contact (anciennement programmateurData)
 * @param {Object} structureData - Les données de la structure associée
 * @returns {Object} Les variables mappées pour le contrat
 */
export const mapProgrammateurWithStructure = (contactData, structureData) => {
  const programmateur = {
    'programmateur_nom': contactData?.nom || '',
    'programmateur_prenom': contactData?.prenom || '',
    'programmateur_email': contactData?.email || '',
    'programmateur_telephone': contactData?.telephone || '',
    'programmateur_representant': `${contactData?.prenom || ''} ${contactData?.nom || ''}`.trim(),
    'programmateur_qualite_representant': contactData?.fonction || ''
  };
  
  // Si la structure est fournie, utiliser ses données pour l'adresse et le SIRET
  if (structureData) {
    programmateur['programmateur_structure'] = structureData.nom || '';
    programmateur['programmateur_siret'] = structureData.siret || '';
    programmateur['programmateur_adresse'] = structureData.adresse || '';
    programmateur['programmateur_numero_intracommunautaire'] = structureData.numeroIntracommunautaire || '';
  }
  
  return programmateur;
};

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
  
  // Support des deux formats : {variable} et [variable]
  return content
    // Format avec accolades
    .replace(/{contact_nom}/g, 'Jean Dupont')
    .replace(/{contact_structure}/g, 'Association Culturelle XYZ')
    .replace(/{contact_email}/g, 'contact@asso-xyz.fr')
    .replace(/{contact_siret}/g, '123 456 789 00012')
    .replace(/{contact_numero_intracommunautaire}/g, 'FR12345678901')
    .replace(/{contact_adresse}/g, '456 Rue des Spectacles, 75002 Paris')
    .replace(/{contact_representant}/g, 'Marie Martin')
    .replace(/{contact_qualite_representant}/g, 'Présidente')
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
    .replace(/{date_complete}/g, '30/04/2025')
    // Variables structure
    .replace(/{structure_nom}/g, 'Association Culturelle XYZ')
    .replace(/{structure_siret}/g, '987 654 321 00098')
    .replace(/{structure_adresse}/g, '789 Avenue des Arts')
    .replace(/{structure_code_postal}/g, '75003')
    .replace(/{structure_ville}/g, 'Paris')
    .replace(/{structure_email}/g, 'structure@asso-xyz.fr')
    .replace(/{structure_telephone}/g, '01 23 45 67 89')
    .replace(/{structure_type}/g, 'Association')
    // Format avec crochets (pour compatibilité)
    .replace(/\[contact_nom\]/g, 'Jean Dupont')
    .replace(/\[contact_structure\]/g, 'Association Culturelle XYZ')
    .replace(/\[contact_email\]/g, 'contact@asso-xyz.fr')
    .replace(/\[contact_siret\]/g, '123 456 789 00012')
    .replace(/\[contact_numero_intracommunautaire\]/g, 'FR12345678901')
    .replace(/\[contact_adresse\]/g, '456 Rue des Spectacles, 75002 Paris')
    .replace(/\[contact_representant\]/g, 'Marie Martin')
    .replace(/\[contact_qualite_representant\]/g, 'Présidente')
    .replace(/\[artiste_nom\]/g, 'Les Rockeurs du Dimanche')
    .replace(/\[artiste_genre\]/g, 'Rock Alternatif')
    .replace(/\[concert_titre\]/g, 'Concert de printemps')
    .replace(/\[concert_date\]/g, '15/05/2025')
    .replace(/\[concert_montant\]/g, '800')
    .replace(/\[concert_montant_lettres\]/g, 'Huit cents euros')
    .replace(/\[lieu_nom\]/g, 'Salle des fêtes')
    .replace(/\[lieu_adresse\]/g, '123 rue Principale')
    .replace(/\[lieu_code_postal\]/g, '75001')
    .replace(/\[lieu_ville\]/g, 'Paris')
    .replace(/\[lieu_capacite\]/g, '200')
    .replace(/\[date_jour\]/g, '30')
    .replace(/\[date_mois\]/g, '04')
    .replace(/\[date_annee\]/g, '2025')
    .replace(/\[date_complete\]/g, '30/04/2025')
    // Variables structure avec crochets
    .replace(/\[structure_nom\]/g, 'Association Culturelle XYZ')
    .replace(/\[structure_siret\]/g, '987 654 321 00098')
    .replace(/\[structure_adresse\]/g, '789 Avenue des Arts')
    .replace(/\[structure_code_postal\]/g, '75003')
    .replace(/\[structure_ville\]/g, 'Paris')
    .replace(/\[structure_email\]/g, 'structure@asso-xyz.fr')
    .replace(/\[structure_telephone\]/g, '01 23 45 67 89')
    .replace(/\[structure_type\]/g, 'Association');
};