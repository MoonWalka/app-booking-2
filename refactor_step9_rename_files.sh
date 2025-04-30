#!/bin/bash
# Étape 9: Script de renommage des fichiers (firebase.js, firebaseService.js)

# Définir le répertoire racine du projet
PROJECT_DIR="/home/ubuntu/app-booking-2"
SRC_DIR="$PROJECT_DIR/src"

echo "Début du script de renommage..."

# --- Renommage 1: firebase.js -> firebaseInit.js ---

OLD_FIREBASE_PATH="$SRC_DIR/firebase.js"
NEW_FIREBASE_PATH="$SRC_DIR/firebaseInit.js"

if [ -f "$OLD_FIREBASE_PATH" ]; then
  echo "Renommage de $OLD_FIREBASE_PATH en $NEW_FIREBASE_PATH..."
  mv "$OLD_FIREBASE_PATH" "$NEW_FIREBASE_PATH"

  echo "Mise à jour des imports pour firebase.js -> firebaseInit.js..."
  # Recherche et remplacement dans tous les fichiers JS
  # Attention: Gère les alias (@/firebase) et les chemins relatifs (./firebase, ../firebase)
  find "$SRC_DIR" -type f -name "*.js" -exec sed -i 
    -e "s|from '@/firebase'|from '@/firebaseInit'|g" \
    -e "s|from '@firebase'|from '@/firebaseInit'|g" \
    -e "s|from './firebase'|from './firebaseInit'|g" \
    -e "s|from '../firebase'|from '../firebaseInit'|g" \
    -e "s|import('@/firebase')|import('@/firebaseInit')|g" \
    -e "s|import('@firebase')|import('@/firebaseInit')|g" \
    {} +
else
  if [ -f "$NEW_FIREBASE_PATH" ]; then
    echo "INFO: $OLD_FIREBASE_PATH non trouvé, mais $NEW_FIREBASE_PATH existe déjà. Renommage probablement déjà effectué."
  else
    echo "ATTENTION: $OLD_FIREBASE_PATH non trouvé. Impossible de renommer ou mettre à jour les imports."
  fi
fi

# --- Renommage 2: services/firebaseService.js -> services/firestoreService.js ---

OLD_SERVICE_PATH="$SRC_DIR/services/firebaseService.js"
NEW_SERVICE_PATH="$SRC_DIR/services/firestoreService.js"

if [ -f "$OLD_SERVICE_PATH" ]; then
  echo "Renommage de $OLD_SERVICE_PATH en $NEW_SERVICE_PATH..."
  mv "$OLD_SERVICE_PATH" "$NEW_SERVICE_PATH"

  echo "Mise à jour des imports pour firebaseService.js -> firestoreService.js..."
  # Recherche et remplacement dans tous les fichiers JS
  find "$SRC_DIR" -type f -name "*.js" -exec sed -i 
    -e "s|from '@/services/firebaseService.js'|from '@/services/firestoreService.js'|g" \
    -e "s|from '@/services/firebaseService'|from '@/services/firestoreService'|g" \
    -e "s|from '../../services/firebaseService.js'|from '../../services/firestoreService.js'|g" \
    -e "s|from '../services/firebaseService.js'|from '../services/firestoreService.js'|g" \
    -e "s|from './services/firebaseService.js'|from './services/firestoreService.js'|g" \
    -e "s|import('@/services/firebaseService')|import('@/services/firestoreService')|g" \
    {} +
else
  if [ -f "$NEW_SERVICE_PATH" ]; then
    echo "INFO: $OLD_SERVICE_PATH non trouvé, mais $NEW_SERVICE_PATH existe déjà. Renommage probablement déjà effectué."
  else
    echo "ATTENTION: $OLD_SERVICE_PATH non trouvé. Impossible de renommer ou mettre à jour les imports."
  fi
fi

echo ""
echo "Script de renommage terminé."
echo "Vérification manuelle des imports et un test de build sont recommandés."

