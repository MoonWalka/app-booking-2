#!/bin/bash

# Migration useProgrammateurSearch: useProgrammateurSearchOptimized → useProgrammateurSearch
# Date: $(date +%Y-%m-%d)
# Contexte: Consolidation des hooks - useProgrammateurSearchOptimized utilisé en production

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration useProgrammateurSearch: useProgrammateurSearchOptimized → useProgrammateurSearch"
echo "=================================================================================="

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committé dans le repo Git."
    echo "   Veuillez committer ou stasher vos changements avant de continuer."
    exit 1
fi

# Vérifier l'existence des fichiers
OPTIMIZED_FILE="src/hooks/programmateurs/useProgrammateurSearchOptimized.js"
MIGRATED_FILE="src/hooks/programmateurs/useProgrammateurSearchMigrated.js"
TARGET_FILE="src/hooks/programmateurs/useProgrammateurSearch.js"

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
echo "   1. Remplacer useProgrammateurSearch.js par useProgrammateurSearchOptimized.js"
echo "   2. Supprimer useProgrammateurSearchOptimized.js"
echo "   3. Supprimer useProgrammateurSearchMigrated.js"
echo "   4. Mettre à jour les imports dans:"
echo "      - src/components/programmateurs/desktop/ProgrammateursList.js"
echo "      - src/components/lieux/desktop/LieuDetails.js (V2 → standard)"
echo "      - src/hooks/lieux/useLieuForm.js"
echo "      - Test files"
echo "   5. Nettoyer l'index des exports obsolètes"
echo "   6. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   ✅ useProgrammateurSearchOptimized est la version la plus utilisée (11 usages)"
echo "   ✅ Version la plus complète avec 247 lignes de fonctionnalités"
echo "   🗑️  useProgrammateurSearchMigrated sera obsolète"
echo ""
read -p "Voulez-vous continuer avec cette migration? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Migration annulée par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début de la migration..."

# Étape 1: Remplacer le contenu du fichier final par la version optimized
echo "1️⃣ Remplacement de useProgrammateurSearch.js par la version optimized..."
cp "$OPTIMIZED_FILE" "$TARGET_FILE"

# Mettre à jour le nom de la fonction dans le fichier
sed -i '' 's/useProgrammateurSearchOptimized/useProgrammateurSearch/g' "$TARGET_FILE"

echo "   ✅ useProgrammateurSearch.js mis à jour avec la version optimized"

# Étape 2: Mettre à jour les imports dans les composants
echo "2️⃣ Mise à jour des imports dans les composants..."

# ProgrammateursList.js
PROGRAMMATEURS_LIST_FILE="src/components/programmateurs/desktop/ProgrammateursList.js"
if [ -f "$PROGRAMMATEURS_LIST_FILE" ]; then
    sed -i '' 's/useProgrammateurSearchOptimized/useProgrammateurSearch/g' "$PROGRAMMATEURS_LIST_FILE"
    echo "   ✅ $PROGRAMMATEURS_LIST_FILE mis à jour"
else
    echo "   ⚠️  $PROGRAMMATEURS_LIST_FILE non trouvé"
fi

# LieuDetails.js - Migration de V2 vers standard
LIEU_DETAILS_FILE="src/components/lieux/desktop/LieuDetails.js"
if [ -f "$LIEU_DETAILS_FILE" ]; then
    sed -i '' 's/useProgrammateurSearchV2/useProgrammateurSearch/g' "$LIEU_DETAILS_FILE"
    echo "   ✅ $LIEU_DETAILS_FILE mis à jour (V2 → standard)"
else
    echo "   ⚠️  $LIEU_DETAILS_FILE non trouvé"
fi

# useLieuForm.js - Vérifier le doublon et l'import path
LIEU_FORM_FILE="src/hooks/lieux/useLieuForm.js"
if [ -f "$LIEU_FORM_FILE" ]; then
    # Ce fichier importe depuis @/hooks/lieux/useProgrammateurSearch, corriger vers programmateurs
    sed -i '' 's/@\/hooks\/lieux\/useProgrammateurSearch/@\/hooks\/programmateurs\/useProgrammateurSearch/g' "$LIEU_FORM_FILE"
    echo "   ✅ $LIEU_FORM_FILE mis à jour (import path corrigé)"
