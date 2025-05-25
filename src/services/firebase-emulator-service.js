/**
 * Service Firebase Émulateur utilisant Firebase Testing SDK
 * Remplace mockStorage.js avec une solution professionnelle
 * Phase 3 de la simplification Firebase
 */

import { 
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';

// Configuration de l'émulateur Firestore
const EMULATOR_CONFIG = {
  projectId: 'tourcraft-test-project',
  firestore: {
    host: 'localhost',
    port: 8080
  }
};

// Instance de l'environnement de test
let testEnv = null;
let testDb = null;

/**
 * Initialise l'environnement de test Firebase
 */
const initializeEmulator = async () => {
  if (testEnv) return testEnv;

  try {
    testEnv = await initializeTestEnvironment(EMULATOR_CONFIG);
    
    // Obtenir une instance de base de données pour l'utilisateur local
    testDb = testEnv.unauthenticatedContext().firestore();
    
    console.log('🔥 Firebase Testing SDK initialisé avec succès');
    return testEnv;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de l\'émulateur:', error);
    throw error;
  }
};

/**
 * Nettoie l'environnement de test
 */
const cleanupEmulator = async () => {
  if (testEnv) {
    await testEnv.cleanup();
    testEnv = null;
    testDb = null;
  }
};

/**
 * Réinitialise les données de l'émulateur
 */
const clearEmulatorData = async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
};

/**
 * Obtient une référence à une collection
 */
const collection = (collectionName) => {
  if (!testDb) {
    throw new Error('Émulateur non initialisé. Appelez initializeEmulator() d\'abord.');
  }
  return testDb.collection(collectionName);
};

/**
 * Obtient une référence à un document
 */
const doc = (collectionName, docId) => {
  if (!testDb) {
    throw new Error('Émulateur non initialisé. Appelez initializeEmulator() d\'abord.');
  }
  return testDb.collection(collectionName).doc(docId);
};

/**
 * Récupère un document
 */
const getDoc = async (docRef) => {
  try {
    const snapshot = await docRef.get();
    return {
      exists: () => snapshot.exists,
      data: () => snapshot.data(),
      id: snapshot.id
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    throw error;
  }
};

/**
 * Récupère plusieurs documents
 */
const getDocs = async (queryOrCollectionRef) => {
  try {
    const snapshot = await queryOrCollectionRef.get();
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      data: () => doc.data(),
      exists: () => true
    }));
    
    return {
      docs,
      empty: docs.length === 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
};

/**
 * Définit un document
 */
const setDoc = async (docRef, data, options = {}) => {
  try {
    const docData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    if (!options.merge) {
      docData.createdAt = data.createdAt || new Date().toISOString();
    }
    
    await docRef.set(docData, options);
    return { id: docRef.id };
  } catch (error) {
    console.error('Erreur lors de la définition du document:', error);
    throw error;
  }
};

/**
 * Ajoute un document
 */
const addDoc = async (collectionRef, data) => {
  try {
    const docData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await collectionRef.add(docData);
    return {
      id: docRef.id,
      get: async () => ({
        exists: () => true,
        data: () => docData,
        id: docRef.id
      })
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document:', error);
    throw error;
  }
};

/**
 * Met à jour un document
 */
const updateDoc = async (docRef, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await docRef.update(updateData);
    return { id: docRef.id };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    throw error;
  }
};

/**
 * Supprime un document
 */
const deleteDoc = async (docRef) => {
  try {
    await docRef.delete();
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    throw error;
  }
};

/**
 * Crée une requête where
 */
const where = (field, operator, value) => {
  // Firebase Testing SDK utilise la même API que Firestore
  return { field, operator, value };
};

/**
 * Crée une requête orderBy
 */
const orderBy = (field, direction = 'asc') => {
  return { field, direction };
};

/**
 * Limite le nombre de résultats
 */
const limit = (limitCount) => {
  return { limitCount };
};

/**
 * Timestamp serveur
 */
const serverTimestamp = () => new Date().toISOString();

