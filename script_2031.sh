#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Script de réorganisation de Firebase et nettoyage des imports ===${NC}\n"

# 1. Vérifier la version actuelle de Firebase
CURRENT_VERSION=$(grep -o '"firebase": *"[^"]*"' package.json | sed 's/"firebase": *"\([^"]*\)"/\1/')

echo -e "${YELLOW}Version actuelle de Firebase : $CURRENT_VERSION${NC}"

# Demander si l'utilisateur souhaite mettre à jour Firebase
echo -e "\n${BLUE}Souhaitez-vous mettre à jour Firebase vers la version 9.17.2 ? (y/n)${NC}"
echo -e "${YELLOW}Note: Firebase 9.17.2 est une version stable recommandée pour React${NC}"
read -r update_firebase

if [[ "$update_firebase" == "y" || "$update_firebase" == "Y" ]]; then
  echo -e "\n${YELLOW}Installation de Firebase 9.17.2...${NC}"
  npm install firebase@9.17.2 --save
  echo -e "${GREEN}✓ Firebase mis à jour vers la version 9.17.2${NC}"
else
  echo -e "${BLUE}Conservation de la version actuelle : $CURRENT_VERSION${NC}"
fi

# 2. Sauvegarder et réorganiser firebase.js
echo -e "\n${YELLOW}Sauvegarde du fichier firebase.js actuel...${NC}"
cp ./src/firebase.js ./src/firebase.js.original
echo -e "${GREEN}✓ Fichier sauvegardé dans ./src/firebase.js.original${NC}"

echo -e "\n${YELLOW}Réorganisation du fichier firebase.js...${NC}"
cat > ./src/firebase.js << 'EOL'
// Import modules Firebase
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

// Configuration Firebase avec variables d'environnement
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

// Initialisation
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

// Exports individuels
export {
  // Exports des instances Firebase
  app,
  db,
  auth,
  storage,
  remoteConfig,
  BYPASS_AUTH,
  
  // Réexportation des fonctions Firestore
  collection, doc, getDoc, getDocs,
  setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, arrayUnion, arrayRemove,
  
  // Réexportation des fonctions Auth
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  
  // Réexportation des fonctions Storage
  ref, uploadBytes, getDownloadURL
};

// Pas de export default pour éviter la confusion
EOL

echo -e "${GREEN}✓ Fichier firebase.js réorganisé avec des imports et exports explicites${NC}"

# 3. Nettoyer les imports problématiques
echo -e "\n${YELLOW}Nettoyage et uniformisation des imports...${NC}"

# Remplacer tous les doubles points-virgules
echo -e "${BLUE}Correction des doubles points-virgules...${NC}"
find ./src -name "*.js" -o -name "*.jsx" | xargs sed -i '' 's/;;/;/g'
echo -e "${GREEN}✓ Doubles points-virgules corrigés${NC}"

# Uniformiser les imports de Firebase
echo -e "\n${BLUE}Uniformisation des imports de Firebase...${NC}"

# Corriger les imports de auth et BYPASS_AUTH
echo -e "${BLUE}Correction des imports de auth et BYPASS_AUTH...${NC}"
find ./src -name "*.js" -o -name "*.jsx" | xargs grep -l "import { auth, BYPASS_AUTH } from" | xargs sed -i '' "s/import { auth, BYPASS_AUTH } from.*$/import { auth, BYPASS_AUTH } from '@firebase';/g" || true
echo -e "${GREEN}✓ Imports de auth et BYPASS_AUTH corrigés${NC}"

# Corriger les imports de db et storage
echo -e "${BLUE}Correction des imports de db et storage...${NC}"
find ./src -name "*.js" -o -name "*.jsx" | xargs grep -l "import { db, storage } from" | xargs sed -i '' "s/import { db, storage } from.*$/import { db, storage } from '@firebase';/g" || true
echo -e "${GREEN}✓ Imports de db et storage corrigés${NC}"

# Corriger les imports simples de db
echo -e "${BLUE}Correction des imports de db...${NC}"
find ./src -name "*.js" -o -name "*.jsx" | xargs grep -l "import { db } from" | xargs sed -i '' "s/import { db } from.*$/import { db } from '@firebase';/g" || true
echo -e "${GREEN}✓ Imports de db corrigés${NC}"

# 4. Nettoyer le cache
echo -e "\n${YELLOW}Nettoyage du cache...${NC}"
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache nettoyé${NC}"

# 5. Vérification finale
echo -e "\n${YELLOW}Vérification finale des imports vides...${NC}"
EMPTY_IMPORTS=$(grep -r --include="*.js" --include="*.jsx" "from ''" ./src/ || true)

if [ -n "$EMPTY_IMPORTS" ]; then
  echo -e "${RED}⚠️ Il reste encore des imports vides:${NC}"
  echo "$EMPTY_IMPORTS"
  echo -e "\n${YELLOW}Vous devrez les corriger manuellement.${NC}"
else
  echo -e "${GREEN}✓ Aucun import vide trouvé${NC}"
fi

echo -e "\n${BLUE}=== Récapitulatif des actions effectuées ===${NC}"
echo -e "1. ${update_firebase == "y" || $update_firebase == "Y" ? "Firebase mis à jour vers la version 9.17.2" : "Version actuelle de Firebase conservée"}"
echo -e "2. Fichier firebase.js réorganisé avec des imports et exports explicites"
echo -e "3. Imports uniformisés dans tous les fichiers"
echo -e "4. Cache nettoyé"

echo -e "\n${BLUE}=== Prochaines étapes ===${NC}"
echo -e "1. Testez la compilation avec: ${YELLOW}npm run build${NC}"
echo -e "2. En cas d'erreur, vérifiez si des imports vides subsistent"
echo -e "3. Si tout fonctionne, vous pouvez supprimer les fichiers .bak et .original"

echo -e "\n${GREEN}Script terminé !${NC}"
