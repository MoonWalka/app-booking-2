#!/bin/bash
# Script pour corriger les imports profonds de firebase.js -> firebaseInit.js

# Définir le répertoire racine du projet
PROJECT_DIR="$(pwd)"
SRC_DIR="$PROJECT_DIR/src"

echo "Début de la correction des imports profonds..."

# Correction des imports profonds (../, ../../, ../../../, etc.)
find "$SRC_DIR" -type f -name "*.js" -exec sed -i '' \
  -e "s|from '../../firebase'|from '../../firebaseInit'|g" \
  -e "s|from '../../../firebase'|from '../../../firebaseInit'|g" \
  -e "s|from '../../../../firebase'|from '../../../../firebaseInit'|g" \
  -e "s|import('../../firebase')|import('../../firebaseInit')|g" \
  -e "s|import('../../../firebase')|import('../../../firebaseInit')|g" \
  -e "s|import('../../../../firebase')|import('../../../../firebaseInit')|g" \
  {} +

echo "Correction des imports profonds terminée."
echo "Vérifiez que toutes les erreurs sont résolues en exécutant votre build."
