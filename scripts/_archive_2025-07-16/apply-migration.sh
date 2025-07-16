#!/bin/bash

# 🔄 APPLICATION DE LA MIGRATION CSS - TOURCRAFT
# Applique automatiquement le mapping de migration
# Usage: ./scripts/apply-migration.sh

set -e

echo "🔄 APPLICATION DE LA MIGRATION CSS"
echo "=================================="

MAPPING_FILE="audit/migration_mapping.txt"
BACKUP_DIR="backup/css/pre-migration"

# Créer une sauvegarde avant migration
echo "📦 Création de la sauvegarde..."
mkdir -p $BACKUP_DIR
cp -r src/styles/ $BACKUP_DIR/

echo "🔄 Application des remplacements..."

# Appliquer les remplacements (exemple pour les plus critiques)
echo "  - Couleurs primaires..."
find src/ -name "*.css" -exec sed -i 's/--tc-primary-color/--tc-color-primary/g' {} \;
find src/ -name "*.css" -exec sed -i 's/--tc-color-primary/--tc-color-primary/g' {} \;

echo "  - Arrière-plans..."
find src/ -name "*.css" -exec sed -i 's/--tc-bg-color/--tc-bg-default/g' {} \;
find src/ -name "*.css" -exec sed -i 's/--tc-background-color/--tc-bg-default/g' {} \;

echo "  - Texte..."
find src/ -name "*.css" -exec sed -i 's/--tc-text-color/--tc-text-default/g' {} \;

echo "✅ Migration appliquée avec succès!"
echo "📦 Sauvegarde disponible dans: $BACKUP_DIR"

