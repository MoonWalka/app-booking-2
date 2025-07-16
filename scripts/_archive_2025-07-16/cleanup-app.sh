#!/bin/bash

# Script de nettoyage pour TourCraft Booking App
# Date: Mai 2025
# Description: Supprime les fichiers de test, debug et obsolètes

echo "🧹 Début du nettoyage de l'application TourCraft..."

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour demander confirmation
confirm() {
    read -p "$1 [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# 1. Suppression des pages de test
echo -e "\n${YELLOW}📋 Fichiers de test à supprimer:${NC}"
echo "- src/pages/TestDiagnostic.js"
echo "- src/pages/TestParametresVersions.js"
echo "- src/pages/TestContractError.js"
echo "- src/pages/test/StyleTestPage.js"
echo "- src/components/TestArtistesList.js"

if confirm "Supprimer ces fichiers de test?"; then
    rm -f src/pages/TestDiagnostic.js
    rm -f src/pages/TestParametresVersions.js
    rm -f src/pages/TestContractError.js
    rm -f src/pages/test/StyleTestPage.js
    rm -f src/components/TestArtistesList.js
    echo -e "${GREEN}✅ Fichiers de test supprimés${NC}"
fi

# 2. Suppression du dossier debug
echo -e "\n${YELLOW}🐛 Dossier debug à supprimer:${NC}"
echo "- src/components/debug/ (contient 5 composants)"

if confirm "Supprimer le dossier debug?"; then
    rm -rf src/components/debug/
    echo -e "${GREEN}✅ Dossier debug supprimé${NC}"
fi

# 3. Suppression des fichiers backup
echo -e "\n${YELLOW}💾 Fichiers backup à supprimer:${NC}"
find src -name "*.original.js" -o -name "*.new" | while read file; do
    echo "- $file"
done

if confirm "Supprimer tous ces fichiers backup?"; then
    find src -name "*.original.js" -delete
    find src -name "*.new" -delete
    echo -e "${GREEN}✅ Fichiers backup supprimés${NC}"
fi

# 4. Nettoyage des console.log (optionnel)
echo -e "\n${YELLOW}🔍 Recherche des console.log...${NC}"
log_count=$(grep -r "console\.\(log\|time\|timeEnd\|error\|warn\)" src --include="*.js" --include="*.jsx" | wc -l)
echo "Trouvé $log_count occurrences de console.*"

if confirm "Supprimer tous les console.log/time/error/warn?"; then
    # Créer un backup avant modification
    echo "Création d'un backup dans /tmp/tourcraft-backup-console-logs.tar.gz"
    tar -czf /tmp/tourcraft-backup-console-logs.tar.gz src/
    
    # Supprimer les console.log
    find src -name "*.js" -o -name "*.jsx" | while read file; do
        sed -i.bak '/console\.\(log\|time\|timeEnd\|error\|warn\)/d' "$file"
        rm -f "$file.bak"
    done
    echo -e "${GREEN}✅ Console.log supprimés (backup: /tmp/tourcraft-backup-console-logs.tar.gz)${NC}"
fi

# 5. Nettoyage des imports commentés
echo -e "\n${YELLOW}💬 Recherche des imports commentés...${NC}"
commented_imports=$(grep -r "^[[:space:]]*//.*import" src --include="*.js" --include="*.jsx" | wc -l)
echo "Trouvé $commented_imports imports commentés"

if confirm "Supprimer les imports commentés?"; then
    find src -name "*.js" -o -name "*.jsx" | while read file; do
        sed -i.bak '/^[[:space:]]*\/\/.*import/d' "$file"
        rm -f "$file.bak"
    done
    echo -e "${GREEN}✅ Imports commentés supprimés${NC}"
fi

# 6. Rapport final
echo -e "\n${GREEN}📊 Rapport de nettoyage:${NC}"
echo "- Fichiers JS/JSX total: $(find src -name "*.js" -o -name "*.jsx" | wc -l)"
echo "- Fichiers CSS total: $(find src -name "*.css" | wc -l)"
echo "- CSS Modules: $(find src -name "*.module.css" | wc -l)"
echo "- Lignes de code total: $(find src -name "*.js" -o -name "*.jsx" | xargs wc -l | tail -1 | awk '{print $1}')"

# 7. Linter
echo -e "\n${YELLOW}🔧 Exécution d'ESLint pour nettoyer les imports inutilisés...${NC}"
if confirm "Exécuter ESLint avec --fix?"; then
    npm run lint -- --fix
    echo -e "${GREEN}✅ ESLint exécuté${NC}"
fi

echo -e "\n${GREEN}🎉 Nettoyage terminé!${NC}"
echo -e "${YELLOW}N'oubliez pas de:${NC}"
echo "1. Vérifier que l'application fonctionne toujours"
echo "2. Commiter les changements"
echo "3. Tester les fonctionnalités critiques"