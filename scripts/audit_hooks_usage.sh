#!/bin/bash

echo "🔍 AUDIT EXHAUSTIF DES HOOKS - UTILISATION vs ORPHELINS"
echo "======================================================="
echo ""

# Créer le fichier de résultats
RESULT_FILE="hooks_usage_audit.md"
echo "# Audit Exhaustif des Hooks - Utilisation vs Orphelins" > $RESULT_FILE
echo "" >> $RESULT_FILE
echo "**Date:** $(date)" >> $RESULT_FILE
echo "" >> $RESULT_FILE

# Compteurs
TOTAL_HOOKS=0
USED_HOOKS=0
ORPHAN_HOOKS=0

echo "## 📊 Analyse en cours..." >> $RESULT_FILE
echo "" >> $RESULT_FILE

# Lister tous les hooks (hors tests et index)
HOOKS=$(find src/hooks -name "*.js" -type f | grep -v __tests__ | grep -v "/index.js" | sort)

echo "## 📋 Liste Complète des Hooks" >> $RESULT_FILE
echo "" >> $RESULT_FILE

# Analyser chaque hook
for hook in $HOOKS; do
    TOTAL_HOOKS=$((TOTAL_HOOKS + 1))
    
    # Extraire le nom du hook (sans extension et chemin)
    HOOK_NAME=$(basename "$hook" .js)
    
    echo "Analyse: $HOOK_NAME..."
    
    # Chercher les imports de ce hook dans tout le projet (hors node_modules et tests)
    USAGE_COUNT=$(grep -r "import.*$HOOK_NAME" src/ --include="*.js" --include="*.jsx" | grep -v __tests__ | grep -v "$hook" | wc -l | tr -d ' ')
    
    # Chercher aussi les imports avec des chemins relatifs
    RELATIVE_USAGE=$(grep -r "from.*$HOOK_NAME" src/ --include="*.js" --include="*.jsx" | grep -v __tests__ | grep -v "$hook" | wc -l | tr -d ' ')
    
    # Chercher les imports avec require
    REQUIRE_USAGE=$(grep -r "require.*$HOOK_NAME" src/ --include="*.js" --include="*.jsx" | grep -v __tests__ | grep -v "$hook" | wc -l | tr -d ' ')
    
    TOTAL_USAGE=$((USAGE_COUNT + RELATIVE_USAGE + REQUIRE_USAGE))
    
    if [ $TOTAL_USAGE -gt 0 ]; then
        USED_HOOKS=$((USED_HOOKS + 1))
        echo "| ✅ **$HOOK_NAME** | $TOTAL_USAGE utilisations | \`$hook\` |" >> $RESULT_FILE
        
        # Détailler les utilisations
        if [ $TOTAL_USAGE -le 5 ]; then
            echo "  - Utilisé dans:" >> $RESULT_FILE
            grep -r "import.*$HOOK_NAME\|from.*$HOOK_NAME\|require.*$HOOK_NAME" src/ --include="*.js" --include="*.jsx" | grep -v __tests__ | grep -v "$hook" | head -5 | while read line; do
                FILE=$(echo "$line" | cut -d: -f1)
                echo "    - \`$FILE\`" >> $RESULT_FILE
            done
            echo "" >> $RESULT_FILE
        fi
    else
        ORPHAN_HOOKS=$((ORPHAN_HOOKS + 1))
        echo "| ❌ **$HOOK_NAME** | 0 utilisation | \`$hook\` |" >> $RESULT_FILE
    fi
done

echo "" >> $RESULT_FILE
echo "## 📊 Statistiques Globales" >> $RESULT_FILE
echo "" >> $RESULT_FILE
echo "| Métrique | Valeur | Pourcentage |" >> $RESULT_FILE
echo "|----------|--------|-------------|" >> $RESULT_FILE
echo "| **Total des hooks** | $TOTAL_HOOKS | 100% |" >> $RESULT_FILE
echo "| **Hooks utilisés** | $USED_HOOKS | $((USED_HOOKS * 100 / TOTAL_HOOKS))% |" >> $RESULT_FILE
echo "| **Hooks orphelins** | $ORPHAN_HOOKS | $((ORPHAN_HOOKS * 100 / TOTAL_HOOKS))% |" >> $RESULT_FILE
echo "" >> $RESULT_FILE

echo "## 🎯 Hooks Orphelins (Candidats à la Suppression)" >> $RESULT_FILE
echo "" >> $RESULT_FILE

# Lister uniquement les hooks orphelins
for hook in $HOOKS; do
    HOOK_NAME=$(basename "$hook" .js)
    USAGE_COUNT=$(grep -r "import.*$HOOK_NAME" src/ --include="*.js" --include="*.jsx" | grep -v __tests__ | grep -v "$hook" | wc -l | tr -d ' ')
    RELATIVE_USAGE=$(grep -r "from.*$HOOK_NAME" src/ --include="*.js" --include="*.jsx" | grep -v __tests__ | grep -v "$hook" | wc -l | tr -d ' ')
    REQUIRE_USAGE=$(grep -r "require.*$HOOK_NAME" src/ --include="*.js" --include="*.jsx" | grep -v __tests__ | grep -v "$hook" | wc -l | tr -d ' ')
    TOTAL_USAGE=$((USAGE_COUNT + RELATIVE_USAGE + REQUIRE_USAGE))
    
    if [ $TOTAL_USAGE -eq 0 ]; then
        echo "- \`$hook\`" >> $RESULT_FILE
    fi
done

echo "" >> $RESULT_FILE
echo "## 🔍 Analyse des Duplications" >> $RESULT_FILE
echo "" >> $RESULT_FILE

# Analyser les duplications de noms
echo "### Hooks avec des noms similaires :" >> $RESULT_FILE
echo "" >> $RESULT_FILE

# Chercher les patterns de duplication
for hook in $HOOKS; do
    HOOK_NAME=$(basename "$hook" .js)
    SIMILAR=$(find src/hooks -name "*$HOOK_NAME*" -type f | grep -v __tests__ | grep -v "$hook" | head -3)
    if [ ! -z "$SIMILAR" ]; then
        echo "**$HOOK_NAME** :" >> $RESULT_FILE
        echo "- Principal: \`$hook\`" >> $RESULT_FILE
        echo "$SIMILAR" | while read similar_hook; do
            echo "- Similaire: \`$similar_hook\`" >> $RESULT_FILE
        done
        echo "" >> $RESULT_FILE
    fi
done

echo ""
echo "✅ Audit terminé ! Résultats dans: $RESULT_FILE"
echo ""
echo "📊 Résumé rapide:"
echo "- Total des hooks: $TOTAL_HOOKS"
echo "- Hooks utilisés: $USED_HOOKS ($((USED_HOOKS * 100 / TOTAL_HOOKS))%)"
echo "- Hooks orphelins: $ORPHAN_HOOKS ($((ORPHAN_HOOKS * 100 / TOTAL_HOOKS))%)" 