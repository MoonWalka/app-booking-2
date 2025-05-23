#!/bin/bash

# Script de migration pour useProgrammateurDetails basé sur l'audit
# STRATÉGIE: useProgrammateurDetailsMigrated (moderne, propre) → useProgrammateurDetails (nom final)

set -e

echo "🎯 MIGRATION PROGRAMMATEUR DETAILS BASÉE SUR L'AUDIT"
echo "===================================================="
echo ""
echo "📋 PLAN D'ACTION:"
echo "  1. Supprimer l'ancien useProgrammateurDetails.js (wrapper déprécié)"
echo "  2. Supprimer useProgrammateurDetailsOptimized.js (version intermédiaire complexe)"
echo "  3. Renommer useProgrammateurDetailsMigrated.js → useProgrammateurDetails.js"
echo "  4. Mettre à jour le nom de fonction dans le nouveau fichier"
echo "  5. Nettoyer les exports dans index.js"
echo "  6. Tous les composants utilisent déjà useProgrammateurDetails (pas de changement)"
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

# Étape 1: Supprimer l'ancien wrapper useProgrammateurDetails.js
echo "🗑️ 1. Suppression de l'ancien wrapper..."
if [ -f "src/hooks/programmateurs/useProgrammateurDetails.js" ]; then
    rm "src/hooks/programmateurs/useProgrammateurDetails.js"
    echo "  ✅ Ancien wrapper supprimé"
else
    echo "  ⚠️  Fichier useProgrammateurDetails.js non trouvé"
fi

# Étape 2: Supprimer useProgrammateurDetailsOptimized.js
echo "🗑️ 2. Suppression de useProgrammateurDetailsOptimized.js..."
if [ -f "src/hooks/programmateurs/useProgrammateurDetailsOptimized.js" ]; then
    rm "src/hooks/programmateurs/useProgrammateurDetailsOptimized.js"
    echo "  ✅ useProgrammateurDetailsOptimized.js supprimé"
else
    echo "  ⚠️  Fichier useProgrammateurDetailsOptimized.js non trouvé"
fi

# Étape 3: Renommer useProgrammateurDetailsMigrated.js → useProgrammateurDetails.js
echo "🔄 3. Renommage useProgrammateurDetailsMigrated → useProgrammateurDetails..."
if [ -f "src/hooks/programmateurs/useProgrammateurDetailsMigrated.js" ]; then
    mv "src/hooks/programmateurs/useProgrammateurDetailsMigrated.js" "src/hooks/programmateurs/useProgrammateurDetails.js"
    echo "  ✅ Fichier renommé"
else
    echo "  ❌ useProgrammateurDetailsMigrated.js non trouvé !"
    exit 1
fi

# Étape 4: Mettre à jour le nom de fonction dans le nouveau fichier
echo "🔧 4. Mise à jour du nom de fonction..."
sed -i.bak "s/export default function useProgrammateurDetailsMigrated/export default function useProgrammateurDetails/g" "src/hooks/programmateurs/useProgrammateurDetails.js"
sed -i.bak "s/useProgrammateurDetailsMigrated/useProgrammateurDetails/g" "src/hooks/programmateurs/useProgrammateurDetails.js"
rm -f "src/hooks/programmateurs/useProgrammateurDetails.js.bak"
echo "  ✅ Fonction renommée"

# Étape 5: Nettoyer les exports dans index.js
echo "📤 5. Nettoyage des exports..."
INDEX_FILE="src/hooks/programmateurs/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer tous les anciens exports et commentaires
    sed -i.bak "/export { default as useProgrammateurDetailsOptimized } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useProgrammateurDetailsMigrated } from/d" "$INDEX_FILE"
    
    # Supprimer les commentaires de recommandation
    sed -i.bak "/\* @recommended La version migrée du hook useProgrammateurDetails basée sur les hooks génériques./d" "$INDEX_FILE"
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
git commit -m "🔄 Migration finale useProgrammateurDetails - Consolidation réussie

✅ MIGRATION RÉUSSIE:
- useProgrammateurDetailsMigrated (moderne, propre) → useProgrammateurDetails (nom final)
- Suppression wrapper déprécié + version intermédiaire complexe
- Aucun changement dans les composants (utilisent déjà useProgrammateurDetails)
- Nettoyage des exports multiples et commentaires
- Version finale: useProgrammateurDetails avec useGenericEntityDetails (189 lignes)
- Tests de compilation validés"

echo ""
echo "🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !"
echo "==========================================="
echo "  ✅ useProgrammateurDetails = Version moderne consolidée"
echo "  🗑️ 2 versions obsolètes supprimées (wrapper + optimized)"
echo "  📤 Exports nettoyés (plus de Optimized/Migrated)"
echo "  ✅ Aucun changement requis dans les composants"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: Un seul hook useProgrammateurDetails moderne et fonctionnel !" 