#!/bin/bash

# 🔄 MIGRATION PROGRESSIVE DES VARIABLES CSS - TOURCRAFT
# Migre les variables CSS par petits groupes sécurisés
# Usage: ./scripts/migrate-css-variables-progressive.sh [groupe]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
MAPPING_FILE="audit/migration_mapping.txt"
BACKUP_DIR="backup/css/migration-progressive"
LOG_FILE="migration-progressive.log"

echo -e "${PURPLE}🔄 MIGRATION PROGRESSIVE DES VARIABLES CSS${NC}"
echo "==========================================="
echo

# Vérifier les prérequis
if [ ! -f "$MAPPING_FILE" ]; then
    echo -e "${RED}❌ Erreur: Fichier de mapping introuvable${NC}"
    echo "Veuillez d'abord exécuter: ./scripts/generate-migration-mapping.sh"
    exit 1
fi

# Fonction de sauvegarde
create_backup() {
    local group_name=$1
    local backup_path="$BACKUP_DIR/$group_name-$(date +%Y%m%d-%H%M%S)"
    
    echo -e "${YELLOW}📦 Création sauvegarde: $backup_path${NC}"
    mkdir -p "$backup_path"
    
    # Sauvegarder tous les fichiers CSS
    find src/ -name "*.css" -exec cp --parents {} "$backup_path/" \;
    
    echo "✅ Sauvegarde créée: $backup_path"
    echo "$(date): Sauvegarde $group_name créée dans $backup_path" >> $LOG_FILE
}

# Fonction de migration sécurisée
migrate_variables() {
    local old_var=$1
    local new_var=$2
    local description=$3
    
    echo "  🔄 $old_var → $new_var"
    
    # Compter les occurrences avant
    local count_before=$(grep -r "var($old_var)" src/ --include="*.css" | wc -l)
    
    if [ $count_before -eq 0 ]; then
        echo "    ⚠️  Variable non trouvée, ignorée"
        return
    fi
    
    echo "    📊 $count_before occurrences trouvées"
    
    # Appliquer le remplacement (macOS compatible)
    find src/ -name "*.css" -exec sed -i '' "s/var($old_var)/var($new_var)/g" {} \;
    
    # Vérifier le résultat
    local count_after=$(grep -r "var($old_var)" src/ --include="*.css" | wc -l)
    local count_new=$(grep -r "var($new_var)" src/ --include="*.css" | wc -l)
    
    echo "    ✅ Migration terminée: $count_after restantes, $count_new nouvelles"
    echo "$(date): $old_var → $new_var ($count_before → $count_after occurrences)" >> $LOG_FILE
}

# Fonction de test rapide
test_css_syntax() {
    echo -e "${YELLOW}🧪 Test de syntaxe CSS...${NC}"
    
    # Vérifier qu'il n'y a pas d'erreurs de syntaxe évidentes
    local errors=0
    
    # Chercher des variables CSS malformées
    if grep -r "var(--tc-.*--tc-" src/ --include="*.css" > /dev/null 2>&1; then
        echo -e "${RED}❌ Variables CSS malformées détectées${NC}"
        errors=$((errors + 1))
    fi
    
    # Chercher des parenthèses non fermées
    if grep -r "var(--tc-[^)]*$" src/ --include="*.css" > /dev/null 2>&1; then
        echo -e "${RED}❌ Parenthèses non fermées détectées${NC}"
        errors=$((errors + 1))
    fi
    
    if [ $errors -eq 0 ]; then
        echo "✅ Syntaxe CSS valide"
        return 0
    else
        echo -e "${RED}❌ $errors erreurs de syntaxe détectées${NC}"
        return 1
    fi
}

# Groupes de migration (du plus sûr au plus complexe)
migrate_group_1_critical() {
    echo -e "${BLUE}📦 GROUPE 1: Variables critiques (les plus utilisées)${NC}"
    create_backup "group1-critical"
    
    # Variables les plus critiques et sûres
    migrate_variables "--tc-primary-color" "--tc-color-primary" "Couleur primaire principale"
    migrate_variables "--tc-bg-color" "--tc-bg-default" "Couleur de fond par défaut"
    migrate_variables "--tc-text-color" "--tc-text-default" "Couleur de texte par défaut"
    migrate_variables "--tc-border-color" "--tc-border-default" "Couleur de bordure par défaut"
    
    test_css_syntax
}

migrate_group_2_spacing() {
    echo -e "${BLUE}📦 GROUPE 2: Espacements${NC}"
    create_backup "group2-spacing"
    
    # Espacements
    migrate_variables "--tc-spacing-xs" "--tc-space-1" "Espacement extra small"
    migrate_variables "--tc-spacing-sm" "--tc-space-2" "Espacement small"
    migrate_variables "--tc-spacing-md" "--tc-space-4" "Espacement medium"
    migrate_variables "--tc-spacing-lg" "--tc-space-6" "Espacement large"
    migrate_variables "--tc-spacing-xl" "--tc-space-8" "Espacement extra large"
    
    test_css_syntax
}

