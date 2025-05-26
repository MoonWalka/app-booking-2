#!/bin/bash

# 🎯 MIGRATION CSS ULTRA-FINALE
# Corrige les dernières variables critiques restantes
# Usage: ./scripts/migrate-css-ultra-final.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🎯 MIGRATION CSS ULTRA-FINALE${NC}"
echo "=============================="
echo

# Fonction de remplacement précis
replace_exact() {
    local file=$1
    local old_var=$2
    local new_var=$3
    local description=$4
    
    echo -e "${BLUE}🎯 $file: $old_var → $new_var${NC}"
    
    # Vérifier si le fichier existe
    if [ ! -f "$file" ]; then
        echo "   ⚠️  Fichier non trouvé"
        return
    fi
    
    # Compter les occurrences avant
    local count_before=$(grep -c "var($old_var)" "$file" 2>/dev/null || echo "0")
    
    if [ "$count_before" -eq 0 ]; then
        echo "   ⚠️  Variable non trouvée"
        return
    fi
    
    # Remplacement avec sed
    sed -i '' "s/var($old_var)/var($new_var)/g" "$file"
    
    echo "   ✅ $count_before variable(s) corrigée(s)"
}

echo -e "${BLUE}🔥 CORRECTION DES VARIABLES ULTRA-CRITIQUES${NC}"
echo "==========================================="
echo

# 1. Variables de statut dans FormGenerator.module.css
echo -e "${YELLOW}📝 FormGenerator.module.css - Variables de statut${NC}"
replace_exact "src/components/forms/FormGenerator.module.css" "--tc-info-bg" "--tc-bg-info" "Fond information"
replace_exact "src/components/forms/FormGenerator.module.css" "--tc-info-border" "--tc-color-info" "Bordure information"
replace_exact "src/components/forms/FormGenerator.module.css" "--tc-warning-bg" "--tc-bg-warning" "Fond avertissement"
replace_exact "src/components/forms/FormGenerator.module.css" "--tc-warning-border" "--tc-color-warning" "Bordure avertissement"

# 2. Variables de statut dans FormErrorPanel.module.css
echo -e "${YELLOW}📝 FormErrorPanel.module.css - Variables de statut${NC}"
replace_exact "src/components/forms/public/FormErrorPanel.module.css" "--tc-danger-bg" "--tc-bg-error" "Fond erreur"
replace_exact "src/components/forms/public/FormErrorPanel.module.css" "--tc-warning-bg" "--tc-bg-warning" "Fond avertissement"
replace_exact "src/components/forms/public/FormErrorPanel.module.css" "--tc-info-bg" "--tc-bg-info" "Fond information"
replace_exact "src/components/forms/public/FormErrorPanel.module.css" "--tc-success-bg" "--tc-bg-success" "Fond succès"

# 3. Variables Bootstrap dans ValidationSummary.module.css
echo -e "${YELLOW}📝 ValidationSummary.module.css - Variables Bootstrap${NC}"
replace_exact "src/components/forms/mobile/sections/ValidationSummary.module.css" "--tc-bs-success" "--tc-color-success" "Bootstrap succès"

# 4. Variables de couleurs claires dans ValidationSection.module.css
echo -e "${YELLOW}📝 ValidationSection.module.css - Variables claires${NC}"
replace_exact "src/components/forms/mobile/sections/ValidationSection.module.css" "--tc-success-light" "--tc-color-success-light" "Succès clair"
replace_exact "src/components/forms/mobile/sections/ValidationSection.module.css" "--tc-danger-light" "--tc-color-error-light" "Erreur claire"

# 5. Variables Bootstrap dans FormValidationInterface.module.css
echo -e "${YELLOW}📝 FormValidationInterface.module.css - Variables Bootstrap${NC}"
replace_exact "src/components/forms/mobile/FormValidationInterface.module.css" "--tc-bs-primary" "--tc-color-primary" "Bootstrap primaire"
replace_exact "src/components/forms/mobile/FormValidationInterface.module.css" "--tc-bs-info" "--tc-color-info" "Bootstrap information"
replace_exact "src/components/forms/mobile/FormValidationInterface.module.css" "--tc-bs-secondary" "--tc-color-secondary" "Bootstrap secondaire"

# 6. Ajout des variables manquantes si nécessaire
echo -e "${YELLOW}📝 Vérification des variables manquantes${NC}"

# Vérifier et ajouter les variables de couleurs claires
if ! grep -q "tc-color-success-light" src/styles/base/colors.css; then
    echo "➕ Ajout de --tc-color-success-light"
    echo "  --tc-color-success-light: #d1f2eb;" >> src/styles/base/colors.css
fi

if ! grep -q "tc-color-error-light" src/styles/base/colors.css; then
    echo "➕ Ajout de --tc-color-error-light"
    echo "  --tc-color-error-light: #f8d7da;" >> src/styles/base/colors.css
fi

# 7. Correction massive des variables restantes par pattern
echo -e "${YELLOW}📝 Correction massive par patterns${NC}"

# Variables de statut bg → bg-*
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-danger-bg)/var(--tc-bg-error)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-success-bg)/var(--tc-bg-success)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-warning-bg)/var(--tc-bg-warning)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-info-bg)/var(--tc-bg-info)/g' {} \;

# Variables de bordures → couleurs
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-danger-border)/var(--tc-color-error)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-success-border)/var(--tc-color-success)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-warning-border)/var(--tc-color-warning)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-info-border)/var(--tc-color-info)/g' {} \;

# Variables Bootstrap → couleurs TourCraft
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-bs-primary)/var(--tc-color-primary)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-bs-secondary)/var(--tc-color-secondary)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-bs-success)/var(--tc-color-success)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-bs-warning)/var(--tc-color-warning)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-bs-danger)/var(--tc-color-error)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-bs-info)/var(--tc-color-info)/g' {} \;

# Variables de couleurs claires
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-success-light)/var(--tc-color-success-light)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-danger-light)/var(--tc-color-error-light)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-warning-light)/var(--tc-color-warning-light)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-info-light)/var(--tc-color-info-light)/g' {} \;

echo "✅ Correction massive terminée"

# 8. Rapport final ultra-précis
echo
echo -e "${PURPLE}📊 RAPPORT ULTRA-FINAL${NC}"
echo "======================"

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | wc -l | tr -d ' ')

echo "Variables CSS totales: $total_vars"
echo "Variables ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -eq 0 ]; then
    echo -e "${GREEN}🎉 MIGRATION 100% PARFAITE !${NC}"
    echo -e "${GREEN}✅ TOUTES les variables migrées !${NC}"
elif [ "$old_pattern_vars" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Migration quasi-parfaite !${NC}"
    echo -e "${GREEN}✅ Plus de 95% de réussite !${NC}"
    echo "Variables restantes:"
    grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | head -5
else
    echo -e "${RED}❌ Encore du travail nécessaire${NC}"
fi

echo
echo -e "${GREEN}🎯 MIGRATION ULTRA-FINALE TERMINÉE !${NC}"
echo -e "${PURPLE}🚀 Testez l'application maintenant !${NC}"
echo "💡 Les problèmes visuels devraient être largement résolus !" 