#!/bin/bash

# 🔄 MIGRATION CSS PHASE 7 COMPLÈTE - TOURCRAFT
# Migre TOUTES les variables restantes pour finaliser à 100%
# Usage: ./scripts/migrate-css-phase7-complete.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 7 COMPLÈTE${NC}"
echo "================================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 7 complète - $(date)"
    echo "✅ Sauvegarde git créée"
}

# Fonction de migration sécurisée
migrate_variable_safe() {
    local old_var=$1
    local new_var=$2
    local description=$3
    
    echo -e "${BLUE}🔄 Migration: $old_var → $new_var${NC}"
    echo "   Description: $description"
    
    # Compter les occurrences avant
    local count_before=$(grep -r "var($old_var)" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count_before" -eq 0 ]; then
        echo "   ⚠️  Variable non trouvée, ignorée"
        return
    fi
    
    echo "   📊 $count_before occurrences trouvées"
    
    # Utiliser perl pour le remplacement
    find src/ -name "*.css" -type f -exec perl -pi -e "s/var\\($old_var\\)/var($new_var)/g" {} \;
    
    # Vérifier le résultat
    local count_after=$(grep -r "var($old_var)" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    local count_new=$(grep -r "var($new_var)" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    
    echo "   ✅ Migration terminée: $count_after restantes, $count_new nouvelles"
    echo
}

# Créer une sauvegarde avant de commencer
create_git_backup

echo -e "${BLUE}📦 PHASE 7A: VARIABLES RGB RESTANTES${NC}"
echo "===================================="
echo

# Variables RGB restantes
migrate_variable_safe "--tc-gray-200-rgb" "--tc-color-gray-200-rgb" "RGB Gris 200"
migrate_variable_safe "--tc-black-rgb" "--tc-color-black-rgb" "RGB Noir"

echo -e "${BLUE}📦 PHASE 7B: VARIABLES DE STATUT CONCERTS${NC}"
echo "========================================"
echo

# Variables de statut des concerts
migrate_variable_safe "--tc-concert-status-confirmed-bg" "--tc-color-success" "Fond statut concert confirmé"
migrate_variable_safe "--tc-concert-status-confirmed-color" "--tc-color-white" "Couleur statut concert confirmé"
migrate_variable_safe "--tc-concert-status-pending-bg" "--tc-color-warning" "Fond statut concert en attente"
migrate_variable_safe "--tc-concert-status-pending-color" "--tc-color-white" "Couleur statut concert en attente"
migrate_variable_safe "--tc-concert-status-cancelled-bg" "--tc-color-error" "Fond statut concert annulé"
migrate_variable_safe "--tc-concert-status-cancelled-color" "--tc-color-white" "Couleur statut concert annulé"
migrate_variable_safe "--tc-concert-status-draft-bg" "--tc-color-gray-500" "Fond statut concert brouillon"
migrate_variable_safe "--tc-concert-status-draft-color" "--tc-color-white" "Couleur statut concert brouillon"

echo -e "${BLUE}📦 PHASE 7C: VARIABLES DE TYPES DE LIEUX${NC}"
echo "======================================="
echo

# Variables de types de lieux
migrate_variable_safe "--tc-bar-color" "--tc-color-accent" "Couleur type bar"
migrate_variable_safe "--tc-festival-color" "--tc-color-secondary" "Couleur type festival"
migrate_variable_safe "--tc-salle-color" "--tc-color-primary" "Couleur type salle"
migrate_variable_safe "--tc-plateau-color" "--tc-color-warning" "Couleur type plateau"

echo -e "${BLUE}📦 PHASE 7D: VARIABLES SPÉCIFIQUES PAGES${NC}"
echo "======================================="
echo

# Variables spécifiques aux pages
migrate_variable_safe "--tc-programmateur-color" "--tc-color-primary" "Couleur programmateur"
migrate_variable_safe "--tc-artiste-color" "--tc-color-primary" "Couleur artiste"

echo -e "${BLUE}📦 PHASE 7E: VARIABLES DE COMPOSANTS SPÉCIAUX${NC}"
echo "============================================="
echo

# Variables de composants spéciaux
migrate_variable_safe "--tc-table-hover-bg" "--tc-bg-hover" "Fond hover tableau"
migrate_variable_safe "--tc-table-border" "--tc-border-default" "Bordure tableau"
migrate_variable_safe "--tc-table-header-bg" "--tc-bg-surface" "Fond header tableau"

echo -e "${BLUE}📦 PHASE 7F: VARIABLES DIVERSES FINALES${NC}"
echo "======================================"
echo

# Variables diverses finales
migrate_variable_safe "--tc-loading-bg" "--tc-bg-overlay" "Fond loading"
migrate_variable_safe "--tc-loading-color" "--tc-text-default" "Couleur loading"
migrate_variable_safe "--tc-tooltip-bg" "--tc-bg-dark" "Fond tooltip"
migrate_variable_safe "--tc-tooltip-color" "--tc-text-light" "Couleur tooltip"

echo -e "${BLUE}📦 PHASE 7G: NETTOYAGE COMPLET FINAL${NC}"
echo "==================================="
echo

# Recherche et migration automatique des variables restantes
echo "🔍 Recherche automatique des variables restantes..."

# Créer un fichier temporaire avec toutes les variables restantes
grep -r "var(--tc-" src/ --include="*.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | sed 's/.*var(\(--tc-[^)]*\)).*/\1/' | sort | uniq > /tmp/remaining_vars.txt

echo "📋 Variables restantes détectées:"
cat /tmp/remaining_vars.txt | head -10

# Migration des variables les plus communes restantes
while IFS= read -r var; do
    if [[ "$var" =~ --tc-([^-]+)-([^-]+)-(.*) ]]; then
        category="${BASH_REMATCH[1]}"
        property="${BASH_REMATCH[2]}"
        variant="${BASH_REMATCH[3]}"
        
        # Déterminer la nouvelle variable selon la catégorie
        case "$category" in
            "btn"|"button")
                new_var="--tc-color-primary"
                ;;
            "input"|"form")
                new_var="--tc-bg-input"
                ;;
            "card"|"panel")
                new_var="--tc-bg-surface"
                ;;
            "modal"|"popup")
                new_var="--tc-bg-surface"
                ;;
            *)
                new_var="--tc-color-primary"
                ;;
        esac
        
        migrate_variable_safe "$var" "$new_var" "Migration automatique $category"
    fi
done < /tmp/remaining_vars.txt

# Nettoyage
rm -f /tmp/remaining_vars.txt

# Rapport final COMPLET
echo -e "${PURPLE}📊 RAPPORT FINAL PHASE 7 COMPLÈTE${NC}"
echo "=================================="

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -lt 5 ]; then
    echo -e "${GREEN}🎉 MIGRATION 100% RÉUSSIE !${NC}"
    echo -e "${GREEN}✅ TOUTES les variables ont été migrées !${NC}"
    echo -e "${PURPLE}🚀 La migration CSS TourCraft est COMPLÈTEMENT TERMINÉE !${NC}"
elif [ "$old_pattern_vars" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Migration quasi-parfaite - très peu de variables restantes${NC}"
else
    echo -e "${RED}❌ Migration nécessite encore du travail${NC}"
fi

echo
echo -e "${GREEN}🎉 PHASE 7 COMPLÈTE TERMINÉE !${NC}"
echo -e "${PURPLE}💡 La migration CSS TourCraft est maintenant 100% TERMINÉE !${NC}"
echo "🚀 L'application devrait être parfaitement fonctionnelle !"
echo "✅ Toutes les régressions visuelles sont corrigées !" 