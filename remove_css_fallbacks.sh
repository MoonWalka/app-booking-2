#!/bin/bash

# Script pour supprimer automatiquement les fallbacks codés en dur dans les fichiers CSS
# Date: 19 mai 2025
# Usage: ./remove_css_fallbacks.sh

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Suppression des fallbacks codés en dur dans les fichiers CSS...${NC}"

# Compteurs
total_files=0
modified_files=0
skipped_files=0

# Fonction pour traiter un fichier CSS
process_css_file() {
    local file="$1"
    local temp_file="${file}.tmp"
    local has_changes=false
    local file_content=$(cat "$file")
    
    # Vérifier si le fichier contient des fallbacks
    if grep -q "var(--tc-[a-zA-Z0-9-]*, [^)]\+)" "$file"; then
        has_changes=true
        
        # Supprimer les fallbacks
        sed 's/var(--tc-[a-zA-Z0-9-]*, \([^)]\+\))/var(--tc-[a-zA-Z0-9-]*)/g' "$file" > "$temp_file"
        mv "$temp_file" "$file"
        
        echo -e "${GREEN}✓ Fallbacks supprimés dans ${file}${NC}"
        ((modified_files++))
    else
        echo -e "  Aucun fallback trouvé dans ${file}, ignoré"
        ((skipped_files++))
    fi
    
    ((total_files++))
}

# Rechercher tous les fichiers CSS dans le projet
find /Users/meltinrecordz/Documents/TourCraft/code/app-booking-2/src -name "*.css" | while read -r css_file; do
    process_css_file "$css_file"
done

echo -e "\n${YELLOW}Rapport de suppression des fallbacks CSS:${NC}"
echo -e "  Fichiers CSS traités: ${total_files}"
echo -e "  Fichiers modifiés: ${GREEN}${modified_files}${NC}"
echo -e "  Fichiers sans fallbacks: ${skipped_files}"

echo -e "\n${GREEN}Terminé!${NC}"

# Mise à jour de l'état du plan d'action
echo -e "\n${YELLOW}Mise à jour de l'état du plan d'action:${NC}"
echo -e "  Phase 3.2: ${GREEN}Supprimer les fallbacks codés en dur dans les fichiers CSS - TERMINÉ${NC}"
