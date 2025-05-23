#!/bin/bash

# Script pour finaliser l'externalisation des styles PDF dans ContratPDFWrapper.js

# Utiliser le chemin correct pour votre projet
PROJECT_DIR="/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2"
FILE_PATH="$PROJECT_DIR/src/components/pdf/ContratPDFWrapper.js"
BACKUP_FILE="$FILE_PATH.bak"

echo "Sauvegarde du fichier original dans $BACKUP_FILE..."
cp "$FILE_PATH" "$BACKUP_FILE"

echo "Vérification et suppression de la définition de la variable 'printCss' si elle existe..."

# Vérifier si printCss existe avant de le supprimer
if grep -q "const printCss = \`" "$FILE_PATH"; then
  # Sur macOS, sed fonctionne différemment - utiliser une syntaxe compatible
  # Utiliser sed pour supprimer le bloc de définition de la variable printCss
  sed -i '' '/const printCss = `/,/`;$/d' "$FILE_PATH"
  echo "Variable printCss supprimée."
else
  echo "Variable printCss non trouvée - aucune modification nécessaire."
fi

echo "Vérification et suppression de l'injection de style si elle existe..."

# Vérifier si l'injection de style existe avant de la remplacer
if grep -q "<style>.*printCss.*</style>" "$FILE_PATH"; then
  # Sur macOS, la syntaxe de sed est différente
  sed -i '' 's|<style>.*printCss.*</style>|<!-- Style externe contrat-print.css appliqué via Puppeteer -->|g' "$FILE_PATH"
  echo "Injection de style remplacée par un commentaire."
else
  echo "Injection de style non trouvée ou déjà remplacée."
fi

# Vérification rapide
echo "Vérification après modification (autour de 'contrat-print-mode'):"
grep -C 5 "contrat-print-mode" "$FILE_PATH"

echo ""
echo "Modification terminée."
echo "!! IMPORTANT !!"
echo "1. Vérifiez manuellement le fichier $FILE_PATH pour confirmer les changements."
echo "2. Assurez-vous que la logique dans src/services/pdfService.js (ou équivalent) utilisant Puppeteer injecte ou applique correctement les styles de src/styles/components/contrat-print.css."
echo "3. Testez rigoureusement la génération de PDF pour tous les types de contrats."
echo "En cas de problème, restaurez le fichier depuis $BACKUP_FILE"