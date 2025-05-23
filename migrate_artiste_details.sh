#!/bin/bash

# Migration useArtisteDetails: useArtisteDetailsOptimized → useArtisteDetails
# Date: $(date +%Y-%m-%d)
# Contexte: Consolidation des hooks - useArtisteDetailsOptimized est la version la plus complète

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration useArtisteDetails: useArtisteDetailsOptimized → useArtisteDetails"
echo "============================================================================"

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committé dans le repo Git."
    echo "   Veuillez committer ou stasher vos changements avant de continuer."
    exit 1
fi

# Vérifier l'existence des fichiers
OPTIMIZED_FILE="src/hooks/artistes/useArtisteDetailsOptimized.js"
MIGRATED_FILE="src/hooks/artistes/useArtisteDetailsMigrated.js"
TARGET_FILE="src/hooks/artistes/useArtisteDetails.js"

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
echo "   1. Remplacer useArtisteDetails.js par useArtisteDetailsOptimized.js"
echo "   2. Supprimer useArtisteDetailsOptimized.js"
echo "   3. Supprimer useArtisteDetailsMigrated.js"
echo "   4. Nettoyer l'index des exports obsolètes"
echo "   5. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   ✅ useArtisteDetailsOptimized est la version la plus complète (292 lignes)"
echo "   ✅ Gestion d'erreurs robuste et fonctionnalités avancées"
echo "   ✅ Aucune version n'est utilisée directement dans les composants"
echo ""
read -p "Voulez-vous continuer avec cette migration? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Migration annulée par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début de la migration..."

# Étape 1: Remplacer le contenu du fichier final par la version optimized
echo "1️⃣ Remplacement de useArtisteDetails.js par la version optimized..."
cp "$OPTIMIZED_FILE" "$TARGET_FILE"

# Mettre à jour le nom de la fonction dans le fichier
sed -i '' 's/useArtisteDetailsOptimized/useArtisteDetails/g' "$TARGET_FILE"

echo "   ✅ useArtisteDetails.js mis à jour avec la version optimized"

# Étape 2: Supprimer les fichiers obsolètes
echo "2️⃣ Suppression des fichiers obsolètes..."

if [ -f "$OPTIMIZED_FILE" ]; then
    rm -f "$OPTIMIZED_FILE"
    echo "   ✅ $OPTIMIZED_FILE supprimé"
fi

if [ -f "$MIGRATED_FILE" ]; then
    rm -f "$MIGRATED_FILE"
    echo "   ✅ $MIGRATED_FILE supprimé"
fi

# Étape 3: Nettoyer l'index
echo "3️⃣ Nettoyage de l'index..."
INDEX_FILE="src/hooks/artistes/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer les lignes liées aux variantes obsolètes
    sed -i '' '/useArtisteDetailsMigrated/d' "$INDEX_FILE"
    sed -i '' '/useArtisteDetailsOptimized/d' "$INDEX_FILE"  
    sed -i '' '/useArtisteDetailsV2/d' "$INDEX_FILE"
    echo "   ✅ Exports obsolètes supprimés de l'index"
else
    echo "   ⚠️  $INDEX_FILE non trouvé"
fi

# Étape 4: Test de compilation
echo "4️⃣ Test de compilation..."
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
echo "   ✅ useArtisteDetailsOptimized fusionné dans useArtisteDetails"
echo "   ✅ 2 fichiers obsolètes supprimés"  
echo "   ✅ Exports obsolètes supprimés de l'index"
echo "   ✅ Compilation validée"
echo "   ✅ Hook artiste détails maintenant unifié et optimisé"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Migration: useArtisteDetails - Consolidation version optimized'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Migration: useArtisteDetails - Consolidation version optimized

- useArtisteDetailsOptimized → useArtisteDetails (version finale)
- Suppression de useArtisteDetailsMigrated.js obsolète
- Suppression de useArtisteDetailsOptimized.js obsolète
- Nettoyage des exports obsolètes dans l'index
- Hook artiste détails maintenant unifié et optimisé (292 lignes)

Hooks migrés: 13/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape suggérée: Audit et migration de useArtistesListOptimized" 