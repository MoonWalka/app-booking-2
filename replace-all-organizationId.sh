#!/bin/bash

# Script pour remplacer toutes les occurrences de organizationId par entrepriseId

echo "=== Remplacement de organizationId par entrepriseId ==="
echo "Date: $(date)"
echo ""

# Créer un dossier de backup
BACKUP_DIR="backup-organizationId-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Créer un rapport
REPORT_FILE="replacement-report-$(date +%Y%m%d_%H%M%S).txt"

# Fonction pour remplacer dans un fichier
replace_in_file() {
    local file="$1"
    
    # Créer le répertoire de backup si nécessaire
    local backup_path="$BACKUP_DIR/$file"
    mkdir -p "$(dirname "$backup_path")"
    
    # Faire une copie de sauvegarde
    cp "$file" "$backup_path"
    
    # Effectuer le remplacement
    sed -i '' \
        -e 's/organizationId/entrepriseId/g' \
        -e 's/OrganizationId/EntrepriseId/g' \
        -e 's/organization-id/entreprise-id/g' \
        -e 's/Organization-Id/Entreprise-Id/g' \
        -e 's/ORGANIZATION_ID/ENTREPRISE_ID/g' \
        "$file"
    
    echo "✓ Traité: $file"
}

# Exporter la fonction pour xargs
export -f replace_in_file
export BACKUP_DIR

# Compter les fichiers
TOTAL=$(cat files_with_organizationId.txt | wc -l)
echo "Nombre de fichiers à traiter: $TOTAL"
echo ""

# Traiter tous les fichiers
cat files_with_organizationId.txt | xargs -I {} bash -c 'replace_in_file "$@"' _ {}

echo ""
echo "=== Résumé ==="
echo "Backup créé dans: $BACKUP_DIR"
echo "Rapport sauvegardé dans: $REPORT_FILE"

# Vérifier s'il reste des occurrences
echo ""
echo "Vérification des occurrences restantes..."
REMAINING=$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./build/*" \
    -not -path "./dist/*" \
    -not -path "./$BACKUP_DIR/*" \
    -exec grep -l "organizationId" {} \; | wc -l)

echo "Fichiers contenant encore 'organizationId': $REMAINING"

# Afficher quelques exemples s'il en reste
if [ "$REMAINING" -gt 0 ]; then
    echo ""
    echo "Quelques fichiers contenant encore 'organizationId':"
    find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
        -not -path "./node_modules/*" \
        -not -path "./.git/*" \
        -not -path "./build/*" \
        -not -path "./dist/*" \
        -not -path "./$BACKUP_DIR/*" \
        -exec grep -l "organizationId" {} \; | head -5
fi

echo ""
echo "Terminé!"