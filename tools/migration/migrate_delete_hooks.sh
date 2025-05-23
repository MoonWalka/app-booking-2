#!/bin/bash

# Migration des hooks de suppression: *DeleteOptimized → *Delete
# Date: $(date +%Y-%m-%d)
# Contexte: Consolidation des hooks de suppression - renommage des versions optimized

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration des hooks de suppression: *DeleteOptimized → *Delete"
echo "================================================================"

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committé dans le repo Git."
    echo "   Veuillez committer ou stasher vos changements avant de continuer."
    exit 1
fi

echo "✅ Git status propre confirmé"

# Fonction de restauration en cas d'erreur
restore_on_error() {
    echo "❌ Erreur détectée! Restauration des fichiers..."
    git checkout HEAD -- . 2>/dev/null || true
    echo "🔄 Fichiers restaurés à l'état initial"
    exit 1
}

# Installer le trap pour la restauration automatique
trap restore_on_error ERR

# Demander confirmation à l'utilisateur
echo ""
echo "📋 PLAN DE MIGRATION DES HOOKS DE SUPPRESSION:"
echo "   1. useConcertDeleteOptimized → useConcertDelete (renommage simple)"
echo "   2. useLieuDeleteOptimized → useLieuDelete (consolidation)"
echo "   3. Mettre à jour tous les imports dans les composants"
echo "   4. Nettoyer les index des exports obsolètes"
echo "   5. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   ✅ Les versions Optimized sont utilisées en production"
echo "   🎯 Simplification des noms pour les hooks de suppression"
echo ""
read -p "Voulez-vous continuer avec cette migration? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Migration annulée par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début de la migration..."

# Compteurs pour le résumé
HOOKS_MIGRATED=0
FILES_UPDATED=0
FILES_DELETED=0

# Migration 1: useConcertDelete (renommage simple)
echo "1️⃣ Migration useConcertDelete..."
CONCERT_OPTIMIZED="src/hooks/concerts/useConcertDeleteOptimized.js"
CONCERT_TARGET="src/hooks/concerts/useConcertDelete.js"

if [ -f "$CONCERT_OPTIMIZED" ]; then
    # Copier et renommer
    cp "$CONCERT_OPTIMIZED" "$CONCERT_TARGET"
    sed -i '' 's/useConcertDeleteOptimized/useConcertDelete/g' "$CONCERT_TARGET"
    rm -f "$CONCERT_OPTIMIZED"
    
    # Mettre à jour les imports dans ConcertForm.js
    CONCERT_FORM="src/components/concerts/desktop/ConcertForm.js"
    if [ -f "$CONCERT_FORM" ]; then
        sed -i '' 's/useConcertDeleteOptimized/useConcertDelete/g' "$CONCERT_FORM"
        ((FILES_UPDATED++))
    fi
    
    # Nettoyer l'index concerts
    CONCERTS_INDEX="src/hooks/concerts/index.js"
    if [ -f "$CONCERTS_INDEX" ]; then
        sed -i '' 's/useConcertDeleteOptimized/useConcertDelete/g' "$CONCERTS_INDEX"
    fi
    
    echo "   ✅ useConcertDelete migré"
    ((HOOKS_MIGRATED++))
    ((FILES_DELETED++))
else
    echo "   ⚠️  useConcertDeleteOptimized non trouvé"
fi

# Migration 2: useLieuDelete (consolidation)
echo "2️⃣ Migration useLieuDelete..."
LIEU_OPTIMIZED="src/hooks/lieux/useLieuDeleteOptimized.js"
LIEU_MIGRATED="src/hooks/lieux/useLieuDeleteMigrated.js"
LIEU_TARGET="src/hooks/lieux/useLieuDelete.js"

if [ -f "$LIEU_OPTIMIZED" ]; then
    # Remplacer par la version optimized
    cp "$LIEU_OPTIMIZED" "$LIEU_TARGET"
    sed -i '' 's/useLieuDeleteOptimized/useLieuDelete/g' "$LIEU_TARGET"
    
    # Supprimer les versions obsolètes
    rm -f "$LIEU_OPTIMIZED"
    if [ -f "$LIEU_MIGRATED" ]; then
        rm -f "$LIEU_MIGRATED"
        ((FILES_DELETED++))
    fi
    
    # Mettre à jour les imports dans LieuxList.js
    LIEUX_LIST="src/components/lieux/desktop/LieuxList.js"
    if [ -f "$LIEUX_LIST" ]; then
        sed -i '' 's/useLieuDeleteOptimized/useLieuDelete/g' "$LIEUX_LIST"
        ((FILES_UPDATED++))
    fi
    
    # Mettre à jour les imports dans LieuForm.js
    LIEU_FORM="src/components/lieux/desktop/LieuForm.js"
    if [ -f "$LIEU_FORM" ]; then
        sed -i '' 's/useLieuDeleteOptimized/useLieuDelete/g' "$LIEU_FORM"
        ((FILES_UPDATED++))
    fi
    
    # Nettoyer l'index lieux
    LIEUX_INDEX="src/hooks/lieux/index.js"
    if [ -f "$LIEUX_INDEX" ]; then
        # Supprimer d'abord l'ancien export useLieuDelete pour éviter les doublons
        sed -i '' '/export { default as useLieuDelete } from/d' "$LIEUX_INDEX"
        sed -i '' '/useLieuDeleteMigrated/d' "$LIEUX_INDEX"
        sed -i '' '/useLieuDeleteV2/d' "$LIEUX_INDEX"
        # Puis renommer useLieuDeleteOptimized en useLieuDelete
        sed -i '' 's/useLieuDeleteOptimized/useLieuDelete/g' "$LIEUX_INDEX"
    fi
    
    echo "   ✅ useLieuDelete migré"
    ((HOOKS_MIGRATED++))
    ((FILES_DELETED++))
else
    echo "   ⚠️  useLieuDeleteOptimized non trouvé"
fi

# Test de compilation
echo "3️⃣ Test de compilation..."
if npm run build > /tmp/build_output.log 2>&1; then
    echo "   ✅ Compilation réussie!"
else
    echo "   ❌ Erreur de compilation!"
    echo "   📄 Logs d'erreur:"
    cat /tmp/build_output.log | tail -20
    restore_on_error
fi

# Supprimer le trap maintenant que tout s'est bien passé
trap - ERR

echo ""
echo "🎉 MIGRATION DES HOOKS DE SUPPRESSION TERMINÉE!"
echo "==============================================="
echo "📊 Résumé des changements:"
echo "   ✅ $HOOKS_MIGRATED hooks de suppression migrés"
echo "   ✅ $FILES_UPDATED composants mis à jour"
echo "   ✅ $FILES_DELETED fichiers obsolètes supprimés"
echo "   ✅ Index nettoyés"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Migration: Hooks de suppression - Consolidation versions optimized'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Migration: Hooks de suppression - Consolidation versions optimized

- useConcertDeleteOptimized → useConcertDelete (renommage)
- useLieuDeleteOptimized → useLieuDelete (consolidation)
- Mise à jour de $FILES_UPDATED composants utilisant ces hooks
- Suppression de $FILES_DELETED fichiers obsolètes
- Nettoyage des exports obsolètes dans les index
- Hooks de suppression maintenant unifiés

Hooks migrés: $((17 + HOOKS_MIGRATED))/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape: Migration des hooks de suppression restants (useDeleteArtiste, etc.)" 