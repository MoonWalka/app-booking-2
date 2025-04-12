// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase - en production, ces valeurs devraient être dans des variables d'environnement
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTesting",
  authDomain: "app-booking-test.firebaseapp.com",
  projectId: "app-booking-test",
  storageBucket: "app-booking-test.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
