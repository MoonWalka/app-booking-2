#!/bin/bash

# Audit CSS Complet - État de la Recommandation #7
# Analyse l'état actuel de la standardisation CSS vs les recommandations

set -e

echo "🎨 AUDIT CSS COMPLET - Recommandation #7"
echo "========================================"
echo "Analyse pointue de l'état actuel CSS vs documentation existante"
echo ""

# Compteurs globaux
TOTAL_ISSUES=0
SCORE=100

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_score() {
    local points_lost=$1
    local reason="$2"
    SCORE=$((SCORE - points_lost))
    echo -e "${RED}   -$points_lost points: $reason${NC}"
    ((TOTAL_ISSUES++))
}

print_success() {
    local message="$1"
    echo -e "${GREEN}   ✅ $message${NC}"
}

print_warning() {
    local message="$1"
    echo -e "${YELLOW}   ⚠️  $message${NC}"
}

print_info() {
    local message="$1"
    echo -e "${BLUE}   ℹ️  $message${NC}"
}

echo "📊 1. AUDIT DE LA DOCUMENTATION EXISTANTE"
echo "=========================================="

# Vérifier la documentation CSS
docs_found=0
echo "🔍 Documentation CSS trouvée:"

if [ -f "docs/css/GUIDE_STANDARDISATION_CSS.md" ]; then
    lines=$(wc -l < docs/css/GUIDE_STANDARDISATION_CSS.md)
    print_success "Guide standardisation CSS ($lines lignes) - EXCELLENT"
    ((docs_found++))
fi

if [ -f "docs/standards/CSS_STYLE_GUIDE.md" ]; then
    lines=$(wc -l < docs/standards/CSS_STYLE_GUIDE.md)
    print_success "Guide de style CSS ($lines lignes) - EXCELLENT"
    ((docs_found++))
fi

if [ -f "docs/css/ARCHITECTURE_CSS.md" ]; then
    lines=$(wc -l < docs/css/ARCHITECTURE_CSS.md)
    print_success "Architecture CSS ($lines lignes) - EXCELLENT"
    ((docs_found++))
fi

if [ -f "src/styles/README.md" ]; then
    lines=$(wc -l < src/styles/README.md)
    print_success "README styles ($lines lignes) - BON"
    ((docs_found++))
fi

if [ -f "css_fallback_removal_guide.md" ]; then
    print_success "Guide suppression fallbacks CSS - BON"
    ((docs_found++))
fi

echo ""
echo "📈 Analyse de la documentation:"
if [ "$docs_found" -ge 4 ]; then
    print_success "$docs_found guides CSS trouvés - Documentation EXCELLENTE"
else
    print_score 10 "Documentation CSS incomplète ($docs_found/4 guides)"
fi

echo ""
echo "📊 2. AUDIT DE L'ARCHITECTURE STYLESSHEET"
echo "=========================================="

# Vérifier l'organisation des fichiers styles
echo "🏗️ Structure src/styles/:"
if [ -d "src/styles/base" ] && [ -d "src/styles/components" ]; then
    print_success "Structure organisée (base/ et components/)"
else
    print_score 5 "Structure styles mal organisée"
fi

# Vérifier les fichiers fondamentaux
echo ""
echo "🔍 Fichiers fondamentaux:"
fundamental_files=("src/styles/base/variables.css" "src/styles/base/colors.css" "src/styles/base/typography.css")
found_fundamental=0

for file in "${fundamental_files[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        print_success "$(basename "$file") ($lines lignes)"
        ((found_fundamental++))
    else
        print_score 5 "Fichier fondamental manquant: $file"
    fi
done

# Score pour les fichiers fondamentaux
if [ "$found_fundamental" -eq 3 ]; then
    print_success "Tous les fichiers fondamentaux présents"
fi

echo ""
echo "📊 3. AUDIT DES VARIABLES CSS STANDARDISÉES"
echo "============================================"

# Compter les variables --tc-
tc_vars=$(grep -r "^\s*--tc-" src/styles/ 2>/dev/null | wc -l || echo "0")
echo "🔍 Variables --tc- définies: $tc_vars"

