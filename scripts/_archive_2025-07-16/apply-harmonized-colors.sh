#!/bin/bash

# Script d'application de la palette harmonieuse TourCraft
# Créé le 31 Mai 2025 - Basé sur #213547
# OBJECTIF: Remplacer colors.css par la nouvelle palette harmonieuse

set -e

echo "🎨 Application de la palette harmonieuse TourCraft basée sur #213547"
echo "=================================================="

# Vérification de l'existence des fichiers
if [ ! -f "src/styles/base/colors.css" ]; then
    echo "❌ Erreur: colors.css non trouvé"
    exit 1
fi

if [ ! -f "src/styles/base/colors-harmonized.css" ]; then
    echo "❌ Erreur: colors-harmonized.css non trouvé"
    exit 1
fi

# Sauvegarde de l'ancien fichier
echo "📦 Sauvegarde de l'ancien colors.css..."
cp "src/styles/base/colors.css" "src/styles/base/colors-original-backup-$(date +%Y%m%d-%H%M%S).css"

# Remplacement par la nouvelle palette
echo "✨ Application de la nouvelle palette harmonieuse..."
cp "src/styles/base/colors-harmonized.css" "src/styles/base/colors.css"

echo "✅ Palette harmonieuse appliquée avec succès!"
echo ""
echo "🎯 RÉSUMÉ DES AMÉLIORATIONS:"
echo "• Toutes les couleurs harmonisées avec #213547"
echo "• Conservation de la saturation et luminosité relative (36%)"
echo "• Couleurs de statut cohérentes:"
echo "  - Success: Vert harmonisé (HSL 142°, 36%, 45%)"
echo "  - Warning: Orange harmonisé (HSL 35°, 36%, 45%)"
echo "  - Error: Rouge harmonisé (HSL 0°, 36%, 45%)"
echo "  - Info: Bleu harmonisé (HSL 202°, 45%, 45%)"
echo "• Palette de gris teintée avec la couleur principale"
echo "• Contraste WCAG AA maintenu"
echo "• Mode sombre harmonisé inclus"
echo ""
echo "🔄 Pour revenir en arrière:"
echo "cp src/styles/base/colors-original-backup-*.css src/styles/base/colors.css"
echo ""
echo "🚀 Redémarrez le serveur de développement pour voir les changements!"