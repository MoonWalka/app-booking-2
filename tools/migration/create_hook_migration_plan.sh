#!/bin/bash

# Script de création d'un plan de migration des hooks
# Identifie la version la plus utilisée et crée une stratégie de migration

echo "🔄 CRÉATION DU PLAN DE MIGRATION DES HOOKS"
echo "=========================================="

REPORT_FILE="hook_migration_plan.txt"
echo "📋 Plan de migration généré le $(date)" > $REPORT_FILE
echo "==========================================" >> $REPORT_FILE

# Fonction pour analyser l'utilisation d'un groupe de hooks
analyze_hook_group() {
    local base_name=$1
    local domain=$2
    
    echo "" >> $REPORT_FILE
    echo "🔍 ANALYSE: $base_name dans $domain" >> $REPORT_FILE
    echo "----------------------------------------" >> $REPORT_FILE
    
    # Chercher toutes les versions
    local original=$(find src/hooks/$domain -name "$base_name.js" 2>/dev/null)
    local migrated=$(find src/hooks/$domain -name "${base_name}Migrated.js" 2>/dev/null)
    local optimized=$(find src/hooks/$domain -name "${base_name}Optimized.js" 2>/dev/null)
    local complete=$(find src/hooks/$domain -name "${base_name}Complete.js" 2>/dev/null)
    
    local versions=()
    local usage_counts=()
    local file_paths=()
    
    # Analyser chaque version
    for version_file in $original $migrated $optimized $complete; do
        if [ -n "$version_file" ] && [ -f "$version_file" ]; then
            local hook_name=$(basename "$version_file" .js)
            
            # Compter l'utilisation réelle
            local exports_count=$(grep -r "export.*$hook_name" src/hooks/*/index.js 2>/dev/null | wc -l)
            local imports_count=$(grep -r "import.*$hook_name" src/ 2>/dev/null | grep -v "$version_file" | grep -v "index.js" | wc -l)
            local usage_count=$(grep -r "$hook_name" src/ 2>/dev/null | grep -v "$version_file" | grep -v "import" | grep -v "export" | grep -v "index.js" | wc -l)
            
            local total_usage=$((exports_count + imports_count + usage_count))
            
            versions+=("$hook_name")
            usage_counts+=("$total_usage")
            file_paths+=("$version_file")
            
            echo "  📊 $hook_name: $total_usage références totales" >> $REPORT_FILE
            echo "    - Exports: $exports_count, Imports: $imports_count, Usage: $usage_count" >> $REPORT_FILE
        fi
    done
    
    # Trouver la version la plus utilisée
    local max_usage=0
    local best_version=""
    local best_file=""
    
    for i in "${!versions[@]}"; do
        if [ "${usage_counts[$i]}" -gt "$max_usage" ]; then
            max_usage="${usage_counts[$i]}"
            best_version="${versions[$i]}"
            best_file="${file_paths[$i]}"
        fi
    done
    
    if [ ${#versions[@]} -gt 1 ]; then
        echo "" >> $REPORT_FILE
        echo "🎯 RECOMMANDATION:" >> $REPORT_FILE
        echo "  ✅ Version cible: $best_version ($max_usage références)" >> $REPORT_FILE
        echo "  📁 Fichier cible: $best_file" >> $REPORT_FILE
        echo "" >> $REPORT_FILE
        echo "🔄 VERSIONS À MIGRER:" >> $REPORT_FILE
        
        local has_migration_targets=false
        for i in "${!versions[@]}"; do
            if [ "${versions[$i]}" != "$best_version" ] && [ "${usage_counts[$i]}" -gt 0 ]; then
                echo "  ➡️  ${versions[$i]} (${usage_counts[$i]} références) → $best_version" >> $REPORT_FILE
                has_migration_targets=true
            fi
        done
        
        if [ "$has_migration_targets" = false ]; then
            echo "  ✅ Aucune migration nécessaire - toutes les références pointent déjà vers la meilleure version" >> $REPORT_FILE
        fi
        
        echo "" >> $REPORT_FILE
        echo "📋 $base_name,$best_version,$best_file" >> migration_targets.csv
    fi
}

# Créer le fichier CSV des cibles de migration
echo "hook_base,target_version,target_file" > migration_targets.csv

echo ""
echo "🔍 Analyse des domaines de hooks..."

# Analyser chaque domaine
DOMAINS=("lieux" "artistes" "concerts" "programmateurs" "structures" "contrats")

for domain in "${DOMAINS[@]}"; do
    echo ""
    echo "📂 Analysing domain: $domain"
    
    if [ -d "src/hooks/$domain" ]; then
        # Extraire les noms de base des hooks pour ce domaine
        BASE_NAMES=$(find src/hooks/$domain -name "*.js" | xargs -I {} basename {} .js | sed 's/Migrated\|Optimized\|Complete//' | sort -u)
        
        for base_name in $BASE_NAMES; do
            # Vérifier s'il y a plusieurs versions
            VERSION_COUNT=$(find src/hooks/$domain -name "${base_name}*.js" | wc -l)
            if [ $VERSION_COUNT -gt 1 ]; then
                echo "  🔍 Analysing $base_name ($VERSION_COUNT versions)"
                analyze_hook_group "$base_name" "$domain"
            fi
        done
    fi
done

echo "" >> $REPORT_FILE
echo "📊 PLAN DE MIGRATION PRIORITAIRE" >> $REPORT_FILE
echo "=================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "🚀 ÉTAPES RECOMMANDÉES:" >> $REPORT_FILE
echo "1. Commencer par les hooks les plus utilisés" >> $REPORT_FILE
echo "2. Migrer progressivement les imports" >> $REPORT_FILE
echo "3. Tester après chaque migration" >> $REPORT_FILE
echo "4. Supprimer les versions obsolètes une fois migrées" >> $REPORT_FILE

echo ""
echo "✅ ANALYSE TERMINÉE !"
echo "===================="
echo "📋 Plan détaillé: $REPORT_FILE"
echo "📊 Cibles de migration: migration_targets.csv"

# Afficher un résumé
if [ -f migration_targets.csv ]; then
    MIGRATION_COUNT=$(tail -n +2 migration_targets.csv | wc -l)
    echo "🎯 $MIGRATION_COUNT groupes de hooks nécessitent une migration"
    
    echo ""
    echo "🔄 APERÇU DES MIGRATIONS PRIORITAIRES:"
    head -6 migration_targets.csv | tail -5 | while IFS=',' read -r hook_base target_version target_file; do
        echo "  ➡️  $hook_base → $target_version"
    done
fi 