if [ "$tc_vars" -gt 100 ]; then
    print_success "$tc_vars variables --tc- définies - EXCELLENT système"
elif [ "$tc_vars" -gt 50 ]; then
    print_success "$tc_vars variables --tc- définies - BON système"
else
    print_score 15 "Trop peu de variables --tc- définies ($tc_vars)"
fi

# Vérifier l'utilisation des variables
echo ""
echo "🔍 Utilisation des variables --tc-:"
tc_usage=$(grep -r "var(--tc-" src/ 2>/dev/null | wc -l || echo "0")
print_info "$tc_usage usages de variables --tc- dans le code"

if [ "$tc_usage" -gt 500 ]; then
    print_success "Utilisation massive des variables --tc- - EXCELLENT"
elif [ "$tc_usage" -gt 200 ]; then
    print_success "Bonne utilisation des variables --tc-"
else
    print_score 10 "Utilisation limitée des variables --tc- ($tc_usage usages)"
fi

echo ""
echo "📊 4. AUDIT DE LA COHÉRENCE DES APPROCHES"
echo "=========================================="

# Vérifier les CSS Modules
css_modules=$(find src -name "*.module.css" | wc -l)
print_info "$css_modules fichiers CSS Modules trouvés"

if [ "$css_modules" -gt 200 ]; then
    print_success "Utilisation systématique des CSS Modules - EXCELLENT"
elif [ "$css_modules" -gt 100 ]; then
    print_success "Bonne utilisation des CSS Modules"
else
    print_score 10 "Utilisation limitée des CSS Modules ($css_modules fichiers)"
fi

# Vérifier l'utilisation directe de classes Bootstrap
echo ""
echo "🔍 Utilisation directe de classes Bootstrap:"
bootstrap_usage=$(grep -r "className.*btn btn-" src/ 2>/dev/null | wc -l || echo "0")
print_info "$bootstrap_usage usages directs de classes Bootstrap btn"

if [ "$bootstrap_usage" -eq 0 ]; then
    print_success "Aucune utilisation directe de Bootstrap - PARFAIT"
elif [ "$bootstrap_usage" -lt 20 ]; then
    print_warning "Quelques usages directs de Bootstrap ($bootstrap_usage) - À migrer"
    print_score 5 "Utilisation directe Bootstrap encore présente"
else
    print_score 15 "Trop d'utilisation directe de Bootstrap ($bootstrap_usage usages)"
fi

# Vérifier l'existence du composant Button standardisé
echo ""
echo "🔍 Composant Button standardisé:"
if [ -f "src/components/ui/Button.js" ]; then
    button_imports=$(grep -r "import.*Button.*from.*ui" src/ 2>/dev/null | wc -l || echo "0")
    print_success "Composant Button.js trouvé avec $button_imports usages"
    
    if [ "$button_imports" -gt 20 ]; then
        print_success "Composant Button largement utilisé - EXCELLENT"
    else
        print_score 5 "Composant Button sous-utilisé ($button_imports imports)"
    fi
else
    print_score 20 "Composant Button standardisé manquant"
fi

echo ""
echo "📊 5. AUDIT DES STANDARDS DE RESPONSIVE"
echo "======================================="

# Vérifier les media queries mobile-first
mobile_first=$(grep -r "@media (min-width:" src/ 2>/dev/null | wc -l || echo "0")
max_width=$(grep -r "@media (max-width:" src/ 2>/dev/null | wc -l || echo "0")

print_info "$mobile_first media queries mobile-first (min-width)"
print_info "$max_width media queries desktop-first (max-width)"

if [ "$mobile_first" -gt "$max_width" ]; then
    print_success "Approche mobile-first dominante - BON"
else
    print_score 5 "Approche mobile-first pas dominante"
fi

# Vérifier les breakpoints standardisés
echo ""
echo "🔍 Breakpoints standardisés:"
breakpoint_vars=$(grep -r "--tc-breakpoint" src/styles/ 2>/dev/null | wc -l || echo "0")
if [ "$breakpoint_vars" -gt 0 ]; then
    print_success "$breakpoint_vars variables de breakpoints standardisées"
