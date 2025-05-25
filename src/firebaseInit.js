/**
 * Point d'entrée pour Firebase
 * Interface simplifiée pour éviter les dépendances circulaires
 */

// Import depuis le service Firebase simplifié
import {
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
