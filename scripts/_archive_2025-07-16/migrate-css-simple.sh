#!/bin/bash

# 🔄 MIGRATION SIMPLE DES VARIABLES CSS - TOURCRAFT
# Script sécurisé pour migrer les variables CSS une par une
# Usage: ./scripts/migrate-css-simple.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION SIMPLE DES VARIABLES CSS${NC}"
echo "===================================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS - $(date)"
    echo "✅ Sauvegarde git créée"
}

# Fonction de migration sécurisée avec perl (plus robuste que sed)
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
    
    # Utiliser perl pour le remplacement (plus robuste que sed)
    find src/ -name "*.css" -type f -exec perl -pi -e "s/var\\($old_var\\)/var($new_var)/g" {} \;
    
    # Vérifier le résultat
    local count_after=$(grep -r "var($old_var)" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    local count_new=$(grep -r "var($new_var)" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    
    echo "   ✅ Migration terminée: $count_after restantes, $count_new nouvelles"
    echo
}

# Fonction de test
test_syntax() {
    echo -e "${YELLOW}🧪 Test de syntaxe CSS...${NC}"
    
    # Chercher des variables CSS malformées
    local malformed=$(grep -r "var(--tc-.*--tc-" src/ --include="*.css" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$malformed" -gt 0 ]; then
        echo -e "${RED}❌ $malformed variables CSS malformées détectées${NC}"
        grep -r "var(--tc-.*--tc-" src/ --include="*.css" 2>/dev/null | head -5
        return 1
    else
        echo "✅ Aucune variable malformée détectée"
        return 0
    fi
}

# Créer une sauvegarde avant de commencer
create_git_backup

echo -e "${BLUE}📦 MIGRATION DES VARIABLES CRITIQUES${NC}"
echo "===================================="
echo

# Variables les plus critiques (celles qui causent la régression visuelle)
migrate_variable_safe "--tc-primary-color" "--tc-color-primary" "Couleur primaire principale"
migrate_variable_safe "--tc-bg-color" "--tc-bg-default" "Couleur de fond par défaut"
migrate_variable_safe "--tc-text-color" "--tc-text-default" "Couleur de texte par défaut"
migrate_variable_safe "--tc-border-color" "--tc-border-default" "Couleur de bordure par défaut"

# Variables de composants critiques
migrate_variable_safe "--tc-card-bg" "--tc-bg-default" "Fond des cartes"
migrate_variable_safe "--tc-input-bg" "--tc-bg-default" "Fond des inputs"
migrate_variable_safe "--tc-btn-primary-bg" "--tc-color-primary" "Fond bouton primaire"
migrate_variable_safe "--tc-btn-primary-text" "--tc-text-light" "Texte bouton primaire"

# Variables d'espacement les plus utilisées
migrate_variable_safe "--tc-spacing-xs" "--tc-space-1" "Espacement extra small"
migrate_variable_safe "--tc-spacing-sm" "--tc-space-2" "Espacement small"
migrate_variable_safe "--tc-spacing-md" "--tc-space-4" "Espacement medium"
migrate_variable_safe "--tc-spacing-lg" "--tc-space-6" "Espacement large"

# Test de syntaxe
test_syntax

# Rapport final
echo -e "${PURPLE}📊 RAPPORT DE MIGRATION${NC}"
echo "======================"

# Compter les variables restantes de l'ancien système
local old_vars=$(grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | grep -E "(primary-color|bg-color|text-color|spacing-|card-bg|input-bg)" | wc -l | tr -d ' ')

echo "Variables anciennes restantes: $old_vars"

if [ "$old_vars" -eq 0 ]; then
    echo -e "${GREEN}✅ Migration des variables critiques réussie !${NC}"
else
    echo -e "${YELLOW}⚠️  $old_vars variables critiques restantes${NC}"
    echo "Variables restantes les plus importantes:"
    grep -r "var(--tc-" src/ --include="*.css" 2>/dev/null | grep -E "(primary-color|bg-color|text-color|spacing-|card-bg|input-bg)" | head -5
fi

echo
echo -e "${GREEN}✅ Migration terminée${NC}"
echo "💡 Testez maintenant l'application pour vérifier que la régression visuelle est corrigée" 