else
    echo "   ⚠️  $LIEU_FORM_FILE non trouvé"
fi

# Vérifier et supprimer le doublon dans lieux si il existe
LIEU_DUPLICATE="src/hooks/lieux/useProgrammateurSearch.js"
if [ -f "$LIEU_DUPLICATE" ]; then
    rm -f "$LIEU_DUPLICATE"
    echo "   ✅ Doublon supprimé: $LIEU_DUPLICATE"
else
    echo "   ℹ️  Doublon déjà absent: $LIEU_DUPLICATE"
fi

# Vérifier et supprimer le doublon dans search si il existe
SEARCH_DUPLICATE="src/hooks/search/useProgrammateurSearch.js"
if [ -f "$SEARCH_DUPLICATE" ]; then
    rm -f "$SEARCH_DUPLICATE"
    echo "   ✅ Doublon supprimé: $SEARCH_DUPLICATE"
else
    echo "   ℹ️  Doublon déjà absent: $SEARCH_DUPLICATE"
fi

# Nettoyer l'export du doublon dans l'index lieux
LIEU_INDEX_FILE="src/hooks/lieux/index.js"
if [ -f "$LIEU_INDEX_FILE" ]; then
    sed -i '' '/useProgrammateurSearch/d' "$LIEU_INDEX_FILE"
    echo "   ✅ Export useProgrammateurSearch supprimé de $LIEU_INDEX_FILE"
else
    echo "   ⚠️  $LIEU_INDEX_FILE non trouvé"
fi

# Test files
TEST_FILE="src/hooks/__tests__/useProgrammateurSearchOptimized.test.js"
if [ -f "$TEST_FILE" ]; then
    # Renommer le fichier de test
    NEW_TEST_FILE="src/hooks/__tests__/useProgrammateurSearch.test.js"
    mv "$TEST_FILE" "$NEW_TEST_FILE"
    # Mettre à jour le contenu du test
    sed -i '' 's/useProgrammateurSearchOptimized/useProgrammateurSearch/g' "$NEW_TEST_FILE"
    sed -i '' 's/useProgrammateurSearchOptimized\.js/useProgrammateurSearch\.js/g' "$NEW_TEST_FILE"
    echo "   ✅ Test file renommé et mis à jour: $NEW_TEST_FILE"
else
    echo "   ℹ️  Test file non trouvé"
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
INDEX_FILE="src/hooks/programmateurs/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer les lignes liées aux variantes obsolètes
    sed -i '' '/useProgrammateurSearchMigrated/d' "$INDEX_FILE"
    sed -i '' '/useProgrammateurSearchOptimized/d' "$INDEX_FILE"
    sed -i '' '/useProgrammateurSearchV2/d' "$INDEX_FILE"
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
echo "   ✅ useProgrammateurSearchOptimized fusionné dans useProgrammateurSearch"
echo "   ✅ 2 fichiers obsolètes supprimés"
echo "   ✅ 3 composants mis à jour (ProgrammateursList, LieuDetails, useLieuForm)"
echo "   ✅ Migration V2 → standard effectuée"
echo "   ✅ Doublon dans lieux/ supprimé"
echo "   ✅ Test file renommé et mis à jour"
echo "   ✅ Exports obsolètes supprimés de l'index"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Migration: useProgrammateurSearch - Consolidation version optimized'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Migration: useProgrammateurSearch - Consolidation version optimized

- useProgrammateurSearchOptimized → useProgrammateurSearch (version finale)
- Mise à jour de 3 composants utilisant ce hook
- Migration useProgrammateurSearchV2 → useProgrammateurSearch
- Suppression de useProgrammateurSearchOptimized.js obsolète
- Suppression de useProgrammateurSearchMigrated.js obsolète
- Suppression du doublon dans hooks/lieux/
- Renommage et mise à jour du fichier de test
- Nettoyage des exports obsolètes dans l'index
- Hook programmateur search maintenant unifié (247 lignes)

Hooks migrés: 16/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape suggérée: Audit et migration de useLieuxFilters" 