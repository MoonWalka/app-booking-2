#!/bin/bash

# 🔍 DÉTECTION DES DOUBLONS CSS - TOURCRAFT
# Analyse avancée des variables CSS redondantes
# Usage: ./scripts/detect-duplicates.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
AUDIT_DIR="audit"
SRC_DIR="src"

echo -e "${PURPLE}🔍 DÉTECTION DES DOUBLONS CSS TOURCRAFT${NC}"
echo "========================================"
echo

# Vérifier que l'audit a été fait
if [ ! -f "$AUDIT_DIR/variables_used.txt" ]; then
    echo -e "${RED}❌ Erreur: Fichier d'audit introuvable${NC}"
    echo "Veuillez d'abord exécuter: ./scripts/audit-css-variables.sh"
    exit 1
fi

echo -e "${YELLOW}🔍 ANALYSE DES PATTERNS DE DOUBLONS${NC}"
echo "==================================="

# Fonction pour analyser un pattern
analyze_pattern() {
    local pattern=$1
    local description=$2
    local file_suffix=$3
    
    echo -e "\n${BLUE}$description:${NC}"
    grep -i "$pattern" $AUDIT_DIR/variables_used.txt > $AUDIT_DIR/duplicates_$file_suffix.txt 2>/dev/null || touch $AUDIT_DIR/duplicates_$file_suffix.txt
    local count=$(wc -l < $AUDIT_DIR/duplicates_$file_suffix.txt)
    
    if [ $count -gt 0 ]; then
        echo "   Trouvées: $count variables"
        
        # Afficher les premières variables pour analyse
        if [ $count -le 10 ]; then
            while IFS= read -r var; do
                echo "     - $var"
            done < $AUDIT_DIR/duplicates_$file_suffix.txt
        else
            echo "     Premières 10 variables:"
            head -10 $AUDIT_DIR/duplicates_$file_suffix.txt | while IFS= read -r var; do
                echo "     - $var"
            done
            echo "     ... et $(($count - 10)) autres"
        fi
        
        # Analyser les patterns spécifiques
        case $file_suffix in
            "primary")
                echo -e "   ${YELLOW}Recommandation: Standardiser sur --tc-primary${NC}"
                ;;
            "bg")
                echo -e "   ${YELLOW}Recommandation: Utiliser --tc-bg-* pour les fonds${NC}"
                ;;
            "text")
                echo -e "   ${YELLOW}Recommandation: Standardiser sur --tc-text-*${NC}"
                ;;
        esac
    else
        echo "   Aucune variable trouvée"
    fi
}

# Analyser différents patterns
analyze_pattern "primary" "Variables PRIMARY" "primary"
analyze_pattern "secondary" "Variables SECONDARY" "secondary"
analyze_pattern "bg" "Variables BACKGROUND" "bg"
analyze_pattern "text" "Variables TEXT" "text"
analyze_pattern "color" "Variables COLOR" "color"
analyze_pattern "font" "Variables FONT" "font"
analyze_pattern "spacing" "Variables SPACING" "spacing"
analyze_pattern "border" "Variables BORDER" "border"
analyze_pattern "shadow" "Variables SHADOW" "shadow"

echo
echo -e "${YELLOW}🎯 ANALYSE DES CONFLITS CRITIQUES${NC}"
echo "=================================="

# Détecter les conflits critiques (même concept, noms différents)
echo -e "\n${RED}CONFLITS CRITIQUES DÉTECTÉS:${NC}"

# Conflits PRIMARY
echo "1. Conflits PRIMARY:"
grep -E "(primary|Primary)" $AUDIT_DIR/variables_used.txt | grep -v "primary-" | head -5
echo

# Conflits BACKGROUND
echo "2. Conflits BACKGROUND:"
grep -E "(bg-|background)" $AUDIT_DIR/variables_used.txt | head -5
echo

# Conflits TEXT/COLOR
echo "3. Conflits TEXT/COLOR:"
grep -E "(text-color|color-text)" $AUDIT_DIR/variables_used.txt | head -5
echo

echo -e "${YELLOW}📊 STATISTIQUES DES DOUBLONS${NC}"
echo "============================="

