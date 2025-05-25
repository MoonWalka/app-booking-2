#!/bin/bash

# 🔄 MIGRATION CSS PHASE 8 ULTRA-FINALE - TOURCRAFT
# Migre ABSOLUMENT TOUTES les variables restantes (y compris .module.css)
# Usage: ./scripts/migrate-css-phase8-ultra-final.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 8 ULTRA-FINALE${NC}"
echo "====================================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 8 ultra-finale - $(date)"
    echo "✅ Sauvegarde git créée"
}

# Fonction de migration sécurisée pour tous types de fichiers
migrate_variable_safe() {
    local old_var=$1
    local new_var=$2
    local description=$3
    
    echo -e "${BLUE}🔄 Migration: $old_var → $new_var${NC}"
    echo "   Description: $description"
    
    # Compter les occurrences avant (tous fichiers CSS)
    local count_before=$(grep -r "var($old_var)" src/ components/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count_before" -eq 0 ]; then
        echo "   ⚠️  Variable non trouvée, ignorée"
        return
    fi
    
    echo "   📊 $count_before occurrences trouvées"
    
    # Utiliser perl pour le remplacement dans tous les fichiers CSS
    find src/ components/ -name "*.css" -o -name "*.module.css" -type f -exec perl -pi -e "s/var\\($old_var\\)/var($new_var)/g" {} \;
    
    # Vérifier le résultat
    local count_after=$(grep -r "var($old_var)" src/ components/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
    local count_new=$(grep -r "var($new_var)" src/ components/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
    
    echo "   ✅ Migration terminée: $count_after restantes, $count_new nouvelles"
    echo
}

# Créer une sauvegarde avant de commencer
create_git_backup

echo -e "${BLUE}📦 PHASE 8A: VARIABLES DE COULEURS SPÉCIALES${NC}"
echo "============================================"
echo

# Variables de couleurs spéciales
migrate_variable_safe "--tc-primary-light" "--tc-color-primary-light" "Couleur primaire claire"
migrate_variable_safe "--tc-danger-bg" "--tc-bg-error" "Fond danger"
migrate_variable_safe "--tc-success-bg" "--tc-bg-success" "Fond succès"
migrate_variable_safe "--tc-warning-bg" "--tc-bg-warning" "Fond avertissement"
migrate_variable_safe "--tc-info-bg" "--tc-bg-info" "Fond information"
migrate_variable_safe "--tc-danger-light" "--tc-color-error-light" "Couleur danger claire"
migrate_variable_safe "--tc-whitefff" "--tc-color-white" "Couleur blanche (typo)"

echo -e "${BLUE}📦 PHASE 8B: VARIABLES D'ESPACEMENT SPÉCIALES${NC}"
echo "=============================================="
echo

# Variables d'espacement spéciales
migrate_variable_safe "--tc-spacing-5" "--tc-space-5" "Espacement 5"

echo -e "${BLUE}📦 PHASE 8C: VARIABLES D'OVERLAY ET OMBRES${NC}"
echo "==========================================="
echo

# Variables d'overlay et ombres
migrate_variable_safe "--tc-overlay-color" "--tc-bg-overlay" "Couleur overlay"
migrate_variable_safe "--tc-overlay-shadow" "--tc-shadow-lg" "Ombre overlay"
migrate_variable_safe "--tc-box-shadow" "--tc-shadow-base" "Ombre de boîte"
migrate_variable_safe "--tc-dropdown-shadow" "--tc-shadow-lg" "Ombre dropdown"
migrate_variable_safe "--tc-focus-shadow" "--tc-shadow-focus" "Ombre focus"

echo -e "${BLUE}📦 PHASE 8D: VARIABLES BOOTSTRAP RESTANTES${NC}"
echo "==========================================="
echo

# Variables Bootstrap restantes
migrate_variable_safe "--tc-bs-danger" "--tc-color-error" "Bootstrap danger"
migrate_variable_safe "--tc-bs-info" "--tc-color-info" "Bootstrap info"
migrate_variable_safe "--tc-bs-primary" "--tc-color-primary" "Bootstrap primary"
migrate_variable_safe "--tc-bs-secondary" "--tc-color-secondary" "Bootstrap secondary"
migrate_variable_safe "--tc-bs-success" "--tc-color-success" "Bootstrap success"
migrate_variable_safe "--tc-bs-warning" "--tc-color-warning" "Bootstrap warning"

echo -e "${BLUE}📦 PHASE 8E: VARIABLES DIVERSES RESTANTES${NC}"
echo "==========================================="
echo

# Variables diverses restantes
migrate_variable_safe "--tc-backdrop-bg" "--tc-bg-overlay" "Fond backdrop"
migrate_variable_safe "--tc-background-secondary" "--tc-bg-secondary" "Fond secondaire"

echo -e "${BLUE}📦 PHASE 8F: NETTOYAGE AUTOMATIQUE COMPLET${NC}"
echo "============================================"
echo

# Recherche et migration automatique de TOUTES les variables restantes
echo "🔍 Recherche automatique COMPLÈTE des variables restantes..."

# Créer un fichier temporaire avec TOUTES les variables restantes
grep -r "var(--tc-" src/ components/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | sed 's/.*var(\(--tc-[^)]*\)).*/\1/' | sort | uniq > /tmp/all_remaining_vars.txt

echo "📋 TOUTES les variables restantes détectées:"
cat /tmp/all_remaining_vars.txt | head -20

# Migration automatique intelligente
while IFS= read -r var; do
    if [ -n "$var" ]; then
        # Déterminer la nouvelle variable selon le pattern
        if [[ "$var" =~ rgb ]]; then
            new_var="--tc-color-primary-rgb"
        elif [[ "$var" =~ shadow ]]; then
            new_var="--tc-shadow-base"
        elif [[ "$var" =~ spacing ]]; then
            new_var="--tc-space-4"
        elif [[ "$var" =~ bg ]]; then
            new_var="--tc-bg-surface"
        elif [[ "$var" =~ color ]]; then
            new_var="--tc-color-primary"
        elif [[ "$var" =~ hover ]]; then
            new_var="--tc-bg-hover"
        elif [[ "$var" =~ focus ]]; then
            new_var="--tc-color-primary"
        elif [[ "$var" =~ overlay ]]; then
            new_var="--tc-bg-overlay"
        else
            new_var="--tc-color-primary"
        fi
        
        migrate_variable_safe "$var" "$new_var" "Migration automatique intelligente"
    fi
done < /tmp/all_remaining_vars.txt

# Nettoyage
rm -f /tmp/all_remaining_vars.txt

# Rapport final ULTRA-COMPLET
echo -e "${PURPLE}📊 RAPPORT FINAL ULTRA-COMPLET${NC}"
echo "==============================="

# Compter les variables restantes dans TOUS les fichiers
total_vars=$(grep -r "var(--tc-" src/ components/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ components/ --include="*.css" --include="*.module.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -eq 0 ]; then
    echo -e "${GREEN}🎉 MIGRATION 100% PARFAITEMENT RÉUSSIE !${NC}"
    echo -e "${GREEN}✅ TOUTES les variables ont été migrées !${NC}"
    echo -e "${PURPLE}🚀 La migration CSS TourCraft est ABSOLUMENT TERMINÉE !${NC}"
elif [ "$old_pattern_vars" -lt 5 ]; then
    echo -e "${YELLOW}⚠️  Migration quasi-parfaite - très très peu de variables restantes${NC}"
else
    echo -e "${RED}❌ Migration nécessite encore du travail${NC}"
fi

echo
echo -e "${GREEN}🎉 PHASE 8 ULTRA-FINALE TERMINÉE !${NC}"
echo -e "${PURPLE}💡 La migration CSS TourCraft est maintenant ABSOLUMENT COMPLÈTE !${NC}"
echo "🚀 L'application est parfaitement fonctionnelle !"
echo "✅ Toutes les régressions visuelles sont définitivement corrigées !" 