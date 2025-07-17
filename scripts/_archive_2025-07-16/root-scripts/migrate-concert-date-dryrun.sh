#!/bin/bash

# Script de migration Concert → Date avec mode dry-run
# Usage: ./migrate-concert-date-dryrun.sh [true|false]
# true = dry-run (défaut), false = application réelle

DRY_RUN=${1:-true}
REPORT_FILE="migration-dryrun-report-$(date +%Y%m%d_%H%M%S).txt"

echo "🔄 MIGRATION CONCERT → DATE"
echo "=========================="
echo ""

if [ "$DRY_RUN" = "false" ]; then
    echo "⚠️  MODE RÉEL - Les modifications seront appliquées!"
    read -p "Êtes-vous sûr? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "🔍 MODE DRY-RUN - Aucune modification ne sera appliquée"
    echo "📄 Rapport sera généré dans: $REPORT_FILE"
    echo ""
fi

# Initialiser le rapport
echo "RAPPORT DE MIGRATION CONCERT → DATE" > "$REPORT_FILE"
echo "===================================" >> "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "Mode: $([ "$DRY_RUN" = "true" ] && echo "DRY-RUN" || echo "RÉEL")" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Fonction pour logger
log_change() {
    local file=$1
    local line=$2
    local old=$3
    local new=$4
    echo "📝 $file:$line" | tee -a "$REPORT_FILE"
    echo "   - AVANT: $old" | tee -a "$REPORT_FILE"
    echo "   + APRÈS: $new" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
}

# Phase 1: Collections Firebase
echo -e "\n🎯 PHASE 1: Collections Firebase" | tee -a "$REPORT_FILE"
echo "================================" | tee -a "$REPORT_FILE"

