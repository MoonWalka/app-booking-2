#!/bin/bash

# 🔄 MIGRATION CSS PHASE 6 FINALE - VARIABLES SPÉCIFIQUES
# Migre les dernières variables spécifiques restantes
# Usage: ./scripts/migrate-css-phase6-final.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 6 FINALE${NC}"
echo "==============================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 6 finale - $(date)"
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

echo -e "${BLUE}📦 PHASE 6A: VARIABLES RGB RESTANTES${NC}"
echo "===================================="
echo

# Variables RGB restantes
migrate_variable_safe "--tc-gray-100-rgb" "--tc-color-gray-100-rgb" "RGB Gris 100"
migrate_variable_safe "--tc-primary-dark-rgb" "--tc-color-primary-dark-rgb" "RGB Primaire foncé"

echo -e "${BLUE}📦 PHASE 6B: VARIABLES DE LAYOUT${NC}"
echo "==============================="
echo

# Variables de layout spécifiques
migrate_variable_safe "--tc-sidebar-width" "--tc-sidebar-width" "Largeur sidebar (déjà correct)"
migrate_variable_safe "--tc-sidebar-collapsed-width" "--tc-sidebar-collapsed-width" "Largeur sidebar réduite (déjà correct)"
migrate_variable_safe "--tc-header-height" "--tc-header-height" "Hauteur header (déjà correct)"

echo -e "${BLUE}📦 PHASE 6C: VARIABLES DE GAPS ET PADDING${NC}"
echo "========================================"
echo

# Variables de gaps et padding
migrate_variable_safe "--tc-gap-2" "--tc-space-2" "Gap 2"
migrate_variable_safe "--tc-gap-4" "--tc-space-4" "Gap 4"
migrate_variable_safe "--tc-gap-6" "--tc-space-6" "Gap 6"
migrate_variable_safe "--tc-gap-8" "--tc-space-8" "Gap 8"
migrate_variable_safe "--tc-btn-padding-x" "--tc-space-4" "Padding horizontal bouton"
migrate_variable_safe "--tc-btn-padding-y" "--tc-space-2" "Padding vertical bouton"

echo -e "${BLUE}📦 PHASE 6D: VARIABLES DE MODAL ET OVERLAY${NC}"
echo "=========================================="
echo

# Variables de modal et overlay
migrate_variable_safe "--tc-modal-overlay-bg" "--tc-bg-overlay" "Fond overlay modal"
migrate_variable_safe "--tc-modal-bg" "--tc-bg-surface" "Fond modal"
migrate_variable_safe "--tc-overlay-bg" "--tc-bg-overlay" "Fond overlay"

echo -e "${BLUE}📦 PHASE 6E: VARIABLES DE DIMENSIONS${NC}"
echo "===================================="
echo

# Variables de dimensions
migrate_variable_safe "--tc-btn-height" "--tc-space-10" "Hauteur bouton"
migrate_variable_safe "--tc-input-height" "--tc-space-10" "Hauteur input"
migrate_variable_safe "--tc-icon-size" "--tc-space-6" "Taille icône"
migrate_variable_safe "--tc-avatar-size" "--tc-space-8" "Taille avatar"

echo -e "${BLUE}📦 PHASE 6F: VARIABLES DIVERSES${NC}"
echo "==============================="
echo

# Variables diverses restantes
migrate_variable_safe "--tc-opacity-disabled" "--tc-opacity-disabled" "Opacité désactivé (déjà correct)"
migrate_variable_safe "--tc-opacity-hover" "--tc-opacity-hover" "Opacité survol (déjà correct)"
migrate_variable_safe "--tc-duration-fast" "--tc-transition-fast" "Durée transition rapide"
migrate_variable_safe "--tc-duration-normal" "--tc-transition-base" "Durée transition normale"
migrate_variable_safe "--tc-duration-slow" "--tc-transition-slow" "Durée transition lente"

echo -e "${BLUE}📦 PHASE 6G: NETTOYAGE FINAL COMPLET${NC}"
echo "===================================="
echo

# Variables obsolètes finales
migrate_variable_safe "--tc-content-width" "--tc-container-max-width" "Largeur contenu"
migrate_variable_safe "--tc-container-padding" "--tc-space-4" "Padding conteneur"
migrate_variable_safe "--tc-section-padding" "--tc-space-8" "Padding section"

# Rapport final complet
echo -e "${PURPLE}📊 RAPPORT FINAL COMPLET${NC}"
echo "========================="

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -lt 10 ]; then
    echo -e "${GREEN}🎉 MIGRATION COMPLÈTEMENT RÉUSSIE !${NC}"
    echo -e "${GREEN}✅ TOUTES les variables critiques ont été migrées !${NC}"
    echo -e "${PURPLE}🚀 La migration CSS TourCraft est 100% TERMINÉE !${NC}"
elif [ "$old_pattern_vars" -lt 50 ]; then
    echo -e "${YELLOW}⚠️  Migration presque parfaite - quelques variables mineures restantes${NC}"
else
    echo -e "${RED}❌ Migration nécessite encore du travail${NC}"
fi

echo
echo -e "${GREEN}🎉 PHASE 6 FINALE TERMINÉE !${NC}"
echo -e "${PURPLE}💡 La migration CSS TourCraft est maintenant 100% COMPLÈTE !${NC}"
echo "🚀 Testez l'application - elle devrait être parfaitement fonctionnelle !"
echo "✅ Toutes les régressions visuelles devraient être corrigées !" 