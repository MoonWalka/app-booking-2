import * as Yup from 'yup';

/**
 * Schémas de validation pour le nouveau modèle relationnel de contacts
 * Compatible avec Bob Booking
 */

// ==================== SCHEMAS DE BASE ====================

/**
 * Schéma pour la collection "structures"
 * Une structure = une organisation (festival, salle, label, etc.)
 */
export const structureSchema = Yup.object().shape({
  // Identifiants
  organizationId: Yup.string().required('Organisation requise'),
  
  // Informations principales
  raisonSociale: Yup.string()
    .required('Raison sociale requise')
    .min(2, 'Minimum 2 caractères')
    .max(200, 'Maximum 200 caractères'),
  
  type: Yup.string()
    .nullable()
    .oneOf(['festival', 'salle', 'label', 'media', 'institution', 'association', 'autre', null]),
  
  source: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .nullable(),
  
  // Coordonnées principales
  email: Yup.string()
    .email('Email invalide')
    .nullable(),
  
  telephone1: Yup.string()
    .nullable()
    .test('phone-format', 'Format téléphone invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  telephone2: Yup.string()
    .nullable()
    .test('phone-format', 'Format téléphone invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  fax: Yup.string()
    .nullable()
    .test('fax-format', 'Format fax invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  siteWeb: Yup.string()
    .url('URL invalide')
    .nullable(),
  
  // Adresse
  adresse: Yup.string()
    .max(300, 'Maximum 300 caractères')
    .nullable(),
  
  suiteAdresse: Yup.string()
    .max(300, 'Maximum 300 caractères')
    .nullable(),
  
  codePostal: Yup.string()
    .nullable()
    .test('postal-code-format', 'Code postal invalide (5 chiffres)', function(value) {
      if (!value || value === '') return true;
      return /^\d{5}$/.test(value);
    }),
  
  ville: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .nullable(),
  
  departement: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .nullable(),
  
  region: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .nullable(),
  
  pays: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .default('France'),
  
  // Informations administratives
  siret: Yup.string()
    .nullable()
    .test('siret-format', 'SIRET invalide (14 chiffres)', function(value) {
      if (!value || value === '') return true;
      return /^\d{14}$/.test(value);
    }),
  
  codeApe: Yup.string()
    .nullable()
    .test('ape-format', 'Code APE invalide (format: 1234A)', function(value) {
      if (!value || value === '') return true;
      return /^\d{4}[A-Z]$/.test(value);
    }),
  
  licence: Yup.string()
    .max(50, 'Maximum 50 caractères')
    .nullable(),
  
  tvaIntracom: Yup.string()
    .nullable()
    .test('tva-format', 'TVA invalide (format: FR12345678901)', function(value) {
      if (!value || value === '') return true;
      return /^FR\d{11}$/.test(value);
    }),
  
  // Réseaux sociaux
  facebook: Yup.string()
    .url('URL Facebook invalide')
    .nullable(),
  
  instagram: Yup.string()
    .nullable()
    .test('instagram-format', 'Handle Instagram invalide', function(value) {
      if (!value || value === '') return true;
      return /^@?[\w.]+$/.test(value);
    }),
  
  twitter: Yup.string()
    .nullable()
    .test('twitter-format', 'Handle Twitter invalide', function(value) {
      if (!value || value === '') return true;
      return /^@?[\w]+$/.test(value);
    }),
  
  linkedin: Yup.string()
    .url('URL LinkedIn invalide')
    .nullable(),
  
  youtube: Yup.string()
    .url('URL YouTube invalide')
    .nullable(),
  
  // Qualification
  tags: Yup.array()
    .of(Yup.string())
    .default([]),
  
  // Statut client (nouveau)
  isClient: Yup.boolean()
    .default(false),
  
  // Champs spécialisés par type (optionnels)
  // Pour les salles
  capacite: Yup.number()
    .positive('Capacité doit être positive')
    .integer('Capacité doit être un nombre entier')
    .nullable(),
  
  dimensionsScene: Yup.object().shape({
    ouverture: Yup.number().positive().nullable(),
    profondeur: Yup.number().positive().nullable(),
    hauteur: Yup.number().positive().nullable()
  }).nullable(),
  
  // Pour les festivals
  periodeActivite: Yup.object().shape({
    mois: Yup.string().nullable(),
    dateDebut: Yup.date().nullable(),
    dateFin: Yup.date().nullable(),
    dateBouclage: Yup.date().nullable()
  }).nullable(),
  
  // Métadonnées
  createdAt: Yup.date().default(() => new Date()),
  updatedAt: Yup.date().default(() => new Date()),
  createdBy: Yup.string().nullable(),
  updatedBy: Yup.string().nullable()
});

/**
 * Schéma pour la collection "personnes"
 * Une personne = un contact individuel
 */
export const personneSchema = Yup.object().shape({
  // Identifiants
  organizationId: Yup.string().required('Organisation requise'),
  
  // Identité
  civilite: Yup.string()
    .oneOf(['M', 'Mme', 'Dr', 'Pr', null])
    .nullable(),
  
  prenom: Yup.string()
    .required('Prénom requis')
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères'),
  
  nom: Yup.string()
    .required('Nom requis')
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères'),
  
  // Contact principal (unique dans l'organisation si fourni)
  email: Yup.string()
    .email('Email invalide')
    .nullable(),
  
  // Emails additionnels
  mailDirect: Yup.string()
    .email('Email direct invalide')
    .nullable(),
  
  mailPerso: Yup.string()
    .email('Email personnel invalide')
    .nullable(),
  
  // Téléphones
  telephone: Yup.string()
    .nullable()
    .test('phone-format', 'Format téléphone invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  telephone2: Yup.string()
    .nullable()
    .test('phone-format', 'Format téléphone invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  telDirect: Yup.string()
    .nullable()
    .test('phone-format', 'Format téléphone invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  telPerso: Yup.string()
    .nullable()
    .test('phone-format', 'Format téléphone invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  mobile: Yup.string()
    .nullable()
    .test('mobile-format', 'Format mobile invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[67](\d{2}){4}$/.test(value);
    }),
  
  fax: Yup.string()
    .nullable()
    .test('fax-format', 'Format fax invalide', function(value) {
      if (!value || value === '') return true;
      return /^(\+33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  // Adresse personnelle (optionnelle)
  adresse: Yup.string()
    .max(300, 'Maximum 300 caractères')
    .nullable(),
  
  suiteAdresse: Yup.string()
    .max(300, 'Maximum 300 caractères')
    .nullable(),
  
  codePostal: Yup.string()
    .nullable()
    .test('postal-code-format', 'Code postal invalide (5 chiffres)', function(value) {
      if (!value || value === '') return true;
      return /^\d{5}$/.test(value);
    }),
  
  ville: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .nullable(),
  
  departement: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .nullable(),
  
  region: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .nullable(),
  
  pays: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .default('France'),
  
  // Qualification
  tags: Yup.array()
    .of(Yup.string())
    .default([]),
  
  // Indicateur personne libre (sans structure)
  isPersonneLibre: Yup.boolean()
    .default(true),
  
  // Métadonnées
  createdAt: Yup.date().default(() => new Date()),
  updatedAt: Yup.date().default(() => new Date()),
  createdBy: Yup.string().nullable(),
  updatedBy: Yup.string().nullable()
});

/**
 * Schéma pour la collection "liaisons"
 * Une liaison = relation entre une structure et une personne
 */
export const liaisonSchema = Yup.object().shape({
  // Identifiants
  organizationId: Yup.string().required('Organisation requise'),
  structureId: Yup.string().required('Structure requise'),
  personneId: Yup.string().required('Personne requise'),
  
  // Informations de la relation
  fonction: Yup.string()
    .max(100, 'Maximum 100 caractères')
    .nullable(),
  
  // Statuts relationnels (comme Bob Booking)
  actif: Yup.boolean()
    .default(true)
    .required('Statut actif requis'),
  
  prioritaire: Yup.boolean()
    .default(false)
    .required('Statut prioritaire requis'),
  
  interesse: Yup.boolean()
    .default(false),
  
  // Dates de la relation
  dateDebut: Yup.date()
    .nullable(),
  
  dateFin: Yup.date()
    .nullable()
    .when('dateDebut', (dateDebut, schema) => {
      return dateDebut 
        ? schema.min(dateDebut, 'La date de fin doit être après la date de début')
        : schema;
    }),
  
  // Notes spécifiques à cette relation
  notes: Yup.string()
    .max(500, 'Maximum 500 caractères')
    .nullable(),
  
  // Métadonnées
  createdAt: Yup.date().default(() => new Date()),
  updatedAt: Yup.date().default(() => new Date()),
  createdBy: Yup.string().nullable(),
  updatedBy: Yup.string().nullable()
});

/**
 * Schéma pour la collection "qualifications" (taxonomie hiérarchique)
 */
export const qualificationSchema = Yup.object().shape({
  // Identifiants
  organizationId: Yup.string().required('Organisation requise'),
  
  // Hiérarchie
  parentId: Yup.string().nullable(),
  
  // Informations
  label: Yup.string()
    .required('Label requis')
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères'),
  
  code: Yup.string()
    .matches(/^[A-Z0-9_]+$/, 'Code invalide (majuscules, chiffres et _ uniquement)')
    .max(50, 'Maximum 50 caractères')
    .nullable(),
  
  description: Yup.string()
    .max(500, 'Maximum 500 caractères')
    .nullable(),
  
  // Type de qualification
  type: Yup.string()
    .oneOf(['activite', 'reseau', 'genre', 'autre'])
    .default('activite'),
  
  // Ordre d'affichage
  ordre: Yup.number()
    .integer()
    .default(0),
  
  // Statut
  actif: Yup.boolean()
    .default(true),
  
  // Métadonnées
  createdAt: Yup.date().default(() => new Date()),
  updatedAt: Yup.date().default(() => new Date())
});

// ==================== SCHEMAS D'IMPORT ====================

/**
 * Schéma pour l'import Excel (compatible Bob Booking)
 * Une ligne = une structure + jusqu'à 3 personnes
 */
export const importRowSchema = Yup.object().shape({
  // Structure
  raisonSociale: Yup.string().nullable(),
  type: Yup.string().nullable(),
  adresse: Yup.string().nullable(),
  codePostal: Yup.string().nullable(),
  ville: Yup.string().nullable(),
  pays: Yup.string().nullable(),
  telephone: Yup.string().nullable(),
  email: Yup.string().nullable(),
  siteWeb: Yup.string().nullable(),
  tags: Yup.string().nullable(), // Séparés par ;
  
  // Personne 1
  personne1Prenom: Yup.string().nullable(),
  personne1Nom: Yup.string().nullable(),
  personne1Fonction: Yup.string().nullable(),
  personne1Email: Yup.string().nullable(),
  personne1Telephone: Yup.string().nullable(),
  
  // Personne 2
  personne2Prenom: Yup.string().nullable(),
  personne2Nom: Yup.string().nullable(),
  personne2Fonction: Yup.string().nullable(),
  personne2Email: Yup.string().nullable(),
  personne2Telephone: Yup.string().nullable(),
  
  // Personne 3
  personne3Prenom: Yup.string().nullable(),
  personne3Nom: Yup.string().nullable(),
  personne3Fonction: Yup.string().nullable(),
  personne3Email: Yup.string().nullable(),
  personne3Telephone: Yup.string().nullable()
});

// ==================== HELPERS DE VALIDATION ====================

/**
 * Valide une structure avant insertion/mise à jour
 */
export const validateStructure = async (data) => {
  try {
    const validated = await structureSchema.validate(data, { abortEarly: false });
    return { valid: true, data: validated };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.inner.map(e => ({ field: e.path, message: e.message }))
    };
  }
};

/**
 * Valide une personne avant insertion/mise à jour
 */
export const validatePersonne = async (data) => {
  try {
    const validated = await personneSchema.validate(data, { abortEarly: false });
    return { valid: true, data: validated };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.inner.map(e => ({ field: e.path, message: e.message }))
    };
  }
};

/**
 * Valide une liaison avant insertion/mise à jour
 */
export const validateLiaison = async (data) => {
  try {
    const validated = await liaisonSchema.validate(data, { abortEarly: false });
    return { valid: true, data: validated };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.inner.map(e => ({ field: e.path, message: e.message }))
    };
  }
};

/**
 * Valide une ligne d'import Excel
 */
export const validateImportRow = async (row) => {
  try {
    const validated = await importRowSchema.validate(row, { abortEarly: false });
    return { valid: true, data: validated };
  } catch (error) {
    return { 
      valid: false, 
      errors: error.inner.map(e => ({ field: e.path, message: e.message }))
    };
  }
};