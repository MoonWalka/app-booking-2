#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="import_analysis_$TIMESTAMP.log"
REPORT_FILE="import_report_$TIMESTAMP.md"

echo -e "${BLUE}=== Analyse complète et correction des imports dans le projet ===${NC}" | tee -a "$LOG_FILE"
echo -e "Date: $(date)" | tee -a "$LOG_FILE"

# Fonction pour calculer le chemin relatif entre deux fichiers
calculate_relative_path() {
    local from_dir="$1"
    local to_file="$2"
    python3 -c "import os.path; print(os.path.relpath('$to_file', '$from_dir'))"
}

# Fonction pour vérifier si un fichier existe
file_exists() {
    local file="$1"
    if [ -f "$file" ]; then
        return 0  # Vrai
    else
        return 1  # Faux
    fi
}

# Créer un rapport au format Markdown
echo "# Rapport d'analyse des imports" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Résumé des problèmes" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Compter les problèmes
PROBLEMS_COUNT=0
FIXED_COUNT=0

# 1. Trouver tous les fichiers JS/JSX dans le projet
echo -e "\n${YELLOW}Recherche de tous les fichiers JS/JSX...${NC}" | tee -a "$LOG_FILE"
JS_FILES=$(find ./src -type f \( -name "*.js" -o -name "*.jsx" \))
FILE_COUNT=$(echo "$JS_FILES" | wc -l)
echo -e "${BLUE}$FILE_COUNT fichiers trouvés${NC}" | tee -a "$LOG_FILE"

echo -e "${GREEN}✓ Analyse prête${NC}" | tee -a "$LOG_FILE"

# 2. Analyser chaque fichier pour les imports
echo -e "\n${YELLOW}Analyse des imports dans chaque fichier...${NC}" | tee -a "$LOG_FILE"
echo "" >> "$REPORT_FILE"
echo "## Problèmes détectés par fichier" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

