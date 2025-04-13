// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "app-booking-dev.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "app-booking-dev",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "app-booking-dev.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHIJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Configuration pour le mode développement/test
const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === "false" ? false : true;

export { db, auth, BYPASS_AUTH };
export default app;
