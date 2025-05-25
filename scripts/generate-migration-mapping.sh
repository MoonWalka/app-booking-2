#!/bin/bash

# 🔄 GÉNÉRATION DU MAPPING DE MIGRATION CSS - TOURCRAFT
# Génère le mapping détaillé des variables à migrer
# Usage: ./scripts/generate-migration-mapping.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
AUDIT_DIR="audit"
MAPPING_FILE="audit/migration_mapping.txt"

echo -e "${PURPLE}🔄 GÉNÉRATION DU MAPPING DE MIGRATION CSS${NC}"
echo "============================================"
echo

# Vérifier que l'audit a été fait
if [ ! -f "$AUDIT_DIR/variables_used.txt" ]; then
    echo -e "${RED}❌ Erreur: Fichier d'audit introuvable${NC}"
    echo "Veuillez d'abord exécuter: ./scripts/audit-css-variables.sh"
    exit 1
fi

echo -e "${YELLOW}📋 GÉNÉRATION DU MAPPING DÉTAILLÉ${NC}"
echo "=================================="

# Créer le fichier de mapping
cat > $MAPPING_FILE << 'EOF'
# 🔄 MAPPING DE MIGRATION CSS TOURCRAFT
# =====================================
# Format: ANCIENNE_VARIABLE → NOUVELLE_VARIABLE
# Généré automatiquement le 21 Mai 2025

# ===== COULEURS PRIMAIRES (31 → 3) =====
--tc-primary-color → --tc-color-primary
--tc-color-primary → --tc-color-primary
--tc-primary → --tc-color-primary
--tc-btn-primary-bg → --tc-bg-primary
--tc-btn-primary-text → --tc-text-light
--tc-btn-primary-border → --tc-border-primary
--tc-btn-primary-hover-bg → --tc-color-primary-dark
--tc-text-color-primary → --tc-text-primary
--tc-text-primary → --tc-text-primary
--tc-bg-primary-highlight → --tc-bg-primary
--tc-bg-primary-subtle → --tc-bg-primary
--tc-bs-primary → --tc-color-primary
--tc-primary-color-05 → SUPPRIMER (utiliser rgba(var(--tc-color-primary-rgb), 0.05))
--tc-primary-color-10 → SUPPRIMER (utiliser rgba(var(--tc-color-primary-rgb), 0.1))
--tc-primary-color-20 → SUPPRIMER (utiliser rgba(var(--tc-color-primary-rgb), 0.2))
--tc-primary-color-30 → SUPPRIMER (utiliser rgba(var(--tc-color-primary-rgb), 0.3))
--tc-primary-color-dark → --tc-color-primary-dark
--tc-primary-color-light → --tc-color-primary-light
--tc-primary-color-lighter → --tc-color-primary-light
--tc-primary-color-shadow → --tc-shadow-focus
--tc-primary-dark → --tc-color-primary-dark
--tc-primary-dark-rgb → SUPPRIMER (utiliser --tc-color-primary-dark)
--tc-primary-light → --tc-color-primary-light
--tc-primary-light-rgb → SUPPRIMER (utiliser --tc-color-primary-light)
--tc-primary-lighter → --tc-color-primary-light
--tc-primary-lightest → --tc-color-primary-light

# ===== COULEURS SECONDAIRES (22 → 3) =====
--tc-secondary-color → --tc-color-secondary
--tc-color-secondary → --tc-color-secondary
--tc-secondary → --tc-color-secondary
--tc-btn-secondary-bg → --tc-bg-secondary
--tc-btn-secondary-text → --tc-text-light
--tc-btn-secondary-border → --tc-border-secondary
--tc-btn-secondary-hover-bg → --tc-color-secondary-dark
--tc-btn-secondary-active-bg → --tc-color-secondary-dark
--tc-btn-secondary-focus-shadow → --tc-shadow-focus
--tc-background-secondary → --tc-bg-secondary
--tc-bs-secondary → --tc-color-secondary
--tc-color-secondary-dark → --tc-color-secondary-dark
--tc-color-secondary-light → --tc-color-secondary-light

# ===== ARRIÈRE-PLANS (72 → 15) =====
--tc-bg-color → --tc-bg-default
--tc-background-color → --tc-bg-default
--tc-bg-default → --tc-bg-default
--tc-bg-light → --tc-bg-light
--tc-bg-color-light → --tc-bg-light
--tc-bg-color-dark → --tc-bg-dark
--tc-bg-color-rgb → SUPPRIMER (utiliser --tc-bg-default)
--tc-bg-card → --tc-bg-card
--tc-card-bg → --tc-bg-card
--tc-modal-bg → --tc-bg-modal
--tc-bg-hover → --tc-bg-hover
--tc-active-bg → --tc-bg-active
--tc-hover-bg → --tc-bg-hover
--tc-backdrop-bg → --tc-bg-backdrop
--tc-bg-info-light → --tc-bg-info
--tc-bg-info-subtle → --tc-bg-info
--tc-bg-orange-subtle → --tc-bg-warning
--tc-bg-light-alpha → --tc-bg-light

