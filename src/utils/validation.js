/**
 * Utilitaires de validation de formulaires
 */

/**
 * Valide un formulaire de contact
 * @param {Object} data - Les données du formulaire à valider
 * @returns {Object} - { isValid, errors } Résultat de la validation
 */
export const validateProgrammateurForm = (data) => {
  const errors = {};
  
  // Validation du nom
  if (!data.nom) {
    errors.nom = 'Le nom est obligatoire';
  }
  
  // Validation de l'email (si présent)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email invalide';
  }
  
  // Validation du téléphone (si présent)
  if (data.telephone && !/^[0-9+\s()-]{8,15}$/.test(data.telephone)) {
    errors.telephone = 'Numéro de téléphone invalide';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valide un formulaire de lieu
 * @param {Object} data - Les données du formulaire à valider
 * @returns {Object} - { isValid, errors } Résultat de la validation
 */
export const validateLieuForm = (data) => {
  const errors = {};
  
  // Validation du nom
  if (!data.nom) {
    errors.nom = 'Le nom du lieu est obligatoire';
  }
  
  // Validation de la ville
  if (!data.ville) {
    errors.ville = 'La ville est obligatoire';
  }
  
  // Validation du code postal (si présent)
  if (data.codePostal && !/^[0-9]{5}$/.test(data.codePostal)) {
    errors.codePostal = 'Le code postal doit contenir 5 chiffres';
  }
  
  // Validation de l'adresse (si présent)
  if (!data.adresse) {
    errors.adresse = 'L\'adresse est obligatoire';
  }
  
  // Validation de l'email (si présent)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email invalide';
  }
  
  // Validation du téléphone (si présent)
  if (data.telephone && !/^[0-9+\s()-]{8,15}$/.test(data.telephone)) {
    errors.telephone = 'Numéro de téléphone invalide';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valide un formulaire d'artiste
 * @param {Object} data - Les données du formulaire à valider
 * @returns {Object} - { isValid, errors } Résultat de la validation
 */
export const validateArtisteForm = (data) => {
  const errors = {};
  
  // Validation du nom
  if (!data.nom) {
    errors.nom = 'Le nom de l\'artiste est obligatoire';
  }
  
  // Validation du style musical
  if (!data.style) {
    errors.style = 'Le style musical est obligatoire';
  }
  
  // Validation du statut
  if (!data.statut) {
    errors.statut = 'Le statut est obligatoire';
  }
  
  // Validation de l'email (si présent)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email invalide';
  }
  
  // Validation du téléphone (si présent)
  if (data.telephone && !/^[0-9+\s()-]{8,15}$/.test(data.telephone)) {
    errors.telephone = 'Numéro de téléphone invalide';
  }
  
  // Validation du site web (si présent)
  if (data.siteWeb && !/^https?:\/\/[^\s]+$/.test(data.siteWeb)) {
    errors.siteWeb = 'URL du site web invalide';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valide un formulaire de concert
 * @param {Object} data - Les données du formulaire à valider
 * @returns {Object} - { isValid, errors } Résultat de la validation
 */
export const validateConcertForm = (data) => {
  const errors = {};
  
  // Validation du titre
  if (!data.titre) {
    errors.titre = 'Le titre du concert est obligatoire';
  }
  
  // Validation de la date
  if (!data.date) {
    errors.date = 'La date du concert est obligatoire';
  }

  // Validation du montant
  if (data.montant === undefined || data.montant === null || data.montant === '' || isNaN(parseFloat(data.montant))) {
    errors.montant = 'Le montant est obligatoire et doit être un nombre valide';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};