for file in $JS_FILES; do
    file_problems=0
    file_fixed=0
    
    # Obtenir tous les imports dans ce fichier
    imports=$(grep -o "import.*from[[:space:]]*['\"][^'\"]*['\"]" "$file" || true)
    
    if [ -n "$imports" ]; then
        # Extraire le chemin du fichier qui importe
        importing_file="$file"
        importing_dir=$(dirname "$importing_file")
        
        # Pour chaque import
        echo "$imports" | while read -r import_line; do
            # Extraire le chemin importé
            imported_path=$(echo "$import_line" | sed -E "s/.*from[[:space:]]*['\"]([^'\"]*)['\"].*/\1/")
            
            # Ignorer les imports de modules npm
            if [[ "$imported_path" != "."* && "$imported_path" != "/"* && "$imported_path" != "@"* ]]; then
                continue
            fi
            
            # Gérer les imports avec alias (@)
            if [[ "$imported_path" == "@"* ]]; then
                if [[ "$imported_path" == "@firebase" ]]; then
                    # Vérifier si src/firebase.js existe
                    if ! file_exists "./src/firebase.js"; then
                        echo -e "${RED}✗ Import problématique dans $file: $imported_path (src/firebase.js n'existe pas)${NC}" | tee -a "$LOG_FILE"
                        PROBLEMS_COUNT=$((PROBLEMS_COUNT + 1))
                        file_problems=$((file_problems + 1))
                        echo "- $file: Import \`$imported_path\` - src/firebase.js n'existe pas" >> "$REPORT_FILE"
                    fi
                    continue
                elif [[ "$imported_path" == "@/"* ]]; then
                    # Gérer les imports @/
                    module_path="${imported_path#@/}"
                    full_path="./src/$module_path"
                    
                    # Vérifier sans extension
                    if ! file_exists "$full_path" && ! file_exists "$full_path.js" && ! file_exists "$full_path.jsx"; then
                        echo -e "${RED}✗ Import problématique dans $file: $imported_path (fichier non trouvé)${NC}" | tee -a "$LOG_FILE"
                        PROBLEMS_COUNT=$((PROBLEMS_COUNT + 1))
                        file_problems=$((file_problems + 1))
                        echo "- $file: Import \`$imported_path\` - fichier non trouvé" >> "$REPORT_FILE"
                    fi
                    continue
                else
                    # Autres alias (@components/, @hooks/, etc.)
                    continue
                fi
            fi
            
            # Gérer les imports relatifs
            if [[ "$imported_path" == "./"* || "$imported_path" == "../"* ]]; then
                # Chemin absolu du fichier importé
                absolute_imported_path="$importing_dir/$imported_path"
                
                # Normaliser le chemin
                normalized_path=$(realpath --relative-to="." "$absolute_imported_path" 2>/dev/null || echo "")
                
                # Vérifier si le fichier existe (avec ou sans extension)
                if [ -z "$normalized_path" ] || (! file_exists "$normalized_path" && ! file_exists "$normalized_path.js" && ! file_exists "$normalized_path.jsx" && ! file_exists "$normalized_path/index.js" && ! file_exists "$normalized_path/index.jsx"); then
                    echo -e "${RED}✗ Import problématique dans $file: $imported_path (fichier non trouvé)${NC}" | tee -a "$LOG_FILE"
                    
                    # Extraction du nom de fichier
                    imported_file=$(basename "$imported_path")
                    
                    # S'il s'agit d'un fichier CSS
                    if [[ "$imported_path" == *".css" ]]; then
                        css_name=$(basename "$imported_path")
                        if file_exists "./src/style/$css_name"; then
                            correct_path=$(calculate_relative_path "$importing_dir" "./src/style/$css_name")
                            
                            # Sauvegarder le fichier
                            cp "$file" "${file}.css_bak"
                            
                            # Remplacer l'import
                            escaped_path=$(echo "$imported_path" | sed 's/\//\\\//g')
                            sed -i '' "s|from[[:space:]]*['\"]$escaped_path['\"]|from '$correct_path'|g" "$file"
                            
                            echo -e "${GREEN}✓ Corrigé CSS: $imported_path -> $correct_path${NC}" | tee -a "$LOG_FILE"
                            FIXED_COUNT=$((FIXED_COUNT + 1))
                            file_fixed=$((file_fixed + 1))
                            echo "- $file: Import CSS \`$imported_path\` -> Corrigé vers \`$correct_path\`" >> "$REPORT_FILE"
                        else
                            PROBLEMS_COUNT=$((PROBLEMS_COUNT + 1))
                            file_problems=$((file_problems + 1))
                            echo "- $file: Import CSS \`$imported_path\` - fichier CSS non trouvé" >> "$REPORT_FILE"
                        fi
                    # Cas spécial pour useLocationIQ
                    elif [[ "$imported_path" == *"hooks/useLocationIQ"* ]]; then
                        if file_exists "./src/hooks/useLocationIQ.js"; then
                            correct_path=$(calculate_relative_path "$importing_dir" "./src/hooks/useLocationIQ.js")
                            
                            # Sauvegarder le fichier
                            cp "$file" "${file}.hook_bak"
                            
                            # Remplacer l'import
                            escaped_path=$(echo "$imported_path" | sed 's/\//\\\//g')
                            sed -i '' "s|from[[:space:]]*['\"]$escaped_path['\"]|from '$correct_path'|g" "$file"
                            
                            echo -e "${GREEN}✓ Corrigé hook: $imported_path -> $correct_path${NC}" | tee -a "$LOG_FILE"
                            FIXED_COUNT=$((FIXED_COUNT + 1))
                            file_fixed=$((file_fixed + 1))
                            echo "- $file: Import \`$imported_path\` -> Corrigé vers \`$correct_path\`" >> "$REPORT_FILE"
                        else
                            echo -e "${RED}✗ Hook useLocationIQ non trouvé!${NC}" | tee -a "$LOG_FILE"
                            PROBLEMS_COUNT=$((PROBLEMS_COUNT + 1))
                            file_problems=$((file_problems + 1))
                            echo "- $file: Import \`$imported_path\` - fichier hook non trouvé" >> "$REPORT_FILE"
                        fi
                    else
                        # Chercher dans tout le projet
                        potential_files=$(find ./src -name "$imported_file*" 2>/dev/null || true)
                        
                        # S'il y a des correspondances possibles
                        if [ -n "$potential_files" ]; then
                            echo -e "${YELLOW}  Correspondances possibles:${NC}" | tee -a "$LOG_FILE"
                            echo "$potential_files" | while read -r match; do
                                echo -e "${BLUE}  - $match${NC}" | tee -a "$LOG_FILE"
                            done
                            
                            # Utiliser la première correspondance pour corriger
                            first_match=$(echo "$potential_files" | head -1)
                            if [ -n "$first_match" ]; then
                                correct_path=$(calculate_relative_path "$importing_dir" "$first_match")
                                
                                # Sauvegarder le fichier
                                cp "$file" "${file}.path_bak"
                                
                                # Remplacer l'import
                                escaped_path=$(echo "$imported_path" | sed 's/\//\\\//g')
                                sed -i '' "s|from[[:space:]]*['\"]$escaped_path['\"]|from '$correct_path'|g" "$file"
                                
                                echo -e "${GREEN}✓ Corrigé: $imported_path -> $correct_path${NC}" | tee -a "$LOG_FILE"
                                FIXED_COUNT=$((FIXED_COUNT + 1))
                                file_fixed=$((file_fixed + 1))
                                echo "- $file: Import \`$imported_path\` -> Corrigé vers \`$correct_path\`" >> "$REPORT_FILE"
                            else
                                PROBLEMS_COUNT=$((PROBLEMS_COUNT + 1))
                                file_problems=$((file_problems + 1))
                                echo "- $file: Import \`$imported_path\` - fichier non trouvé, plusieurs correspondances possibles" >> "$REPORT_FILE"
                            fi
                        else
                            PROBLEMS_COUNT=$((PROBLEMS_COUNT + 1))
                            file_problems=$((file_problems + 1))
                            echo "- $file: Import \`$imported_path\` - fichier non trouvé, aucune correspondance" >> "$REPORT_FILE"
                        fi
                    fi
                fi
            fi
        done
    fi
    
    # Ajouter le fichier au rapport s'il a des problèmes
    if [ $file_problems -gt 0 ]; then
        echo -e "${RED}✗ $file_problems problèmes dans $file${NC}" | tee -a "$LOG_FILE"
    fi
    
    if [ $file_fixed -gt 0 ]; then
        echo -e "${GREEN}✓ $file_fixed problèmes corrigés dans $file${NC}" | tee -a "$LOG_FILE"
    fi
