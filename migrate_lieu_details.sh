#!/bin/bash

# Script de migration pour useLieuDetails basé sur l'audit
# STRATÉGIE: useLieuDetailsOptimized (moderne) → useLieuDetails (nom final)

set -e

echo "🎯 MIGRATION LIEU DETAILS BASÉE SUR L'AUDIT"
echo "==========================================="
echo ""
echo "📋 PLAN D'ACTION:"
echo "  1. Remplacer useLieuDetailsOptimized → useLieuDetails dans tous les composants"
echo "  2. Supprimer l'ancien useLieuDetails.js (wrapper déprécié)"
echo "  3. Supprimer useLieuDetailsMigrated.js (version intermédiaire)"
echo "  4. Renommer useLieuDetailsOptimized.js → useLieuDetails.js"
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

# Étape 1: Remplacer useLieuDetailsOptimized dans tous les composants
echo "📝 1. Mise à jour des imports et usages externes..."
find src/ -name "*.js" -o -name "*.jsx" | grep -v "hooks/lieux" | while read -r file; do
    if [ -f "$file" ]; then
        if grep -q "useLieuDetailsOptimized" "$file" 2>/dev/null; then
            echo "    📝 Mise à jour: $file"
            
            # Remplacer les imports
            sed -i.bak "s/import { useLieuDetailsOptimized } from/import { useLieuDetails } from/g" "$file"
            sed -i.bak "s/import useLieuDetailsOptimized from/import useLieuDetails from/g" "$file"
            
            # Remplacer les usages
            sed -i.bak "s/= useLieuDetailsOptimized(/= useLieuDetails(/g" "$file"
            sed -i.bak "s/const useLieuDetailsOptimized = /const useLieuDetails = /g" "$file"
            
            # Nettoyer les fichiers .bak
            rm -f "$file.bak"
        fi
    fi
done

# Étape 2: Supprimer l'ancien wrapper useLieuDetails.js
echo "🗑️ 2. Suppression de l'ancien wrapper..."
if [ -f "src/hooks/lieux/useLieuDetails.js" ]; then
    rm "src/hooks/lieux/useLieuDetails.js"
    echo "  ✅ Ancien wrapper supprimé"
else
    echo "  ⚠️  Fichier useLieuDetails.js non trouvé"
fi

# Étape 3: Supprimer useLieuDetailsMigrated.js
echo "🗑️ 3. Suppression de useLieuDetailsMigrated.js..."
if [ -f "src/hooks/lieux/useLieuDetailsMigrated.js" ]; then
    rm "src/hooks/lieux/useLieuDetailsMigrated.js"
    echo "  ✅ useLieuDetailsMigrated.js supprimé"
else
    echo "  ⚠️  Fichier useLieuDetailsMigrated.js non trouvé"
fi

# Étape 4: Renommer useLieuDetailsOptimized.js → useLieuDetails.js
echo "🔄 4. Renommage useLieuDetailsOptimized → useLieuDetails..."
if [ -f "src/hooks/lieux/useLieuDetailsOptimized.js" ]; then
    mv "src/hooks/lieux/useLieuDetailsOptimized.js" "src/hooks/lieux/useLieuDetails.js"
    echo "  ✅ Fichier renommé"
else
    echo "  ❌ useLieuDetailsOptimized.js non trouvé !"
    exit 1
fi

# Étape 5: Mettre à jour le nom de fonction dans le nouveau fichier
echo "🔧 5. Mise à jour du nom de fonction..."
sed -i.bak "s/const useLieuDetailsOptimized = /const useLieuDetails = /g" "src/hooks/lieux/useLieuDetails.js"
sed -i.bak "s/export default useLieuDetailsOptimized/export default useLieuDetails/g" "src/hooks/lieux/useLieuDetails.js"
rm -f "src/hooks/lieux/useLieuDetails.js.bak"
echo "  ✅ Fonction renommée"

# Étape 6: Nettoyer les exports dans index.js
echo "📤 6. Nettoyage des exports..."
INDEX_FILE="src/hooks/lieux/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer tous les anciens exports et commentaires de dépréciation
    sed -i.bak "/export { default as useLieuDetailsOptimized } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useLieuDetailsMigrated } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useLieuDetailsV2 } from/d" "$INDEX_FILE"
    
    # Supprimer les commentaires de dépréciation
    sed -i.bak "/\* @deprecated Sera supprimé en novembre 2025. Utilisez useLieuDetailsOptimized à la place./d" "$INDEX_FILE"
    sed -i.bak "/^\/\*\*/d" "$INDEX_FILE"
    sed -i.bak "/^ \*/d" "$INDEX_FILE"
    
    rm -f "$INDEX_FILE.bak"
    echo "  ✅ Exports nettoyés"
else
    echo "  ⚠️  index.js non trouvé"
fi

# Étape 7: Supprimer les tests obsolètes
echo "🧪 7. Nettoyage des tests obsolètes..."
if [ -f "src/hooks/__tests__/useLieuDetailsMigrated.test.js" ]; then
    rm "src/hooks/__tests__/useLieuDetailsMigrated.test.js"
    echo "  ✅ Tests obsolètes supprimés"
fi

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
git commit -m "🔄 Migration finale useLieuDetails - Consolidation réussie

✅ MIGRATION RÉUSSIE:
- useLieuDetailsOptimized (moderne) → useLieuDetails (nom final)
- Suppression wrapper déprécié + version intermédiaire
- Mise à jour de tous les composants: useLieuDetailsOptimized → useLieuDetails
- Nettoyage des exports multiples et commentaires dépréciation
- Version finale: useLieuDetails avec useGenericEntityDetails
- Tests de compilation validés"

echo ""
echo "🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !"
echo "==========================================="
echo "  ✅ useLieuDetails = Version moderne consolidée"
echo "  🗑️ 2 versions obsolètes supprimées"
echo "  📤 Exports nettoyés (plus de Optimized/Migrated/V2)"
echo "  ✅ Tous les composants mis à jour"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: Un seul hook useLieuDetails moderne et fonctionnel !" 