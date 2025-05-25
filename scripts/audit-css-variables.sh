#!/bin/bash

# 🔍 SCRIPT D'AUDIT CSS VARIABLES - TOURCRAFT
# Analyse complète du système de variables CSS fragmenté
# Usage: ./scripts/audit-css-variables.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AUDIT_DIR="audit"
SRC_DIR="src"
VARIABLES_FILE="src/styles/base/variables.css"

echo -e "${BLUE}🔍 AUDIT CSS VARIABLES TOURCRAFT${NC}"
echo "=================================="
echo

# Créer le dossier d'audit
mkdir -p $AUDIT_DIR

echo -e "${YELLOW}📊 EXTRACTION DES VARIABLES...${NC}"

# 1. Extraire toutes les variables utilisées
echo "1. Variables utilisées dans le code..."
find $SRC_DIR -name "*.css" -exec grep -o "\-\-tc-[a-zA-Z0-9-]*" {} \; | sort | uniq > $AUDIT_DIR/variables_used.txt
USED_COUNT=$(wc -l < $AUDIT_DIR/variables_used.txt)
echo "   ✅ $USED_COUNT variables trouvées"

# 2. Extraire les variables définies
echo "2. Variables définies dans variables.css..."
if [ -f "$VARIABLES_FILE" ]; then
    grep -o "\-\-tc-[a-zA-Z0-9-]*" $VARIABLES_FILE | sort | uniq > $AUDIT_DIR/variables_defined.txt
    DEFINED_COUNT=$(wc -l < $AUDIT_DIR/variables_defined.txt)
    echo "   ✅ $DEFINED_COUNT variables définies"
else
    echo "   ❌ Fichier variables.css introuvable"
    exit 1
fi

# 3. Variables manquantes
echo "3. Variables utilisées mais non définies..."
comm -23 $AUDIT_DIR/variables_used.txt $AUDIT_DIR/variables_defined.txt > $AUDIT_DIR/variables_missing.txt
MISSING_COUNT=$(wc -l < $AUDIT_DIR/variables_missing.txt)
echo "   ❌ $MISSING_COUNT variables manquantes"

# 4. Variables inutilisées
echo "4. Variables définies mais non utilisées..."
comm -13 $AUDIT_DIR/variables_used.txt $AUDIT_DIR/variables_defined.txt > $AUDIT_DIR/variables_unused.txt
UNUSED_COUNT=$(wc -l < $AUDIT_DIR/variables_unused.txt)
echo "   ⚠️  $UNUSED_COUNT variables inutilisées"

echo
echo -e "${YELLOW}📈 STATISTIQUES GLOBALES${NC}"
echo "========================"
echo "Variables utilisées:      $USED_COUNT"
echo "Variables définies:       $DEFINED_COUNT"
echo "Variables manquantes:     $MISSING_COUNT ($(echo "scale=1; $MISSING_COUNT * 100 / $USED_COUNT" | bc)%)"
echo "Variables inutilisées:    $UNUSED_COUNT"
echo

echo -e "${YELLOW}🏷️  CATÉGORISATION${NC}"
echo "=================="

# Catégoriser les variables utilisées
echo "COULEURS (color, bg, border):"
grep -E "(color|bg|border)" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/category_colors.txt
COLOR_COUNT=$(wc -l < $AUDIT_DIR/category_colors.txt)
echo "   $COLOR_COUNT variables ($(echo "scale=1; $COLOR_COUNT * 100 / $USED_COUNT" | bc)%)"

echo "ESPACEMENTS (spacing, margin, padding):"
grep -E "(spacing|margin|padding)" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/category_spacing.txt
SPACING_COUNT=$(wc -l < $AUDIT_DIR/category_spacing.txt)
echo "   $SPACING_COUNT variables ($(echo "scale=1; $SPACING_COUNT * 100 / $USED_COUNT" | bc)%)"

echo "TYPOGRAPHIE (font, text, line):"
grep -E "(font|text|line)" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/category_typography.txt
TYPO_COUNT=$(wc -l < $AUDIT_DIR/category_typography.txt)
echo "   $TYPO_COUNT variables ($(echo "scale=1; $TYPO_COUNT * 100 / $USED_COUNT" | bc)%)"

echo "EFFETS (shadow, transition, radius):"
grep -E "(shadow|transition|radius)" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/category_effects.txt
EFFECTS_COUNT=$(wc -l < $AUDIT_DIR/category_effects.txt)
echo "   $EFFECTS_COUNT variables ($(echo "scale=1; $EFFECTS_COUNT * 100 / $USED_COUNT" | bc)%)"

