#!/bin/bash

# 🔧 MIGRATION CSS FINALE MANUELLE
# Corrige manuellement les variables restantes qui causent des problèmes visuels
# Usage: ./scripts/migrate-css-final-manual.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔧 MIGRATION CSS FINALE MANUELLE${NC}"
echo "================================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔧 Sauvegarde avant migration CSS finale manuelle - $(date)"
    echo "✅ Sauvegarde git créée"
}

# Fonction de remplacement précis
replace_exact() {
    local file=$1
    local old_var=$2
    local new_var=$3
    local description=$4
    
    echo -e "${BLUE}🔧 $file: $old_var → $new_var${NC}"
    echo "   📝 $description"
    
    # Vérifier si le fichier existe
    if [ ! -f "$file" ]; then
        echo "   ⚠️  Fichier non trouvé, ignoré"
        return
    fi
    
    # Compter les occurrences avant
    local count_before=$(grep -c "var($old_var)" "$file" 2>/dev/null || echo "0")
    
    if [ "$count_before" -eq 0 ]; then
        echo "   ⚠️  Variable non trouvée dans ce fichier"
        return
    fi
    
    # Remplacement avec sed
    sed -i '' "s/var($old_var)/var($new_var)/g" "$file"
    
    # Vérifier le résultat
    local count_after=$(grep -c "var($old_var)" "$file" 2>/dev/null || echo "0")
    
    echo "   ✅ Remplacé: $count_before → $count_after occurrences"
    echo
}

# Créer une sauvegarde avant de commencer
create_git_backup

echo -e "${BLUE}🎯 PHASE FINALE: CORRECTIONS MANUELLES CIBLÉES${NC}"
echo "==============================================="
echo

# 1. Variables de couleurs critiques
echo -e "${YELLOW}📝 1. Correction des variables de couleurs critiques${NC}"
replace_exact "src/styles/base/typography.css" "--tc-primary-light" "--tc-color-primary-light" "Couleur primaire claire"
replace_exact "src/components/concerts/sections/SelectedEntityCard.module.css" "--tc-whitefff" "--tc-color-white" "Couleur blanche (typo corrigée)"
replace_exact "src/components/concerts/desktop/ConcertStructureSection.module.css" "--tc-whitefff" "--tc-color-white" "Couleur blanche (typo corrigée)"

# 2. Variables de statut (backgrounds)
echo -e "${YELLOW}📝 2. Correction des variables de statut${NC}"
replace_exact "src/components/ui/FormField.module.css" "--tc-danger-bg" "--tc-bg-error" "Fond d'erreur"
replace_exact "src/components/ui/Alert.module.css" "--tc-success-bg" "--tc-bg-success" "Fond de succès"
replace_exact "src/components/ui/Alert.module.css" "--tc-danger-bg" "--tc-bg-error" "Fond d'erreur"
replace_exact "src/components/ui/Alert.module.css" "--tc-warning-bg" "--tc-bg-warning" "Fond d'avertissement"
replace_exact "src/components/ui/Alert.module.css" "--tc-info-bg" "--tc-bg-info" "Fond d'information"
replace_exact "src/components/forms/FormGenerator.module.css" "--tc-success-bg" "--tc-bg-success" "Fond de succès"

# 3. Variables de couleurs claires
echo -e "${YELLOW}📝 3. Correction des variables de couleurs claires${NC}"
replace_exact "src/components/concerts/sections/SelectedEntityCard.module.css" "--tc-danger-light" "--tc-color-error-light" "Couleur d'erreur claire"
replace_exact "src/components/concerts/mobile/sections/ConcertGeneralInfoMobile.module.css" "--tc-danger-light" "--tc-color-error-light" "Couleur d'erreur claire"
replace_exact "src/components/concerts/mobile/ConcertsList.module.css" "--tc-danger-light" "--tc-color-error-light" "Couleur d'erreur claire"

# 4. Variables d'espacement
echo -e "${YELLOW}📝 4. Correction des variables d'espacement${NC}"
replace_exact "src/components/concerts/sections/DeleteConfirmModal.module.css" "--tc-spacing-5" "--tc-space-5" "Espacement 5"

# 5. Variables d'overlay et ombres
echo -e "${YELLOW}📝 5. Correction des variables d'overlay et ombres${NC}"
replace_exact "src/components/concerts/desktop/ConcertDetails.module.css" "--tc-overlay-color" "--tc-bg-overlay" "Couleur d'overlay"
replace_exact "src/components/concerts/ConcertForm.module.css" "--tc-overlay-color" "--tc-bg-overlay" "Couleur d'overlay"
replace_exact "src/components/concerts/desktop/DeleteConcertModal.module.css" "--tc-overlay-shadow" "--tc-shadow-lg" "Ombre d'overlay"
replace_exact "src/components/concerts/desktop/ConcertForm.module.css" "--tc-box-shadow" "--tc-shadow-base" "Ombre de boîte"
replace_exact "src/components/concerts/desktop/ConcertForm.module.css" "--tc-dropdown-shadow" "--tc-shadow-lg" "Ombre de dropdown"

# 6. Variables de bordures
echo -e "${YELLOW}📝 6. Correction des variables de bordures${NC}"
replace_exact "src/components/forms/FormGenerator.module.css" "--tc-success-border" "--tc-color-success" "Bordure de succès"

# 7. Vérification des variables manquantes et ajout si nécessaire
echo -e "${YELLOW}📝 7. Vérification des variables dans colors.css${NC}"

# Vérifier si les variables nécessaires existent
if ! grep -q "tc-color-primary-light" src/styles/base/colors.css; then
    echo "➕ Ajout de --tc-color-primary-light dans colors.css"
    echo "  --tc-color-primary-light: #4a6fa5;" >> src/styles/base/colors.css
fi

if ! grep -q "tc-color-error-light" src/styles/base/colors.css; then
    echo "➕ Ajout de --tc-color-error-light dans colors.css"
    echo "  --tc-color-error-light: #f8d7da;" >> src/styles/base/colors.css
fi

if ! grep -q "tc-space-5" src/styles/base/variables.css; then
    echo "➕ Ajout de --tc-space-5 dans variables.css"
    echo "  --tc-space-5: 1.25rem;" >> src/styles/base/variables.css
fi

# 8. Nettoyage des commentaires avec variables
echo -e "${YELLOW}📝 8. Nettoyage des commentaires avec variables${NC}"
find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' 's|/\* var(--tc-focus-shadow) \*/|/* Ombre focus remplacée */|g' {} \;

echo -e "${PURPLE}📊 RAPPORT FINAL MANUEL${NC}"
echo "========================"

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -eq 0 ]; then
    echo -e "${GREEN}🎉 MIGRATION 100% PARFAITEMENT RÉUSSIE !${NC}"
    echo -e "${GREEN}✅ TOUTES les variables ont été migrées !${NC}"
elif [ "$old_pattern_vars" -lt 10 ]; then
    echo -e "${YELLOW}⚠️  Migration quasi-parfaite - très peu de variables restantes${NC}"
    echo "Variables restantes:"
    grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | head -5
else
    echo -e "${RED}❌ Migration nécessite encore du travail${NC}"
    echo "Variables restantes les plus fréquentes:"
    grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | head -10
fi

echo
echo -e "${GREEN}🎉 MIGRATION FINALE MANUELLE TERMINÉE !${NC}"
echo -e "${PURPLE}💡 Testez maintenant l'application !${NC}"
echo "🚀 Les problèmes visuels devraient être résolus !" 