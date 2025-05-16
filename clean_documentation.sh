#!/bin/bash

# Script de nettoyage et réorganisation de la documentation
# Créé le: 16 mai 2025
# Auteur: Manus

# Activer la gestion sécurisée des chemins avec espaces
IFS=$'\n'

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Vérifier si le script est exécuté depuis la racine du projet
if [ ! -d "docs" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet (où se trouve le dossier 'docs')."
    exit 1
fi

# Créer un dossier de sauvegarde
BACKUP_DIR="docs_backup_$(date +%Y%m%d_%H%M%S)"
log_info "Création d'une sauvegarde de la documentation dans '$BACKUP_DIR'..."
mkdir -p "$BACKUP_DIR"
cp -r docs "$BACKUP_DIR"
log_success "Sauvegarde créée avec succès."

# Fonction pour ajouter un en-tête d'archivage à un fichier
add_archive_header() {
    local file="$1"
    local filename=$(basename "$file")
    local temp_file=$(mktemp)
    
    # Extraire le titre de manière plus robuste
    local title=$(head -n 1 "$file" | sed 's/^#\+\s*//')
    if [[ -z "$title" ]]; then
        # Si pas de titre trouvé, utiliser le nom du fichier
        title=$(basename "$file" .md)
    fi
    
    echo "# [ARCHIVÉ] $title" > "$temp_file"
    echo "" >> "$temp_file"
    echo "*Document archivé le: $(date +"%d %B %Y")*" >> "$temp_file"
    echo "*Ce document a été archivé car il concerne une initiative terminée ou n'est plus à jour.*" >> "$temp_file"
    echo "" >> "$temp_file"
    tail -n +2 "$file" >> "$temp_file"
    
    mv "$temp_file" "$file"
    log_info "En-tête d'archivage ajouté à '$filename'"
}

# 1. Archiver les documents obsolètes
log_info "Archivage des documents obsolètes..."

# Créer le dossier d'archive s'il n'existe pas
mkdir -p docs/archive

# Liste des fichiers à archiver
ARCHIVE_FILES=(
    "docs/hooks/JOURNAL_MIGRATION_HOOKS.md"
    "docs/hooks/JOURNAL_PHASE5_NETTOYAGE_FINAL_HOOKS.md"
    "docs/hooks/GUIDE_MIGRATION_USEMOBILE.md"
    "docs/hooks/PLAN_MIGRATION_HOOKS_GENERIQUES.md"
    "docs/bugs/FIXED_PROGRAMMATEURS_WHITE_FLASH.md"
    "docs/bugs/CORRECTION_BUG_BOUTON_MODIFIER_ET_BOUCLE_INFINIE.md"
    "docs/modifications-recents-concerts.md"
)

for file in "${ARCHIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        archive_path="docs/archive/ARCHIVE_$filename"
        
        # Copier le fichier vers l'archive avec le préfixe ARCHIVE_
        cp "$file" "$archive_path"
        
        # Ajouter l'en-tête d'archivage
        add_archive_header "$archive_path"
        
        # Supprimer le fichier original
        rm "$file"
        
        log_success "Fichier '$filename' archivé avec succès."
    else
        log_warning "Fichier '$file' non trouvé, impossible de l'archiver."
    fi
done

# 2. Supprimer les doublons
log_info "Suppression des doublons..."

DUPLICATE_FILES=(
    "docs/css/PLAN_REFACTORISATION_CSS_PROGRESSIF.md"
    "docs/components/PLAN_REFACTORISATION_COMPOSANTS.md"
)

for file in "${DUPLICATE_FILES[@]}"; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        archive_file="docs/archive/$filename"
        
        # Vérifier si le fichier existe déjà dans l'archive
        if [ -f "$archive_file" ] || [ -f "docs/archive/ARCHIVE_$filename" ] || [ -f "docs/archive/PLAN_REFACTORISATION_CSS_PROGRESSIF_ARCHIVE_COMPLETE.md" ] || [ -f "docs/archive/PLAN_REFACTORISATION_COMPOSANTS_ARCHIVE.md" ]; then
            # Supprimer le doublon
            rm "$file"
            log_success "Doublon '$filename' supprimé avec succès."
        else
            log_warning "Fichier '$filename' non trouvé dans l'archive, conservation par sécurité."
        fi
    else
        log_warning "Fichier '$file' non trouvé, impossible de le supprimer."
    fi
done

# 3. Réorganiser les fichiers selon le plan
log_info "Réorganisation des fichiers selon le plan..."

# Créer les dossiers nécessaires s'ils n'existent pas
mkdir -p docs/analyses
mkdir -p docs/architecture
mkdir -p docs/standards

# Utiliser une méthode plus robuste pour gérer les fichiers avec espaces
move_file() {
    local src="$1"
    local dst="$2"
    
    if [ -f "$src" ]; then
        # Créer le dossier de destination si nécessaire
        mkdir -p "$(dirname "$dst")"
        
        # Déplacer le fichier
        mv "$src" "$dst"
        log_success "Fichier '$(basename "$src")' déplacé vers '$(basename "$dst")'."
    else
        # Essayer avec une version normalisée du nom de fichier (sans accents)
        local src_normalized=$(echo "$src" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || echo "$src")
        if [ "$src" != "$src_normalized" ] && [ -f "$src_normalized" ]; then
            mkdir -p "$(dirname "$dst")"
            mv "$src_normalized" "$dst"
            log_success "Fichier normalisé '$(basename "$src_normalized")' déplacé vers '$(basename "$dst")'."
        else
            log_warning "Fichier source '$src' non trouvé, impossible de le déplacer."
        fi
    fi
}

# Déplacer les fichiers individuellement
move_file "docs/manus docs/architecture.md" "docs/architecture/ARCHITECTURE_SUPPLEMENTAIRE.md"
move_file "docs/manus docs/audit_global_mai2025.md" "docs/analyses/AUDIT_GLOBAL_MAI2025.md"
move_file "docs/manus docs/rapport_audit_plan_action.md" "docs/analyses/RAPPORT_AUDIT_PLAN_ACTION.md"
move_file "docs/manus docs/securité.md" "docs/architecture/SECURITE.md"

# 4. Déplacer les documents de correction de bugs
log_info "Déplacement des documents de correction de bugs..."

if [ -d "docs/manus docs/bug hook/corrections" ]; then
    # Créer le dossier de destination s'il n'existe pas
    mkdir -p docs/bugs/corrections
    
    # Éviter les erreurs si aucun fichier ne correspond
    shopt -s nullglob
    
    # Déplacer tous les fichiers de correction
    for file in "docs/manus docs/bug hook/corrections"/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            mv "$file" "docs/bugs/corrections/$filename"
            log_success "Fichier de correction '$filename' déplacé avec succès."
        fi
    done
    
    # Restaurer le comportement par défaut
    shopt -u nullglob
else
    log_warning "Dossier 'docs/manus docs/bug hook/corrections' non trouvé."
fi

# 5. Mettre à jour les références dans le README.md
log_info "Mise à jour des références dans le README.md..."

# Cette partie est complexe et nécessiterait une analyse plus approfondie des liens
# Pour l'instant, nous allons simplement ajouter une note en haut du README
if [ -f "docs/README.md" ]; then
    temp_file=$(mktemp)
    
    # Ajouter une note en haut du fichier
    head -n 1 "docs/README.md" > "$temp_file"
    echo "" >> "$temp_file"
    echo "*Note: Ce README a été mis à jour le $(date +"%d %B %Y"). Certains liens peuvent nécessiter une mise à jour suite à la réorganisation de la documentation.*" >> "$temp_file"
    echo "" >> "$temp_file"
    tail -n +2 "docs/README.md" >> "$temp_file"
    
    mv "$temp_file" "docs/README.md"
    log_success "Note ajoutée au README.md concernant la mise à jour des liens."
fi

# Résumé des opérations
log_info "Résumé des opérations effectuées:"
echo "- Sauvegarde créée dans: $BACKUP_DIR"
echo "- Documents obsolètes archivés"
echo "- Doublons supprimés"
echo "- Fichiers réorganisés selon le plan"
echo "- Documents de correction de bugs déplacés"
echo "- README.md mis à jour avec une note"

log_success "Nettoyage et réorganisation de la documentation terminés avec succès!"
echo ""
log_info "En cas de problème, vous pouvez restaurer la sauvegarde avec la commande:"
echo "rm -rf docs && cp -r $BACKUP_DIR/docs ."
