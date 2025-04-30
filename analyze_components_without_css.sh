#!/bin/bash

# Script pour identifier les composants UI potentiels sans import CSS
# Adapté pour macOS avec chemin spécifique

PROJECT_DIR="/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2"
SRC_DIR="$PROJECT_DIR/src"
OUTPUT_FILE="$PROJECT_DIR/components_without_css_analysis.txt"

echo "Analyse des composants UI potentiels sans import CSS..." > "$OUTPUT_FILE"
echo "======================================================" >> "$OUTPUT_FILE"
echo "Chemin du projet analysé : $PROJECT_DIR" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Trouver tous les fichiers JS dans src/components
# Exclure les dossiers handlers, utils, hooks, context, services, shims pour cibler les composants UI
find "$SRC_DIR/components" -type f -name "*.js" \
    -not -path "*/handlers/*" \
    -not -path "*/utils/*" \
    -not -path "*/hooks/*" \
    -not -path "*/context/*" \
    -not -path "*/services/*" \
    -not -path "*/shims/*" \
    | while read -r file_path; do
    
    # Vérifier si le fichier importe un .css ou .module.css
    if ! grep -q -E "^import\s+.*?\s+from\s+[\"'].*\.module\.css[\"'].*;" "$file_path" && \
       ! grep -q -E "^import\s+[\"'].*\.css[\"'].*;" "$file_path"; then
        
        # Vérifier si c'est un composant React (contient "React" ou "useState"/"useEffect" ou retourne du JSX)
        # Heuristique simple : cherche "React", "useState", "useEffect" ou une balise JSX
        if grep -q -E "React|useState|useEffect|<[A-Z]" "$file_path"; then
             echo "[Potentiel UI sans CSS] $file_path" >> "$OUTPUT_FILE"
        fi
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "Analyse terminée. Les fichiers listés sont des candidats potentiels à vérifier." >> "$OUTPUT_FILE"
echo "Ils semblent être des composants React mais n'importent aucun fichier .css ou .module.css." >> "$OUTPUT_FILE"
echo "Vérifiez manuellement s'ils nécessitent des styles et un fichier .module.css dédié." >> "$OUTPUT_FILE"
echo "Résultats dans $OUTPUT_FILE"

# Afficher les résultats
cat "$OUTPUT_FILE"

