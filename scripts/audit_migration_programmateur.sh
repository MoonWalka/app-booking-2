#!/bin/bash

# Script d'audit pour la migration programmateur → contact
# Auteur: Assistant IA TourCraft
# Date: 29 Mai 2025

echo "🔍 AUDIT MIGRATION PROGRAMMATEUR → CONTACT"
echo "=========================================="
echo ""

# Fonction pour afficher les couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 1. Compter les occurrences totales
echo -e "${BLUE}📊 STATISTIQUES GLOBALES${NC}"
echo "===================="

TOTAL_OCCURRENCES=$(grep -r "programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo -e "Total occurrences 'programmateur': ${RED}$TOTAL_OCCURRENCES${NC}"

TOTAL_FILES=$(grep -r "programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | cut -d: -f1 | sort | uniq | wc -l)
echo -e "Fichiers concernés: ${YELLOW}$TOTAL_FILES${NC}"

echo ""

# 2. Répartition par catégorie
echo -e "${BLUE}📁 RÉPARTITION PAR CATÉGORIE${NC}"
echo "=========================="

echo -e "${PURPLE}🏗️  Hooks de contrats:${NC}"
grep -r "programmateur" src/hooks/contrats/ --include="*.js" 2>/dev/null | wc -l | xargs echo "  Occurrences:"

echo -e "${PURPLE}📄 Composants PDF:${NC}"
grep -r "programmateur" src/components/pdf/ --include="*.js" 2>/dev/null | wc -l | xargs echo "  Occurrences:"

echo -e "${PURPLE}📝 Formulaires:${NC}"
grep -r "programmateur" src/components/forms/ --include="*.js" 2>/dev/null | wc -l | xargs echo "  Occurrences:"

echo -e "${PURPLE}🎵 Concerts:${NC}"
grep -r "programmateur" src/hooks/concerts/ --include="*.js" 2>/dev/null | wc -l | xargs echo "  Occurrences:"

echo -e "${PURPLE}📋 Contrats (composants):${NC}"
grep -r "programmateur" src/components/contrats/ --include="*.js" 2>/dev/null | wc -l | xargs echo "  Occurrences:"

echo -e "${PURPLE}🏢 Lieux:${NC}"
grep -r "programmateur" src/components/lieux/ --include="*.js" 2>/dev/null | wc -l | xargs echo "  Occurrences:"

echo -e "${PURPLE}📄 Pages:${NC}"
grep -r "programmateur" src/pages/ --include="*.js" 2>/dev/null | wc -l | xargs echo "  Occurrences:"

echo -e "${PURPLE}⚙️  Services:${NC}"
grep -r "programmateur" src/services/ --include="*.js" 2>/dev/null | wc -l | xargs echo "  Occurrences:"

echo ""

# 3. Top 10 des fichiers les plus impactés
echo -e "${BLUE}🎯 TOP 10 FICHIERS LES PLUS IMPACTÉS${NC}"
echo "=================================="

grep -r "programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | \
cut -d: -f1 | sort | uniq -c | sort -nr | head -10 | \
while read count file; do
    filename=$(basename "$file")
    dir=$(dirname "$file" | sed 's|src/||')
    echo -e "${RED}$count${NC} occurrences - ${YELLOW}$filename${NC} (${dir})"
done

echo ""

# 4. Analyse des types d'occurrences
echo -e "${BLUE}🔍 ANALYSE DES TYPES D'OCCURRENCES${NC}"
echo "==============================="

echo -e "${PURPLE}Variables et propriétés:${NC}"
grep -r "programmateur\." src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | xargs echo "  Accès aux propriétés:"

echo -e "${PURPLE}Noms de fonctions:${NC}"
grep -r "Programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | xargs echo "  Noms de composants/fonctions:"

echo -e "${PURPLE}Commentaires:${NC}"
grep -r "// .*programmateur\|/\* .*programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | xargs echo "  Dans les commentaires:"

echo -e "${PURPLE}Chaînes de caractères:${NC}"
grep -r "\".*programmateur\|'.*programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | xargs echo "  Dans les chaînes:"

echo ""

# 5. Vérification des imports
echo -e "${BLUE}📦 IMPORTS ET EXPORTS${NC}"
echo "=================="

echo -e "${PURPLE}Imports de composants Programmateur:${NC}"
grep -r "import.*Programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | xargs echo "  Imports:"

echo -e "${PURPLE}Exports de composants Programmateur:${NC}"
grep -r "export.*Programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | xargs echo "  Exports:"

echo ""

# 6. État des tests
echo -e "${BLUE}🧪 ÉTAT DES TESTS${NC}"
echo "==============="

echo -e "${PURPLE}Tests mentionnant 'programmateur':${NC}"
if [ -d "src/__tests__" ] || [ -d "tests" ] || find src -name "*.test.js" -o -name "*.spec.js" | head -1 > /dev/null; then
    grep -r "programmateur" src/ --include="*.test.js" --include="*.spec.js" 2>/dev/null | wc -l | xargs echo "  Occurrences dans les tests:"
else
    echo "  Aucun répertoire de tests trouvé"
fi

echo ""

# 7. Recommandations de priorité
echo -e "${BLUE}🎯 RECOMMANDATIONS DE PRIORITÉ${NC}"
echo "============================"

echo -e "${RED}🔥 PRIORITÉ CRITIQUE:${NC}"
echo "  1. Hooks de contrats (génération PDF affectée)"
echo "  2. Composants PDF (templates de contrats)"
echo "  3. Formulaires publics (utilisateurs externes)"

echo -e "${YELLOW}⚠️  PRIORITÉ HAUTE:${NC}"
echo "  4. Hooks de concerts (workflows principaux)"
echo "  5. Sections de contrats (interface admin)"
echo "  6. Validation de formulaires"

echo -e "${GREEN}📋 PRIORITÉ MOYENNE:${NC}"
echo "  7. Vues et pages (interface utilisateur)"
echo "  8. Services utilitaires"
echo "  9. Composants mineurs"

echo ""

# 8. Génération du rapport détaillé
echo -e "${BLUE}📄 GÉNÉRATION DU RAPPORT DÉTAILLÉ${NC}"
echo "==============================="

REPORT_FILE="audit_migration_programmateur_$(date +%Y%m%d_%H%M%S).txt"

{
    echo "AUDIT MIGRATION PROGRAMMATEUR → CONTACT"
    echo "Date: $(date)"
    echo "======================================="
    echo ""
    echo "FICHIERS AVEC OCCURRENCES:"
    echo "========================="
    grep -r "programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null | \
    cut -d: -f1 | sort | uniq -c | sort -nr
    echo ""
    echo "DÉTAIL DES OCCURRENCES PAR FICHIER:"
    echo "=================================="
    grep -r "programmateur" src/ --include="*.js" --include="*.jsx" 2>/dev/null
} > "$REPORT_FILE"

echo -e "Rapport détaillé généré: ${GREEN}$REPORT_FILE${NC}"

echo ""

# 9. Suggestions d'actions
echo -e "${BLUE}🚀 PROCHAINES ACTIONS SUGGÉRÉES${NC}"
echo "============================="

if [ "$TOTAL_OCCURRENCES" -gt 200 ]; then
    echo -e "${RED}⚠️  Migration importante détectée (>200 occurrences)${NC}"
    echo "   Recommandation: Migration en plusieurs phases"
    echo "   1. Commencer par les hooks de contrats"
    echo "   2. Continuer avec les composants PDF"
    echo "   3. Traiter les formulaires et validation"
elif [ "$TOTAL_OCCURRENCES" -gt 50 ]; then
    echo -e "${YELLOW}📝 Migration modérée détectée (50-200 occurrences)${NC}"
    echo "   Recommandation: Migration en 2 phases"
    echo "   1. Composants critiques (contrats, PDF)"
    echo "   2. Interface utilisateur et services"
else
    echo -e "${GREEN}✅ Migration légère détectée (<50 occurrences)${NC}"
    echo "   Recommandation: Migration en une seule session"
fi

echo ""
echo -e "${GREEN}✨ Audit terminé avec succès!${NC}"
echo ""

# Optionnel: Ouvrir le rapport dans un éditeur
if command -v code > /dev/null 2>&1; then
    echo "💡 Tip: Ouvrez le rapport avec 'code $REPORT_FILE'"
fi
