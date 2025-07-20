/**
 * Système unifié de variables pour les contrats
 * 
 * RÈGLES:
 * 1. Un seul format: {variable_nom}
 * 2. Préfixes clairs: organisateur_ et producteur_
 * 3. Variables communes sans préfixe (date, artiste, etc.)
 */

// Variables principales du contrat
export const CONTRACT_VARIABLES_UNIFIED = {
  // === PARTIE A: ORGANISATEUR (celui qui vous engage) ===
  organisateur: {
    raison_sociale: 'Raison sociale de l\'organisateur',
    adresse: 'Adresse de l\'organisateur',
    code_postal: 'Code postal de l\'organisateur',
    ville: 'Ville de l\'organisateur',
    pays: 'Pays de l\'organisateur',
    telephone: 'Téléphone de l\'organisateur',
    email: 'Email de l\'organisateur',
    siret: 'SIRET de l\'organisateur',
    numero_tva: 'N° TVA de l\'organisateur',
    code_ape: 'Code APE de l\'organisateur',
    numero_licence: 'N° licence de l\'organisateur',
    signataire: 'Nom du signataire organisateur',
    qualite_signataire: 'Qualité du signataire organisateur',
  },

  // === PARTIE B: PRODUCTEUR (vous) ===
  producteur: {
    raison_sociale: 'Raison sociale du producteur',
    adresse: 'Adresse du producteur',
    code_postal: 'Code postal du producteur',
    ville: 'Ville du producteur',
    pays: 'Pays du producteur',
    telephone: 'Téléphone du producteur',
    email: 'Email du producteur',
    siret: 'SIRET du producteur',
    numero_tva: 'N° TVA du producteur',
    code_ape: 'Code APE du producteur',
    numero_licence: 'N° licence du producteur',
    signataire: 'Nom du signataire producteur',
    qualite_signataire: 'Qualité du signataire producteur',
  },

  // === INFORMATIONS COMMUNES ===
  commun: {
    // Artiste
    artiste_nom: 'Nom de l\'artiste',
    artiste_genre: 'Genre musical',
    
    // Date/Événement
    date_concert: 'Date du concert',
    heure_debut: 'Heure de début',
    heure_fin: 'Heure de fin',
    
    // Lieu
    lieu_nom: 'Nom du lieu',
    lieu_adresse: 'Adresse du lieu',
    lieu_ville: 'Ville du lieu',
    lieu_capacite: 'Capacité du lieu',
    
    // Financier
    montant_ht: 'Montant HT',
    montant_ttc: 'Montant TTC',
    montant_lettres: 'Montant en lettres',
    taux_tva: 'Taux TVA',
    
    // Autres
    festival_nom: 'Nom du festival/événement',
    nombre_representations: 'Nombre de représentations',
  }
};

/**
 * Mapping des anciennes variables vers les nouvelles
 * Pour la migration automatique des templates
 */
export const VARIABLE_MIGRATION_MAP = {
  // Anciennes variables contact/programmateur → organisateur
  'contact_nom': 'organisateur_signataire',
  'contact_structure': 'organisateur_raison_sociale',
  'contact_adresse': 'organisateur_adresse',
  'contact_siret': 'organisateur_siret',
  'contact_email': 'organisateur_email',
  'contact_telephone': 'organisateur_telephone',
  'programmateur_nom': 'organisateur_signataire',
  'programmateur_structure': 'organisateur_raison_sociale',
  'programmateur_siret': 'organisateur_siret',
  'programmateur_adresse': 'organisateur_adresse',
  'programmateur_representant': 'organisateur_signataire',
  'programmateur_qualite_representant': 'organisateur_qualite_signataire',
  
  // Anciennes variables entreprise → producteur
  'nom_entreprise': 'producteur_raison_sociale',
  'adresse_entreprise': 'producteur_adresse',
  'siret_entreprise': 'producteur_siret',
  'telephone_entreprise': 'producteur_telephone',
  'email_entreprise': 'producteur_email',
  'representant_entreprise': 'producteur_signataire',
  
  // Variables qui restent identiques
  'artiste_nom': 'artiste_nom',
  'artiste_genre': 'artiste_genre',
  'lieu_nom': 'lieu_nom',
  'lieu_ville': 'lieu_ville',
  'date_date': 'date_concert',
  'date_montant': 'montant_ht',
  'date_montant_lettres': 'montant_lettres',
};

/**
 * Fonction pour migrer un template vers le nouveau système
 */
export function migrateTemplate(templateContent) {
  if (!templateContent) return '';
  
  let migratedContent = templateContent;
  
  // 1. Convertir [variable] → {variable}
  migratedContent = migratedContent.replace(/\[([^\]]+)\]/g, '{$1}');
  
  // 2. Remplacer les anciennes variables par les nouvelles
  Object.entries(VARIABLE_MIGRATION_MAP).forEach(([oldVar, newVar]) => {
    const regex = new RegExp(`\\{${oldVar}\\}`, 'g');
    migratedContent = migratedContent.replace(regex, `{${newVar}}`);
  });
  
  return migratedContent;
}

