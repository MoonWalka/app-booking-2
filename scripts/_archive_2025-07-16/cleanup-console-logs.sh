#!/bin/bash

# Script de nettoyage des console.log de debug
# Conserve les console.log importants et supprime uniquement ceux de debug

echo "🧹 Nettoyage des console.log de debug..."

# Créer un dossier de backup avec timestamp
BACKUP_DIR="backups/console-log-cleanup-$(date +%s)"
mkdir -p "$BACKUP_DIR"

# Compteurs
TOTAL_FILES=0
MODIFIED_FILES=0
TOTAL_LOGS_REMOVED=0

# Fonction pour vérifier si un console.log doit être conservé
should_keep_log() {
    local line="$1"
    
    # Conserver les logs dans les catch blocks
    if echo "$line" | grep -q "catch.*{"; then
        return 0
    fi
    
    # Conserver les logs d'erreur ou warning
    if echo "$line" | grep -iE "error|fail|warning|critical|fatal" >/dev/null; then
        return 0
    fi
    
    # Conserver les logs d'initialisation
    if echo "$line" | grep -iE "initialized|started|loaded|connected|ready" >/dev/null; then
        return 0
    fi
    
    # Supprimer les logs de debug évidents
    if echo "$line" | grep -iE "console\.log.*(\[LOG\]|\[DEBUG\]|debug|test|here|temp|todo|------|=====|\*\*\*\*)" >/dev/null; then
        return 1
    fi
    
    # Supprimer les logs commentés
    if echo "$line" | grep -E "^\s*//.*console\.log" >/dev/null; then
        return 1
    fi
    
    # Supprimer les logs simples sans contexte
    if echo "$line" | grep -E "console\.log\(['\"]?\w+['\"]?\)" >/dev/null; then
        return 1
    fi
    
    # Par défaut, conserver (principe de précaution)
    return 0
}

# Fonction pour nettoyer un fichier
clean_file() {
    local file="$1"
    local temp_file="${file}.tmp"
    local logs_removed=0
    local file_modified=false
    
    # Créer une copie temporaire
    cp "$file" "$temp_file"
    
    # Traiter le fichier ligne par ligne
    while IFS= read -r line; do
        if echo "$line" | grep -q "console\.log"; then
            if should_keep_log "$line"; then
                echo "$line"
            else
                ((logs_removed++))
                file_modified=true
                # Ne pas écrire la ligne (suppression)
            fi
        else
            echo "$line"
        fi
    done < "$file" > "$temp_file"
    
    # Si le fichier a été modifié
    if [ "$file_modified" = true ]; then
        # Backup du fichier original
        cp "$file" "$BACKUP_DIR/$(basename "$file")"
        
        # Remplacer le fichier original
        mv "$temp_file" "$file"
        
        echo "  ✓ $file - Supprimé $logs_removed console.log"
        ((MODIFIED_FILES++))
        ((TOTAL_LOGS_REMOVED+=logs_removed))
    else
        # Supprimer le fichier temporaire
        rm "$temp_file"
    fi
    
    ((TOTAL_FILES++))
}

# Rechercher tous les fichiers JS dans src (en excluant certains dossiers)
echo "🔍 Recherche des fichiers JavaScript..."

find src -name "*.js" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/build/*" \
    -not -path "*/dist/*" \
    -not -path "*/coverage/*" \
    -not -path "*/*.test.js" \
    -not -path "*/*.spec.js" \
    -not -path "*/jest.setup.js" \
    -not -path "*/jest.config.js" \
    | while read -r file; do
        clean_file "$file"
    done

echo ""
echo "📊 Résumé du nettoyage:"
echo "  - Fichiers analysés: $TOTAL_FILES"
echo "  - Fichiers modifiés: $MODIFIED_FILES"
echo "  - Console.log supprimés: $TOTAL_LOGS_REMOVED"
echo ""

if [ $MODIFIED_FILES -gt 0 ]; then
    echo "💾 Backup créé dans: $BACKUP_DIR"
    echo ""
    echo "Pour annuler les modifications:"
    echo "  cp $BACKUP_DIR/* ./src/"
else
    echo "✨ Aucun console.log de debug trouvé!"
    # Supprimer le dossier de backup vide
    rmdir "$BACKUP_DIR"
fi