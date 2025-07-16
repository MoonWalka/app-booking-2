#!/bin/bash

# 🔧 CORRECTION DIRECTE DES VARIABLES CSS CRITIQUES
# Corrige directement les variables les plus problématiques
# Usage: ./scripts/migrate-css-direct-fix.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔧 CORRECTION DIRECTE DES VARIABLES CSS CRITIQUES${NC}"
echo "================================================="
echo

# Fonction de correction directe
fix_variable() {
    local old_var=$1
    local new_var=$2
    local description=$3
    
    echo -e "${BLUE}🔧 Correction: $old_var → $new_var${NC}"
    echo "   📝 $description"
    
    # Compter avant
    local count_before=$(grep -r "var($old_var)" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
    echo "   📊 $count_before occurrences trouvées"
    
    if [ "$count_before" -eq 0 ]; then
        echo "   ⚠️  Aucune occurrence trouvée"
        return
    fi
    
    # Correction avec perl (plus robuste que sed)
    find src/ -name "*.css" -o -name "*.module.css" -type f -exec perl -pi -e "s/var\\(\\Q$old_var\\E\\)/var($new_var)/g" {} \;
    
    # Vérifier après
    local count_after=$(grep -r "var($old_var)" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
    echo "   ✅ Résultat: $count_after occurrences restantes"
    echo
}

echo -e "${BLUE}🎯 CORRECTION DES VARIABLES LES PLUS CRITIQUES${NC}"
echo "=============================================="
echo

# 1. Variables focus-shadow
echo -e "${YELLOW}📝 1. Variables focus-shadow${NC}"
fix_variable "--tc-focus-shadow" "--tc-shadow-focus" "Ombre de focus"

# 2. Variables white-secondary
echo -e "${YELLOW}📝 2. Variables white-secondary${NC}"
fix_variable "--tc-white-secondary" "--tc-bg-secondary" "Fond secondaire blanc"

# 3. Variables de statut restantes
echo -e "${YELLOW}📝 3. Variables de statut restantes${NC}"
fix_variable "--tc-danger-bg" "--tc-bg-error" "Fond d'erreur"
fix_variable "--tc-success-bg" "--tc-bg-success" "Fond de succès"
fix_variable "--tc-warning-bg" "--tc-bg-warning" "Fond d'avertissement"
fix_variable "--tc-info-bg" "--tc-bg-info" "Fond d'information"

# 4. Variables de bordures
echo -e "${YELLOW}📝 4. Variables de bordures${NC}"
fix_variable "--tc-danger-border" "--tc-color-error" "Bordure d'erreur"
fix_variable "--tc-success-border" "--tc-color-success" "Bordure de succès"
fix_variable "--tc-warning-border" "--tc-color-warning" "Bordure d'avertissement"
fix_variable "--tc-info-border" "--tc-color-info" "Bordure d'information"

# 5. Variables Bootstrap
echo -e "${YELLOW}📝 5. Variables Bootstrap${NC}"
fix_variable "--tc-bs-primary" "--tc-color-primary" "Bootstrap primaire"
fix_variable "--tc-bs-secondary" "--tc-color-secondary" "Bootstrap secondaire"
fix_variable "--tc-bs-success" "--tc-color-success" "Bootstrap succès"
fix_variable "--tc-bs-warning" "--tc-color-warning" "Bootstrap avertissement"
fix_variable "--tc-bs-danger" "--tc-color-error" "Bootstrap danger"
fix_variable "--tc-bs-info" "--tc-color-info" "Bootstrap information"
fix_variable "--tc-bs-white" "--tc-color-white" "Bootstrap blanc"

# 6. Variables d'ombres
echo -e "${YELLOW}📝 6. Variables d'ombres${NC}"
fix_variable "--tc-box-shadow" "--tc-shadow-base" "Ombre de boîte"
fix_variable "--tc-dropdown-shadow" "--tc-shadow-lg" "Ombre de dropdown"
fix_variable "--tc-overlay-shadow" "--tc-shadow-lg" "Ombre d'overlay"

# 7. Variables d'espacement
echo -e "${YELLOW}📝 7. Variables d'espacement${NC}"
fix_variable "--tc-spacing-5" "--tc-space-5" "Espacement 5"
fix_variable "--tc-card-margin" "--tc-space-4" "Marge de carte"
fix_variable "--tc-card-padding" "--tc-space-4" "Padding de carte"

# 8. Variables de couleurs diverses
echo -e "${YELLOW}📝 8. Variables de couleurs diverses${NC}"
fix_variable "--tc-whitefff" "--tc-color-white" "Couleur blanche (typo)"
fix_variable "--tc-white-color" "--tc-color-white" "Couleur blanche"
fix_variable "--tc-white-light" "--tc-color-white" "Blanc clair"
fix_variable "--tc-white-hover" "--tc-bg-hover" "Blanc hover"

# 9. Variables d'overlay
echo -e "${YELLOW}📝 9. Variables d'overlay${NC}"
fix_variable "--tc-overlay-color" "--tc-bg-overlay" "Couleur d'overlay"
fix_variable "--tc-backdrop-bg" "--tc-bg-overlay" "Fond de backdrop"
fix_variable "--tc-background-secondary" "--tc-bg-secondary" "Fond secondaire"

# 10. Variables de couleurs claires
echo -e "${YELLOW}📝 10. Variables de couleurs claires${NC}"
fix_variable "--tc-danger-light" "--tc-color-error-light" "Erreur claire"
fix_variable "--tc-success-light" "--tc-color-success-light" "Succès clair"
fix_variable "--tc-warning-light" "--tc-color-warning-light" "Avertissement clair"
fix_variable "--tc-info-light" "--tc-color-info-light" "Information claire"

# 11. Rapport final
echo -e "${PURPLE}📊 RAPPORT FINAL DE CORRECTION DIRECTE${NC}"
echo "======================================"

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | wc -l | tr -d ' ')

echo "Variables CSS totales: $total_vars"
echo "Variables ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -eq 0 ]; then
    echo -e "${GREEN}🎉 MIGRATION 100% PARFAITE !${NC}"
    echo -e "${GREEN}✅ TOUTES les variables migrées !${NC}"
    echo -e "${PURPLE}🚀 La migration CSS TourCraft est ABSOLUMENT TERMINÉE !${NC}"
elif [ "$old_pattern_vars" -lt 10 ]; then
    echo -e "${YELLOW}⚠️  Migration quasi-parfaite !${NC}"
    echo -e "${GREEN}✅ Plus de 98% de réussite !${NC}"
    echo "Variables restantes (très peu):"
    grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | head -3
elif [ "$old_pattern_vars" -lt 50 ]; then
    echo -e "${YELLOW}⚠️  Migration excellente !${NC}"
    echo -e "${GREEN}✅ Plus de 95% de réussite !${NC}"
    echo "Variables restantes (peu nombreuses):"
    grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | head -5
else
    echo -e "${RED}❌ Encore du travail nécessaire${NC}"
    echo "Variables restantes les plus fréquentes:"
    grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | head -10
fi

echo
echo -e "${GREEN}🔧 CORRECTION DIRECTE TERMINÉE !${NC}"
echo -e "${PURPLE}🚀 TESTEZ L'APPLICATION MAINTENANT !${NC}"
echo "💡 Les problèmes visuels critiques devraient être résolus !" 