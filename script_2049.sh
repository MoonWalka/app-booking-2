#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Résolution du problème Firebase '@firebase/firestore' ===${NC}\n"

# 1. Sauvegarder le package.json actuel
echo -e "${YELLOW}Sauvegarde du package.json actuel...${NC}"
cp package.json package.json.bak
echo -e "${GREEN}✓ Fichier sauvegardé dans package.json.bak${NC}"

# 2. Désinstaller complètement Firebase
echo -e "\n${YELLOW}Désinstallation de Firebase...${NC}"
npm uninstall firebase
echo -e "${GREEN}✓ Firebase désinstallé${NC}"

# 3. Nettoyer le cache npm
echo -e "\n${YELLOW}Nettoyage du cache npm...${NC}"
npm cache clean --force
echo -e "${GREEN}✓ Cache npm nettoyé${NC}"

# 4. Installer explicitement Firebase et ses sous-modules
echo -e "\n${YELLOW}Installation de Firebase 9.17.2 et ses sous-modules...${NC}"
npm install --save firebase@9.17.2 @firebase/app @firebase/firestore @firebase/auth @firebase/storage @firebase/remote-config
echo -e "${GREEN}✓ Firebase et ses sous-modules installés${NC}"

# 5. Nettoyer le cache de build
echo -e "\n${YELLOW}Nettoyage du cache de build...${NC}"
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache de build nettoyé${NC}"

# 6. Réorganiser firebase.js
echo -e "\n${YELLOW}Réorganisation du fichier firebase.js...${NC}"
cp ./src/firebase.js ./src/firebase.js.original
cat > ./src/firebase.js << 'EOL'
// Import direct des modules Firebase
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, connectFirestoreEmulator,
  collection, doc, getDoc, getDocs, 
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { 
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from 'firebase/auth';
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from 'firebase/storage';
import {
  getRemoteConfig, fetchAndActivate
} from 'firebase/remote-config';

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

// Configuration de l'émulateur (si nécessaire)
const useEmulator = process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_USE_EMULATOR === 'true';
if (useEmulator) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('Connected to Firestore emulator');
}

// Configuration du bypass d'authentification pour le développement
const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Exports
export {
  app,
  db,
  auth,
  storage,
  remoteConfig,
  BYPASS_AUTH,
  
  // Fonctions Firestore
  collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, arrayUnion, arrayRemove,
  
  // Fonctions Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  
  // Fonctions Storage
  ref, uploadBytes, getDownloadURL
};
EOL
echo -e "${GREEN}✓ Fichier firebase.js réorganisé${NC}"

# 7. Tentative de build
echo -e "\n${YELLOW}Tentative de build...${NC}"
npm run build
BUILD_RESULT=$?

if [ $BUILD_RESULT -eq 0 ]; then
  echo -e "\n${GREEN}=== SUCCÈS ! ===${NC}"
  echo -e "Le problème a été résolu. Votre application a été compilée avec succès."
else
  echo -e "\n${RED}=== ÉCHEC ===${NC}"
  echo -e "La compilation a échoué. Consultez les erreurs ci-dessus pour plus de détails."
  
  echo -e "\n${YELLOW}Mesures supplémentaires à essayer:${NC}"
  echo -e "1. Installer une version de Firebase encore plus stable (8.10.0):"
  echo -e "   ${BLUE}npm uninstall firebase @firebase/app @firebase/firestore @firebase/auth @firebase/storage"
  echo -e "   npm install --save firebase@8.10.0${NC}"
  
  echo -e "2. Modifier firebase.js pour utiliser la syntaxe Firebase 8.x:"
  echo -e "   ${BLUE}// Exemple d'import pour Firebase 8.x"
  echo -e "   import firebase from 'firebase/app';"
  echo -e "   import 'firebase/firestore';"
  echo -e "   import 'firebase/auth';"
  echo -e "   import 'firebase/storage';"
  echo -e "   firebase.initializeApp(firebaseConfig);"
  echo -e "   const db = firebase.firestore();"
  echo -e "   // etc.${NC}"
  
  echo -e "3. Vérifier les conflits de dépendances:"
  echo -e "   ${BLUE}npm ls firebase${NC}"
fi

echo -e "\n${BLUE}=== Opération terminée ===${NC}"
