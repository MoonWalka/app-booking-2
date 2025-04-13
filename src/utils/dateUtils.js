// Utilitaires pour la manipulation des dates

/**
 * Formate une date au format YYYY-MM-DD en format lisible DD/MM/YYYY
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {string} Date au format DD/MM/YYYY
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Si la date n'est pas valide, retourner la chaîne originale
      return dateString;
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return dateString;
  }
};

/**
 * Convertit une date au format DD/MM/YYYY en format YYYY-MM-DD
 * @param {string} dateString - Date au format DD/MM/YYYY
 * @returns {string} Date au format YYYY-MM-DD
 */
export const parseDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    // Si la date est déjà au format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Si la date est au format DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      
      return `${year}-${month}-${day}`;
    }
    
    return dateString;
  } catch (error) {
    console.error('Erreur lors du parsing de la date:', error);
    return dateString;
  }
};

/**
 * Vérifie si une date est dans le futur
 * @param {string} dateString - Date au format YYYY-MM-DD
 * @returns {boolean} true si la date est dans le futur, false sinon
 */
export const isFutureDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date > today;
  } catch (error) {
    console.error('Erreur lors de la vérification de la date future:', error);
    return false;
  }
};

/**
 * Calcule la différence en jours entre deux dates
 * @param {string} dateString1 - Première date au format YYYY-MM-DD
 * @param {string} dateString2 - Deuxième date au format YYYY-MM-DD
 * @returns {number} Nombre de jours entre les deux dates
 */
export const daysBetween = (dateString1, dateString2) => {
  if (!dateString1 || !dateString2) return 0;
  
  try {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Erreur lors du calcul des jours entre deux dates:', error);
    return 0;
  }
};
