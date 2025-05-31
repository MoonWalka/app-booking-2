#!/bin/bash

# Script d'audit des styles pour TourCraft Booking App
# Date: Mai 2025

echo "🎨 Audit des styles de l'application TourCraft"
echo "=============================================="

# Couleurs
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Statistiques générales
echo -e "\n${BLUE}📊 Statistiques générales:${NC}"
echo "- Fichiers JavaScript: $(find src -name "*.js" -o -name "*.jsx" | wc -l)"
echo "- Fichiers CSS total: $(find src -name "*.css" | wc -l)"
echo "- CSS Modules: $(find src -name "*.module.css" | wc -l)"
echo "- CSS Global: $(find src -name "*.css" -not -name "*.module.css" | wc -l)"

# 2. Systèmes de style utilisés
echo -e "\n${BLUE}🎯 Systèmes de style détectés:${NC}"

# Bootstrap
bootstrap_count=$(grep -r "className.*['\"].*\(btn-\|col-\|row\|container\|card\|form-\|text-\|bg-\|border-\|d-\|m-\|p-\)" src --include="*.js" --include="*.jsx" | wc -l)
echo -e "${YELLOW}Bootstrap:${NC} $bootstrap_count occurrences"

# CSS Modules
modules_count=$(grep -r "styles\." src --include="*.js" --include="*.jsx" | wc -l)
echo -e "${GREEN}CSS Modules:${NC} $modules_count occurrences"

# Inline styles
inline_count=$(grep -r "style={{" src --include="*.js" --include="*.jsx" | wc -l)
echo -e "${RED}Styles inline:${NC} $inline_count occurrences"

# Classes TC (TourCraft custom)
tc_count=$(grep -r "className.*['\"].*tc-" src --include="*.js" --include="*.jsx" | wc -l)
echo -e "${BLUE}Classes TC custom:${NC} $tc_count occurrences"

# 3. Analyse par module
echo -e "\n${BLUE}📦 Analyse par module:${NC}"
for module in artistes concerts lieux programmateurs structures; do
    echo -e "\n${GREEN}Module $module:${NC}"
    if [ -d "src/components/$module" ]; then
        echo "  - Composants: $(find src/components/$module -name "*.js" | wc -l)"
        echo "  - CSS Modules: $(find src/components/$module -name "*.module.css" | wc -l)"
        echo "  - Desktop/Mobile: $(find src/components/$module -type d -name "desktop" -o -name "mobile" | wc -l) dossiers"
    fi
done

# 4. Duplication desktop/mobile
echo -e "\n${BLUE}📱 Duplication desktop/mobile:${NC}"
for dir in src/components/*; do
    if [ -d "$dir/desktop" ] && [ -d "$dir/mobile" ]; then
        module=$(basename "$dir")
        desktop_files=$(find "$dir/desktop" -name "*.js" | wc -l)
        mobile_files=$(find "$dir/mobile" -name "*.js" | wc -l)
        echo "- $module: $desktop_files desktop, $mobile_files mobile"
    fi
done

# 5. Variables CSS
echo -e "\n${BLUE}🎨 Variables CSS:${NC}"
echo "Fichiers utilisant des variables CSS:"
grep -r "var(--" src --include="*.css" | cut -d: -f1 | sort | uniq | wc -l
echo "Total des variables définies:"
grep -r "^[[:space:]]*--" src/styles --include="*.css" | grep ":" | wc -l

# 6. Composants avec styles mixtes
echo -e "\n${BLUE}⚠️  Composants problématiques (mixent plusieurs systèmes):${NC}"
for file in $(find src/components -name "*.js" -o -name "*.jsx"); do
    has_bootstrap=$(grep -c "className.*['\"].*btn-\|col-\|row" "$file" || true)
    has_modules=$(grep -c "styles\." "$file" || true)
    has_inline=$(grep -c "style={{" "$file" || true)
    
    systems=0
    [ $has_bootstrap -gt 0 ] && systems=$((systems + 1))
    [ $has_modules -gt 0 ] && systems=$((systems + 1))
    [ $has_inline -gt 0 ] && systems=$((systems + 1))
    
    if [ $systems -gt 1 ]; then
        echo "- $(basename "$file"): Bootstrap($has_bootstrap) + Modules($has_modules) + Inline($has_inline)"
    fi
done

# 7. Recommandations
echo -e "\n${BLUE}💡 Recommandations:${NC}"
if [ $bootstrap_count -gt 100 ]; then
    echo -e "${YELLOW}⚠️  Forte dépendance à Bootstrap détectée${NC}"
fi
if [ $inline_count -gt 50 ]; then
    echo -e "${RED}⚠️  Trop de styles inline détectés${NC}"
fi

# 8. Génération d'un rapport détaillé
echo -e "\n${BLUE}📄 Génération du rapport détaillé...${NC}"
{
    echo "# Rapport d'audit des styles - $(date)"
    echo ""
    echo "## Fichiers utilisant Bootstrap"
    grep -r "className.*['\"].*\(btn-\|col-\|row\|container\)" src --include="*.js" | cut -d: -f1 | sort | uniq
    echo ""
    echo "## Fichiers utilisant des styles inline"
    grep -r "style={{" src --include="*.js" | cut -d: -f1 | sort | uniq
    echo ""
    echo "## Variables CSS non utilisées"
    # Lister les variables définies mais non utilisées
} > audit-styles-report.txt

echo -e "${GREEN}✅ Rapport sauvegardé dans audit-styles-report.txt${NC}"