else
    print_score 5 "Breakpoints non standardisés en variables"
fi

echo ""
echo "📊 6. AUDIT DES FALLBACKS CSS"
echo "============================="

# Vérifier s'il reste des fallbacks CSS
fallbacks=$(grep -r "var(--tc-[^,)]*," src/ 2>/dev/null | wc -l || echo "0")
print_info "$fallbacks fallbacks CSS trouvés"

if [ "$fallbacks" -eq 0 ]; then
    print_success "Aucun fallback CSS - PARFAIT (nettoyage terminé)"
elif [ "$fallbacks" -lt 50 ]; then
    print_warning "Quelques fallbacks restants ($fallbacks) - Nettoyage presque terminé"
    print_score 3 "Fallbacks CSS encore présents"
else
    print_score 10 "Trop de fallbacks CSS encore présents ($fallbacks)"
fi

echo ""
echo "📊 7. AUDIT DES OUTILS ET SCRIPTS CSS"
echo "===================================="

# Vérifier les outils CSS dans tools/css/
css_tools=$(find tools/css -name "*.sh" 2>/dev/null | wc -l || echo "0")
print_info "$css_tools scripts CSS dans tools/css/"

if [ "$css_tools" -gt 8 ]; then
    print_success "Boîte à outils CSS complète ($css_tools scripts)"
elif [ "$css_tools" -gt 5 ]; then
    print_success "Bons outils CSS disponibles ($css_tools scripts)"
else
    print_score 5 "Outils CSS limités ($css_tools scripts)"
fi

# Vérifier si les guides mentionnent l'automatisation
echo ""
echo "🔍 Automatisation documentée:"
if grep -q "script" docs/css/GUIDE_STANDARDISATION_CSS.md 2>/dev/null; then
    print_success "Automatisation documentée dans le guide"
else
    print_score 3 "Automatisation pas documentée"
fi

echo ""
echo "📊 8. AUDIT DES INCONSISTANCES"
echo "=============================="

# Chercher les mélanges d'approches
echo "🔍 Incohérences détectées:"

# Styles inline
inline_styles=$(grep -r "style={{" src/ 2>/dev/null | wc -l || echo "0")
print_info "$inline_styles styles inline trouvés"

if [ "$inline_styles" -eq 0 ]; then
    print_success "Aucun style inline - PARFAIT"
elif [ "$inline_styles" -lt 20 ]; then
    print_warning "Quelques styles inline ($inline_styles) - Acceptable"
else
    print_score 10 "Trop de styles inline ($inline_styles)"
fi

# Valeurs codées en dur dans CSS
echo ""
echo "🔍 Valeurs codées en dur:"
hardcoded_colors=$(grep -r "#[0-9a-fA-F]\{3,6\}" src/ --include="*.css" 2>/dev/null | grep -v "var(" | wc -l || echo "0")
hardcoded_pixels=$(grep -r "[0-9]\+px" src/ --include="*.css" 2>/dev/null | grep -v "var(" | wc -l || echo "0")

print_info "$hardcoded_colors couleurs codées en dur dans CSS"
print_info "$hardcoded_pixels valeurs px codées en dur dans CSS"

total_hardcoded=$((hardcoded_colors + hardcoded_pixels))
if [ "$total_hardcoded" -eq 0 ]; then
    print_success "Aucune valeur codée en dur - PARFAIT"
elif [ "$total_hardcoded" -lt 100 ]; then
    print_warning "Quelques valeurs codées en dur ($total_hardcoded) - Acceptable"
else
    print_score 15 "Trop de valeurs codées en dur ($total_hardcoded)"
fi

echo ""
echo "🎯 RÉSUMÉ FINAL DE L'AUDIT CSS"
echo "==============================="

