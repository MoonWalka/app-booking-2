/**
 * Configuration du mapping entre les champs UI et les champs Firebase
 * Pour chaque collection, définit comment mapper les critères de recherche
 */

export const searchFieldsMapping = {
  // Mapping pour la collection structures (nouveau modèle)
  structures: {
    // Identification
    raisonSociale: { path: 'raisonSociale', type: 'string' },
    nom: { path: 'nom', type: 'string' },
    nom_ou_raisonSociale: { path: 'nom_ou_raisonSociale', type: 'string', isVirtual: true }, // Champ virtuel pour recherche combinée
    email: { path: 'email', type: 'string' },
    telephone: { path: 'telephone', type: 'string' },
    telephone1: { path: 'telephone1', type: 'string' },
    telephone2: { path: 'telephone2', type: 'string' },
    mobile: { path: 'mobile', type: 'string' },
    fax: { path: 'fax', type: 'string' },
    siteWeb: { path: 'siteWeb', type: 'string' },
    
    // Informations légales
    type: { path: 'type', type: 'string' },
    siret: { path: 'siret', type: 'string' },
    tva: { path: 'tva', type: 'string' },
    numeroIntracommunautaire: { path: 'numeroIntracommunautaire', type: 'string' },
    
    // Géolocalisation
    adresse: { path: 'adresse', type: 'string' },
    suiteAdresse: { path: 'suiteAdresse', type: 'string' },
    codePostal: { path: 'codePostal', type: 'string' },
    ville: { path: 'ville', type: 'string' },
    departement: { path: 'departement', type: 'string' },
    region: { path: 'region', type: 'string' },
    pays: { path: 'pays', type: 'string' },
    
    // Qualification
    tags: { path: 'tags', type: 'array' },
    isClient: { path: 'isClient', type: 'boolean' },
    isActive: { path: 'isActive', type: 'boolean' },
    source: { path: 'source', type: 'string' },
    
    // Commentaires (tableau d'objets)
    commentaires: { path: 'commentaires', type: 'array' },
    
    // Métadonnées
    createdAt: { path: 'createdAt', type: 'date' },
    updatedAt: { path: 'updatedAt', type: 'date' },
    createdBy: { path: 'createdBy', type: 'string' },
    updatedBy: { path: 'updatedBy', type: 'string' }
  },

  // Mapping pour la collection personnes (nouveau modèle)
  personnes: {
    // Identification
    nom: { path: 'nom', type: 'string' },
    prenom: { path: 'prenom', type: 'string' },
    nom_ou_raisonSociale: { path: 'nom', type: 'string' }, // Pour les personnes, on mappe vers 'nom' uniquement
    civilite: { path: 'civilite', type: 'string' },
    email: { path: 'email', type: 'string' },
    telephone: { path: 'telephone', type: 'string' },
    telDirect: { path: 'telDirect', type: 'string' },
    telPerso: { path: 'telPerso', type: 'string' },
    mobile: { path: 'mobile', type: 'string' },
    mailDirect: { path: 'mailDirect', type: 'string' },
    mailPerso: { path: 'mailPerso', type: 'string' },
    fax: { path: 'fax', type: 'string' },
    
    // Géolocalisation
    adresse: { path: 'adresse', type: 'string' },
    suiteAdresse: { path: 'suiteAdresse', type: 'string' },
    codePostal: { path: 'codePostal', type: 'string' },
    ville: { path: 'ville', type: 'string' },
    departement: { path: 'departement', type: 'string' },
    region: { path: 'region', type: 'string' },
    pays: { path: 'pays', type: 'string' },
    
    // Qualification
    tags: { path: 'tags', type: 'array' },
    isActive: { path: 'isActive', type: 'boolean' },
    
    // Commentaires (tableau d'objets)
    commentaires: { path: 'commentaires', type: 'array' },
    
    // Métadonnées
    createdAt: { path: 'createdAt', type: 'date' },
    updatedAt: { path: 'updatedAt', type: 'date' },
    createdBy: { path: 'createdBy', type: 'string' },
    updatedBy: { path: 'updatedBy', type: 'string' }
  },

  // Mapping pour l'ancienne collection contacts (à garder pour compatibilité)
  contacts: {
    // Identification
    nom: { path: 'nom', type: 'string' },
    prenom: { path: 'prenom', type: 'string' },
    prenomNom: { path: 'prenomNom', type: 'string' },
    email: { path: 'email', type: 'string' },
    telephone: { path: 'telephone', type: 'string' },
    mobile: { path: 'mobile', type: 'string' },
    fonction: { path: 'fonction', type: 'string' },
    civilite: { path: 'civilite', type: 'string' },
    
    // Structure
    structureRaisonSociale: { path: 'structureRaisonSociale', type: 'string' },
    structureType: { path: 'structureType', type: 'string' },
    structureSiret: { path: 'structureSiret', type: 'string' },
    structureTva: { path: 'structureTva', type: 'string' },
    structureSiteWeb: { path: 'structureSiteWeb', type: 'string' },
    
    // Géolocalisation
    ville: { path: 'ville', type: 'string' },
    codePostal: { path: 'codePostal', type: 'string' },
    departement: { path: 'departement', type: 'string' },
    region: { path: 'region', type: 'string' },
    pays: { path: 'pays', type: 'string' },
    adresse: { path: 'adresse', type: 'string' },
    
    // Qualification
    tags: { path: 'tags', type: 'array' },
    client: { path: 'client', type: 'boolean' },
    source: { path: 'source', type: 'string' },
    
    // Festival/Diffusion
    nomFestival: { path: 'nomFestival', type: 'string' },
    periodeFestivalMois: { path: 'periodeFestivalMois', type: 'string' },
    periodeFestivalComplete: { path: 'periodeFestivalComplete', type: 'string' },
    bouclage: { path: 'bouclage', type: 'string' },
    
    // Salle
    salleNom: { path: 'salleNom', type: 'string' },
    salleVille: { path: 'salleVille', type: 'string' },
    salleCodePostal: { path: 'salleCodePostal', type: 'string' },
    salleJauge1: { path: 'salleJauge1', type: 'number' },
    salleJauge2: { path: 'salleJauge2', type: 'number' },
    salleJauge3: { path: 'salleJauge3', type: 'number' },
    
    // Métadonnées
    createdAt: { path: 'createdAt', type: 'date' },
    updatedAt: { path: 'updatedAt', type: 'date' },
    
    // Personne 2
    prenom2: { path: 'prenom2', type: 'string' },
    nom2: { path: 'nom2', type: 'string' },
    email2: { path: 'email2', type: 'string' },
    telephone2: { path: 'telephone2', type: 'string' },
    fonction2: { path: 'fonction2', type: 'string' },
    
    // Personne 3
    prenom3: { path: 'prenom3', type: 'string' },
    nom3: { path: 'nom3', type: 'string' },
    email3: { path: 'email3', type: 'string' },
    telephone3: { path: 'telephone3', type: 'string' },
    fonction3: { path: 'fonction3', type: 'string' },
    
    // Notes et commentaires
    notes: { path: 'notes', type: 'string' },
    diffusionCommentaires1: { path: 'diffusionCommentaires1', type: 'string' },
    diffusionCommentaires2: { path: 'diffusionCommentaires2', type: 'string' },
    diffusionCommentaires3: { path: 'diffusionCommentaires3', type: 'string' },
    
    // Priorité (à ajouter)
    priorite: { path: 'priorite', type: 'string' }
  },

  // Mapping pour la collection lieux
  lieux: {
    nom: { path: 'nom', type: 'string' },
    type: { path: 'type', type: 'string' },
    capacite: { path: 'capacite', type: 'number' },
    adresse: { path: 'adresse', type: 'string' },
    codePostal: { path: 'codePostal', type: 'string' },
    ville: { path: 'ville', type: 'string' },
    pays: { path: 'pays', type: 'string' },
    createdAt: { path: 'createdAt', type: 'date' },
    updatedAt: { path: 'updatedAt', type: 'date' }
  },

  // Mapping pour la collection dates
  dates: {
    titre: { path: 'titre', type: 'string' },
    date: { path: 'date', type: 'date' },
    montant: { path: 'montant', type: 'number' },
    statut: { path: 'statut', type: 'string' },
    lieuId: { path: 'lieuId', type: 'string' },
    artisteId: { path: 'artisteId', type: 'string' },
    structureId: { path: 'structureId', type: 'string' },
    notes: { path: 'notes', type: 'string' },
    createdAt: { path: 'createdAt', type: 'date' },
    updatedAt: { path: 'updatedAt', type: 'date' },
    
    // Champs calculés ou joints
    lieuNom: { path: 'lieu.nom', type: 'string', join: true },
    lieuVille: { path: 'lieu.ville', type: 'string', join: true },
    artisteNom: { path: 'artiste.nom', type: 'string', join: true }
  },

  // Mapping pour la collection artistes
  artistes: {
    nom: { path: 'nom', type: 'string' },
    genre: { path: 'genre', type: 'string' },
    sousGenre: { path: 'sousGenre', type: 'string' },
    description: { path: 'description', type: 'string' },
    actif: { path: 'actif', type: 'boolean' },
    createdAt: { path: 'createdAt', type: 'date' },
    updatedAt: { path: 'updatedAt', type: 'date' },
    
    // Nouveaux champs à ajouter
    formations: { path: 'formations', type: 'string' },
    anneeCreation: { path: 'anneeCreation', type: 'number' },
    manager: { path: 'manager', type: 'string' },
    structureGestion: { path: 'structureGestion', type: 'string' },
    lieuRepetition: { path: 'lieuRepetition', type: 'string' },
    label: { path: 'label', type: 'string' },
    tourneur: { path: 'tourneur', type: 'string' },
    attachePresse: { path: 'attachePresse', type: 'string' }
  },

  // Mapping pour la collection projets
  projets: {
    nom: { path: 'nom', type: 'string' },
    description: { path: 'description', type: 'string' },
    artisteId: { path: 'artisteId', type: 'string' },
    statut: { path: 'statut', type: 'string' },
    dateDebut: { path: 'dateDebut', type: 'date' },
    dateFin: { path: 'dateFin', type: 'date' },
    montantTotal: { path: 'montantTotal', type: 'number' },
    createdAt: { path: 'createdAt', type: 'date' },
    updatedAt: { path: 'updatedAt', type: 'date' },
    
    // Nouveaux champs à ajouter
    favori: { path: 'favori', type: 'boolean' },
    suivi: { path: 'suivi', type: 'string' },
    estActif: { path: 'estActif', type: 'boolean' },
    prixVente: { path: 'prixVente', type: 'number' },
    frais: { path: 'frais', type: 'number' },
    jaugePossible: { path: 'jaugePossible', type: 'number' },
    disponibilites: { path: 'disponibilites', type: 'string' },
    tags: { path: 'tags', type: 'array' },
    commentaires: { path: 'commentaires', type: 'string' }
  }
};

