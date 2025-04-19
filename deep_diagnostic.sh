#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Analyse complète et résolution des problèmes d'import ===${NC}\n"

# Créer un rapport détaillé
REPORT_DIR="diagnostic_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPORT_DIR"
REPORT_FILE="$REPORT_DIR/diagnostic_report.md"

echo "# Rapport de diagnostic d'importation" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. Collecter tous les imports dans les fichiers JS/JSX
echo -e "${YELLOW}Collecte de tous les imports dans les fichiers JS/JSX...${NC}"
echo "## Imports collectés" >> "$REPORT_FILE"

# Créer une liste de tous les imports
ALL_IMPORTS_FILE="$REPORT_DIR/all_imports.txt"
find ./src -type f \( -name "*.js" -o -name "*.jsx" \) -exec grep -l "import" {} \; | while read -r file; do
    grep "import.*from" "$file" | while read -r import_line; do
        echo "$file: $import_line" >> "$ALL_IMPORTS_FILE"
    done
done

echo -e "${GREEN}✓ Imports collectés${NC}"

# 2. Collecter tous les fichiers disponibles
echo -e "\n${YELLOW}Collecte de tous les fichiers disponibles...${NC}"
echo "## Fichiers disponibles" >> "$REPORT_FILE"

ALL_FILES_FILE="$REPORT_DIR/all_files.txt"
find ./src -type f | sort > "$ALL_FILES_FILE"

echo -e "${GREEN}✓ Liste des fichiers créée${NC}"

# 3. Identifier les imports de fichiers CSS
echo -e "\n${YELLOW}Analyse des imports CSS...${NC}"
echo "## Imports CSS" >> "$REPORT_FILE"

CSS_IMPORTS_FILE="$REPORT_DIR/css_imports.txt"
grep "\.css" "$ALL_IMPORTS_FILE" > "$CSS_IMPORTS_FILE"

echo -e "${GREEN}✓ Imports CSS identifiés${NC}"

# 4. Vérifier les imports CSS par rapport aux fichiers disponibles
echo -e "\n${YELLOW}Vérification des imports CSS...${NC}"
echo "## Problèmes d'imports CSS identifiés" >> "$REPORT_FILE"

PROBLEMATIC_IMPORTS_FILE="$REPORT_DIR/problematic_imports.txt"
FIXED_IMPORTS_FILE="$REPORT_DIR/fixed_imports.txt"