# Calculer les statistiques
PRIMARY_COUNT=$(wc -l < $AUDIT_DIR/duplicates_primary.txt)
BG_COUNT=$(wc -l < $AUDIT_DIR/duplicates_bg.txt)
TEXT_COUNT=$(wc -l < $AUDIT_DIR/duplicates_text.txt)
COLOR_COUNT=$(wc -l < $AUDIT_DIR/duplicates_color.txt)
TOTAL_VARS=$(wc -l < $AUDIT_DIR/variables_used.txt)

echo "Variables PRIMARY:     $PRIMARY_COUNT"
echo "Variables BACKGROUND:  $BG_COUNT"
echo "Variables TEXT:        $TEXT_COUNT"
echo "Variables COLOR:       $COLOR_COUNT"
echo "Total variables:       $TOTAL_VARS"
echo

# Calculer le potentiel de réduction
POTENTIAL_REDUCTION=$((PRIMARY_COUNT / 3 + BG_COUNT / 4 + TEXT_COUNT / 3))
echo -e "${GREEN}Réduction potentielle: ~$POTENTIAL_REDUCTION variables${NC}"

echo
echo -e "${YELLOW}🛠️  PLAN DE CONSOLIDATION${NC}"
echo "=========================="

echo "1. PRIORITÉ IMMÉDIATE (Conflits critiques):"
if [ $PRIMARY_COUNT -gt 10 ]; then
    echo "   ❌ Consolider les $PRIMARY_COUNT variables PRIMARY → 3-4 variables"
fi
if [ $BG_COUNT -gt 20 ]; then
    echo "   ❌ Réorganiser les $BG_COUNT variables BACKGROUND → 10-15 variables"
fi

echo
echo "2. PRIORITÉ HAUTE (Standardisation):"
if [ $TEXT_COUNT -gt 15 ]; then
    echo "   ⚠️  Standardiser les $TEXT_COUNT variables TEXT → 8-10 variables"
fi
if [ $COLOR_COUNT -gt 50 ]; then
    echo "   ⚠️  Optimiser les $COLOR_COUNT variables COLOR → 30-40 variables"
fi

echo
echo "3. ACTIONS RECOMMANDÉES:"
echo "   - Créer un mapping des variables à consolider"
echo "   - Définir la nomenclature standard"
echo "   - Préparer les scripts de remplacement"
echo "   - Tester sur un composant pilote"

echo
echo -e "${YELLOW}📋 MAPPING PROPOSÉ${NC}"
echo "=================="

echo "VARIABLES PRIMARY (à consolider):"
echo "  --tc-primary-color     → --tc-primary"
echo "  --tc-color-primary     → --tc-primary"
echo "  --tc-primary           → --tc-primary (garder)"
echo "  --tc-primary-light     → --tc-primary-light"
echo "  --tc-primary-dark      → --tc-primary-dark"
echo

echo "VARIABLES BACKGROUND (à standardiser):"
echo "  --tc-bg-color          → --tc-bg-default"
echo "  --tc-background-color  → --tc-bg-default"
echo "  --tc-bg-light          → --tc-bg-light"
echo "  --tc-bg-card           → --tc-bg-card"
echo

echo "VARIABLES TEXT (à harmoniser):"
echo "  --tc-text-color        → --tc-text-default"
echo "  --tc-color-text        → --tc-text-default"
echo "  --tc-text-muted        → --tc-text-muted (garder)"
echo "  --tc-text-primary      → --tc-text-primary (garder)"

echo
echo -e "${GREEN}✅ ANALYSE DES DOUBLONS TERMINÉE${NC}"
echo "================================="
echo "Fichiers générés dans $AUDIT_DIR/:"
echo "  - duplicates_primary.txt"
echo "  - duplicates_bg.txt"
echo "  - duplicates_text.txt"
echo "  - duplicates_color.txt"
echo "  - duplicates_font.txt"
echo "  - duplicates_spacing.txt"
echo "  - duplicates_border.txt"
echo "  - duplicates_shadow.txt"
echo
echo -e "${BLUE}Prochaine étape: Créer le script de consolidation${NC}" 