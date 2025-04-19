// Ce fichier sert de remplacement pour @firebase/firestore
// Il réexporte les fonctionnalités de firebase/firestore

import * as firestoreModule from 'firebase/firestore';

// Exporter toutes les fonctions et objets du module
export default firestoreModule;
export const {
  collection, 
  doc, 
  getDoc, 
  getDocs,
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
  getFirestore,
  connectFirestoreEmulator,
  onSnapshot,
  Timestamp,
  FieldValue,
  FieldPath
} = firestoreModule;