echo "LAYOUT (width, height, z-index):"
grep -E "(width|height|z-index)" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/category_layout.txt
LAYOUT_COUNT=$(wc -l < $AUDIT_DIR/category_layout.txt)
echo "   $LAYOUT_COUNT variables ($(echo "scale=1; $LAYOUT_COUNT * 100 / $USED_COUNT" | bc)%)"

echo
echo -e "${YELLOW}🔍 ANALYSE DES DOUBLONS${NC}"
echo "======================="

# Analyser les doublons potentiels
echo "Variables avec 'primary':"
grep "primary" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/duplicates_primary.txt
PRIMARY_COUNT=$(wc -l < $AUDIT_DIR/duplicates_primary.txt)
echo "   $PRIMARY_COUNT variables (doublons potentiels)"

echo "Variables avec 'bg':"
grep "bg" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/duplicates_bg.txt
BG_COUNT=$(wc -l < $AUDIT_DIR/duplicates_bg.txt)
echo "   $BG_COUNT variables (doublons potentiels)"

echo "Variables avec 'text':"
grep "text" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/duplicates_text.txt
TEXT_COUNT=$(wc -l < $AUDIT_DIR/duplicates_text.txt)
echo "   $TEXT_COUNT variables (doublons potentiels)"

echo
echo -e "${YELLOW}📍 LOCALISATION DES VARIABLES${NC}"
echo "============================="

# Analyser où sont définies les variables manquantes
echo "Recherche des variables manquantes dans d'autres fichiers..."
FOUND_ELSEWHERE=0
while IFS= read -r var; do
    if [ -n "$var" ]; then
        # Chercher dans tous les fichiers CSS sauf variables.css
        FOUND_FILES=$(find $SRC_DIR -name "*.css" ! -path "*variables.css" -exec grep -l "$var" {} \; 2>/dev/null | head -3)
        if [ -n "$FOUND_FILES" ]; then
            echo "   $var trouvée dans: $(echo $FOUND_FILES | tr '\n' ' ')"
            ((FOUND_ELSEWHERE++))
        fi
    fi
done < $AUDIT_DIR/variables_missing.txt

echo "   $FOUND_ELSEWHERE variables trouvées dans d'autres fichiers"

echo
echo -e "${YELLOW}⚠️  PROBLÈMES CRITIQUES${NC}"
echo "======================="

# Identifier les problèmes critiques
if [ $MISSING_COUNT -gt 100 ]; then
    echo -e "${RED}❌ CRITIQUE: Plus de 100 variables manquantes ($MISSING_COUNT)${NC}"
fi

if [ $COLOR_COUNT -gt 150 ]; then
    echo -e "${RED}❌ CRITIQUE: Trop de variables de couleurs ($COLOR_COUNT)${NC}"
fi

if [ $PRIMARY_COUNT -gt 10 ]; then
    echo -e "${YELLOW}⚠️  ATTENTION: Nombreuses variables 'primary' ($PRIMARY_COUNT)${NC}"
fi

echo
echo -e "${YELLOW}📋 RECOMMANDATIONS${NC}"
echo "=================="

echo "1. PRIORITÉ HAUTE:"
if [ $MISSING_COUNT -gt 50 ]; then
    echo "   - Consolider les $MISSING_COUNT variables manquantes"
fi
if [ $PRIMARY_COUNT -gt 5 ]; then
    echo "   - Standardiser les variables 'primary' ($PRIMARY_COUNT doublons)"
fi

echo "2. PRIORITÉ MOYENNE:"
if [ $COLOR_COUNT -gt 100 ]; then
    echo "   - Réduire les variables de couleurs ($COLOR_COUNT → ~80)"
fi
if [ $UNUSED_COUNT -gt 0 ]; then
    echo "   - Supprimer les $UNUSED_COUNT variables inutilisées"
fi

echo "3. OPTIMISATION:"
echo "   - Réduire le total de $USED_COUNT à ~200 variables"
echo "   - Standardiser la nomenclature"
echo "   - Créer un système de gouvernance"

echo
echo -e "${GREEN}✅ AUDIT TERMINÉ${NC}"
echo "================"
echo "Résultats sauvegardés dans le dossier: $AUDIT_DIR/"
echo
echo "Fichiers générés:"
echo "  - variables_used.txt      (toutes les variables utilisées)"
echo "  - variables_defined.txt   (variables définies)"
echo "  - variables_missing.txt   (variables manquantes)"
echo "  - variables_unused.txt    (variables inutilisées)"
echo "  - category_*.txt          (variables par catégorie)"
echo "  - duplicates_*.txt        (doublons potentiels)"
echo
echo -e "${BLUE}Prochaine étape: Examiner les fichiers d'audit et planifier la consolidation${NC}" 