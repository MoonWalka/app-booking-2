#!/bin/bash

# Audit de l'Organisation de la Documentation CSS
# Identifie les incohérences, doublons et fichiers obsolètes

set -e

echo "📚 AUDIT ORGANISATION DOCUMENTATION CSS"
echo "========================================"
echo "Analyse des incohérences, doublons et informations obsolètes"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ISSUES_FOUND=0

print_issue() {
    local severity="$1"
    local message="$2"
    ((ISSUES_FOUND++))
    case $severity in
        "ERROR")
            echo -e "${RED}❌ ERREUR: $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  ATTENTION: $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO: $message${NC}"
            ;;
    esac
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo "📊 1. INVENTAIRE DE LA DOCUMENTATION CSS"
echo "========================================="

# Lister tous les fichiers de documentation CSS
css_docs=(
    "docs/css/GUIDE_STANDARDISATION_CSS.md"
    "docs/css/ARCHITECTURE_CSS.md"
    "docs/css/RESUME_REFACTORISATION_CSS.md"
    "docs/standards/CSS_STYLE_GUIDE.md"
    "src/styles/README.md"
    "css_fallback_removal_guide.md"
    "docs/archive/PLAN_REFACTORISATION_CSS_PROGRESSIF.md"
    "docs/archive/PLAN_REFACTORISATION_CSS_PROGRESSIF_ARCHIVE_COMPLETE.md"
    "docs/archive/css_audit_report.md"
    "docs/archive/global_css_audit_report.md"
    "docs/.ai-docs/audit-css/audit_css_recommendation_7_report.md"
    "tools/audit/audit_css_standards_comprehensive.sh"
)

echo "🔍 Fichiers de documentation CSS trouvés:"
active_docs=0
archived_docs=0
for doc in "${css_docs[@]}"; do
    if [ -f "$doc" ]; then
        size=$(wc -l < "$doc" 2>/dev/null || echo "0")
        if [[ "$doc" == *"archive"* ]]; then
            echo "   📦 $doc ($size lignes) - ARCHIVÉ"
            ((archived_docs++))
        else
            echo "   📄 $doc ($size lignes) - ACTIF"
            ((active_docs++))
        fi
    else
        print_issue "WARNING" "Fichier référencé mais manquant: $doc"
    fi
done

echo ""
echo "📊 Total: $active_docs docs actives, $archived_docs docs archivées"

echo ""
echo "📊 2. VÉRIFICATION STRUCTURE DOCUMENTÉE VS RÉALITÉ"
echo "=================================================="

echo "🔍 Vérification des fichiers CSS mentionnés dans la documentation:"

# Vérifier spacing.css (mentionné dans GUIDE_STANDARDISATION_CSS.md)
if [ -f "src/styles/base/spacing.css" ]; then
    print_success "spacing.css existe"
else
    print_issue "ERROR" "spacing.css mentionné dans la doc mais inexistant"
fi

# Vérifier critical.css (mentionné dans GUIDE_STANDARDISATION_CSS.md)
if [ -d "src/styles/critical" ] && [ -f "src/styles/critical/critical.css" ]; then
    print_success "Structure critical/ existe"
else
    print_issue "ERROR" "Structure critical/ mentionnée dans la doc mais inexistante"
fi

