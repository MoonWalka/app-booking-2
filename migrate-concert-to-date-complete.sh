#!/bin/bash

echo "🎵 Migration complète Concert → Date"
echo "=================================="
echo ""
echo "Cette migration va remplacer toutes les occurrences de 'concert' par 'date'"
echo "dans les contextes appropriés, en préservant le type 'Concert' comme type d'événement."
echo ""

# Mode dry-run par défaut
DRY_RUN=${1:-"--dry-run"}

if [ "$DRY_RUN" = "--execute" ]; then
    echo "⚠️  MODE EXÉCUTION - Les fichiers seront modifiés!"
    read -p "Êtes-vous sûr de vouloir continuer? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration annulée."
        exit 1
    fi
else
    echo "🔍 MODE DRY-RUN - Aucun fichier ne sera modifié"
    echo "Pour exécuter réellement: ./migrate-concert-to-date-complete.sh --execute"
    echo ""
fi

# Fonction pour effectuer les remplacements
perform_replacements() {
    local file=$1
    local count=0
    
    # Variables de template dans contractVariables.js
    if [[ "$file" == *"contractVariables.js"* ]]; then
        echo "  📄 Traitement spécial pour contractVariables.js"
        
        if [ "$DRY_RUN" = "--execute" ]; then
            # Variables de template
            sed -i '' 's/concert_titre/date_titre/g' "$file"
            sed -i '' 's/concert_date/date_date/g' "$file"
            sed -i '' 's/concert_montant/date_montant/g' "$file"
            sed -i '' 's/concert_montant_lettres/date_montant_lettres/g' "$file"
            sed -i '' 's/concert_lieu/date_lieu/g' "$file"
            sed -i '' 's/concert_adresse/date_adresse/g' "$file"
            sed -i '' 's/concert_ville/date_ville/g' "$file"
            sed -i '' 's/concert_heure/date_heure/g' "$file"
            sed -i '' 's/concert_prix/date_prix/g' "$file"
        fi
        
        count=$((count + $(grep -c "concert_" "$file" 2>/dev/null || echo 0)))
    fi
    
    # Props de composants
    if [ "$DRY_RUN" = "--execute" ]; then
        # Props dans les définitions de fonctions
        sed -i '' 's/{ concert,/{ date,/g' "$file"
        sed -i '' 's/{concert,/{date,/g' "$file"
        sed -i '' 's/, concert,/, date,/g' "$file"
        sed -i '' 's/, concert }/, date }/g' "$file"
        sed -i '' 's/{ concert }/{ date }/g' "$file"
        
        # Props avec destructuring
        sed -i '' 's/concert: propConcert/date: propDate/g' "$file"
        sed -i '' 's/concert: concert/date: date/g' "$file"
        
        # Utilisation de props
        sed -i '' 's/props\.concert/props.date/g' "$file"
        sed -i '' 's/\bconcert\?\./date?./g' "$file"
        sed -i '' 's/\bconcert\.\([a-zA-Z]\)/date.\1/g' "$file"
        
        # État React
        sed -i '' 's/\[concert, setConcert\]/[date, setDate]/g' "$file"
        sed -i '' 's/setConcert(/setDate(/g' "$file"
        sed -i '' 's/const concert =/const date =/g' "$file"
        sed -i '' 's/let concert =/let date =/g' "$file"
        
        # Paramètres de fonction
        sed -i '' 's/function[^(]*(\([^)]*\)concert\([^)]*\))/function\1date\2)/g' "$file"
        sed -i '' 's/=> concert\./=> date./g' "$file"
        
        # Objets et arrays
        sed -i '' 's/concerts: \[/dates: [/g' "$file"
        sed -i '' 's/\.concerts\[\./\.dates[./g' "$file"
        sed -i '' 's/\bconcerts\.\(map\|filter\|find\)/dates.\1/g' "$file"
        sed -i '' 's/concertsIds/datesIds/g' "$file"
        sed -i '' 's/concertsAssocies/datesAssociees/g' "$file"
        
        # IDs et références
        sed -i '' 's/concertId/dateId/g' "$file"
        sed -i '' 's/concert_id/date_id/g' "$file"
        sed -i '' 's/concertIds/dateIds/g' "$file"
        
        # Commentaires
        sed -i '' 's/\/\/ concert/\/\/ date/g' "$file"
        sed -i '' 's/\/\* concert/\/* date/g' "$file"
        sed -i '' 's/\* concert/\* date/g' "$file"
        
        # Messages et logs
        sed -i '' "s/'concert'/'date'/g" "$file"
        sed -i '' 's/"concert"/"date"/g' "$file"
        sed -i '' 's/`concert`/`date`/g' "$file"
        
        # Ne PAS remplacer le type Concert (avec majuscule) ni la collection concerts
        # Ces remplacements sont exclus volontairement
    else
        # Mode dry-run - juste compter
        count=$(grep -c "\bconcert" "$file" 2>/dev/null || echo 0)
    fi
    
    echo "$count"
}

