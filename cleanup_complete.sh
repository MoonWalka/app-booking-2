#!/bin/bash

echo "🧹 Script de nettoyage complet pour le projet app-booking-2 🧹"
echo "Suppression de tous les fichiers créés après le commit befa74292ab425c80d143ab4271769efd47288c5"

# Suppression des fichiers de scripts de correction CSS
rm -f auto_fix_css.sh
rm -f detect_css_errors.sh
rm -f fix-css.sh
rm -f fix-css.sh.bak
rm -f fix_all_css_syntax.sh
rm -f fix_css_errors.sh
rm -f fix_css_files.sh
rm -f fix_css_js_complete.sh
rm -f fix_css_macos.sh
rm -f fix_css_macos_fixed.sh
rm -f fix_empty_css_rules.sh
rm -f fix_specific_css_errors.sh
rm -f generate_clean_css_auto.sh
rm -f replace_css_with_corrections.sh

# Suppression des fichiers d'audit
rm -f bootstrap_audit.txt

# Suppression des répertoires de sauvegarde CSS
rm -rf css_audit_results
rm -rf css_backup_*
rm -rf css_backups
rm -rf css_corrected_*
rm -rf css_fixes_backups
rm -rf css_js_backup_*

# Suppression des fichiers de sauvegarde
rm -f public/index.html.backup
rm -f src/styles/base/colors.css.final_backup
rm -f src/styles/base/variables.css.bak_*

# Suppression des fichiers avec double apostrophes
find . -name "*''" -type f -delete

# Suppression des fichiers potentiellement générés qui ne sont pas trackés par git
echo "Suppression de tous les fichiers non trackés par git (en excluant node_modules et .env)..."
git clean -f -d -x -e node_modules -e .env

echo "✅ Nettoyage terminé!"
