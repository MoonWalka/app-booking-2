#!/bin/bash

# Script pour corriger les fallbacks de variables CSS dans les fichiers de pages
# Créé le 20 mai 2025

echo "Correction des fallbacks dans les fichiers CSS de pages..."

# Liste des fichiers à corriger
FILES=(
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/pages/artistes.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/pages/concerts.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/pages/formPublic.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/pages/forms.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/pages/lieux.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/pages/programmateurs.css"
  "/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src/styles/pages/structures.css"
)

# Pour chaque fichier
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Correction du fichier: $file"
    
    # Sauvegarde du fichier original
    cp "$file" "${file}.bak"
    
    # 1. Remplacer les variables RGBA incorrectes dans les propriétés CSS
    sed -i '' 's/var(--tc-color-rgba([^,]*,[^,]*), rgba([^,]*,[^,]*)))/rgba(var(--tc-primary-rgb), 0.15)/g' "$file"
    
    # 2. Corriger les fallbacks hexadécimaux pour les couleurs personnalisées
    # Artistes
    sed -i '' 's/var(--tc-color-6610f2, #6610f2)/var(--tc-purple)/g' "$file"
    sed -i '' 's/var(--tc-color-f0e6ff, #f0e6ff)/var(--tc-purple-lightest)/g' "$file"
    
    # Concerts
    sed -i '' 's/var(--tc-color-5e72e4, #5e72e4)/var(--tc-blue)/g' "$file"
    sed -i '' 's/var(--tc-color-eef0fd, #eef0fd)/var(--tc-blue-lightest)/g' "$file"
    
    # Statuts
    sed -i '' 's/var(--tc-color-176639, #176639)/var(--tc-success-dark)/g' "$file"
    sed -i '' 's/var(--tc-color-964b00, #964B00)/var(--tc-warning-dark)/g' "$file"
    sed -i '' 's/var(--tc-color-a71d2a, #a71d2a)/var(--tc-danger-dark)/g' "$file"
    sed -i '' 's/var(--tc-color-45494e, #45494e)/var(--tc-gray-700)/g' "$file"
    
    # 3. Corriger les rgba avec fallbacks
    sed -i '' 's/var(--tc-color-rgba([^,]*,[^,]*,[^,]*,[^,]*), rgba([^,]*,[^,]*,[^,]*,[^,]*)))/rgba(var(--tc-success-rgb), 0.15)/g' "$file"
    
    # 4. Autres remplacements spécifiques
    sed -i '' 's/--concert-status-confirmed-bg: var(.*)/--concert-status-confirmed-bg: rgba(var(--tc-success-rgb), 0.15);/g' "$file"
    sed -i '' 's/--concert-status-pending-bg: var(.*)/--concert-status-pending-bg: rgba(var(--tc-warning-rgb), 0.15);/g' "$file"
    sed -i '' 's/--concert-status-cancelled-bg: var(.*)/--concert-status-cancelled-bg: rgba(var(--tc-danger-rgb), 0.15);/g' "$file"
    sed -i '' 's/--concert-status-draft-bg: var(.*)/--concert-status-draft-bg: rgba(var(--tc-gray-rgb), 0.15);/g' "$file"
    
    # 5. Remplacer les autres fallbacks hexadécimaux génériques
    sed -i '' 's/var(--tc-color-[a-f0-9]*, #[a-f0-9]*)/var(--tc-color-primary)/g' "$file"
    
  else
    echo "Le fichier $file n'existe pas"
  fi
done

echo "Corrections terminées ! Des sauvegardes ont été créées avec l'extension .bak"
echo "Vérifiez les fichiers pour vous assurer que les corrections ont été appliquées correctement."
echo ""
echo "Méthode manuelle alternative:"
echo "-----------------------------"
echo "1. Remplacer tous les var(--tc-color-XXXXXX, #XXXXXX) par la variable standardisée correspondante"
echo "   Par exemple: var(--tc-color-6610f2, #6610f2) → var(--tc-purple)"
echo ""
echo "2. Remplacer toutes les variables RGBA avec double fonction:"
echo "   var(--tc-color-rgba(...), rgba(...)) → rgba(var(--tc-XXX-rgb), 0.XX)"
echo ""
echo "3. Pour les variables de statut de concert:"
echo "   --concert-status-XXX-bg: remplacer par rgba(var(--tc-XXX-rgb), 0.15)"
echo "   --concert-status-XXX-color: remplacer par var(--tc-XXX-dark)"
