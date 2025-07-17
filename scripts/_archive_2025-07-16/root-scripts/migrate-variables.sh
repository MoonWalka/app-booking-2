#!/bin/bash

# Script de migration des variables concert vers date

echo "🚀 Début de la migration des variables concert -> date"

# Exclure certains dossiers sensibles
EXCLUDE_DIRS="-path ./node_modules -prune -o -path ./.git -prune -o -path ./build -prune -o"

# Créer une sauvegarde
echo "📦 Création d'une sauvegarde..."
tar -czf backup-before-variables-migration.tar.gz src/

echo "📝 Remplacement des variables..."

# Remplacer concertId par dateId
find src $EXCLUDE_DIRS -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "concertId" "$file" 2>/dev/null; then
        sed -i '' 's/concertId/dateId/g' "$file"
        echo "  ✅ concertId -> dateId dans: $file"
    fi
done

# Remplacer concertIds par dateIds  
find src $EXCLUDE_DIRS -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "concertIds" "$file" 2>/dev/null; then
        sed -i '' 's/concertIds/dateIds/g' "$file"
        echo "  ✅ concertIds -> dateIds dans: $file"
    fi
done

# Remplacer concertData par dateData
find src $EXCLUDE_DIRS -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "concertData" "$file" 2>/dev/null; then
        sed -i '' 's/concertData/dateData/g' "$file"
        echo "  ✅ concertData -> dateData dans: $file"
    fi
done

# Remplacer concert. par date. (accès aux propriétés)
find src $EXCLUDE_DIRS -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "concert\." "$file" 2>/dev/null; then
        sed -i '' 's/concert\./date\./g' "$file"
        echo "  ✅ concert. -> date. dans: $file"
    fi
done

# Remplacer les tableaux concerts par dates
find src $EXCLUDE_DIRS -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "concerts\[" "$file" 2>/dev/null; then
        sed -i '' 's/concerts\[/dates\[/g' "$file"
        echo "  ✅ concerts[ -> dates[ dans: $file"
    fi
done

# Remplacer const concert = par const date =
find src $EXCLUDE_DIRS -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "const concert =" "$file" 2>/dev/null; then
        sed -i '' 's/const concert =/const date =/g' "$file"
        echo "  ✅ const concert = -> const date = dans: $file"
    fi
done

# Remplacer let concert = par let date =
find src $EXCLUDE_DIRS -name "*.js" -o -name "*.jsx" | while read file; do
    if grep -q "let concert =" "$file" 2>/dev/null; then
        sed -i '' 's/let concert =/let date =/g' "$file"
        echo "  ✅ let concert = -> let date = dans: $file"
    fi
done

echo "✨ Migration des variables terminée!"
echo "⚠️  Une sauvegarde a été créée : backup-before-variables-migration.tar.gz"