#!/bin/bash

# Script de nettoyage SÉCURISÉ des fichiers de backup
# Suppression par étapes avec confirmations

set -e  # Arrêter en cas d'erreur

echo "🧹 NETTOYAGE SÉCURISÉ DES BACKUPS"
echo "=================================="
echo ""
echo "⚠️  Ce script va supprimer définitivement les fichiers de backup."
echo "   Assurez-vous d'avoir fait un commit Git avant de continuer !"
echo ""

# Vérifier qu'on est dans un dépôt Git et que tout est committé
if ! git status --porcelain | grep -q .; then
    echo "✅ Dépôt Git propre, on peut continuer"
else
    echo "❌ ERREUR: Des changements non commités détectés !"
    echo "   Faites 'git add -A && git commit -m \"snapshot\"' d'abord"
    exit 1
fi

echo ""
read -p "🤔 Êtes-vous sûr de vouloir continuer ? (oui/non): " confirm
if [[ $confirm != "oui" ]]; then
    echo "🛑 Opération annulée par l'utilisateur"
    exit 0
fi

# Créer un commit de sauvegarde avant suppression
echo ""
echo "💾 Création d'un commit de sauvegarde..."
git tag "backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
echo "✅ Tag de sauvegarde créé"

echo ""
echo "📊 ÉTAPE 1: Suppression des fichiers .backup/.bak"
echo "================================================="

# Compter et afficher les fichiers à supprimer
BACKUP_FILES=$(find . -name "*.backup" -o -name "*.bak" | grep -v node_modules | grep -v .git)
FILE_COUNT=$(echo "$BACKUP_FILES" | wc -l)

echo "📁 $FILE_COUNT fichiers .backup/.bak à supprimer"
echo ""
read -p "🗑️  Supprimer ces fichiers ? (oui/non): " confirm_files
if [[ $confirm_files == "oui" ]]; then
    echo "$BACKUP_FILES" | xargs rm -f
    echo "✅ Fichiers .backup/.bak supprimés"
    
    # Commit de cette étape
    git add -A
    git commit -m "🧹 Suppression des fichiers .backup/.bak ($FILE_COUNT fichiers)"
else
    echo "⏭️  Étape 1 ignorée"
fi

echo ""
echo "📊 ÉTAPE 2: Suppression des GROS dossiers de backup"
echo "=================================================="

# Dossiers de refactorisation (les plus gros)
BIG_BACKUP_DIRS=(
    "./refactorisation_backup_20250516_141550"
    "./refactorisation_backup_20250516_170903"
)

for dir in "${BIG_BACKUP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" | cut -f1)
        echo "📂 $dir ($size)"
        read -p "🗑️  Supprimer ce dossier ? (oui/non): " confirm_dir
        if [[ $confirm_dir == "oui" ]]; then
            rm -rf "$dir"
            echo "✅ Dossier $dir supprimé"
            
            # Commit de cette suppression
            git add -A
            git commit -m "🧹 Suppression du dossier de backup: $(basename $dir)"
        else
            echo "⏭️  Dossier $dir conservé"
        fi
        echo ""
    fi
done

echo ""
echo "📊 ÉTAPE 3: Suppression des petits dossiers de backup"
echo "===================================================="

SMALL_BACKUP_DIRS=(
    "./backup_deleted_files"
    "./config_backup_20250516_124213"
    "./test_css/css_backup_20250519_233524"
    "./test_css_fixed/css_backup_20250519_233619"
)

for dir in "${SMALL_BACKUP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" | cut -f1)
        echo "📂 $dir ($size)"
    fi
done

echo ""
read -p "🗑️  Supprimer TOUS ces petits dossiers de backup ? (oui/non): " confirm_small
if [[ $confirm_small == "oui" ]]; then
    for dir in "${SMALL_BACKUP_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            rm -rf "$dir"
            echo "✅ $dir supprimé"
        fi
    done
    
    # Commit de cette étape
    git add -A
    git commit -m "🧹 Suppression des petits dossiers de backup"
else
    echo "⏭️  Petits dossiers conservés"
fi

echo ""
echo "📊 RÉSULTATS DU NETTOYAGE"
echo "========================="

# Calculer l'espace libéré
REMAINING_BACKUPS=$(find . -name "*backup*" -o -name "*.backup" -o -name "*.bak" | grep -v node_modules | grep -v .git | wc -l)

echo "🎉 Nettoyage terminé !"
echo "📁 Fichiers de backup restants: $REMAINING_BACKUPS"

if [ $REMAINING_BACKUPS -eq 0 ]; then
    echo "✨ Parfait ! Tous les backups ont été supprimés"
else
    echo "ℹ️  Quelques backups ont été conservés"
fi

echo ""
echo "💾 Tags de sauvegarde disponibles:"
git tag | grep backup-before-cleanup || echo "Aucun tag trouvé"

echo ""
echo "🔄 Pour annuler TOUTES les suppressions:"
echo "   git reset --hard backup-before-cleanup-$(date +%Y%m%d)-XXXXXX"

echo ""
echo "✅ Nettoyage terminé en sécurité !" 