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
    raisonSociale: 'Raison sociale de l\'organisateur',
    adresse: 'Adresse de l\'organisateur',
    codePostal: 'Code postal de l\'organisateur',
    ville: 'Ville de l\'organisateur',
    pays: 'Pays de l\'organisateur',
    telephone: 'Téléphone de l\'organisateur',
    email: 'Email de l\'organisateur',
    siret: 'SIRET de l\'organisateur',
    numeroTva: 'N° TVA de l\'organisateur',
    codeApe: 'Code APE de l\'organisateur',
    numeroLicence: 'N° licence de l\'organisateur',
    signataire: 'Nom du signataire organisateur',
    qualiteSignataire: 'Qualité du signataire organisateur',
  },

  // === PARTIE B: PRODUCTEUR (vous) ===
  producteur: {
    raisonSociale: 'Raison sociale du producteur',
    adresse: 'Adresse du producteur',
    codePostal: 'Code postal du producteur',
    ville: 'Ville du producteur',
    pays: 'Pays du producteur',
    telephone: 'Téléphone du producteur',
    email: 'Email du producteur',
    siret: 'SIRET du producteur',
    numeroTva: 'N° TVA du producteur',
    codeApe: 'Code APE du producteur',
    numeroLicence: 'N° licence du producteur',
    signataire: 'Nom du signataire producteur',
    qualiteSignataire: 'Qualité du signataire producteur',
  },

  // === INFORMATIONS COMMUNES ===
  commun: {
    // Artiste
    artiste_nom: 'Nom de l\'artiste',
    artiste_genre: 'Genre musical',
    
    // Date/Événement
    date_concert: 'Date du concert',
    date_complete: 'Date complète (ex: 25 juillet 2025)',
    heure_debut: 'Heure de début',
    heure_fin: 'Heure de fin',
    
    // Lieu
    lieu_nom: 'Nom du lieu',
    lieu_adresse: 'Adresse du lieu',
    lieu_code_postal: 'Code postal du lieu',
    lieu_ville: 'Ville du lieu',
    lieu_capacite: 'Capacité du lieu',
    
    // Financier
    montant_ht: 'Montant HT',
    montant_ttc: 'Montant TTC',
    montant_lettres: 'Montant en lettres',
    total_ttc: 'Total TTC',
    total_ttc_lettres: 'Total TTC en lettres',
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
  'contact_structure': 'organisateur_raisonSociale',
  'contact_adresse': 'organisateur_adresse',
  'contact_siret': 'organisateur_siret',
  'contact_email': 'organisateur_email',
  'contact_telephone': 'organisateur_telephone',
  'programmateur_nom': 'organisateur_signataire',
  'programmateur_structure': 'organisateur_raisonSociale',
  'programmateur_siret': 'organisateur_siret',
  'programmateur_adresse': 'organisateur_adresse',
  'programmateur_representant': 'organisateur_signataire',
  'programmateur_qualite_representant': 'organisateur_qualiteSignataire',
  
  // Variables structure → organisateur (NOUVELLES)
  'structure_nom': 'organisateur_raisonSociale',
  'structure_siret': 'organisateur_siret',
  'structure_adresse': 'organisateur_adresse',
  'structure_code_postal': 'organisateur_codePostal',
  'structure_ville': 'organisateur_ville',
  'organisateur_numero_tva': 'organisateur_numeroTva',
  'organisateur_qualite': 'organisateur_qualiteSignataire',
  
  // Anciennes variables entreprise → producteur
  'nom_entreprise': 'producteur_raisonSociale',
  'adresse_entreprise': 'producteur_adresse',
  'siret_entreprise': 'producteur_siret',
  'telephone_entreprise': 'producteur_telephone',
  'email_entreprise': 'producteur_email',
  'representant_entreprise': 'producteur_signataire',
  
  // Variables date/lieu
  'artiste_nom': 'artiste_nom',
  'artiste_genre': 'artiste_genre',
  'lieu_nom': 'lieu_nom',
  'lieu_ville': 'lieu_ville',
  'lieu_adresse': 'lieu_adresse',
  'lieu_code_postal': 'lieu_code_postal',
  'date_date': 'date_concert',
  'concert_date': 'date_concert',
  'date_montant': 'montant_ht',
  'date_montant_lettres': 'montant_lettres',
  
  // Variables financières
  'total_ttc': 'montant_ttc',
  'total_ttc_lettres': 'montant_lettres',
  
  // Variable date_complete (à gérer spécialement)
  'date_complete': 'date_complete',
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
  
  console.log('[replaceVariables] Données reçues:', data);
  console.log('[replaceVariables] Exemple de variables à remplacer:', {
    'organisateur_siret': data.organisateur?.siret,
    'artiste_nom': data.artiste_nom,
    'montant_ttc': data.montant_ttc
  });
  
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
  
  // Variables organisateur - format organisateur_nomVariable en camelCase
  Object.entries(CONTRACT_VARIABLES_UNIFIED.organisateur).forEach(([key, label]) => {
    allVars.push({
      value: `{organisateur_${key}}`,
      label: label,
      category: 'Organisateur'
    });
  });
  
  // Variables producteur - format producteur_nomVariable en camelCase
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
 * Convertit un montant en lettres
 */
function montantEnLettres(montant) {
  const entier = Math.floor(montant);
  const decimales = Math.round((montant - entier) * 100);
  
  const unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizaine = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const centaine = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];
  const millier = ['', 'mille', 'deux mille', 'trois mille', 'quatre mille', 'cinq mille', 'six mille', 'sept mille', 'huit mille', 'neuf mille'];
  
  // Simplification pour les montants courants
  if (entier === 0) return 'zéro euro';
  if (entier < 10) return unite[entier] + ' euro' + (entier > 1 ? 's' : '');
  if (entier < 100) {
    const d = Math.floor(entier / 10);
    const u = entier % 10;
    return dizaine[d] + (u > 0 ? '-' + unite[u] : '') + ' euros';
  }
  if (entier < 1000) {
    const c = Math.floor(entier / 100);
    const reste = entier % 100;
    return centaine[c] + (reste > 0 ? ' ' + montantEnLettres(reste).replace(' euros', '') : '') + ' euros';
  }
  if (entier < 10000) {
    const m = Math.floor(entier / 1000);
    const reste = entier % 1000;
    return millier[m] + (reste > 0 ? ' ' + montantEnLettres(reste).replace(' euros', '') : '') + ' euros';
  }
  
  // Pour les montants plus élevés, utiliser le format numérique
  return entier.toString() + ' euros';
}

