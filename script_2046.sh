#!/bin/bash

# Couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ANALYSE COMPLÈTE DES CAUSES POTENTIELLES DE L'ERREUR 'EMPTY DEPENDENCY' ===${NC}\n"

# Créer un dossier pour les résultats
REPORT_DIR="diagnostics_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPORT_DIR"

# 1. Analyse de la configuration webpack/craco
echo -e "${YELLOW}Analyse de la configuration webpack/craco...${NC}"

if [ -f "craco.config.js" ]; then
  echo -e "Fichier craco.config.js trouvé"
  cp craco.config.js "$REPORT_DIR/"
  
  # Vérifier les alias
  ALIASES=$(grep -A 20 "alias" craco.config.js || echo "Aucun alias trouvé")
  echo -e "\n${BLUE}Alias webpack:${NC}"
  echo "$ALIASES"
  
  # Vérifier si l'alias @firebase est correctement configuré
  if grep -q "@firebase" craco.config.js; then
    FIREBASE_ALIAS=$(grep -A 1 "@firebase" craco.config.js)
    echo -e "\n${BLUE}Alias @firebase:${NC}"
    echo "$FIREBASE_ALIAS"
    
    # Extraire le chemin
    FIREBASE_PATH=$(echo "$FIREBASE_ALIAS" | grep -o "path.resolve.*'[^']*'" | sed "s/path.resolve(__dirname, '\([^']*\)').*/\1/")
    
    if [ -n "$FIREBASE_PATH" ]; then
      if [ -f "$FIREBASE_PATH" ]; then
        echo -e "${GREEN}✓ Le fichier $FIREBASE_PATH existe${NC}"
      else
        echo -e "${RED}✗ Le fichier $FIREBASE_PATH n'existe pas${NC}"
        echo -e "Cela pourrait être la cause de l'erreur 'Empty dependency'"
      fi
    fi
  else
    echo -e "${RED}✗ Aucun alias @firebase trouvé dans craco.config.js${NC}"
  fi
else
  echo -e "${RED}✗ Fichier craco.config.js non trouvé${NC}"
fi

# 2. Analyse des installations de package
echo -e "\n${YELLOW}Analyse des packages installés...${NC}"

# Vérifier firebase
echo -e "\n${BLUE}Version de Firebase:${NC}"
npm ls firebase 2>&1 | tee "$REPORT_DIR/firebase_version.txt"

# Vérifier React
echo -e "\n${BLUE}Version de React:${NC}"
npm ls react react-dom 2>&1 | tee "$REPORT_DIR/react_version.txt"

# Vérifier craco
echo -e "\n${BLUE}Version de CRACO:${NC}"
npm ls @craco/craco 2>&1 | tee "$REPORT_DIR/craco_version.txt"

# 3. Vérification des chemins et casse de fichiers
echo -e "\n${YELLOW}Vérification des problèmes de chemins et de casse...${NC}"

# Vérifier s'il y a plusieurs versions du fichier firebase.js avec des casses différentes
FIREBASE_FILES=$(find ./src -iname "firebase.js" | sort)

if [ $(echo "$FIREBASE_FILES" | wc -l) -gt 1 ]; then
  echo -e "${RED}⚠️ Plusieurs fichiers firebase.js trouvés avec des casses différentes:${NC}"
  echo "$FIREBASE_FILES"
  echo -e "Cela pourrait causer des problèmes de résolution de modules."
else
  echo -e "${GREEN}✓ Un seul fichier firebase.js trouvé${NC}"
  echo "$FIREBASE_FILES"
fi

# 4. Analyse des imports problématiques dans tout le projet
echo -e "\n${YELLOW}Analyse complète des imports problématiques...${NC}"

# Imports avec extension .js explicite
JS_IMPORTS=$(grep -r --include="*.js" --include="*.jsx" "import.*\.js[\"']" ./src || echo "Aucun")
if [ "$JS_IMPORTS" != "Aucun" ]; then
  echo -e "${RED}⚠️ Imports avec extension .js explicite:${NC}"
  echo "$JS_IMPORTS"
  echo -e "Webpack peut avoir des problèmes avec les extensions explicites."
else
  echo -e "${GREEN}✓ Aucun import avec extension .js explicite${NC}"
fi

# Imports vides restants
EMPTY_IMPORTS=$(grep -r --include="*.js" --include="*.jsx" "from[[:space:]]*['\"][[:space:]]*['\"]" ./src || echo "Aucun")
if [ "$EMPTY_IMPORTS" != "Aucun" ]; then
  echo -e "${RED}⚠️ Imports vides encore présents:${NC}"
  echo "$EMPTY_IMPORTS"
  echo -e "Ces imports sont très probablement la cause de l'erreur 'Empty dependency'."
else
  echo -e "${GREEN}✓ Aucun import vide détecté${NC}"
fi

# 5. Analyse des fichiers JS avec des erreurs de syntaxe
echo -e "\n${YELLOW}Vérification des erreurs de syntaxe JavaScript...${NC}"

# Installer eslint temporairement si nécessaire
if ! command -v eslint &> /dev/null; then
  echo -e "${BLUE}Installation temporaire d'ESLint...${NC}"
  npm install --no-save eslint