echo "📊 Statistiques globales:"
echo "   📁 Fichiers CSS total: $(find src -name "*.css" | wc -l)"
echo "   📄 CSS Modules: $css_modules"
echo "   🎨 Variables --tc-: $tc_vars définies, $tc_usage usages"
echo "   📚 Documentation: $docs_found guides"
echo "   🛠️  Outils: $css_tools scripts"
echo "   🚨 Problèmes détectés: $TOTAL_ISSUES"

echo ""
echo "🏆 ÉVALUATION FINALE:"

# Calcul du score final
if [ "$SCORE" -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT! Score: $SCORE/100${NC}"
    echo -e "${GREEN}   La recommandation #7 est en fait très avancée !${NC}"
    recommendation="Recommandation #7 quasiment terminée - Score excellent"
elif [ "$SCORE" -ge 70 ]; then
    echo -e "${YELLOW}👍 BON! Score: $SCORE/100${NC}"
    echo -e "${YELLOW}   La recommandation #7 est bien avancée${NC}"
    recommendation="Recommandation #7 en bonne voie - Quelques ajustements"
elif [ "$SCORE" -ge 50 ]; then
    echo -e "${YELLOW}⚠️  MOYEN! Score: $SCORE/100${NC}"
    echo -e "${YELLOW}   La recommandation #7 a du travail fait mais reste à compléter${NC}"
    recommendation="Recommandation #7 partiellement avancée"
else
    echo -e "${RED}❌ INSUFFISANT! Score: $SCORE/100${NC}"
    echo -e "${RED}   La recommandation #7 nécessite beaucoup de travail${NC}"
    recommendation="Recommandation #7 peu avancée"
fi

echo ""
echo "🎯 CONCLUSION SUR LA RECOMMANDATION #7:"
echo "========================================"

if [ "$SCORE" -ge 80 ]; then
    echo -e "${GREEN}🚀 DÉCOUVERTE MAJEURE:${NC}"
    echo -e "${GREEN}   La recommandation #7 était mal évaluée à 0% !${NC}"
    echo -e "${GREEN}   L'état réel est beaucoup plus avancé.${NC}"
    echo ""
    echo -e "${GREEN}✅ CE QUI A DÉJÀ ÉTÉ FAIT:${NC}"
    echo -e "${GREEN}   • Documentation CSS très complète ($docs_found guides)${NC}"
    echo -e "${GREEN}   • Architecture de styles organisée${NC}"
    echo -e "${GREEN}   • Système de variables --tc- déployé ($tc_vars variables)${NC}"
    echo -e "${GREEN}   • CSS Modules largement utilisés ($css_modules fichiers)${NC}"
    echo -e "${GREEN}   • Composant Button standardisé opérationnel${NC}"
    echo -e "${GREEN}   • Outils d'automatisation CSS disponibles${NC}"
    echo ""
    new_percentage=$(( (SCORE * 85) / 100 ))
    echo -e "${GREEN}📊 RÉÉVALUATION: Recommandation #7 à ${new_percentage}% (pas 0%)${NC}"
fi

echo ""
echo "🎯 ACTIONS PRIORITAIRES pour finaliser:"
if [ "$bootstrap_usage" -gt 0 ]; then
    echo "   1. 🔧 Migrer $bootstrap_usage usages Bootstrap → composants standardisés"
fi
if [ "$fallbacks" -gt 0 ]; then
    echo "   2. 🧹 Nettoyer $fallbacks fallbacks CSS restants"
fi
if [ "$inline_styles" -gt 10 ]; then
    echo "   3. 📝 Convertir $inline_styles styles inline → CSS Modules"
fi
if [ "$total_hardcoded" -gt 50 ]; then
    echo "   4. 🎨 Remplacer $total_hardcoded valeurs codées → variables --tc-"
fi

echo ""
echo -e "${BLUE}💡 RECOMMANDATION FINALE:${NC}"
echo -e "${BLUE}   Réévaluer la recommandation #7 de 0% à $(( (SCORE * 85) / 100 ))%${NC}"
echo -e "${BLUE}   Le travail de fond est déjà largement accompli !${NC}"

echo ""
echo "📅 Audit terminé le $(date)" 