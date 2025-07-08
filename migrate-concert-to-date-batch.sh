#!/bin/bash

# Script de migration concert → date pour les fichiers principaux
# Phase 2 : Top 10 fichiers avec le plus d'occurrences

echo "=== MIGRATION CONCERT → DATE - PHASE 2 ==="
echo "Migration des 10 fichiers principaux"
echo ""

# Liste des fichiers à migrer (déjà fait: ContratInfoCard.js)
files=(
  "src/pages/ContratDetailsPage.js"
  "src/components/contrats/desktop/ContratGeneratorNew.js"
  "src/components/debug/BrevoTemplateCreator.js"
  "src/components/structures/desktop/StructureForm.js"
  "src/components/pdf/ContratPDFWrapper.js"
  "src/components/lieux/desktop/sections/LieuxListSearchFilter.js"
  "src/components/structures/desktop/StructureView.js"
  "src/components/debug/DateLieuDebug.js"
  "src/hooks/artistes/useArtisteDetails.js"
)

# Créer un backup
backup_dir="backup-concert-migration-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Migration de $file..."
    
    # Backup du fichier
    cp "$file" "$backup_dir/$(basename $file).bak"
    
    # Props et paramètres de fonction
    sed -i '' 's/({ concert,/({ date,/g' "$file"
    sed -i '' 's/, concert,/, date,/g' "$file"
    sed -i '' 's/, concert }/, date }/g' "$file"
    sed -i '' 's/, concert)/, date)/g' "$file"
    sed -i '' 's/(concert,/(date,/g' "$file"
    sed -i '' 's/(concert)/(date)/g' "$file"
    
    # États React
    sed -i '' 's/\[concert, setDate\]/[date, setDate]/g' "$file"
    sed -i '' 's/\[concert, setConcert\]/[date, setDate]/g' "$file"
    sed -i '' 's/const \[concert,/const [date,/g' "$file"
    sed -i '' 's/useState(concert)/useState(date)/g' "$file"
    
    # Accès aux propriétés
    sed -i '' 's/concert\./date./g' "$file"
    sed -i '' 's/concert\?/date?/g' "$file"
    sed -i '' 's/concert\[/date[/g' "$file"
    
    # Conditions et comparaisons
    sed -i '' 's/!concert/!date/g' "$file"
    sed -i '' 's/concert &&/date &&/g' "$file"
    sed -i '' 's/concert ||/date ||/g' "$file"
    sed -i '' 's/concert =/date =/g' "$file"
    sed -i '' 's/= concert/= date/g' "$file"
    
    # Collections et tableaux
    sed -i '' 's/concerts\./dates./g' "$file"
    sed -i '' 's/concerts\?/dates?/g' "$file"
    sed -i '' 's/concerts\[/dates[/g' "$file"
    sed -i '' 's/concerts\.map/dates.map/g' "$file"
    sed -i '' 's/concerts\.filter/dates.filter/g' "$file"
    sed -i '' 's/concerts\.length/dates.length/g' "$file"
    sed -i '' 's/\[concerts\]/[dates]/g' "$file"
    sed -i '' 's/: concerts/: dates/g' "$file"
    sed -i '' 's/= concerts/= dates/g' "$file"
    
    # IDs et références
    sed -i '' 's/concertId/dateId/g' "$file"
    sed -i '' 's/concertsIds/datesIds/g' "$file"
    sed -i '' 's/concertsAssocies/datesAssociees/g' "$file"
    sed -i '' 's/concert_id/date_id/g' "$file"
    
    # Collections Firebase
    sed -i '' "s/'concerts'/'dates'/g" "$file"
    sed -i '' 's/"concerts"/"dates"/g' "$file"
    sed -i '' 's/`concerts`/`dates`/g' "$file"
    
    # Commentaires et logs
    sed -i '' 's/concert dans/date dans/g' "$file"
    sed -i '' 's/Concert /Date /g' "$file"
    sed -i '' 's/du concert/de la date/g' "$file"
    sed -i '' 's/le concert/la date/g' "$file"
    sed -i '' 's/ce concert/cette date/g' "$file"
    sed -i '' 's/un concert/une date/g' "$file"
    sed -i '' 's/des concerts/des dates/g' "$file"
    sed -i '' 's/les concerts/les dates/g' "$file"
    
    echo "✓ $file migré"
  else
    echo "⚠️  Fichier non trouvé: $file"
  fi
done

echo ""
echo "=== RÉSUMÉ ==="
echo "Fichiers migrés: ${#files[@]}"
echo "Backup créé dans: $backup_dir"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifier la compilation: npm start"
echo "2. Tester la génération de contrats"
echo "3. Continuer avec les fichiers restants si tout fonctionne"