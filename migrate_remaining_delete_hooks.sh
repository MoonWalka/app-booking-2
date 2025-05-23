#!/bin/bash

# Migration hooks de suppression restants: *DeleteOptimized → *Delete
# Date: $(date +%Y-%m-%d)
# Contexte: Finalisation des hooks de suppression - renommage des versions optimized

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration hooks de suppression restants: *DeleteOptimized → *Delete"
echo "======================================================================"

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committés dans le repo Git."
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
echo "📋 PLAN DE MIGRATION DES HOOKS DE SUPPRESSION RESTANTS:"
echo "   1. useDeleteArtisteOptimized → useDeleteArtiste (renommage simple)"
echo "   2. useDeleteProgrammateurOptimized → useDeleteProgrammateur (consolidation)"
echo "   3. useDeleteStructureOptimized → useDeleteStructure (consolidation)"
echo "   4. Mettre à jour tous les imports dans les composants"
echo "   5. Nettoyer les index des exports obsolètes"
echo "   6. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   ✅ Les versions Optimized sont les plus utilisées en production"
echo "   🎯 Finalisation de l'unification des hooks de suppression"
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

# Migration 1: useDeleteArtiste (renommage simple)
echo "1️⃣ Migration useDeleteArtiste..."
ARTISTE_OPTIMIZED="src/hooks/artistes/useDeleteArtisteOptimized.js"
ARTISTE_TARGET="src/hooks/artistes/useDeleteArtiste.js"

if [ -f "$ARTISTE_OPTIMIZED" ]; then
    # Copier et renommer
    cp "$ARTISTE_OPTIMIZED" "$ARTISTE_TARGET"
    sed -i '' 's/useDeleteArtisteOptimized/useDeleteArtiste/g' "$ARTISTE_TARGET"
    rm -f "$ARTISTE_OPTIMIZED"
    
    # Mettre à jour les imports dans ArtistesList.js
    ARTISTES_LIST="src/components/artistes/desktop/ArtistesList.js"
    if [ -f "$ARTISTES_LIST" ]; then
        sed -i '' 's/useDeleteArtisteOptimized/useDeleteArtiste/g' "$ARTISTES_LIST"
        ((FILES_UPDATED++))
    fi
    
    # Mettre à jour les imports dans ArtisteForm.js
    ARTISTE_FORM="src/components/artistes/desktop/ArtisteForm.js"
    if [ -f "$ARTISTE_FORM" ]; then
        sed -i '' 's/useDeleteArtisteOptimized/useDeleteArtiste/g' "$ARTISTE_FORM"
        sed -i '' 's/useDeleteArtisteOptimized\.js/useDeleteArtiste\.js/g' "$ARTISTE_FORM"
        ((FILES_UPDATED++))
    fi
    
    # Nettoyer l'index artistes
    ARTISTES_INDEX="src/hooks/artistes/index.js"
    if [ -f "$ARTISTES_INDEX" ]; then
        sed -i '' 's/useDeleteArtisteOptimized/useDeleteArtiste/g' "$ARTISTES_INDEX"
    fi
    
    echo "   ✅ useDeleteArtiste migré"
    ((HOOKS_MIGRATED++))
    ((FILES_DELETED++))
else
    echo "   ⚠️  useDeleteArtisteOptimized non trouvé"
fi

# Migration 2: useDeleteProgrammateur (consolidation)
echo "2️⃣ Migration useDeleteProgrammateur..."
PROGRAMMATEUR_OPTIMIZED="src/hooks/programmateurs/useDeleteProgrammateurOptimized.js"
PROGRAMMATEUR_TARGET="src/hooks/programmateurs/useDeleteProgrammateur.js"

