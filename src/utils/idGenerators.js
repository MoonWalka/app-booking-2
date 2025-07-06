/**
 * Utilitaires pour générer des identifiants pour différentes entités
 */

/**
 * Génère un identifiant unique pour une date
 * Préfixé par 'dat-' suivi d'un timestamp et d'une chaîne aléatoire
 * 
 * @returns {string} Identifiant unique formaté
 */
export const generateDateId = () => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `dat-${timestamp}-${randomStr}`;
};

/**
 * Génère un identifiant unique pour un artiste
 * Préfixé par 'art-' suivi d'un timestamp et d'une chaîne aléatoire
 * 
 * @returns {string} Identifiant unique formaté
 */
export const generateArtisteId = () => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `art-${timestamp}-${randomStr}`;
};

/**
 * Génère un identifiant unique pour un lieu
 * Préfixé par 'lie-' suivi d'un timestamp et d'une chaîne aléatoire
 * 
 * @returns {string} Identifiant unique formaté
 */
export const generateLieuId = () => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `lie-${timestamp}-${randomStr}`;
};

/**
 * Génère un identifiant unique pour un contact
 * Préfixé par 'pro-' suivi d'un timestamp et d'une chaîne aléatoire
 * 
 * @returns {string} Identifiant unique formaté
 */
export const generateContactId = () => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `pro-${timestamp}-${randomStr}`;
};

/**
 * Génère un identifiant unique pour une structure
 * Préfixé par 'str-' suivi d'un timestamp et d'une chaîne aléatoire
 * 
 * @returns {string} Identifiant unique formaté
 */
export const generateStructureId = () => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `str-${timestamp}-${randomStr}`;
};

/**
 * Génère un identifiant unique pour un contrat
 * Préfixé par 'ctr-' suivi d'un timestamp et d'une chaîne aléatoire
 * 
 * @returns {string} Identifiant unique formaté
 */
export const generateContratId = () => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ctr-${timestamp}-${randomStr}`;
};

/**
 * Génère un identifiant unique générique
 * Préfixé par un préfixe donné (ou 'id-' par défaut) suivi d'un timestamp et d'une chaîne aléatoire
 * 
 * @param {string} prefix - Préfixe à utiliser (optionnel, 'id-' par défaut)
 * @returns {string} Identifiant unique formaté
 */
export const generateId = (prefix = 'id') => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomStr}`;
};