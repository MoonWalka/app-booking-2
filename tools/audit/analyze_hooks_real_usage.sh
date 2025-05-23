#!/bin/bash

# Script d'analyse CORRIGÉ des hooks
# Prend en compte les exports dans index.js et l'utilisation réelle

echo "🔍 ANALYSE CORRIGÉE DES HOOKS - UTILISATION RÉELLE"
echo "=================================================="

REPORT_FILE="real_hook_usage_analysis.txt"
echo "📋 Rapport généré le $(date)" > $REPORT_FILE
echo "==================================================" >> $REPORT_FILE

echo ""
echo "🚨 VÉRIFICATION DES EXPORTS DANS LES INDEX.JS..."

# Fonction pour vérifier l'utilisation réelle d'un hook
check_real_usage() {
    local hook_file=$1
    local hook_name=$(basename "$hook_file" .js)
    
    echo "🔍 Analyse: $hook_name" >> $REPORT_FILE
    echo "  📄 Fichier: $hook_file" >> $REPORT_FILE
    
    # 1. Vérifier si exporté dans un index.js
    local exports_in_index=$(grep -r "export.*$hook_name" src/hooks/*/index.js 2>/dev/null | wc -l)
    echo "  📤 Exports dans index.js: $exports_in_index" >> $REPORT_FILE
    
    # 2. Vérifier les imports directs (exclure le fichier lui-même et les index)
    local direct_imports=$(grep -r "import.*$hook_name" src/ 2>/dev/null | grep -v "$hook_file" | grep -v "index.js" | wc -l)
    echo "  📥 Imports directs: $direct_imports" >> $REPORT_FILE
    
    # 3. Vérifier l'utilisation dans le code (exclure définitions et imports)
    local code_usage=$(grep -r "$hook_name" src/ 2>/dev/null | grep -v "$hook_file" | grep -v "import" | grep -v "export" | grep -v "index.js" | wc -l)
    echo "  💻 Utilisation dans le code: $code_usage" >> $REPORT_FILE
    
    # 4. Vérifier dans les fichiers de test
    local test_usage=$(find . -name "*.test.js" -o -name "*.spec.js" | xargs grep "$hook_name" 2>/dev/null | wc -l)
    echo "  🧪 Utilisation dans les tests: $test_usage" >> $REPORT_FILE
    
    local total_usage=$((exports_in_index + direct_imports + code_usage + test_usage))
    echo "  📊 TOTAL D'UTILISATION: $total_usage" >> $REPORT_FILE
    
    if [ $total_usage -eq 0 ]; then
        echo "  ❌ VRAIMENT INUTILISÉ - CANDIDAT POUR SUPPRESSION" >> $REPORT_FILE
        echo "❌ $hook_name - VRAIMENT INUTILISÉ"
        return 0
    else
        echo "  ✅ UTILISÉ QUELQUE PART - À CONSERVER" >> $REPORT_FILE
        echo "✅ $hook_name - UTILISÉ ($total_usage références)"
        return 1
    fi
    
    echo "" >> $REPORT_FILE
}

echo ""
echo "🔍 ANALYSE DE TOUS LES HOOKS AVEC VERSIONS MULTIPLES..."

TRULY_UNUSED=()
USED_HOOKS=()

# Analyser tous les hooks Migrated, Optimized, Complete
for hook_file in $(find src/hooks -name "*Migrated.js" -o -name "*Optimized.js" -o -name "*Complete.js" | sort); do
    if check_real_usage "$hook_file"; then
        TRULY_UNUSED+=("$hook_file")
    else
        USED_HOOKS+=("$hook_file")
    fi
done

echo ""
echo "📊 RÉSULTATS DE L'ANALYSE CORRIGÉE:"
echo "====================================" >> $REPORT_FILE

echo "🗑️ HOOKS VRAIMENT INUTILISÉS (suppression sûre):" >> $REPORT_FILE
if [ ${#TRULY_UNUSED[@]} -eq 0 ]; then
    echo "  ✅ Aucun hook vraiment inutilisé trouvé !" >> $REPORT_FILE
    echo "✅ BONNE NOUVELLE: Aucun hook vraiment inutilisé !"
else
    for hook in "${TRULY_UNUSED[@]}"; do
        echo "  🗑️ $hook" >> $REPORT_FILE
    done
    echo "🗑️ ${#TRULY_UNUSED[@]} hooks vraiment inutilisés trouvés"
fi

echo "" >> $REPORT_FILE
echo "✅ HOOKS UTILISÉS (à conserver):" >> $REPORT_FILE
for hook in "${USED_HOOKS[@]}"; do
    echo "  ✅ $hook" >> $REPORT_FILE
done

echo ""
echo "📋 Rapport détaillé sauvegardé dans: $REPORT_FILE"

# Résumé final
echo ""
echo "🎯 CONCLUSION:"
echo "  📁 Total hooks analysés: $((${#TRULY_UNUSED[@]} + ${#USED_HOOKS[@]}))"
echo "  🗑️ Vraiment inutilisés: ${#TRULY_UNUSED[@]}"
echo "  ✅ En utilisation: ${#USED_HOOKS[@]}"

if [ ${#TRULY_UNUSED[@]} -gt 0 ]; then
    echo ""
    echo "⚠️ Il y a ${#TRULY_UNUSED[@]} hooks qui peuvent être supprimés en sécurité."
    echo "   Examinez le rapport détaillé avant de procéder."
else
    echo ""
    echo "🎉 Excellente nouvelle ! Tous les hooks alternatifs sont utilisés."
    echo "   Aucune suppression automatique recommandée pour l'instant."
fi 