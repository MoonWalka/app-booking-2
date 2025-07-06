/**
 * Types et interfaces pour l'intégration Brevo
 * Défini les variables disponibles pour chaque template
 */

/**
 * @typedef {Object} BrevoTemplateVariables
 * Variables communes pour tous les templates Brevo
 */
export const BrevoTemplateVariables = {
  // Variables communes
  COMMON: {
    nom_programmateur: 'string',
    prenom_programmateur: 'string',
    email_programmateur: 'string',
    titre_date: 'string',
    date_date: 'string',
    heure_date: 'string',
    lieu_nom: 'string',
    lieu_adresse: 'string',
    contact_organisateur: 'string',
    email_organisateur: 'string',
    telephone_organisateur: 'string'
  }
};

/**
 * @typedef {Object} FormulaireTemplateVariables
 * Variables spécifiques au template "Formulaire Programmateur"
 */
export const FormulaireTemplateVariables = {
  ...BrevoTemplateVariables.COMMON,
  lien_formulaire: 'string',
  date_limite: 'string'
};

/**
 * @typedef {Object} RelanceTemplateVariables  
 * Variables spécifiques au template "Relance Documents"
 */
export const RelanceTemplateVariables = {
  ...BrevoTemplateVariables.COMMON,
  documents_manquants: 'array',
  date_limite: 'string',
  lien_documents: 'string',
  nombre_relance: 'number',
  contact_urgence: 'string'
};

/**
 * @typedef {Object} ContratTemplateVariables
 * Variables spécifiques au template "Contrat Prêt"
 */
export const ContratTemplateVariables = {
  ...BrevoTemplateVariables.COMMON,
  type_contrat: 'string',
  montant_total: 'string',
  lien_contrat: 'string',
  date_signature_limite: 'string',
  conditions_particulieres: 'string',
  contact_juridique: 'string'
};

/**
 * @typedef {Object} ConfirmationTemplateVariables
 * Variables spécifiques au template "Confirmation Date"
 */
export const ConfirmationTemplateVariables = {
  ...BrevoTemplateVariables.COMMON,
  heure_arrivee: 'string',
  adresse_complete: 'string',
  contact_technique: 'string',
  materiel_fourni: 'string',
  parking_info: 'string',
  consignes_speciales: 'string'
};

/**
 * @typedef {Object} BrevoTemplateMapping
 * Mapping entre les noms de templates et leurs IDs Brevo
 */
export const BrevoTemplateMapping = {
  formulaire: '', // À définir après création du template
  relance: '',    // À définir après création du template  
  contrat: '',    // À définir après création du template
  confirmation: '' // À définir après création du template
};

/**
 * @typedef {Object} BrevoConfig
 * Configuration Brevo
 */
export const BrevoConfig = {
  apiKey: '',
  fromEmail: '',
  fromName: 'TourCraft',
  baseUrl: 'https://api.brevo.com/v3'
};

/**
 * Validation des variables requises pour chaque template
 */
export const RequiredVariables = {
  formulaire: [
    'nom_programmateur',
    'titre_date', 
    'date_date',
    'lien_formulaire'
  ],
  relance: [
    'nom_programmateur',
    'titre_date',
    'documents_manquants',
    'date_limite'
  ],
  contrat: [
    'nom_programmateur', 
    'titre_date',
    'lien_contrat',
    'montant_total'
  ],
  confirmation: [
    'nom_programmateur',
    'titre_date',
    'date_date',
    'heure_date',
    'lieu_nom'
  ]
};

/**
 * Valeurs par défaut pour les variables optionnelles
 */
export const DefaultVariables = {
  prenom_programmateur: 'Programmateur',
  contact_organisateur: 'Équipe TourCraft',
  email_organisateur: 'contact@tourcraft.com',
  telephone_organisateur: '01 00 00 00 00',
  lieu_adresse: 'Adresse à confirmer',
  heure_date: 'Horaire à confirmer',
  contact_technique: 'À définir',
  materiel_fourni: 'Standard',
  parking_info: 'Se renseigner sur place',
  consignes_speciales: 'Aucune consigne particulière'
};