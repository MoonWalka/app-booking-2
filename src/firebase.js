// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Ajout de l'import pour Storage
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";

// Configuration Firebase avec variables d'environnement uniquement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Vérification des variables requises
const requiredEnvVars = ['REACT_APP_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_PROJECT_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
  console.error('Consultez le fichier .env.example pour configurer correctement votre environnement');
}

// Log de débogage (sécurisé - ne montre pas les valeurs)
console.log("Firebase config - apiKey présente:", !!firebaseConfig.apiKey);
console.log("Firebase config - projectId:", firebaseConfig.projectId);

// Initialisation de Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialisé avec succès");
} catch (error) {
  console.error("Erreur d'initialisation Firebase:", error);
}

// Détection de l'environnement
// Toujours en production – pas d'émulateur Firestore
const isEmulator = false;

console.log('Running in ' + (isEmulator ? 'emulator' : 'production') + ' mode.');

// Export des services
export const analytics = app ? getAnalytics(app) : null;
export const auth      = app ? getAuth(app) : null;
export const storage   = app ? getStorage(app) : null;
export const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Initialisation de Firestore
const db = getFirestore(app);
console.log("Firestore initialisé avec succès");

// Export de la base de données
export { db };

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
