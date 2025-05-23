#!/bin/bash

# Script de consolidation SÉCURISÉ des hooks dupliqués
# Supprime seulement les versions NON UTILISÉES (0 imports)

set -e  # Arrêter en cas d'erreur

echo "🔧 CONSOLIDATION SÉCURISÉE DES HOOKS"
echo "===================================="
echo ""
echo "⚠️  Ce script va supprimer SEULEMENT les hooks NON UTILISÉS (0 imports)"
echo "   Les hooks avec des imports seront conservés pour éviter de casser l'app"
echo ""

# Vérifier qu'on est dans un dépôt Git et que tout est committé
if ! git status --porcelain | grep -q .; then
    echo "✅ Dépôt Git propre, on peut continuer"
else
    echo "❌ ERREUR: Des changements non commités détectés !"
    echo "   Faites 'git add -A && git commit -m \"snapshot\"' d'abord"
    exit 1
fi

echo ""
read -p "🤔 Êtes-vous sûr de vouloir continuer ? (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
    echo "❌ Opération annulée"
    exit 0
fi

echo ""
echo "🔍 IDENTIFICATION DES HOOKS NON UTILISÉS..."

# Basé sur l'analyse, ces hooks ont 0 imports et peuvent être supprimés en sécurité
HOOKS_TO_DELETE=(
    "src/hooks/lieux/useLieuDeleteMigrated.js"
    "src/hooks/lieux/useLieuFormMigrated.js"
    "src/hooks/lieux/useLieuFormComplete.js"
    "src/hooks/lieux/useLieuSearchMigrated.js"
    "src/hooks/artistes/useArtisteDetailsOptimized.js"
    "src/hooks/artistes/useArtisteSearchOptimized.js"
    "src/hooks/artistes/useArtistesListMigrated.js"
    "src/hooks/concerts/useConcertFormMigrated.js"
    "src/hooks/programmateurs/useProgrammateurDetailsMigrated.js"
)

echo ""
echo "📋 HOOKS À SUPPRIMER (0 imports détectés):"
echo "============================================"
for hook in "${HOOKS_TO_DELETE[@]}"; do
    if [ -f "$hook" ]; then
        echo "  🗑️  $hook"
    else
        echo "  ⚠️  $hook (fichier introuvable)"
    fi
done

echo ""
read -p "🚨 Confirmer la suppression de ces $(echo "${HOOKS_TO_DELETE[@]}" | wc -w) hooks ? (oui/non): " confirm_delete
if [ "$confirm_delete" != "oui" ]; then
    echo "❌ Suppression annulée"
    exit 0
fi

echo ""
echo "🗑️ SUPPRESSION EN COURS..."

deleted_count=0
for hook in "${HOOKS_TO_DELETE[@]}"; do
    if [ -f "$hook" ]; then
        echo "  ✅ Suppression: $hook"
        rm "$hook"
        ((deleted_count++))
    else
        echo "  ⚠️  Ignoré (introuvable): $hook"
    fi
done

echo ""
echo "✅ SUPPRESSION TERMINÉE !"
echo "========================"
echo "  🗑️  Hooks supprimés: $deleted_count"

echo ""
echo "🧪 VÉRIFICATION POST-SUPPRESSION..."

# Vérifier que l'app compile toujours
echo "  🔍 Test de compilation..."
if npm run build --silent 2>/dev/null; then
    echo "  ✅ Compilation réussie !"
else
    echo "  ❌ ERREUR DE COMPILATION détectée !"
    echo "     Restauration depuis Git..."
    git checkout HEAD -- src/hooks/
    echo "  🔄 Hooks restaurés, vérifiez l'analyse avant de réessayer"
    exit 1
fi

echo ""
echo "💾 CRÉATION D'UN COMMIT DE SAUVEGARDE..."
git add -A
git commit -m "🗑️ Suppression sécurisée de $deleted_count hooks non utilisés

Hooks supprimés:
$(printf '%s\n' "${HOOKS_TO_DELETE[@]}" | sed 's/^/- /')"

echo ""
echo "🎉 CONSOLIDATION TERMINÉE AVEC SUCCÈS !"
echo "======================================"
echo "  ✅ $deleted_count hooks inutilisés supprimés"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "📊 PROCHAINES ÉTAPES RECOMMANDÉES:"
echo "  1️⃣  Tester l'application manuellement"
echo "  2️⃣  Analyser les hooks restants avec versions multiples"
echo "  3️⃣  Planifier la migration des imports vers les versions optimisées" 