#!/bin/bash

# Script amélioré pour nettoyer tous les types de backups (fichiers et dossiers)

# Définir les couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Analyse complète des backups dans le projet...${NC}"

# 1. Chercher tous les fichiers .backup
echo -e "${YELLOW}Recherche des fichiers .backup...${NC}"
BACKUP_FILES=$(find . -name "*.backup" -type f 2>/dev/null)
BACKUP_FILE_COUNT=$(echo "$BACKUP_FILES" | grep -v "^$" | wc -l)
echo -e "  ${GREEN}$BACKUP_FILE_COUNT${NC} fichiers .backup trouvés"

# 2. Chercher les dossiers de backup avec différents patterns
echo -e "${YELLOW}Recherche des dossiers de backup...${NC}"

# Patterns de dossiers à rechercher
BACKUP_DIR_PATTERNS=(
    "imports-backup-*"
    "*-backup-*"
    "*backup*"
    "*sauvegarde*"
    "*save-*"
)

# Fonction pour trouver les dossiers uniques correspondant aux patterns
find_unique_dirs() {
    local all_dirs=""
    for pattern in "${BACKUP_DIR_PATTERNS[@]}"; do
        dirs=$(find . -type d -name "$pattern" 2>/dev/null)
        if [ ! -z "$dirs" ]; then
            all_dirs="$all_dirs
$dirs"
        fi
    done
    
    # Éliminer les doublons et les lignes vides
    echo "$all_dirs" | grep -v "^$" | sort | uniq
}

FOUND_BACKUP_DIRS=$(find_unique_dirs)
BACKUP_DIR_COUNT=$(echo "$FOUND_BACKUP_DIRS" | grep -v "^$" | wc -l)
echo -e "  ${GREEN}$BACKUP_DIR_COUNT${NC} dossiers de backup trouvés"

# 3. Chercher les dossiers node_modules/.cache qui peuvent contenir d'anciens fichiers
echo -e "${YELLOW}Recherche des caches potentiels...${NC}"
CACHE_DIRS=$(find . -type d -path "*/node_modules/.cache" 2>/dev/null)
CACHE_DIR_COUNT=$(echo "$CACHE_DIRS" | grep -v "^$" | wc -l)
echo -e "  ${GREEN}$CACHE_DIR_COUNT${NC} dossiers de cache node_modules trouvés"

# Afficher un récapitulatif
echo -e "\n${BLUE}=== Récapitulatif des éléments trouvés ===${NC}"
echo -e "${YELLOW}$BACKUP_FILE_COUNT${NC} fichiers .backup"
echo -e "${YELLOW}$BACKUP_DIR_COUNT${NC} dossiers de backup"
echo -e "${YELLOW}$CACHE_DIR_COUNT${NC} dossiers de cache"

# S'il n'y a rien à supprimer, terminer
TOTAL_COUNT=$((BACKUP_FILE_COUNT + BACKUP_DIR_COUNT + CACHE_DIR_COUNT))
if [ $TOTAL_COUNT -eq 0 ]; then
  echo -e "\n${GREEN}Aucun élément à nettoyer.${NC}"
  exit 0
fi

# Afficher les détails des éléments trouvés
if [ $BACKUP_DIR_COUNT -gt 0 ]; then
  echo -e "\n${BLUE}Dossiers de backup trouvés:${NC}"
  echo "$FOUND_BACKUP_DIRS" | sed 's/^/  /'
fi

if [ $BACKUP_FILE_COUNT -gt 0 ]; then
  echo -e "\n${BLUE}Fichiers .backup (aperçu limité à 15):${NC}"
  echo "$BACKUP_FILES" | head -n 15 | sed 's/^/  /'
  
  if [ $BACKUP_FILE_COUNT -gt 15 ]; then
    echo -e "  ${YELLOW}... et $(($BACKUP_FILE_COUNT - 15)) autres fichiers${NC}"
  fi
fi

if [ $CACHE_DIR_COUNT -gt 0 ]; then
  echo -e "\n${BLUE}Dossiers de cache:${NC}"
  echo "$CACHE_DIRS" | sed 's/^/  /'
fi

