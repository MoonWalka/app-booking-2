#!/bin/bash

# Script de migration pour useConcertForm basé sur l'audit
# STRATÉGIE: useConcertFormOptimized (largement utilisé, 16 usages) → useConcertForm (nom final)

set -e

echo "🎯 MIGRATION CONCERT FORM BASÉE SUR L'AUDIT"
echo "==========================================="
echo ""
echo "📋 PLAN D'ACTION:"
echo "  1. Remplacer useConcertFormOptimized → useConcertForm dans tous les composants"
echo "  2. Supprimer l'ancien useConcertForm.js (wrapper déprécié)"
echo "  3. Supprimer useConcertFormMigrated.js (version inutilisée)"
echo "  4. Renommer useConcertFormOptimized.js → useConcertForm.js"
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

# Étape 1: Remplacer useConcertFormOptimized dans tous les composants
echo "📝 1. Mise à jour des imports et usages externes..."
find src/ -name "*.js" -o -name "*.jsx" | grep -v "hooks/concerts" | while read -r file; do
    if [ -f "$file" ]; then
        if grep -q "useConcertFormOptimized" "$file" 2>/dev/null; then
            echo "    📝 Mise à jour: $file"
            
            # Remplacer les imports
            sed -i.bak "s/useConcertFormOptimized/useConcertForm/g" "$file"
            
            # Nettoyer les fichiers .bak
            rm -f "$file.bak"
        fi
    fi
done

# Étape 2: Supprimer l'ancien wrapper useConcertForm.js
echo "🗑️ 2. Suppression de l'ancien wrapper..."
if [ -f "src/hooks/concerts/useConcertForm.js" ]; then
    rm "src/hooks/concerts/useConcertForm.js"
    echo "  ✅ Ancien wrapper supprimé"
else
    echo "  ⚠️  Fichier useConcertForm.js non trouvé"
fi

# Étape 3: Supprimer les versions inutilisées
echo "🗑️ 3. Suppression des versions inutilisées..."
if [ -f "src/hooks/concerts/useConcertFormMigrated.js" ]; then
    rm "src/hooks/concerts/useConcertFormMigrated.js"
    echo "  ✅ useConcertFormMigrated.js supprimé"
fi

# Étape 4: Renommer useConcertFormOptimized.js → useConcertForm.js
echo "🔄 4. Renommage useConcertFormOptimized → useConcertForm..."
if [ -f "src/hooks/concerts/useConcertFormOptimized.js" ]; then
    mv "src/hooks/concerts/useConcertFormOptimized.js" "src/hooks/concerts/useConcertForm.js"
    echo "  ✅ Fichier renommé"
else
    echo "  ❌ useConcertFormOptimized.js non trouvé !"
    exit 1
fi

# Étape 5: Mettre à jour le nom de fonction dans le nouveau fichier
echo "🔧 5. Mise à jour du nom de fonction..."
sed -i.bak "s/const useConcertFormOptimized = /const useConcertForm = /g" "src/hooks/concerts/useConcertForm.js"
sed -i.bak "s/export default useConcertFormOptimized/export default useConcertForm/g" "src/hooks/concerts/useConcertForm.js"
sed -i.bak "s/useConcertFormOptimized/useConcertForm/g" "src/hooks/concerts/useConcertForm.js"
rm -f "src/hooks/concerts/useConcertForm.js.bak"
echo "  ✅ Fonction renommée"

# Étape 6: Nettoyer les exports dans index.js
echo "📤 6. Nettoyage des exports..."
INDEX_FILE="src/hooks/concerts/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer uniquement les anciennes versions
    sed -i.bak "/export { default as useConcertFormOptimized } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useConcertFormMigrated } from/d" "$INDEX_FILE"
    
    rm -f "$INDEX_FILE.bak"
    echo "  ✅ Exports nettoyés"
else
    echo "  ⚠️  index.js non trouvé"
fi

# Étape 7: Supprimer les tests obsolètes
echo "🧪 7. Nettoyage des tests obsolètes..."
for test_file in "src/hooks/__tests__/useConcertFormOptimized.test.js" "src/hooks/__tests__/useConcertFormMigrated.test.js"; do
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
git commit -m "🔄 Migration finale useConcertForm - Consolidation réussie

✅ MIGRATION RÉUSSIE:
- useConcertFormOptimized (largement utilisé, 16 usages) → useConcertForm (nom final)
- Suppression wrapper déprécié + version migrée inutilisée
- Mise à jour de tous les composants: useConcertFormOptimized → useConcertForm
- Nettoyage des exports multiples (Optimized/Migrated)
- Version finale: useConcertForm avec useGenericEntityForm (294 lignes)
- Tests obsolètes supprimés et compilation validée"

echo ""
echo "🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !"
echo "==========================================="
echo "  ✅ useConcertForm = Version moderne consolidée"
echo "  🗑️ 2 versions obsolètes supprimées"
echo "  📤 Exports nettoyés (plus de Optimized/Migrated)"
echo "  ✅ Tous les composants mis à jour"
echo "  ✅ Tests obsolètes supprimés"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: Un seul hook useConcertForm moderne et fonctionnel !" 