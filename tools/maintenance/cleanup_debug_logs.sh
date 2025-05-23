#!/bin/bash

# Script de nettoyage des logs de débogage
# Supprime les console.log et console.warn non essentiels
# Conserve les console.error légitimes et les services de log

set -e

echo "🧹 Nettoyage des logs de débogage - Phase 2"
echo "=========================================="

# Compteurs
FILES_CLEANED=0
LOGS_REMOVED=0

# Fonction de sauvegarde
backup_file() {
    local file="$1"
    cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
}

# Fonction de nettoyage
clean_debug_logs() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    echo "🔍 Nettoyage: $file"
    
    # Créer une sauvegarde
    backup_file "$file"
    
    # Compter les logs avant
    local logs_before=$(grep -c "console\." "$file" 2>/dev/null || echo "0")
    
    # Nettoyage sélectif
    sed -E '
        # Supprimer les console.log simples (garder ceux dans des strings)
        /^[[:space:]]*console\.log\(/d
        /;[[:space:]]*console\.log\(/d
        
        # Supprimer les console.warn non critiques
        /^[[:space:]]*console\.warn\(/d
        /;[[:space:]]*console\.warn\(/d
        
        # Supprimer les logs de diagnostic spécifiques
        /console\.log.*\[TRACE/d
        /console\.log.*\[LOG\]/d
        /console\.log.*\[DIAGNOSTIC\]/d
        /console\.log.*Début de /d
        /console\.log.*terminé /d
        /console\.log.*appelé/d
        /console\.log.*Données /d
        /console\.log.*récupérées/d
        /console\.log.*trouvé/d
        /console\.log.*mis à jour/d
        /console\.log.*créé/d
        /console\.log.*Tentative/d
        /console\.log.*Bouton.*cliqué/d
        
        # Garder console.error (erreurs légitimes)
        # Garder loggerService.js (service légitime)
        # Garder les logs conditionnels (mode dev)
    ' "$file" > "$temp_file"
    
    # Compter les logs après
    local logs_after=$(grep -c "console\." "$temp_file" 2>/dev/null || echo "0")
    local removed=$((logs_before - logs_after))
    
    if [ "$removed" -gt 0 ]; then
        mv "$temp_file" "$file"
        echo "   ✅ $removed logs supprimés ($logs_before → $logs_after)"
        ((LOGS_REMOVED += removed))
        ((FILES_CLEANED++))
    else
        rm -f "$temp_file"
        echo "   ℹ️  Aucun log à nettoyer"
    fi
}

echo "🎯 Nettoyage du code de production..."

# Fichiers prioritaires à nettoyer (hors services)
TARGET_FILES=(
    "src/App.js"
    "src/pages/*.js"
    "src/components/**/*.js"
    "src/context/*.js"
    "src/hooks/**/*.js"
)

# Nettoyer les fichiers prioritaires
for pattern in "${TARGET_FILES[@]}"; do
    if [[ "$pattern" == *"*"* ]]; then
        # Pattern avec wildcards
        find src -name "$(basename "$pattern")" -type f 2>/dev/null | while read -r file; do
            # Éviter les services légitimes
            if [[ ! "$file" =~ (loggerService|firestoreService|firebase-service)\.js$ ]]; then
                if [ -f "$file" ]; then
                    clean_debug_logs "$file"
                fi
            fi
        done
    else
        # Fichier simple
        if [ -f "$pattern" ]; then
            clean_debug_logs "$pattern"
        fi
    fi
done

# Nettoyage sélectif des services (garder structure, supprimer debug)
echo "🔧 Nettoyage sélectif des services..."

SERVICE_FILES=(
    "src/services/structureService.js"
    "src/pages/contratTemplatesEditPage.js"
    "src/pages/ContratGenerationPage.js"
    "src/pages/ProgrammateursPage.js"
    "src/pages/FormResponsePage.js"
)

for file in "${SERVICE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🔍 Service: $file"
        backup_file "$file"
        
        # Nettoyage plus ciblé pour les services
        logs_before=$(grep -c "console\." "$file" 2>/dev/null || echo "0")
        
        sed -E '
            # Supprimer uniquement les logs de debug évidents
            /console\.log.*\[DIAGNOSTIC\]/d
            /console\.log.*Début de /d
            /console\.log.*terminé /d
            /console\.log.*trouvé /d
            /console\.log.*Données /d
            /console\.log.*récupérées/d
            /console\.log.*Bouton.*cliqué/d
            /console\.log.*avant bouton/d
            /console\.log.*showModal/d
            /console\.log.*template avant/d
            /console\.log.*Fetching/d
            /console\.log.*Attempting/d
            /console\.log.*Template/d
            /console\.log.*ID généré/d
            /console\.log.*Saving/d
            
            # Garder console.error et console.warn (erreurs utiles)
        ' "$file" > "${file}.tmp"
        
        logs_after=$(grep -c "console\." "${file}.tmp" 2>/dev/null || echo "0")
        removed=$((logs_before - logs_after))
        
        if [ "$removed" -gt 0 ]; then
            mv "${file}.tmp" "$file"
            echo "   ✅ $removed logs supprimés ($logs_before → $logs_after)"
            ((LOGS_REMOVED += removed))
            ((FILES_CLEANED++))
        else
            rm -f "${file}.tmp"
            echo "   ℹ️  Aucun log à nettoyer"
        fi
    fi
done

# Test de compilation
echo "🧪 Test de compilation..."
if npm run build > /tmp/build_clean_logs.log 2>&1; then
    echo "   ✅ Compilation réussie après nettoyage!"
else
    echo "   ❌ Erreur de compilation! Restauration des sauvegardes..."
    # Restaurer tous les backups
    find src -name "*.backup.*" | while read -r backup; do
        original="${backup%%.backup.*}"
        mv "$backup" "$original"
        echo "   🔄 Restauré: $original"
    done
    exit 1
fi

# Supprimer les sauvegardes si tout va bien
echo "🗑️  Suppression des sauvegardes..."
find src -name "*.backup.*" -delete

echo ""
echo "🎉 NETTOYAGE TERMINÉ AVEC SUCCÈS!"
echo "================================="
echo "📊 Résumé:"
echo "   ✅ $FILES_CLEANED fichiers nettoyés"
echo "   ✅ $LOGS_REMOVED logs de débogage supprimés"
echo "   ✅ Compilation validée"
echo "   ✅ Code de production nettoyé"
echo ""
echo "💡 Les services légitimes (loggerService, etc.) ont été préservés"
echo "🔍 Les console.error pour les erreurs critiques ont été conservés" 