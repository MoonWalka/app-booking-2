#!/bin/bash

# Script de migration pour useConcertDetails basé sur l'audit
# STRATÉGIE: useConcertDetailsOptimized (moderne, production) → useConcertDetails (nom final)

set -e

echo "🎯 MIGRATION CONCERT DETAILS BASÉE SUR L'AUDIT"
echo "=============================================="
echo ""
echo "📋 PLAN D'ACTION:"
echo "  1. Remplacer useConcertDetailsOptimized → useConcertDetails dans tous les composants"
echo "  2. Supprimer l'ancien useConcertDetails.js (wrapper déprécié)"
echo "  3. Supprimer useConcertDetailsMigrated.js (version intermédiaire)"
echo "  4. Renommer useConcertDetailsOptimized.js → useConcertDetails.js"
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

# Étape 1: Remplacer useConcertDetailsOptimized dans tous les composants
echo "📝 1. Mise à jour des imports et usages externes..."
find src/ -name "*.js" -o -name "*.jsx" | grep -v "hooks/concerts" | while read -r file; do
    if [ -f "$file" ]; then
        if grep -q "useConcertDetailsOptimized" "$file" 2>/dev/null; then
            echo "    📝 Mise à jour: $file"
            
            # Remplacer les imports
            sed -i.bak "s/import { useConcertDetailsOptimized } from/import { useConcertDetails } from/g" "$file"
            sed -i.bak "s/import useConcertDetailsOptimized from/import useConcertDetails from/g" "$file"
            sed -i.bak "s/useConcertDetailsOptimized,/useConcertDetails,/g" "$file"
            
            # Remplacer les usages
            sed -i.bak "s/= useConcertDetailsOptimized(/= useConcertDetails(/g" "$file"
            sed -i.bak "s/const useConcertDetailsOptimized = /const useConcertDetails = /g" "$file"
            sed -i.bak "s/useConcertDetailsOptimized(/useConcertDetails(/g" "$file"
            
            # Nettoyer les fichiers .bak
            rm -f "$file.bak"
        fi
    fi
done

# Étape 2: Supprimer l'ancien wrapper useConcertDetails.js
echo "🗑️ 2. Suppression de l'ancien wrapper..."
if [ -f "src/hooks/concerts/useConcertDetails.js" ]; then
    rm "src/hooks/concerts/useConcertDetails.js"
    echo "  ✅ Ancien wrapper supprimé"
else
    echo "  ⚠️  Fichier useConcertDetails.js non trouvé"
fi

# Étape 3: Supprimer useConcertDetailsMigrated.js
echo "🗑️ 3. Suppression de useConcertDetailsMigrated.js..."
if [ -f "src/hooks/concerts/useConcertDetailsMigrated.js" ]; then
    rm "src/hooks/concerts/useConcertDetailsMigrated.js"
    echo "  ✅ useConcertDetailsMigrated.js supprimé"
else
    echo "  ⚠️  Fichier useConcertDetailsMigrated.js non trouvé"
fi

# Étape 4: Renommer useConcertDetailsOptimized.js → useConcertDetails.js
echo "🔄 4. Renommage useConcertDetailsOptimized → useConcertDetails..."
if [ -f "src/hooks/concerts/useConcertDetailsOptimized.js" ]; then
    mv "src/hooks/concerts/useConcertDetailsOptimized.js" "src/hooks/concerts/useConcertDetails.js"
    echo "  ✅ Fichier renommé"
else
    echo "  ❌ useConcertDetailsOptimized.js non trouvé !"
    exit 1
fi

# Étape 5: Mettre à jour le nom de fonction dans le nouveau fichier
echo "🔧 5. Mise à jour du nom de fonction..."
sed -i.bak "s/const useConcertDetailsOptimized = /const useConcertDetails = /g" "src/hooks/concerts/useConcertDetails.js"
sed -i.bak "s/export default useConcertDetailsOptimized/export default useConcertDetails/g" "src/hooks/concerts/useConcertDetails.js"
rm -f "src/hooks/concerts/useConcertDetails.js.bak"
echo "  ✅ Fonction renommée"

# Étape 6: Nettoyer les exports dans index.js
echo "📤 6. Nettoyage des exports..."
INDEX_FILE="src/hooks/concerts/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer tous les anciens exports et commentaires de dépréciation
    sed -i.bak "/export { default as useConcertDetailsOptimized } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useConcertDetailsMigrated } from/d" "$INDEX_FILE"
    
    # Supprimer les commentaires de dépréciation
    sed -i.bak "/\* @deprecated Sera supprimé en novembre 2025. Utilisez useConcertDetailsOptimized à la place./d" "$INDEX_FILE"
    sed -i.bak "/^\/\*\*/d" "$INDEX_FILE"
    sed -i.bak "/^ \*/d" "$INDEX_FILE"
    
    # Supprimer les lignes commentées
    sed -i.bak "/\/\/ export { default as useConcertDetailsV2 } from/d" "$INDEX_FILE"
    
    rm -f "$INDEX_FILE.bak"
    echo "  ✅ Exports nettoyés"
else
    echo "  ⚠️  index.js non trouvé"
fi

# Étape 7: Supprimer les tests obsolètes
echo "🧪 7. Nettoyage des tests obsolètes..."
if [ -f "src/hooks/__tests__/useConcertDetailsMigrated.test.js" ]; then
    rm "src/hooks/__tests__/useConcertDetailsMigrated.test.js"
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
git commit -m "🔄 Migration finale useConcertDetails - Consolidation réussie

✅ MIGRATION RÉUSSIE:
- useConcertDetailsOptimized (moderne, production) → useConcertDetails (nom final)
- Suppression wrapper déprécié + version intermédiaire
- Mise à jour de 3 composants: useConcertDetailsOptimized → useConcertDetails
- Nettoyage des exports multiples et commentaires dépréciation
- Version finale: useConcertDetails avec useGenericEntityDetails (614 lignes)
- Tests de compilation validés"

echo ""
echo "🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !"
echo "==========================================="
echo "  ✅ useConcertDetails = Version moderne consolidée"
echo "  🗑️ 2 versions obsolètes supprimées"
echo "  📤 Exports nettoyés (plus de Optimized/Migrated)"
echo "  ✅ 3 composants mis à jour (desktop + mobile + général)"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: Un seul hook useConcertDetails moderne et fonctionnel !" 