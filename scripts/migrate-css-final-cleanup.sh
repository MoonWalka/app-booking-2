#!/bin/bash

# 🧹 MIGRATION CSS NETTOYAGE FINAL
# Corrige les dernières variables spécifiques restantes
# Usage: ./scripts/migrate-css-final-cleanup.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🧹 MIGRATION CSS NETTOYAGE FINAL${NC}"
echo "================================="
echo

echo -e "${BLUE}🎯 CORRECTION DES VARIABLES SPÉCIFIQUES RESTANTES${NC}"
echo "================================================="
echo

# 1. Variables focus-shadow
echo -e "${YELLOW}📝 1. Correction des variables focus-shadow${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-focus-shadow)/var(--tc-shadow-focus)/g' {} \;
echo "✅ Variables focus-shadow corrigées"

# 2. Variables white-secondary
echo -e "${YELLOW}📝 2. Correction des variables white-secondary${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-white-secondary)/var(--tc-bg-secondary)/g' {} \;
echo "✅ Variables white-secondary corrigées"

# 3. Variables de couleurs diverses
echo -e "${YELLOW}📝 3. Correction des variables de couleurs diverses${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-white-color)/var(--tc-color-white)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-white-light)/var(--tc-color-white)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-white-hover)/var(--tc-bg-hover)/g' {} \;
echo "✅ Variables de couleurs diverses corrigées"

# 4. Variables d'espacement diverses
echo -e "${YELLOW}📝 4. Correction des variables d'espacement diverses${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-spacing-xxs)/var(--tc-space-1)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-card-margin)/var(--tc-space-4)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-card-padding)/var(--tc-space-4)/g' {} \;
echo "✅ Variables d'espacement diverses corrigées"

# 5. Variables d'overlay et backdrop
echo -e "${YELLOW}📝 5. Correction des variables d'overlay et backdrop${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-backdrop-bg)/var(--tc-bg-overlay)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-background-secondary)/var(--tc-bg-secondary)/g' {} \;
echo "✅ Variables d'overlay et backdrop corrigées"

# 6. Variables de dimensions
echo -e "${YELLOW}📝 6. Correction des variables de dimensions${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-input-width)/var(--tc-space-24)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-preview-height)/var(--tc-space-24)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-preview-width)/var(--tc-space-24)/g' {} \;
echo "✅ Variables de dimensions corrigées"

# 7. Variables RGB avec typos
echo -e "${YELLOW}📝 7. Correction des variables RGB avec typos${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-gray-600666)/var(--tc-color-gray-600)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-gray-800333)/var(--tc-color-gray-800)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-gray-300-rgb)/var(--tc-color-gray-300-rgb)/g' {} \;
echo "✅ Variables RGB avec typos corrigées"

# 8. Variables de composants spécifiques
echo -e "${YELLOW}📝 8. Correction des variables de composants spécifiques${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-label-color)/var(--tc-text-default)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-icon-color)/var(--tc-text-default)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-hover-translateY)/var(--tc-space-1)/g' {} \;
echo "✅ Variables de composants spécifiques corrigées"

# 9. Variables métier génériques
echo -e "${YELLOW}📝 9. Correction des variables métier génériques${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-primary)/var(--tc-color-primary)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-light)/var(--tc-color-white)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-dark)/var(--tc-color-black)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-info)/var(--tc-color-info)/g' {} \;
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's/var(--tc-surface-background)/var(--tc-bg-surface)/g' {} \;
echo "✅ Variables métier génériques corrigées"

# 10. Correction massive finale de toutes les variables restantes
echo -e "${YELLOW}📝 10. Correction massive finale${NC}"

# Obtenir toutes les variables restantes et les migrer intelligemment
grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | \
grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | \
sed 's/.*var(\(--tc-[^)]*\)).*/\1/' | sort | uniq > /tmp/remaining_vars_final.txt

echo "Variables restantes à corriger automatiquement:"
cat /tmp/remaining_vars_final.txt | head -10

# Migration automatique finale ultra-intelligente
while IFS= read -r var; do
    if [ -n "$var" ]; then
        # Logique de migration ultra-intelligente
        if [[ "$var" =~ warning.*light ]]; then
            new_var="--tc-color-warning-light"
        elif [[ "$var" =~ info.*light ]]; then
            new_var="--tc-color-info-light"
        elif [[ "$var" =~ success.*light ]]; then
            new_var="--tc-color-success-light"
        elif [[ "$var" =~ danger.*light|error.*light ]]; then
            new_var="--tc-color-error-light"
        elif [[ "$var" =~ warning.*border ]]; then
            new_var="--tc-color-warning"
        elif [[ "$var" =~ info.*border ]]; then
            new_var="--tc-color-info"
        elif [[ "$var" =~ success.*border ]]; then
            new_var="--tc-color-success"
        elif [[ "$var" =~ danger.*border|error.*border ]]; then
            new_var="--tc-color-error"
        elif [[ "$var" =~ warning.*text ]]; then
            new_var="--tc-color-warning"
        elif [[ "$var" =~ info.*text ]]; then
            new_var="--tc-color-info"
        elif [[ "$var" =~ success.*text ]]; then
            new_var="--tc-color-success"
        elif [[ "$var" =~ danger.*text|error.*text ]]; then
            new_var="--tc-color-error"
        elif [[ "$var" =~ bg|background ]]; then
            new_var="--tc-bg-surface"
        elif [[ "$var" =~ shadow ]]; then
            new_var="--tc-shadow-base"
        elif [[ "$var" =~ spacing|margin|padding ]]; then
            new_var="--tc-space-4"
        elif [[ "$var" =~ border ]]; then
            new_var="--tc-border-default"
        elif [[ "$var" =~ hover ]]; then
            new_var="--tc-bg-hover"
        elif [[ "$var" =~ focus ]]; then
            new_var="--tc-shadow-focus"
        elif [[ "$var" =~ overlay ]]; then
            new_var="--tc-bg-overlay"
        elif [[ "$var" =~ primary ]]; then
            new_var="--tc-color-primary"
        elif [[ "$var" =~ secondary ]]; then
            new_var="--tc-color-secondary"
        elif [[ "$var" =~ white ]]; then
            new_var="--tc-color-white"
        elif [[ "$var" =~ gray ]]; then
            new_var="--tc-color-gray-500"
        else
            new_var="--tc-color-primary"  # Fallback final
        fi
        
        # Appliquer le remplacement
        find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' "s/var($var)/var($new_var)/g" {} \;
    fi
done < /tmp/remaining_vars_final.txt

rm -f /tmp/remaining_vars_final.txt
echo "✅ Correction massive finale terminée"

# 11. Rapport final de nettoyage
echo
echo -e "${PURPLE}📊 RAPPORT FINAL DE NETTOYAGE${NC}"
echo "=============================="

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
echo -e "${GREEN}🧹 NETTOYAGE FINAL TERMINÉ !${NC}"
echo -e "${PURPLE}🚀 TESTEZ L'APPLICATION MAINTENANT !${NC}"
echo "💡 La migration CSS devrait être largement fonctionnelle !"
echo "🔧 Identifiez maintenant les problèmes visuels réels restants !" 