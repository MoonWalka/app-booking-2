#!/bin/bash

# Migration useProgrammateurForm: useProgrammateurFormOptimized → useProgrammateurForm
# Date: $(date +%Y-%m-%d)
# Contexte: Consolidation des hooks de formulaires - useProgrammateurFormOptimized utilisé en production

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Migration useProgrammateurForm: useProgrammateurFormOptimized → useProgrammateurForm"
echo "========================================================================"

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committé dans le repo Git."
    echo "   Veuillez committer ou stasher vos changements avant de continuer."
    exit 1
fi

# Vérifier l'existence des fichiers
OPTIMIZED_FILE="src/hooks/programmateurs/useProgrammateurFormOptimized.js"
TARGET_FILE="src/hooks/programmateurs/useProgrammateurForm.js"

if [ ! -f "$OPTIMIZED_FILE" ]; then
    echo "❌ Erreur: $OPTIMIZED_FILE non trouvé"
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
echo "   1. Remplacer useProgrammateurForm.js par useProgrammateurFormOptimized.js"
echo "   2. Supprimer useProgrammateurFormOptimized.js"  
echo "   3. Mettre à jour les imports dans:"
echo "      - src/components/exemples/ProgrammateurFormExemple.js"
echo "      - src/components/programmateurs/desktop/ProgrammateurForm.js"
echo "   4. Mettre à jour l'export dans l'index"
echo "   5. Tester la compilation"
echo ""
read -p "Voulez-vous continuer avec cette migration? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Migration annulée par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début de la migration..."

# Étape 1: Remplacer le contenu du fichier final par la version optimized
echo "1️⃣ Remplacement de useProgrammateurForm.js par la version optimized..."
cp "$OPTIMIZED_FILE" "$TARGET_FILE"

# Étape 2: Mettre à jour les imports dans les composants
echo "2️⃣ Mise à jour des imports dans les composants..."

# ProgrammateurFormExemple.js
EXEMPLE_FILE="src/components/exemples/ProgrammateurFormExemple.js"
if [ -f "$EXEMPLE_FILE" ]; then
    sed -i '' 's/useProgrammateurFormOptimized/useProgrammateurForm/g' "$EXEMPLE_FILE"
    echo "   ✅ $EXEMPLE_FILE mis à jour"
else
    echo "   ⚠️  $EXEMPLE_FILE non trouvé"
fi

# ProgrammateurForm.js  
FORM_FILE="src/components/programmateurs/desktop/ProgrammateurForm.js"
if [ -f "$FORM_FILE" ]; then
    sed -i '' 's/useProgrammateurFormOptimized/useProgrammateurForm/g' "$FORM_FILE"
    echo "   ✅ $FORM_FILE mis à jour"
else
    echo "   ⚠️  $FORM_FILE non trouvé"
fi

# Étape 3: Mettre à jour l'export dans l'index
echo "3️⃣ Mise à jour de l'export dans l'index..."
INDEX_FILE="src/hooks/programmateurs/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer la ligne d'export de useProgrammateurFormOptimized
    sed -i '' '/useProgrammateurFormOptimized/d' "$INDEX_FILE"
    echo "   ✅ Export useProgrammateurFormOptimized supprimé de l'index"
else
    echo "   ⚠️  $INDEX_FILE non trouvé"
fi

# Étape 4: Supprimer les fichiers obsolètes
echo "4️⃣ Suppression des fichiers obsolètes..."
rm -f "$OPTIMIZED_FILE"
echo "   ✅ $OPTIMIZED_FILE supprimé"

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
echo "   ✅ useProgrammateurFormOptimized fusionné dans useProgrammateurForm"
echo "   ✅ 1 fichier obsolète supprimé"  
echo "   ✅ 2 composants mis à jour"
echo "   ✅ Export dans l'index nettoyé"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Migration: useProgrammateurForm - Consolidation version optimized'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Migration: useProgrammateurForm - Consolidation version optimized

- useProgrammateurFormOptimized → useProgrammateurForm (version finale)
- Mise à jour de 2 composants utilisant ce hook
- Suppression de useProgrammateurFormOptimized.js obsolète
- Nettoyage de l'export dans l'index
- Hook de formulaire programmateurs maintenant unifié

Hooks migrés: 12/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape suggérée: Audit et migration de useArtisteDetails" 