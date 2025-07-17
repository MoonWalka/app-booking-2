#!/bin/bash

# Script pour nettoyer les scripts obsolètes à la racine
# Date: 16 juillet 2025

echo "🧹 Nettoyage des scripts à la racine du projet..."

# Création du dossier d'archive
ARCHIVE_DIR="scripts/_archive_2025-07-16/root-scripts"
mkdir -p "$ARCHIVE_DIR"

# Scripts de configuration à GARDER
echo "✅ Conservation des fichiers de configuration :"
echo "   - craco.config.js (configuration build)"
echo "   - jest.config.js (configuration tests)"
echo "   - jest.setup.js (setup tests)"
echo ""

# Scripts à archiver
echo "📦 Archivage des scripts obsolètes..."

# 1. Scripts de migration Concert → Date (terminée)
echo "  → Migration Concert → Date..."
mv migrate-concert*.sh "$ARCHIVE_DIR/" 2>/dev/null
mv migrate_concerts_to_dates.sh "$ARCHIVE_DIR/" 2>/dev/null
mv migrate-imports.sh "$ARCHIVE_DIR/" 2>/dev/null
mv migrate-variables.sh "$ARCHIVE_DIR/" 2>/dev/null

# 2. Scripts d'audit Concert (terminés)
echo "  → Audits Concert..."
mv analyze-concert-patterns.sh "$ARCHIVE_DIR/" 2>/dev/null
mv audit-concert-*.sh "$ARCHIVE_DIR/" 2>/dev/null

# 3. Scripts de fix (déjà appliqués)
echo "  → Scripts de fix..."
mv fix-date-errors.sh "$ARCHIVE_DIR/" 2>/dev/null
mv fix_date_errors.sh "$ARCHIVE_DIR/" 2>/dev/null

# 4. Scripts de remplacement Organisation → Entreprise (terminé)
echo "  → Migration Organisation → Entreprise..."
mv replace-all-organizationId.sh "$ARCHIVE_DIR/" 2>/dev/null
mv replace-organizationId-to-entrepriseId.sh "$ARCHIVE_DIR/" 2>/dev/null

# 5. Scripts de debug et test
echo "  → Scripts de debug/test..."
mv debug-contacts.js "$ARCHIVE_DIR/" 2>/dev/null
mv create_test_date.js "$ARCHIVE_DIR/" 2>/dev/null

# 6. Scripts de nettoyage
echo "  → Scripts utilitaires..."
mv clean_project.sh "$ARCHIVE_DIR/" 2>/dev/null
mv clear_ide_cache.sh "$ARCHIVE_DIR/" 2>/dev/null

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "📊 Fichiers restants à la racine :"
ls -1 *.sh *.js 2>/dev/null | sort
echo ""
echo "📁 Scripts archivés dans : $ARCHIVE_DIR"