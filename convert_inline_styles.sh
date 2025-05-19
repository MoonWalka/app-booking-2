#!/bin/bash

# Script pour convertir les styles inline en classes typography.css
# Utilisation: ./convert_inline_styles.sh

# Vérifier si Node.js est installé
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Erreur: Node.js est requis pour exécuter ce script."
  exit 1
fi

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Bannière
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}= Conversion des styles inline en classes =${NC}"
echo -e "${BLUE}============================================${NC}"

# Vérifier si le répertoire scripts existe
if [ ! -d "./scripts" ]; then
  echo -e "${YELLOW}Création du répertoire scripts...${NC}"
  mkdir -p ./scripts
fi

# Vérifier si le fichier de script Node.js existe
if [ ! -f "./scripts/inline_to_typography_classes.js" ]; then
  echo -e "${RED}❌ Erreur: Le fichier de script inline_to_typography_classes.js est manquant.${NC}"
  exit 1
fi

# Créer un répertoire de sauvegarde avec horodatage
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./inline_styles_backup_${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Création du répertoire de sauvegarde: ${BACKUP_DIR}${NC}"

# Vérifier si glob est installé, sinon l'installer
if ! node -e "require('glob')" 2>/dev/null; then
  echo -e "${YELLOW}Installation du module 'glob'...${NC}"
  npm install glob --no-save
fi

# Copier les fichiers JS/JSX actuels dans le répertoire de sauvegarde
echo -e "${YELLOW}Sauvegarde des fichiers originaux...${NC}"
find ./src -type f \( -name "*.js" -o -name "*.jsx" \) -exec cp --parents {} "$BACKUP_DIR" \;

# Exécuter le script de conversion
echo -e "${YELLOW}Exécution du script de conversion...${NC}"
node ./scripts/inline_to_typography_classes.js

# Vérifier si le script s'est exécuté avec succès
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Conversion terminée avec succès!${NC}"
  echo -e "${YELLOW}Pour restaurer les fichiers originaux, exécutez:${NC}"
  echo -e "${BLUE}  cp -r ${BACKUP_DIR}/* ./  ${NC}"
else
  echo -e "${RED}❌ Une erreur s'est produite lors de la conversion.${NC}"
  echo -e "${YELLOW}Les fichiers originaux sont sauvegardés dans: ${BACKUP_DIR}${NC}"
fi

echo -e "${BLUE}============================================${NC}"
