#!/bin/bash

# Script pour corriger les fallbacks de variables CSS
# Créé le 20 mai 2025

echo "Correction des fallbacks dans les fichiers CSS spécifiés..."

# Liste des fichiers à corriger
FILES=(
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/base/colors.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/components/badges.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/components/cards.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/components/concerts-mobile.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/components/concerts.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/components/contrat-editor.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/components/contrat-print.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/components/lists.css"
)

# Pour chaque fichier
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Correction du fichier: $file"
    
    # Sauvegarde du fichier original
    cp "$file" "${file}.bak"
    
    # 1. Corriger les variables RGBA incorrectes dans box-shadow
    sed -i '' 's/box-shadow:[^;]*var(--tc-color-rgba([^,]*,[^,]*), rgba([^,]*,[^,]*)), *0\.[0-9]*);/box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);/g' "$file"
    
    # 2. Corriger les variables RGBA incorrectes dans background-color
    sed -i '' 's/background-color:[^;]*var(--tc-color-rgba([^,]*), rgba([^,]*)), *0\.[0-9]*);/background-color: rgba(var(--tc-primary-rgb), 0.1);/g' "$file"
    
    # 3. Supprimer les fallbacks hexadécimaux
    sed -i '' 's/var(--tc-color-[a-f0-9]*, #[a-f0-9]*)/var(--tc-gray-800)/g' "$file"
    
    # 4. Corriger les parenthèses supplémentaires
    sed -i '' 's/var(--tc-[^)]*));/var(--tc-shadow-sm);/g' "$file"
    
    # 5. Corrections spécifiques pour colors.css
    if [[ "$file" == *"colors.css" ]]; then
      # Remplacer les fallbacks pour chaque type de couleur
      sed -i '' 's/var(--tc-color-1e3a5f, #1e3a5f)/var(--tc-color-primary)/g' "$file"
      sed -i '' 's/var(--tc-color-2d4b72, #2d4b72)/var(--tc-color-primary-light)/g' "$file"
      sed -i '' 's/var(--tc-color-132740, #132740)/var(--tc-color-primary-dark)/g' "$file"
      sed -i '' 's/var(--tc-color-3498db, #3498db)/var(--tc-color-secondary)/g' "$file"
      sed -i '' 's/var(--tc-color-4aa3de, #4aa3de)/var(--tc-color-secondary-light)/g' "$file"
      sed -i '' 's/var(--tc-color-2980b9, #2980b9)/var(--tc-color-secondary-dark)/g' "$file"
      sed -i '' 's/var(--tc-color-2ecc71, #2ecc71)/var(--tc-color-success)/g' "$file"
      sed -i '' 's/var(--tc-color-f39c12, #f39c12)/var(--tc-color-warning)/g' "$file"
      sed -i '' 's/var(--tc-color-e74c3c, #e74c3c)/var(--tc-color-danger)/g' "$file"
      
      # Échelle de gris
      sed -i '' 's/var(--tc-color-ffffff, #ffffff)/var(--tc-color-white)/g' "$file"
      sed -i '' 's/var(--tc-color-fafbfc, #fafbfc)/var(--tc-color-gray-50)/g' "$file"
      sed -i '' 's/var(--tc-color-f8f9fa, #f8f9fa)/var(--tc-color-gray-100)/g' "$file"
      sed -i '' 's/var(--tc-color-e9ecef, #e9ecef)/var(--tc-color-gray-200)/g' "$file"
      sed -i '' 's/var(--tc-color-dee2e6, #dee2e6)/var(--tc-color-gray-300)/g' "$file"
      sed -i '' 's/var(--tc-color-ced4da, #ced4da)/var(--tc-color-gray-400)/g' "$file"
      sed -i '' 's/var(--tc-color-adb5bd, #adb5bd)/var(--tc-color-gray-500)/g' "$file"
      sed -i '' 's/var(--tc-color-6c757d, #6c757d)/var(--tc-color-gray-600)/g' "$file"
      sed -i '' 's/var(--tc-color-495057, #495057)/var(--tc-color-gray-700)/g' "$file"
      sed -i '' 's/var(--tc-color-343a40, #343a40)/var(--tc-color-gray-800)/g' "$file"
      sed -i '' 's/var(--tc-color-212529, #212529)/var(--tc-color-gray-900)/g' "$file"
      sed -i '' 's/var(--tc-color-000000, #000000)/var(--tc-color-black)/g' "$file"
      
      # Autres couleurs spécifiques
      sed -i '' 's/var(--tc-color-c8c8c8, #c8c8c8)/var(--tc-color-gray-400)/g' "$file"
      sed -i '' 's/var(--tc-color-121212, #121212)/var(--tc-color-dark-theme)/g' "$file"
    fi
    
  else
    echo "Le fichier $file n'existe pas"
  fi
done

echo "Corrections terminées ! Des sauvegardes ont été créées avec l'extension .bak"
echo "Vérifiez les fichiers pour vous assurer que les corrections ont été appliquées correctement."
