import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, arrayUnion, arrayRemove,
  initializeFirestore, connectFirestoreEmulator,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Configuration avancée de Firestore pour résoudre les problèmes de connexion
// Utilisation forcée du long polling au lieu des WebSockets
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true, // Force l'utilisation du long polling
  experimentalAutoDetectLongPolling: false, // Désactive la détection automatique
  useFetchStreams: false, // Désactive les flux fetch qui peuvent causer des problèmes
  ignoreUndefinedProperties: true,
  timeout: 60000, // Timeout plus long pour les requêtes (60 secondes)
});

// Fonctions de gestion d'erreurs pour les opérations Firestore
const handleFirestoreError = (error) => {
  console.error("Erreur Firestore:", error);
  
  // Si l'erreur est liée à la connexion
  if (error.code === 'unavailable' || error.code === 'failed-precondition') {
    console.warn("Problème de connexion Firestore détecté. Tentative de reconnexion...");
    // N'affecte pas l'expérience utilisateur, juste un log
  }
  
  return Promise.reject(error); // Propage l'erreur
};

// Surcharge des fonctions Firestore avec gestion d'erreurs
const enhancedGetDocs = async (...args) => {
  try {
    return await getDocs(...args);
  } catch (error) {
    return handleFirestoreError(error);
  }
};

const enhancedGetDoc = async (...args) => {
  try {
    return await getDoc(...args);
  } catch (error) {
    return handleFirestoreError(error);
  }
};

// Même principe pour les autres fonctions Firestore que vous utilisez fréquemment

const auth = getAuth(app);
const storage = getStorage(app);
const remoteConfig = getRemoteConfig(app);

// Configuration du bypass d'authentification pour le développement
const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Utilisation de l'émulateur Firebase en développement
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connecté à l\'émulateur Firestore');
  } catch (e) {
    console.warn('Erreur lors de la connexion à l\'émulateur Firestore:', e);
  }
}

// Création d'un objet firebase avec toutes les fonctions et instances
const firebase = {
  app,
  db,
  auth,
  storage,
  remoteConfig,
  BYPASS_AUTH,
  // Fonctions Firestore avec gestion d'erreurs améliorée
  collection,
  doc,
  getDoc: enhancedGetDoc,
  getDocs: enhancedGetDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  // Fonctions Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  // Fonctions Storage
  storageRef,
  uploadBytes,
  getDownloadURL
};

// Export des éléments individuels
export {
  db,
  auth,
  storage,
  remoteConfig,
  BYPASS_AUTH,
  // Firestore exports
  collection,
  doc,
  enhancedGetDoc as getDoc,
  enhancedGetDocs as getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  // Auth exports
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// Storage exports
export { storageRef as ref, uploadBytes, getDownloadURL };

// Export par défaut de l'objet firebase
export default firebase;
