#!/bin/bash

# Script de validation de la migration Card
# Vérifie que tous les composants utilisent le composant Card standardisé

echo "🔍 Validation de la migration vers le composant Card standardisé"
echo "================================================================"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
errors=0
warnings=0

# 1. Vérifier l'absence de structures de carte manuelles
echo "1. 📋 Vérification des structures de carte manuelles..."

manual_cards=$(grep -r "form-card\|card-header\|card-body\|card-section\|detail-card" src/components/ --include="*.js" --include="*.jsx" | grep -v ".module.css" | grep -v "Card.css" | grep -v "editor-modal.css" | grep -v "Parametres.css" | grep -v "SyncManager.css")

if [ -z "$manual_cards" ]; then
    echo -e "   ✅ ${GREEN}Aucune structure de carte manuelle détectée${NC}"
else
    echo -e "   ❌ ${RED}Structures de carte manuelles trouvées :${NC}"
    echo "$manual_cards"
    ((errors++))
fi

# 2. Vérifier les imports du composant Card
echo ""
echo "2. 📦 Vérification des imports du composant Card..."

card_imports=$(find src/components -name "*.js" -o -name "*.jsx" | xargs grep -l "import.*Card.*from.*ui/Card\|import.*Card.*from.*@/components/ui/Card" | wc -l | tr -d ' ')
total_card_usage=$(find src/components -name "*.js" -o -name "*.jsx" | xargs grep -l "Card" | wc -l | tr -d ' ')

echo -e "   📊 ${card_imports} fichiers importent le composant Card standardisé"
echo -e "   📊 ${total_card_usage} fichiers au total utilisent 'Card'"

if [ "$card_imports" -gt 50 ]; then
    echo -e "   ✅ ${GREEN}Bonne adoption du composant Card standardisé${NC}"
else
    echo -e "   ⚠️  ${YELLOW}Adoption faible du composant Card standardisé${NC}"
    ((warnings++))
fi

# 3. Vérifier les patterns d'utilisation incorrects
echo ""
echo "3. 🔍 Vérification des patterns d'utilisation..."

# Rechercher des divs avec className contenant "card" mais pas dans les composants légitimes
incorrect_patterns=$(grep -rn "className.*['\"].*card" src/components/ --include="*.js" --include="*.jsx" | grep -v "Card.js" | grep -v "StatsCards.js" | grep -v "SelectedEntityCard.js" | grep -v "OnboardingFlow.js" | grep -v "choice-card" | grep -v "bi-card" | grep -v "cardBody\|cardHeader\|cardIcon" | grep -v "styles\.")

if [ -z "$incorrect_patterns" ]; then
    echo -e "   ✅ ${GREEN}Aucun pattern d'utilisation incorrect détecté${NC}"
else
    echo -e "   ⚠️  ${YELLOW}Patterns d'utilisation suspects trouvés :${NC}"
    echo "$incorrect_patterns"
    ((warnings++))
fi

# 4. Vérifier la cohérence des imports
echo ""
echo "4. 🔗 Vérification de la cohérence des imports..."

# Compter les différents patterns d'import
import_ui_card=$(grep -r "import.*Card.*from.*ui/Card" src/components/ | wc -l | tr -d ' ')
import_alias_card=$(grep -r "import.*Card.*from.*@/components/ui/Card" src/components/ | wc -l | tr -d ' ')

echo -e "   📊 ${import_ui_card} imports avec pattern './ui/Card'"
echo -e "   📊 ${import_alias_card} imports avec pattern '@/components/ui/Card'"

if [ "$import_alias_card" -gt "$import_ui_card" ]; then
    echo -e "   ✅ ${GREEN}Majorité d'imports avec alias (pattern recommandé)${NC}"
else
    echo -e "   ⚠️  ${YELLOW}Préférer les imports avec alias @/components/ui/Card${NC}"
    ((warnings++))
fi

# 5. Vérifier l'utilisation des props recommandées
echo ""
echo "5. ⚙️  Vérification des props du composant Card..."

cards_with_title=$(grep -r "<Card" src/components/ --include="*.js" --include="*.jsx" | grep "title=" | wc -l | tr -d ' ')
cards_with_icon=$(grep -r "<Card" src/components/ --include="*.js" --include="*.jsx" | grep "icon=" | wc -l | tr -d ' ')
total_card_usage_jsx=$(grep -r "<Card" src/components/ --include="*.js" --include="*.jsx" | wc -l | tr -d ' ')

echo -e "   📊 ${cards_with_title}/${total_card_usage_jsx} utilisations avec prop 'title'"
echo -e "   📊 ${cards_with_icon}/${total_card_usage_jsx} utilisations avec prop 'icon'"

if [ "$cards_with_title" -gt $((total_card_usage_jsx / 2)) ]; then
    echo -e "   ✅ ${GREEN}Bonne utilisation des props 'title'${NC}"
else
    echo -e "   ⚠️  ${YELLOW}Utilisation limitée des props 'title'${NC}"
    ((warnings++))
fi

# 6. Rapport final
echo ""
echo "📊 RAPPORT FINAL"
echo "================"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "🎉 ${GREEN}MIGRATION VALIDÉE : Parfaite conformité au composant Card standardisé${NC}"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "✅ ${GREEN}Migration réussie avec ${warnings} avertissement(s)${NC}"
    exit 0
else
    echo -e "❌ ${RED}Problèmes détectés : ${errors} erreur(s), ${warnings} avertissement(s)${NC}"
    echo -e "🔧 ${YELLOW}Action requise pour corriger les erreurs${NC}"
    exit 1
fi