#!/bin/bash

# Script pour nettoyer les scripts obsolètes
# Date: 16 juillet 2025

echo "🧹 Nettoyage des scripts obsolètes..."

# Création d'un dossier archive au cas où
ARCHIVE_DIR="scripts/_archive_2025-07-16"
mkdir -p "$ARCHIVE_DIR"

# 1. Scripts de migration CSS
echo "📦 Archivage des scripts de migration CSS..."
mv scripts/migrate-css-*.sh "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/apply-harmonized-colors.sh "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/inline_to_typography_classes.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/fix_css_syntax_errors.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/css_audit_complete.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/cleanup_after_css_fixes.js "$ARCHIVE_DIR/" 2>/dev/null

# 2. Scripts de migration Concert → Date
echo "📦 Archivage des scripts de migration Concert → Date..."
mv scripts/firebase-migrate-concerts-to-dates.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-concert-to-date-final.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/fix-concert-data.js "$ARCHIVE_DIR/" 2>/dev/null

# 3. Scripts de migration Programmateur → Contact
echo "📦 Archivage des scripts de migration Programmateur → Contact..."
mv scripts/migrate-programmateur-to-contact.sh "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/cleanup-programmateur-critical.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/final-programmateur-audit.js "$ARCHIVE_DIR/" 2>/dev/null

# 4. Scripts de migration Organisation → Entreprise
echo "📦 Archivage des scripts de migration Organisation → Entreprise..."
mv scripts/add-organization-ids.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-organization-ids.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-organizationid-*.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/fix-organizationid-console.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/fix-missing-organizationids.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-missing-organizationid.js "$ARCHIVE_DIR/" 2>/dev/null

# 5. Scripts de migration de structures
echo "📦 Archivage des scripts de migration de structures..."
mv scripts/fix-structures-*.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/fix-nested-contacts*.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/cleanup-personne-libre.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/fix-personne-libre-status.js "$ARCHIVE_DIR/" 2>/dev/null

# 6. Autres migrations terminées
echo "📦 Archivage des autres scripts de migration..."
mv scripts/migrate-contract-statuses.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-contract-templates.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-comments-format.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-rib-to-entreprise.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-all-rib-data.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migration-add-numeroIntracommunautaire.js "$ARCHIVE_DIR/" 2>/dev/null

# 7. Scripts d'audit
echo "📦 Archivage des scripts d'audit obsolètes..."
# On garde audit_card_usage.js car il est utilisé dans package.json
mv scripts/audit-contacts-display.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/audit-liaisons.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/audit-organization-data-separation.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/audit-relational-contacts-system.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/audit-styles-app.sh "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/audit-ui-doublons.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/audit.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/audit_css_*.js "$ARCHIVE_DIR/" 2>/dev/null

# 8. Scripts de diagnostic
echo "📦 Archivage des scripts de diagnostic..."
mv scripts/diagnostic-*.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/diagnose-*.js "$ARCHIVE_DIR/" 2>/dev/null

# 9. Scripts de fix
echo "📦 Archivage des scripts de fix..."
mv scripts/fix-*.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/fix_*.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/clean_debug_logs.js "$ARCHIVE_DIR/" 2>/dev/null

# 10. Scripts de cleanup
echo "📦 Archivage des scripts de cleanup..."
mv scripts/cleanup-*.sh "$ARCHIVE_DIR/" 2>/dev/null

# 11. Scripts de test temporaires
echo "📦 Archivage des scripts de test temporaires..."
mv scripts/test-harmonized-palette.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/test-migration.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/create-test-user.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/generated-runtime-tests.js "$ARCHIVE_DIR/" 2>/dev/null

# 12. Scripts obsolètes divers
echo "📦 Archivage des scripts obsolètes divers..."
mv scripts/convert-relative-imports.sh "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/generate-migration-mapping.sh "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/show-all-contacts-raw.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/rollback-contact-migration.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/batch-migrate-lists.sh "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/apply-migration.sh "$ARCHIVE_DIR/" 2>/dev/null

# 13. Scripts de hook migration
echo "📦 Archivage des scripts de migration de hooks..."
mv scripts/migrate_hooks_to_wrappers.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/monitor_hooks_migration.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/detect_deprecated_hooks*.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/detect_hooks_simple.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/standardize_*.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/fix_*.js "$ARCHIVE_DIR/" 2>/dev/null

# 14. Déplacer les dossiers archivés
echo "📦 Déplacement des dossiers archivés..."
mv scripts/archived-migration-v2 "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/archived-root-scripts "$ARCHIVE_DIR/" 2>/dev/null

echo "✅ Nettoyage terminé !"
echo "📁 Les scripts ont été archivés dans : $ARCHIVE_DIR"
echo ""
echo "Pour supprimer définitivement l'archive :"
echo "rm -rf $ARCHIVE_DIR"