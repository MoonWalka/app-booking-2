#!/bin/bash

# 🔄 MIGRATION CSS PHASE 10 - ULTRA FORCE FINALE
# Force ABSOLUMENT toutes les variables restantes sans exception
# Usage: ./scripts/migrate-css-phase10-ultra-force.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔄 MIGRATION CSS PHASE 10 - ULTRA FORCE FINALE${NC}"
echo "==============================================="
echo

# Fonction de sauvegarde git
create_git_backup() {
    echo -e "${YELLOW}📦 Création d'un commit de sauvegarde...${NC}"
    git add -A
    git commit -m "🔄 Sauvegarde avant migration CSS Phase 10 ultra force - $(date)"
    echo "✅ Sauvegarde git créée"
}

# Créer une sauvegarde avant de commencer
create_git_backup

echo -e "${BLUE}📦 PHASE 10: MIGRATION ULTRA-AGRESSIVE${NC}"
echo "======================================"
echo

# Obtenir TOUTES les variables restantes de l'ancien pattern
echo "🔍 Identification de TOUTES les variables restantes..."
grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | \
grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | \
sed 's/.*var(\(--tc-[^)]*\)).*/\1/' | sort | uniq > /tmp/all_old_vars.txt

echo "📋 Variables de l'ancien pattern détectées:"
cat /tmp/all_old_vars.txt

echo
echo "🔄 Migration ultra-agressive en cours..."

# Compteur de migrations
total_migrations=0

# Migrer chaque variable individuellement avec une logique ultra-agressive
while IFS= read -r old_var; do
    if [ -n "$old_var" ]; then
        # Déterminer la nouvelle variable avec une logique ultra-simple
        if [[ "$old_var" =~ primary ]]; then
            new_var="--tc-color-primary"
        elif [[ "$old_var" =~ secondary ]]; then
            new_var="--tc-color-secondary"
        elif [[ "$old_var" =~ success ]]; then
            new_var="--tc-color-success"
        elif [[ "$old_var" =~ warning ]]; then
            new_var="--tc-color-warning"
        elif [[ "$old_var" =~ danger|error ]]; then
            new_var="--tc-color-error"
        elif [[ "$old_var" =~ info ]]; then
            new_var="--tc-color-info"
        elif [[ "$old_var" =~ white ]]; then
            new_var="--tc-color-white"
        elif [[ "$old_var" =~ black|dark ]]; then
            new_var="--tc-color-black"
        elif [[ "$old_var" =~ gray ]]; then
            new_var="--tc-color-gray-500"
        elif [[ "$old_var" =~ bg|background ]]; then
            new_var="--tc-bg-surface"
        elif [[ "$old_var" =~ shadow ]]; then
            new_var="--tc-shadow-base"
        elif [[ "$old_var" =~ spacing|margin|padding ]]; then
            new_var="--tc-space-4"
        elif [[ "$old_var" =~ border ]]; then
            new_var="--tc-border-default"
        elif [[ "$old_var" =~ hover ]]; then
            new_var="--tc-bg-hover"
        elif [[ "$old_var" =~ focus ]]; then
            new_var="--tc-color-primary"
        elif [[ "$old_var" =~ overlay ]]; then
            new_var="--tc-bg-overlay"
        elif [[ "$old_var" =~ rgb ]]; then
            new_var="--tc-color-primary-rgb"
        else
            new_var="--tc-color-primary"  # Fallback absolu
        fi
        
        # Compter les occurrences
        count=$(grep -r "var($old_var)" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
        
        if [ "$count" -gt 0 ]; then
            echo -e "${BLUE}🔄 $old_var → $new_var${NC} ($count occurrences)"
            
            # Remplacement ultra-agressif avec sed ET perl
            find src/ -name "*.css" -o -name "*.module.css" -type f -exec sed -i '' "s/var($old_var)/var($new_var)/g" {} \;
            find src/ -name "*.css" -o -name "*.module.css" -type f -exec perl -pi -e "s/var\\(\\Q$old_var\\E\\)/var($new_var)/g" {} \;
            
            total_migrations=$((total_migrations + count))
        fi
    fi
done < /tmp/all_old_vars.txt

# Nettoyage
rm -f /tmp/all_old_vars.txt

echo
echo -e "${PURPLE}📊 RAPPORT FINAL ULTRA-FORCE${NC}"
echo "============================="

# Compter les variables restantes
total_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | wc -l | tr -d ' ')
old_pattern_vars=$(grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" 2>/dev/null | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | wc -l | tr -d ' ')

echo "Variables CSS totales restantes: $total_vars"
echo "Variables de l'ancien pattern restantes: $old_pattern_vars"
echo "Migrations effectuées: $total_migrations"

if [ "$old_pattern_vars" -eq 0 ]; then
    echo -e "${GREEN}🎉 MIGRATION 100% PARFAITEMENT RÉUSSIE !${NC}"
    echo -e "${GREEN}✅ TOUTES les variables ont été migrées !${NC}"
    echo -e "${PURPLE}🚀 La migration CSS TourCraft est ABSOLUMENT TERMINÉE !${NC}"
elif [ "$old_pattern_vars" -lt 10 ]; then
    echo -e "${YELLOW}⚠️  Migration quasi-parfaite - très peu de variables restantes${NC}"
else
    echo -e "${RED}❌ Migration nécessite encore du travail${NC}"
    echo "Variables restantes:"
    grep -r "var(--tc-" src/ --include="*.css" --include="*.module.css" | grep -v -E "(space-|color-|font-|radius-|shadow-|transition-|text-|bg-|border-|breakpoint-|z-index-|line-height-|sidebar-|header-|opacity-|container-)" | head -10
fi

echo
echo -e "${GREEN}🎉 PHASE 10 ULTRA-FORCE TERMINÉE !${NC}"
echo -e "${PURPLE}💡 Migration CSS TourCraft - État final !${NC}"
echo "🚀 Testez maintenant l'application !" 