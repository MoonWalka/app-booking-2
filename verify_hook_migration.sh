#!/bin/bash

# Script de vérification complète d'un hook migré
# Vérifie que la migration n'a pas cassé de fonctionnalités

set -e

if [ $# -ne 3 ]; then
    echo "❌ Usage: $0 <hook_name> <domain> <description>"
    echo "   Exemple: $0 useArtisteSearch artistes 'recherche d'artistes'"
    exit 1
fi

HOOK_NAME="$1"
DOMAIN="$2"
DESCRIPTION="$3"

echo "🔍 VÉRIFICATION DU HOOK MIGRÉ: $HOOK_NAME"
echo "=========================================="
echo "📂 Domaine: $DOMAIN"
echo "📝 Fonctionnalité: $DESCRIPTION"
echo ""

# 1. Vérifier que le hook existe
echo "1️⃣ VÉRIFICATION DE L'EXISTENCE DU HOOK..."
HOOK_FILE="src/hooks/$DOMAIN/$HOOK_NAME.js"
if [ -f "$HOOK_FILE" ]; then
    echo "  ✅ Hook trouvé: $HOOK_FILE"
else
    echo "  ❌ ERREUR: Hook non trouvé à $HOOK_FILE"
    exit 1
fi

# 2. Vérifier l'export dans index.js
echo ""
echo "2️⃣ VÉRIFICATION DE L'EXPORT..."
INDEX_FILE="src/hooks/$DOMAIN/index.js"
if grep -q "export.*$HOOK_NAME" "$INDEX_FILE"; then
    echo "  ✅ Hook correctement exporté dans $INDEX_FILE"
    echo "    📋 $(grep "export.*$HOOK_NAME" "$INDEX_FILE")"
else
    echo "  ❌ ATTENTION: Hook non exporté dans $INDEX_FILE"
fi

# 3. Identifier tous les composants qui utilisent ce hook
echo ""
echo "3️⃣ IDENTIFICATION DES COMPOSANTS UTILISATEURS..."
USAGE_FILES=$(grep -r "$HOOK_NAME" src/ --include="*.js" --include="*.jsx" | grep -v "$HOOK_FILE" | grep -v "$INDEX_FILE" | cut -d: -f1 | sort -u)

if [ -n "$USAGE_FILES" ]; then
    echo "  📁 Composants utilisant $HOOK_NAME:"
    echo "$USAGE_FILES" | while read -r file; do
        echo "    📄 $file"
        # Montrer le contexte d'utilisation
        grep -n "$HOOK_NAME" "$file" | head -3 | while read -r line; do
            echo "      🔍 $line"
        done
        echo ""
    done
else
    echo "  ⚠️  Aucun composant trouvé utilisant directement $HOOK_NAME"
    echo "     (Cela peut être normal si utilisé via des abstractions)"
fi

# 4. Vérifier qu'il n'y a plus de références aux anciennes versions
echo ""
echo "4️⃣ VÉRIFICATION DES ANCIENNES VERSIONS..."
OLD_VARIANTS=("${HOOK_NAME}Migrated" "${HOOK_NAME}Optimized" "${HOOK_NAME}Complete")
for variant in "${OLD_VARIANTS[@]}"; do
    OLD_REFS=$(grep -r "$variant" src/ --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "\.backup" | wc -l)
    if [ "$OLD_REFS" -gt 0 ]; then
        echo "  ⚠️  ATTENTION: $OLD_REFS références à $variant trouvées"
        grep -r "$variant" src/ --include="*.js" --include="*.jsx" | head -5
    else
        echo "  ✅ Aucune référence à $variant trouvée"
    fi
done

# 5. Test de compilation rapide
echo ""
echo "5️⃣ TEST DE COMPILATION RAPIDE..."
if npm run build --silent 2>/dev/null; then
    echo "  ✅ Compilation réussie"
else
    echo "  ❌ ERREUR DE COMPILATION détectée"
    echo "     Lancez 'npm run build' pour voir les détails"
    exit 1
fi

# 6. Proposer des tests manuels ciblés
echo ""
echo "6️⃣ TESTS MANUELS RECOMMANDÉS:"
echo "==============================="

if [ -n "$USAGE_FILES" ]; then
    echo "🧪 Pour vérifier que $HOOK_NAME fonctionne correctement:"
    echo ""
    
    echo "$USAGE_FILES" | while read -r file; do
        # Déterminer le type de composant et suggérer des tests
        if echo "$file" | grep -q "desktop"; then
            echo "  🖥️  DESKTOP: $file"
            if echo "$file" | grep -qi "list\|search"; then
                echo "     ➡️ Tester la recherche et filtrage"
                echo "     ➡️ Vérifier que les résultats s'affichent"
                echo "     ➡️ Tester la pagination si applicable"
            elif echo "$file" | grep -qi "form"; then
                echo "     ➡️ Tester la saisie et validation"
                echo "     ➡️ Vérifier la sauvegarde"
            elif echo "$file" | grep -qi "detail"; then
                echo "     ➡️ Tester l'affichage des détails"
                echo "     ➡️ Vérifier les actions (edit, delete)"
            fi
        elif echo "$file" | grep -q "mobile"; then
            echo "  📱 MOBILE: $file"
            echo "     ➡️ Tester en mode responsive/mobile"
        fi
        echo ""
    done
else
    echo "  ℹ️  Pas de composants directs identifiés"
    echo "     ➡️ Vérifier manuellement les fonctionnalités de $DESCRIPTION"
fi

# 7. Lancement optionnel en mode développement
echo ""
echo "7️⃣ LANCEMENT EN MODE DÉVELOPPEMENT:"
echo "===================================="
echo "  Pour tester interactivement:"
echo "  👉 npm start"
echo "  👉 Naviguer vers les pages utilisant la fonctionnalité '$DESCRIPTION'"
echo "  👉 Vérifier la console pour d'éventuelles erreurs"
echo ""

# 8. Points de vérification spécifiques
echo "8️⃣ CHECKLIST DE VÉRIFICATION:"
echo "=============================="
echo "  □ Le hook se charge sans erreur"
echo "  □ Les données sont récupérées correctement"
echo "  □ Les fonctions (search, filter, etc.) marchent"
echo "  □ Pas d'erreurs dans la console navigateur"
echo "  □ Les performances sont correctes"
echo "  □ Les états de loading/error sont gérés"
echo ""

echo "✅ VÉRIFICATION TERMINÉE"
echo "========================"
echo "  📋 Hook: $HOOK_NAME"
echo "  🎯 Statut: Migration vérifiée"
echo "  📝 Action: Effectuer les tests manuels recommandés"

# Optionnel : démarrer automatiquement en dev
echo ""
read -p "🚀 Voulez-vous lancer l'app en mode développement pour tester ? (oui/non): " start_dev
if [ "$start_dev" = "oui" ]; then
    echo "🚀 Démarrage de l'application..."
    echo "   ➡️ Une fois lancée, testez les fonctionnalités de '$DESCRIPTION'"
    echo "   ➡️ Appuyez sur Ctrl+C pour arrêter quand terminé"
    echo ""
    npm start
fi 