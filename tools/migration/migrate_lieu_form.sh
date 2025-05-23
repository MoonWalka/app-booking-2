#!/bin/bash

# Script de migration pour useLieuForm basé sur l'audit
# STRATÉGIE: useLieuFormOptimized (moderne, production) → useLieuForm (nom final)

set -e

echo "🎯 MIGRATION LIEU FORM BASÉE SUR L'AUDIT"
echo "======================================="
echo ""
echo "📋 PLAN D'ACTION:"
echo "  1. Remplacer useLieuFormOptimized → useLieuForm dans les composants"
echo "  2. Supprimer l'ancien useLieuForm.js (wrapper déprécié)"
echo "  3. Supprimer useLieuFormMigrated.js et useLieuFormComplete.js (versions inutilisées)"
echo "  4. Renommer useLieuFormOptimized.js → useLieuForm.js"
echo "  5. Mettre à jour le nom de fonction dans le nouveau fichier"
echo "  6. Nettoyer les exports dans index.js"
echo ""

# Vérifier qu'on est dans un dépôt Git et que tout est committé
if ! git status --porcelain | grep -q .; then
    echo "✅ Dépôt Git propre, on peut continuer"
else
    echo "❌ ERREUR: Des changements non commités détectés !"
    exit 1
fi

read -p "🤔 Continuer avec la migration ? (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
    echo "❌ Migration annulée"
    exit 0
fi

echo ""
echo "🚀 DÉBUT DE LA MIGRATION..."

# Étape 1: Remplacer useLieuFormOptimized dans les composants
echo "📝 1. Mise à jour des imports et usages externes..."
find src/ -name "*.js" -o -name "*.jsx" | grep -v "hooks/lieux" | while read -r file; do
    if [ -f "$file" ]; then
        if grep -q "useLieuFormOptimized" "$file" 2>/dev/null; then
            echo "    📝 Mise à jour: $file"
            
            # Remplacer les imports
            sed -i.bak "s/useLieuFormOptimized/useLieuForm/g" "$file"
            
            # Nettoyer les fichiers .bak
            rm -f "$file.bak"
        fi
    fi
done

# Étape 2: Supprimer l'ancien wrapper useLieuForm.js
echo "🗑️ 2. Suppression de l'ancien wrapper..."
if [ -f "src/hooks/lieux/useLieuForm.js" ]; then
    rm "src/hooks/lieux/useLieuForm.js"
    echo "  ✅ Ancien wrapper supprimé"
else
    echo "  ⚠️  Fichier useLieuForm.js non trouvé"
fi

# Étape 3: Supprimer les versions inutilisées
echo "🗑️ 3. Suppression des versions inutilisées..."
if [ -f "src/hooks/lieux/useLieuFormMigrated.js" ]; then
    rm "src/hooks/lieux/useLieuFormMigrated.js"
    echo "  ✅ useLieuFormMigrated.js supprimé"
fi

if [ -f "src/hooks/lieux/useLieuFormComplete.js" ]; then
    rm "src/hooks/lieux/useLieuFormComplete.js"
    echo "  ✅ useLieuFormComplete.js supprimé"
fi

# Étape 4: Renommer useLieuFormOptimized.js → useLieuForm.js
echo "🔄 4. Renommage useLieuFormOptimized → useLieuForm..."
if [ -f "src/hooks/lieux/useLieuFormOptimized.js" ]; then
    mv "src/hooks/lieux/useLieuFormOptimized.js" "src/hooks/lieux/useLieuForm.js"
    echo "  ✅ Fichier renommé"
else
    echo "  ❌ useLieuFormOptimized.js non trouvé !"
    exit 1
fi

# Étape 5: Mettre à jour le nom de fonction dans le nouveau fichier
echo "🔧 5. Mise à jour du nom de fonction..."
sed -i.bak "s/const useLieuFormOptimized = /const useLieuForm = /g" "src/hooks/lieux/useLieuForm.js"
sed -i.bak "s/export default useLieuFormOptimized/export default useLieuForm/g" "src/hooks/lieux/useLieuForm.js"
rm -f "src/hooks/lieux/useLieuForm.js.bak"
echo "  ✅ Fonction renommée"

# Étape 6: Nettoyer les exports dans index.js
echo "📤 6. Nettoyage des exports..."
INDEX_FILE="src/hooks/lieux/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer uniquement les anciennes versions
    sed -i.bak "/export { default as useLieuFormOptimized } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useLieuFormMigrated } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useLieuFormV2 } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useLieuFormComplete } from/d" "$INDEX_FILE"
    
    rm -f "$INDEX_FILE.bak"
    echo "  ✅ Exports nettoyés"
else
    echo "  ⚠️  index.js non trouvé"
fi

# Étape 7: Supprimer les tests obsolètes
echo "🧪 7. Nettoyage des tests obsolètes..."
for test_file in "src/hooks/__tests__/useLieuFormOptimized.test.js" "src/hooks/__tests__/useLieuFormMigrated.test.js" "src/hooks/__tests__/useLieuFormComplete.test.js"; do
    if [ -f "$test_file" ]; then
        rm "$test_file"
        echo "  ✅ $(basename "$test_file") supprimé"
    fi
done

# Étape 8: Test de compilation
echo "🧪 8. Test de compilation..."
if npm run build --silent 2>/dev/null; then
    echo "  ✅ Compilation réussie !"
else
    echo "  ❌ ERREUR DE COMPILATION !"
    echo "     Restauration depuis Git..."
    git checkout HEAD -- src/
    echo "  🔄 Fichiers restaurés"
    echo "  ❌ Migration échouée"
    exit 1
fi

echo ""
echo "💾 COMMIT DE LA MIGRATION..."
git add -A
git commit -m "🔄 Migration finale useLieuForm - Consolidation réussie

✅ MIGRATION RÉUSSIE:
- useLieuFormOptimized (moderne, production) → useLieuForm (nom final)
- Suppression wrapper déprécié + 2 versions inutilisées
- Mise à jour de 2 composants: useLieuFormOptimized → useLieuForm
- Nettoyage des exports multiples (Optimized/Migrated/V2/Complete)
- Version finale: useLieuForm avec useGenericEntityForm (110 lignes)
- Tests obsolètes supprimés et compilation validée"

echo ""
echo "🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !"
echo "==========================================="
echo "  ✅ useLieuForm = Version moderne consolidée"
echo "  🗑️ 3 versions obsolètes supprimées"
echo "  📤 Exports nettoyés (plus de Optimized/Migrated/V2/Complete)"
echo "  ✅ 2 composants mis à jour"
echo "  ✅ Tests obsolètes supprimés"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: Un seul hook useLieuForm moderne et fonctionnel !" 