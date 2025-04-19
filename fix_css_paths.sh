#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Correction automatique des chemins CSS problématiques ===${NC}\n"

# 1. Correction du cas spécifique
PROG_LIST_FILE="src/components/programmateurs/desktop/ProgrammateursList.js"
if [ -f "$PROG_LIST_FILE" ]; then
    echo -e "${YELLOW}Correction de $PROG_LIST_FILE...${NC}"
    # Sauvegarder le fichier
    cp "$PROG_LIST_FILE" "${PROG_LIST_FILE}.fix_bak"
    
    # Calculer le chemin relatif correct
    CORRECT_PATH=$(python3 -c "import os.path; print(os.path.relpath('$(pwd)/src/style/programmateursList.css', '$(dirname "$PROG_LIST_FILE")'))")
    
    # Remplacer le chemin incorrect
    sed -i '' "s|'../style/programmateursList.css'|'${CORRECT_PATH}'|g" "$PROG_LIST_FILE"
    echo -e "${GREEN}✓ Chemin corrigé: ${NC}${CORRECT_PATH}"
else
    echo -e "${RED}Le fichier $PROG_LIST_FILE n'existe pas${NC}"
fi

# 2. Correction automatique de tous les autres chemins CSS problématiques
echo -e "\n${YELLOW}Recherche et correction automatique des autres imports CSS problématiques...${NC}"

# Liste des fichiers CSS disponibles dans src/style
CSS_FILES=$(find ./src/style -name "*.css" -type f)
CSS_NAMES=$(find ./src/style -name "*.css" -type f -exec basename {} \; | sort)
echo -e "${BLUE}Fichiers CSS disponibles dans src/style:${NC}"
for css in $CSS_NAMES; do
    echo "- $css"
done

# Création d'un tableau associatif des noms de fichiers CSS
declare -A CSS_MAP
for css_file in $CSS_FILES; do
    base_name=$(basename "$css_file")
    CSS_MAP["$base_name"]="$css_file"
done

# Compter le nombre de corrections
CORRECTIONS_COUNT=0

# Rechercher et corriger les imports CSS problématiques
echo -e "\n${YELLOW}Vérification et correction des imports CSS...${NC}"
find ./src -type f \( -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    DIR=$(dirname "$file")
    FILE_MODIFIED=false
    
    # Créer un fichier temporaire pour les modifications
    TMP_FILE=$(mktemp)
    cp "$file" "$TMP_FILE"
    
    # Rechercher les lignes avec des imports CSS
    grep -n "import.*\.css['\"]" "$file" | while read -r line_info; do
        LINE_NUM=$(echo "$line_info" | cut -d: -f1)
        LINE_CONTENT=$(echo "$line_info" | cut -d: -f2-)
        
        # Extraire le chemin CSS
        CSS_PATH=$(echo "$LINE_CONTENT" | sed -E "s/.*['\"]([^'\"]*\.css)['\"].*/\1/")
        
        # Vérifier si le chemin est problématique
        if [[ "$CSS_PATH" == "../"* ]] && ! [ -f "$DIR/$CSS_PATH" ]; then
            # C'est un chemin problématique, extraire le nom du fichier CSS
            CSS_FILE=$(basename "$CSS_PATH")
            
            # Rechercher le fichier CSS dans src/style
            if [ -f "src/style/$CSS_FILE" ]; then
                # Calculer le chemin relatif correct
                CORRECT_PATH=$(python3 -c "import os.path; print(os.path.relpath('$(pwd)/src/style/$CSS_FILE', '$DIR'))")
                
                # Remplacer le chemin dans le fichier temporaire
                sed -i '' "s|'$CSS_PATH'|'$CORRECT_PATH'|g" "$TMP_FILE"
                
                echo -e "${GREEN}✓ Fichier: $file${NC}"
                echo -e "  Ancien chemin: ${RED}$CSS_PATH${NC}"
                echo -e "  Nouveau chemin: ${GREEN}$CORRECT_PATH${NC}"
                
                FILE_MODIFIED=true
                CORRECTIONS_COUNT=$((CORRECTIONS_COUNT + 1))
            else
                # Cas spécial: fichier CSS non trouvé dans src/style
                if [[ "$CSS_PATH" == *"Mobile.css" ]] && [ -f "src/style/${CSS_FILE/Mobile/sMobile}" ]; then
                    # Cas particulier: artisteDetailMobile.css vs artisteDetailsMobile.css
                    CORRECT_CSS="${CSS_FILE/Mobile/sMobile}"
                    CORRECT_PATH=$(python3 -c "import os.path; print(os.path.relpath('$(pwd)/src/style/$CORRECT_CSS', '$DIR'))")
                    
                    sed -i '' "s|'$CSS_PATH'|'$CORRECT_PATH'|g" "$TMP_FILE"
                    
                    echo -e "${GREEN}✓ Fichier: $file${NC}"
                    echo -e "  Correction spéciale: ${RED}$CSS_PATH${NC} -> ${GREEN}$CORRECT_PATH${NC}"
                    
                    FILE_MODIFIED=true
                    CORRECTIONS_COUNT=$((CORRECTIONS_COUNT + 1))
                else
                    echo -e "${YELLOW}⚠️ Fichier: $file${NC}"
                    echo -e "  Chemin non trouvé: ${RED}$CSS_PATH${NC}"
                fi
            fi
        fi
    done
    
    # Si le fichier a été modifié, sauvegarder la version originale et appliquer les modifications
    if [ "$FILE_MODIFIED" = true ]; then
        cp "$file" "${file}.fix_bak"
        mv "$TMP_FILE" "$file"
    else
        rm "$TMP_FILE"
    fi
done

# Correction spécifique pour le cas artisteDetailMobile.css
echo -e "\n${YELLOW}Vérification des cas spéciaux...${NC}"
ARTISTE_DETAIL_MOBILE="src/components/artistes/mobile/ArtisteDetail.js"
if [ -f "$ARTISTE_DETAIL_MOBILE" ]; then
    if grep -q "artisteDetailMobile.css" "$ARTISTE_DETAIL_MOBILE"; then
        cp "$ARTISTE_DETAIL_MOBILE" "${ARTISTE_DETAIL_MOBILE}.fix_bak"
        CORRECT_PATH=$(python3 -c "import os.path; print(os.path.relpath('$(pwd)/src/style/artisteDetailsMobile.css', '$(dirname "$ARTISTE_DETAIL_MOBILE")'))")
        sed -i '' "s|'../../../style/artisteDetailMobile.css'|'$CORRECT_PATH'|g" "$ARTISTE_DETAIL_MOBILE"
        echo -e "${GREEN}✓ Correction spéciale pour artisteDetailMobile.css${NC}"
        CORRECTIONS_COUNT=$((CORRECTIONS_COUNT + 1))
    fi
fi

# Nettoyer le cache
echo -e "\n${YELLOW}Nettoyage du cache...${NC}"
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache nettoyé${NC}"

echo -e "\n${BLUE}=== Récapitulatif ===${NC}"
echo -e "${GREEN}✓ $CORRECTIONS_COUNT chemins CSS corrigés${NC}"
echo -e "${YELLOW}Des sauvegardes ont été créées (.fix_bak) pour tous les fichiers modifiés${NC}"

echo -e "\n${BLUE}=== Script terminé ===${NC}"
echo -e "${YELLOW}Testez maintenant la compilation avec:${NC}"
echo -e "${BLUE}npm run build${NC}"
