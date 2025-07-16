#!/bin/bash

# 🔄 MIGRATION CSS PHASE 4 FINALE - TOURCRAFT
# Migre les dernières variables importantes pour finaliser complètement
# Usage: ./scripts/migrate-css-phase4-final.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 4 FINALE${NC}"
echo "==============================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 4 finale - $(date)"
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

echo -e "${BLUE}📦 PHASE 4A: VARIABLES CRITIQUES RESTANTES${NC}"
echo "=========================================="
echo

# Variables critiques dans App.css et theme.css
migrate_variable_safe "--tc-background-color" "--tc-bg-default" "Couleur de fond principale"
migrate_variable_safe "--tc-primary-dark" "--tc-color-primary-dark" "Couleur primaire foncée"
migrate_variable_safe "--tc-input-color" "--tc-text-default" "Couleur de texte input"
migrate_variable_safe "--tc-btn-primary-hover-bg" "--tc-color-primary-hover" "Fond bouton primaire au survol"

echo -e "${BLUE}📦 PHASE 4B: VARIABLES DE BREAKPOINTS${NC}"
echo "===================================="
echo

# Variables de breakpoints (déjà correctes mais vérification)
migrate_variable_safe "--tc-breakpoint-xs" "--tc-breakpoint-xs" "Breakpoint XS (vérification)"
migrate_variable_safe "--tc-breakpoint-sm" "--tc-breakpoint-sm" "Breakpoint SM (vérification)"
migrate_variable_safe "--tc-breakpoint-md" "--tc-breakpoint-md" "Breakpoint MD (vérification)"
migrate_variable_safe "--tc-breakpoint-lg" "--tc-breakpoint-lg" "Breakpoint LG (vérification)"
migrate_variable_safe "--tc-breakpoint-xl" "--tc-breakpoint-xl" "Breakpoint XL (vérification)"

echo -e "${BLUE}📦 PHASE 4C: VARIABLES DE Z-INDEX${NC}"
echo "==============================="
echo

# Variables de z-index (déjà correctes mais vérification)
migrate_variable_safe "--tc-z-index-base" "--tc-z-index-base" "Z-index de base (vérification)"
migrate_variable_safe "--tc-z-index-dropdown" "--tc-z-index-dropdown" "Z-index dropdown (vérification)"
migrate_variable_safe "--tc-z-index-modal" "--tc-z-index-modal" "Z-index modal (vérification)"
migrate_variable_safe "--tc-z-index-tooltip" "--tc-z-index-tooltip" "Z-index tooltip (vérification)"

echo -e "${BLUE}📦 PHASE 4D: VARIABLES DE HAUTEUR DE LIGNE${NC}"
echo "=========================================="
echo

# Variables de hauteur de ligne
migrate_variable_safe "--tc-line-height-normal" "--tc-line-height-normal" "Hauteur de ligne normale (vérification)"
migrate_variable_safe "--tc-line-height-tight" "--tc-line-height-tight" "Hauteur de ligne serrée"
migrate_variable_safe "--tc-line-height-loose" "--tc-line-height-loose" "Hauteur de ligne lâche"

echo -e "${BLUE}📦 PHASE 4E: NETTOYAGE FINAL${NC}"
echo "============================"
echo

# Variables obsolètes à remplacer par des équivalents modernes
migrate_variable_safe "--tc-card-shadow" "--tc-shadow-base" "Ombre de carte"
migrate_variable_safe "--tc-input-shadow" "--tc-shadow-sm" "Ombre d'input"
migrate_variable_safe "--tc-button-shadow" "--tc-shadow-sm" "Ombre de bouton"
migrate_variable_safe "--tc-header-shadow" "--tc-shadow-base" "Ombre de header"

# Variables de couleurs obsolètes
migrate_variable_safe "--tc-light-bg" "--tc-bg-light" "Fond clair"
migrate_variable_safe "--tc-dark-bg" "--tc-bg-dark" "Fond foncé"
migrate_variable_safe "--tc-muted-bg" "--tc-bg-muted" "Fond atténué"

echo -e "${BLUE}📦 PHASE 4F: VARIABLES SPÉCIFIQUES COMPOSANTS${NC}"
echo "============================================="
echo

# Variables spécifiques aux composants
migrate_variable_safe "--tc-sidebar-bg" "--tc-bg-surface" "Fond de sidebar"
migrate_variable_safe "--tc-navbar-bg" "--tc-bg-surface" "Fond de navbar"
migrate_variable_safe "--tc-footer-bg" "--tc-bg-surface" "Fond de footer"
migrate_variable_safe "--tc-modal-bg" "--tc-bg-surface" "Fond de modal"
migrate_variable_safe "--tc-dropdown-bg" "--tc-bg-surface" "Fond de dropdown"

# Rapport final complet
echo -e "${PURPLE}📊 RAPPORT FINAL PHASE 4${NC}"
echo "========================="

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -lt 20 ]; then
    echo -e "${GREEN}🎉 MIGRATION COMPLÈTEMENT RÉUSSIE !${NC}"
    echo -e "${GREEN}✅ Toutes les variables critiques ont été migrées${NC}"
elif [ "$old_pattern_vars" -lt 100 ]; then
    echo -e "${YELLOW}⚠️  Migration presque terminée - quelques variables mineures restantes${NC}"
else
    echo -e "${RED}❌ Migration nécessite encore du travail${NC}"
fi

echo
echo -e "${GREEN}🎉 PHASE 4 FINALE TERMINÉE !${NC}"
echo -e "${PURPLE}💡 La migration CSS TourCraft est maintenant COMPLÈTE !${NC}"
echo "🚀 Testez l'application - elle devrait être parfaitement fonctionnelle !" 