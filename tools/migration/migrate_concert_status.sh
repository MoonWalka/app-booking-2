#!/bin/bash

# Migration useConcertStatus: useConcertStatusMigrated → useConcertStatus
# Date: $(date +%Y-%m-%d)
# Contexte: Consolidation des hooks - useConcertStatusMigrated utilisé en production

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration useConcertStatus: useConcertStatusMigrated → useConcertStatus"
echo "======================================================================"

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committés dans le repo Git."
    echo "   Veuillez committer ou stasher vos changements avant de continuer."
    exit 1
fi

# Vérifier l'existence des fichiers
MIGRATED_FILE="src/hooks/concerts/useConcertStatusMigrated.js"
TARGET_FILE="src/hooks/concerts/useConcertStatus.js"

if [ ! -f "$MIGRATED_FILE" ]; then
    echo "❌ Erreur: $MIGRATED_FILE non trouvé"
    exit 1
fi

if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Erreur: $TARGET_FILE non trouvé"
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
echo "   1. Remplacer useConcertStatus.js par useConcertStatusMigrated.js"
echo "   2. Supprimer useConcertStatusMigrated.js"
echo "   3. Mettre à jour les imports dans:"
echo "      - Test file (renommage)"
echo "   4. Nettoyer l'index des exports obsolètes (useConcertStatusV2)"
echo "   5. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   ✅ useConcertStatusMigrated est la version la plus utilisée (8 usages vs 6)"
echo "   ✅ useConcertStatus actuel sera remplacé par la version migrated"
echo "   🗑️  useConcertStatusV2 (alias) sera obsolète"
echo ""
read -p "Voulez-vous continuer avec cette migration? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Migration annulée par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début de la migration..."

# Étape 1: Remplacer le contenu du fichier final par la version migrated
echo "1️⃣ Remplacement de useConcertStatus.js par la version migrated..."
cp "$MIGRATED_FILE" "$TARGET_FILE"

# Mettre à jour le nom de la fonction dans le fichier
sed -i '' 's/useConcertStatusMigrated/useConcertStatus/g' "$TARGET_FILE"

echo "   ✅ useConcertStatus.js mis à jour avec la version migrated"

# Étape 2: Mettre à jour les test files
echo "2️⃣ Mise à jour des tests..."

# Test file - useConcertStatusMigrated → useConcertStatus
TEST_FILE_MIGRATED="src/hooks/__tests__/useConcertStatusMigrated.test.js"
if [ -f "$TEST_FILE_MIGRATED" ]; then
    # Renommer le fichier de test
    NEW_TEST_FILE="src/hooks/__tests__/useConcertStatus.test.js"
    mv "$TEST_FILE_MIGRATED" "$NEW_TEST_FILE"
    # Mettre à jour le contenu du test
    sed -i '' 's/useConcertStatusMigrated/useConcertStatus/g' "$NEW_TEST_FILE"
    sed -i '' 's/useConcertStatusMigrated\.js/useConcertStatus\.js/g' "$NEW_TEST_FILE"
    echo "   ✅ Test file renommé et mis à jour: $NEW_TEST_FILE"
else
    echo "   ℹ️  Test file migrated non trouvé"
fi

# Étape 3: Supprimer les fichiers obsolètes
echo "3️⃣ Suppression des fichiers obsolètes..."

if [ -f "$MIGRATED_FILE" ]; then
    rm -f "$MIGRATED_FILE"
    echo "   ✅ $MIGRATED_FILE supprimé"
fi

# Étape 4: Nettoyer l'index
echo "4️⃣ Nettoyage de l'index..."
INDEX_FILE="src/hooks/concerts/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer les lignes liées aux variantes obsolètes
    sed -i '' '/useConcertStatusMigrated/d' "$INDEX_FILE"
    sed -i '' '/useConcertStatusV2/d' "$INDEX_FILE"
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
echo "   ✅ useConcertStatusMigrated fusionné dans useConcertStatus"
echo "   ✅ 1 fichier obsolète supprimé"
echo "   ✅ Test file consolidé"
echo "   ✅ Exports obsolètes supprimés de l'index (useConcertStatusV2)"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Migration: useConcertStatus - Consolidation version migrated'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Migration: useConcertStatus - Consolidation version migrated

- useConcertStatusMigrated → useConcertStatus (version finale)
- Suppression de useConcertStatusMigrated.js obsolète
- Consolidation des tests vers useConcertStatus.test.js
- Nettoyage des exports obsolètes dans l'index (useConcertStatusV2)
- Hook concert status maintenant unifié

Hooks migrés: 20/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape suggérée: Migration des hooks de suppression restants (useDeleteArtiste, etc.)" 