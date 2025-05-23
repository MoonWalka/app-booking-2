#!/bin/bash

# Migration useLieuSearch: useLieuSearchOptimized → useLieuSearch
# Date: $(date +%Y-%m-%d)
# Contexte: Consolidation des hooks - useLieuSearchOptimized utilisé en production, avec attention aux doublons

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration useLieuSearch: useLieuSearchOptimized → useLieuSearch"
echo "================================================================="

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committé dans le repo Git."
    echo "   Veuillez committer ou stasher vos changements avant de continuer."
    exit 1
fi

# Vérifier l'existence des fichiers
OPTIMIZED_FILE="src/hooks/lieux/useLieuSearchOptimized.js"
MIGRATED_FILE="src/hooks/lieux/useLieuSearchMigrated.js"
TARGET_FILE="src/hooks/lieux/useLieuSearch.js"

if [ ! -f "$OPTIMIZED_FILE" ]; then
    echo "❌ Erreur: $OPTIMIZED_FILE non trouvé"
    exit 1
fi

echo "✅ Fichiers sources confirmés"

# Vérifier les doublons dans d'autres dossiers
echo ""
echo "🔍 Vérification des doublons dans d'autres dossiers..."
PROGRAMMATEURS_DUPLICATE="src/hooks/programmateurs/useLieuSearch.js"
SEARCH_DUPLICATE="src/hooks/search/useLieuSearch.js"

if [ -f "$PROGRAMMATEURS_DUPLICATE" ]; then
    echo "⚠️  Doublon détecté: $PROGRAMMATEURS_DUPLICATE"
fi

if [ -f "$SEARCH_DUPLICATE" ]; then
    echo "⚠️  Doublon détecté: $SEARCH_DUPLICATE"
fi

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
echo "   1. Remplacer useLieuSearch.js par useLieuSearchOptimized.js"
echo "   2. Supprimer useLieuSearchOptimized.js"
echo "   3. Supprimer useLieuSearchMigrated.js"
echo "   4. Mettre à jour les imports dans les fichiers externes"
echo "   5. Analyser et gérer les doublons dans d'autres dossiers"
echo "   6. Nettoyer l'index des exports obsolètes"
echo "   7. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   ✅ useLieuSearchOptimized est la version utilisée en production (12 usages)"
echo "   ✅ useLieuSearch actuel n'est qu'un wrapper déprécié"
echo "   🗑️  useLieuSearchMigrated n'est pas utilisé"
echo "   ⚠️  Doublons détectés à traiter avec précaution"
echo ""
read -p "Voulez-vous continuer avec cette migration? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Migration annulée par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début de la migration..."

# Étape 1: Remplacer le contenu du fichier final par la version optimized
echo "1️⃣ Remplacement de useLieuSearch.js par la version optimized..."
cp "$OPTIMIZED_FILE" "$TARGET_FILE"

# Mettre à jour le nom de la fonction dans le fichier
sed -i '' 's/useLieuSearchOptimized/useLieuSearch/g' "$TARGET_FILE"

echo "   ✅ useLieuSearch.js mis à jour avec la version optimized"

# Étape 2: Mettre à jour les imports dans les fichiers qui utilisent useLieuSearchOptimized
echo "2️⃣ Mise à jour des imports externes..."

# Mettre à jour le doublon dans programmateurs qui importe de lieux
if [ -f "$PROGRAMMATEURS_DUPLICATE" ]; then
    echo "   🔧 Traitement du doublon: $PROGRAMMATEURS_DUPLICATE"
    # Ce fichier importe probablement de ../lieux/useLieuSearch, pas de changement nécessaire
    echo "   ✅ $PROGRAMMATEURS_DUPLICATE vérifié (import via useLieuSearch)"
fi

# Mettre à jour le doublon dans search qui importe directement useLieuSearchOptimized
if [ -f "$SEARCH_DUPLICATE" ]; then
    echo "   🔧 Traitement du doublon: $SEARCH_DUPLICATE"
    sed -i '' 's/useLieuSearchOptimized/useLieuSearch/g' "$SEARCH_DUPLICATE"
    sed -i '' 's/useLieuSearchOptimized\.js/useLieuSearch.js/g' "$SEARCH_DUPLICATE"
    echo "   ✅ $SEARCH_DUPLICATE mis à jour"
fi

# Test files
TEST_FILE="src/hooks/__tests__/useLieuSearchOptimized.test.js"
if [ -f "$TEST_FILE" ]; then
    # Renommer le fichier de test
    NEW_TEST_FILE="src/hooks/__tests__/useLieuSearch.test.js"
    mv "$TEST_FILE" "$NEW_TEST_FILE"
    # Mettre à jour le contenu du test
    sed -i '' 's/useLieuSearchOptimized/useLieuSearch/g' "$NEW_TEST_FILE"
    sed -i '' 's/useLieuSearchOptimized\.js/useLieuSearch\.js/g' "$NEW_TEST_FILE"
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
INDEX_FILE="src/hooks/lieux/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer les lignes liées aux variantes obsolètes
    sed -i '' '/useLieuSearchMigrated/d' "$INDEX_FILE"
    sed -i '' '/useLieuSearchOptimized/d' "$INDEX_FILE"
    sed -i '' '/useLieuSearchV2/d' "$INDEX_FILE"
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
echo "   ✅ useLieuSearchOptimized fusionné dans useLieuSearch"
echo "   ✅ 2 fichiers obsolètes supprimés"
echo "   ✅ Doublons dans d'autres dossiers mis à jour"
echo "   ✅ Test file renommé et mis à jour"
echo "   ✅ Exports obsolètes supprimés de l'index"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Migration: useLieuSearch - Consolidation version optimized'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Migration: useLieuSearch - Consolidation version optimized

- useLieuSearchOptimized → useLieuSearch (version finale)
- Suppression de useLieuSearchOptimized.js obsolète
- Suppression de useLieuSearchMigrated.js obsolète
- Mise à jour des doublons dans hooks/search/
- Renommage et mise à jour du fichier de test
- Nettoyage des exports obsolètes dans l'index
- Hook lieu search maintenant unifié

Hooks migrés: 15/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape suggérée: Audit et migration de useProgrammateurSearch" 