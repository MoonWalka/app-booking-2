#!/bin/bash

# Script de correction des fallbacks CSS avec espaces inconsistants
# Ce script cible spécifiquement la syntaxe var(--variable,valeur) sans espace après la virgule
# Il sauvegarde les fichiers originaux avant modification

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
  echo -e "${2}${1}${NC}"
}

# Fonction pour créer un répertoire de sauvegarde
create_backup_dir() {
  local backup_dir="$1"
  if [ ! -d "$backup_dir" ]; then
    mkdir -p "$backup_dir"
    print_message "✅ Répertoire de sauvegarde créé: $backup_dir" "$GREEN"
  else
    print_message "ℹ️ Répertoire de sauvegarde existant: $backup_dir" "$BLUE"
  fi
}

# Fonction pour sauvegarder un fichier
backup_file() {
  local file="$1"
  local backup_dir="$2"
  local relative_path=$(dirname "${file#$PROJECT_DIR/}")
  local backup_path="$backup_dir/$relative_path"
  
  # Créer le répertoire de destination si nécessaire
  mkdir -p "$backup_path"
  
  # Copier le fichier
  cp "$file" "$backup_path/"
  
  if [ $? -eq 0 ]; then
    print_message "✅ Sauvegarde de: $file" "$GREEN"
    return 0
  else
    print_message "❌ Échec de la sauvegarde de: $file" "$RED"
    return 1
  fi
}

# Fonction pour corriger les fallbacks avec espaces inconsistants dans un fichier CSS
fix_inconsistent_spaces() {
  local file="$1"
  local temp_file="$file.temp"
  local backup_success="$2"
  
  # Utiliser Perl pour la correction
  # Cette expression recherche les cas où var( est suivi d'une variable, puis d'une virgule avec espaces inconsistants
  # et remplace par var(--variable) sans fallback
  perl -pe '
    # Cas 1: var(--variable,valeur) - sans espace après la virgule
    s/var\((--[a-zA-Z0-9-_]+),([^,\s][^)]*)\)/var(\1)/g;
    
    # Cas 2: var(--variable , valeur) - avec espace avant la virgule
    s/var\((--[a-zA-Z0-9-_]+)\s+,\s*([^)]*)\)/var(\1)/g;
    
    # Cas 3: var(--variable,  valeur) - avec plusieurs espaces après la virgule
    s/var\((--[a-zA-Z0-9-_]+),\s{2,}([^)]*)\)/var(\1)/g;
    
    # Cas 4: var(--variable, valeur avec parenthèses) - pour gérer des valeurs contenant des parenthèses
    s/var\((--[a-zA-Z0-9-_]+),\s*([^)]*\([^)]*\)[^)]*)\)/var(\1)/g;
  ' "$file" > "$temp_file"
  
  # Vérifier si la modification a réussi
  if [ $? -eq 0 ]; then
    # Vérifier si des modifications ont été apportées
    if ! diff -q "$file" "$temp_file" > /dev/null; then
      # Remplacer le fichier original par le fichier temporaire
      mv "$temp_file" "$file"
      
      if [ $backup_success -eq 1 ]; then
        print_message "✅ Corrigé: $file (espaces inconsistants corrigés)" "$GREEN"
      else
        print_message "⚠️ Corrigé sans sauvegarde: $file (espaces inconsistants corrigés)" "$YELLOW"
      fi
      
      return 0
    else
      # Aucune modification n'a été apportée
      rm -f "$temp_file"
      print_message "ℹ️ Aucun espace inconsistant trouvé dans: $file" "$BLUE"
      return 0
    fi
  else
    print_message "❌ Échec de la correction de: $file" "$RED"
    # Supprimer le fichier temporaire en cas d'échec
    rm -f "$temp_file"
    return 1
  fi
}

# Fonction principale
main() {
  # Définir le répertoire du projet
  PROJECT_DIR="$(pwd)"
  
  # Créer un timestamp pour le répertoire de sauvegarde
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_DIR="$PROJECT_DIR/css_spaces_backup_$TIMESTAMP"
  
  # Créer le répertoire de sauvegarde
  create_backup_dir "$BACKUP_DIR"
  
  # Compteurs
  total_files=0
  processed_files=0
  backup_failed=0
  fix_failed=0
  
  print_message "🔍 Recherche des fichiers CSS..." "$BLUE"
  
  # Trouver tous les fichiers CSS
  css_files=$(find "$PROJECT_DIR" -name "*.css" -type f)
  
  # Compter le nombre total de fichiers
  total_files=$(echo "$css_files" | wc -l)
  
  print_message "🔍 Traitement de $total_files fichiers CSS..." "$BLUE"
  
  # Traiter chaque fichier CSS
  for file in $css_files; do
    # Sauvegarder le fichier
    backup_file "$file" "$BACKUP_DIR"
    backup_success=$?
    
    # Corriger les fallbacks avec espaces inconsistants
    fix_inconsistent_spaces "$file" "$backup_success"
    fix_success=$?
    
    # Mettre à jour les compteurs
    processed_files=$((processed_files + 1))
    
    if [ $backup_success -ne 0 ]; then
      backup_failed=$((backup_failed + 1))
    fi
    
    if [ $fix_success -ne 0 ]; then
      fix_failed=$((fix_failed + 1))
    fi
    
    # Afficher la progression
    if [ $((processed_files % 100)) -eq 0 ]; then
      print_message "⏳ Progression: $processed_files/$total_files fichiers traités" "$BLUE"
    fi
  done
  
  # Afficher le résumé
  print_message "\n📊 Résumé:" "$BLUE"
  print_message "- Fichiers CSS traités: $processed_files/$total_files" "$BLUE"
  print_message "- Sauvegardes échouées: $backup_failed" "$BLUE"
  print_message "- Corrections échouées: $fix_failed" "$BLUE"
  print_message "- Répertoire de sauvegarde: $BACKUP_DIR" "$BLUE"
  
  print_message "\n✅ Traitement terminé!" "$GREEN"
  print_message "Pour restaurer les fichiers originaux, utilisez la commande:" "$BLUE"
  print_message "cp -r $BACKUP_DIR/* $PROJECT_DIR/" "$YELLOW"
}

# Exécuter la fonction principale
main
