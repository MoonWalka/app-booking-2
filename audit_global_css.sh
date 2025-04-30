#!/bin/bash

# Script d'aide à l'audit des fichiers CSS globaux pour identifier les styles potentiellement redondants
# Adapté pour macOS avec chemin spécifique

PROJECT_DIR="/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2"
STYLES_COMPONENTS_DIR="$PROJECT_DIR/src/styles/components"
STYLES_PAGES_DIR="$PROJECT_DIR/src/styles/pages"
MODULE_CSS_DIR="$PROJECT_DIR/src/components"
OUTPUT_FILE="$PROJECT_DIR/global_css_audit_report.txt"

echo "Aide à l'audit des styles CSS globaux potentiellement redondants..." > "$OUTPUT_FILE"
echo "==================================================================" >> "$OUTPUT_FILE"
echo "Chemin du projet analysé : $PROJECT_DIR" >> "$OUTPUT_FILE"
echo "Ce script identifie les sélecteurs dans les fichiers CSS globaux" >> "$OUTPUT_FILE"
echo "et recherche des correspondances potentielles dans les fichiers *.module.css." >> "$OUTPUT_FILE"
echo "Une vérification manuelle est INDISPENSABLE avant toute suppression." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 1. Lister tous les fichiers .module.css pour la recherche
MODULE_FILES=$(find "$MODULE_CSS_DIR" -name "*.module.css")
if [ -z "$MODULE_FILES" ]; then
    echo "Erreur: Aucun fichier *.module.css trouvé dans $MODULE_CSS_DIR" >> "$OUTPUT_FILE"
    exit 1
fi

# 2. Analyser les fichiers CSS globaux dans src/styles/components et src/styles/pages
GLOBAL_CSS_FILES=$(find "$STYLES_COMPONENTS_DIR" "$STYLES_PAGES_DIR" -maxdepth 1 -name "*.css" -not -name "index.css")

for global_file in $GLOBAL_CSS_FILES; do
    echo "--- Analyse de : $(basename "$global_file") ---" >> "$OUTPUT_FILE"
    
    # Extraire les sélecteurs CSS (simplifié : lignes commençant par . ou #, avant { )
    # Ceci est une heuristique et peut manquer des sélecteurs complexes ou en inclure trop.
    grep -E "^\s*([.#][a-zA-Z0-9_\-]+)" "$global_file" | sed -E 's/^\s*([.#][a-zA-Z0-9_\-]+).*$/\1/' | sort -u | while read -r selector; do
        
        # Extraire le nom de classe/ID sans le . ou #
        class_name=$(echo "$selector" | sed -E 's/^[.#]//')
        
        # Rechercher ce nom de classe (approximatif) dans les fichiers .module.css
        # Recherche simple du nom, peut générer des faux positifs/négatifs.
        match_found=0
        
        # Itération fichier par fichier pour macOS (plus compatible)
        for module_file in $MODULE_FILES; do
            if grep -q -F ".$class_name" "$module_file"; then
                match_found=1
                break
            fi
        done

        if [ $match_found -eq 1 ]; then
            echo "[Potentiellement redondant] Sélecteur global: \"$selector\" dans $(basename "$global_file"). Correspondance trouvée pour \"$class_name\" dans au moins un *.module.css." >> "$OUTPUT_FILE"
        else
            echo "[Probablement unique] Sélecteur global: \"$selector\" dans $(basename "$global_file"). Aucune correspondance simple trouvée pour \"$class_name\" dans les *.module.css." >> "$OUTPUT_FILE"
        fi
    done
    echo "" >> "$OUTPUT_FILE"
done

echo "" >> "$OUTPUT_FILE"
echo "Audit terminé. Les sélecteurs marqués [Potentiellement redondant] sont des candidats à examiner." >> "$OUTPUT_FILE"
echo "Vérifiez manuellement s'ils sont entièrement couverts par les styles des modules avant de les supprimer du fichier global." >> "$OUTPUT_FILE"
echo "Résultats complets dans $OUTPUT_FILE"

# Afficher les résultats
cat "$OUTPUT_FILE"

