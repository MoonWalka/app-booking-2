/**
 * Utilitaires pour transformer les données TourCraft en variables Brevo
 * Gère la conversion des objets concert/contact en variables de templates
 */

import { DefaultVariables } from '../types/brevoTypes.js';

/**
 * Formate les données d'un concert pour les templates Brevo
 * @param {Object} concert - Données du concert
 * @param {Object} contact - Données du contact (programmateur)
 * @returns {Object} Variables formatées pour Brevo
 */
export const formatConcertVariables = (concert, contact = {}) => {
  const dateFormattee = concert.date ? 
    new Date(concert.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long', 
      year: 'numeric'
    }) : 'Date à confirmer';

  const heureFormattee = concert.heure || DefaultVariables.heure_concert;

  return {
    // Informations programmateur
    nom_programmateur: contact.nom || contact.name || 'Programmateur',
    prenom_programmateur: contact.prenom || contact.firstName || DefaultVariables.prenom_programmateur,
    email_programmateur: contact.email || '',
    
    // Informations concert
    titre_concert: concert.nom || concert.title || 'Concert',
    date_concert: dateFormattee,
    heure_concert: heureFormattee,
    
    // Informations lieu
    lieu_nom: concert.lieu?.nom || concert.venue?.name || 'Lieu à confirmer',
    lieu_adresse: concert.lieu?.adresse || concert.venue?.address || DefaultVariables.lieu_adresse,
    adresse_complete: formatAdresseComplete(concert.lieu || concert.venue),
    
    // Contacts organisateur
    contact_organisateur: DefaultVariables.contact_organisateur,
    email_organisateur: DefaultVariables.email_organisateur,
    telephone_organisateur: DefaultVariables.telephone_organisateur
  };
};

/**
 * Formate les variables pour le template formulaire programmateur
 * @param {Object} concert - Données du concert
 * @param {Object} contact - Données du contact
 * @param {string} lienFormulaire - URL du formulaire
 * @returns {Object} Variables pour template formulaire
 */
export const formatFormulaireVariables = (concert, contact, lienFormulaire) => {
  const baseVariables = formatConcertVariables(concert, contact);
  
  const dateLimite = concert.dateLimiteFormulaire ? 
    new Date(concert.dateLimiteFormulaire).toLocaleDateString('fr-FR') :
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'); // +7 jours par défaut

  return {
    ...baseVariables,
    lien_formulaire: lienFormulaire || '',
    date_limite: dateLimite
  };
};

/**
 * Formate les variables pour le template relance documents
 * @param {Object} concert - Données du concert
 * @param {Object} contact - Données du contact
 * @param {Array} documentsManquants - Liste des documents manquants
 * @param {number} nombreRelance - Numéro de la relance
 * @returns {Object} Variables pour template relance
 */
export const formatRelanceVariables = (concert, contact, documentsManquants = [], nombreRelance = 1) => {
  const baseVariables = formatConcertVariables(concert, contact);
  
  const dateLimite = concert.dateLimiteDocuments ?
    new Date(concert.dateLimiteDocuments).toLocaleDateString('fr-FR') :
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'); // +3 jours par défaut

  const lienDocuments = `${window.location.origin}/documents/${concert.id || concert._id}`;

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
 * @param {Object} concert - Données du concert
 * @param {Object} contact - Données du contact
 * @param {Object} contrat - Données du contrat
 * @returns {Object} Variables pour template contrat
 */
export const formatContratVariables = (concert, contact, contrat) => {
  const baseVariables = formatConcertVariables(concert, contact);
  
  const montantFormate = contrat.montantTotal ? 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(contrat.montantTotal) : 'Montant à définir';

  const dateLimiteSignature = contrat.dateLimiteSignature ?
    new Date(contrat.dateLimiteSignature).toLocaleDateString('fr-FR') :
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'); // +5 jours par défaut

  const lienContrat = `${window.location.origin}/contrat/${contrat.id || contrat._id}`;

  return {
    ...baseVariables,
    type_contrat: contrat.type || 'Cession',
    montant_total: montantFormate,
    lien_contrat: lienContrat,
    date_signature_limite: dateLimiteSignature,
    conditions_particulieres: contrat.conditionsParticulieres || 'Conditions standard',
    contact_juridique: DefaultVariables.contact_organisateur
  };
};

/**
 * Formate les variables pour le template confirmation concert
 * @param {Object} concert - Données du concert
 * @param {Object} contact - Données du contact
 * @param {Object} detailsTechniques - Détails techniques du concert
 * @returns {Object} Variables pour template confirmation
 */
export const formatConfirmationVariables = (concert, contact, detailsTechniques = {}) => {
  const baseVariables = formatConcertVariables(concert, contact);
  
  const heureArrivee = detailsTechniques.heureArrivee || 
    (concert.heure ? 
      new Date(`2000-01-01T${concert.heure}`).getTime() - (2.5 * 60 * 60 * 1000) : // -2h30 par défaut
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