while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    import_stmt=$(echo "$line" | cut -d: -f2- | xargs)
    
    # Extraire le chemin du fichier CSS importé
    css_path=$(echo "$import_stmt" | sed -E "s/.*['\"]([^'\"]*\.css)['\"].*/\1/")
    
    # Chemin complet du fichier qui importe
    importing_file="$file"
    importing_dir=$(dirname "$importing_file")
    
    # Chemin absolu du fichier CSS (si c'est un chemin relatif)
    absolute_css_path=""
    if [[ "$css_path" == /* ]]; then
        absolute_css_path=".$css_path"
    elif [[ "$css_path" == ./* ]]; then
        absolute_css_path=$(realpath --relative-to="." "$importing_dir/$css_path")
    elif [[ "$css_path" == ../* ]]; then
        absolute_css_path=$(realpath --relative-to="." "$importing_dir/$css_path")
    else
        # C'est probablement un module npm ou un alias
        continue
    fi
    
    # Vérifier si le fichier existe
    if [ ! -f "$absolute_css_path" ]; then
        echo "$importing_file -> $css_path (n'existe pas)" >> "$PROBLEMATIC_IMPORTS_FILE"
        
        # Extraire le nom du fichier CSS
        css_filename=$(basename "$css_path")
        
        # Chercher ce fichier dans src/style
        possible_css_file=$(find ./src/style -name "$css_filename" -type f)
        
        if [ -n "$possible_css_file" ]; then
            # Calculer le chemin relatif correct
            correct_path=$(python3 -c "import os.path; print(os.path.relpath('$(realpath "$possible_css_file")', '$(realpath "$importing_dir")'))")
            
            echo "$importing_file: $css_path -> $correct_path" >> "$FIXED_IMPORTS_FILE"
            
            # Corriger l'import dans le fichier
            escaped_css_path=$(echo "$css_path" | sed 's/\//\\\//g')
            sed -i '' "s|['\"]$escaped_css_path['\"]|'$correct_path'|g" "$importing_file"
            
            echo -e "${GREEN}✓ Corrigé: $importing_file${NC}"
            echo -e "  De: ${RED}$css_path${NC}"
            echo -e "  À: ${GREEN}$correct_path${NC}"
        else
            echo -e "${RED}✗ Impossible de trouver $css_filename dans src/style${NC}"
            echo "- $importing_file -> $css_path (introuvable)" >> "$REPORT_FILE"
        fi
    fi
done < "$CSS_IMPORTS_FILE"

# 5. Génération du rapport final
echo -e "\n${YELLOW}Génération du rapport final...${NC}"

# Nombre de problèmes identifiés
PROBLEM_COUNT=$(wc -l < "$PROBLEMATIC_IMPORTS_FILE" || echo "0")
FIXED_COUNT=$(wc -l < "$FIXED_IMPORTS_FILE" || echo "0")

echo "## Résumé" >> "$REPORT_FILE"
echo "- **Problèmes d'import identifiés**: $PROBLEM_COUNT" >> "$REPORT_FILE"
echo "- **Problèmes corrigés**: $FIXED_COUNT" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Ajouter les détails des corrections
echo "## Détails des corrections" >> "$REPORT_FILE"
cat "$FIXED_IMPORTS_FILE" >> "$REPORT_FILE"

# 6. Explication détaillée des problèmes restants
echo "## Problèmes non résolus" >> "$REPORT_FILE"
echo "Les fichiers suivants n'ont pas pu être trouvés dans votre projet :" >> "$REPORT_FILE"

while IFS= read -r line; do
    # Vérifiez si la ligne existe dans la liste des corrections
    if ! grep -q "$(echo "$line" | cut -d '>' -f 1)" "$FIXED_IMPORTS_FILE"; then
        echo "- $line" >> "$REPORT_FILE"
    fi
done < "$PROBLEMATIC_IMPORTS_FILE"

# 7. Vérification du fichier spécifique mentionné dans l'erreur
echo -e "\n${YELLOW}Vérification spécifique du fichier ProgrammateurDetails.js...${NC}"
PROG_DETAILS_FILE="src/components/programmateurs/desktop/ProgrammateurDetails.js"

if [ -f "$PROG_DETAILS_FILE" ]; then
    echo -e "${BLUE}Contenu de $PROG_DETAILS_FILE:${NC}"
    grep "import.*css" "$PROG_DETAILS_FILE" || echo "Aucun import CSS trouvé"
    
    # Vérifier spécifiquement l'import programmateurForm.css
    if grep -q "programmateurForm.css" "$PROG_DETAILS_FILE"; then
        echo -e "${YELLOW}Import problématique trouvé. Tentative de correction forcée...${NC}"
        
        # Sauvegarde du fichier
        cp "$PROG_DETAILS_FILE" "${PROG_DETAILS_FILE}.forced_bak"
        
        # Correction forcée
        sed -i '' "s|'../../style/programmateurForm.css'|'../../../style/programmateurForm.css'|g" "$PROG_DETAILS_FILE"
        
        echo -e "${GREEN}✓ Correction forcée appliquée${NC}"
    fi
else
    echo -e "${RED}✗ Le fichier $PROG_DETAILS_FILE n'existe pas${NC}"
fi

# 8. Nettoyage du cache
echo -e "\n${YELLOW}Nettoyage du cache...${NC}"
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache nettoyé${NC}"

echo -e "\n${BLUE}=== Rapport de diagnostic ===${NC}"
echo -e "${GREEN}Le rapport complet est disponible dans: $REPORT_FILE${NC}"
echo -e "${YELLOW}$PROBLEM_COUNT problèmes identifiés${NC}"
echo -e "${GREEN}$FIXED_COUNT problèmes corrigés${NC}"

echo -e "\n${BLUE}=== Script terminé ===${NC}"
echo -e "${YELLOW}Testez maintenant la compilation avec:${NC}"
echo -e "${BLUE}npm run build${NC}"
