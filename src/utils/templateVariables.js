/**
 * Utilitaires pour transformer les données TourCraft en variables Brevo
 * Gère la conversion des objets date/contact en variables de templates
 * 
 * NOTE: La fonction formatContratVariables est temporairement non utilisée
 * car l'envoi d'email de contrat est désactivé
 * TODO: Réactiver avec la nouvelle solution API
 */

import { DefaultVariables } from '../types/brevoTypes.js';

/**
 * Formate les données d'un date pour les templates Brevo
 * @param {Object} date - Données de la date
 * @param {Object} contact - Données du contact (programmateur)
 * @returns {Object} Variables formatées pour Brevo
 */
export const formatDateVariables = (date, contact = {}) => {
  const dateFormattee = date.date ? 
    new Date(date.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long', 
      year: 'numeric'
    }) : 'Date à confirmer';

  const heureFormattee = date.heure || DefaultVariables.heure_date;

  return {
    // Informations programmateur
    nom_programmateur: contact.nom || contact.name || 'Programmateur',
    prenom_programmateur: contact.prenom || contact.firstName || DefaultVariables.prenom_programmateur,
    email_programmateur: contact.email || '',
    
    // Informations date
    titre_date: date.nom || date.title || date.titre || 'Date',
    date_date: dateFormattee,
    heure_date: heureFormattee,
    
    // Informations lieu
    lieu_nom: date.lieu?.nom || date.venue?.name || 'Lieu à confirmer',
    lieu_adresse: date.lieu?.adresse || date.venue?.address || DefaultVariables.lieu_adresse,
    adresse_complete: formatAdresseComplete(date.lieu || date.venue),
    
    // Contacts organisateur
    contact_organisateur: DefaultVariables.contact_organisateur,
    email_organisateur: DefaultVariables.email_organisateur,
    telephone_organisateur: DefaultVariables.telephone_organisateur
  };
};

/**
 * Formate les variables pour le template formulaire programmateur
 * @param {Object} date - Données de la date
 * @param {Object} contact - Données du contact
 * @param {string} lienFormulaire - URL du formulaire
 * @returns {Object} Variables pour template formulaire
 */
export const formatFormulaireVariables = (date, contact, lienFormulaire) => {
  const baseVariables = formatDateVariables(date, contact);
  
  const dateLimite = date.dateLimiteFormulaire ? 
    new Date(date.dateLimiteFormulaire).toLocaleDateString('fr-FR') :
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'); // +7 jours par défaut

  return {
    ...baseVariables,
    lien_formulaire: lienFormulaire || '',
    date_limite: dateLimite
  };
};

/**
 * Formate les variables pour le template relance documents
 * @param {Object} date - Données de la date
 * @param {Object} contact - Données du contact
 * @param {Array} documentsManquants - Liste des documents manquants
 * @param {number} nombreRelance - Numéro de la relance
 * @returns {Object} Variables pour template relance
 */
export const formatRelanceVariables = (date, contact, documentsManquants = [], nombreRelance = 1) => {
  const baseVariables = formatDateVariables(date, contact);
  
  const dateLimite = date.dateLimiteDocuments ?
    new Date(date.dateLimiteDocuments).toLocaleDateString('fr-FR') :
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'); // +3 jours par défaut

  const lienDocuments = `${window.location.origin}/documents/${date.id || date._id}`;

  return {
    ...baseVariables,
    documents_manquants: documentsManquants,
    date_limite: dateLimite,
    lien_documents: lienDocuments,
    nombre_relance: nombreRelance,
    contact_urgence: `${DefaultVariables.contact_organisateur} - ${DefaultVariables.telephone_organisateur}`
  };
};

/**
 * Formate les variables pour le template contrat prêt
 * 
 * TEMPORAIREMENT NON UTILISÉE: L'envoi d'email de contrat est désactivé
 * Fonction conservée pour réactivation future
 * 
 * @param {Object} date - Données de la date
 * @param {Object} contact - Données du contact
 * @param {Object} contrat - Données du contrat
 * @returns {Object} Variables pour template contrat
 */
