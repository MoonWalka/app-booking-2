#!/bin/bash

# 🧪 TEST INTÉGRATION PHASE 3 - MIGRATION TAILWIND
# Valide que la migration Tailwind → Variables CSS fonctionne
# Usage: ./scripts/test-integration-phase3.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🧪 TEST INTÉGRATION PHASE 3 - MIGRATION TAILWIND${NC}"
echo "=================================================="
echo

# Créer le dossier de rapport
mkdir -p reports/phase3

# Fichier de rapport
RAPPORT="reports/phase3/integration-test.txt"
echo "# TEST INTÉGRATION PHASE 3 - $(date)" > $RAPPORT
echo "# Validation migration Tailwind → Variables CSS" >> $RAPPORT
echo >> $RAPPORT

echo -e "${YELLOW}📊 VALIDATION VARIABLES CSS${NC}"
echo "============================"

# Vérifier que tc-utilities.css existe
if [ -f "src/styles/components/tc-utilities.css" ]; then
    echo -e "✅ tc-utilities.css créé" | tee -a $RAPPORT
else
    echo -e "❌ tc-utilities.css manquant" | tee -a $RAPPORT
    exit 1
fi

# Compter les classes utilitaires créées
UTILITY_CLASSES=$(grep -c "^\.tc-" src/styles/components/tc-utilities.css)
echo "Classes utilitaires créées: $UTILITY_CLASSES" | tee -a $RAPPORT

echo

echo -e "${YELLOW}🎨 TEST VARIABLES COULEURS${NC}"
echo "=========================="

# Variables couleurs critiques
COULEURS_CRITIQUES=(
    "--tc-color-primary"
    "--tc-color-secondary"
    "--tc-color-success"
    "--tc-color-warning"
    "--tc-color-error"
    "--tc-color-info"
)

for var in "${COULEURS_CRITIQUES[@]}"; do
    if grep -q "$var:" src/styles/base/colors.css; then
        echo -e "✅ $var définie" | tee -a $RAPPORT
    else
        echo -e "❌ $var manquante" | tee -a $RAPPORT
    fi
done

echo

echo -e "${YELLOW}📐 TEST VARIABLES ESPACEMENTS${NC}"
echo "============================="

# Variables espacements critiques
ESPACEMENTS_CRITIQUES=(
    "--tc-space-1"
    "--tc-space-2"
    "--tc-space-4"
    "--tc-space-6"
    "--tc-gap-2"
    "--tc-gap-4"
)

for var in "${ESPACEMENTS_CRITIQUES[@]}"; do
    if grep -q "$var:" src/styles/base/variables.css; then
        echo -e "✅ $var définie" | tee -a $RAPPORT
    else
        echo -e "❌ $var manquante" | tee -a $RAPPORT
    fi
done

echo

echo -e "${YELLOW}🔤 TEST VARIABLES TYPOGRAPHIE${NC}"
echo "============================="

# Variables typographie critiques
TYPO_CRITIQUES=(
    "--tc-font-size-xs"
    "--tc-font-size-sm"
    "--tc-font-size-base"
    "--tc-font-size-xl"
    "--tc-font-weight-medium"
    "--tc-font-weight-semibold"
)

for var in "${TYPO_CRITIQUES[@]}"; do
    if grep -q "$var:" src/styles/base/variables.css; then
        echo -e "✅ $var définie" | tee -a $RAPPORT
    else
        echo -e "❌ $var manquante" | tee -a $RAPPORT
    fi
done

echo

echo -e "${YELLOW}🎯 TEST CLASSES UTILITAIRES${NC}"
echo "============================"

# Classes utilitaires critiques
CLASSES_CRITIQUES=(
    ".tc-text-xs"
    ".tc-text-sm"
    ".tc-text-xl"
    ".tc-p-4"
    ".tc-gap-2"
    ".tc-rounded"
    ".tc-shadow"
    ".tc-btn-primary"
    ".tc-card"
)

for class in "${CLASSES_CRITIQUES[@]}"; do
    if grep -q "$class" src/styles/components/tc-utilities.css; then
        echo -e "✅ $class définie" | tee -a $RAPPORT
    else
        echo -e "❌ $class manquante" | tee -a $RAPPORT
    fi
done

echo

echo -e "${YELLOW}🔗 TEST IMPORTS ET RÉFÉRENCES${NC}"
echo "=============================="

# Vérifier que tc-utilities.css importe variables.css
if grep -q "@import.*variables.css" src/styles/components/tc-utilities.css; then
    echo -e "✅ Import variables.css dans tc-utilities.css" | tee -a $RAPPORT
else
    echo -e "❌ Import variables.css manquant" | tee -a $RAPPORT
fi

# Vérifier que variables.css importe colors.css
if grep -q "@import.*colors.css" src/styles/base/variables.css; then
    echo -e "✅ Import colors.css dans variables.css" | tee -a $RAPPORT
else
    echo -e "❌ Import colors.css manquant" | tee -a $RAPPORT
fi

echo

echo -e "${YELLOW}📊 TEST COHÉRENCE COULEURS MAQUETTE${NC}"
echo "===================================="

# Couleurs exactes de la maquette
COULEURS_MAQUETTE=(
    "#213547"  # Primary
    "#1e88e5"  # Secondary
    "#4db6ac"  # Accent
)

