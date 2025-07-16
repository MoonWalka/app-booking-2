#!/bin/bash

# 🔄 MIGRATION CSS PHASE 2 - TOURCRAFT
# Migre les variables de typographie, effets et couleurs de statut
# Usage: ./scripts/migrate-css-phase2.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 2${NC}"
echo "========================"
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 2 - $(date)"
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

echo -e "${BLUE}📦 PHASE 2A: TYPOGRAPHIE${NC}"
echo "========================"
echo

# Variables de typographie critiques
migrate_variable_safe "--tc-font-family-base" "--tc-font-sans" "Famille de police de base"
migrate_variable_safe "--tc-font-size-base" "--tc-font-size-base" "Taille de police de base (déjà correcte)"
migrate_variable_safe "--tc-font-size-xs" "--tc-font-size-xs" "Taille de police XS (déjà correcte)"
migrate_variable_safe "--tc-font-size-sm" "--tc-font-size-sm" "Taille de police SM (déjà correcte)"
migrate_variable_safe "--tc-font-size-lg" "--tc-font-size-lg" "Taille de police LG (déjà correcte)"
migrate_variable_safe "--tc-font-size-xl" "--tc-font-size-xl" "Taille de police XL (déjà correcte)"
migrate_variable_safe "--tc-font-size-xxl" "--tc-font-size-2xl" "Taille de police XXL"
migrate_variable_safe "--tc-line-height-base" "--tc-line-height-normal" "Hauteur de ligne de base"

echo -e "${BLUE}📦 PHASE 2B: EFFETS${NC}"
echo "=================="
echo

# Variables d'effets critiques
migrate_variable_safe "--tc-shadow-sm" "--tc-shadow-sm" "Ombre small (déjà correcte)"
migrate_variable_safe "--tc-shadow" "--tc-shadow-base" "Ombre de base"
migrate_variable_safe "--tc-shadow-lg" "--tc-shadow-lg" "Ombre large (déjà correcte)"
migrate_variable_safe "--tc-border-radius" "--tc-radius-base" "Border radius de base"
migrate_variable_safe "--tc-border-radius-sm" "--tc-radius-sm" "Border radius small"
migrate_variable_safe "--tc-border-radius-lg" "--tc-radius-lg" "Border radius large"
migrate_variable_safe "--tc-transition" "--tc-transition-base" "Transition de base"
migrate_variable_safe "--tc-transition-fast" "--tc-transition-fast" "Transition rapide (déjà correcte)"

echo -e "${BLUE}📦 PHASE 2C: COULEURS DE STATUT${NC}"
echo "==============================="
echo

# Variables de couleurs de statut
migrate_variable_safe "--tc-secondary-color" "--tc-color-secondary" "Couleur secondaire"
migrate_variable_safe "--tc-success-color" "--tc-color-success" "Couleur de succès"
migrate_variable_safe "--tc-warning-color" "--tc-color-warning" "Couleur d'avertissement"
migrate_variable_safe "--tc-error-color" "--tc-color-error" "Couleur d'erreur"
migrate_variable_safe "--tc-danger-color" "--tc-color-error" "Couleur de danger"
migrate_variable_safe "--tc-info-color" "--tc-color-info" "Couleur d'information"

# Variables de couleurs dérivées
migrate_variable_safe "--tc-secondary-dark" "--tc-color-secondary-dark" "Couleur secondaire foncée"
migrate_variable_safe "--tc-success-dark" "--tc-color-success-dark" "Couleur de succès foncée"
migrate_variable_safe "--tc-warning-dark" "--tc-color-warning-dark" "Couleur d'avertissement foncée"
migrate_variable_safe "--tc-danger-dark" "--tc-color-error-dark" "Couleur de danger foncée"
migrate_variable_safe "--tc-info-dark" "--tc-color-info-dark" "Couleur d'information foncée"

echo -e "${BLUE}📦 PHASE 2D: BOUTONS${NC}"
echo "==================="
echo

# Variables de boutons
migrate_variable_safe "--tc-btn-secondary-bg" "--tc-color-secondary" "Fond bouton secondaire"
migrate_variable_safe "--tc-btn-secondary-text" "--tc-text-light" "Texte bouton secondaire"
migrate_variable_safe "--tc-btn-secondary-border" "--tc-color-secondary" "Bordure bouton secondaire"
migrate_variable_safe "--tc-btn-primary-border" "--tc-color-primary" "Bordure bouton primaire"

echo -e "${BLUE}📦 PHASE 2E: VARIABLES SPÉCIALES${NC}"
echo "==============================="
echo

# Variables spéciales qui peuvent causer des problèmes
migrate_variable_safe "--tc-input-focus-shadow" "--tc-shadow-base" "Ombre focus input"
migrate_variable_safe "--tc-input-border" "--tc-border-default" "Bordure input"
migrate_variable_safe "--tc-input-focus-border" "--tc-color-primary" "Bordure focus input"
migrate_variable_safe "--tc-light-color" "--tc-text-light" "Couleur claire"
migrate_variable_safe "--tc-dark-color" "--tc-text-default" "Couleur foncée"

# Rapport final
echo -e "${PURPLE}📊 RAPPORT PHASE 2${NC}"
echo "=================="

# Compter les variables restantes
local total_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
local old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | grep -E "(font-family-base|font-size-xxl|shadow[^-]|border-radius[^-]|secondary-color|success-color|warning-color|error-color|danger-color|info-color)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -eq 0 ]; then
    echo -e "${GREEN}✅ Migration Phase 2 réussie !${NC}"
else
    echo -e "${YELLOW}⚠️  $old_pattern_vars variables de l'ancien pattern restantes${NC}"
fi

echo
echo -e "${GREEN}✅ Phase 2 terminée${NC}"
echo "💡 Testez maintenant l'application pour vérifier les améliorations" 