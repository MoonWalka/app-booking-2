#!/bin/bash

# Couleurs pour meilleure lisibilité
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Conversion des imports avec alias en chemins relatifs ===${NC}\n"

# Fonction pour calculer le chemin relatif entre deux fichiers
calculate_relative_path() {
    local from_dir="$1"
    local to_file="$2"
    python3 -c "import os.path; print(os.path.relpath('$to_file', '$from_dir'))" | sed 's/\.js$//'
}

# Fonction pour convertir les alias en chemins relatifs dans un fichier
convert_file() {
    local file="$1"
    local file_dir=$(dirname "$file")
    local content=$(cat "$file")
    local modified=false
    local new_content="$content"

    # Créer une sauvegarde du fichier
    cp "$file" "${file}.alias_bak"

    # Convertir les imports avec @firebase
    if grep -q "from[[:space:]]*['\"]@firebase['\"]" "$file"; then
        local firebase_path=$(calculate_relative_path "$file_dir" "$(pwd)/src/firebase.js")
        new_content=$(echo "$new_content" | sed "s|from[[:space:]]*['\"]@firebase['\"]|from '$firebase_path'|g")
        modified=true
        echo -e "  ${GREEN}✓ @firebase${NC} -> ${BLUE}$firebase_path${NC}"
    fi

    # Convertir les imports avec @components
    if grep -q "from[[:space:]]*['\"]@components/" "$file"; then
        while read -r import_line; do
            component_path=$(echo "$import_line" | sed -E "s/.*from[[:space:]]*['\"]@components\/([^'\"]*)['\"].*/\1/")
            relative_path=$(calculate_relative_path "$file_dir" "$(pwd)/src/components/$component_path")
            new_content=$(echo "$new_content" | sed "s|from[[:space:]]*['\"]@components/$component_path['\"]|from '$relative_path'|g")
            echo -e "  ${GREEN}✓ @components/$component_path${NC} -> ${BLUE}$relative_path${NC}"
            modified=true
        done < <(grep -o "from[[:space:]]*['\"]@components/[^'\"]*['\"]" "$file")
    fi

    # Convertir les imports avec @hooks
    if grep -q "from[[:space:]]*['\"]@hooks/" "$file"; then
        while read -r import_line; do
            hook_path=$(echo "$import_line" | sed -E "s/.*from[[:space:]]*['\"]@hooks\/([^'\"]*)['\"].*/\1/")
            relative_path=$(calculate_relative_path "$file_dir" "$(pwd)/src/hooks/$hook_path")
            new_content=$(echo "$new_content" | sed "s|from[[:space:]]*['\"]@hooks/$hook_path['\"]|from '$relative_path'|g")
            echo -e "  ${GREEN}✓ @hooks/$hook_path${NC} -> ${BLUE}$relative_path${NC}"
            modified=true
        done < <(grep -o "from[[:space:]]*['\"]@hooks/[^'\"]*['\"]" "$file")
    fi

    # Convertir les imports avec @context
    if grep -q "from[[:space:]]*['\"]@context/" "$file"; then
        while read -r import_line; do
            context_path=$(echo "$import_line" | sed -E "s/.*from[[:space:]]*['\"]@context\/([^'\"]*)['\"].*/\1/")
            relative_path=$(calculate_relative_path "$file_dir" "$(pwd)/src/context/$context_path")
            new_content=$(echo "$new_content" | sed "s|from[[:space:]]*['\"]@context/$context_path['\"]|from '$relative_path'|g")
            echo -e "  ${GREEN}✓ @context/$context_path${NC} -> ${BLUE}$relative_path${NC}"
            modified=true
        done < <(grep -o "from[[:space:]]*['\"]@context/[^'\"]*['\"]" "$file")
    fi

    # Convertir les imports avec @utils
    if grep -q "from[[:space:]]*['\"]@utils/" "$file"; then
        while read -r import_line; do
            util_path=$(echo "$import_line" | sed -E "s/.*from[[:space:]]*['\"]@utils\/([^'\"]*)['\"].*/\1/")
            relative_path=$(calculate_relative_path "$file_dir" "$(pwd)/src/utils/$util_path")
            new_content=$(echo "$new_content" | sed "s|from[[:space:]]*['\"]@utils/$util_path['\"]|from '$relative_path'|g")
            echo -e "  ${GREEN}✓ @utils/$util_path${NC} -> ${BLUE}$relative_path${NC}"
            modified=true
        done < <(grep -o "from[[:space:]]*['\"]@utils/[^'\"]*['\"]" "$file")
    fi

    # Convertir les imports avec @styles
    if grep -q "from[[:space:]]*['\"]@styles/" "$file"; then
        while read -r import_line; do
            style_path=$(echo "$import_line" | sed -E "s/.*from[[:space:]]*['\"]@styles\/([^'\"]*)['\"].*/\1/")
            relative_path=$(calculate_relative_path "$file_dir" "$(pwd)/src/style/$style_path")
            new_content=$(echo "$new_content" | sed "s|from[[:space:]]*['\"]@styles/$style_path['\"]|from '$relative_path'|g")
            echo -e "  ${GREEN}✓ @styles/$style_path${NC} -> ${BLUE}$relative_path${NC}"
            modified=true
        done < <(grep -o "from[[:space:]]*['\"]@styles/[^'\"]*['\"]" "$file")
    fi

    # Convertir les imports avec @services
    if grep -q "from[[:space:]]*['\"]@services/" "$file"; then
        while read -r import_line; do
            service_path=$(echo "$import_line" | sed -E "s/.*from[[:space:]]*['\"]@services\/([^'\"]*)['\"].*/\1/")
            relative_path=$(calculate_relative_path "$file_dir" "$(pwd)/src/services/$service_path")
            new_content=$(echo "$new_content" | sed "s|from[[:space:]]*['\"]@services/$service_path['\"]|from '$relative_path'|g")
            echo -e "  ${GREEN}✓ @services/$service_path${NC} -> ${BLUE}$relative_path${NC}"
            modified=true
        done < <(grep -o "from[[:space:]]*['\"]@services/[^'\"]*['\"]" "$file")
    fi

    # Convertir les imports avec @ générique (src)
    if grep -q "from[[:space:]]*['\"]@/" "$file"; then
        while read -r import_line; do
            src_path=$(echo "$import_line" | sed -E "s/.*from[[:space:]]*['\"]@\/([^'\"]*)['\"].*/\1/")
            relative_path=$(calculate_relative_path "$file_dir" "$(pwd)/src/$src_path")
            new_content=$(echo "$new_content" | sed "s|from[[:space:]]*['\"]@/$src_path['\"]|from '$relative_path'|g")
            echo -e "  ${GREEN}✓ @/$src_path${NC} -> ${BLUE}$relative_path${NC}"
            modified=true
        done < <(grep -o "from[[:space:]]*['\"]@/[^'\"]*['\"]" "$file")
    fi

    # Enregistrer les modifications
    if [ "$modified" = true ]; then
        echo "$new_content" > "$file"
        echo -e "${GREEN}✓ Fichier mis à jour${NC}"
    else
        echo -e "${BLUE}ℹ Aucun alias trouvé${NC}"
        # Supprimer la sauvegarde si aucune modification n'a été faite
        rm "${file}.alias_bak"
    fi
}