migrate_group_3_components() {
    echo -e "${BLUE}📦 GROUPE 3: Composants${NC}"
    create_backup "group3-components"
    
    # Variables de composants
    migrate_variables "--tc-card-bg" "--tc-bg-default" "Fond des cartes"
    migrate_variables "--tc-input-bg" "--tc-bg-default" "Fond des inputs"
    migrate_variables "--tc-btn-primary-bg" "--tc-color-primary" "Fond bouton primaire"
    migrate_variables "--tc-btn-primary-text" "--tc-text-light" "Texte bouton primaire"
    
    test_css_syntax
}

migrate_group_4_typography() {
    echo -e "${BLUE}📦 GROUPE 4: Typographie${NC}"
    create_backup "group4-typography"
    
    # Typographie
    migrate_variables "--tc-font-family-base" "--tc-font-sans" "Famille de police de base"
    migrate_variables "--tc-font-size-xxl" "--tc-font-size-2xl" "Taille de police XXL"
    migrate_variables "--tc-line-height-base" "--tc-line-height-normal" "Hauteur de ligne de base"
    
    test_css_syntax
}

migrate_group_5_effects() {
    echo -e "${BLUE}📦 GROUPE 5: Effets${NC}"
    create_backup "group5-effects"
    
    # Effets
    migrate_variables "--tc-shadow" "--tc-shadow-base" "Ombre de base"
    migrate_variables "--tc-border-radius" "--tc-radius-base" "Border radius de base"
    migrate_variables "--tc-transition" "--tc-transition-base" "Transition de base"
    
    test_css_syntax
}

# Fonction de rapport final
generate_report() {
    echo -e "${PURPLE}📊 RAPPORT DE MIGRATION${NC}"
    echo "======================"
    
    # Compter les variables restantes de l'ancien système
    local old_vars=$(grep -r "var(--tc-" src/ --include="*.css" | grep -E "(primary-color|bg-color|text-color|spacing-|card-bg|input-bg)" | wc -l)
    
    echo "Variables anciennes restantes: $old_vars"
    
    if [ $old_vars -eq 0 ]; then
        echo -e "${GREEN}✅ Migration complète réussie !${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration partielle, $old_vars variables à traiter${NC}"
        
        # Lister les variables restantes
        echo -e "${YELLOW}Variables restantes:${NC}"
        grep -r "var(--tc-" src/ --include="*.css" | grep -E "(primary-color|bg-color|text-color|spacing-|card-bg|input-bg)" | head -10
    fi
    
    echo
    echo "📝 Log complet disponible dans: $LOG_FILE"
}

# Menu principal
case "${1:-menu}" in
    "1"|"critical")
        migrate_group_1_critical
        ;;
    "2"|"spacing")
        migrate_group_2_spacing
        ;;
    "3"|"components")
        migrate_group_3_components
        ;;
    "4"|"typography")
        migrate_group_4_typography
        ;;
    "5"|"effects")
        migrate_group_5_effects
        ;;
    "all")
        echo -e "${YELLOW}⚠️  Migration complète - Êtes-vous sûr ? (y/N)${NC}"
        read -r confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            migrate_group_1_critical
            migrate_group_2_spacing
            migrate_group_3_components
            migrate_group_4_typography
            migrate_group_5_effects
            generate_report
        else
            echo "Migration annulée"
            exit 0
        fi
        ;;
    "report")
        generate_report
        ;;
    *)
        echo -e "${BLUE}🔄 MIGRATION PROGRESSIVE DES VARIABLES CSS${NC}"
        echo "=========================================="
        echo
        echo "Groupes disponibles:"
        echo "  1) critical   - Variables critiques (primary-color, bg-color, text-color)"
        echo "  2) spacing    - Variables d'espacement (spacing-xs, spacing-sm, etc.)"
        echo "  3) components - Variables de composants (card-bg, input-bg, btn-*)"
        echo "  4) typography - Variables de typographie (font-*, line-height-*)"
        echo "  5) effects    - Variables d'effets (shadow, border-radius, transition)"
        echo "  all)          - Migration complète (ATTENTION: tous les groupes)"
        echo "  report)       - Générer un rapport de l'état actuel"
        echo
        echo "Usage:"
        echo "  ./scripts/migrate-css-variables-progressive.sh 1"
        echo "  ./scripts/migrate-css-variables-progressive.sh critical"
        echo "  ./scripts/migrate-css-variables-progressive.sh all"
        echo
        echo -e "${YELLOW}💡 Recommandation: Commencer par le groupe 1 (critical)${NC}"
        ;;
esac

echo
echo -e "${GREEN}✅ Script terminé${NC}" 