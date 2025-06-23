/**
 * Utilitaires pour la conversion des données Firebase
 */

/**
 * Convertit récursivement les Timestamps Firebase en dates JavaScript
 * @param {Object} data - Les données à convertir
 * @returns {Object} - Les données avec les timestamps convertis
 */
export const convertFirebaseTimestamps = (data) => {
  if (!data) return data;
  
  // Si c'est une Date JavaScript, la garder telle quelle
  if (data instanceof Date) {
    return data;
  }
  
  // Si c'est un Timestamp Firebase
  if (data && typeof data === 'object' && data.toDate && typeof data.toDate === 'function') {
    return data.toDate();
  }
  
  // Si c'est un tableau
  if (Array.isArray(data)) {
    return data.map(item => convertFirebaseTimestamps(item));
  }
  
  // Si c'est un objet
  if (typeof data === 'object' && data !== null) {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertFirebaseTimestamps(value);
    }
    return converted;
  }
  
  // Sinon, retourner tel quel
  return data;
};

/**
 * Prépare les données pour la validation en convertissant les timestamps
 * et en nettoyant les valeurs undefined
 * @param {Object} data - Les données à préparer
 * @returns {Object} - Les données préparées
 */
export const prepareDataForValidation = (data) => {
  if (!data) return data;
  
  // Convertir les timestamps
  const converted = convertFirebaseTimestamps(data);
  
  // Nettoyer les undefined (ils peuvent causer des problèmes avec Yup)
  const cleaned = Object.entries(converted).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  // Traitement spécial pour periodeActivite si elle existe
  if (cleaned.periodeActivite && typeof cleaned.periodeActivite === 'object') {
    // S'assurer que les dates dans periodeActivite sont bien converties
    cleaned.periodeActivite = convertFirebaseTimestamps(cleaned.periodeActivite);
  }
  
  // Traitement spécial pour les commentaires
  if (cleaned.commentaires && Array.isArray(cleaned.commentaires)) {
    cleaned.commentaires = cleaned.commentaires.map(comment => {
      // S'assurer que la date est bien une Date JavaScript
      if (comment.date && !(comment.date instanceof Date)) {
        // Si c'est un timestamp Firebase
        if (comment.date.toDate && typeof comment.date.toDate === 'function') {
          comment.date = comment.date.toDate();
        } else if (typeof comment.date === 'string') {
          // Si c'est une string, la convertir en Date
          comment.date = new Date(comment.date);
        }
      }
      return comment;
    });
  }
  
  return cleaned;
};

/**
 * Prépare les données pour Firestore en supprimant les undefined
 * @param {Object} data - Les données à préparer
 * @returns {Object} - Les données nettoyées
 */
export const prepareDataForFirestore = (data) => {
  if (!data) return data;
  
  const cleaned = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue; // Skip undefined values
    }
    
    if (value === null) {
      cleaned[key] = null; // Keep null values
    } else if (value instanceof Date) {
      // Garder les dates JavaScript telles quelles - Firebase les convertira automatiquement
      cleaned[key] = value;
    } else if (Array.isArray(value)) {
      // Nettoyer récursivement les tableaux
      cleaned[key] = value.map(item => {
        if (item instanceof Date) {
          // Préserver les dates dans les tableaux
          return item;
        } else if (typeof item === 'object' && item !== null) {
          return prepareDataForFirestore(item);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      // Recursively clean nested objects
      cleaned[key] = prepareDataForFirestore(value);
    } else {
      cleaned[key] = value; // Keep primitive values
    }
  }
  
  return cleaned;
};