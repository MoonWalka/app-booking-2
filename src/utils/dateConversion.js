/**
 * Utilitaire pour gérer la conversion des dates depuis Firebase
 * Gère les différents formats de dates possibles
 */

/**
 * Convertit une date Firebase en objet Date JavaScript
 * @param {any} dateValue - La valeur de date à convertir
 * @param {any} fallbackValue - Valeur de fallback si la première est invalide
 * @returns {Date} Un objet Date valide
 */
export function convertFirebaseDate(dateValue, fallbackValue = null) {
  let date = null;
  
  // Essayer la valeur principale
  if (dateValue) {
    date = tryConvertDate(dateValue);
  }
  
  // Essayer la valeur de fallback si nécessaire
  if (!date && fallbackValue) {
    date = tryConvertDate(fallbackValue);
  }
  
  // Retourner la date actuelle si tout échoue
  return date || new Date();
}

/**
 * Tente de convertir une valeur en Date
 * @param {any} value - La valeur à convertir
 * @returns {Date|null} Date convertie ou null
 */
function tryConvertDate(value) {
  try {
    let date = null;
    
    // Timestamp Firebase avec méthode toDate()
    if (value?.toDate && typeof value.toDate === 'function') {
      date = value.toDate();
    }
    // Timestamp Firebase avec propriété seconds
    else if (value?.seconds !== undefined) {
      date = new Date(value.seconds * 1000);
    }
    // String ou autre valeur
    else if (value) {
      date = new Date(value);
    }
    
    // Vérifier que la date est valide
    if (date && !isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (error) {
    console.warn('Erreur conversion date:', error, value);
    return null;
  }
}

/**
 * Formate une date de manière sûre
 * @param {any} dateValue - La valeur de date à formater
 * @param {string} fallback - Texte à afficher si la date est invalide
 * @returns {string} Date formatée ou fallback
 */
export function formatDateSafely(dateValue, fallback = 'Date invalide') {
  try {
    // Si c'est déjà une string, la retourner
    if (typeof dateValue === 'string') {
      // Vérifier si c'est une date ISO valide
      const testDate = new Date(dateValue);
      if (!isNaN(testDate.getTime())) {
        return testDate.toLocaleString('fr-FR');
      }
      return dateValue; // Retourner la string telle quelle
    }
    
    const date = convertFirebaseDate(dateValue);
    if (date && !isNaN(date.getTime())) {
      return date.toLocaleString('fr-FR');
    }
    return fallback;
  } catch (error) {
    return fallback;
  }
}

/**
 * Obtient une clé de date pour le groupement (YYYY-MM-DD)
 * @param {any} dateValue - La valeur de date
 * @returns {string} Clé de date ou date du jour
 */
export function getDateKey(dateValue) {
  try {
    const date = convertFirebaseDate(dateValue);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Obtient une clé de minute pour le groupement (YYYY-MM-DDTHH:MM)
 * @param {any} dateValue - La valeur de date
 * @returns {string} Clé de minute ou minute actuelle
 */
export function getMinuteKey(dateValue) {
  try {
    const date = convertFirebaseDate(dateValue);
    return date.toISOString().substring(0, 16);
  } catch (error) {
    return new Date().toISOString().substring(0, 16);
  }
}

/**
 * Rend une valeur sûre pour l'affichage dans React
 * Convertit les objets Firebase Timestamp et autres objets en strings
 * @param {any} value - La valeur à rendre sûre
 * @param {string} fallback - Valeur par défaut
 * @returns {string} Valeur sûre pour l'affichage
 */
export function makeSafeForDisplay(value, fallback = '') {
  // Null ou undefined
  if (value == null) {
    return fallback;
  }
  
  // String ou nombre - déjà sûr
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  
  // Boolean
  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
  }
  
  // Timestamp Firebase
  if (value?.toDate || value?.seconds !== undefined) {
    return formatDateSafely(value);
  }
  
  // Array
  if (Array.isArray(value)) {
    return value.map(v => makeSafeForDisplay(v)).join(', ');
  }
  
  // Objet
  if (typeof value === 'object') {
    // Essayer de convertir en string JSON si petit objet
    try {
      const keys = Object.keys(value);
      if (keys.length <= 3) {
        return keys.map(k => `${k}: ${makeSafeForDisplay(value[k])}`).join(', ');
      }
      return '[Objet]';
    } catch {
      return '[Objet]';
    }
  }
  
  return fallback;
}