export const formatContratVariables = (date, contact, contrat) => {
  const baseVariables = formatDateVariables(date, contact);
  
  // Assurer la robustesse face aux objets undefined/null
  const contratData = contrat || {};
  const dateData = date || {};
  
  // Le montant peut être dans contrat.montantTotal, date.montant, ou date.prix
  const montantBrut = contratData.montantTotal || dateData.montant || dateData.prix || 0;
  const montantFormate = montantBrut ? 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(parseFloat(montantBrut)) : 'Montant à définir';

  const dateLimiteSignature = contratData.dateLimiteSignature ?
    new Date(contratData.dateLimiteSignature).toLocaleDateString('fr-FR') :
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'); // +5 jours par défaut

  // Utiliser l'ID du contrat pour le lien de téléchargement direct
  const contratId = contratData.id || contratData._id || 'unknown';
  // Utiliser directement l'URL de la Cloud Function pour éviter React Router
  const lienContrat = `https://us-central1-app-booking-26571.cloudfunctions.net/downloadContrat?id=${contratId}`;
  
  console.log('[templateVariables] Génération lien contrat:', {
    contratId,
    lienContrat,
    type: 'cloud-function-direct'
  });

  return {
    ...baseVariables,
    type_contrat: contratData.type || contratData.typeContrat || 'Cession',
    montant_total: montantFormate,
    lien_contrat: lienContrat,
    date_signature_limite: dateLimiteSignature,
    conditions_particulieres: contratData.conditionsParticulieres || 'Conditions standard',
    contact_juridique: DefaultVariables.contact_organisateur
  };
};

/**
 * Formate les variables pour le template confirmation date
 * @param {Object} date - Données de la date
 * @param {Object} contact - Données du contact
 * @param {Object} detailsTechniques - Détails techniques de la date
 * @returns {Object} Variables pour template confirmation
 */
export const formatConfirmationVariables = (date, contact, detailsTechniques = {}) => {
  const baseVariables = formatDateVariables(date, contact);
  
  const heureArrivee = detailsTechniques.heureArrivee || 
    (date.heure ? 
      new Date(`2000-01-01T${date.heure}`).getTime() - (2.5 * 60 * 60 * 1000) : // -2h30 par défaut
      '18:00'
    );

  return {
    ...baseVariables,
    heure_arrivee: typeof heureArrivee === 'string' ? heureArrivee : 
      new Date(heureArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    contact_technique: detailsTechniques.contactTechnique || DefaultVariables.contact_technique,
    materiel_fourni: detailsTechniques.materielFourni || DefaultVariables.materiel_fourni,
    parking_info: detailsTechniques.parkingInfo || DefaultVariables.parking_info,
    consignes_speciales: detailsTechniques.consignesSpeciales || DefaultVariables.consignes_speciales
  };
};

/**
 * Formate une adresse complète pour l'affichage
 * @param {Object} lieu - Données du lieu
 * @returns {string} Adresse formatée
 */
const formatAdresseComplete = (lieu) => {
  if (!lieu) return DefaultVariables.lieu_adresse;
  
  const parties = [
    lieu.adresse || lieu.address,
    lieu.codePostal || lieu.zipCode,
    lieu.ville || lieu.city
  ].filter(Boolean);
  
  return parties.length > 0 ? parties.join(', ') : DefaultVariables.lieu_adresse;
};

/**
 * Valide que toutes les variables requises sont présentes
 * @param {Object} variables - Variables à valider
 * @param {Array} requiredFields - Champs requis
 * @returns {Object} { valid: boolean, missing: Array }
 */
export const validateRequiredVariables = (variables, requiredFields) => {
  const missing = requiredFields.filter(field => 
    !variables[field] || variables[field] === ''
  );
  
  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Applique les valeurs par défaut aux variables manquantes
 * @param {Object} variables - Variables existantes
 * @returns {Object} Variables avec valeurs par défaut
 */
export const applyDefaultVariables = (variables) => {
  return {
    ...DefaultVariables,
    ...variables
  };
};