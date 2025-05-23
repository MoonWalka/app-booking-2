#!/bin/bash

# Script d'analyse des fichiers de backup et versions obsolètes
# ⚠️  Ce script ANALYSE seulement, il ne supprime RIEN

echo "🔍 ANALYSE DES FICHIERS DE BACKUP ET VERSIONS OBSOLÈTES"
echo "======================================================"

# Créer un fichier de rapport
REPORT_FILE="backup_analysis_report.txt"
echo "📋 Rapport généré le $(date)" > $REPORT_FILE
echo "=====================================================" >> $REPORT_FILE

echo ""
echo "1️⃣  FICHIERS .backup/.bak DÉTECTÉS:"
echo "-----------------------------------"

# Chercher les fichiers .backup et .bak
BACKUP_FILES=$(find . -name "*.backup" -o -name "*.bak" | grep -v node_modules | grep -v .git | sort)

if [ -n "$BACKUP_FILES" ]; then
    echo "$BACKUP_FILES"
    echo "" >> $REPORT_FILE
    echo "FICHIERS .backup/.bak:" >> $REPORT_FILE
    echo "$BACKUP_FILES" >> $REPORT_FILE
    
    # Calculer la taille totale
    TOTAL_SIZE=$(du -sh $(echo $BACKUP_FILES | tr '\n' ' ') 2>/dev/null | tail -1 | cut -f1)
    echo "📦 Taille totale: $TOTAL_SIZE"
    echo "Taille totale: $TOTAL_SIZE" >> $REPORT_FILE
else
    echo "❌ Aucun fichier .backup/.bak trouvé"
    echo "Aucun fichier .backup/.bak trouvé" >> $REPORT_FILE
fi

echo ""
echo "2️⃣  DOSSIERS DE BACKUP DÉTECTÉS:"
echo "--------------------------------"

# Chercher les dossiers de backup
BACKUP_DIRS=$(find . -type d -name "*backup*" | grep -v node_modules | grep -v .git | sort)

if [ -n "$BACKUP_DIRS" ]; then
    echo "$BACKUP_DIRS"
    echo "" >> $REPORT_FILE
    echo "DOSSIERS DE BACKUP:" >> $REPORT_FILE
    echo "$BACKUP_DIRS" >> $REPORT_FILE
    
    # Calculer la taille de chaque dossier
    echo ""
    echo "📊 Tailles des dossiers:"
    for dir in $BACKUP_DIRS; do
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "  $dir: $size"
        echo "  $dir: $size" >> $REPORT_FILE
    done
else
    echo "❌ Aucun dossier de backup trouvé"
    echo "Aucun dossier de backup trouvé" >> $REPORT_FILE
fi

echo ""
echo "3️⃣  VERSIONS MULTIPLES DÉTECTÉES (hooks):"
echo "-----------------------------------------"

# Analyser les hooks avec versions multiples
echo "" >> $REPORT_FILE
echo "VERSIONS MULTIPLES (hooks):" >> $REPORT_FILE

# Chercher les patterns de versions multiples
MIGRATED_FILES=$(find src/hooks -name "*Migrated*" 2>/dev/null | sort)
OPTIMIZED_FILES=$(find src/hooks -name "*Optimized*" 2>/dev/null | sort)
COMPLETE_FILES=$(find src/hooks -name "*Complete*" 2>/dev/null | sort)

if [ -n "$MIGRATED_FILES" ]; then
    echo "🔄 Fichiers 'Migrated' trouvés:"
    echo "$MIGRATED_FILES"
    echo "Fichiers 'Migrated':" >> $REPORT_FILE
    echo "$MIGRATED_FILES" >> $REPORT_FILE
fi

if [ -n "$OPTIMIZED_FILES" ]; then
    echo "⚡ Fichiers 'Optimized' trouvés:"
    echo "$OPTIMIZED_FILES"
    echo "Fichiers 'Optimized':" >> $REPORT_FILE
    echo "$OPTIMIZED_FILES" >> $REPORT_FILE
fi

if [ -n "$COMPLETE_FILES" ]; then
    echo "✅ Fichiers 'Complete' trouvés:"
    echo "$COMPLETE_FILES"
    echo "Fichiers 'Complete':" >> $REPORT_FILE
    echo "$COMPLETE_FILES" >> $REPORT_FILE
fi

echo ""
echo "4️⃣  ANALYSE DES IMPORTS/USAGES:"
echo "-------------------------------"

# Fonction pour vérifier si un fichier est utilisé
check_usage() {
    local file=$1
    local basename=$(basename "$file" .js)
    local usage_count=$(grep -r "import.*$basename" src/ 2>/dev/null | grep -v "$file" | wc -l)
    echo "$file: $usage_count références trouvées"
}

echo "Vérification des usages des fichiers de backup..." >> $REPORT_FILE

# Vérifier l'usage des fichiers backup principaux
for file in $BACKUP_FILES; do
    if [[ $file == *.js ]]; then
        check_usage "$file" >> $REPORT_FILE
    fi
done

echo ""
echo "5️⃣  RECOMMANDATIONS DE SUPPRESSION:"
echo "-----------------------------------"

echo "" >> $REPORT_FILE
echo "RECOMMANDATIONS:" >> $REPORT_FILE

# Recommandations basées sur l'analyse
if [ -n "$BACKUP_FILES" ]; then
    echo "✅ SÛRS À SUPPRIMER:" >> $REPORT_FILE
    echo "  - Tous les fichiers .backup et .bak (ils sont dans Git)" >> $REPORT_FILE
fi

if [ -n "$BACKUP_DIRS" ]; then
    echo "⚠️  À EXAMINER:" >> $REPORT_FILE
    echo "  - Dossiers de backup (vérifier le contenu d'abord)" >> $REPORT_FILE
fi

if [ -n "$MIGRATED_FILES" ] || [ -n "$OPTIMIZED_FILES" ]; then
    echo "🔍 À ANALYSER:" >> $REPORT_FILE
    echo "  - Versions multiples (vérifier les imports avant suppression)" >> $REPORT_FILE
fi

echo ""
echo "📋 Rapport complet sauvegardé dans: $REPORT_FILE"
echo ""
echo "⚠️  IMPORTANT: Ce script n'a RIEN supprimé. Examinez le rapport avant de procéder." 