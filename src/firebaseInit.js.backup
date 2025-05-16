import { initializeApp } from 'firebase/app';
import { 
  getFirestore, initializeFirestore, collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, arrayUnion, arrayRemove,
  connectFirestoreEmulator,
  CACHE_SIZE_UNLIMITED,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, signInAnonymously
} from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getRemoteConfig } from 'firebase/remote-config';
import { localDB } from './mockStorage';

// Détecter le mode d'exécution
const MODE = process.env.REACT_APP_MODE || 'production';
const IS_LOCAL_MODE = MODE === 'local';

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

// Variables pour les services Firebase ou leurs mocks
let app, db, auth, storage, remoteConfig;

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

// Initialisation conditionnelle selon le mode
if (IS_LOCAL_MODE) {
  console.log('Mode local activé - Utilisation de la base de données locale');
  db = localDB;
  
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

// Configuration du bypass d'authentification pour le développement
const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Création d'un objet firebase avec toutes les fonctions et instances,
// en utilisant les mocks ou les vrais services selon le mode
const firebase = {
  app,
  db,
  auth,
  storage,
  remoteConfig,
  BYPASS_AUTH,
  IS_LOCAL_MODE,
  // Fonctions Firestore avec gestion d'erreurs améliorée ou mocks
  collection: IS_LOCAL_MODE ? localDB.collection : collection,
  doc: IS_LOCAL_MODE ? localDB.doc : doc,
  getDoc: IS_LOCAL_MODE ? localDB.getDoc : enhancedGetDoc,
  getDocs: IS_LOCAL_MODE ? localDB.getDocs : enhancedGetDocs,
  setDoc: IS_LOCAL_MODE ? localDB.setDoc : setDoc,
  addDoc: IS_LOCAL_MODE ? localDB.addDoc : addDoc,
  updateDoc: IS_LOCAL_MODE ? localDB.updateDoc : updateDoc,
  deleteDoc: IS_LOCAL_MODE ? localDB.deleteDoc : deleteDoc,
  query: IS_LOCAL_MODE ? localDB.query : query,
  where: IS_LOCAL_MODE ? localDB.where : where,
  orderBy: IS_LOCAL_MODE ? localDB.orderBy : orderBy,
  limit: IS_LOCAL_MODE ? localDB.limit : limit,
  startAfter: IS_LOCAL_MODE ? localDB.startAfter : startAfter,
  serverTimestamp: IS_LOCAL_MODE ? localDB.serverTimestamp : serverTimestamp,
  arrayUnion: IS_LOCAL_MODE ? localDB.arrayUnion : arrayUnion,
  arrayRemove: IS_LOCAL_MODE ? localDB.arrayRemove : arrayRemove,
  Timestamp: IS_LOCAL_MODE ? localDB.Timestamp : Timestamp,
  onSnapshot: IS_LOCAL_MODE ? () => () => {} : onSnapshot, // Mock simple pour onSnapshot
  // Fonctions Auth
  signInWithEmailAndPassword: IS_LOCAL_MODE 
    ? auth.signInWithEmailAndPassword 
    : signInWithEmailAndPassword,
  createUserWithEmailAndPassword: IS_LOCAL_MODE 
    ? auth.createUserWithEmailAndPassword 
    : createUserWithEmailAndPassword,
  signOut: IS_LOCAL_MODE ? auth.signOut : signOut,
  onAuthStateChanged: IS_LOCAL_MODE ? auth.onAuthStateChanged : onAuthStateChanged
};

// Export des éléments individuels, conditionnés selon le mode
export {
  db,
  auth,
  storage,
  remoteConfig,
  BYPASS_AUTH,
  IS_LOCAL_MODE,
  // Exporter les bonnes fonctions selon le mode
  IS_LOCAL_MODE ? localDB.collection : collection as collection,
  IS_LOCAL_MODE ? localDB.doc : doc as doc,
  IS_LOCAL_MODE ? localDB.getDoc : enhancedGetDoc as getDoc,
  IS_LOCAL_MODE ? localDB.getDocs : enhancedGetDocs as getDocs,
  IS_LOCAL_MODE ? localDB.setDoc : setDoc as setDoc,
  IS_LOCAL_MODE ? localDB.addDoc : addDoc as addDoc,
  IS_LOCAL_MODE ? localDB.updateDoc : updateDoc as updateDoc,
  IS_LOCAL_MODE ? localDB.deleteDoc : deleteDoc as deleteDoc,
  IS_LOCAL_MODE ? localDB.query : query as query,
  IS_LOCAL_MODE ? localDB.where : where as where,
  IS_LOCAL_MODE ? localDB.orderBy : orderBy as orderBy,
  IS_LOCAL_MODE ? localDB.limit : limit as limit,
  IS_LOCAL_MODE ? localDB.startAfter : startAfter as startAfter,
  IS_LOCAL_MODE ? localDB.serverTimestamp : serverTimestamp as serverTimestamp,
  IS_LOCAL_MODE ? localDB.arrayUnion : arrayUnion as arrayUnion,
  IS_LOCAL_MODE ? localDB.arrayRemove : arrayRemove as arrayRemove,
  IS_LOCAL_MODE ? localDB.Timestamp : Timestamp as Timestamp,
  // Auth exports
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// Storage exports
export { storageRef as ref, uploadBytes, getDownloadURL };

// Exportation de l'information sur le mode courant
export const CURRENT_MODE = MODE;

// Export par défaut de l'objet firebase
export default firebase;
