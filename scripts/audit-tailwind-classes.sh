#!/bin/bash

# 🔍 AUDIT CLASSES TAILWIND - PHASE 3
# Identifie toutes les classes Tailwind utilisées dans le projet
# Usage: ./scripts/audit-tailwind-classes.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔍 AUDIT CLASSES TAILWIND - PHASE 3${NC}"
echo "====================================="
echo

# Créer le dossier de rapport
mkdir -p reports/phase3

# Fichier de rapport
RAPPORT="reports/phase3/tailwind-audit.txt"
echo "# AUDIT CLASSES TAILWIND - $(date)" > $RAPPORT
echo "# Généré automatiquement pour la Phase 3" >> $RAPPORT
echo >> $RAPPORT

echo -e "${YELLOW}📊 RECHERCHE CLASSES TAILWIND${NC}"
echo "============================="

# Patterns de classes Tailwind communes
PATTERNS=(
    "text-xs|text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl|text-4xl|text-5xl|text-6xl"
    "font-thin|font-light|font-normal|font-medium|font-semibold|font-bold|font-extrabold|font-black"
    "p-[0-9]|px-[0-9]|py-[0-9]|pt-[0-9]|pb-[0-9]|pl-[0-9]|pr-[0-9]"
    "m-[0-9]|mx-[0-9]|my-[0-9]|mt-[0-9]|mb-[0-9]|ml-[0-9]|mr-[0-9]"
    "gap-[0-9]|space-x-[0-9]|space-y-[0-9]"
    "w-[0-9]|h-[0-9]|max-w-|min-w-|max-h-|min-h-"
    "bg-red-|bg-blue-|bg-green-|bg-yellow-|bg-purple-|bg-pink-|bg-gray-|bg-indigo-"
    "text-red-|text-blue-|text-green-|text-yellow-|text-purple-|text-pink-|text-gray-|text-indigo-"
    "border-red-|border-blue-|border-green-|border-yellow-|border-purple-|border-pink-|border-gray-"
    "rounded|rounded-sm|rounded-md|rounded-lg|rounded-xl|rounded-2xl|rounded-full"
    "shadow|shadow-sm|shadow-md|shadow-lg|shadow-xl|shadow-2xl|shadow-inner|shadow-none"
    "flex|grid|block|inline|hidden|visible"
    "justify-|items-|content-|self-"
    "transition|duration-|ease-|delay-"
)

# Rechercher dans les fichiers
EXTENSIONS=("*.html" "*.vue" "*.js" "*.jsx" "*.ts" "*.tsx" "*.php" "*.twig")

echo "Recherche dans les fichiers..."
echo

# Compteurs
TOTAL_CLASSES=0
TOTAL_FILES=0

for pattern in "${PATTERNS[@]}"; do
    echo -e "${BLUE}Pattern: $pattern${NC}" | tee -a $RAPPORT
    
    for ext in "${EXTENSIONS[@]}"; do
        if find . -name "$ext" -type f 2>/dev/null | head -1 > /dev/null; then
            MATCHES=$(find . -name "$ext" -type f -exec grep -l -E "$pattern" {} \; 2>/dev/null | wc -l)
            if [ $MATCHES -gt 0 ]; then
                echo "  $ext: $MATCHES fichiers" | tee -a $RAPPORT
                TOTAL_FILES=$((TOTAL_FILES + MATCHES))
                
                # Extraire les classes spécifiques
                find . -name "$ext" -type f -exec grep -oE "$pattern" {} \; 2>/dev/null | sort | uniq >> $RAPPORT
            fi
        fi
    done
    echo | tee -a $RAPPORT
done

echo -e "${YELLOW}📋 CLASSES TAILWIND SPÉCIFIQUES${NC}"
echo "==============================="

# Rechercher des classes Tailwind spécifiques communes
SPECIFIC_CLASSES=(
    "container"
    "mx-auto"
    "text-center"
    "text-left"
    "text-right"
    "font-sans"
    "font-serif"
    "font-mono"
    "uppercase"
    "lowercase"
    "capitalize"
    "underline"
    "line-through"
    "no-underline"
    "hover:"
    "focus:"
    "active:"
    "disabled:"
    "first:"
    "last:"
    "odd:"
    "even:"
)