if [ -f "$PROGRAMMATEUR_OPTIMIZED" ]; then
    # Remplacer par la version optimized
    cp "$PROGRAMMATEUR_OPTIMIZED" "$PROGRAMMATEUR_TARGET"
    sed -i '' 's/useDeleteProgrammateurOptimized/useDeleteProgrammateur/g' "$PROGRAMMATEUR_TARGET"
    rm -f "$PROGRAMMATEUR_OPTIMIZED"
    
    # Mettre à jour les imports dans ProgrammateursList.js
    PROGRAMMATEURS_LIST="src/components/programmateurs/desktop/ProgrammateursList.js"
    if [ -f "$PROGRAMMATEURS_LIST" ]; then
        sed -i '' 's/useDeleteProgrammateurOptimized/useDeleteProgrammateur/g' "$PROGRAMMATEURS_LIST"
        ((FILES_UPDATED++))
    fi
    
    # Mettre à jour les imports dans ProgrammateurForm.js
    PROGRAMMATEUR_FORM="src/components/programmateurs/desktop/ProgrammateurForm.js"
    if [ -f "$PROGRAMMATEUR_FORM" ]; then
        sed -i '' 's/useDeleteProgrammateurOptimized/useDeleteProgrammateur/g' "$PROGRAMMATEUR_FORM"
        sed -i '' 's/useDeleteProgrammateurOptimized\.js/useDeleteProgrammateur\.js/g' "$PROGRAMMATEUR_FORM"
        ((FILES_UPDATED++))
    fi
    
    # Nettoyer l'index programmateurs
    PROGRAMMATEURS_INDEX="src/hooks/programmateurs/index.js"
    if [ -f "$PROGRAMMATEURS_INDEX" ]; then
        sed -i '' '/useDeleteProgrammateurOptimized/d' "$PROGRAMMATEURS_INDEX"
    fi
    
    echo "   ✅ useDeleteProgrammateur migré"
    ((HOOKS_MIGRATED++))
    ((FILES_DELETED++))
else
    echo "   ⚠️  useDeleteProgrammateurOptimized non trouvé"
fi

# Migration 3: useDeleteStructure (consolidation)
echo "3️⃣ Migration useDeleteStructure..."
STRUCTURE_OPTIMIZED="src/hooks/structures/useDeleteStructureOptimized.js"
STRUCTURE_TARGET="src/hooks/structures/useDeleteStructure.js"

if [ -f "$STRUCTURE_OPTIMIZED" ]; then
    # Remplacer par la version optimized
    cp "$STRUCTURE_OPTIMIZED" "$STRUCTURE_TARGET"
    sed -i '' 's/useDeleteStructureOptimized/useDeleteStructure/g' "$STRUCTURE_TARGET"
    rm -f "$STRUCTURE_OPTIMIZED"
    
    # Mettre à jour les imports dans StructureDetails.js
    STRUCTURE_DETAILS="src/components/structures/desktop/StructureDetails.js"
    if [ -f "$STRUCTURE_DETAILS" ]; then
        sed -i '' 's/useDeleteStructureOptimized/useDeleteStructure/g' "$STRUCTURE_DETAILS"
        ((FILES_UPDATED++))
    fi
    
    # Mettre à jour les imports dans StructureForm.js
    STRUCTURE_FORM="src/components/structures/desktop/StructureForm.js"
    if [ -f "$STRUCTURE_FORM" ]; then
        sed -i '' 's/useDeleteStructureOptimized/useDeleteStructure/g' "$STRUCTURE_FORM"
        sed -i '' 's/useDeleteStructureOptimized\.js/useDeleteStructure\.js/g' "$STRUCTURE_FORM"
        ((FILES_UPDATED++))
    fi
    
    # Nettoyer l'index structures
    STRUCTURES_INDEX="src/hooks/structures/index.js"
    if [ -f "$STRUCTURES_INDEX" ]; then
        sed -i '' '/useDeleteStructureOptimized/d' "$STRUCTURES_INDEX"
    fi
    
    echo "   ✅ useDeleteStructure migré"
    ((HOOKS_MIGRATED++))
    ((FILES_DELETED++))
else
    echo "   ⚠️  useDeleteStructureOptimized non trouvé"
fi

# Test de compilation
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
echo "🎉 MIGRATION DES HOOKS DE SUPPRESSION RESTANTS TERMINÉE!"
echo "========================================================="
echo "📊 Résumé des changements:"
echo "   ✅ $HOOKS_MIGRATED hooks de suppression migrés"
echo "   ✅ $FILES_UPDATED composants mis à jour"
echo "   ✅ $FILES_DELETED fichiers obsolètes supprimés"
echo "   ✅ Index nettoyés"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Migration: Hooks de suppression restants - Finalisation'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Migration: Hooks de suppression restants - Finalisation

- useDeleteArtisteOptimized → useDeleteArtiste (renommage)
- useDeleteProgrammateurOptimized → useDeleteProgrammateur (consolidation)
- useDeleteStructureOptimized → useDeleteStructure (consolidation)
- Mise à jour de $FILES_UPDATED composants utilisant ces hooks
- Suppression de $FILES_DELETED fichiers obsolètes
- Nettoyage des exports obsolètes dans les index
- Tous les hooks de suppression maintenant unifiés

Hooks migrés: $((20 + HOOKS_MIGRATED))/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape: Migration des derniers hooks Details (useLieuDetails, useStructureDetails, etc.)" 