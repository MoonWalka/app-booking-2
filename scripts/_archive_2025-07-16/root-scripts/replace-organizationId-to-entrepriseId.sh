#!/bin/bash

# Script pour remplacer toutes les occurrences de organizationId par entrepriseId
# Avec sauvegarde et rapport détaillé

echo "=== Remplacement de organizationId par entrepriseId ==="
echo "Date: $(date)"
echo ""

# Créer un dossier de backup
BACKUP_DIR="backup-organizationId-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Créer un rapport
REPORT_FILE="replacement-report-$(date +%Y%m%d_%H%M%S).txt"
echo "Rapport de remplacement organizationId -> entrepriseId" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "========================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Lire la liste des fichiers
FILES_COUNT=$(wc -l < files_with_organizationId.txt)
echo "Nombre de fichiers à traiter: $FILES_COUNT"
echo "Nombre de fichiers à traiter: $FILES_COUNT" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Compteurs
PROCESSED=0
ERRORS=0

# Traiter chaque fichier
while IFS= read -r file; do
    if [ -f "$file" ]; then
        echo "Traitement de: $file"
        
        # Créer le répertoire de backup si nécessaire
        BACKUP_PATH="$BACKUP_DIR/$file"
        mkdir -p "$(dirname "$BACKUP_PATH")"
        
        # Faire une copie de sauvegarde
        cp "$file" "$BACKUP_PATH"
        
        # Compter les occurrences avant remplacement
        COUNT_BEFORE=$(grep -c "organizationId" "$file" 2>/dev/null || echo "0")
        
        # Effectuer le remplacement avec sed
        # On remplace toutes les variantes courantes
        sed -i '' \
            -e 's/organizationId/entrepriseId/g' \
            -e 's/OrganizationId/EntrepriseId/g' \
            -e 's/organization-id/entreprise-id/g' \
            -e 's/Organization-Id/Entreprise-Id/g' \
            -e 's/ORGANIZATION_ID/ENTREPRISE_ID/g' \
            "$file"
        
        # Compter les occurrences après remplacement
        COUNT_AFTER=$(grep -c "organizationId" "$file" 2>/dev/null || echo "0")
        REPLACED=$((COUNT_BEFORE - COUNT_AFTER))
        
        echo "  - Remplacements effectués: $REPLACED" >> "$REPORT_FILE"
        
        PROCESSED=$((PROCESSED + 1))
        
        # Afficher la progression
        if [ $((PROCESSED % 10)) -eq 0 ]; then
            echo "Progression: $PROCESSED/$FILES_COUNT fichiers traités..."
        fi
    else
        echo "ERREUR: Fichier non trouvé: $file" >> "$REPORT_FILE"
        ERRORS=$((ERRORS + 1))
    fi
done < files_with_organizationId.txt

echo ""
echo "=== Résumé ==="
echo "Fichiers traités: $PROCESSED"
echo "Erreurs: $ERRORS"
echo "Backup créé dans: $BACKUP_DIR"
echo "Rapport sauvegardé dans: $REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "=== Résumé ===" >> "$REPORT_FILE"
echo "Fichiers traités: $PROCESSED" >> "$REPORT_FILE"
echo "Erreurs: $ERRORS" >> "$REPORT_FILE"
echo "Backup créé dans: $BACKUP_DIR" >> "$REPORT_FILE"

# Vérifier s'il reste des occurrences
echo ""
echo "Vérification des occurrences restantes..."
REMAINING=$(grep -r "organizationId" --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=dist --exclude-dir="$BACKUP_DIR" . | wc -l)
echo "Occurrences restantes de 'organizationId': $REMAINING"
echo "" >> "$REPORT_FILE"
echo "Occurrences restantes de 'organizationId': $REMAINING" >> "$REPORT_FILE"

echo ""
echo "Terminé! Vérifiez le rapport pour plus de détails."