# Sauvegarder craco.config.js
echo -e "${YELLOW}Sauvegarde de craco.config.js...${NC}"
cp craco.config.js craco.config.js.paths_bak
echo -e "${GREEN}✓ craco.config.js sauvegardé${NC}"

# Créer un craco.config.js minimal sans alias
echo -e "\n${YELLOW}Création d'un craco.config.js minimal sans alias...${NC}"
cat > craco.config.js << 'EOL'
module.exports = {
  // Configuration minimale sans alias
  webpack: {
    configure: (webpackConfig) => {
      // Polyfills minimaux si nécessaire
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

# Trouver tous les fichiers JS/JSX dans src
echo -e "\n${YELLOW}Recherche des fichiers JavaScript/JSX...${NC}"
files=$(find ./src -type f \( -name "*.js" -o -name "*.jsx" \))
file_count=$(echo "$files" | wc -l)
echo -e "${BLUE}$file_count fichiers trouvés${NC}"

# Traiter chaque fichier
echo -e "\n${YELLOW}Conversion des imports...${NC}"
count=0
for file in $files; do
    count=$((count+1))
    echo -e "${BLUE}[$count/$file_count] Traitement de $file${NC}"
    convert_file "$file"
done

# Nettoyer le cache
echo -e "\n${YELLOW}Nettoyage du cache...${NC}"
rm -rf node_modules/.cache
echo -e "${GREEN}✓ Cache nettoyé${NC}"

echo -e "\n${BLUE}=== Rapport de conversion ===${NC}"
echo -e "${GREEN}✓ $count fichiers analysés${NC}"
echo -e "${YELLOW}Des sauvegardes ont été créées (.alias_bak) pour tous les fichiers modifiés${NC}"

echo -e "\n${BLUE}=== Prochaines étapes ===${NC}"
echo -e "1. Testez la compilation avec: ${YELLOW}npm run build${NC}"
echo -e "2. Si la compilation échoue, vous pouvez restaurer les fichiers originaux à partir des sauvegardes"
echo -e "   ${YELLOW}find ./src -name '*.alias_bak' -exec bash -c 'cp \"{}\" \"${{}%.alias_bak}\"' \\;${NC}"
echo -e "   ${YELLOW}cp craco.config.js.paths_bak craco.config.js${NC}"
