#!/bin/bash

# 🧪 TEST PHASE 2 - VARIABLES COULEURS
# Teste que les nouvelles variables de couleurs fonctionnent correctement
# Usage: ./scripts/test-phase2-colors.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🧪 TEST PHASE 2 - VARIABLES COULEURS${NC}"
echo "====================================="
echo

# Vérifier que colors.css existe
if [ ! -f "src/styles/base/colors.css" ]; then
    echo -e "${RED}❌ Erreur: colors.css introuvable${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 VÉRIFICATION DES NOUVELLES VARIABLES${NC}"
echo "======================================"

# Compter les nouvelles variables dans colors.css
NEW_COLOR_VARS=$(grep -c "\-\-tc-" src/styles/base/colors.css)
echo "Variables dans colors.css: $NEW_COLOR_VARS"

# Vérifier les variables principales
echo
echo -e "${YELLOW}🎨 VÉRIFICATION VARIABLES PRINCIPALES${NC}"
echo "===================================="

MAIN_VARS=(
    "--tc-color-primary"
    "--tc-color-secondary"
    "--tc-color-success"
    "--tc-color-warning"
    "--tc-color-error"
    "--tc-color-info"
    "--tc-bg-default"
    "--tc-text-default"
    "--tc-border-default"
)

for var in "${MAIN_VARS[@]}"; do
    if grep -q "$var:" src/styles/base/colors.css; then
        echo -e "✅ $var"
    else
        echo -e "❌ $var"
    fi
done

# Vérifier les alias de compatibilité
echo
echo -e "${YELLOW}🔄 VÉRIFICATION ALIAS COMPATIBILITÉ${NC}"
echo "=================================="

ALIAS_VARS=(
    "--tc-primary-color"
    "--tc-secondary-color"
    "--tc-success-color"
    "--tc-danger-color"
    "--tc-bg-color"
    "--tc-text-color"
)

for var in "${ALIAS_VARS[@]}"; do
    if grep -q "$var:" src/styles/base/colors.css; then
        echo -e "✅ $var (alias)"
    else
        echo -e "❌ $var (alias manquant)"
    fi
done

# Vérifier que variables.css importe colors.css
echo
echo -e "${YELLOW}📦 VÉRIFICATION IMPORT${NC}"
echo "====================="

if grep -q "@import.*colors.css" src/styles/base/variables.css; then
    echo -e "✅ Import colors.css dans variables.css"
else
    echo -e "❌ Import colors.css manquant"
fi

# Compter les variables totales après optimisation
echo
echo -e "${YELLOW}📊 STATISTIQUES APRÈS OPTIMISATION${NC}"
echo "=================================="

TOTAL_VARS_VARIABLES=$(grep -c "\-\-tc-" src/styles/base/variables.css)
TOTAL_VARS_COLORS=$(grep -c "\-\-tc-" src/styles/base/colors.css)
TOTAL_VARS=$((TOTAL_VARS_VARIABLES + TOTAL_VARS_COLORS))

echo "Variables dans variables.css: $TOTAL_VARS_VARIABLES"
echo "Variables dans colors.css: $TOTAL_VARS_COLORS"
echo "Total variables: $TOTAL_VARS"
echo "Objectif: 110 variables"

if [ $TOTAL_VARS -le 110 ]; then
    echo -e "${GREEN}✅ Objectif atteint !${NC}"
else
    echo -e "${YELLOW}⚠️  Encore $(($TOTAL_VARS - 110)) variables à optimiser${NC}"
fi

# Test de syntaxe CSS
echo
echo -e "${YELLOW}🔍 TEST SYNTAXE CSS${NC}"
echo "=================="

# Vérifier qu'il n'y a pas d'erreurs de syntaxe évidentes
if grep -q "var(--tc-" src/styles/base/colors.css; then
    echo -e "✅ Références var() détectées"
else
    echo -e "⚠️  Aucune référence var() détectée"
fi

# Vérifier les couleurs hexadécimales
HEX_COLORS=$(grep -c "#[0-9a-fA-F]\{6\}" src/styles/base/colors.css)
echo "Couleurs hexadécimales: $HEX_COLORS"

# Vérifier les couleurs rgba
RGBA_COLORS=$(grep -c "rgba(" src/styles/base/colors.css)
echo "Couleurs rgba: $RGBA_COLORS"

echo
echo -e "${GREEN}✅ TESTS PHASE 2 COULEURS TERMINÉS${NC}"
echo "=================================="
echo "Prochaine étape: Tester l'intégration avec la maquette HTML" 