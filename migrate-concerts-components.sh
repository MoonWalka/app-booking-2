#!/bin/bash

# Script de migration des composants Concert vers Date

echo "🚀 Début de la migration des composants Concert -> Date"

# Étape 1: Renommer tous les fichiers
echo "📁 Renommage des fichiers..."
find src/components/concerts -name "*Concert*" -type f | while read file; do
    newfile=$(echo "$file" | sed 's/Concert/Date/g' | sed 's/concerts/dates/g')
    # Créer le répertoire de destination si nécessaire
    mkdir -p "$(dirname "$newfile")"
    mv "$file" "$newfile" 2>/dev/null && echo "  ✅ $file -> $newfile"
done

# Étape 2: Renommer le dossier principal
echo "📁 Renommage du dossier principal..."
if [ -d "src/components/concerts" ]; then
    mv src/components/concerts src/components/dates
    echo "  ✅ src/components/concerts -> src/components/dates"
fi

# Étape 3: Mettre à jour le contenu des fichiers
echo "📝 Mise à jour du contenu des fichiers..."

# Mise à jour dans le nouveau dossier dates
find src/components/dates -name "*.js" -o -name "*.jsx" | while read file; do
    # Sauvegarder l'original
    cp "$file" "$file.bak"
    
    # Remplacer les termes
    sed -i '' \
        -e 's/Concert/Date/g' \
        -e 's/concert/date/g' \
        -e 's/CONCERT/DATE/g' \
        -e 's/concerts/dates/g' \
        -e 's/Concerts/Dates/g' \
        -e 's/CONCERTS/DATES/g' \
        "$file"
    
    echo "  ✅ Mis à jour: $file"
done

# Étape 4: Mettre à jour les imports dans tout le projet
echo "🔗 Mise à jour des imports..."
find src -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "components/concerts" "$file"; then
        sed -i '' 's|components/concerts|components/dates|g' "$file"
        echo "  ✅ Import mis à jour: $file"
    fi
done

echo "✨ Migration terminée!"
echo "⚠️  N'oubliez pas de vérifier et tester les changements"