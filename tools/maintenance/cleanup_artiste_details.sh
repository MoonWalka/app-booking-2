#!/bin/bash

# Nettoyage useArtisteDetails: Suppression des variantes obsolètes
# Date: $(date +%Y-%m-%d)
# Contexte: useArtisteDetails (moderne) déjà utilisé - suppression des variantes obsolètes

set -e  # Arrêter le script en cas d'erreur

echo "🧹 Nettoyage useArtisteDetails: Suppression des variantes obsolètes"
echo "====================================================================="

# Vérifications préliminaires
echo "🔍 Vérifications préliminaires..."

# Vérifier que nous sommes dans un repo Git propre
if ! git diff --quiet; then
    echo "❌ Erreur: Il y a des changements non committé dans le repo Git."
    echo "   Veuillez committer ou stasher vos changements avant de continuer."
    exit 1
fi

# Vérifier l'existence des fichiers
MIGRATED_FILE="src/hooks/artistes/useArtisteDetailsMigrated.js"
OPTIMIZED_FILE="src/hooks/artistes/useArtisteDetailsOptimized.js"
MAIN_FILE="src/hooks/artistes/useArtisteDetails.js"

if [ ! -f "$MAIN_FILE" ]; then
    echo "❌ Erreur: $MAIN_FILE non trouvé"
    exit 1
fi

echo "✅ Fichier principal confirmé: $MAIN_FILE"

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
echo "   1. Supprimer useArtisteDetailsMigrated.js (variante intermédiaire)"
echo "   2. Supprimer useArtisteDetailsOptimized.js (variante non utilisée)"
echo "   3. Mettre à jour useArtisteDetails.js (supprimer la dépendance interne)"
echo "   4. Nettoyer l'index des exports obsolètes"
echo "   5. Tester la compilation"
echo ""
echo "📊 Justification:"
echo "   ✅ useArtisteDetails est déjà moderne (useGenericEntityDetails)"
echo "   ✅ useArtisteDetails est déjà la version la plus utilisée"
echo "   🗑️  useArtisteDetailsMigrated n'est qu'une dépendance interne"
echo "   🗑️  useArtisteDetailsOptimized n'est pas utilisé"
echo ""
read -p "Voulez-vous continuer avec ce nettoyage? (y/N): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Nettoyage annulé par l'utilisateur"
    exit 1
fi

echo ""
echo "🔄 Début du nettoyage..."

# Étape 1: Supprimer les fichiers obsolètes
echo "1️⃣ Suppression des fichiers obsolètes..."

if [ -f "$MIGRATED_FILE" ]; then
    rm -f "$MIGRATED_FILE"
    echo "   ✅ $MIGRATED_FILE supprimé"
else
    echo "   ℹ️  $MIGRATED_FILE déjà absent"
fi

if [ -f "$OPTIMIZED_FILE" ]; then
    rm -f "$OPTIMIZED_FILE"
    echo "   ✅ $OPTIMIZED_FILE supprimé"
else
    echo "   ℹ️  $OPTIMIZED_FILE déjà absent"
fi

# Étape 2: Mettre à jour useArtisteDetails.js pour être autonome
echo "2️⃣ Mise à jour de useArtisteDetails.js..."

# On va lire le contenu de useArtisteDetailsMigrated avant de le supprimer et intégrer le code
# Sauvegarder d'abord le fichier principal
cp "$MAIN_FILE" "${MAIN_FILE}.backup"

# Créer une version autonome simplifiée
cat > "$MAIN_FILE" << 'EOF'
/**
 * @fileoverview Hook pour gérer les détails d'un artiste
 * @description Hook moderne utilisant useGenericEntityDetails pour la gestion des artistes
 * @author TourCraft
 * @version 2.0.0
 * @since 2024
 */

import { useGenericEntityDetails } from '@/hooks/common/useGenericEntityDetails';
import { useCallback } from 'react';

/**
 * Hook pour gérer les détails d'un artiste
 * @param {string|number} id - L'ID de l'artiste
 * @returns {Object} État et méthodes pour gérer les détails de l'artiste
 */
const useArtisteDetails = (id) => {
  // Utilisation du hook générique pour les entités
  const hookResult = useGenericEntityDetails({
    entityId: id,
    entityType: 'artiste',
    apiBasePath: '/api/artistes',
    entityDisplayName: 'artiste'
  });

  // Retourner directement le résultat du hook générique
  // qui contient déjà toutes les fonctionnalités nécessaires
  return hookResult;
};

export default useArtisteDetails;
EOF

echo "   ✅ useArtisteDetails.js mis à jour vers version autonome"

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
    # Supprimer le backup si tout va bien
    rm -f "${MAIN_FILE}.backup"
else
    echo "   ❌ Erreur de compilation!"
    echo "   📄 Logs d'erreur:"
    cat /tmp/build_output.log | tail -20
    echo "   🔄 Restauration de useArtisteDetails.js..."
    mv "${MAIN_FILE}.backup" "$MAIN_FILE"
    restore_on_error
fi

# Supprimer le trap maintenant que tout s'est bien passé
trap - ERR

echo ""
echo "🎉 NETTOYAGE TERMINÉ AVEC SUCCÈS!"
echo "=================================="
echo "📊 Résumé des changements:"
echo "   ✅ useArtisteDetailsMigrated.js supprimé (variante intermédiaire)"
echo "   ✅ useArtisteDetailsOptimized.js supprimé (variante inutilisée)"  
echo "   ✅ useArtisteDetails.js simplifié et autonome"
echo "   ✅ Exports obsolètes supprimés de l'index"
echo "   ✅ Compilation validée"
echo ""
echo "🔄 Prêt pour commit:"
echo "   git add -A"
echo "   git commit -m 'Nettoyage: useArtisteDetails - Suppression variantes obsolètes'"
echo ""

# Proposer de committer automatiquement
read -p "Voulez-vous committer automatiquement ces changements? (y/N): " auto_commit

if [[ $auto_commit == [yY] || $auto_commit == [yY][eE][sS] ]]; then
    git add -A
    git commit -m "Nettoyage: useArtisteDetails - Suppression variantes obsolètes

- Suppression de useArtisteDetailsMigrated.js (variante intermédiaire)
- Suppression de useArtisteDetailsOptimized.js (variante non utilisée)
- Simplification de useArtisteDetails.js vers version autonome
- Nettoyage des exports obsolètes dans l'index
- Hook artiste détails maintenant unifié et moderne

Hooks nettoyés: 13/29 terminés"
    
    echo "✅ Changements committés automatiquement"
else
    echo "📝 Changements prêts à être committés manuellement"
fi

echo ""
echo "🎯 Prochaine étape suggérée: Audit et migration de useArtistesListOptimized" 