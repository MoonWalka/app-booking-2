// Import direct des modules Firebase pour éviter les problèmes de réexportation
import { initializeApp } from './firebase/app';
import { getFirestore } from './firebase/firestore';
import { getAuth } from './firebase/auth';
import { getStorage } from './firebase/storage';
import { getRemoteConfig } from './firebase/remote-config';

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
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const remoteConfig = getRemoteConfig(app);

// Configuration du bypass d'authentification pour le développement
const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Exports des instances
export {
  app,
  db,
  auth,
  storage,
  remoteConfig,
  BYPASS_AUTH
};

// Exports des fonctions - importées individuellement pour éviter les problèmes de réexportation
export {
  collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, arrayUnion, arrayRemove
} from './firebase/firestore';

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from './firebase/auth';

export {
  ref, uploadBytes, getDownloadURL
} from './firebase/storage';