# Fichiers à migrer en priorité (top 10 selon l'audit)
PRIORITY_FILES=(
    "src/components/contrats/desktop/ContratInfoCard.js"
    "src/pages/ContratDetailsPage.js"
    "src/utils/contractVariables.js"
    "src/components/contrats/desktop/ContratGeneratorNew.js"
    "src/components/debug/BrevoTemplateCreator.js"
    "src/components/structure/StructureForm.js"
    "src/components/contrats/desktop/ContratPDFWrapper.js"
    "src/components/lieux/LieuxListSearchFilter.js"
    "src/components/structure/StructureView.js"
    "src/components/debug/DateLieuDebug.js"
)

echo "📋 Migration des fichiers prioritaires..."
echo ""

total_occurrences=0
total_files=0

for file in "${PRIORITY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Traitement de $file"
        occurrences=$(perform_replacements "$file")
        if [ "$occurrences" -gt 0 ]; then
            echo "   → $occurrences occurrences trouvées"
            total_occurrences=$((total_occurrences + occurrences))
            total_files=$((total_files + 1))
        fi
    else
        echo "❌ Fichier non trouvé: $file"
    fi
done

echo ""
echo "📋 Recherche des autres fichiers contenant 'concert'..."
echo ""

# Rechercher tous les autres fichiers JS/JSX contenant "concert"
while IFS= read -r file; do
    # Ignorer les fichiers de test et déjà traités
    if [[ ! "$file" =~ \.test\. ]] && [[ ! "$file" =~ \.spec\. ]] && [[ ! "$file" =~ node_modules ]] && [[ ! " ${PRIORITY_FILES[@]} " =~ " ${file} " ]]; then
        occurrences=$(grep -c "\bconcert" "$file" 2>/dev/null || echo 0)
        if [ "$occurrences" -gt 0 ]; then
            echo "📄 $file: $occurrences occurrences"
            if [ "$DRY_RUN" = "--execute" ]; then
                perform_replacements "$file" > /dev/null
            fi
            total_occurrences=$((total_occurrences + occurrences))
            total_files=$((total_files + 1))
        fi
    fi
done < <(find src -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v ".test." | grep -v ".spec.")

echo ""
echo "=================================="
echo "📊 Résumé de la migration:"
echo "  - Fichiers impactés: $total_files"
echo "  - Occurrences totales: $total_occurrences"
echo ""

if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "🔍 Ceci était un dry-run. Pour exécuter réellement:"
    echo "   ./migrate-concert-to-date-complete.sh --execute"
else
    echo "✅ Migration terminée!"
    echo ""
    echo "⚠️  IMPORTANT: Vérifiez et testez votre application"
    echo "   - Lancez les tests: npm test"
    echo "   - Testez la génération de contrats"
    echo "   - Vérifiez les templates d'email"
fi