#!/bin/bash
# Script pour détecter les valeurs CSS codées en dur
# Ce script va rechercher les valeurs de couleurs et autres propriétés codées en dur dans les fichiers CSS

# Couleurs pour la sortie
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Détection des valeurs CSS codées en dur ===${NC}"

# Créer un fichier temporaire pour stocker les résultats
REPORT_FILE="hard_coded_values_report.md"

# Créer l'en-tête du rapport
echo "# Rapport sur les valeurs CSS codées en dur" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## Date d'analyse: $(date '+%d/%m/%Y %H:%M')" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Ce rapport identifie les valeurs CSS codées en dur qui devraient être remplacées par des variables" >> $REPORT_FILE
echo "avec le préfixe \`--tc-\`." >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 1. Rechercher les valeurs de couleurs codées en dur
echo -e "\n${CYAN}1. Recherche des valeurs de couleurs codées en dur${NC}"
echo "## Couleurs codées en dur" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "| Fichier | Ligne | Valeur |" >> $REPORT_FILE
echo "|---------|-------|--------|" >> $REPORT_FILE

# Recherche des couleurs hexadécimales, rgb et rgba
COLOR_PATTERNS=('#[0-9a-fA-F]{3,8}\b' 'rgb\([^)]+\)' 'rgba\([^)]+\)')

for pattern in "${COLOR_PATTERNS[@]}"; do
  find src -name "*.css" -exec grep -n "$pattern" {} \; | while read line; do
    file=$(echo "$line" | cut -d':' -f1)
    line_num=$(echo "$line" | cut -d':' -f2)
    value=$(echo "$line" | grep -o "$pattern")
    
    # Vérifier que ce n'est pas déjà dans une définition de variable
    if ! grep -A 1 -B 1 "$line_num" "$file" | grep -q "^\s*--tc-"; then
      echo "| $file | $line_num | $value |" >> $REPORT_FILE
      echo -e "${YELLOW}Couleur codée en dur trouvée: $value dans $file:$line_num${NC}"
    fi
  done
done

# 2. Rechercher les valeurs d'espacement codées en dur
echo -e "\n${CYAN}2. Recherche des valeurs d'espacement codées en dur${NC}"
echo "" >> $REPORT_FILE
echo "## Espacements codés en dur" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "| Fichier | Ligne | Valeur |" >> $REPORT_FILE
echo "|---------|-------|--------|" >> $REPORT_FILE

SPACING_PATTERNS=('\b[0-9]+px\b' '\b[0-9]+rem\b' '\b[0-9]+em\b')

for pattern in "${SPACING_PATTERNS[@]}"; do
  find src -name "*.css" -exec grep -n "$pattern" {} \; | while read line; do
    file=$(echo "$line" | cut -d':' -f1)
    line_num=$(echo "$line" | cut -d':' -f2)
    content=$(echo "$line" | cut -d':' -f3-)
    
    # Vérifier le contexte pour exclure les faux positifs
    if ! grep -A 1 -B 1 "$line_num" "$file" | grep -q "^\s*--tc-"; then
      # Extraire chaque valeur de spacing
      echo "$content" | grep -o "$pattern" | while read value; do
        # Exclure certaines valeurs communes qui sont acceptables en dur
        if [[ "$value" != "0px" && "$value" != "1px" && "$value" != "2px" && "$value" != "100%" ]]; then
          echo "| $file | $line_num | $value |" >> $REPORT_FILE
          echo -e "${YELLOW}Espacement codé en dur trouvé: $value dans $file:$line_num${NC}"
        fi
      done
    fi
  done
done

echo -e "\n${CYAN}Analyse terminée. Rapport généré dans ${REPORT_FILE}${NC}"
