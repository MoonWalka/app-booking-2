#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Correction systématique de tous les imports CSS problématiques ===${NC}\n"

# 1. Sauvegarde de tous les fichiers JS/JSX modifiés
echo -e "${YELLOW}Création d'une sauvegarde...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"
find ./src -type f \( -name "*.js" -o -name "*.jsx" \) | xargs -I{} cp {} "$BACKUP_DIR/"
echo -e "${GREEN}✓ Sauvegarde créée dans $BACKUP_DIR${NC}"

# 2. Identifier tous les imports CSS
echo -e "\n${YELLOW}Recherche de tous les imports CSS...${NC}"
CSS_IMPORTS=$(grep -r --include="*.js" --include="*.jsx" "import.*\.css" ./src)
echo -e "${GREEN}✓ Imports CSS identifiés${NC}"

# 3. Correction systématique pour tous les composants dans les dossiers desktop et mobile
echo -e "\n${YELLOW}Correction des imports CSS dans les dossiers desktop et mobile...${NC}"
CORRECTIONS=0

# a. Corriger les imports dans les dossiers desktop
find ./src/components -path "*/desktop/*.js" -o -path "*/desktop/*.jsx" | while read -r file; do
    if grep -q "import.*\.\.\/\.\.\/style" "$file"; then
        cp "$file" "${file}.systematic_bak"
        sed -i '' "s|'../../style/|'../../../style/|g" "$file"
        echo -e "${GREEN}✓ Corrigé: $file${NC}"
        CORRECTIONS=$((CORRECTIONS + 1))
    fi
done

# b. Corriger les imports dans les dossiers mobile
find ./src/components -path "*/mobile/*.js" -o -path "*/mobile/*.jsx" | while read -r file; do
    if grep -q "import.*\.\.\/\.\.\/style" "$file"; then
        cp "$file" "${file}.systematic_bak"
        sed -i '' "s|'../../style/|'../../../style/|g" "$file"
        echo -e "${GREEN}✓ Corrigé: $file${NC}"
        CORRECTIONS=$((CORRECTIONS + 1))
    fi
done

# 4. Correction pour les composants au niveau du dossier principal de chaque type
echo -e "\n${YELLOW}Correction des imports CSS dans les composants principaux...${NC}"
find ./src/components -maxdepth 2 -name "*.js" -o -name "*.jsx" | while read -r file; do
    if grep -q "import.*\.\.\/style" "$file"; then
        cp "$file" "${file}.systematic_bak"
        sed -i '' "s|'../style/|'../../style/|g" "$file"
        echo -e "${GREEN}✓ Corrigé: $file${NC}"
        CORRECTIONS=$((CORRECTIONS + 1))
    fi
done

# 5. Cas particulier: composer/steps et composer/layout
echo -e "\n${YELLOW}Correction des cas particuliers...${NC}"
find ./src/components -path "*/steps/*.js" -o -path "*/layout/*.js" | while read -r file; do
    if grep -q "import.*\.\.\/\.\.\/style" "$file"; then
        cp "$file" "${file}.systematic_bak"
        sed -i '' "s|'../../style/|'../../../style/|g" "$file"
        echo -e "${GREEN}✓ Corrigé: $file${NC}"
        CORRECTIONS=$((CORRECTIONS + 1))
    fi
done

# 6. Pour chaque import CSS restant, calculer le chemin relatif correct
echo -e "\n${YELLOW}Analyse des imports CSS restants...${NC}"
find ./src -type f \( -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    # Extraire les chemins CSS relatifs
    CSS_PATHS=$(grep -o "import.*['\"][^'\"]*\.css['\"]" "$file" | sed -E "s/.*['\"]([^'\"]*\.css)['\"].*/\1/")
    
    if [ -n "$CSS_PATHS" ]; then
        # Pour chaque chemin CSS
        echo "$CSS_PATHS" | while read -r css_path; do
            # Calculer le chemin complet
            file_dir=$(dirname "$file")
            absolute_css_path="$file_dir/$css_path"
            
            # Vérifier si le fichier existe
            if [ ! -f "$absolute_css_path" ]; then
                # Le fichier n'existe pas, chercher dans src/style
                css_filename=$(basename "$css_path")
                if [ -f "src/style/$css_filename" ]; then
                    # Calculer le chemin relatif correct
                    correct_path=$(python3 -c "import os.path; print(os.path.relpath('$(pwd)/src/style/$css_filename', '$(pwd)/$file_dir'))")
                    
                    # Remplacer dans le fichier
                    cp "$file" "${file}.fix_bak"
                    sed -i '' "s|'$css_path'|'$correct_path'|g" "$file"
                    echo -e "${GREEN}✓ Corrigé chemin spécifique dans $file: $css_path -> $correct_path${NC}"
                    CORRECTIONS=$((CORRECTIONS + 1))
                fi
            fi
        done
    fi
done

# 7. Double vérification des cas problématiques connus
echo -e "\n${YELLOW}Double vérification des cas problématiques connus...${NC}"
KNOWN_PROBLEMATIC=(
    "src/components/lieux/desktop/LieuDetails.js:../../style/lieuForm.css"
    "src/components/programmateurs/desktop/ProgrammateurDetails.js:../../style/programmateurForm.css"
    "src/components/contrats/desktop/ContratTemplateEditor.js:../../style/contratTemplateEditor.css"
    "src/components/contrats/desktop/ContratGenerator.js:../../style/contratGenerator.css"
)

for problem in "${KNOWN_PROBLEMATIC[@]}"; do
    file=$(echo "$problem" | cut -d: -f1)
    css_path=$(echo "$problem" | cut -d: -f2)
    
    if [ -f "$file" ]; then
        if grep -q "$css_path" "$file"; then
            cp "$file" "${file}.known_bak"
            correct_path=$(echo "$css_path" | sed 's/\.\.\/\.\.\//\.\.\/\.\.\/\.\.\//g')
            sed -i '' "s|'$css_path'|'$correct_path'|g" "$file"
            echo -e "${GREEN}✓ Corrigé cas connu dans $file: $css_path -> $correct_path${NC}"
            CORRECTIONS=$((CORRECTIONS + 1))
        fi
    fi
done

# 8. Dernière vérification - tous les composants dans des sous-dossiers
echo -e "\n${YELLOW}Dernière vérification globale...${NC}"
find ./src/components -mindepth 3 -type f \( -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    if grep -q "import.*\.\.\/\.\.\/style" "$file"; then
        cp "$file" "${file}.final_bak"
        sed -i '' "s|'../../style/|'../../../style/|g" "$file"
        echo -e "${GREEN}✓ Corrigé dans vérification finale: $file${NC}"
        CORRECTIONS=$((CORRECTIONS + 1))
    fi
done

# 9. Nettoyer le cache
echo -e "\n${YELLOW}Nettoyage du cache...${NC}"
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache nettoyé${NC}"

echo -e "\n${BLUE}=== Récapitulatif ===${NC}"
echo -e "${GREEN}✓ $CORRECTIONS corrections appliquées${NC}"
echo -e "${YELLOW}Une sauvegarde complète a été créée dans $BACKUP_DIR${NC}"

echo -e "\n${BLUE}=== Script terminé ===${NC}"
echo -e "${YELLOW}Testez maintenant la compilation avec:${NC}"
echo -e "${BLUE}npm run build${NC}"
