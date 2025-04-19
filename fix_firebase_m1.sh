#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Solution spécifique pour Firebase sur Mac M1 ===${NC}\n"

# 1. Sauvegarde des fichiers importants
echo -e "${YELLOW}Sauvegarde des fichiers importants...${NC}"
cp package.json package.json.m1fix.bak
cp craco.config.js craco.config.js.m1fix.bak
if [ -f src/firebase.js ]; then
  cp src/firebase.js src/firebase.js.m1fix.bak
fi
echo -e "${GREEN}✓ Sauvegarde terminée${NC}"

# 2. Réviser package.json pour ajouter les options de résolution
echo -e "\n${YELLOW}Mise à jour de package.json...${NC}"
# Utiliser jq si disponible, sinon utiliser sed
if command -v jq &> /dev/null; then
  # Créer un fichier temporaire avec la mise à jour
  jq '. + {"resolutions": {"@firebase/firestore": "5.0.2", "@firebase/app": "0.9.9"}, "overrides": {"@firebase/firestore": "5.0.2", "@firebase/app": "0.9.9"}}' package.json > package.json.tmp
  mv package.json.tmp package.json
else
  # Utiliser sed si jq n'est pas disponible
  if ! grep -q "\"resolutions\"" package.json; then
    # Ajouter le bloc resolutions avant la dernière accolade
    sed -i '' 's/}$/,\n  "resolutions": {\n    "@firebase\/firestore": "5.0.2",\n    "@firebase\/app": "0.9.9"\n  },\n  "overrides": {\n    "@firebase\/firestore": "5.0.2",\n    "@firebase\/app": "0.9.9"\n  }\n}/' package.json
  fi
fi
echo -e "${GREEN}✓ package.json mis à jour${NC}"

# 3. Mise à jour de craco.config.js pour la gestion de Webpack 5 sur M1
echo -e "\n${YELLOW}Mise à jour de craco.config.js...${NC}"
cat > craco.config.js << 'EOL'
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@firebase': path.resolve(__dirname, 'src/firebase.js'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/style'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@': path.resolve(__dirname, 'src')
    },
    configure: (webpackConfig, { env, paths }) => {
      // Mise à jour de la configuration webpack pour les M1 Macs
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "util": require.resolve("util/"),
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "constants": require.resolve("constants-browserify"),
        "fs": false,
        "net": false,
        "tls": false
      };

      // Configurations spécifiques au bogue Firebase
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "@firebase/firestore": path.resolve(__dirname, "node_modules/@firebase/firestore"),
        "@firebase/app": path.resolve(__dirname, "node_modules/@firebase/app")
      };

      // Modification du module de résolution
      webpackConfig.resolve.modules = [
        'node_modules',
        path.resolve(__dirname, 'node_modules')
      ];

      // Optimization pour éviter les problèmes de résolution
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        moduleIds: 'named'
      };

      return webpackConfig;
    }
  }
};
EOL
echo -e "${GREEN}✓ craco.config.js mis à jour${NC}"

# 4. Installation des packages nécessaires pour Webpack 5 sur M1
echo -e "\n${YELLOW}Installation des packages pour Webpack 5 sur M1...${NC}"
npm install --save-dev stream-http https-browserify browserify-zlib stream-browserify crypto-browserify util path-browserify os-browserify constants-browserify
echo -e "${GREEN}✓ Packages installés${NC}"

# 5. Correction du problème de permissions spécifique aux Macs
echo -e "\n${YELLOW}Correction des permissions spécifiques aux Macs...${NC}"
if [ -d "node_modules/@firebase" ]; then
  chmod -R 755 node_modules/@firebase
  echo -e "${GREEN}✓ Permissions corrigées pour node_modules/@firebase${NC}"
else
  echo -e "${YELLOW}⚠️ Dossier node_modules/@firebase non trouvé${NC}"
fi

# 6. Nettoyage complet du cache npm et node_modules
echo -e "\n${YELLOW}Nettoyage complet du cache et des modules...${NC}"
echo -e "${BLUE}Voulez-vous effectuer un nettoyage complet de node_modules ? (y/n)${NC}"
echo -e "${YELLOW}Cela prendra plus de temps mais peut résoudre des problèmes tenaces.${NC}"
read -r clean_all

if [[ "$clean_all" == "y" || "$clean_all" == "Y" ]]; then
  # Sauvegarde de package-lock.json
  if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.m1fix.bak
  fi
  
  # Supprimer node_modules et les caches
  rm -rf node_modules
  rm -rf ~/.npm
  npm cache clean --force
  
  # Réinstaller les dépendances
  npm install
  
  echo -e "${GREEN}✓ Nettoyage complet et réinstallation terminés${NC}"
else
  # Nettoyage léger
  rm -rf node_modules/.cache
  npm cache clean --force
  echo -e "${GREEN}✓ Nettoyage léger terminé${NC}"
fi

# 7. Test de compilation
echo -e "\n${YELLOW}Test de compilation...${NC}"
echo -e "${BLUE}Voulez-vous lancer la compilation maintenant ? (y/n)${NC}"
read -r run_build

if [[ "$run_build" == "y" || "$run_build" == "Y" ]]; then
  npm run build
  
  # Vérifier si la compilation a réussi
  if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}=== SUCCÈS ! ===${NC}"
    echo -e "La compilation a réussi. Le problème spécifique au M1 a été résolu."
  else
    echo -e "\n${RED}=== ÉCHEC ===${NC}"
    echo -e "La compilation a échoué. Tentative de solution alternative..."
    
    echo -e "\n${YELLOW}Solution alternative : passage à Firebase 8.10.0${NC}"
    echo -e "${BLUE}Voulez-vous passer à Firebase 8.10.0 ? (y/n)${NC}"
    echo -e "${YELLOW}Cette version est connue pour être plus stable sur Mac M1.${NC}"
    read -r downgrade_firebase
    
    if [[ "$downgrade_firebase" == "y" || "$downgrade_firebase" == "Y" ]]; then
      npm uninstall firebase @firebase/app @firebase/firestore @firebase/auth @firebase/storage
      npm install --save firebase@8.10.0
      
      # Adapter firebase.js pour V8
      if [ -f "src/firebase.js" ]; then
        echo -e "\n${YELLOW}Adaptation de firebase.js pour Firebase 8.x...${NC}"
        cat > src/firebase.js << 'EOL'
// Firebase 8.x import style
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/remote-config';

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

// Initialiser Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporter les services Firebase
export const db = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
export const remoteConfig = firebase.remoteConfig();

// Bypass Auth pour développement
export const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH === 'true';

// Exporter firebase pour accéder à toutes ses fonctionnalités
export default firebase;
EOL
        echo -e "${GREEN}✓ firebase.js adapté pour Firebase 8.x${NC}"
      fi
      
      # Nouvelle tentative de build
      echo -e "\n${YELLOW}Nouvelle tentative de build avec Firebase 8.x...${NC}"
      npm run build
    fi
  fi
else
  echo -e "\n${BLUE}Build non lancé.${NC}"
  echo -e "${YELLOW}Vous pouvez lancer la compilation manuellement avec:${NC}"
  echo -e "${BLUE}npm run build${NC}"
fi

echo -e "\n${BLUE}=== Script terminé ===${NC}"
echo -e "${YELLOW}Références:${NC}"
echo -e "1. https://github.com/firebase/firebase-js-sdk/issues/4800"
echo -e "2. https://github.com/firebase/firebase-js-sdk/issues/5314"
echo -e "3. https://stackoverflow.com/questions/66816456/firebase-broken-on-m1-mac"