/**
 * Helper pour obtenir le mapping d'un champ
 */
export function getFieldMapping(collection, field) {
  return searchFieldsMapping[collection]?.[field] || null;
}

/**
 * Helper pour obtenir tous les champs d'une collection
 */
export function getCollectionFields(collection) {
  return Object.keys(searchFieldsMapping[collection] || {});
}

/**
 * Helper pour valider si un champ existe dans une collection
 */
export function isValidField(collection, field) {
  return !!getFieldMapping(collection, field);
}

/**
 * Helper pour obtenir les champs searchables (texte) d'une collection
 */
export function getSearchableFields(collection) {
  const fields = searchFieldsMapping[collection] || {};
  return Object.entries(fields)
    .filter(([_, config]) => config.type === 'string')
    .map(([field, _]) => field);
}

/**
 * Helper pour obtenir les champs numériques d'une collection
 */
export function getNumericFields(collection) {
  const fields = searchFieldsMapping[collection] || {};
  return Object.entries(fields)
    .filter(([_, config]) => config.type === 'number')
    .map(([field, _]) => field);
}

/**
 * Helper pour obtenir les champs de type date d'une collection
 */
export function getDateFields(collection) {
  const fields = searchFieldsMapping[collection] || {};
  return Object.entries(fields)
    .filter(([_, config]) => config.type === 'date')
    .map(([field, _]) => field);
}

/**
 * Helper pour obtenir les champs de type array d'une collection
 */
export function getArrayFields(collection) {
  const fields = searchFieldsMapping[collection] || {};
  return Object.entries(fields)
    .filter(([_, config]) => config.type === 'array')
    .map(([field, _]) => field);
}