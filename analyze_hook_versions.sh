#!/bin/bash

# Script d'analyse des versions multiples de hooks
# Identifie quelles versions sont réellement utilisées

echo "🔍 ANALYSE DES VERSIONS MULTIPLES DE HOOKS"
echo "=========================================="

REPORT_FILE="hook_versions_analysis.txt"
echo "📋 Rapport généré le $(date)" > $REPORT_FILE
echo "=========================================" >> $REPORT_FILE

# Fonction pour analyser un pattern de hooks
analyze_hook_pattern() {
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
    
    echo "Versions trouvées:" >> $REPORT_FILE
    [ -n "$original" ] && echo "  ✓ Original: $original" >> $REPORT_FILE
    [ -n "$migrated" ] && echo "  🔄 Migrated: $migrated" >> $REPORT_FILE
    [ -n "$optimized" ] && echo "  ⚡ Optimized: $optimized" >> $REPORT_FILE
    [ -n "$complete" ] && echo "  ✅ Complete: $complete" >> $REPORT_FILE
    
    # Analyser les imports pour chaque version
    for version_file in $original $migrated $optimized $complete; do
        if [ -n "$version_file" ] && [ -f "$version_file" ]; then
            local hook_name=$(basename "$version_file" .js)
            local import_count=$(grep -r "import.*$hook_name" src/ 2>/dev/null | grep -v "$version_file" | wc -l)
            local usage_count=$(grep -r "$hook_name" src/ 2>/dev/null | grep -v "$version_file" | grep -v "import" | wc -l)
            
            echo "  📊 $hook_name: $import_count imports, $usage_count usages" >> $REPORT_FILE
            
            if [ $import_count -eq 0 ] && [ $usage_count -eq 0 ]; then
                echo "    ❌ PROBABLEMENT INUTILISÉ" >> $REPORT_FILE
            elif [ $import_count -gt 0 ]; then
                echo "    ✅ UTILISÉ ACTIVEMENT" >> $REPORT_FILE
            fi
        fi
    done
}

echo ""
echo "🔍 Analyse des domaines de hooks..."

# Analyser chaque domaine
DOMAINS=("lieux" "artistes" "concerts" "programmateurs" "structures" "contrats")

for domain in "${DOMAINS[@]}"; do
    echo ""
    echo "📂 Domaine: $domain"
    echo "=================" >> $REPORT_FILE
    
    if [ -d "src/hooks/$domain" ]; then
        # Extraire les noms de base des hooks pour ce domaine
        BASE_NAMES=$(find src/hooks/$domain -name "*.js" | xargs -I {} basename {} .js | sed 's/Migrated\|Optimized\|Complete//' | sort -u)
        
        for base_name in $BASE_NAMES; do
            # Vérifier s'il y a plusieurs versions
            VERSION_COUNT=$(find src/hooks/$domain -name "${base_name}*.js" | wc -l)
            if [ $VERSION_COUNT -gt 1 ]; then
                echo "  🔍 $base_name ($VERSION_COUNT versions)"
                analyze_hook_pattern "$base_name" "$domain"
            fi
        done
    else
        echo "  ❌ Dossier non trouvé: src/hooks/$domain"
    fi
done

echo ""
echo "📊 RECOMMANDATIONS BASÉES SUR L'USAGE" >> $REPORT_FILE
echo "=====================================" >> $REPORT_FILE

# Générer des recommandations automatiques
echo "STRATÉGIE DE CONSOLIDATION:" >> $REPORT_FILE
echo "1. SUPPRIMER les versions avec 0 imports ET 0 usages" >> $REPORT_FILE
echo "2. GARDER la version la plus utilisée (généralement Optimized)" >> $REPORT_FILE
echo "3. MIGRER les imports des versions moins utilisées vers la version principale" >> $REPORT_FILE
echo "4. TESTER après chaque suppression" >> $REPORT_FILE

echo ""
echo "📋 Rapport détaillé sauvegardé dans: $REPORT_FILE"
echo "🔍 Examinez le rapport pour identifier les versions à supprimer"

# Résumé rapide
echo ""
echo "📊 RÉSUMÉ RAPIDE:"
TOTAL_MIGRATED=$(find src/hooks -name "*Migrated.js" | wc -l)
TOTAL_OPTIMIZED=$(find src/hooks -name "*Optimized.js" | wc -l)
TOTAL_COMPLETE=$(find src/hooks -name "*Complete.js" | wc -l)

echo "  🔄 Versions 'Migrated': $TOTAL_MIGRATED"
echo "  ⚡ Versions 'Optimized': $TOTAL_OPTIMIZED" 
echo "  ✅ Versions 'Complete': $TOTAL_COMPLETE"
echo "  📁 Total versions alternatives: $((TOTAL_MIGRATED + TOTAL_OPTIMIZED + TOTAL_COMPLETE))" 