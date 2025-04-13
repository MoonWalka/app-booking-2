// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { mockFirestore } from "./mockStorage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "app-booking-26571.firebaseapp.com",
  projectId: "app-booking-26571",
  storageBucket: "app-booking-26571.firebasestorage.app",
  messagingSenderId: "985724562753",
  appId: "1:985724562753:web:146bd6983fd016cb9a85c0",
  measurementId: "G-RL3N09C0WM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Utiliser mockFirestore en développement, Firestore en production
const isEmulator = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

console.log('Running in ' + (isEmulator ? 'emulator' : 'production') + ' mode. Do not use with production credentials.');

// Exporter db qui sera utilisé par tous les composants
export const db = isEmulator ? mockFirestore : getFirestore(app);
