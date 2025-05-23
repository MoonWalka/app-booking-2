#!/bin/bash

# Migration useLieuxFilters: useLieuxFiltersOptimized → useLieuxFilters
# Date: $(date +%Y-%m-%d)
# Contexte: Consolidation des hooks - useLieuxFiltersOptimized utilisé en production

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration useLieuxFilters: useLieuxFiltersOptimized → useLieuxFilters"
echo "======================================================================"

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committé dans le repo Git."
    echo "   Veuillez committer ou stasher vos changements avant de continuer."
    exit 1
fi

# Vérifier l'existence des fichiers
OPTIMIZED_FILE="src/hooks/lieux/useLieuxFiltersOptimized.js"
MIGRATED_FILE="src/hooks/lieux/useLieuxFiltersMigrated.js"
TARGET_FILE="src/hooks/lieux/useLieuxFilters.js"

if [ ! -f "$OPTIMIZED_FILE" ]; then
    echo "❌ Erreur: $OPTIMIZED_FILE non trouvé"
    exit 1
fi

echo "✅ Fichiers sources confirmés"

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
echo "📋 PLAN DE MIGRATION:"
echo "   1. Remplacer useLieuxFilters.js par useLieuxFiltersOptimized.js"
echo "   2. Supprimer useLieuxFiltersOptimized.js"
echo "   3. Supprimer useLieuxFiltersMigrated.js"
echo "   4. Mettre à jour les imports dans:"
echo "      - src/components/lieux/desktop/LieuxList.js"
echo "      - Test files"
echo "   5. Nettoyer l'index des exports obsolètes"
echo "   6. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   ✅ useLieuxFiltersOptimized est la version la plus utilisée (14 usages)"
echo "   ✅ useLieuxFilters actuel n'est qu'un wrapper déprécié"
echo "   🗑️  useLieuxFiltersMigrated sera obsolète"
echo ""
read -p "Voulez-vous continuer avec cette migration? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Migration annulée par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début de la migration..."

# Étape 1: Remplacer le contenu du fichier final par la version optimized
echo "1️⃣ Remplacement de useLieuxFilters.js par la version optimized..."
cp "$OPTIMIZED_FILE" "$TARGET_FILE"

# Mettre à jour le nom de la fonction dans le fichier
sed -i '' 's/useLieuxFiltersOptimized/useLieuxFilters/g' "$TARGET_FILE"

echo "   ✅ useLieuxFilters.js mis à jour avec la version optimized"

# Étape 2: Mettre à jour les imports dans les composants
echo "2️⃣ Mise à jour des imports dans les composants..."

# LieuxList.js
LIEUX_LIST_FILE="src/components/lieux/desktop/LieuxList.js"
if [ -f "$LIEUX_LIST_FILE" ]; then
    sed -i '' 's/useLieuxFiltersOptimized/useLieuxFilters/g' "$LIEUX_LIST_FILE"
    echo "   ✅ $LIEUX_LIST_FILE mis à jour"
else
    echo "   ⚠️  $LIEUX_LIST_FILE non trouvé"
fi

# Test files - useLieuxFiltersOptimized
TEST_FILE_OPTIMIZED="src/hooks/__tests__/useLieuxFiltersOptimized.test.js"
if [ -f "$TEST_FILE_OPTIMIZED" ]; then
    # Renommer le fichier de test
    NEW_TEST_FILE="src/hooks/__tests__/useLieuxFilters.test.js"
    mv "$TEST_FILE_OPTIMIZED" "$NEW_TEST_FILE"
    # Mettre à jour le contenu du test
    sed -i '' 's/useLieuxFiltersOptimized/useLieuxFilters/g' "$NEW_TEST_FILE"
    sed -i '' 's/useLieuxFiltersOptimized\.js/useLieuxFilters\.js/g' "$NEW_TEST_FILE"
    echo "   ✅ Test file principal renommé et mis à jour: $NEW_TEST_FILE"
else
    echo "   ℹ️  Test file principal non trouvé"
fi

# Test files - useLieuxFiltersMigrated (supprimer si existe)
TEST_FILE_MIGRATED="src/hooks/__tests__/useLieuxFiltersMigrated.test.js"
if [ -f "$TEST_FILE_MIGRATED" ]; then
    rm -f "$TEST_FILE_MIGRATED"
    echo "   ✅ Test file obsolète supprimé: $TEST_FILE_MIGRATED"
else
    echo "   ℹ️  Test file migrated déjà absent"
fi

# Étape 3: Supprimer les fichiers obsolètes
echo "3️⃣ Suppression des fichiers obsolètes..."

if [ -f "$OPTIMIZED_FILE" ]; then
    rm -f "$OPTIMIZED_FILE"
    echo "   ✅ $OPTIMIZED_FILE supprimé"
fi

if [ -f "$MIGRATED_FILE" ]; then
    rm -f "$MIGRATED_FILE"
    echo "   ✅ $MIGRATED_FILE supprimé"
fi

# Étape 4: Nettoyer l'index
echo "4️⃣ Nettoyage de l'index..."
INDEX_FILE="src/hooks/lieux/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer les lignes liées aux variantes obsolètes
    sed -i '' '/useLieuxFiltersMigrated/d' "$INDEX_FILE"
    sed -i '' '/useLieuxFiltersOptimized/d' "$INDEX_FILE"
    sed -i '' '/useLieuxFiltersV2/d' "$INDEX_FILE"
    echo "   ✅ Exports obsolètes supprimés de l'index"
else
    echo "   ⚠️  $INDEX_FILE non trouvé"
fi

# Étape 5: Test de compilation
echo "5️⃣ Test de compilation..."
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
echo "🎉 MIGRATION TERMINÉE AVEC SUCCÈS!"
echo "=================================="
echo "📊 Résumé des changements:"
echo "   ✅ useLieuxFiltersOptimized fusionné dans useLieuxFilters"
echo "   ✅ 2 fichiers obsolètes supprimés"
echo "   ✅ 1 composant mis à jour (LieuxList.js)"
echo "   ✅ Test files consolidés"
echo "   ✅ Exports obsolètes supprimés de l'index"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Migration: useLieuxFilters - Consolidation version optimized'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Migration: useLieuxFilters - Consolidation version optimized

- useLieuxFiltersOptimized → useLieuxFilters (version finale)
- Mise à jour de 1 composant utilisant ce hook (LieuxList.js)
- Suppression de useLieuxFiltersOptimized.js obsolète
- Suppression de useLieuxFiltersMigrated.js obsolète
- Consolidation des tests vers useLieuxFilters.test.js
- Nettoyage des exports obsolètes dans l'index
- Hook lieux filters maintenant unifié

Hooks migrés: 17/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape suggérée: Audit et migration des hooks de suppression" 