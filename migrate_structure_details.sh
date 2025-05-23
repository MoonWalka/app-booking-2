#!/bin/bash

# Script de migration pour useStructureDetails basé sur l'audit
# STRATÉGIE: useStructureDetailsOptimized (moderne, production) → useStructureDetails (nom final)

set -e

echo "🎯 MIGRATION STRUCTURE DETAILS BASÉE SUR L'AUDIT"
echo "================================================"
echo ""
echo "📋 PLAN D'ACTION:"
echo "  1. Remplacer useStructureDetailsOptimized → useStructureDetails dans le composant"
echo "  2. Supprimer l'ancien useStructureDetails.js (wrapper déprécié)"
echo "  3. Supprimer useStructureDetailsMigrated.js (version intermédiaire)"
echo "  4. Renommer useStructureDetailsOptimized.js → useStructureDetails.js"
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

# Étape 1: Remplacer useStructureDetailsOptimized dans le composant
echo "📝 1. Mise à jour des imports et usages externes..."
find src/ -name "*.js" -o -name "*.jsx" | grep -v "hooks/structures" | while read -r file; do
    if [ -f "$file" ]; then
        if grep -q "useStructureDetailsOptimized" "$file" 2>/dev/null; then
            echo "    📝 Mise à jour: $file"
            
            # Remplacer les imports
            sed -i.bak "s/useStructureDetailsOptimized/useStructureDetails/g" "$file"
            
            # Nettoyer les fichiers .bak
            rm -f "$file.bak"
        fi
    fi
done

# Étape 2: Supprimer l'ancien wrapper useStructureDetails.js
echo "🗑️ 2. Suppression de l'ancien wrapper..."
if [ -f "src/hooks/structures/useStructureDetails.js" ]; then
    rm "src/hooks/structures/useStructureDetails.js"
    echo "  ✅ Ancien wrapper supprimé"
else
    echo "  ⚠️  Fichier useStructureDetails.js non trouvé"
fi

# Étape 3: Supprimer useStructureDetailsMigrated.js
echo "🗑️ 3. Suppression de useStructureDetailsMigrated.js..."
if [ -f "src/hooks/structures/useStructureDetailsMigrated.js" ]; then
    rm "src/hooks/structures/useStructureDetailsMigrated.js"
    echo "  ✅ useStructureDetailsMigrated.js supprimé"
else
    echo "  ⚠️  Fichier useStructureDetailsMigrated.js non trouvé"
fi

# Étape 4: Renommer useStructureDetailsOptimized.js → useStructureDetails.js
echo "🔄 4. Renommage useStructureDetailsOptimized → useStructureDetails..."
if [ -f "src/hooks/structures/useStructureDetailsOptimized.js" ]; then
    mv "src/hooks/structures/useStructureDetailsOptimized.js" "src/hooks/structures/useStructureDetails.js"
    echo "  ✅ Fichier renommé"
else
    echo "  ❌ useStructureDetailsOptimized.js non trouvé !"
    exit 1
fi

# Étape 5: Mettre à jour le nom de fonction dans le nouveau fichier
echo "🔧 5. Mise à jour du nom de fonction..."
sed -i.bak "s/const useStructureDetailsOptimized = /const useStructureDetails = /g" "src/hooks/structures/useStructureDetails.js"
sed -i.bak "s/export default useStructureDetailsOptimized/export default useStructureDetails/g" "src/hooks/structures/useStructureDetails.js"
rm -f "src/hooks/structures/useStructureDetails.js.bak"
echo "  ✅ Fonction renommée"

# Étape 6: Nettoyer les exports dans index.js
echo "📤 6. Nettoyage des exports..."
INDEX_FILE="src/hooks/structures/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer tous les anciens exports et commentaires
    sed -i.bak "/export { default as useStructureDetailsMigrated } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useStructureDetailsV2 } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useStructureDetailsOptimized } from/d" "$INDEX_FILE"
    
    # Supprimer les imports inutilisés
    sed -i.bak "/import useStructureDetails from/d" "$INDEX_FILE"
    
    # Supprimer les références dans les exports groupés
    sed -i.bak "s/  useStructureDetails,//g" "$INDEX_FILE"
    
    rm -f "$INDEX_FILE.bak"
    echo "  ✅ Exports nettoyés"
else
    echo "  ⚠️  index.js non trouvé"
fi

# Étape 7: Test de compilation
echo "🧪 7. Test de compilation..."
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
git commit -m "🔄 Migration finale useStructureDetails - Consolidation réussie

✅ MIGRATION RÉUSSIE:
- useStructureDetailsOptimized (moderne, production) → useStructureDetails (nom final)
- Suppression wrapper déprécié + version intermédiaire
- Mise à jour du composant: useStructureDetailsOptimized → useStructureDetails
- Nettoyage des exports multiples et commentaires
- Version finale: useStructureDetails avec useGenericEntityDetails (176 lignes)
- Tests de compilation validés"

echo ""
echo "🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !"
echo "==========================================="
echo "  ✅ useStructureDetails = Version moderne consolidée"
echo "  🗑️ 2 versions obsolètes supprimées"
echo "  📤 Exports nettoyés (plus de Optimized/Migrated/V2)"
echo "  ✅ Composant mis à jour"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: Un seul hook useStructureDetails moderne et fonctionnel !" 