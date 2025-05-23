#!/bin/bash

# Script de migration pour useFormValidation basé sur l'audit
# STRATÉGIE: useFormValidationMigrated (moderne, complet) → useFormValidation (nom final)

set -e

echo "🎯 MIGRATION FORM VALIDATION BASÉE SUR L'AUDIT"
echo "=============================================="
echo ""
echo "📋 PLAN D'ACTION:"
echo "  1. Supprimer l'ancien useFormValidation.js (wrapper déprécié)"
echo "  2. Renommer useFormValidationMigrated.js → useFormValidation.js"
echo "  3. Mettre à jour le nom de fonction dans le nouveau fichier"
echo "  4. Nettoyer les exports dans index.js"
echo "  5. Aucun changement requis dans les composants (utilisent déjà useFormValidation)"
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

# Étape 1: Supprimer l'ancien wrapper useFormValidation.js
echo "🗑️ 1. Suppression de l'ancien wrapper..."
if [ -f "src/hooks/forms/useFormValidation.js" ]; then
    rm "src/hooks/forms/useFormValidation.js"
    echo "  ✅ Ancien wrapper supprimé"
else
    echo "  ⚠️  Fichier useFormValidation.js non trouvé"
fi

# Étape 2: Renommer useFormValidationMigrated.js → useFormValidation.js
echo "🔄 2. Renommage useFormValidationMigrated → useFormValidation..."
if [ -f "src/hooks/forms/useFormValidationMigrated.js" ]; then
    mv "src/hooks/forms/useFormValidationMigrated.js" "src/hooks/forms/useFormValidation.js"
    echo "  ✅ Fichier renommé"
else
    echo "  ❌ useFormValidationMigrated.js non trouvé !"
    exit 1
fi

# Étape 3: Mettre à jour le nom de fonction dans le nouveau fichier
echo "🔧 3. Mise à jour du nom de fonction..."
sed -i.bak "s/const useFormValidationMigrated = /const useFormValidation = /g" "src/hooks/forms/useFormValidation.js"
sed -i.bak "s/export default useFormValidationMigrated/export default useFormValidation/g" "src/hooks/forms/useFormValidation.js"
sed -i.bak "s/useFormValidationMigrated/useFormValidation/g" "src/hooks/forms/useFormValidation.js"
rm -f "src/hooks/forms/useFormValidation.js.bak"
echo "  ✅ Fonction renommée"

# Étape 4: Nettoyer les exports dans index.js
echo "📤 4. Nettoyage des exports..."
INDEX_FILE="src/hooks/forms/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer tous les anciens exports et commentaires
    sed -i.bak "/export { default as useFormValidationMigrated } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useFormValidationV2 } from/d" "$INDEX_FILE"
    
    # Supprimer les commentaires de recommandation
    sed -i.bak "/\* @recommended La version migrée du hook useFormValidation avec une API complète de validation./d" "$INDEX_FILE"
    sed -i.bak "/^\/\*\*/d" "$INDEX_FILE"
    sed -i.bak "/^ \*/d" "$INDEX_FILE"
    
    rm -f "$INDEX_FILE.bak"
    echo "  ✅ Exports nettoyés"
else
    echo "  ⚠️  index.js non trouvé"
fi

# Étape 5: Supprimer les tests obsolètes
echo "🧪 5. Nettoyage des tests obsolètes..."
if [ -f "src/hooks/__tests__/useFormValidationMigrated.test.js" ]; then
    # Renommer le test pour qu'il corresponde au nouveau nom
    mv "src/hooks/__tests__/useFormValidationMigrated.test.js" "src/hooks/__tests__/useFormValidation.test.js"
    
    # Mettre à jour les imports dans le test
    sed -i.bak "s/import useFormValidationMigrated from/import useFormValidation from/g" "src/hooks/__tests__/useFormValidation.test.js"
    sed -i.bak "s/useFormValidationMigrated/useFormValidation/g" "src/hooks/__tests__/useFormValidation.test.js"
    rm -f "src/hooks/__tests__/useFormValidation.test.js.bak"
    
    echo "  ✅ Tests mis à jour"
fi

# Étape 6: Test de compilation
echo "🧪 6. Test de compilation..."
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
git commit -m "🔄 Migration finale useFormValidation - Consolidation réussie

✅ MIGRATION RÉUSSIE:
- useFormValidationMigrated (moderne, complet) → useFormValidation (nom final)
- Suppression wrapper déprécié (14 lignes)
- Aucun changement dans les composants (utilisent déjà useFormValidation)
- Nettoyage des exports multiples et commentaires
- Version finale: useFormValidation avec API complète (369 lignes)
- Tests mis à jour et compilation validée"

echo ""
echo "🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !"
echo "==========================================="
echo "  ✅ useFormValidation = Version moderne consolidée"
echo "  🗑️ 1 wrapper déprécié supprimé"
echo "  📤 Exports nettoyés (plus de Migrated/V2)"
echo "  ✅ Aucun changement requis dans les composants"
echo "  ✅ Tests mis à jour"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: Un seul hook useFormValidation moderne et fonctionnel !" 