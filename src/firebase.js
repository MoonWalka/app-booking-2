// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import { mockFirestore } from "./mockStorage";

// Configuration Firebase avec fallbacks explicites
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyABTcYWfzZWWBBc0x7uQPqVGxHZ7EZjKI0", // Remplacez par votre clé réelle si nécessaire
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "app-booking-26571.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "app-booking-26571",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "app-booking-26571.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "985724562753",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:985724562753:web:146bd6983fd016cb9a85c0",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-RL3N09C0WM"
};

// Log de débogage
console.log("Firebase config - apiKey présente:", !!firebaseConfig.apiKey);
console.log("Firebase config - projectId:", firebaseConfig.projectId);

// Initialisation directe de Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialisé avec succès");
} catch (error) {
  console.error("Erreur d'initialisation Firebase:", error);
  // Réessayer avec une configuration minimale en cas d'erreur
  try {
    const minimalConfig = {
      apiKey: "AIzaSyABTcYWfzZWWBBc0x7uQPqVGxHZ7EZjKI0", // Remplacez par votre clé réelle
      authDomain: "app-booking-26571.firebaseapp.com",
      projectId: "app-booking-26571",
    };
    app = initializeApp(minimalConfig);
    console.warn("Firebase initialisé avec configuration minimale");
  } catch (fallbackError) {
    console.error("Échec de l'initialisation de secours:", fallbackError);
  }
}

// Détection de l'environnement
const isEmulator = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

console.log('Running in ' + (isEmulator ? 'emulator' : 'production') + ' mode.');

// Export des services avec vérification
export const analytics = app ? getAnalytics(app) : null;
export const auth = app ? getAuth(app) : null;

// Variable pour contourner l'authentification en développement
export const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Base de données avec fallback explicite
let firestore;
try {
  if (isEmulator) {
    console.log("Utilisation de mockFirestore en mode développement");
    firestore = mockFirestore;
  } else if (app) {
    firestore = getFirestore(app);
    console.log("Firestore initialisé avec succès");
  } else {
    throw new Error("App Firebase non disponible");
  }
} catch (error) {
  console.error("Erreur d'initialisation Firestore:", error);
  console.warn("Utilisation de mockFirestore comme fallback");
  firestore = mockFirestore;
}

// Export de la base de données
export const db = firestore;

// Initialiser Remote Config
export const initializeRemoteConfig = async () => {
  if (!app) {
    console.error("Cannot initialize Remote Config: Firebase app not initialized");
    return null;
  }
  
  try {
    const remoteConfig = getRemoteConfig(app);
    
    // Configurer le temps minimum entre les actualisations (1 heure en ms)
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
    
    // Définir les valeurs par défaut (utilisées en cas d'échec de chargement)
    remoteConfig.defaultConfig = {
      locationiq_api_key: process.env.REACT_APP_LOCATIONIQ_API_KEY || ""
    };
    
    // Récupérer et activer la configuration
    await fetchAndActivate(remoteConfig);
    console.log("Remote Config activé avec succès");
    
    return remoteConfig;
  } catch (error) {
    console.error("Erreur d'initialisation de Remote Config:", error);
    return null;
  }
};
