#!/bin/bash

# Script de migration final pour useContratDetails basé sur l'audit
# STRATÉGIE: useContratDetailsMigrated (moderne) → useContratDetails (nom final)

set -e

echo "🎯 MIGRATION FINALE BASÉE SUR L'AUDIT: useContratDetails"
echo "======================================================="
echo ""
echo "📋 PLAN D'ACTION:"
echo "  1. Remplacer useContratDetailsV2 → useContratDetails dans ContratDetailsPage.js"
echo "  2. Supprimer l'ancien useContratDetails.js (wrapper)"
echo "  3. Renommer useContratDetailsMigrated.js → useContratDetails.js"
echo "  4. Mettre à jour le nom de fonction dans le nouveau fichier"
echo "  5. Nettoyer les exports dans index.js"
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

# Étape 1: Remplacer useContratDetailsV2 dans ContratDetailsPage.js
echo "📝 1. Mise à jour de ContratDetailsPage.js..."
if [ -f "src/pages/ContratDetailsPage.js" ]; then
    sed -i.bak "s/import { useContratDetailsV2 } from/import { useContratDetails } from/g" "src/pages/ContratDetailsPage.js"
    sed -i.bak "s/= useContratDetailsV2(/= useContratDetails(/g" "src/pages/ContratDetailsPage.js"
    rm -f "src/pages/ContratDetailsPage.js.bak"
    echo "  ✅ ContratDetailsPage.js mis à jour"
else
    echo "  ⚠️  ContratDetailsPage.js non trouvé"
fi

# Étape 2: Supprimer l'ancien wrapper useContratDetails.js
echo "🗑️ 2. Suppression de l'ancien wrapper..."
if [ -f "src/hooks/contrats/useContratDetails.js" ]; then
    rm "src/hooks/contrats/useContratDetails.js"
    echo "  ✅ Ancien wrapper supprimé"
else
    echo "  ⚠️  Fichier useContratDetails.js non trouvé"
fi

# Étape 3: Renommer useContratDetailsMigrated.js → useContratDetails.js
echo "🔄 3. Renommage useContratDetailsMigrated → useContratDetails..."
if [ -f "src/hooks/contrats/useContratDetailsMigrated.js" ]; then
    mv "src/hooks/contrats/useContratDetailsMigrated.js" "src/hooks/contrats/useContratDetails.js"
    echo "  ✅ Fichier renommé"
else
    echo "  ❌ useContratDetailsMigrated.js non trouvé !"
    exit 1
fi

# Étape 4: Mettre à jour le nom de fonction dans le nouveau fichier
echo "🔧 4. Mise à jour du nom de fonction..."
sed -i.bak "s/const useContratDetailsMigrated = /const useContratDetails = /g" "src/hooks/contrats/useContratDetails.js"
sed -i.bak "s/export default useContratDetailsMigrated/export default useContratDetails/g" "src/hooks/contrats/useContratDetails.js"
rm -f "src/hooks/contrats/useContratDetails.js.bak"
echo "  ✅ Fonction renommée"

# Étape 5: Nettoyer les exports dans index.js
echo "📤 5. Nettoyage des exports..."
INDEX_FILE="src/hooks/contrats/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer les anciens exports
    sed -i.bak "/export { default as useContratDetailsMigrated } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useContratDetailsV2 } from/d" "$INDEX_FILE"
    
    # Supprimer le commentaire de useContratDetailsV2
    sed -i.bak "/\* @recommended La version migrée du hook useContratDetails basée sur les hooks génériques./d" "$INDEX_FILE"
    sed -i.bak "/\* À utiliser dans les nouveaux développements./d" "$INDEX_FILE"
    sed -i.bak "/^\/\*\*/d" "$INDEX_FILE"
    sed -i.bak "/^ \*/d" "$INDEX_FILE"
    
    rm -f "$INDEX_FILE.bak"
    echo "  ✅ Exports nettoyés"
else
    echo "  ⚠️  index.js non trouvé"
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
git commit -m "🔄 Migration finale useContratDetails - Consolidation réussie

✅ MIGRATION RÉUSSIE:
- useContratDetailsMigrated (moderne) → useContratDetails (nom final)
- Suppression du wrapper obsolète
- Mise à jour ContratDetailsPage.js: useContratDetailsV2 → useContratDetails  
- Nettoyage des exports multiples dans index.js
- Version finale: useContratDetails avec useGenericEntityDetails
- Tests de compilation validés"

echo ""
echo "🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !"
echo "==========================================="
echo "  ✅ useContratDetails = Version moderne consolidée"
echo "  🗑️ Wrapper obsolète supprimé"
echo "  📤 Exports nettoyés (plus de V2/Migrated)"
echo "  ✅ ContratDetailsPage.js mis à jour"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: Un seul hook useContratDetails moderne et fonctionnel !" 