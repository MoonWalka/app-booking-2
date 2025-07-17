#!/bin/bash

# Script pour nettoyer les 24 scripts obsolètes restants
# Date: 16 juillet 2025

echo "🧹 Nettoyage des 24 scripts obsolètes restants..."

ARCHIVE_DIR="scripts/_archive_2025-07-16"

# 1. Scripts de problèmes déjà résolus
echo "📦 Archivage des scripts de problèmes résolus..."
mv scripts/analyze-contract-content-problem.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-contact-email.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-missing-contacts.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-recent-contact-changes.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/find-recently-unlinked-contacts.js "$ARCHIVE_DIR/" 2>/dev/null

# 2. Scripts de migration terminées
echo "📦 Archivage des scripts de migration terminées..."
mv scripts/migrate-contact-to-contacts.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-lists-to-generic.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-nested-data-secure.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/migrate-searches-to-new-collection.js "$ARCHIVE_DIR/" 2>/dev/null

# 3. Scripts d'audit ponctuels
echo "📦 Archivage des scripts d'audit ponctuels..."
mv scripts/audit-boutons-ajout.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/audit-consolidation.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-contract-statuses.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-nested-structures.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-structure-migration-status.js "$ARCHIVE_DIR/" 2>/dev/null

# 4. Scripts de vérification Firebase ponctuels
echo "📦 Archivage des scripts Firebase ponctuels..."
mv scripts/check-contacts-lieux-organizationid.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/check-lieu-contact-relation.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/ultimate-firebase-audit.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/scan_firestore_rest.js "$ARCHIVE_DIR/" 2>/dev/null

# 5. Scripts anciens peu utilisés
echo "📦 Archivage des scripts anciens..."
mv scripts/identify_non_migrated_hooks.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/prioritize_components.js "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/update-file-contents.sh "$ARCHIVE_DIR/" 2>/dev/null
mv scripts/validate-card-migration.sh "$ARCHIVE_DIR/" 2>/dev/null

# Déplacer l'analyse dans l'archive
mv ANALYSE_SCRIPTS_RESTANTS.md "$ARCHIVE_DIR/" 2>/dev/null

echo "✅ Nettoyage terminé !"
echo ""
echo "📊 Scripts restants :"
ls scripts/*.js scripts/*.sh 2>/dev/null | wc -l
echo ""
echo "Scripts conservés :"
ls -1 scripts/*.js scripts/*.sh 2>/dev/null | sort