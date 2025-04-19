#!/bin/bash

# Script de vérification et correction des imports dans un projet React
# Ce script:
#   1. Vérifie et corrige l'auto-référence dans dateUtils.js
#   2. Analyse tous les imports de 'formatDate' dans le projet
#   3. Vérifie si les chemins d'importation sont corrects selon l'arborescence
#   4. Détecte les définitions locales de 'formatDate' et supprime les imports redondants
#   5. Corrige les chemins d'importation incorrects

# Configuration
PROJECT_ROOT="$(pwd)"
DATE_UTILS_PATH="$PROJECT_ROOT/src/utils/dateUtils.js"
BACKUP_DIR="$PROJECT_ROOT/imports-backup-$(date +%Y%m%d%H%M%S)"
VERBOSE=true

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages en mode verbose
function log() {
  if [ "$VERBOSE" = true ]; then
    echo -e "$1"
  fi
}

# Fonction pour calculer le chemin relatif correct entre deux chemins
function get_relative_path() {
  local source_dir="$1"
  local target_dir="$2"
  
  # Convertir les chemins en chemins absolus
  source_dir=$(realpath "$source_dir")
  target_dir=$(realpath "$target_dir")
  
  # Obtenir le chemin relatif
  python3 -c "import os.path; print(os.path.relpath('$target_dir', '$source_dir'))"
}

# Créer le répertoire de sauvegarde
mkdir -p "$BACKUP_DIR"
log "${BLUE}Répertoire de sauvegarde créé: $BACKUP_DIR${NC}"

# Étape 1: Vérifier et corriger l'auto-référence dans dateUtils.js
log "${BLUE}Vérification de l'auto-référence dans dateUtils.js...${NC}"
if [ -f "$DATE_UTILS_PATH" ]; then
  # Sauvegarder le fichier original
  cp "$DATE_UTILS_PATH" "$BACKUP_DIR/dateUtils.js.backup"
  
  # Vérifier si le fichier contient une auto-référence
  if grep -q "import { formatDate } from './utils/dateUtils'" "$DATE_UTILS_PATH"; then
    log "${YELLOW}Auto-référence détectée dans dateUtils.js. Correction...${NC}"
    # Créer un fichier temporaire sans la ligne d'auto-référence
    grep -v "import { formatDate } from './utils/dateUtils'" "$DATE_UTILS_PATH" > "$DATE_UTILS_PATH.tmp"
    mv "$DATE_UTILS_PATH.tmp" "$DATE_UTILS_PATH"
    log "${GREEN}✅ Auto-référence supprimée de dateUtils.js${NC}"
  else
    log "${GREEN}✅ Pas d'auto-référence détectée dans dateUtils.js${NC}"
  fi
else
  log "${RED}⚠️ Fichier dateUtils.js non trouvé à l'emplacement: $DATE_UTILS_PATH${NC}"
  exit 1
fi

# Étape 2: Trouver tous les fichiers qui importent formatDate
log "${BLUE}Recherche des fichiers qui importent formatDate...${NC}"
FILES_WITH_IMPORTS=$(grep -r "import { formatDate } from" --include="*.js" --include="*.jsx" "$PROJECT_ROOT/src" | cut -d':' -f1 | sort | uniq)

# Compteurs pour les statistiques
TOTAL_FILES=0
CORRECTED_IMPORTS=0
REMOVED_IMPORTS=0
SKIPPED_FILES=0

# Étape 3 & 4: Analyser et corriger chaque fichier
for file in $FILES_WITH_IMPORTS; do
  TOTAL_FILES=$((TOTAL_FILES + 1))
  
  # Ignorer dateUtils.js lui-même
  if [ "$file" = "$DATE_UTILS_PATH" ]; then
    log "${YELLOW}Ignoré: $file (c'est le fichier dateUtils.js lui-même)${NC}"
    SKIPPED_FILES=$((SKIPPED_FILES + 1))
    continue
  fi
  
  log "${BLUE}Analyse du fichier: $file${NC}"
  
  # Sauvegarder le fichier original
  cp "$file" "$BACKUP_DIR/$(basename "$file").backup"
  
  # Vérifier si le fichier contient une définition locale de formatDate
  HAS_LOCAL_DEFINITION=false
  if grep -q "const formatDate" "$file" || grep -q "function formatDate" "$file"; then
    HAS_LOCAL_DEFINITION=true
    log "${YELLOW}Définition locale de formatDate détectée dans $file${NC}"
  fi
  
  # Si le fichier a une définition locale, supprimer l'import
  if [ "$HAS_LOCAL_DEFINITION" = true ]; then
    # Supprimer l'import de formatDate
    sed -i '' "/import { formatDate } from/d" "$file"
    log "${GREEN}✅ Import de formatDate supprimé de $file (définition locale conservée)${NC}"
    REMOVED_IMPORTS=$((REMOVED_IMPORTS + 1))
    continue
  fi
  
  # Calculer le chemin relatif correct vers dateUtils.js
  file_dir=$(dirname "$file")
  correct_path=$(get_relative_path "$file_dir" "$PROJECT_ROOT/src/utils")
  correct_import="import { formatDate } from '$correct_path/dateUtils'"
  
  # Vérifier si l'import est incorrect
  current_import=$(grep "import { formatDate } from" "$file" | head -n 1)
  if [[ "$current_import" != *"$correct_path/dateUtils"* ]]; then
    log "${YELLOW}Import incorrect dans $file:${NC}"
    log "${YELLOW}  Actuel: $current_import${NC}"
    log "${YELLOW}  Correct: $correct_import${NC}"
    
    # Corriger l'import
    sed -i '' "s|import { formatDate } from ['\"].*['\"]|$correct_import|g" "$file"
    log "${GREEN}✅ Import corrigé dans $file${NC}"
    CORRECTED_IMPORTS=$((CORRECTED_IMPORTS + 1))
  else
    log "${GREEN}✅ Import déjà correct dans $file${NC}"
    SKIPPED_FILES=$((SKIPPED_FILES + 1))
  fi
done

# Étape 5: Afficher les statistiques
echo -e "\n${BLUE}=== Rapport de correction des imports ===${NC}"
echo -e "${BLUE}Fichiers analysés: $TOTAL_FILES${NC}"
echo -e "${GREEN}Imports corrigés: $CORRECTED_IMPORTS${NC}"
echo -e "${YELLOW}Imports supprimés (définitions locales): $REMOVED_IMPORTS${NC}"
echo -e "${BLUE}Fichiers ignorés/déjà corrects: $SKIPPED_FILES${NC}"
echo -e "${BLUE}Sauvegardes stockées dans: $BACKUP_DIR${NC}"

# Étape 6: Vérifier si toutes les corrections ont été appliquées
if [ $((CORRECTED_IMPORTS + REMOVED_IMPORTS)) -gt 0 ]; then
  echo -e "\n${GREEN}✅ Corrections appliquées. Exécutez 'npm run build' pour vérifier.${NC}"
else
  echo -e "\n${YELLOW}⚠️ Aucune correction n'a été nécessaire. Vérifiez manuellement.${NC}"
fi

# Fin du script
