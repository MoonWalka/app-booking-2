#!/bin/bash
# Étape 2: Création de dossiers thématiques pour les composants

# Définir le répertoire racine du projet
PROJECT_DIR="$(pwd)"
SRC_DIR="$PROJECT_DIR/src"
COMPONENTS_DIR="$SRC_DIR/components"

# --- Dossiers Thématiques --- 
THEMATIC_DIRS=(
  "$COMPONENTS_DIR/layout"
  "$COMPONENTS_DIR/pdf" # Créé à l'étape 1
  "$COMPONENTS_DIR/concerts"
  "$COMPONENTS_DIR/lieux"
  "$COMPONENTS_DIR/programmateurs"
  "$COMPONENTS_DIR/validation" # Pour composants futurs
  "$COMPONENTS_DIR/ui" # Pour composants atomiques (Étape 4)
)

echo "Création des dossiers thématiques (si non existants)..."
for dir in "${THEMATIC_DIRS[@]}"; do
  mkdir -p "$dir"
  # Créer des sous-dossiers desktop/mobile si pertinent pour la structure existante
  if [[ "$dir" == *"/concerts"* || "$dir" == *"/lieux"* || "$dir" == *"/programmateurs"* ]]; then
    mkdir -p "$dir/desktop"
    mkdir -p "$dir/mobile"
  fi
done

# --- Déplacement des Composants --- 

# Fonction pour déplacer un composant et ses versions desktop/mobile
move_component() {
  local component_name="$1"
  local current_location="$2" # ex: forms
  local target_location="$3" # ex: lieux

  echo "Traitement de $component_name..."

  # Chemins actuels
  local current_base_path="$COMPONENTS_DIR/$current_location/$component_name.js"
  local current_desktop_path="$COMPONENTS_DIR/$current_location/desktop/$component_name.js"
  local current_mobile_path="$COMPONENTS_DIR/$current_location/mobile/$component_name.js"

  # Chemins cibles
  local target_base_path="$COMPONENTS_DIR/$target_location/$component_name.js"
  local target_desktop_path="$COMPONENTS_DIR/$target_location/desktop/$component_name.js"
  local target_mobile_path="$COMPONENTS_DIR/$target_location/mobile/$component_name.js"

  # Déplacer le fichier de base
  if [ -f "$current_base_path" ]; then
    echo "  Déplacement de $current_base_path vers $target_base_path"
    mv "$current_base_path" "$target_base_path"
    # Mise à jour des imports (exemple simple, pourrait nécessiter ajustement)
    find "$SRC_DIR" -type f -name '*.js' -exec sed -i '' "s|@/components/$current_location/$component_name|@/components/$target_location/$component_name|g" {} +
  elif [ ! -f "$target_base_path" ]; then
     echo "  INFO: Fichier de base $current_base_path non trouvé."
  fi

  # Déplacer la version desktop
  if [ -f "$current_desktop_path" ]; then
    echo "  Déplacement de $current_desktop_path vers $target_desktop_path"
    mv "$current_desktop_path" "$target_desktop_path"
    find "$SRC_DIR" -type f -name '*.js' -exec sed -i '' "s|@/components/$current_location/desktop/$component_name|@/components/$target_location/desktop/$component_name|g" {} +
    find "$SRC_DIR" -type f -name '*.js' -exec sed -i '' "s|$current_location/desktop/$component_name|$target_location/desktop/$component_name|g" {} + # Pour les imports relatifs dans useResponsiveComponent
  elif [ ! -f "$target_desktop_path" ]; then
     echo "  INFO: Version desktop $current_desktop_path non trouvée."
  fi

  # Déplacer la version mobile
  if [ -f "$current_mobile_path" ]; then
    echo "  Déplacement de $current_mobile_path vers $target_mobile_path"
    mv "$current_mobile_path" "$target_mobile_path"
    find "$SRC_DIR" -type f -name '*.js' -exec sed -i '' "s|@/components/$current_location/mobile/$component_name|@/components/$target_location/mobile/$component_name|g" {} +
    find "$SRC_DIR" -type f -name '*.js' -exec sed -i '' "s|$current_location/mobile/$component_name|$target_location/mobile/$component_name|g" {} + # Pour les imports relatifs dans useResponsiveComponent
  elif [ ! -f "$target_mobile_path" ]; then
     echo "  INFO: Version mobile $current_mobile_path non trouvée."
  fi
}

# Déplacer LieuForm de 'forms' vers 'lieux'
move_component "LieuForm" "forms" "lieux"

# Déplacer ProgrammateurForm de 'forms' vers 'programmateurs'
move_component "ProgrammateurForm" "forms" "programmateurs"

# Vérifier ConcertsList (déjà dans components/concerts ?)
CONCERTS_LIST_BASE="$COMPONENTS_DIR/concerts/ConcertsList.js"
if [ -f "$CONCERTS_LIST_BASE" ]; then
  echo "INFO: ConcertsList semble déjà être dans $COMPONENTS_DIR/concerts/"
else
  # Si ConcertsList était ailleurs (ex: à la racine de components), le déplacer ici
  # move_component "ConcertsList" "" "concerts" # Adapter le chemin source si nécessaire
  echo "ATTENTION: ConcertsList non trouvé à l'emplacement attendu ($CONCERTS_LIST_BASE). Vérification manuelle nécessaire."
fi

# Nettoyer les fichiers de sauvegarde .bak créés par sed (plus nécessaire car -i sans .bak)
# find "$SRC_DIR" -type f -name '*.js.bak' -delete

echo ""
echo "Étape 2 (Organisation thématique) terminée."
echo "NOTE: Ce script a créé des dossiers thématiques et tenté de déplacer LieuForm et ProgrammateurForm."
echo "Les mises à jour d'imports sont basiques et peuvent nécessiter une vérification manuelle, surtout pour les imports relatifs."
echo "Les composants non trouvés (Header, Cards, Validation...) n'ont pas été déplacés."