# Demander confirmation avant suppression
echo -e "\n${RED}ATTENTION: Cette action va supprimer définitivement tous les éléments listés ci-dessus.${NC}"
read -p "Voulez-vous continuer? (o/n): " CONFIRM

if [[ $CONFIRM != "o" && $CONFIRM != "O" && $CONFIRM != "oui" && $CONFIRM != "Oui" ]]; then
  echo -e "${BLUE}Opération annulée.${NC}"
  exit 0
fi

# Supprimer les fichiers .backup
if [ $BACKUP_FILE_COUNT -gt 0 ]; then
  echo -e "\n${BLUE}Suppression des fichiers .backup...${NC}"
  find . -name "*.backup" -type f -delete
  echo -e "✅ ${GREEN}$BACKUP_FILE_COUNT fichiers .backup supprimés${NC}"
fi

# Supprimer les dossiers de backup
if [ $BACKUP_DIR_COUNT -gt 0 ]; then
  echo -e "\n${BLUE}Suppression des dossiers de backup...${NC}"
  for dir in $FOUND_BACKUP_DIRS; do
    if [ -d "$dir" ]; then
      rm -rf "$dir"
      echo -e "✅ Supprimé: ${YELLOW}$dir${NC}"
    fi
  done
fi

# Proposer de nettoyer les caches
if [ $CACHE_DIR_COUNT -gt 0 ]; then
  echo -e "\n${YELLOW}Voulez-vous également nettoyer les dossiers de cache? (o/n):${NC} "
  read CLEAN_CACHE
  
  if [[ $CLEAN_CACHE == "o" || $CLEAN_CACHE == "O" || $CLEAN_CACHE == "oui" || $CLEAN_CACHE == "Oui" ]]; then
    echo -e "${BLUE}Nettoyage des dossiers de cache...${NC}"
    for cache_dir in $CACHE_DIRS; do
      if [ -d "$cache_dir" ]; then
        rm -rf "$cache_dir"
        echo -e "✅ Cache nettoyé: ${YELLOW}$cache_dir${NC}"
      fi
    done
  else
    echo -e "${BLUE}Les dossiers de cache ont été conservés.${NC}"
  fi
fi

# Rechercher d'autres fichiers temporaires couramment utilisés
echo -e "\n${BLUE}Recherche de fichiers temporaires supplémentaires...${NC}"

TEMP_PATTERNS=(
  "*.tmp"
  "*.temp"
  "*.swp"
  "*.bak"
  "*.old"
  "*~"
)

TOTAL_TEMP_FILES=0

for pattern in "${TEMP_PATTERNS[@]}"; do
  TEMP_FILES=$(find . -name "$pattern" -type f 2>/dev/null)
  COUNT=$(echo "$TEMP_FILES" | grep -v "^$" | wc -l)
  
  if [ $COUNT -gt 0 ]; then
    TOTAL_TEMP_FILES=$((TOTAL_TEMP_FILES + COUNT))
    echo -e "  ${YELLOW}$COUNT${NC} fichiers $pattern trouvés"
  fi
done

if [ $TOTAL_TEMP_FILES -gt 0 ]; then
  echo -e "\n${YELLOW}Voulez-vous supprimer ces $TOTAL_TEMP_FILES fichiers temporaires? (o/n):${NC} "
  read CLEAN_TEMP
  
  if [[ $CLEAN_TEMP == "o" || $CLEAN_TEMP == "O" || $CLEAN_TEMP == "oui" || $CLEAN_TEMP == "Oui" ]]; then
    echo -e "${BLUE}Suppression des fichiers temporaires...${NC}"
    for pattern in "${TEMP_PATTERNS[@]}"; do
      find . -name "$pattern" -type f -delete 2>/dev/null
    done
    echo -e "✅ ${GREEN}$TOTAL_TEMP_FILES fichiers temporaires supprimés${NC}"
  else
    echo -e "${BLUE}Les fichiers temporaires ont été conservés.${NC}"
  fi
fi

echo -e "\n${GREEN}Nettoyage terminé avec succès!${NC}"
echo -e "${BLUE}Espace disque libéré. Votre projet est maintenant plus propre.${NC}"
