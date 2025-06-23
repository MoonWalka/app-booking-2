/**
 * Utilitaires de chiffrement pour les données sensibles
 * Chiffre les clés API et autres données sensibles avant stockage
 */

import CryptoJS from 'crypto-js';
import { auth } from '@/services/firebase-service';

/**
 * Génère une clé de chiffrement unique basée sur l'utilisateur
 * Utilise l'UID utilisateur + une clé secrète de l'application
 * @returns {string} - Clé de chiffrement
 */
const getEncryptionKey = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Utilisateur non authentifié pour le chiffrement');
  }

  // Clé secrète de l'application (à déplacer en variable d'environnement en production)
  const APP_SECRET = process.env.REACT_APP_ENCRYPTION_SECRET || 'TC_2025_SECURE_KEY_BREVO';
  
  // Combiner l'UID utilisateur avec la clé secrète pour une clé unique par utilisateur
  const combinedKey = `${user.uid}_${APP_SECRET}`;
  
  // Hasher la clé combinée pour obtenir une clé de chiffrement fixe mais sécurisée
  return CryptoJS.SHA256(combinedKey).toString();
};

/**
 * Chiffre une chaîne de caractères (ex: clé API)
 * @param {string} data - Données à chiffrer
 * @returns {string} - Données chiffrées en base64
 */
export const encryptData = (data) => {
  if (!data || typeof data !== 'string') {
    return data; // Retourner tel quel si pas de données ou type invalide
  }

  try {
    const encryptionKey = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(data, encryptionKey).toString();
    
    // Préfixer avec un marqueur pour identifier les données chiffrées
    return `ENC:${encrypted}`;
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    // En cas d'erreur, retourner les données non chiffrées (fallback)
    return data;
  }
};

/**
 * Déchiffre une chaîne de caractères
 * @param {string} encryptedData - Données chiffrées
 * @returns {string} - Données déchiffrées
 */
export const decryptData = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== 'string') {
    return encryptedData;
  }

  // Vérifier si les données sont effectivement chiffrées
  if (!encryptedData.startsWith('ENC:')) {
    return encryptedData; // Données non chiffrées, retourner tel quel
  }

  try {
    const encryptionKey = getEncryptionKey();
    const dataToDecrypt = encryptedData.substring(4); // Enlever le préfixe "ENC:"
    
    const bytes = CryptoJS.AES.decrypt(dataToDecrypt, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Déchiffrement échoué - clé invalide');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    // En cas d'erreur, retourner les données chiffrées (l'utilisateur verra que c'est corrompu)
    return encryptedData;
  }
};

/**
 * Chiffre spécifiquement une clé API Brevo
 * @param {string} apiKey - Clé API à chiffrer
 * @returns {string} - Clé API chiffrée
 */
export const encryptBrevoApiKey = (apiKey) => {
  if (!apiKey) return apiKey;
  
  // Validation du format de clé API Brevo
  if (!apiKey.startsWith('xkeysib-')) {
    console.warn('Format de clé API Brevo potentiellement invalide');
  }
  
  return encryptData(apiKey);
};

/**
 * Déchiffre spécifiquement une clé API Brevo
 * @param {string} encryptedApiKey - Clé API chiffrée
 * @returns {string} - Clé API déchiffrée
 */
export const decryptBrevoApiKey = (encryptedApiKey) => {
  return decryptData(encryptedApiKey);
};

/**
 * Chiffre un objet contenant des données sensibles
 * @param {Object} data - Objet à chiffrer partiellement
 * @param {Array} sensitiveFields - Liste des champs à chiffrer
 * @returns {Object} - Objet avec champs sensibles chiffrés
 */
export const encryptSensitiveFields = (data, sensitiveFields = ['apiKey', 'password', 'pass', 'secret']) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const result = { ...data };
  
  sensitiveFields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encryptData(result[field]);
    }
  });
  
  return result;
};

/**
 * Déchiffre un objet contenant des données sensibles
 * @param {Object} data - Objet à déchiffrer partiellement
 * @param {Array} sensitiveFields - Liste des champs à déchiffrer
 * @returns {Object} - Objet avec champs sensibles déchiffrés
 */
export const decryptSensitiveFields = (data, sensitiveFields = ['apiKey', 'password', 'pass', 'secret']) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const result = { ...data };
  
  sensitiveFields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = decryptData(result[field]);
    }
  });
  
  return result;
};

/**
 * Vérifie si une chaîne est chiffrée
 * @param {string} data - Données à vérifier
 * @returns {boolean} - True si chiffrée
 */
export const isEncrypted = (data) => {
  return typeof data === 'string' && data.startsWith('ENC:');
};

/**
 * Génère un hash sécurisé pour audit/logging (sans révéler la clé)
 * @param {string} data - Données à hasher
 * @returns {string} - Hash pour audit
 */
export const generateAuditHash = (data) => {
  if (!data) return '';
  
  // Générer un hash court pour identifier la clé sans la révéler
  return CryptoJS.SHA256(data).toString().substring(0, 8);
};

/**
 * Valide l'intégrité d'une clé API chiffrée
 * @param {string} encryptedApiKey - Clé API chiffrée
 * @returns {boolean} - True si l'intégrité est valide
 */
export const validateEncryptedApiKey = (encryptedApiKey) => {
  try {
    if (!isEncrypted(encryptedApiKey)) {
      return true; // Non chiffrée, on assume qu'elle est valide
    }
    
    const decrypted = decryptData(encryptedApiKey);
    return decrypted && decrypted !== encryptedApiKey && decrypted.length > 10;
  } catch (error) {
    console.error('Validation intégrité clé API échouée:', error);
    return false;
  }
};

/**
 * Génère un token sécurisé pour les URLs
 * @param {number} length - Longueur du token (par défaut 32)
 * @returns {string} - Token sécurisé
 */
export const generateSecureToken = (length = 32) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let token = '';
  
  // Utiliser crypto.getRandomValues pour une génération sécurisée
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  
  for (let i = 0; i < length; i++) {
    token += charset[values[i] % charset.length];
  }
  
  return token;
};