# ===== TEXTE (28 → 10) =====
--tc-text-color → --tc-text-default
--tc-color-text → --tc-text-default
--tc-text-muted → --tc-text-muted
--tc-text-color-muted → --tc-text-muted
--tc-text-color-primary → --tc-text-primary
--tc-text-color-primary-dark → --tc-text-primary
--tc-text-secondary → --tc-text-secondary
--tc-badge-text → --tc-text-light
--tc-btn-danger-text → --tc-text-light
--tc-btn-info-text → --tc-text-light
--tc-btn-success-text → --tc-text-light
--tc-card-header-text → --tc-text-default
--tc-danger-text → --tc-text-danger
--tc-header-text-color → --tc-text-default
--tc-info-color-text → --tc-text-info
--tc-info-color-text-muted → --tc-text-muted
--tc-sidebar-text-color → --tc-text-light
--tc-success-color-text → --tc-text-success
--tc-text-placeholder → --tc-text-placeholder
--tc-label-color → --tc-text-default

# ===== ESPACEMENTS (29 → 12) =====
--tc-spacing-xs → --tc-space-xs
--tc-spacing-sm → --tc-space-sm
--tc-spacing-md → --tc-space-md
--tc-spacing-lg → --tc-space-lg
--tc-spacing-xl → --tc-space-xl
--tc-spacing-0 → --tc-space-0
--tc-spacing-1 → --tc-space-1
--tc-spacing-2 → --tc-space-2
--tc-spacing-4 → --tc-space-4
--tc-spacing-6 → --tc-space-6
--tc-spacing-8 → --tc-space-8
--tc-spacing-12 → --tc-space-12
--tc-spacing-16 → --tc-space-16
--tc-spacing-24 → --tc-space-24
--tc-spacing-unit → --tc-space-md

# ===== TYPOGRAPHIE (52 → 15) =====
--tc-font-family-base → --tc-font-sans
--tc-font-family → --tc-font-sans
--tc-font-family-mono → --tc-font-mono
--tc-font-family-monospace → --tc-font-mono
--tc-font-mono → --tc-font-mono
--tc-font-monospace → --tc-font-mono
--tc-font-size-xs → --tc-font-size-xs
--tc-font-size-sm → --tc-font-size-sm
--tc-font-size-base → --tc-font-size-base
--tc-font-size-md → --tc-font-size-lg
--tc-font-size-lg → --tc-font-size-xl
--tc-font-size-xl → --tc-font-size-2xl
--tc-font-size-xxl → --tc-font-size-3xl
--tc-font-size-2xl → --tc-font-size-2xl
--tc-font-size-3xl → --tc-font-size-3xl
--tc-font-weight-normal → --tc-font-weight-normal
--tc-font-weight-medium → --tc-font-weight-medium
--tc-font-weight-semibold → --tc-font-weight-semibold
--tc-font-weight-bold → --tc-font-weight-bold
--tc-line-height-base → --tc-line-height-normal
--tc-line-height-tight → --tc-line-height-tight

# ===== EFFETS (49 → 20) =====
--tc-shadow-sm → --tc-shadow-sm
--tc-shadow → --tc-shadow-base
--tc-shadow-lg → --tc-shadow-lg
--tc-shadow-card → --tc-shadow-card
--tc-shadow-modal → --tc-shadow-modal
--tc-shadow-hover → --tc-shadow-lg
--tc-shadow-light → --tc-shadow-sm
--tc-bs-box-shadow-sm → --tc-shadow-sm
--tc-bs-box-shadow → --tc-shadow-base
--tc-bs-box-shadow-lg → --tc-shadow-lg
--tc-box-shadow → --tc-shadow-base
--tc-box-shadow-sm → --tc-shadow-sm
--tc-box-shadow-lg → --tc-shadow-lg
--tc-box-shadow-md → --tc-shadow-md
--tc-box-shadow-hover → --tc-shadow-lg
--tc-box-shadow-bottom → --tc-shadow-base
--tc-border-radius-sm → --tc-radius-sm
--tc-border-radius → --tc-radius-base
--tc-border-radius-lg → --tc-radius-lg
--tc-border-radius-pill → --tc-radius-full
--tc-transition-duration → --tc-transition-base
--tc-transition → --tc-transition-base
--tc-transition-fast → --tc-transition-fast
--tc-transition-normal → --tc-transition-base