echo "## CLASSES SPÉCIFIQUES TROUVÉES" >> $RAPPORT
echo >> $RAPPORT

for class in "${SPECIFIC_CLASSES[@]}"; do
    COUNT=0
    for ext in "${EXTENSIONS[@]}"; do
        if find . -name "$ext" -type f 2>/dev/null | head -1 > /dev/null; then
            MATCHES=$(find . -name "$ext" -type f -exec grep -c "$class" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
            COUNT=$((COUNT + MATCHES))
        fi
    done
    
    if [ $COUNT -gt 0 ]; then
        echo "✅ $class: $COUNT occurrences" | tee -a $RAPPORT
        TOTAL_CLASSES=$((TOTAL_CLASSES + COUNT))
    fi
done

echo

# Rechercher dans les fichiers CSS pour les imports Tailwind
echo -e "${YELLOW}🎨 IMPORTS TAILWIND CSS${NC}"
echo "======================="

echo "## IMPORTS TAILWIND DÉTECTÉS" >> $RAPPORT
echo >> $RAPPORT

if find . -name "*.css" -type f -exec grep -l "@tailwind\|tailwindcss" {} \; 2>/dev/null | head -1 > /dev/null; then
    echo "Imports Tailwind trouvés dans:" | tee -a $RAPPORT
    find . -name "*.css" -type f -exec grep -l "@tailwind\|tailwindcss" {} \; 2>/dev/null | while read file; do
        echo "  📄 $file" | tee -a $RAPPORT
        grep "@tailwind\|tailwindcss" "$file" 2>/dev/null | sed 's/^/    /' | tee -a $RAPPORT
    done
else
    echo "❌ Aucun import Tailwind détecté" | tee -a $RAPPORT
fi

echo

# Rechercher les fichiers de configuration Tailwind
echo -e "${YELLOW}⚙️  CONFIGURATION TAILWIND${NC}"
echo "========================="

echo "## FICHIERS DE CONFIGURATION" >> $RAPPORT
echo >> $RAPPORT

CONFIG_FILES=("tailwind.config.js" "tailwind.config.ts" "postcss.config.js" "package.json")

for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$config" ]; then
        echo "✅ $config trouvé" | tee -a $RAPPORT
        if [ "$config" = "package.json" ]; then
            if grep -q "tailwind" "$config" 2>/dev/null; then
                echo "  📦 Tailwind dans les dépendances" | tee -a $RAPPORT
                grep "tailwind" "$config" 2>/dev/null | sed 's/^/    /' | tee -a $RAPPORT
            fi
        fi
    else
        echo "❌ $config non trouvé" | tee -a $RAPPORT
    fi
done

echo

# Statistiques finales
echo -e "${PURPLE}📊 STATISTIQUES FINALES${NC}"
echo "======================="

echo "## RÉSUMÉ AUDIT TAILWIND" >> $RAPPORT
echo >> $RAPPORT

echo "Classes Tailwind détectées: $TOTAL_CLASSES" | tee -a $RAPPORT
echo "Fichiers concernés: $TOTAL_FILES" | tee -a $RAPPORT

if [ $TOTAL_CLASSES -gt 0 ]; then
    echo -e "${GREEN}✅ Migration Tailwind nécessaire${NC}" | tee -a $RAPPORT
    echo "📋 Rapport détaillé: $RAPPORT" | tee -a $RAPPORT
    echo
    echo -e "${BLUE}🚀 Prochaine étape: Migration des classes vers variables CSS${NC}"
else
    echo -e "${YELLOW}⚠️  Peu ou pas de classes Tailwind détectées${NC}" | tee -a $RAPPORT
    echo "📋 Vérifiez le rapport: $RAPPORT" | tee -a $RAPPORT
fi

echo
echo -e "${PURPLE}Audit Tailwind terminé${NC}"
echo "Rapport sauvegardé: $RAPPORT" 