done

# 3. Cas spécial pour useLocationIQ
echo -e "\n${YELLOW}Vérification spécifique de useLocationIQ...${NC}" | tee -a "$LOG_FILE"
LOCATIONIQ_FILES=$(grep -r --include="*.js" --include="*.jsx" "useLocationIQ" ./src || true)

echo -e "${BLUE}Fichiers utilisant useLocationIQ:${NC}" | tee -a "$LOG_FILE"
echo "$LOCATIONIQ_FILES" | tee -a "$LOG_FILE"

# Vérifier si le hook existe
if file_exists "./src/hooks/useLocationIQ.js"; then
    echo -e "${GREEN}✓ Le hook useLocationIQ existe à ./src/hooks/useLocationIQ.js${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${RED}✗ Le hook useLocationIQ n'existe pas à ./src/hooks/useLocationIQ.js${NC}" | tee -a "$LOG_FILE"
    
    # Chercher dans tout le projet
    LOCATIONIQ_SOURCE=$(find ./src -name "useLocationIQ.js" || true)
    
    if [ -n "$LOCATIONIQ_SOURCE" ]; then
        echo -e "${GREEN}✓ Trouvé à $LOCATIONIQ_SOURCE${NC}" | tee -a "$LOG_FILE"
        
        # Copier vers l'emplacement attendu
        mkdir -p ./src/hooks
        cp "$LOCATIONIQ_SOURCE" ./src/hooks/useLocationIQ.js
        echo -e "${GREEN}✓ Copié vers ./src/hooks/useLocationIQ.js${NC}" | tee -a "$LOG_FILE"
    else
        echo -e "${RED}✗ Impossible de trouver useLocationIQ.js dans le projet${NC}" | tee -a "$LOG_FILE"
    fi
fi

# 4. Résumé
echo -e "\n${BLUE}=== Résumé ===${NC}" | tee -a "$LOG_FILE"
echo -e "${RED}$PROBLEMS_COUNT problèmes détectés${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}$FIXED_COUNT problèmes corrigés automatiquement${NC}" | tee -a "$LOG_FILE"

# Mise à jour du rapport
echo "" >> "$REPORT_FILE"
echo "## Résumé" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **Problèmes détectés:** $PROBLEMS_COUNT" >> "$REPORT_FILE"
echo "- **Problèmes corrigés:** $FIXED_COUNT" >> "$REPORT_FILE"

# 5. Nettoyage du cache
echo -e "\n${YELLOW}Nettoyage du cache...${NC}" | tee -a "$LOG_FILE"
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache nettoyé${NC}" | tee -a "$LOG_FILE"

echo -e "\n${BLUE}=== Analyse terminée ===${NC}" | tee -a "$LOG_FILE"
echo -e "${YELLOW}Rapport détaillé disponible dans $REPORT_FILE${NC}" | tee -a "$LOG_FILE"
echo -e "${YELLOW}Log complet disponible dans $LOG_FILE${NC}" | tee -a "$LOG_FILE"
echo -e "${YELLOW}Testez maintenant la compilation avec:${NC}" | tee -a "$LOG_FILE"
echo -e "${BLUE}npm run build${NC}" | tee -a "$LOG_FILE"