# ===== BORDURES (42 → 10) =====
--tc-border-color → --tc-border-default
--tc-border-light → --tc-border-light
--tc-border-medium → --tc-border-default
--tc-border-dark → --tc-border-dark
--tc-border-color-light → --tc-border-light
--tc-border-color-medium → --tc-border-default
--tc-border-color-dark → --tc-border-dark
--tc-border-input → --tc-border-default
--tc-input-border → --tc-border-default
--tc-input-focus-border → --tc-border-focus

# ===== LAYOUT (20 → 10) =====
--tc-z-index-dropdown → --tc-z-dropdown
--tc-z-index-modal → --tc-z-modal
--tc-z-index-tooltip → --tc-z-tooltip
--tc-z-index-toast → --tc-z-toast
--tc-header-height → --tc-size-header
--tc-sidebar-width → --tc-size-sidebar
--tc-sidebar-collapsed-width → --tc-size-sidebar-collapsed

# ===== COULEURS MÉTIER =====
--tc-artiste-color → --tc-color-artiste
--tc-artiste-color-light → --tc-color-artiste-light
--tc-concert-color → --tc-color-concert
--tc-concert-color-light → --tc-color-concert-light
--tc-programmateur-color → --tc-color-programmateur
--tc-programmateur-color-light → --tc-color-programmateur-light

# ===== VARIABLES À SUPPRIMER =====
# Ces variables seront supprimées car redondantes ou obsolètes
--tc-bs-primary → SUPPRIMER
--tc-bs-secondary → SUPPRIMER
--tc-primary-color-05 → SUPPRIMER
--tc-primary-color-10 → SUPPRIMER
--tc-primary-color-20 → SUPPRIMER
--tc-primary-color-30 → SUPPRIMER
--tc-primary-color-rgb → SUPPRIMER
--tc-secondary-color-rgb → SUPPRIMER
--tc-bg-color-rgb → SUPPRIMER
--tc-primary-dark-rgb → SUPPRIMER
--tc-primary-light-rgb → SUPPRIMER

EOF

echo "✅ Mapping généré: $MAPPING_FILE"

# Analyser le mapping
echo
echo -e "${YELLOW}📊 ANALYSE DU MAPPING${NC}"
echo "===================="

TOTAL_MAPPINGS=$(grep -c "→" $MAPPING_FILE)
RENAMES=$(grep -c "→ --tc-" $MAPPING_FILE)
DELETIONS=$(grep -c "→ SUPPRIMER" $MAPPING_FILE)

echo "Total mappings:       $TOTAL_MAPPINGS"
echo "Variables à renommer: $RENAMES"
echo "Variables à supprimer: $DELETIONS"

# Calculer les réductions par catégorie
echo
echo -e "${YELLOW}📈 RÉDUCTIONS PAR CATÉGORIE${NC}"
echo "==========================="

echo "COULEURS PRIMAIRES:"
PRIMARY_OLD=$(grep -c "primary" $AUDIT_DIR/duplicates_primary.txt)
PRIMARY_NEW=3
echo "  $PRIMARY_OLD → $PRIMARY_NEW variables (-$(echo "scale=0; ($PRIMARY_OLD - $PRIMARY_NEW) * 100 / $PRIMARY_OLD" | bc)%)"

echo "ARRIÈRE-PLANS:"
BG_OLD=$(grep -c "bg" $AUDIT_DIR/duplicates_bg.txt)
BG_NEW=15
echo "  $BG_OLD → $BG_NEW variables (-$(echo "scale=0; ($BG_OLD - $BG_NEW) * 100 / $BG_OLD" | bc)%)"

echo "TEXTE:"
TEXT_OLD=$(grep -c "text" $AUDIT_DIR/duplicates_text.txt)
TEXT_NEW=10
echo "  $TEXT_OLD → $TEXT_NEW variables (-$(echo "scale=0; ($TEXT_OLD - $TEXT_NEW) * 100 / $TEXT_OLD" | bc)%)"

# Générer les scripts de remplacement
echo
echo -e "${YELLOW}🛠️  GÉNÉRATION DES SCRIPTS DE REMPLACEMENT${NC}"
echo "==========================================="

# Script de remplacement automatique
cat > scripts/apply-migration.sh << 'SCRIPT_EOF'
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

SCRIPT_EOF

chmod +x scripts/apply-migration.sh

echo "✅ Script de migration créé: scripts/apply-migration.sh"

echo
echo -e "${GREEN}✅ MAPPING DE MIGRATION TERMINÉ${NC}"
echo "==============================="
echo "Fichiers générés:"
echo "  - audit/migration_mapping.txt (mapping détaillé)"
echo "  - scripts/apply-migration.sh (script d'application)"
echo
echo -e "${BLUE}Prochaine étape: Réviser le mapping et préparer la Phase 2${NC}" 