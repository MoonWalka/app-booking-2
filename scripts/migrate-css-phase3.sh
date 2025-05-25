#!/bin/bash

# 🔄 MIGRATION CSS PHASE 3 - TOURCRAFT
# Migre les variables d'espacement restantes et autres variables importantes
# Usage: ./scripts/migrate-css-phase3.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 3${NC}"
echo "========================"
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 3 - $(date)"
    echo "✅ Sauvegarde git créée"
}

# Fonction de migration sécurisée
migrate_variable_safe() {
    local old_var=$1
    local new_var=$2
    local description=$3
    
    echo -e "${BLUE}🔄 Migration: $old_var → $new_var${NC}"
    echo "   Description: $description"
    
    # Compter les occurrences avant
    local count_before=$(grep -r "var($old_var)" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count_before" -eq 0 ]; then
        echo "   ⚠️  Variable non trouvée, ignorée"
        return
    fi
    
    echo "   📊 $count_before occurrences trouvées"
    
    # Utiliser perl pour le remplacement
    find src/ -name "*.css" -type f -exec perl -pi -e "s/var\\($old_var\\)/var($new_var)/g" {} \;
    
    # Vérifier le résultat
    local count_after=$(grep -r "var($old_var)" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    local count_new=$(grep -r "var($new_var)" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    
    echo "   ✅ Migration terminée: $count_after restantes, $count_new nouvelles"
    echo
}

# Créer une sauvegarde avant de commencer
create_git_backup

echo -e "${BLUE}📦 PHASE 3A: ESPACEMENTS RESTANTS${NC}"
echo "================================="
echo

# Variables d'espacement restantes
migrate_variable_safe "--tc-spacing-0" "--tc-space-0" "Espacement zéro"
migrate_variable_safe "--tc-spacing-1" "--tc-space-1" "Espacement 1"
migrate_variable_safe "--tc-spacing-2" "--tc-space-2" "Espacement 2"
migrate_variable_safe "--tc-spacing-3" "--tc-space-3" "Espacement 3"
migrate_variable_safe "--tc-spacing-4" "--tc-space-4" "Espacement 4"
migrate_variable_safe "--tc-spacing-6" "--tc-space-6" "Espacement 6"
migrate_variable_safe "--tc-spacing-8" "--tc-space-8" "Espacement 8"
migrate_variable_safe "--tc-spacing-12" "--tc-space-12" "Espacement 12"
migrate_variable_safe "--tc-spacing-16" "--tc-space-16" "Espacement 16"
migrate_variable_safe "--tc-spacing-24" "--tc-space-24" "Espacement 24"
migrate_variable_safe "--tc-spacing-xl" "--tc-space-8" "Espacement extra large"
migrate_variable_safe "--tc-spacing-unit" "--tc-space-4" "Unité d'espacement"

echo -e "${BLUE}📦 PHASE 3B: COULEURS SECONDAIRES${NC}"
echo "================================="
echo

# Variables de couleurs secondaires
migrate_variable_safe "--tc-text-color-secondary" "--tc-text-secondary" "Couleur de texte secondaire"
migrate_variable_safe "--tc-text-color-muted" "--tc-text-muted" "Couleur de texte atténuée"
migrate_variable_safe "--tc-text-color-primary" "--tc-text-primary" "Couleur de texte primaire"
migrate_variable_safe "--tc-text-muted" "--tc-text-muted" "Texte atténué (déjà correct)"
migrate_variable_safe "--tc-text-secondary" "--tc-text-secondary" "Texte secondaire (déjà correct)"

echo -e "${BLUE}📦 PHASE 3C: VARIABLES RGB ET SPÉCIALES${NC}"
echo "======================================="
echo

# Variables RGB (à supprimer ou remplacer)
migrate_variable_safe "--tc-primary-color-rgb" "--tc-color-primary-rgb" "RGB couleur primaire"
migrate_variable_safe "--tc-secondary-color-rgb" "--tc-color-secondary-rgb" "RGB couleur secondaire"

echo -e "${BLUE}📦 PHASE 3D: VARIABLES DE LAYOUT${NC}"
echo "==============================="
echo

# Variables de layout
migrate_variable_safe "--tc-z-index-dropdown" "--tc-z-index-dropdown" "Z-index dropdown (déjà correct)"
migrate_variable_safe "--tc-z-index-modal" "--tc-z-index-modal" "Z-index modal (déjà correct)"
migrate_variable_safe "--tc-z-index-tooltip" "--tc-z-index-tooltip" "Z-index tooltip (déjà correct)"
migrate_variable_safe "--tc-header-height" "--tc-header-height" "Hauteur header (déjà correct)"
migrate_variable_safe "--tc-sidebar-width" "--tc-sidebar-width" "Largeur sidebar (déjà correct)"

echo -e "${BLUE}📦 PHASE 3E: VARIABLES DE POIDS DE POLICE${NC}"
echo "========================================="
echo

# Variables de poids de police
migrate_variable_safe "--tc-font-weight-normal" "--tc-font-weight-normal" "Poids normal (déjà correct)"
migrate_variable_safe "--tc-font-weight-medium" "--tc-font-weight-medium" "Poids medium (déjà correct)"
migrate_variable_safe "--tc-font-weight-semibold" "--tc-font-weight-semibold" "Poids semibold (déjà correct)"
migrate_variable_safe "--tc-font-weight-bold" "--tc-font-weight-bold" "Poids bold (déjà correct)"

echo -e "${BLUE}📦 PHASE 3F: VARIABLES DIVERSES${NC}"
echo "==============================="
echo

# Variables diverses importantes
migrate_variable_safe "--tc-hover-bg" "--tc-bg-hover" "Fond au survol"
migrate_variable_safe "--tc-active-bg" "--tc-bg-hover" "Fond actif"
migrate_variable_safe "--tc-border-light" "--tc-border-light" "Bordure claire (déjà correct)"
migrate_variable_safe "--tc-border-medium" "--tc-border-default" "Bordure moyenne"
migrate_variable_safe "--tc-border-dark" "--tc-border-default" "Bordure foncée"

# Rapport final
echo -e "${PURPLE}📊 RAPPORT PHASE 3${NC}"
echo "=================="

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | grep -E "(spacing-[0-9]|text-color-|primary-color-rgb|hover-bg|active-bg)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -lt 50 ]; then
    echo -e "${GREEN}✅ Migration Phase 3 très réussie !${NC}"
elif [ "$old_pattern_vars" -lt 200 ]; then
    echo -e "${YELLOW}⚠️  Migration Phase 3 partiellement réussie${NC}"
else
    echo -e "${RED}❌ Migration Phase 3 nécessite plus de travail${NC}"
fi

echo
echo -e "${GREEN}✅ Phase 3 terminée${NC}"
echo "💡 Testez maintenant l'application - elle devrait être beaucoup mieux !" 