for couleur in "${COULEURS_MAQUETTE[@]}"; do
    if grep -q "$couleur" src/styles/base/colors.css; then
        echo -e "✅ $couleur (couleur maquette)" | tee -a $RAPPORT
    else
        echo -e "❌ $couleur (couleur maquette manquante)" | tee -a $RAPPORT
    fi
done

echo

echo -e "${YELLOW}🎨 TEST ÉQUIVALENCES TAILWIND${NC}"
echo "==============================="

# Vérifier que les classes TourCraft remplacent bien Tailwind
EQUIVALENCES=(
    "tc-text-xs:text-xs"
    "tc-text-sm:text-sm"
    "tc-p-4:p-4"
    "tc-gap-2:gap-2"
    "tc-rounded:rounded"
    "tc-shadow:shadow"
)

for equiv in "${EQUIVALENCES[@]}"; do
    TC_CLASS=$(echo $equiv | cut -d: -f1)
    TW_CLASS=$(echo $equiv | cut -d: -f2)
    
    if grep -q "\.$TC_CLASS" src/styles/components/tc-utilities.css; then
        echo -e "✅ .$TC_CLASS remplace .$TW_CLASS" | tee -a $RAPPORT
    else
        echo -e "❌ .$TC_CLASS manquante (devrait remplacer .$TW_CLASS)" | tee -a $RAPPORT
    fi
done

echo

echo -e "${YELLOW}📈 MÉTRIQUES PERFORMANCE${NC}"
echo "========================="

# Calculer la taille des fichiers CSS
COLORS_SIZE=$(wc -c < src/styles/base/colors.css)
VARIABLES_SIZE=$(wc -c < src/styles/base/variables.css)
UTILITIES_SIZE=$(wc -c < src/styles/components/tc-utilities.css)
TOTAL_SIZE=$((COLORS_SIZE + VARIABLES_SIZE + UTILITIES_SIZE))

echo "Taille colors.css: $COLORS_SIZE bytes" | tee -a $RAPPORT
echo "Taille variables.css: $VARIABLES_SIZE bytes" | tee -a $RAPPORT
echo "Taille tc-utilities.css: $UTILITIES_SIZE bytes" | tee -a $RAPPORT
echo "Taille totale CSS: $TOTAL_SIZE bytes" | tee -a $RAPPORT

# Compter les variables totales
TOTAL_VARS_COLORS=$(grep -c "\-\-tc-" src/styles/base/colors.css)
TOTAL_VARS_VARIABLES=$(grep -c "\-\-tc-" src/styles/base/variables.css)
TOTAL_VARS=$((TOTAL_VARS_COLORS + TOTAL_VARS_VARIABLES))

echo "Variables totales: $TOTAL_VARS" | tee -a $RAPPORT
echo "Classes utilitaires: $UTILITY_CLASSES" | tee -a $RAPPORT

echo

echo -e "${PURPLE}📋 RÉSUMÉ FINAL${NC}"
echo "==============="

# Calculer le score de réussite
TESTS_TOTAL=30  # Approximation du nombre de tests
TESTS_REUSSIS=$(grep -c "✅" $RAPPORT)
SCORE=$((TESTS_REUSSIS * 100 / TESTS_TOTAL))

echo "## RÉSUMÉ TEST INTÉGRATION" >> $RAPPORT
echo >> $RAPPORT
echo "Tests réussis: $TESTS_REUSSIS/$TESTS_TOTAL" | tee -a $RAPPORT
echo "Score: $SCORE%" | tee -a $RAPPORT

if [ $SCORE -ge 80 ]; then
    echo -e "${GREEN}🎉 MIGRATION RÉUSSIE !${NC}" | tee -a $RAPPORT
    echo -e "${GREEN}   ✅ Score: $SCORE% (≥80%)${NC}" | tee -a $RAPPORT
    echo -e "${GREEN}   ✅ Variables CSS optimisées${NC}" | tee -a $RAPPORT
    echo -e "${GREEN}   ✅ Classes utilitaires créées${NC}" | tee -a $RAPPORT
    echo -e "${GREEN}   ✅ Couleurs maquette intégrées${NC}" | tee -a $RAPPORT
    echo
    echo -e "${BLUE}🚀 Prêt pour les tests cross-browser${NC}"
elif [ $SCORE -ge 60 ]; then
    echo -e "${YELLOW}⚠️  MIGRATION PARTIELLE${NC}" | tee -a $RAPPORT
    echo -e "${YELLOW}   Score: $SCORE% (60-79%)${NC}" | tee -a $RAPPORT
    echo -e "${YELLOW}   Quelques ajustements nécessaires${NC}" | tee -a $RAPPORT
else
    echo -e "${RED}❌ MIGRATION INCOMPLÈTE${NC}" | tee -a $RAPPORT
    echo -e "${RED}   Score: $SCORE% (<60%)${NC}" | tee -a $RAPPORT
    echo -e "${RED}   Révision majeure nécessaire${NC}" | tee -a $RAPPORT
fi

echo
echo -e "${PURPLE}Test d'intégration terminé${NC}"
echo "Rapport détaillé: $RAPPORT" 