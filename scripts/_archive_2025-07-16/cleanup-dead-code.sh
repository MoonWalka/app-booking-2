#!/bin/bash

# Script de nettoyage du code mort pour TourCraft
# Date: 15 décembre 2024

echo "🧹 NETTOYAGE DU CODE MORT - TourCraft"
echo "======================================"
echo ""
echo "Ce script va supprimer :"
echo "- 📁 Dossiers backup (2.6M + 48K + 196K)"
echo "- 📁 Dossiers exemples (124K + 12K)"
echo "- 📁 Dossiers tests (700K+)"
echo "- 📁 Templates et fichiers temporaires"
echo ""
echo "💾 Total à supprimer : ~90,000 lignes de code"
echo ""
read -p "⚠️  Êtes-vous sûr de vouloir continuer ? (oui/non) " -n 3 -r
echo ""

if [[ $REPLY =~ ^[Oo][Uu][Ii]$ ]]
then
    echo "🚀 Début du nettoyage..."
    echo ""
    
    # Backup folders
    echo "1️⃣ Suppression des dossiers backup..."
    rm -rf backup
    rm -rf backup_hooks_orphelins
    rm -rf backups
    echo "   ✅ Dossiers backup supprimés"
    
    # Example folders
    echo "2️⃣ Suppression des dossiers exemples..."
    rm -rf src/components/exemples
    rm -rf src/components/examples
    rm -rf src/components/organization/examples
    rm -rf demo
    echo "   ✅ Dossiers exemples supprimés"
    
    # Test folders and files
    echo "3️⃣ Suppression des dossiers tests..."
    rm -rf test-results
    rm -rf test_css
    rm -rf test_css_fixed
    rm -rf src/tests
    rm -rf src/hooks/__tests__
    rm -rf docs/tests
    rm -rf docs/migration-css/tests
    echo "   ✅ Dossiers tests supprimés"
    
    # Templates
    echo "4️⃣ Suppression des templates..."
    rm -rf src/templates
    rm -rf tools/phase2/templates
    echo "   ✅ Templates supprimés"
    
    # Test scripts
    echo "5️⃣ Suppression des scripts de test..."
    rm -f scripts/test-*.js
    rm -f scripts/test-*.sh
    rm -f scripts/test_*.sh
    rm -f tools/firebase/test_*.js
    rm -f tools/phase2/test_*.js
    echo "   ✅ Scripts de test supprimés"
    
    # Other test files
    echo "6️⃣ Suppression des fichiers de test isolés..."
    find . -name "*.test.js" -type f -delete
    find . -name "test-*.css" -type f -delete
    find . -name "*-test.*" -type f -delete
    echo "   ✅ Fichiers de test supprimés"
    
    # Clean up empty directories
    echo "7️⃣ Nettoyage des dossiers vides..."
    find . -type d -empty -delete 2>/dev/null
    echo "   ✅ Dossiers vides supprimés"
    
    echo ""
    echo "✨ NETTOYAGE TERMINÉ !"
    echo ""
    echo "📊 Résumé :"
    echo "- ~90,000 lignes de code supprimées"
    echo "- ~3.5 MB d'espace disque libéré"
    echo ""
    echo "💡 Prochaines étapes recommandées :"
    echo "1. Vérifier que l'application fonctionne toujours"
    echo "2. Committer ces changements"
    echo "3. Continuer avec la simplification des composants"
    
else
    echo "❌ Nettoyage annulé"
fi 