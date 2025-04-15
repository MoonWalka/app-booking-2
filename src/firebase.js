
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";
import { mockFirestore } from "./mockStorage";

// Débogage des variables d'environnement
console.log('REACT_APP_FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? 'définie' : 'non définie');
console.log('REACT_APP_FIREBASE_AUTH_DOMAIN:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 'définie' : 'non définie');
// etc.
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialisation conditionnelle pour éviter les erreurs si les variables ne sont pas définies
const initFirebase = () => {
  try {
    // Vérifier si toutes les configurations nécessaires sont disponibles
    const requiredConfigs = ['apiKey', 'authDomain', 'projectId'];
    const missingConfigs = requiredConfigs.filter(key => !firebaseConfig[key]);
    
    if (missingConfigs.length > 0) {
      console.warn(`Firebase configuration incomplete. Missing: ${missingConfigs.join(', ')}`);
      return null;
    }
    
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return null;
  }
};

// Initialize Firebase conditionally
const app = initFirebase();

// Export conditionally initialized services
export const analytics = app ? getAnalytics(app) : null;
export const auth = app ? getAuth(app) : null;

// Utiliser mockFirestore en développement, Firestore en production
const isEmulator = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

console.log('Running in ' + (isEmulator ? 'emulator' : 'production') + ' mode. Do not use with production credentials.');

// Variable pour contourner l'authentification en développement
export const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Exporter db qui sera utilisé par tous les composants
export const db = isEmulator ? mockFirestore : (app ? getFirestore(app) : null);

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
