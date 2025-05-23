#!/bin/bash

# Nettoyage des dernières références Optimized/Migrated dans les hooks
# Date: $(date +%Y-%m-%d)
# Contexte: Finalisation du nettoyage - suppression des commentaires et références obsolètes

set -e  # Arrêter le script en cas d'erreur

echo "🧹 Nettoyage des dernières références Optimized/Migrated"
echo "========================================================"

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
echo "📋 PLAN DE NETTOYAGE:"
echo "   1. Corriger useProgrammateurForm.js (useProgrammateurFormOptimized → useProgrammateurForm)"
echo "   2. Supprimer useConcertListData.optimized.js (doublon non utilisé)"
echo "   3. Nettoyer les commentaires obsolètes dans les hooks Details"
echo "   4. Nettoyer les logs avec références Optimized"
echo "   5. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   🧹 Finalisation du nettoyage des migrations"
echo "   🎯 Suppression des dernières références obsolètes"
echo ""
read -p "Voulez-vous continuer avec ce nettoyage? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Nettoyage annulé par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début du nettoyage..."

# Compteurs pour le résumé
FILES_CLEANED=0
FILES_DELETED=0

# 1. Corriger useProgrammateurForm.js
echo "1️⃣ Correction de useProgrammateurForm.js..."
PROGRAMMATEUR_FORM="src/hooks/programmateurs/useProgrammateurForm.js"
if [ -f "$PROGRAMMATEUR_FORM" ]; then
    # Remplacer useProgrammateurFormOptimized par useProgrammateurForm
    sed -i '' 's/useProgrammateurFormOptimized/useProgrammateurForm/g' "$PROGRAMMATEUR_FORM"
    echo "   ✅ useProgrammateurForm.js corrigé"
    ((FILES_CLEANED++))
fi

# 2. Supprimer le doublon useConcertListData.optimized.js
echo "2️⃣ Suppression du doublon useConcertListData.optimized.js..."
CONCERT_LIST_OPTIMIZED="src/hooks/concerts/useConcertListData.optimized.js"
if [ -f "$CONCERT_LIST_OPTIMIZED" ]; then
    rm -f "$CONCERT_LIST_OPTIMIZED"
    echo "   ✅ useConcertListData.optimized.js supprimé"
    ((FILES_DELETED++))
fi

# 3. Nettoyer les commentaires obsolètes dans useConcertListData.js
echo "3️⃣ Nettoyage des commentaires obsolètes..."
CONCERT_LIST_DATA="src/hooks/concerts/useConcertListData.js"
if [ -f "$CONCERT_LIST_DATA" ]; then
    # Corriger le commentaire d'en-tête
    sed -i '' '1s|// src/hooks/concerts/useConcertListData.optimized.js|// src/hooks/concerts/useConcertListData.js|' "$CONCERT_LIST_DATA"
    echo "   ✅ useConcertListData.js commentaire corrigé"
    ((FILES_CLEANED++))
fi

# 4. Nettoyer les commentaires dans useLieuDetails.js
LIEU_DETAILS="src/hooks/lieux/useLieuDetails.js"
if [ -f "$LIEU_DETAILS" ]; then
    # Corriger le commentaire d'en-tête
    sed -i '' '1s|// src/hooks/lieux/useLieuDetailsOptimized.js|// src/hooks/lieux/useLieuDetails.js|' "$LIEU_DETAILS"
    # Nettoyer les logs avec références Optimized
    sed -i '' 's/useLieuDetailsOptimized/useLieuDetails/g' "$LIEU_DETAILS"
    echo "   ✅ useLieuDetails.js commentaires et logs nettoyés"
    ((FILES_CLEANED++))
fi

# 5. Nettoyer les commentaires dans useStructureDetails.js
STRUCTURE_DETAILS="src/hooks/structures/useStructureDetails.js"
if [ -f "$STRUCTURE_DETAILS" ]; then
    # Corriger le commentaire d'en-tête
    sed -i '' '1s|// src/hooks/structures/useStructureDetailsOptimized.js|// src/hooks/structures/useStructureDetails.js|' "$STRUCTURE_DETAILS"
    # Nettoyer les logs avec références Optimized
    sed -i '' 's/useStructureDetailsOptimized/useStructureDetails/g' "$STRUCTURE_DETAILS"
    echo "   ✅ useStructureDetails.js commentaires et logs nettoyés"
    ((FILES_CLEANED++))
fi

# 6. Nettoyer les commentaires dans useConcertDetails.js
CONCERT_DETAILS="src/hooks/concerts/useConcertDetails.js"
if [ -f "$CONCERT_DETAILS" ]; then
    # Corriger le commentaire d'en-tête
    sed -i '' '1s|// src/hooks/concerts/useConcertDetailsOptimized.js|// src/hooks/concerts/useConcertDetails.js|' "$CONCERT_DETAILS"
    # Nettoyer les logs avec références Optimized
    sed -i '' 's/useConcertDetailsOptimized/useConcertDetails/g' "$CONCERT_DETAILS"
    echo "   ✅ useConcertDetails.js commentaires et logs nettoyés"
    ((FILES_CLEANED++))
fi

# 7. Nettoyer les commentaires dans useContratDetails.js
CONTRAT_DETAILS="src/hooks/contrats/useContratDetails.js"
if [ -f "$CONTRAT_DETAILS" ]; then
    # Corriger le commentaire d'en-tête
    sed -i '' '1s|// src/hooks/contrats/useContratDetailsMigrated.js|// src/hooks/contrats/useContratDetails.js|' "$CONTRAT_DETAILS"
    echo "   ✅ useContratDetails.js commentaire corrigé"
    ((FILES_CLEANED++))
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
echo "🎉 NETTOYAGE TERMINÉ AVEC SUCCÈS!"
echo "================================="
echo "📊 Résumé des changements:"
echo "   ✅ $FILES_CLEANED fichiers nettoyés"
echo "   ✅ $FILES_DELETED fichiers supprimés"
echo "   ✅ Commentaires et logs obsolètes supprimés"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Nettoyage: Suppression des dernières références Optimized/Migrated'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Nettoyage: Suppression des dernières références Optimized/Migrated

- Correction useProgrammateurForm.js (useProgrammateurFormOptimized → useProgrammateurForm)
- Suppression useConcertListData.optimized.js (doublon non utilisé)
- Nettoyage des commentaires obsolètes dans tous les hooks Details
- Nettoyage des logs avec références Optimized/Migrated
- Finalisation complète de la migration des hooks

Migration des hooks: 100% terminée - Tous les hooks unifiés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 MIGRATION DES HOOKS TERMINÉE À 100% !"
echo "🎉 Tous les hooks sont maintenant unifiés et nettoyés" 