#!/bin/bash

# Script avancé de vérification et correction des imports dans un projet React
# Ce script:
#   1. Corrige les problèmes d'importation détectés
#   2. Exécute ESLint pour vérifier les erreurs restantes
#   3. Tente un build pour détecter les problèmes de compilation
#   4. Suggère des corrections pour les erreurs restantes
#   5. Peut être exécuté en mode itératif pour résoudre une erreur à la fois

# Configuration
PROJECT_ROOT="$(pwd)"
BACKUP_DIR="$PROJECT_ROOT/imports-backup-$(date +%Y%m%d%H%M%S)"
VERBOSE=true
CURRENT_ERROR=""
AUTO_FIX=false  # Mettre à true pour que le script tente de corriger automatiquement les erreurs détectées

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

# Fonction pour exécuter ESLint et analyser les erreurs
function run_eslint_check() {
  log "${BLUE}Exécution d'ESLint pour vérifier les erreurs...${NC}"
  
  # Exécuter ESLint et capturer les erreurs
  ESLINT_OUTPUT=$(npx eslint src --max-warnings=0 2>&1 || true)
  
  # Compter les erreurs et les avertissements
  ERROR_COUNT=$(echo "$ESLINT_OUTPUT" | grep -c "error")
  WARNING_COUNT=$(echo "$ESLINT_OUTPUT" | grep -c "warning")
  
  echo -e "\n${BLUE}=== Rapport ESLint ===${NC}"
  echo -e "${YELLOW}Erreurs: $ERROR_COUNT${NC}"
  echo -e "${BLUE}Avertissements: $WARNING_COUNT${NC}"
  
  # Afficher les erreurs de type "import" ou "Module not found"
  IMPORT_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -E "import|Module not found" || true)
  if [ ! -z "$IMPORT_ERRORS" ]; then
    echo -e "\n${YELLOW}Erreurs d'importation détectées:${NC}"
    echo "$IMPORT_ERRORS"
    
    # Stocker la première erreur pour correction automatique
    CURRENT_ERROR=$(echo "$IMPORT_ERRORS" | head -n 1)
  fi
  
  # Retourner l'état (0 = pas d'erreur, 1 = erreurs)
  if [ "$ERROR_COUNT" -gt 0 ]; then
    return 1
  else
    return 0
  fi
}

# Fonction pour tester le build
function test_build() {
  log "${BLUE}Tentative de build pour vérifier les erreurs...${NC}"
  
  # Exécuter le build et capturer les erreurs
  BUILD_OUTPUT=$(npm run build 2>&1 || true)
  
  # Vérifier si le build a réussi
  if echo "$BUILD_OUTPUT" | grep -q "Failed to compile"; then
    echo -e "\n${RED}❌ Échec du build${NC}"
    
    # Extraire les erreurs de type "Module not found"
    MODULE_ERRORS=$(echo "$BUILD_OUTPUT" | grep -A 2 "Module not found" || true)
    if [ ! -z "$MODULE_ERRORS" ]; then
      echo -e "\n${YELLOW}Erreurs de module détectées:${NC}"
      echo "$MODULE_ERRORS"
      
      # Stocker la première erreur pour correction automatique
      CURRENT_ERROR=$(echo "$MODULE_ERRORS" | head -n 1)
      
      # Analyser l'erreur pour suggérer une correction
      suggest_fix_for_error "$CURRENT_ERROR"
    fi
    
    return 1
  else
    echo -e "\n${GREEN}✅ Build réussi!${NC}"
    return 0
  fi
}

