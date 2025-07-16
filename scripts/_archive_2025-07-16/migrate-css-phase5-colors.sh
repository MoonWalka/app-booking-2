#!/bin/bash

# 🔄 MIGRATION CSS PHASE 5 - COULEURS SPÉCIFIQUES
# Migre toutes les variables de couleurs spécifiques restantes
# Usage: ./scripts/migrate-css-phase5-colors.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 5 - COULEURS SPÉCIFIQUES${NC}"
echo "==============================================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 5 couleurs - $(date)"
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

echo -e "${BLUE}📦 PHASE 5A: COULEURS DE BASE${NC}"
echo "============================="
echo

# Couleurs de base
migrate_variable_safe "--tc-white" "--tc-color-white" "Couleur blanche"
migrate_variable_safe "--tc-black" "--tc-color-black" "Couleur noire"

echo -e "${BLUE}📦 PHASE 5B: COULEURS GRISES${NC}"
echo "============================"
echo

# Couleurs grises complètes
migrate_variable_safe "--tc-gray-50" "--tc-color-gray-50" "Gris 50"
migrate_variable_safe "--tc-gray-100" "--tc-color-gray-100" "Gris 100"
migrate_variable_safe "--tc-gray-200" "--tc-color-gray-200" "Gris 200"
migrate_variable_safe "--tc-gray-300" "--tc-color-gray-300" "Gris 300"
migrate_variable_safe "--tc-gray-400" "--tc-color-gray-400" "Gris 400"
migrate_variable_safe "--tc-gray-500" "--tc-color-gray-500" "Gris 500"
migrate_variable_safe "--tc-gray-600" "--tc-color-gray-600" "Gris 600"
migrate_variable_safe "--tc-gray-700" "--tc-color-gray-700" "Gris 700"
migrate_variable_safe "--tc-gray-800" "--tc-color-gray-800" "Gris 800"
migrate_variable_safe "--tc-gray-900" "--tc-color-gray-900" "Gris 900"

echo -e "${BLUE}📦 PHASE 5C: COULEURS RGB${NC}"
echo "=========================="
echo

# Variables RGB
migrate_variable_safe "--tc-gray-600-rgb" "--tc-color-gray-600-rgb" "RGB Gris 600"
migrate_variable_safe "--tc-gray-700-rgb" "--tc-color-gray-700-rgb" "RGB Gris 700"
migrate_variable_safe "--tc-gray-800-rgb" "--tc-color-gray-800-rgb" "RGB Gris 800"

echo -e "${BLUE}📦 PHASE 5D: VARIABLES DE COMPOSANTS${NC}"
echo "===================================="
echo

# Variables spécifiques aux composants
migrate_variable_safe "--tc-card-header-bg" "--tc-bg-surface" "Fond header de carte"
migrate_variable_safe "--tc-light-hover" "--tc-bg-hover" "Fond hover clair"
migrate_variable_safe "--tc-card-bg" "--tc-bg-surface" "Fond de carte"
migrate_variable_safe "--tc-input-bg" "--tc-bg-input" "Fond d'input"
migrate_variable_safe "--tc-btn-bg" "--tc-bg-surface" "Fond de bouton"

echo -e "${BLUE}📦 PHASE 5E: VARIABLES D'ÉTAT${NC}"
echo "============================="
echo

# Variables d'état
migrate_variable_safe "--tc-hover-color" "--tc-color-primary-hover" "Couleur au survol"
migrate_variable_safe "--tc-active-color" "--tc-color-primary-active" "Couleur active"
migrate_variable_safe "--tc-focus-color" "--tc-color-primary" "Couleur focus"
migrate_variable_safe "--tc-disabled-color" "--tc-color-gray-400" "Couleur désactivée"
migrate_variable_safe "--tc-disabled-bg" "--tc-bg-disabled" "Fond désactivé"

echo -e "${BLUE}📦 PHASE 5F: VARIABLES DE BORDURES${NC}"
echo "=================================="
echo

# Variables de bordures spécifiques
migrate_variable_safe "--tc-border-color" "--tc-border-default" "Couleur de bordure"
migrate_variable_safe "--tc-border-hover" "--tc-border-hover" "Bordure au survol"
migrate_variable_safe "--tc-border-focus" "--tc-color-primary" "Bordure focus"

# Rapport final
echo -e "${PURPLE}📊 RAPPORT PHASE 5${NC}"
echo "=================="

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -lt 50 ]; then
    echo -e "${GREEN}🎉 MIGRATION PHASE 5 EXCELLENTE !${NC}"
elif [ "$old_pattern_vars" -lt 200 ]; then
    echo -e "${YELLOW}⚠️  Migration Phase 5 bonne - quelques variables restantes${NC}"
else
    echo -e "${RED}❌ Migration Phase 5 nécessite plus de travail${NC}"
fi

echo
echo -e "${GREEN}✅ Phase 5 terminée${NC}"
echo "🚀 Continuons pour finaliser complètement !" 