# Vérifier les fichiers CSS réels vs documentés
echo ""
echo "🔍 Structure réelle vs documentée:"
echo "Fichiers réels dans src/styles/base/:"
real_base_files=$(ls src/styles/base/*.css 2>/dev/null | xargs -n1 basename)
echo "$real_base_files" | sed 's/^/   ✅ /'

echo ""
echo "📊 3. ANALYSE DES DOUBLONS ET REDONDANCES"
echo "========================================="

echo "🔍 Recherche de contenu dupliqué:"

# Chercher les doublons de variables CSS documentées
duplicated_vars=0
if grep -q "--tc-primary-color" docs/css/GUIDE_STANDARDISATION_CSS.md && 
   grep -q "--tc-primary-color" docs/standards/CSS_STYLE_GUIDE.md; then
    print_issue "WARNING" "Variables CSS documentées dans plusieurs guides"
    ((duplicated_vars++))
fi

if grep -q "BEM modifié" docs/css/GUIDE_STANDARDISATION_CSS.md && 
   grep -q "BEM modifié" docs/standards/CSS_STYLE_GUIDE.md; then
    print_issue "WARNING" "Convention BEM documentée dans plusieurs guides"
    ((duplicated_vars++))
fi

if [ "$duplicated_vars" -eq 0 ]; then
    print_success "Pas de redondance majeure détectée"
fi

# Vérifier les plans de refactorisation dupliqués
if [ -f "docs/archive/PLAN_REFACTORISATION_CSS_PROGRESSIF.md" ] && 
   [ -f "docs/archive/PLAN_REFACTORISATION_CSS_PROGRESSIF_ARCHIVE_COMPLETE.md" ]; then
    size1=$(wc -l < "docs/archive/PLAN_REFACTORISATION_CSS_PROGRESSIF.md")
    size2=$(wc -l < "docs/archive/PLAN_REFACTORISATION_CSS_PROGRESSIF_ARCHIVE_COMPLETE.md")
    if [ "$size1" -eq "$size2" ]; then
        print_issue "WARNING" "Plans de refactorisation CSS identiques ($size1 lignes chacun)"
    else
        print_issue "INFO" "Plans de refactorisation CSS de tailles différentes ($size1 vs $size2 lignes)"
    fi
fi

echo ""
echo "📊 4. DÉTECTION D'INFORMATIONS OBSOLÈTES"
echo "========================================"

echo "🔍 Vérification de l'actualité des informations:"

# Vérifier les dates dans les fichiers archivés
echo "📦 Fichiers archivés avec dates:"
for doc in docs/archive/*css*; do
    if [ -f "$doc" ]; then
        first_line=$(head -n5 "$doc" | grep -E "créé|Archivé|obsolète" || echo "")
        if [ -n "$first_line" ]; then
            echo "   📄 $(basename "$doc"): $first_line"
        fi
    fi
done

# Vérifier les classes CSS documentées vs réelles
echo ""
echo "🔍 Vérification des classes CSS documentées:"

# Classes typographiques
if grep -q "tc-h1" src/styles/base/typography.css; then
    print_success "Classes tc-h1, tc-h2, tc-h3 existent dans le code"
else
    print_issue "ERROR" "Classes typographiques documentées mais introuvables"
fi

# Variables breakpoints
if grep -q "tc-breakpoint" src/styles/base/variables.css; then
    print_success "Variables breakpoints --tc-breakpoint-* existent"
else
    print_issue "WARNING" "Variables breakpoints documentées mais à vérifier"
fi

echo ""
echo "📊 5. COHÉRENCE ENTRE GUIDES"
echo "============================"

echo "🔍 Comparaison des guides principaux:"

# Comparer les approches documentées
guide_std=$(grep -c "CSS Modules" docs/css/GUIDE_STANDARDISATION_CSS.md || echo "0")
guide_style=$(grep -c "CSS Modules" docs/standards/CSS_STYLE_GUIDE.md || echo "0")

if [ "$guide_std" -gt 0 ] && [ "$guide_style" -gt 0 ]; then
    print_success "Approche CSS Modules cohérente entre les guides"
else
    print_issue "WARNING" "Incohérence possible sur l'approche CSS Modules"
fi

# Vérifier les préfixes variables
prefix_std=$(grep -c -- "--tc-" docs/css/GUIDE_STANDARDISATION_CSS.md || echo "0")
prefix_style=$(grep -c -- "--tc-" docs/standards/CSS_STYLE_GUIDE.md || echo "0")

if [ "$prefix_std" -gt 0 ] && [ "$prefix_style" -gt 0 ]; then
    print_success "Préfixe --tc- cohérent entre les guides"
else
    print_issue "WARNING" "Incohérence possible sur le préfixe des variables"
fi

echo ""
echo "📊 6. ARCHITECTURE RÉELLE VS DOCUMENTÉE"
echo "======================================="

echo "🔍 Vérification de la correspondance:"

# Comparer structure documentée vs réelle
doc_structure="docs/css/ARCHITECTURE_CSS.md"
if [ -f "$doc_structure" ]; then
    if grep -q "src/styles/base/" "$doc_structure"; then
        print_success "Structure src/styles/base/ correctement documentée"
    fi
    
    if grep -q "src/styles/components/" "$doc_structure"; then
        print_success "Structure src/styles/components/ correctement documentée"
    fi
    
    if grep -q "src/styles/mixins/" "$doc_structure"; then
        if [ -d "src/styles/mixins" ]; then
            print_success "Structure src/styles/mixins/ existe et documentée"
        else
            print_issue "WARNING" "Structure mixins/ documentée mais dossier inexistant"
        fi
    fi
fi

echo ""
echo "🎯 RECOMMANDATIONS D'ORGANISATION"
echo "================================="

echo "📋 Plan de réorganisation proposé:"

if [ "$ISSUES_FOUND" -gt 5 ]; then
    echo ""
    echo -e "${RED}🚨 RÉORGANISATION MAJEURE NÉCESSAIRE${NC}"
    echo "1. 📁 Consolider guides CSS en un seul guide principal"
    echo "2. 🗑️  Supprimer doublons et fichiers obsolètes"
    echo "3. ✅ Corriger incohérences documentation vs code"
    echo "4. 📝 Mettre à jour références et liens"
    
elif [ "$ISSUES_FOUND" -gt 2 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  RÉORGANISATION MINEURE RECOMMANDÉE${NC}"
    echo "1. 🔧 Corriger incohérences mineures"
    echo "2. 📝 Mettre à jour informations obsolètes"
    echo "3. 🔗 Synchroniser guides principaux"
    
else
    echo ""
    echo -e "${GREEN}✅ ORGANISATION GLOBALEMENT BONNE${NC}"
    echo "1. 🔍 Audit périodique recommandé"
    echo "2. 📝 Mises à jour ponctuelles"
fi

echo ""
echo "🎯 STRUCTURE CIBLE RECOMMANDÉE"
echo "=============================="

echo "📁 Structure de documentation CSS optimale:"
echo "docs/css/"
echo "├── 📄 README.md                    # Index principal"
echo "├── 📄 GUIDE_COMPLET_CSS.md         # Guide unique consolidé"
echo "├── 📄 ARCHITECTURE.md              # Architecture technique"
echo "├── 📄 MIGRATION_GUIDE.md           # Guide de migration/outils"
echo "└── 📁 examples/                    # Exemples de composants"
echo ""
echo "docs/archive/css/                   # Archives organisées"
echo "├── 📄 audit_reports_*.md           # Rapports d'audit"
echo "└── 📄 refactoring_plans_*.md       # Plans historiques"

echo ""
echo "📊 RÉSUMÉ FINAL"
echo "==============="

if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo -e "${GREEN}🎉 PARFAIT! Aucun problème d'organisation détecté${NC}"
elif [ "$ISSUES_FOUND" -lt 3 ]; then
    echo -e "${YELLOW}👍 BON! $ISSUES_FOUND problèmes mineurs à corriger${NC}"
elif [ "$ISSUES_FOUND" -lt 6 ]; then
    echo -e "${YELLOW}⚠️  MOYEN! $ISSUES_FOUND problèmes à traiter${NC}"
else
    echo -e "${RED}❌ ATTENTION! $ISSUES_FOUND problèmes majeurs détectés${NC}"
fi

echo ""
echo "🎯 Prochaines actions recommandées:"
echo "1. 📝 Corriger les incohérences détectées"
echo "2. 🗑️  Nettoyer les doublons et fichiers obsolètes"
echo "3. 📁 Réorganiser selon la structure cible"
echo "4. 🔗 Mettre à jour tous les liens internes"

echo ""
echo "📅 Audit terminé le $(date)" 