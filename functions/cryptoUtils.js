/**
 * Utilitaires de chiffrement pour les Cloud Functions
 * Déchiffre les données sensibles stockées dans Firestore
 */

const CryptoJS = require('crypto-js');

/**
 * Génère une clé de chiffrement basée sur l'UID utilisateur
 * @param {string} userId - UID de l'utilisateur
 * @returns {string} - Clé de chiffrement
 */
const getEncryptionKey = (userId) => {
  if (!userId) {
    throw new Error('UID utilisateur requis pour le déchiffrement');
  }

  // Clé secrète de l'application (utiliser les variables d'environnement en production)
  const APP_SECRET = process.env.ENCRYPTION_SECRET || 'TC_2025_SECURE_KEY_BREVO';
  
  // Combiner l'UID utilisateur avec la clé secrète
  const combinedKey = `${userId}_${APP_SECRET}`;
  
  // Hasher la clé combinée pour obtenir une clé de chiffrement fixe
  return CryptoJS.SHA256(combinedKey).toString();
};

/**
 * Déchiffre une chaîne de caractères
 * @param {string} encryptedData - Données chiffrées
 * @param {string} userId - UID de l'utilisateur
 * @returns {string} - Données déchiffrées
 */
const decryptData = (encryptedData, userId) => {
  if (!encryptedData || typeof encryptedData !== 'string') {
    return encryptedData;
  }

  // Vérifier si les données sont effectivement chiffrées
  if (!encryptedData.startsWith('ENC:')) {
    return encryptedData; // Données non chiffrées, retourner tel quel
  }

  try {
    const encryptionKey = getEncryptionKey(userId);
    const dataToDecrypt = encryptedData.substring(4); // Enlever le préfixe "ENC:"
    
    const bytes = CryptoJS.AES.decrypt(dataToDecrypt, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Déchiffrement échoué - clé invalide');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Erreur lors du déchiffrement côté serveur:', error);
    throw new Error('Impossible de déchiffrer les données sensibles');
  }
};

/**
 * Déchiffre un objet contenant des données sensibles
 * @param {Object} data - Objet à déchiffrer partiellement
 * @param {string} userId - UID de l'utilisateur
 * @param {Array} sensitiveFields - Liste des champs à déchiffrer
 * @returns {Object} - Objet avec champs sensibles déchiffrés
 */
const decryptSensitiveFields = (data, userId, sensitiveFields = ['apiKey', 'password', 'pass', 'secret']) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const result = { ...data };
  
  sensitiveFields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decryptData(result[field], userId);
    }
  });
  
  return result;
};

/**
 * Déchiffre spécifiquement une clé API Brevo
 * @param {string} encryptedApiKey - Clé API chiffrée
 * @param {string} userId - UID de l'utilisateur
 * @returns {string} - Clé API déchiffrée
 */
const decryptBrevoApiKey = (encryptedApiKey, userId) => {
  const decrypted = decryptData(encryptedApiKey, userId);
  
  // Validation du format de clé API Brevo après déchiffrement
  if (decrypted && !decrypted.startsWith('xkeysib-')) {
    console.warn('Format de clé API Brevo potentiellement invalide après déchiffrement');
  }
  
  return decrypted;
};

/**
 * Vérifie si une chaîne est chiffrée
 * @param {string} data - Données à vérifier
 * @returns {boolean} - True si chiffrée
 */
const isEncrypted = (data) => {
  return typeof data === 'string' && data.startsWith('ENC:');
};

/**
 * Génère un hash sécurisé pour audit/logging (sans révéler la clé)
 * @param {string} data - Données à hasher
 * @returns {string} - Hash pour audit
 */
const generateAuditHash = (data) => {
  if (!data) return '';
  
  // Générer un hash court pour identifier la clé sans la révéler
  return CryptoJS.SHA256(data).toString().substring(0, 8);
};

module.exports = {
  decryptData,
  decryptSensitiveFields,
  decryptBrevoApiKey,
  isEncrypted,
  generateAuditHash
};