/**
 * Union de tableau
 */
const arrayUnion = (...items) => ({
  _type: 'arrayUnion',
  _elements: items
});

/**
 * Suppression de tableau
 */
const arrayRemove = (...items) => ({
  _type: 'arrayRemove',
  _elements: items
});

/**
 * Classe Timestamp
 */
const Timestamp = {
  now: () => new Date(),
  fromDate: (date) => date,
  fromMillis: (millis) => new Date(millis)
};

/**
 * Écoute des changements de document (mock)
 */
const onSnapshot = (docRef, callback) => {
  console.log('Mock onSnapshot appelé pour', docRef.path);
  
  // Simulation d'un snapshot initial
  setTimeout(async () => {
    try {
      const snapshot = await getDoc(docRef);
      callback(snapshot);
    } catch (error) {
      console.error('Erreur dans mock onSnapshot:', error);
      callback({
        exists: () => false,
        data: () => null,
        id: docRef.id
      });
    }
  }, 100);
  
  // Retourne une fonction de nettoyage
  return () => console.log('Mock onSnapshot unsubscribe');
};

/**
 * Compte les documents (mock)
 */
const getCountFromServer = async (query) => {
  try {
    const snapshot = await getDocs(query);
    return {
      data: () => ({ count: snapshot.docs.length })
    };
  } catch (error) {
    console.error('Erreur lors du comptage:', error);
    return {
      data: () => ({ count: 0 })
    };
  }
};

/**
 * 🚀 NOUVEAU : Fonctions de compatibilité pour remplacer mockStorage
 * Utilisées par syncService.js pour l'import/export de données
 */

/**
 * Récupère toutes les données de l'émulateur (équivalent _getRawLocalData)
 */
const _getRawLocalData = async () => {
  if (!testDb) {
    console.warn('Émulateur non initialisé, retour de données vides');
    return {};
  }

  const collections = ['concerts', 'lieux', 'programmateurs', 'artistes', 'structures', 'forms'];
  const rawData = {};

  try {
    for (const collName of collections) {
      rawData[collName] = {};
      const collRef = collection(collName);
      const snapshot = await getDocs(collRef);
      
      snapshot.docs.forEach(doc => {
        rawData[collName][doc.id] = doc.data();
      });
    }
    
    console.log('📊 Données émulateur récupérées:', Object.keys(rawData).map(k => `${k}: ${Object.keys(rawData[k]).length} docs`));
    return rawData;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données émulateur:', error);
    return {};
  }
};

/**
 * Importe des données dans l'émulateur (équivalent _importRawData)
 */
const _importRawData = async (data) => {
  if (!testDb) {
    console.warn('Émulateur non initialisé, import impossible');
    return false;
  }

  try {
    let importCount = 0;
    
    for (const [collName, documents] of Object.entries(data)) {
      if (typeof documents === 'object' && documents !== null) {
        for (const [docId, docData] of Object.entries(documents)) {
          const docRef = doc(collName, docId);
          await setDoc(docRef, docData, { merge: true });
          importCount++;
        }
      }
    }
    
    console.log(`📥 Import émulateur terminé: ${importCount} documents importés`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'import dans l\'émulateur:', error);
    return false;
  }
};

// Export des fonctions principales
export {
  // Gestion de l'émulateur
  initializeEmulator,
  cleanupEmulator,
  clearEmulatorData,
  
  // Fonctions Firestore
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  
  // Requêtes
  where,
  orderBy,
  limit,
  
  // Utilitaires
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot,
  getCountFromServer,
  
  // 🚀 NOUVEAU : Fonctions de compatibilité mockStorage
  _getRawLocalData,
  _importRawData
};

// Export par défaut pour compatibilité
const firebaseEmulatorService = {
  initializeEmulator,
  cleanupEmulator,
  clearEmulatorData,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot,
  getCountFromServer,
  // 🚀 NOUVEAU : Fonctions de compatibilité mockStorage
  _getRawLocalData,
  _importRawData
};

export default firebaseEmulatorService; 