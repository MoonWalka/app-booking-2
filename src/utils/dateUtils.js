/**
 * Utilitaires pour la manipulation des dates
 */

/**
 * Formate une date au format YYYY-MM-DD
 * @param {Date|string} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  if (!date) return '';

  let d = null;

  // Tenter de convertir si c'est une chaîne, sinon laisser tel quel
  if (typeof date === 'string') {
    d = new Date(date);
  } else if (date instanceof Date) {
    d = date;
  } else {
    return '';
  }

  // Vérifier si la date est valide
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Convertit une date au format YYYY-MM-DD en objet Date
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {Date} Objet Date
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Si la date est déjà un objet Date, la retourner
  if (dateString instanceof Date) return dateString;
  
  // Gérer différents formats de date
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    // Format MM/DD/YYYY
    if (parts.length === 3) {
      return new Date(parts[2], parts[0] - 1, parts[1]);
    }
  }
  
  // Format YYYY-MM-DD
  return new Date(dateString);
};

/**
 * Vérifie si une date est dans le futur
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} True si la date est dans le futur
 */
export const isFutureDate = (date) => {
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return d > today;
};

/**
 * Formate une date au format français JJ-MM-AA
 * @param {Date|string|Object} dateString - Date à formater (peut être un timestamp Firestore)
 * @returns {string} Date formatée au format JJ-MM-AA avec tiret comme séparateur
 */
export const formatDateFr = (dateString) => {
  if (!dateString) return '-';
  
  let day, month, year;
  
  // Si c'est un timestamp Firestore
  if (dateString.seconds) {
    const date = new Date(dateString.seconds * 1000);
    day = String(date.getDate()).padStart(2, '0');
    month = String(date.getMonth() + 1).padStart(2, '0');
    year = String(date.getFullYear()).slice(-2); // Prendre uniquement les 2 derniers chiffres
    return `${day}-${month}-${year}`;
  }
  
  // Si c'est une chaîne de date au format ISO ou un objet Date
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Si la date est invalide, retourner la chaîne originale
  
  day = String(date.getDate()).padStart(2, '0');
  month = String(date.getMonth() + 1).padStart(2, '0');
  year = String(date.getFullYear()).slice(-2); // Prendre uniquement les 2 derniers chiffres
  
  return `${day}-${month}-${year}`;
};

/**
 * Formate une date au format français JJ/MM/AA avec slash comme séparateur
 * @param {Date|string|Object} dateString - Date à formater (peut être un timestamp Firestore)
 * @returns {string} Date formatée au format JJ/MM/AA
 */
export const formatDateFrSlash = (dateString) => {
  if (!dateString) return '-';
  
  let day, month, year;
  
  // Si c'est un timestamp Firestore
  if (dateString.seconds) {
    const date = new Date(dateString.seconds * 1000);
    day = String(date.getDate()).padStart(2, '0');
    month = String(date.getMonth() + 1).padStart(2, '0');
    year = String(date.getFullYear()).slice(-2); // Prendre uniquement les 2 derniers chiffres
    return `${day}/${month}/${year}`;
  }
  
  // Si c'est une chaîne de date au format ISO ou un objet Date
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Si la date est invalide, retourner la chaîne originale
  
  day = String(date.getDate()).padStart(2, '0');
  month = String(date.getMonth() + 1).padStart(2, '0');
  year = String(date.getFullYear()).slice(-2); // Prendre uniquement les 2 derniers chiffres
  
  return `${day}/${month}/${year}`;
};
