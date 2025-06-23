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
    } else if (Array.isArray(value)) {
      cleaned[key] = value; // Keep arrays as is
    } else if (typeof value === 'object' && value !== null) {
      // Recursively clean nested objects
      cleaned[key] = prepareDataForFirestore(value);
    } else {
      cleaned[key] = value; // Keep primitive values
    }
  }
  
  return cleaned;
};