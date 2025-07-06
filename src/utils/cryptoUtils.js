/**
 * Utilitaires de cryptographie pour sécuriser les clés sensibles
 */

// Clé de chiffrement simple (en production, utiliser une vraie clé sécurisée)
const ENCRYPTION_KEY = 'TourCraft2024SecretKey';

/**
 * Encode une chaîne en base64
 * @param {string} str - La chaîne à encoder
 * @returns {string} La chaîne encodée en base64
 */
export function encodeBase64(str) {
  try {
    return btoa(str);
  } catch (error) {
    console.error('Erreur lors de l\'encodage base64:', error);
    return str;
  }
}

/**
 * Décode une chaîne depuis base64
 * @param {string} str - La chaîne encodée en base64
 * @returns {string} La chaîne décodée
 */
export function decodeBase64(str) {
  try {
    return atob(str);
  } catch (error) {
    console.error('Erreur lors du décodage base64:', error);
    return str;
  }
}

/**
 * Masque une clé API pour l'affichage
 * @param {string} key - La clé à masquer
 * @returns {string} La clé masquée
 */
export function maskApiKey(key) {
  if (!key || key.length < 8) return '****';
  return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}

/**
 * Vérifie si une chaîne est en base64
 * @param {string} str - La chaîne à vérifier
 * @returns {boolean} True si la chaîne est en base64
 */
export function isBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

/**
 * Chiffre les champs sensibles d'un objet
 * @param {Object} data - L'objet contenant les données
 * @param {Array<string>} fields - Les champs à chiffrer
 * @returns {Object} L'objet avec les champs chiffrés
 */
export function encryptSensitiveFields(data, fields = ['apiKey']) {
  const encrypted = { ...data };
  fields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encodeBase64(encrypted[field]);
    }
  });
  return encrypted;
}

/**
 * Déchiffre les champs sensibles d'un objet
 * @param {Object} data - L'objet contenant les données chiffrées
 * @param {Array<string>} fields - Les champs à déchiffrer
 * @returns {Object} L'objet avec les champs déchiffrés
 */
export function decryptSensitiveFields(data, fields = ['apiKey']) {
  if (!data) return data;
  const decrypted = { ...data };
  fields.forEach(field => {
    if (decrypted[field] && isBase64(decrypted[field])) {
      try {
        decrypted[field] = decodeBase64(decrypted[field]);
      } catch (e) {
        console.error(`Erreur lors du déchiffrement du champ ${field}:`, e);
      }
    }
  });
  return decrypted;
}

/**
 * Génère un hash d'audit pour tracer les modifications
 * @param {string} userId - L'ID de l'utilisateur
 * @param {string} action - L'action effectuée
 * @returns {string} Le hash d'audit
 */
export function generateAuditHash(userId, action) {
  const timestamp = new Date().toISOString();
  const data = `${userId}-${action}-${timestamp}`;
  return encodeBase64(data);
}

/**
 * Génère un token sécurisé
 * @param {number} length - Longueur du token (par défaut 32)
 * @returns {string} Le token généré
 */
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
  } else {
    // Fallback pour les navigateurs qui ne supportent pas crypto
    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return token;
}