# Fonction pour suggérer une correction basée sur l'erreur
function suggest_fix_for_error() {
  local error_msg="$1"
  
  echo -e "\n${PURPLE}=== Analyse de l'erreur ===${NC}"
  echo -e "${YELLOW}Erreur: $error_msg${NC}"
  
  # Analyser l'erreur de type "Module not found"
  if echo "$error_msg" | grep -q "Module not found"; then
    # Extraire le module et le chemin
    MODULE_PATH=$(echo "$error_msg" | grep -oE "'[^']+'" | head -n 1 | tr -d "'")
    LOCATION=$(echo "$error_msg" | grep -oE "in '[^']+'" | sed "s/in //g" | tr -d "'")
    
    echo -e "${BLUE}Module: $MODULE_PATH${NC}"
    echo -e "${BLUE}Emplacement: $LOCATION${NC}"
    
    # Suggérer des corrections selon le type de module
    if [[ "$MODULE_PATH" == "./react-icons/fa" ]]; then
      echo -e "\n${GREEN}Suggestion de correction:${NC}"
      echo -e "Le module './react-icons/fa' est probablement incorrect."
      echo -e "Remplacez par 'react-icons/fa' ou '@react-icons/all-files/fa' selon votre installation."
      
      # Option pour corriger automatiquement
      if [ "$AUTO_FIX" = true ]; then
        file_patterns=$(grep -r --include="*.js" --include="*.jsx" "'./react-icons/fa'" "$PROJECT_ROOT/src" | cut -d':' -f1 || true)
        
        for file in $file_patterns; do
          log "${YELLOW}Correction de l'import react-icons/fa dans $file${NC}"
          sed -i '' "s|'./react-icons/fa'|'react-icons/fa'|g" "$file"
          echo -e "${GREEN}✅ Import corrigé dans $file${NC}"
        done
      fi
    elif [[ "$MODULE_PATH" == "./utils/dateUtils" ]]; then
      echo -e "\n${GREEN}Suggestion de correction:${NC}"
      echo -e "Le chemin d'importation './utils/dateUtils' est incorrect depuis $LOCATION."
      echo -e "Remplacez par '../utils/dateUtils' si le fichier est dans src/pages."
      
      # Option pour corriger automatiquement
      if [ "$AUTO_FIX" = true ]; then
        dir_name=$(dirname "$LOCATION")
        correct_path=$(get_relative_path "$dir_name" "$PROJECT_ROOT/src/utils")
        
        file_patterns=$(grep -r --include="*.js" --include="*.jsx" "'./utils/dateUtils'" "$LOCATION" | cut -d':' -f1 || true)
        
        for file in $file_patterns; do
          log "${YELLOW}Correction de l'import dateUtils dans $file${NC}"
          sed -i '' "s|'./utils/dateUtils'|'$correct_path/dateUtils'|g" "$file"
          echo -e "${GREEN}✅ Import corrigé dans $file${NC}"
        done
      fi
    else
      echo -e "\n${YELLOW}Suggestion générique:${NC}"
      echo -e "1. Vérifiez si le module '$MODULE_PATH' existe"
      echo -e "2. Corrigez le chemin d'importation (relatif vs absolu)"
      echo -e "3. Installez le module s'il est manquant: npm install $MODULE_PATH"
    fi
    
    # Retourner le module à corriger pour usage ultérieur
    echo "$MODULE_PATH"
  fi
}

# Fonction pour corriger les imports react-icons
function fix_react_icons_imports() {
  log "${BLUE}Recherche et correction des imports react-icons...${NC}"
  
  # Trouver tous les fichiers avec des imports incorrects de react-icons
  FILES_WITH_IMPORTS=$(grep -r "import .* from './react-icons/" --include="*.js" --include="*.jsx" "$PROJECT_ROOT/src" | cut -d':' -f1 | sort | uniq || true)
  
  FIXED_COUNT=0
  for file in $FILES_WITH_IMPORTS; do
    # Sauvegarder le fichier original
    mkdir -p "$BACKUP_DIR/$(dirname "$(realpath --relative-to="$PROJECT_ROOT" "$file")")"
    cp "$file" "$BACKUP_DIR/$(realpath --relative-to="$PROJECT_ROOT" "$file").backup"
    
    # Corriger l'import
    sed -i '' "s|from './react-icons/|from 'react-icons/|g" "$file"
    log "${GREEN}✅ Import react-icons corrigé dans $file${NC}"
    FIXED_COUNT=$((FIXED_COUNT + 1))
  done
  
  echo -e "${GREEN}$FIXED_COUNT fichiers avec imports react-icons corrigés${NC}"
}

# Créer le répertoire de sauvegarde
mkdir -p "$BACKUP_DIR"
log "${BLUE}Répertoire de sauvegarde créé: $BACKUP_DIR${NC}"

# Étape 1: Correction des imports dateUtils
# [Le code de correction des imports dateUtils ici - identique à la version précédente]

# Étape 2: Correction des imports react-icons
fix_react_icons_imports

# Étape 3: Exécuter ESLint pour vérifier les erreurs
run_eslint_check
ESLINT_STATUS=$?

# Étape 4: Tester le build
test_build
BUILD_STATUS=$?

# Afficher un récapitulatif final
echo -e "\n${BLUE}=== Récapitulatif final ===${NC}"
if [ $ESLINT_STATUS -eq 0 ] && [ $BUILD_STATUS -eq 0 ]; then
  echo -e "${GREEN}✅ Toutes les corrections ont été appliquées avec succès!${NC}"
  echo -e "${GREEN}✅ ESLint ne rapporte aucune erreur${NC}"
  echo -e "${GREEN}✅ Le build est réussi${NC}"
else
  echo -e "${YELLOW}⚠️ Des erreurs subsistent après les corrections:${NC}"
  
  if [ $ESLINT_STATUS -ne 0 ]; then
    echo -e "${YELLOW}⚠️ ESLint rapporte encore des erreurs${NC}"
  fi
  
  if [ $BUILD_STATUS -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Le build échoue encore${NC}"
  fi
  
  echo -e "\n${PURPLE}=== Prochaines étapes ===${NC}"
  echo -e "1. Revoyez les erreurs identifiées ci-dessus"
  echo -e "2. Appliquez manuellement les corrections suggérées"
  echo -e "3. Ou exécutez à nouveau ce script avec l'option AUTO_FIX=true"
  echo -e "   (modifiez la ligne AUTO_FIX=false en AUTO_FIX=true dans le script)"
fi

echo -e "\n${BLUE}Sauvegardes stockées dans: $BACKUP_DIR${NC}"

# Fin du script
