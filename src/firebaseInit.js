/**
 * Point d'entrée pour Firebase
 * Utilise le pattern Factory pour éviter les dépendances circulaires
 * IMPORTANT: Ce fichier ne doit PAS importer directement depuis mockStorage.js
 */

// Import depuis le service Firebase qui utilise le pattern Factory
import firebaseService, {
  db, auth, storage, remoteConfig,
  collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, arrayUnion, arrayRemove,
  onSnapshot, Timestamp, getCountFromServer,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged,
  ref, uploadBytes, getDownloadURL,
  MODE_LOCAL
} from './services/firebase-service';

// Exporter toutes les fonctionnalités de Firebase via le service
export {
  db, auth, storage, remoteConfig,
  collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, arrayUnion, arrayRemove,
  onSnapshot, Timestamp, getCountFromServer,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged,
  ref, uploadBytes, getDownloadURL
};

// Constantes liées au mode
export const IS_LOCAL_MODE = MODE_LOCAL;
export const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';
export const CURRENT_MODE = MODE_LOCAL ? 'local' : 'production';

// Export par défaut du service Firebase complet
export default firebaseService;
