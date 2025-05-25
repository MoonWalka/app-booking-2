/**
 * Services Firebase centralisés
 * Ce fichier sert d'interface unique pour accéder aux services Firebase
 * en utilisant le Factory Pattern pour basculer entre le mode local et production
 */

import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  collection as firestoreCollection, 
  doc as firestoreDoc, 
  getDoc as firestoreGetDoc, 
  getDocs as firestoreGetDocs,
  setDoc as firestoreSetDoc, 
  addDoc as firestoreAddDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc as firestoreDeleteDoc,
  query as firestoreQuery, 
  where as firestoreWhere, 
  orderBy as firestoreOrderBy, 
  limit as firestoreLimit, 
  startAfter as firestoreStartAfter,
  serverTimestamp as firestoreServerTimestamp, 
  arrayUnion as firestoreArrayUnion, 
  arrayRemove as firestoreArrayRemove,
  onSnapshot as firestoreOnSnapshot, 
  Timestamp as FirebaseTimestamp, 
  getCountFromServer as firestoreGetCountFromServer
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';
import { isLocalMode } from './firebase-factory';

// 🎯 PHASE 3B : Migration vers Firebase Testing SDK
let emulatorService = null;
const IS_LOCAL_MODE = isLocalMode();

if (IS_LOCAL_MODE) {
  try {
    // 🚀 NOUVEAU : Import du service émulateur Firebase Testing SDK
    const firebaseEmulator = require('./firebase-emulator-service');
    emulatorService = firebaseEmulator.default;
    console.log('🔥 Firebase Testing SDK service importé avec succès');
    
    // Initialisation de l'émulateur
    if (emulatorService && emulatorService.initializeEmulator) {
      emulatorService.initializeEmulator().catch(err => {
        console.warn('⚠️ Émulateur Firebase non disponible, fallback vers mocks simples:', err.message);
      });
    }
  } catch (err) {
    console.error('❌ Erreur lors de l\'importation du service émulateur:', err);
    console.log('🔄 Fallback vers mockStorage...');
    
    // Fallback vers l'ancien système si nécessaire
    try {
      const mockStorage = require('../mockStorage');
      emulatorService = {
        collection: mockStorage.collection,
        doc: mockStorage.doc,
        getDoc: mockStorage.getDoc,
        getDocs: mockStorage.getDocs,
        setDoc: mockStorage.setDoc,
        addDoc: mockStorage.addDoc,
        updateDoc: mockStorage.updateDoc,
        deleteDoc: mockStorage.deleteDoc,
        where: mockStorage.where,
        orderBy: mockStorage.orderBy,
        limit: mockStorage.limit,
        serverTimestamp: mockStorage.serverTimestamp,
        arrayUnion: mockStorage.arrayUnion,
        arrayRemove: mockStorage.arrayRemove,
        Timestamp: mockStorage.Timestamp
      };
      console.log('📦 MockStorage fallback activé');
    } catch (fallbackErr) {
      console.error('❌ Erreur fallback mockStorage:', fallbackErr);
      emulatorService = null;
    }
  }
}

// Configuration Firebase selon le mode
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Variables pour les services Firebase ou leurs mocks
let app, db, auth, storage, remoteConfig;

// Gestion améliorée des erreurs Firestore
const handleFirestoreError = (error) => {
  console.error("Erreur Firestore:", error);
  return Promise.reject(error);
};

// Initialisation conditionnelle selon le mode
if (IS_LOCAL_MODE) {
  console.log('Mode local activé - Service Firebase utilise les mocks');
  
  // Utiliser mockStorage pour db
  db = emulatorService;
  
  // Mock de l'authentification
  auth = {
    currentUser: { uid: 'local-user', email: 'local@example.com', displayName: 'Utilisateur Local' },
    onAuthStateChanged: (callback) => {
      callback({ uid: 'local-user', email: 'local@example.com', displayName: 'Utilisateur Local' });
      return () => {}; // fonction de nettoyage
    },
    signInWithEmailAndPassword: async () => ({ 
      user: { uid: 'local-user', email: 'local@example.com', displayName: 'Utilisateur Local' }
    }),
    signOut: async () => Promise.resolve(),
    createUserWithEmailAndPassword: async () => ({
      user: { uid: 'new-local-user', email: 'new-local@example.com', displayName: 'Nouvel Utilisateur' }
    })
  };
  
  // Mock du stockage
  storage = {
    // Implémenter au besoin pour simuler le stockage
  };
  
  // Mock de remoteConfig
  remoteConfig = {
    // Implémenter au besoin
  };
} else {
  // Initialisation normale de Firebase pour la production
  app = initializeApp(firebaseConfig);
  db = initializeFirestore(app, {
    experimentalForceLongPolling: false,
    useFetchStreams: true
  });
  auth = getAuth(app);
  storage = getStorage(app);
  remoteConfig = getRemoteConfig(app);
}

