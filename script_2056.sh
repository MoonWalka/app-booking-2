#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Conversion vers les chemins relatifs standards ===${NC}\n"

# 1. Sauvegarder les fichiers importants
echo -e "${YELLOW}Sauvegarde des fichiers importants...${NC}"
cp craco.config.js craco.config.js.bak
echo -e "${GREEN}✓ Sauvegarde terminée${NC}"

# 2. Créer un craco.config.js minimal sans alias
echo -e "\n${YELLOW}Création d'un craco.config.js minimal...${NC}"
cat > craco.config.js << 'EOL'
module.exports = {
  // Configuration minimale sans alias
  webpack: {
    configure: (webpackConfig) => {
      // Ajout de polyfills minimaux nécessaires
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "path": false,
        "fs": false,
        "os": false
      };
      return webpackConfig;
    }
  }
};
EOL
echo -e "${GREEN}✓ craco.config.js simplifié${NC}"

# 3. Convertir les imports avec alias en imports relatifs
echo -e "\n${YELLOW}Conversion des imports @firebase...${NC}"
find ./src -type f -name "*.js" -o -name "*.jsx" | xargs grep -l "from '@firebase'" | while read file; do
  echo "Traitement de $file"
  # Calculer le chemin relatif vers src/firebase.js
  rel_path=$(python3 -c "import os.path; print(os.path.relpath('$(pwd)/src/firebase.js', '$(dirname "$file")'))")
  # Remplacer les imports @firebase par le chemin relatif
  sed -i '' "s|from '@firebase'|from '$rel_path'|g" "$file"
done
echo -e "${GREEN}✓ Imports @firebase convertis${NC}"

# 4. Nettoyer le cache
echo -e "\n${YELLOW}Nettoyage du cache...${NC}"
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache nettoyé${NC}"

echo -e "\n${BLUE}=== Script terminé ===${NC}"
echo -e "${YELLOW}Testez maintenant la compilation avec:${NC}"
echo -e "${BLUE}npm run build${NC}"
