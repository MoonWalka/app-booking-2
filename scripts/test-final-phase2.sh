#!/bin/bash

# 🎯 TEST FINAL PHASE 2 - VALIDATION OBJECTIF -70%
# Valide que l'objectif de réduction de 70% a été atteint
# Usage: ./scripts/test-final-phase2.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🎯 TEST FINAL PHASE 2 - VALIDATION OBJECTIF -70%${NC}"
echo "=================================================="
echo

# Variables de base
OBJECTIF_INITIAL=431
OBJECTIF_FINAL=130
REDUCTION_CIBLE=70

echo -e "${YELLOW}📊 COMPTAGE VARIABLES FINALES${NC}"
echo "=============================="

# Compter les variables dans chaque fichier
COLORS_VARS=$(grep -c "\-\-tc-" src/styles/base/colors.css)
VARIABLES_VARS=$(grep -c "\-\-tc-" src/styles/base/variables.css)
TOTAL_VARS=$((COLORS_VARS + VARIABLES_VARS))

echo "Variables colors.css: $COLORS_VARS"
echo "Variables variables.css: $VARIABLES_VARS"
echo "Total variables: $TOTAL_VARS"
echo

# Calculer la réduction
REDUCTION_ABSOLUE=$((OBJECTIF_INITIAL - TOTAL_VARS))
REDUCTION_POURCENTAGE=$((100 * REDUCTION_ABSOLUE / OBJECTIF_INITIAL))

echo -e "${YELLOW}📈 CALCUL RÉDUCTION${NC}"
echo "=================="
echo "Variables initiales: $OBJECTIF_INITIAL"
echo "Variables finales: $TOTAL_VARS"
echo "Réduction absolue: $REDUCTION_ABSOLUE variables"
echo "Réduction pourcentage: $REDUCTION_POURCENTAGE%"
echo

# Validation objectif
echo -e "${YELLOW}🎯 VALIDATION OBJECTIF${NC}"
echo "====================="

if [ $TOTAL_VARS -eq $OBJECTIF_FINAL ]; then
    echo -e "${GREEN}✅ OBJECTIF ATTEINT EXACTEMENT !${NC}"
    echo "   Cible: $OBJECTIF_FINAL variables"
    echo "   Résultat: $TOTAL_VARS variables"
else
    echo -e "${RED}❌ Objectif non atteint${NC}"
    echo "   Cible: $OBJECTIF_FINAL variables"
    echo "   Résultat: $TOTAL_VARS variables"
    echo "   Écart: $((TOTAL_VARS - OBJECTIF_FINAL)) variables"
fi

if [ $REDUCTION_POURCENTAGE -ge $REDUCTION_CIBLE ]; then
    echo -e "${GREEN}✅ RÉDUCTION CIBLE ATTEINTE !${NC}"
    echo "   Cible: $REDUCTION_CIBLE%"
    echo "   Résultat: $REDUCTION_POURCENTAGE%"
else
    echo -e "${RED}❌ Réduction cible non atteinte${NC}"
    echo "   Cible: $REDUCTION_CIBLE%"
    echo "   Résultat: $REDUCTION_POURCENTAGE%"
fi

echo

# Test des variables critiques
echo -e "${YELLOW}🔍 TEST VARIABLES CRITIQUES${NC}"
echo "============================"

VARIABLES_CRITIQUES=(
    "--tc-color-primary"
    "--tc-color-secondary"
    "--tc-font-size-base"
    "--tc-space-4"
    "--tc-shadow-base"
    "--tc-radius-base"
)

for var in "${VARIABLES_CRITIQUES[@]}"; do
    if grep -q "$var:" src/styles/base/colors.css src/styles/base/variables.css; then
        echo -e "✅ $var"
    else
        echo -e "❌ $var (MANQUANT)"
    fi
done

echo

# Test de la structure des fichiers
echo -e "${YELLOW}📁 TEST STRUCTURE FICHIERS${NC}"
echo "=========================="

if [ -f "src/styles/base/colors.css" ]; then
    echo -e "✅ colors.css existe"
else
    echo -e "❌ colors.css manquant"
fi

if [ -f "src/styles/base/variables.css" ]; then
    echo -e "✅ variables.css existe"
else
    echo -e "❌ variables.css manquant"
fi

if grep -q "@import.*colors.css" src/styles/base/variables.css; then
    echo -e "✅ Import colors.css dans variables.css"
else
    echo -e "❌ Import colors.css manquant"
fi

echo

# Test des couleurs de la maquette
echo -e "${YELLOW}🎨 TEST COULEURS MAQUETTE${NC}"
echo "========================="

COULEURS_MAQUETTE=(
    "#213547"  # Primary
    "#1e88e5"  # Secondary
    "#4db6ac"  # Accent
)

for couleur in "${COULEURS_MAQUETTE[@]}"; do
    if grep -q "$couleur" src/styles/base/colors.css; then
        echo -e "✅ $couleur (couleur maquette)"
    else
        echo -e "❌ $couleur (couleur maquette manquante)"
    fi
done

echo

# Résumé final
echo -e "${PURPLE}📋 RÉSUMÉ FINAL${NC}"
echo "==============="

if [ $TOTAL_VARS -eq $OBJECTIF_FINAL ] && [ $REDUCTION_POURCENTAGE -ge $REDUCTION_CIBLE ]; then
    echo -e "${GREEN}🎉 PHASE 2 RÉUSSIE AVEC SUCCÈS !${NC}"
    echo -e "${GREEN}   ✅ Objectif -70% atteint exactement${NC}"
    echo -e "${GREEN}   ✅ 431 → 130 variables (-$REDUCTION_POURCENTAGE%)${NC}"
    echo -e "${GREEN}   ✅ Variables basées sur la maquette${NC}"
    echo -e "${GREEN}   ✅ Architecture optimisée${NC}"
    echo
    echo -e "${BLUE}🚀 Prêt pour Phase 3 - Implémentation${NC}"
else
    echo -e "${RED}❌ PHASE 2 INCOMPLÈTE${NC}"
    echo -e "${RED}   Objectifs non atteints${NC}"
    echo -e "${RED}   Révision nécessaire${NC}"
fi

echo
echo -e "${PURPLE}Test final Phase 2 terminé${NC}" 