fi

# Créer une configuration ESLint temporaire
cat > .eslintrc.temp.json << 'EOL'
{
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "rules": {
    "no-empty": "error",
    "no-unreachable": "error",
    "no-unused-vars": "off",
    "no-undef": "off"
  }
}
EOL

# Exécuter ESLint sur quelques fichiers clés
echo -e "${BLUE}Analyse des fichiers clés avec ESLint...${NC}"
npx eslint --no-eslintrc -c .eslintrc.temp.json ./src/firebase.js ./src/index.js ./src/App.js 2>&1 | tee "$REPORT_DIR/eslint_key_files.txt"

# Nettoyer
rm .eslintrc.temp.json

# 6. Analyse du processus de build
echo -e "\n${YELLOW}Analyse du processus de build...${NC}"

# Créer un fichier pour capturer la sortie du build
BUILD_LOG="$REPORT_DIR/build_log.txt"

echo -e "${BLUE}Exécution d'un build avec sortie détaillée...${NC}"
echo -e "${BLUE}Cela peut prendre un moment...${NC}"

# Exécuter le build avec le mode verbose
WEBPACK_LOGS=verbose npm run build 2>&1 | tee "$BUILD_LOG"

# Analyse du log de build
echo -e "\n${BLUE}Analyse du log de build...${NC}"

# Chercher l'erreur spécifique
ERROR_LINES=$(grep -A 10 -B 10 "Empty dependency" "$BUILD_LOG" || echo "Erreur non trouvée")

if [ "$ERROR_LINES" != "Erreur non trouvée" ]; then
  echo -e "${RED}⚠️ Erreur 'Empty dependency' trouvée dans le log:${NC}"
  echo "$ERROR_LINES"
  
  # Rechercher le fichier mentionné dans l'erreur
  ERROR_FILE=$(echo "$ERROR_LINES" | grep -o "in .*" | head -1 || echo "Fichier non mentionné")
  if [ "$ERROR_FILE" != "Fichier non mentionné" ]; then
    echo -e "\n${BLUE}Fichier impliqué dans l'erreur:${NC} $ERROR_FILE"
  fi
else
  echo -e "${GREEN}✓ Aucune erreur 'Empty dependency' trouvée dans le log${NC}"
  
  # Vérifier s'il y a d'autres erreurs
  OTHER_ERRORS=$(grep -i "error" "$BUILD_LOG" | grep -v "^npm ERR" || echo "Aucune autre erreur")
  if [ "$OTHER_ERRORS" != "Aucune autre erreur" ]; then
    echo -e "${RED}⚠️ Autres erreurs détectées:${NC}"
    echo "$OTHER_ERRORS"
  fi
fi

# 7. Résumé et recommandations
echo -e "\n${BLUE}=== RÉSUMÉ ET RECOMMANDATIONS ===${NC}"

echo -e "Rapport complet disponible dans le dossier: $REPORT_DIR"

# Problèmes potentiels identifiés
PROBLEMS_FOUND=0

# Vérifier si des problèmes critiques ont été trouvés
if [ -n "$EMPTY_IMPORTS" ] && [ "$EMPTY_IMPORTS" != "Aucun" ]; then
  echo -e "\n${RED}PROBLÈME CRITIQUE: Imports vides détectés${NC}"
  echo -e "Solution: Remplacez tous les imports vides par les chemins corrects"
  PROBLEMS_FOUND=1
fi

if ! [ -f "./src/firebase.js" ]; then
  echo -e "\n${RED}PROBLÈME CRITIQUE: Fichier firebase.js non trouvé à l'emplacement attendu${NC}"
  echo -e "Solution: Vérifiez le chemin correct du fichier firebase.js"
  PROBLEMS_FOUND=1
fi

if [ $(echo "$FIREBASE_FILES" | wc -l) -gt 1 ]; then
  echo -e "\n${RED}PROBLÈME CRITIQUE: Plusieurs versions de firebase.js${NC}"
  echo -e "Solution: Conservez une seule version du fichier avec le nom exact"
  PROBLEMS_FOUND=1
fi

if [ "$PROBLEMS_FOUND" -eq 0 ]; then
  echo -e "\n${GREEN}Aucun problème critique évident n'a été identifié.${NC}"
  echo -e "L'erreur pourrait provenir d'une combinaison subtile de facteurs ou d'un problème spécifique à votre environnement."
  
  echo -e "\n${YELLOW}Recommandations générales:${NC}"
  echo -e "1. Réorganisez firebase.js comme suggéré précédemment"
  echo -e "2. Nettoyez tous les imports pour utiliser '@firebase' de manière cohérente"
  echo -e "3. Vérifiez que les modules requis par Firebase sont correctement installés"
  echo -e "4. Essayez de revenir à une version stable de Firebase (9.17.2 est recommandée)"
fi

echo -e "\n${BLUE}Commande pour nettoyer et reconstruire:${NC}"
echo -e "rm -rf node_modules/.cache && npm run build"

echo -e "\n${BLUE}=== FIN DE L'ANALYSE ===${NC}"
