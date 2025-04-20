#!/bin/bash

# Script pour analyser les scripts .sh à la racine et nettoyer les backups créés par eux

# Définir les couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Analyse des scripts .sh à la racine pour identifier les fichiers de backup...${NC}"

# Trouver tous les scripts .sh à la racine
SCRIPTS=$(find . -maxdepth 1 -type f -name "*.sh")

# Tableau pour stocker les patterns de backup trouvés
declare -a BACKUP_PATTERNS
declare -a BACKUP_DIRS

# Analyser chaque script pour trouver les commandes de création de backup
for script in $SCRIPTS; do
  echo -e "${YELLOW}Analyse du script:${NC} $script"
  
  # Rechercher les lignes qui créent des dossiers de backup
  BACKUP_DIR_LINES=$(grep -E 'BACKUP_DIR=|mkdir.*backup' "$script" || true)
  if [ ! -z "$BACKUP_DIR_LINES" ]; then
    echo -e "  ${GREEN}Trouvé références à des dossiers de backup${NC}"
    
    # Extraire les patterns de dossiers (imports-backup-* est courant)
    DIRS=$(echo "$BACKUP_DIR_LINES" | grep -oE 'imports-backup[^"]*|\$\{BACKUP_DIR\}' || true)
    if [ ! -z "$DIRS" ]; then
      BACKUP_DIRS+=("imports-backup-*")
      echo -e "  ${GREEN}Pattern de dossier détecté:${NC} imports-backup-*"
    fi
  fi
  
  # Rechercher les lignes qui créent des fichiers .backup
  BACKUP_FILE_LINES=$(grep -E '\.backup' "$script" || true)
  if [ ! -z "$BACKUP_FILE_LINES" ]; then
    echo -e "  ${GREEN}Trouvé références à des fichiers .backup${NC}"
    BACKUP_PATTERNS+=("*.backup")
    echo -e "  ${GREEN}Pattern de fichier détecté:${NC} *.backup"
  fi
done

# Si aucun pattern n'a été trouvé, ajouter les patterns par défaut
if [ ${#BACKUP_PATTERNS[@]} -eq 0 ]; then
  BACKUP_PATTERNS+=("*.backup")
  echo -e "${YELLOW}Aucun pattern de fichier spécifique trouvé, utilisation du pattern par défaut:${NC} *.backup"
fi

if [ ${#BACKUP_DIRS[@]} -eq 0 ]; then
  BACKUP_DIRS+=("imports-backup-*")
  echo -e "${YELLOW}Aucun pattern de dossier spécifique trouvé, utilisation du pattern par défaut:${NC} imports-backup-*"
fi

# Chercher les fichiers et dossiers correspondants
echo -e "\n${BLUE}Recherche des fichiers et dossiers de backup...${NC}"

# Chercher les fichiers .backup
BACKUP_FILES=$(find . -name "*.backup" -type f 2>/dev/null)
BACKUP_FILE_COUNT=$(echo "$BACKUP_FILES" | grep -v "^$" | wc -l)

# Chercher les dossiers de backup
FOUND_BACKUP_DIRS=$(find . -type d -name "imports-backup-*" 2>/dev/null)
BACKUP_DIR_COUNT=$(echo "$FOUND_BACKUP_DIRS" | grep -v "^$" | wc -l)

# Afficher les résultats
echo -e "${YELLOW}$BACKUP_DIR_COUNT${NC} dossiers de backup trouvés"
echo -e "${YELLOW}$BACKUP_FILE_COUNT${NC} fichiers .backup trouvés"

# S'il n'y a rien à supprimer, terminer
if [ $BACKUP_DIR_COUNT -eq 0 ] && [ $BACKUP_FILE_COUNT -eq 0 ]; then
  echo -e "${GREEN}Aucun fichier de backup trouvé.${NC}"
  exit 0
fi

# Afficher tous les éléments trouvés
if [ $BACKUP_DIR_COUNT -gt 0 ]; then
  echo -e "\n${BLUE}Dossiers de backup trouvés:${NC}"
  echo "$FOUND_BACKUP_DIRS" | sed 's/^/  /'
fi

if [ $BACKUP_FILE_COUNT -gt 0 ]; then
  echo -e "\n${BLUE}Fichiers de backup trouvés (affichage limité à 20):${NC}"
  echo "$BACKUP_FILES" | head -n 20 | sed 's/^/  /'
  
  # Si plus de 20 fichiers, indiquer qu'il y en a plus
  if [ $BACKUP_FILE_COUNT -gt 20 ]; then
    echo -e "  ${YELLOW}... et $(($BACKUP_FILE_COUNT - 20)) autres fichiers${NC}"
  fi
fi

# Demander confirmation avant suppression
echo -e "\n${RED}ATTENTION: Cette action va supprimer définitivement tous les fichiers et dossiers de backup listés ci-dessus.${NC}"
read -p "Voulez-vous continuer? (o/n): " CONFIRM

if [[ $CONFIRM != "o" && $CONFIRM != "O" && $CONFIRM != "oui" && $CONFIRM != "Oui" ]]; then
  echo -e "${BLUE}Opération annulée.${NC}"
  exit 0
fi

# Supprimer les dossiers de backup
if [ $BACKUP_DIR_COUNT -gt 0 ]; then
  echo -e "${BLUE}Suppression des dossiers de backup...${NC}"
  for dir in $FOUND_BACKUP_DIRS; do
    rm -rf "$dir"
    echo -e "✅ Supprimé: ${YELLOW}$dir${NC}"
  done
fi

# Supprimer les fichiers de backup
if [ $BACKUP_FILE_COUNT -gt 0 ]; then
  echo -e "${BLUE}Suppression des fichiers .backup...${NC}"
  
  # Utiliser une commande find pour supprimer tous les fichiers en une fois
  find . -name "*.backup" -type f -delete
  echo -e "✅ Supprimé: ${YELLOW}$BACKUP_FILE_COUNT fichiers .backup${NC}"
fi

echo -e "\n${GREEN}Tous les fichiers de backup ont été supprimés.${NC}"
