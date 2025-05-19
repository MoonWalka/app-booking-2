#!/bin/bash
# Script pour nettoyer les fichiers créés après le commit befa74292ab425c80d143ab4271769efd47288c5

# Création d'un dossier pour sauvegarder éventuellement certains fichiers
mkdir -p backup_before_clean

# 1. Suppression des dossiers de backup CSS
echo "Suppression des dossiers de backup CSS..."
rm -rf css_audit_results
rm -rf css_backup_*
rm -rf css_backups
rm -rf css_corrected_*
rm -rf css_fixes_backups
rm -rf css_js_backup_*

# 2. Suppression des scripts de correction CSS
echo "Suppression des scripts de correction CSS..."
rm -f auto_fix_css.sh
rm -f detect_css_errors.sh
rm -f fix_all_css_syntax.sh
rm -f fix_css_errors.sh
rm -f fix_css_files.sh
rm -f fix_css_js_complete.sh
rm -f fix_css_macos_fixed.sh
rm -f fix_css_macos.sh
rm -f fix_empty_css_rules.sh
rm -f fix-css.sh
rm -f fix-css.sh.bak
rm -f fix_specific_css_errors.sh
rm -f generate_clean_css_auto.sh
rm -f replace_css_with_corrections.sh

# 3. Suppression des fichiers texte d'audit
echo "Suppression des fichiers d'audit..."
rm -f bootstrap_audit.txt
rm -f components_without_css_analysis.txt
rm -f css_files_to_process.txt

# 4. Suppression des fichiers CSS avec double apostrophe
echo "Suppression des fichiers CSS avec double apostrophe..."
find . -name "*''" -type f -delete

echo "Nettoyage terminé !"
