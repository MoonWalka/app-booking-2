#!/bin/bash
# Étape 4: Normalisation CSS + Atomic Design (Structure)

# Définir le répertoire racine du projet
PROJECT_DIR="/Users/meltinrecordz/Documents/TourCraft/code/app-booking-2"
SRC_DIR="$PROJECT_DIR/src"
COMPONENTS_DIR="$SRC_DIR/components"
UI_DIR="$COMPONENTS_DIR/ui" # Dossier pour les composants atomiques

# Créer le dossier ui (si non existant, normalement créé à l'étape 2)
echo "Vérification/Création du dossier $UI_DIR..."
mkdir -p "$UI_DIR"

# Définir les composants atomiques suggérés
ATOMIC_COMPONENTS=(
  "$UI_DIR/Badge.js"
  "$UI_DIR/StatutBadge.js"
  "$UI_DIR/SectionTitle.js"
  "$UI_DIR/ActionButton.js"
)

echo "Création des fichiers placeholder pour les composants UI atomiques..."
for component_file in "${ATOMIC_COMPONENTS[@]}"; do
  if [ ! -f "$component_file" ]; then
    component_name=$(basename "$component_file" .js)
    echo "import React from 'react';" > "$component_file"
    echo "" >> "$component_file"
    # Créer un fichier CSS Module associé
    css_module_file="${component_file%.js}.module.css"
    touch "$css_module_file"
    echo "import styles from './${component_name}.module.css';" >> "$component_file"
    echo "" >> "$component_file"
    echo "const $component_name = (props) => {" >> "$component_file"
    echo "  // TODO: Implémenter le composant UI atomique"
    echo "  return <div className={styles.container}>$component_name Placeholder</div>;" >> "$component_file"
    echo "};" >> "$component_file"
    echo "" >> "$component_file"
    echo "export default $component_name;" >> "$component_file"
    echo "Créé: $component_file et $css_module_file"
  else
    echo "INFO: Fichier $component_file existe déjà."
  fi
done

# Vérifier l'existence de theme.css (mentionné dans le plan)
THEME_CSS_PATH="$SRC_DIR/styles/theme.css"
if [ -f "$THEME_CSS_PATH" ]; then
  echo "INFO: Le fichier $THEME_CSS_PATH existe et peut être revu pour la palette de couleurs."
else
  echo "INFO: Le fichier $THEME_CSS_PATH n'a pas été trouvé. La palette de couleurs est probablement gérée ailleurs (ex: variables CSS dans index.css ou App.css)."
fi

echo ""
echo "Étape 4 (Structure UI) terminée."
echo "NOTE: Ce script a créé des fichiers placeholder pour les composants UI atomiques suggérés et leurs CSS Modules."
echo "L'implémentation réelle de ces composants et la migration vers CSS Modules ou une autre stratégie (comme Tailwind, qui serait un changement majeur par rapport à Bootstrap actuel) doivent être faites manuellement."
echo "Le choix entre CSS Modules (recommandé dans l'audit précédent) et Tailwind doit être confirmé."