/**
 * Formater une date complète en français
 */
function formatDateComplete(date) {
  if (!date) return '';
  const d = new Date(date);
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Préparer les données pour le remplacement des variables
 */
export function prepareContractData(contratData, date, artiste, entreprise, lieu) {
  console.log('[prepareContractData] Entrée:', { contratData, date, artiste, entreprise, lieu });
  
  // Calculer les montants - chercher dans plusieurs endroits possibles
  const montantHT = parseFloat(contratData?.negociation?.montantNet) || 
                    parseFloat(contratData?.negociation?.montantHT) ||
                    parseFloat(contratData?.montantHT) ||
                    parseFloat(contratData?.montant) ||
                    parseFloat(date?.montant) || 0;

  // Correction : accepter explicitement la valeur zéro pour la TVA
  let tauxTVA;
  if (contratData?.negociation?.tauxTva !== undefined && contratData?.negociation?.tauxTva !== null && contratData?.negociation?.tauxTva !== "") {
    tauxTVA = Number(contratData.negociation.tauxTva);
  } else if (contratData?.tauxTVA !== undefined && contratData?.tauxTVA !== null && contratData?.tauxTVA !== "") {
    tauxTVA = Number(contratData.tauxTVA);
  } else {
    tauxTVA = 20;
  }

  const montantTVA = montantHT * (tauxTVA / 100);
  const montantTTC = montantHT + montantTVA;
  
  console.log('[prepareContractData] Montants calculés:', { montantHT, tauxTVA, montantTTC });
  
  return {
    // Données organisateur
    organisateur: {
      raisonSociale: contratData?.organisateur?.raisonSociale || '',
      adresse: contratData?.organisateur?.adresse || '',
      codePostal: contratData?.organisateur?.codePostal || '',
      ville: contratData?.organisateur?.ville || '',
      pays: contratData?.organisateur?.pays || 'France',
      telephone: contratData?.organisateur?.telephone || contratData?.organisateur?.telephone1 || contratData?.organisateur?.telephone2 || '',
      email: contratData?.organisateur?.email || '',
      siret: contratData?.organisateur?.siret || '',
      numeroTva: contratData?.organisateur?.numeroTva || '',
      codeApe: contratData?.organisateur?.codeApe || '',
      numeroLicence: contratData?.organisateur?.numeroLicence || '',
      signataire: contratData?.organisateur?.signataire || '',
      qualite: contratData?.organisateur?.qualite || '',
      qualiteSignataire: contratData?.organisateur?.qualite || '',
    },
    
    // Données producteur
    producteur: {
      raisonSociale: contratData?.producteur?.raisonSociale || entreprise?.nom || '',
      adresse: contratData?.producteur?.adresse || entreprise?.adresse || '',
      codePostal: contratData?.producteur?.codePostal || entreprise?.codePostal || '',
      ville: contratData?.producteur?.ville || entreprise?.ville || '',
      pays: contratData?.producteur?.pays || entreprise?.pays || 'France',
      telephone: contratData?.producteur?.telephone || entreprise?.telephone || '',
      email: contratData?.producteur?.email || entreprise?.email || '',
      siret: contratData?.producteur?.siret || entreprise?.siret || '',
      numeroTva: contratData?.producteur?.numeroTva || entreprise?.numeroTva || '',
      codeApe: contratData?.producteur?.codeApe || entreprise?.codeApe || '',
      numeroLicence: contratData?.producteur?.numeroLicence || entreprise?.numeroLicence || '',
      signataire: contratData?.producteur?.signataire || entreprise?.representantLegal || '',
      qualite: contratData?.producteur?.qualite || entreprise?.qualiteRepresentant || '',
      qualiteSignataire: contratData?.producteur?.qualite || entreprise?.qualiteRepresentant || '',
    },
    
    // Données communes
    artiste_nom: artiste?.nom || contratData?.producteur?.raisonSociale || '',
    artiste_genre: artiste?.genre || '',
    date_concert: date?.date ? new Date(date.date).toLocaleDateString('fr-FR') : '',
    date_complete: date?.date ? formatDateComplete(date.date) : '',
    heure_debut: contratData?.representations?.horaireDebut || '',
    heure_fin: contratData?.representations?.horaireFin || '',
    lieu_nom: contratData?.representations?.salle || lieu?.nom || date?.libelle || '',
    lieu_adresse: lieu?.adresse || '',
    lieu_code_postal: lieu?.codePostal || '',
    lieu_ville: lieu?.ville || contratData?.representations?.villeSalle || '',
    lieu_capacite: lieu?.capacite || contratData?.representations?.capacite || '',
    montant_ht: montantHT.toFixed(2).replace('.', ',') + ' €',
    montant_ttc: montantTTC.toFixed(2).replace('.', ',') + ' €',
    montant_lettres: montantEnLettres(montantTTC),
    total_ttc: montantTTC.toFixed(2).replace('.', ',') + ' €',
    total_ttc_lettres: montantEnLettres(montantTTC),
    taux_tva: tauxTVA.toString() + '%',
    festival_nom: contratData?.representations?.festival || '',
    nombre_representations: contratData?.representations?.nbRepresentations || '1',
  };
}