/**
 * Fonction simplifiée pour remplacer les variables dans un contenu
 */
export function replaceVariables(content, data) {
  if (!content || !data) return content;
  
  let processedContent = content;
  
  // Remplacer les variables organisateur
  if (data.organisateur) {
    Object.entries(data.organisateur).forEach(([key, value]) => {
      const regex = new RegExp(`\\{organisateur_${key}\\}`, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });
  }
  
  // Remplacer les variables producteur
  if (data.producteur) {
    Object.entries(data.producteur).forEach(([key, value]) => {
      const regex = new RegExp(`\\{producteur_${key}\\}`, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });
  }
  
  // Remplacer les variables communes
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'organisateur' && key !== 'producteur' && typeof value === 'string') {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processedContent = processedContent.replace(regex, value || '');
    }
  });
  
  return processedContent;
}

/**
 * Obtenir toutes les variables disponibles pour l'éditeur
 */
export function getAllVariables() {
  const allVars = [];
  
  // Variables organisateur
  Object.entries(CONTRACT_VARIABLES_UNIFIED.organisateur).forEach(([key, label]) => {
    allVars.push({
      value: `{organisateur_${key}}`,
      label: label,
      category: 'Organisateur'
    });
  });
  
  // Variables producteur
  Object.entries(CONTRACT_VARIABLES_UNIFIED.producteur).forEach(([key, label]) => {
    allVars.push({
      value: `{producteur_${key}}`,
      label: label,
      category: 'Producteur'
    });
  });
  
  // Variables communes
  Object.entries(CONTRACT_VARIABLES_UNIFIED.commun).forEach(([key, label]) => {
    allVars.push({
      value: `{${key}}`,
      label: label,
      category: 'Informations générales'
    });
  });
  
  return allVars;
}

/**
 * Préparer les données pour le remplacement des variables
 */
export function prepareContractData(contratData, date, artiste, entreprise) {
  return {
    // Données organisateur
    organisateur: {
      raison_sociale: contratData?.organisateur?.raisonSociale || '',
      adresse: contratData?.organisateur?.adresse || '',
      code_postal: contratData?.organisateur?.codePostal || '',
      ville: contratData?.organisateur?.ville || '',
      pays: contratData?.organisateur?.pays || 'France',
      telephone: contratData?.organisateur?.telephone || '',
      email: contratData?.organisateur?.email || '',
      siret: contratData?.organisateur?.siret || '',
      numero_tva: contratData?.organisateur?.numeroTva || '',
      code_ape: contratData?.organisateur?.codeApe || '',
      numero_licence: contratData?.organisateur?.numeroLicence || '',
      signataire: contratData?.organisateur?.signataire || '',
      qualite_signataire: contratData?.organisateur?.qualite || '',
    },
    
    // Données producteur
    producteur: {
      raison_sociale: contratData?.producteur?.raisonSociale || entreprise?.nom || '',
      adresse: contratData?.producteur?.adresse || entreprise?.adresse || '',
      code_postal: contratData?.producteur?.codePostal || entreprise?.codePostal || '',
      ville: contratData?.producteur?.ville || entreprise?.ville || '',
      pays: contratData?.producteur?.pays || entreprise?.pays || 'France',
      telephone: contratData?.producteur?.telephone || entreprise?.telephone || '',
      email: contratData?.producteur?.email || entreprise?.email || '',
      siret: contratData?.producteur?.siret || entreprise?.siret || '',
      numero_tva: contratData?.producteur?.numeroTva || entreprise?.numeroTva || '',
      code_ape: contratData?.producteur?.codeApe || entreprise?.codeApe || '',
      numero_licence: contratData?.producteur?.numeroLicence || entreprise?.numeroLicence || '',
      signataire: contratData?.producteur?.signataire || entreprise?.representantLegal || '',
      qualite_signataire: contratData?.producteur?.qualite || entreprise?.qualiteRepresentant || '',
    },
    
    // Données communes
    artiste_nom: artiste?.nom || '',
    artiste_genre: artiste?.genre || '',
    date_concert: date?.date ? new Date(date.date).toLocaleDateString('fr-FR') : '',
    heure_debut: contratData?.representations?.horaireDebut || '',
    heure_fin: contratData?.representations?.horaireFin || '',
    lieu_nom: contratData?.representations?.salle || date?.libelle || '',
    lieu_ville: contratData?.representations?.villeSalle || '',
    montant_ht: contratData?.reglement?.montantHT?.toFixed(2).replace('.', ',') + ' €' || '',
    montant_ttc: contratData?.reglement?.totalTTC?.toFixed(2).replace('.', ',') + ' €' || '',
    montant_lettres: '', // À implémenter avec la fonction montantEnLettres
    taux_tva: contratData?.reglement?.tauxTVA + '%' || '',
    festival_nom: contratData?.representations?.festival || '',
    nombre_representations: contratData?.representations?.nbRepresentations || '1',
  };
}