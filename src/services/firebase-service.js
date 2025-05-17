/**
 * Services Firebase centralisés
 * Ce fichier sert d'interface unique pour accéder aux services Firebase
 * en utilisant le Factory Pattern pour basculer entre le mode local et production
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, initializeFirestore, 
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

// Importation conditionnelle pour éviter les dépendances circulaires
let mockDB = null;

// Déterminer le mode d'exécution
const IS_LOCAL_MODE = isLocalMode();

// Si nous sommes en mode local, importer dynamiquement le mockStorage
if (IS_LOCAL_MODE) {
  // Import dynamique sans créer de dépendance circulaire
  import('../mockStorage').then(module => {
    mockDB = module.localDB;
    console.log('MockStorage importé avec succès');
  }).catch(err => {
    console.error('Erreur lors de l\'importation de mockStorage:', err);
  });
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
  db = mockDB;
  
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
    if (mockDB) {
      const mockDocs = await mockDB.getDocs(mockDB.collection(collectionName));
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
      if (mockDB && typeof mockDB.getDoc === 'function') {
        const mockDoc = mockDB.doc(collectionName, docId);
        mockDB.getDoc(mockDoc).then(snapshot => {
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

// Fonctions de proxy qui vérifient la disponibilité de mockDB au moment de l'appel
// Cela évite les problèmes d'initialisation avec les imports circulaires
const createSafeMockFunction = (functionName) => {
  return (...args) => {
    if (!mockDB) {
      console.warn(`Attention: mockDB n'est pas encore initialisé lors de l'appel à ${functionName}`);
      return null;
    }
    return mockDB[functionName](...args);
  };
};

// Création de proxies sécurisés pour toutes les fonctions mockDB
const safeMockCollection = createSafeMockFunction('collection');
const safeMockDoc = createSafeMockFunction('doc');
const safeMockGetDoc = createSafeMockFunction('getDoc');
const safeMockGetDocs = createSafeMockFunction('getDocs');
const safeMockSetDoc = createSafeMockFunction('setDoc');
const safeMockAddDoc = createSafeMockFunction('addDoc');
const safeMockUpdateDoc = createSafeMockFunction('updateDoc');
const safeMockDeleteDoc = createSafeMockFunction('deleteDoc');
const safeMockQuery = createSafeMockFunction('query');
const safeMockWhere = createSafeMockFunction('where');
const safeMockOrderBy = createSafeMockFunction('orderBy');
const safeMockLimit = createSafeMockFunction('limit');
const safeMockStartAfter = createSafeMockFunction('startAfter');
const safeMockServerTimestamp = createSafeMockFunction('serverTimestamp');
const safeMockTimestamp = createSafeMockFunction('Timestamp');
const safeMockArrayUnion = createSafeMockFunction('arrayUnion');
const safeMockArrayRemove = createSafeMockFunction('arrayRemove');

// Export des fonctions appropriées selon le mode
export {
  db,
  auth,
  storage,
  remoteConfig
};

// Exporter les fonctions Firestore avec la bonne implémentation selon le mode
export const collection = IS_LOCAL_MODE ? safeMockCollection : firestoreCollection;
export const doc = IS_LOCAL_MODE ? safeMockDoc : firestoreDoc;
export const getDoc = IS_LOCAL_MODE ? safeMockGetDoc : enhancedGetDoc;
export const getDocs = IS_LOCAL_MODE ? safeMockGetDocs : enhancedGetDocs;
export const setDoc = IS_LOCAL_MODE ? safeMockSetDoc : firestoreSetDoc;
export const addDoc = IS_LOCAL_MODE ? safeMockAddDoc : firestoreAddDoc;
export const updateDoc = IS_LOCAL_MODE ? safeMockUpdateDoc : firestoreUpdateDoc;
export const deleteDoc = IS_LOCAL_MODE ? safeMockDeleteDoc : firestoreDeleteDoc;
export const query = IS_LOCAL_MODE ? safeMockQuery : firestoreQuery;
export const where = IS_LOCAL_MODE ? safeMockWhere : firestoreWhere;
export const orderBy = IS_LOCAL_MODE ? safeMockOrderBy : firestoreOrderBy;
export const limit = IS_LOCAL_MODE ? safeMockLimit : firestoreLimit;
export const startAfter = IS_LOCAL_MODE ? safeMockStartAfter : firestoreStartAfter;
export const serverTimestamp = IS_LOCAL_MODE ? safeMockServerTimestamp : firestoreServerTimestamp;
export const arrayUnion = IS_LOCAL_MODE ? safeMockArrayUnion : firestoreArrayUnion;
export const arrayRemove = IS_LOCAL_MODE ? safeMockArrayRemove : firestoreArrayRemove;
export const Timestamp = IS_LOCAL_MODE ? safeMockTimestamp : FirebaseTimestamp;
export const onSnapshot = IS_LOCAL_MODE ? mockOnSnapshot : firestoreOnSnapshot;
export const getCountFromServer = IS_LOCAL_MODE ? mockGetCountFromServer : firestoreGetCountFromServer;

// Fonctions Auth
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };

// Fonctions Storage
export { storageRef as ref, uploadBytes, getDownloadURL };

// Indicateur de mode
export const MODE_LOCAL = IS_LOCAL_MODE;

// Export d'un objet avec toutes les fonctionnalités
export default {
  db,
  auth,
  storage,
  remoteConfig,
  collection: IS_LOCAL_MODE ? safeMockCollection : firestoreCollection,
  doc: IS_LOCAL_MODE ? safeMockDoc : firestoreDoc,
  getDoc: IS_LOCAL_MODE ? safeMockGetDoc : enhancedGetDoc,
  getDocs: IS_LOCAL_MODE ? safeMockGetDocs : enhancedGetDocs,
  setDoc: IS_LOCAL_MODE ? safeMockSetDoc : firestoreSetDoc,
  addDoc: IS_LOCAL_MODE ? safeMockAddDoc : firestoreAddDoc,
  updateDoc: IS_LOCAL_MODE ? safeMockUpdateDoc : firestoreUpdateDoc,
  deleteDoc: IS_LOCAL_MODE ? safeMockDeleteDoc : firestoreDeleteDoc,
  query: IS_LOCAL_MODE ? safeMockQuery : firestoreQuery,
  where: IS_LOCAL_MODE ? safeMockWhere : firestoreWhere,
  orderBy: IS_LOCAL_MODE ? safeMockOrderBy : firestoreOrderBy,
  limit: IS_LOCAL_MODE ? safeMockLimit : firestoreLimit,
  startAfter: IS_LOCAL_MODE ? safeMockStartAfter : firestoreStartAfter,
  serverTimestamp: IS_LOCAL_MODE ? safeMockServerTimestamp : firestoreServerTimestamp,
  arrayUnion: IS_LOCAL_MODE ? safeMockArrayUnion : firestoreArrayUnion,
  arrayRemove: IS_LOCAL_MODE ? safeMockArrayRemove : firestoreArrayRemove,
  Timestamp: IS_LOCAL_MODE ? safeMockTimestamp : FirebaseTimestamp,
  onSnapshot: IS_LOCAL_MODE ? mockOnSnapshot : firestoreOnSnapshot,
  getCountFromServer: IS_LOCAL_MODE ? mockGetCountFromServer : firestoreGetCountFromServer,
  ref: storageRef,
  uploadBytes,
  getDownloadURL,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  MODE_LOCAL: IS_LOCAL_MODE
};