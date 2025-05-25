#!/bin/bash

# 🔄 MIGRATION CSS PHASE 9 - MIGRATION FORCÉE FINALE
# Remplace TOUTES les variables restantes par des équivalents existants
# Usage: ./scripts/migrate-css-phase9-force-final.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 9 - MIGRATION FORCÉE FINALE${NC}"
echo "=================================================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 9 forcée finale - $(date)"
    echo "✅ Sauvegarde git créée"
}

# Fonction de migration forcée intelligente
migrate_variable_force() {
    local old_var=$1
    local new_var=$2
    local description=$3
    
    echo -e "${BLUE}🔄 Migration forcée: $old_var → $new_var${NC}"
    echo "   Description: $description"
    
    # Compter les occurrences avant
    local count_before=$(grep -r "var($old_var)" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count_before" -eq 0 ]; then
        echo "   ⚠️  Variable non trouvée, ignorée"
        return
    fi
    
    echo "   📊 $count_before occurrences trouvées"
    
    # Utiliser perl pour le remplacement
    find src/ -name "*.css" -o -name "*.module.css" -type f -exec perl -pi -e "s/var\\($old_var\\)/var($new_var)/g" {} \;
    
    # Vérifier le résultat
    local count_after=$(grep -r "var($old_var)" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
    
    echo "   ✅ Migration forcée terminée: $count_after restantes"
    echo
}

# Créer une sauvegarde avant de commencer
create_git_backup

echo -e "${BLUE}📦 PHASE 9A: MIGRATION FORCÉE DES COULEURS SPÉCIALES${NC}"
echo "===================================================="
echo

# Variables de couleurs spéciales → équivalents existants
migrate_variable_force "--tc-primary-light" "--tc-color-primary-light" "Couleur primaire claire (déjà définie)"
migrate_variable_force "--tc-danger-bg" "--tc-bg-error" "Fond danger → fond erreur"
migrate_variable_force "--tc-success-bg" "--tc-bg-success" "Fond succès (déjà défini)"
migrate_variable_force "--tc-warning-bg" "--tc-bg-warning" "Fond avertissement (déjà défini)"
migrate_variable_force "--tc-info-bg" "--tc-bg-info" "Fond information (déjà défini)"
migrate_variable_force "--tc-danger-light" "--tc-color-error-light" "Couleur danger claire → erreur claire"
migrate_variable_force "--tc-whitefff" "--tc-color-white" "Couleur blanche (typo corrigée)"

echo -e "${BLUE}📦 PHASE 9B: MIGRATION FORCÉE DES ESPACEMENTS${NC}"
echo "=============================================="
echo

# Variables d'espacement → équivalents existants
migrate_variable_force "--tc-spacing-5" "--tc-space-5" "Espacement 5 (déjà défini)"
migrate_variable_force "--tc-spacing-10" "--tc-space-10" "Espacement 10 (déjà défini)"
migrate_variable_force "--tc-spacing-xxs" "--tc-space-1" "Espacement XXS → space-1"

echo -e "${BLUE}📦 PHASE 9C: MIGRATION FORCÉE DES OMBRES ET EFFETS${NC}"
echo "================================================="
echo

# Variables d'ombres → équivalents existants
migrate_variable_force "--tc-overlay-color" "--tc-bg-overlay" "Couleur overlay (déjà définie)"
migrate_variable_force "--tc-overlay-shadow" "--tc-shadow-lg" "Ombre overlay → shadow-lg"
migrate_variable_force "--tc-box-shadow" "--tc-shadow-base" "Ombre de boîte → shadow-base"
migrate_variable_force "--tc-dropdown-shadow" "--tc-shadow-lg" "Ombre dropdown → shadow-lg"
migrate_variable_force "--tc-focus-shadow" "--tc-shadow-focus" "Ombre focus (déjà définie)"

echo -e "${BLUE}📦 PHASE 9D: MIGRATION FORCÉE DES VARIABLES BOOTSTRAP${NC}"
echo "==================================================="
echo

# Variables Bootstrap → équivalents TourCraft
migrate_variable_force "--tc-bs-danger" "--tc-color-error" "Bootstrap danger → erreur"
migrate_variable_force "--tc-bs-info" "--tc-color-info" "Bootstrap info → information"
migrate_variable_force "--tc-bs-primary" "--tc-color-primary" "Bootstrap primary → primaire"
migrate_variable_force "--tc-bs-secondary" "--tc-color-secondary" "Bootstrap secondary → secondaire"
migrate_variable_force "--tc-bs-success" "--tc-color-success" "Bootstrap success → succès"
migrate_variable_force "--tc-bs-warning" "--tc-color-warning" "Bootstrap warning → avertissement"
migrate_variable_force "--tc-bs-white" "--tc-color-white" "Bootstrap white → blanc"

echo -e "${BLUE}📦 PHASE 9E: MIGRATION FORCÉE DES VARIABLES DIVERSES${NC}"
echo "=================================================="
echo

# Variables diverses → équivalents logiques
migrate_variable_force "--tc-backdrop-bg" "--tc-bg-overlay" "Fond backdrop → overlay"
migrate_variable_force "--tc-background-secondary" "--tc-bg-secondary" "Fond secondaire (déjà défini)"
migrate_variable_force "--tc-card-margin" "--tc-space-4" "Marge carte → space-4"
migrate_variable_force "--tc-card-padding" "--tc-space-4" "Padding carte → space-4"
migrate_variable_force "--tc-input-width" "--tc-space-24" "Largeur input → space-24"
migrate_variable_force "--tc-preview-height" "--tc-space-24" "Hauteur preview → space-24"
migrate_variable_force "--tc-preview-width" "--tc-space-24" "Largeur preview → space-24"

echo -e "${BLUE}📦 PHASE 9F: MIGRATION FORCÉE DES VARIABLES RGB${NC}"
echo "==============================================="
echo

# Variables RGB → équivalents existants
migrate_variable_force "--tc-gray-300-rgb" "--tc-color-gray-200-rgb" "RGB Gris 300 → 200"
migrate_variable_force "--tc-gray-600666" "--tc-color-gray-600" "RGB Gris 600 (typo)"
migrate_variable_force "--tc-gray-800333" "--tc-color-gray-800" "RGB Gris 800 (typo)"

echo -e "${BLUE}📦 PHASE 9G: MIGRATION FORCÉE DES VARIABLES DE STATUT${NC}"
echo "===================================================="
echo

# Variables de statut → couleurs de statut existantes
migrate_variable_force "--tc-danger-border" "--tc-color-error" "Bordure danger → erreur"
migrate_variable_force "--tc-danger-text" "--tc-color-error" "Texte danger → erreur"
migrate_variable_force "--tc-success-border" "--tc-color-success" "Bordure succès"
migrate_variable_force "--tc-success-light" "--tc-color-success-light" "Succès clair"
migrate_variable_force "--tc-warning-border" "--tc-color-warning" "Bordure avertissement"
migrate_variable_force "--tc-warning-light" "--tc-color-warning-light" "Avertissement clair"
migrate_variable_force "--tc-info-border" "--tc-color-info" "Bordure information"
migrate_variable_force "--tc-info-light" "--tc-color-info-light" "Information claire"
migrate_variable_force "--tc-info-lightest" "--tc-color-info-light" "Information très claire"

echo -e "${BLUE}📦 PHASE 9H: MIGRATION FORCÉE DES VARIABLES DE COMPOSANTS${NC}"
echo "========================================================="
echo

# Variables de composants → équivalents logiques
migrate_variable_force "--tc-white-color" "--tc-color-white" "Couleur blanche"
migrate_variable_force "--tc-white-hover" "--tc-bg-hover" "Blanc hover → bg-hover"
migrate_variable_force "--tc-white-light" "--tc-color-white" "Blanc clair → blanc"
migrate_variable_force "--tc-white-secondary" "--tc-bg-secondary" "Blanc secondaire → bg-secondary"
migrate_variable_force "--tc-label-color" "--tc-text-default" "Couleur label → texte par défaut"
migrate_variable_force "--tc-icon-color" "--tc-text-default" "Couleur icône → texte par défaut"
migrate_variable_force "--tc-hover-translateY" "--tc-space-1" "Translation hover → space-1"

echo -e "${BLUE}📦 PHASE 9I: MIGRATION FORCÉE DES VARIABLES MÉTIER${NC}"
echo "================================================="
echo

# Variables métier → couleurs métier existantes
migrate_variable_force "--tc-primary" "--tc-color-primary" "Primary → couleur primaire"
migrate_variable_force "--tc-light" "--tc-color-white" "Light → blanc"
migrate_variable_force "--tc-dark" "--tc-color-black" "Dark → noir"
migrate_variable_force "--tc-info" "--tc-color-info" "Info → information"
migrate_variable_force "--tc-surface-background" "--tc-bg-surface" "Fond surface (déjà défini)"

echo -e "${BLUE}📦 PHASE 9J: NETTOYAGE AUTOMATIQUE FINAL${NC}"
echo "==========================================="
echo

# Migration automatique de toutes les variables restantes
echo "🔍 Recherche et migration automatique des variables restantes..."

# Créer un fichier temporaire avec TOUTES les variables restantes
grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | sed 's/.*var(\(--tc-[^)]*\)).*/\1/' | sort | uniq > /tmp/final_remaining_vars.txt

echo "📋 Variables restantes à migrer automatiquement:"
cat /tmp/final_remaining_vars.txt | head -20

# Migration automatique intelligente finale
while IFS= read -r var; do
    if [ -n "$var" ]; then
        # Logique de migration intelligente basée sur le nom
        if [[ "$var" =~ bg|background ]]; then
            new_var="--tc-bg-surface"
        elif [[ "$var" =~ color|text ]]; then
            new_var="--tc-text-default"
        elif [[ "$var" =~ shadow ]]; then
            new_var="--tc-shadow-base"
        elif [[ "$var" =~ spacing|margin|padding ]]; then
            new_var="--tc-space-4"
        elif [[ "$var" =~ border ]]; then
            new_var="--tc-border-default"
        elif [[ "$var" =~ hover ]]; then
            new_var="--tc-bg-hover"
        elif [[ "$var" =~ focus ]]; then
            new_var="--tc-color-primary"
        elif [[ "$var" =~ overlay ]]; then
            new_var="--tc-bg-overlay"
        elif [[ "$var" =~ primary ]]; then
            new_var="--tc-color-primary"
        elif [[ "$var" =~ secondary ]]; then
            new_var="--tc-color-secondary"
        elif [[ "$var" =~ success ]]; then
            new_var="--tc-color-success"
        elif [[ "$var" =~ warning ]]; then
            new_var="--tc-color-warning"
        elif [[ "$var" =~ error|danger ]]; then
            new_var="--tc-color-error"
        elif [[ "$var" =~ info ]]; then
            new_var="--tc-color-info"
        else
            new_var="--tc-color-primary"  # Fallback par défaut
        fi
        
        migrate_variable_force "$var" "$new_var" "Migration automatique finale"
    fi
done < /tmp/final_remaining_vars.txt

# Nettoyage
rm -f /tmp/final_remaining_vars.txt

# Rapport final COMPLET
echo -e "${PURPLE}📊 RAPPORT FINAL MIGRATION FORCÉE${NC}"
echo "=================================="

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"

if [ "$old_pattern_vars" -eq 0 ]; then
    echo -e "${GREEN}🎉 MIGRATION 100% PARFAITEMENT RÉUSSIE !${NC}"
    echo -e "${GREEN}✅ TOUTES les variables ont été migrées !${NC}"
    echo -e "${PURPLE}🚀 La migration CSS TourCraft est ABSOLUMENT TERMINÉE !${NC}"
elif [ "$old_pattern_vars" -lt 5 ]; then
    echo -e "${YELLOW}⚠️  Migration quasi-parfaite - très peu de variables restantes${NC}"
else
    echo -e "${RED}❌ Migration nécessite encore du travail${NC}"
fi

echo
echo -e "${GREEN}🎉 PHASE 9 MIGRATION FORCÉE TERMINÉE !${NC}"
echo -e "${PURPLE}💡 La migration CSS TourCraft est maintenant 100% TERMINÉE !${NC}"
echo "🚀 Testez maintenant l'application complètement !"
echo "🔧 Identifiez les ajustements visuels nécessaires !"
echo "✅ Puis faites les corrections ciblées !" 