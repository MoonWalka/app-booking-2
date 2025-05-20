#!/bin/bash
# Script pour migrer les boutons Bootstrap vers les boutons TourCraft
# Ce script va remplacer les classes Bootstrap par les classes TourCraft

# Couleurs pour la sortie
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Migration des boutons Bootstrap vers TourCraft ===${NC}"
echo -e "${YELLOW}Ce script va remplacer les classes Bootstrap par les classes TourCraft standard${NC}"

# 1. Remplacer les imports de react-bootstrap Button par le composant Button personnalisé
echo -e "\n${CYAN}1. Remplacement des imports de Button${NC}"
find src/components/parametres -type f -name "*.js" -exec grep -l "import { Button } from 'react-bootstrap'" {} \; | while read file; do
  echo -e "${YELLOW}Traitement de ${file}${NC}"
  sed -i '' 's/import { Button } from '\''react-bootstrap'\''/import Button from '\''@components\/ui\/Button'\''/g' "$file"
  echo -e "${GREEN}✓ Import de Button modifié dans ${file}${NC}"
done

# 2. Remplacer les classes bootstrap btn classiques par tc-btn
echo -e "\n${CYAN}2. Remplacement des classes .btn par .tc-btn${NC}"
find src/components -type f -name "*.js" -o -name "*.jsx" -exec grep -l "className=\"btn " {} \; | while read file; do
  echo -e "${YELLOW}Traitement de ${file}${NC}"
  sed -i '' 's/className="btn /className="tc-btn /g' "$file"
  sed -i '' 's/className="btn-/className="tc-btn-/g' "$file"
  sed -i '' 's/className={`btn /className={`tc-btn /g' "$file"
  echo -e "${GREEN}✓ Classes btn modifiées dans ${file}${NC}"
done

echo -e "\n${CYAN}3. Remplacement des classes btn-primary par tc-btn-primary et autres variantes${NC}"
find src/components -type f -name "*.js" -o -name "*.jsx" -exec grep -l "btn-primary" {} \; | while read file; do
  echo -e "${YELLOW}Traitement de ${file}${NC}"
  sed -i '' 's/btn-primary/tc-btn-primary/g' "$file"
  sed -i '' 's/btn-secondary/tc-btn-secondary/g' "$file"
  sed -i '' 's/btn-success/tc-btn-success/g' "$file"
  sed -i '' 's/btn-danger/tc-btn-danger/g' "$file"
  sed -i '' 's/btn-warning/tc-btn-warning/g' "$file"
  sed -i '' 's/btn-info/tc-btn-info/g' "$file"
  sed -i '' 's/btn-light/tc-btn-light/g' "$file"
  sed -i '' 's/btn-dark/tc-btn-dark/g' "$file"
  sed -i '' 's/btn-outline-primary/tc-btn-outline-primary/g' "$file"
  sed -i '' 's/btn-outline-secondary/tc-btn-outline-secondary/g' "$file"
  sed -i '' 's/btn-outline-success/tc-btn-outline-success/g' "$file"
  sed -i '' 's/btn-outline-danger/tc-btn-outline-danger/g' "$file"
  sed -i '' 's/btn-outline-warning/tc-btn-outline-warning/g' "$file"
  sed -i '' 's/btn-outline-info/tc-btn-outline-info/g' "$file"
  sed -i '' 's/btn-outline-light/tc-btn-outline-light/g' "$file"
  sed -i '' 's/btn-outline-dark/tc-btn-outline-dark/g' "$file"
  echo -e "${GREEN}✓ Variantes de boutons modifiées dans ${file}${NC}"
done

echo -e "\n${CYAN}4. Remplacement des classes btn-sm et btn-lg${NC}"
find src/components -type f -name "*.js" -o -name "*.jsx" -exec grep -l "btn-sm\|btn-lg" {} \; | while read file; do
  echo -e "${YELLOW}Traitement de ${file}${NC}"
  sed -i '' 's/btn-sm/tc-btn-sm/g' "$file"
  sed -i '' 's/btn-lg/tc-btn-lg/g' "$file"
  echo -e "${GREEN}✓ Tailles de boutons modifiées dans ${file}${NC}"
done

echo -e "\n${CYAN}Migration terminée!${NC}"
echo -e "${YELLOW}Vérifiez les modifications et testez l'application.${NC}"
