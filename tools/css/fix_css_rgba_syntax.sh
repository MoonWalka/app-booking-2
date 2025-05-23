#!/bin/bash

# Script pour remplacer les appels RGBA incorrects dans les fichiers CSS
# Créé le 20 mai 2025

echo "Correction des syntaxes RGBA incorrectes dans les fichiers CSS..."

# Définir le répertoire de recherche
SEARCH_DIR="/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2"

# 1. Trouver et corriger les erreurs de box-shadow avec var(--tc-color-rgba
find "$SEARCH_DIR" -name "*.css" -type f -exec grep -l "box-shadow.*var(--tc-color-rgba" {} \; | while read -r file; do
  echo "Correction du fichier: $file"
  # Sauvegarde du fichier original
  cp "$file" "${file}.bak"
  # Remplacer les appels incorrects
  sed -i '' 's/box-shadow:[^;]*var(--tc-color-rgba([^,]*,[^,]*), rgba([^,]*,[^,]*)), 0\.[0-9]*);/box-shadow: 0 0 0 0.25rem rgba(var(--tc-color-primary-rgb), 0.25);/g' "$file"
done

# 2. Trouver et corriger les erreurs de background-color avec var(--tc-color-rgba
find "$SEARCH_DIR" -name "*.css" -type f -exec grep -l "background-color.*var(--tc-color-rgba" {} \; | while read -r file; do
  echo "Correction du fichier: $file"
  # Sauvegarde du fichier original si ce n'est pas déjà fait
  if [ ! -f "${file}.bak" ]; then
    cp "$file" "${file}.bak"
  fi
  # Remplacer les appels incorrects
  sed -i '' 's/background-color:[^;]*var(--tc-color-rgba([^,]*), rgba([^,]*)), 0\.[0-9]*);/background-color: rgba(var(--tc-color-primary-rgb), 0.1);/g' "$file"
done

# 3. Corriger les erreurs dans buttons.css
BUTTONS_FILE="$SEARCH_DIR/src/styles/components/buttons.css"
if [ -f "$BUTTONS_FILE" ]; then
  echo "Correction spécifique de $BUTTONS_FILE"
  cp "$BUTTONS_FILE" "${BUTTONS_FILE}.bak"
  sed -i '' 's/box-shadow:[^;]*var(--tc-spacing-1)[^;]*var(--tc-color-rgba([^,]*,[^,]*), rgba([^,]*,[^,]*)), 0\.[0-9]*);/box-shadow: 0 0 0 var(--tc-spacing-1) rgba(var(--tc-color-primary-rgb), 0.25);/g' "$BUTTONS_FILE"
fi

# 4. Corriger les erreurs dans programmateurs.css
PROG_FILE="$SEARCH_DIR/src/styles/pages/programmateurs.css"
if [ -f "$PROG_FILE" ]; then
  echo "Correction spécifique de $PROG_FILE"
  cp "$PROG_FILE" "${PROG_FILE}.bak"
  sed -i '' 's/background-color:[^;]*var(--tc-color-rgba([^,]*), rgba([^,]*)), 0\.[0-9]*);/background-color: rgba(var(--tc-primary-rgb), 0.1);/g' "$PROG_FILE"
fi

# 5. Corriger Card.module.css
CARD_FILE="$SEARCH_DIR/src/components/ui/Card.module.css"
if [ -f "$CARD_FILE" ]; then
  echo "Correction spécifique de $CARD_FILE"
  cp "$CARD_FILE" "${CARD_FILE}.bak"
  sed -i '' 's/background-color:[^;]*var(--tc-color-rgba([^,]*-rgb), rgba([^,]*-rgb)), 0\.[0-9]*);/background-color: rgba(var(--tc-primary-color-rgb), 0.1);/g' "$CARD_FILE"
fi

echo "Corrections terminées ! Des sauvegardes ont été créées avec l'extension .bak"
echo "Vérifiez les fichiers pour vous assurer que les corrections ont été appliquées correctement."