# Rechercher les collections concerts
grep -n "collection.*concerts" src/ -r --include="*.js" | while IFS=: read -r file line content; do
    if [[ "$content" =~ collection.*[\'\"]\s*concerts\s*[\'\"] ]]; then
        new_content=$(echo "$content" | sed 's/concerts/dates/g')
        log_change "$file" "$line" "$content" "$new_content"
        
        if [ "$DRY_RUN" = "false" ]; then
            sed -i '' "${line}s/concerts/dates/g" "$file"
        fi
    fi
done

# Phase 2: Propriétés d'objets
echo -e "\n🎯 PHASE 2: Propriétés d'objets" | tee -a "$REPORT_FILE"
echo "================================" | tee -a "$REPORT_FILE"

# concertsAssocies → datesAssociees
echo -e "\n📌 Migration: concertsAssocies → datesAssociees" | tee -a "$REPORT_FILE"
grep -n "concertsAssocies" src/ -r --include="*.js" | while IFS=: read -r file line content; do
    new_content=$(echo "$content" | sed 's/concertsAssocies/datesAssociees/g')
    log_change "$file" "$line" "$content" "$new_content"
    
    if [ "$DRY_RUN" = "false" ]; then
        sed -i '' "${line}s/concertsAssocies/datesAssociees/g" "$file"
    fi
done

# concertsIds → datesIds
echo -e "\n📌 Migration: concertsIds → datesIds" | tee -a "$REPORT_FILE"
grep -n "concertsIds" src/ -r --include="*.js" | while IFS=: read -r file line content; do
    new_content=$(echo "$content" | sed 's/concertsIds/datesIds/g')
    log_change "$file" "$line" "$content" "$new_content"
    
    if [ "$DRY_RUN" = "false" ]; then
        sed -i '' "${line}s/concertsIds/datesIds/g" "$file"
    fi
done

# Phase 3: Variables dans les maps et forEach
echo -e "\n🎯 PHASE 3: Variables dans les boucles" | tee -a "$REPORT_FILE"
echo "=====================================" | tee -a "$REPORT_FILE"

# .map((concert
echo -e "\n📌 Migration: .map((concert → .map((date" | tee -a "$REPORT_FILE"
grep -n "\.map.*concert[^s]" src/ -r --include="*.js" | while IFS=: read -r file line content; do
    if [[ "$content" =~ \.map\s*\(\s*\(?concert ]]; then
        new_content=$(echo "$content" | sed 's/\.map(\s*(\?concert/\.map((date/g')
        log_change "$file" "$line" "$content" "$new_content"
        
        if [ "$DRY_RUN" = "false" ]; then
            # Cette modification est plus complexe, nécessite une vérification manuelle
            echo "   ⚠️  Nécessite vérification manuelle" >> "$REPORT_FILE"
        fi
    fi
done

# Phase 4: Variables const/let concert
echo -e "\n🎯 PHASE 4: Déclarations de variables" | tee -a "$REPORT_FILE"
echo "====================================" | tee -a "$REPORT_FILE"

grep -n "const concert\|let concert" src/ -r --include="*.js" | while IFS=: read -r file line content; do
    # Vérifier que ce n'est pas un type
    if [[ ! "$content" =~ type.*Concert && ! "$content" =~ [\'\"]Concert[\'\"] ]]; then
        new_content=$(echo "$content" | sed 's/\(const\|let\) concert/\1 date/g')
        log_change "$file" "$line" "$content" "$new_content"
        
        if [ "$DRY_RUN" = "false" ]; then
            sed -i '' "${line}s/\(const\|let\) concert/\1 date/g" "$file"
        fi
    fi
done

# Phase 5: Titres et labels UI
echo -e "\n🎯 PHASE 5: Textes UI" | tee -a "$REPORT_FILE"
echo "====================" | tee -a "$REPORT_FILE"

# Rechercher les titres mentionnant Concerts
grep -n "Concerts\|concerts" src/ -r --include="*.js" | grep -E "title|label|placeholder" | while IFS=: read -r file line content; do
    if [[ "$content" =~ [\'\"](.*[Cc]oncerts.*)(s?)[\'\"] ]]; then
        new_content=$(echo "$content" | sed 's/Concerts/Dates/g' | sed 's/concerts/dates/g')
        log_change "$file" "$line" "$content" "$new_content"
        
        if [ "$DRY_RUN" = "false" ]; then
            # Modification manuelle recommandée pour les textes UI
            echo "   ⚠️  Vérification manuelle recommandée (texte UI)" >> "$REPORT_FILE"
        fi
    fi
done

# Résumé
echo -e "\n📊 RÉSUMÉ" | tee -a "$REPORT_FILE"
echo "=========" | tee -a "$REPORT_FILE"

# Compter les modifications potentielles
TOTAL_CHANGES=$(grep -c "AVANT:" "$REPORT_FILE")
echo "Total de modifications identifiées: $TOTAL_CHANGES" | tee -a "$REPORT_FILE"

# Lister les fichiers impactés
echo -e "\n📁 Fichiers impactés:" | tee -a "$REPORT_FILE"
grep "📝" "$REPORT_FILE" | cut -d' ' -f2 | cut -d':' -f1 | sort -u | tee -a "$REPORT_FILE"

echo -e "\n✅ Analyse terminée!"
echo "📄 Rapport complet disponible dans: $REPORT_FILE"

# Avertissements
echo -e "\n⚠️  AVERTISSEMENTS:" | tee -a "$REPORT_FILE"
echo "- Certaines modifications nécessitent une vérification manuelle" | tee -a "$REPORT_FILE"
echo "- Les types 'Concert' ne doivent PAS être modifiés" | tee -a "$REPORT_FILE"
echo "- Les textes UI doivent être vérifiés pour le contexte" | tee -a "$REPORT_FILE"

if [ "$DRY_RUN" = "true" ]; then
    echo -e "\n💡 Pour appliquer les modifications, exécutez:"
    echo "   ./migrate-concert-date-dryrun.sh false"
fi