// Mock pour getCountFromServer si en mode local
const mockGetCountFromServer = async (query) => {
  console.log('Mock getCountFromServer appelé');
  // Extraction du nom de la collection depuis la requête
  const collectionName = query._path?.segments?.[0] || '';
  
  // Compter manuellement le nombre d'éléments dans la collection mocquée
  let count = 0;
  try {
    if (emulatorService) {
      const mockDocs = await emulatorService.getDocs(emulatorService.collection(collectionName));
      count = mockDocs.docs?.length || 0;
    }
  } catch (e) {
    console.error('Erreur lors du comptage mock:', e);
  }
  
  return {
    data: () => ({ count })
  };
};

// Mock de onSnapshot pour le mode local
const mockOnSnapshot = (docRef, callback) => {
  console.log('Mock onSnapshot appelé pour', docRef);
  const path = typeof docRef.path === 'string' ? docRef.path : '';
  const pathParts = path.split('/');
  const collectionName = pathParts.length > 0 ? pathParts[0] : '';
  const docId = pathParts.length > 1 ? pathParts[1] : '';
  
  setTimeout(() => {
    try {
      if (emulatorService && typeof emulatorService.getDoc === 'function') {
        const mockDoc = emulatorService.doc(collectionName, docId);
        emulatorService.getDoc(mockDoc).then(snapshot => {
          callback(snapshot);
        });
      } else {
        callback({
          exists: () => false,
          data: () => null,
          id: docId
        });
      }
    } catch (e) {
      console.error('Erreur dans mock onSnapshot:', e);
      callback({
        exists: () => false,
        data: () => null,
        id: docId
      });
    }
  }, 100);
  
  return () => console.log('Mock onSnapshot unsubscribe');
};

// Surcharge des fonctions Firestore avec gestion d'erreurs
const enhancedGetDoc = async (...args) => {
  try {
    return await firestoreGetDoc(...args);
  } catch (error) {
    return handleFirestoreError(error);
  }
};

const enhancedGetDocs = async (...args) => {
  try {
    return await firestoreGetDocs(...args);
  } catch (error) {
    return handleFirestoreError(error);
  }
};

// 🎯 SIMPLIFICATION : Fonctions mock directes avec optional chaining
// Plus besoin de createSafeMockFunction et 18 proxies !
const getDirectMockFunction = (functionName) => {
  return (...args) => emulatorService?.[functionName]?.(...args) || null;
};

// Export des fonctions appropriées selon le mode
export {
  db,
  auth,
  storage,
  remoteConfig
};

// 🎯 SIMPLIFICATION : Exports directs sans proxies intermédiaires
export const collection = IS_LOCAL_MODE ? getDirectMockFunction('collection') : firestoreCollection;
export const doc = IS_LOCAL_MODE ? getDirectMockFunction('doc') : firestoreDoc;
export const getDoc = IS_LOCAL_MODE ? getDirectMockFunction('getDoc') : enhancedGetDoc;
export const getDocs = IS_LOCAL_MODE ? getDirectMockFunction('getDocs') : enhancedGetDocs;
export const setDoc = IS_LOCAL_MODE ? getDirectMockFunction('setDoc') : firestoreSetDoc;
export const addDoc = IS_LOCAL_MODE ? getDirectMockFunction('addDoc') : firestoreAddDoc;
export const updateDoc = IS_LOCAL_MODE ? getDirectMockFunction('updateDoc') : firestoreUpdateDoc;
export const deleteDoc = IS_LOCAL_MODE ? getDirectMockFunction('deleteDoc') : firestoreDeleteDoc;
export const query = IS_LOCAL_MODE ? getDirectMockFunction('query') : firestoreQuery;
export const where = IS_LOCAL_MODE ? getDirectMockFunction('where') : firestoreWhere;
export const orderBy = IS_LOCAL_MODE ? getDirectMockFunction('orderBy') : firestoreOrderBy;
export const limit = IS_LOCAL_MODE ? getDirectMockFunction('limit') : firestoreLimit;
export const startAfter = IS_LOCAL_MODE ? getDirectMockFunction('startAfter') : firestoreStartAfter;
export const serverTimestamp = IS_LOCAL_MODE ? getDirectMockFunction('serverTimestamp') : firestoreServerTimestamp;
export const arrayUnion = IS_LOCAL_MODE ? getDirectMockFunction('arrayUnion') : firestoreArrayUnion;
export const arrayRemove = IS_LOCAL_MODE ? getDirectMockFunction('arrayRemove') : firestoreArrayRemove;
export const Timestamp = IS_LOCAL_MODE ? getDirectMockFunction('Timestamp') : FirebaseTimestamp;
export const onSnapshot = IS_LOCAL_MODE ? mockOnSnapshot : firestoreOnSnapshot;
export const getCountFromServer = IS_LOCAL_MODE ? mockGetCountFromServer : firestoreGetCountFromServer;

// Fonctions Auth
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };

// Fonctions Storage
export { storageRef as ref, uploadBytes, getDownloadURL };

// Indicateur de mode
export const MODE_LOCAL = IS_LOCAL_MODE;