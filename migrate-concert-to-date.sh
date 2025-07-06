#!/bin/bash

# Script de migration concert → date
# ATTENTION: Faire des backups avant d'exécuter ce script !

echo "=== SCRIPT DE MIGRATION CONCERT → DATE ==="
echo "ATTENTION: Ce script va modifier vos fichiers sources !"
echo "Assurez-vous d'avoir fait un backup ou un commit git avant de continuer."
echo ""
read -p "Voulez-vous continuer ? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Migration annulée."
    exit 1
fi

# Créer un dossier de backup
BACKUP_DIR="backup-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Création du dossier de backup: $BACKUP_DIR"

# Fonction pour faire un backup et migrer un fichier
migrate_file() {
    local file=$1
    local backup_path="$BACKUP_DIR/$(dirname "$file")"
    
    # Créer le dossier de backup si nécessaire
    mkdir -p "$backup_path"
    
    # Copier le fichier original
    cp "$file" "$backup_path/"
    
    echo "Migration de: $file"
}

echo ""
echo "=== PHASE 1: MIGRATION DES COLLECTIONS FIREBASE ==="
echo ""

# Migrer les références à collection('concerts')
echo "Recherche des références à collection('concerts')..."
grep -r "collection('concerts')" src --include="*.js" --include="*.jsx" -l | while read file; do
    migrate_file "$file"
    sed -i '' "s/collection('concerts')/collection('dates')/g" "$file"
    echo "  ✓ Migré: collection('concerts') → collection('dates')"
done

# Migrer les références à collection("concerts")
grep -r 'collection("concerts")' src --include="*.js" --include="*.jsx" -l | while read file; do
    migrate_file "$file"
    sed -i '' 's/collection("concerts")/collection("dates")/g' "$file"
    echo "  ✓ Migré: collection(\"concerts\") → collection(\"dates\")"
done

# Migrer les références dans les tableaux de collections
grep -r "'concerts'" src --include="*.js" --include="*.jsx" -l | grep -E "collections.*=.*\[" | while read file; do
    migrate_file "$file"
    sed -i '' "s/'concerts'/'dates'/g" "$file"
    echo "  ✓ Migré: 'concerts' → 'dates' dans les tableaux"
done

echo ""
echo "=== PHASE 2: MIGRATION DES ROUTES ==="
echo ""

# Migrer les routes /concerts
grep -r '"/concerts' src --include="*.js" --include="*.jsx" -l | while read file; do
    migrate_file "$file"
    sed -i '' 's|"/concerts|"/dates|g' "$file"
    echo "  ✓ Migré: /concerts → /dates"
done

# Migrer les routes '/concerts
grep -r "'/concerts" src --include="*.js" --include="*.jsx" -l | while read file; do
    migrate_file "$file"
    sed -i '' "s|'/concerts|'/dates|g" "$file"
    echo "  ✓ Migré: '/concerts' → '/dates'"
done

echo ""
echo "=== PHASE 3: MIGRATION DES PROPRIÉTÉS (AVEC PRUDENCE) ==="
echo ""
echo "Les migrations suivantes nécessitent une vérification manuelle :"
echo ""

# Lister les fichiers avec des propriétés .concert
echo "Fichiers avec des propriétés .concert à vérifier manuellement :"
grep -r "\.concert[^s]" src --include="*.js" --include="*.jsx" -l | while read file; do
    echo "  - $file"
done

echo ""
echo "Fichiers avec des propriétés .concerts à vérifier manuellement :"
grep -r "\.concerts[^I]" src --include="*.js" --include="*.jsx" -l | while read file; do
    echo "  - $file"
done

echo ""
echo "Fichiers avec concertsIds à migrer vers datesIds :"
grep -r "concertsIds" src --include="*.js" --include="*.jsx" -l | while read file; do
    echo "  - $file"
done

echo ""
echo "=== PHASE 4: GÉNÉRATION DU RAPPORT ==="
echo ""

# Générer un rapport de migration
REPORT_FILE="$BACKUP_DIR/rapport-migration.txt"
{
    echo "RAPPORT DE MIGRATION CONCERT → DATE"
    echo "Date: $(date)"
    echo ""
    echo "Fichiers modifiés automatiquement:"
    find "$BACKUP_DIR" -type f -name "*.js" -o -name "*.jsx" | wc -l
    echo ""
    echo "Modifications restantes à faire manuellement:"
    echo ""
    echo "1. Propriétés .concert → .date"
    grep -r "\.concert[^s]" src --include="*.js" --include="*.jsx" -c | wc -l
    echo ""
    echo "2. Propriétés .concerts → .dates"
    grep -r "\.concerts[^I]" src --include="*.js" --include="*.jsx" -c | wc -l
    echo ""
    echo "3. concertsIds → datesIds"
    grep -r "concertsIds" src --include="*.js" --include="*.jsx" -c | wc -l
    echo ""
    echo "4. Variables et paramètres"
    grep -rE "(const|let|var) concert[^s]* =" src --include="*.js" --include="*.jsx" | wc -l
} > "$REPORT_FILE"

echo "Rapport de migration généré: $REPORT_FILE"
echo ""
echo "=== MIGRATION AUTOMATIQUE TERMINÉE ==="
echo ""
echo "IMPORTANT:"
echo "1. Vérifiez les modifications avec 'git diff'"
echo "2. Testez l'application avant de commiter"
echo "3. Les fichiers originaux sont sauvegardés dans: $BACKUP_DIR"
echo "4. Consultez le rapport pour les modifications manuelles restantes"
echo ""
echo "Commandes utiles:"
echo "  git diff                    # Voir toutes les modifications"
echo "  git checkout -- <fichier>   # Annuler les modifications d'un fichier"
echo "  git checkout .             # Annuler toutes les modifications"