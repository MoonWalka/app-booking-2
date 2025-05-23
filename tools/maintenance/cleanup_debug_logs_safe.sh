#!/bin/bash

# Script de nettoyage sécurisé des logs de débogage  
# Version prudente qui supprime uniquement les logs évidents

set -e

echo "🧹 Nettoyage SÉCURISÉ des logs de débogage"
echo "==========================================="

# Compteurs
FILES_CLEANED=0
LOGS_REMOVED=0

# Fonction de nettoyage manuel des logs évidents
clean_obvious_logs() {
    local file="$1"
    echo "🔍 Nettoyage sécurisé: $file"
    
    # Compter avant
    local logs_before=$(grep -c "console\.log\|console\.warn" "$file" 2>/dev/null || echo "0")
    
    if [ "$logs_before" -eq 0 ]; then
        echo "   ℹ️  Aucun log à nettoyer"
        return
    fi
    
    # Sauvegarde
    cp "$file" "$file.backup"
    
    # Nettoyage très sélectif - seulement les plus évidents
    sed -i.tmp -E '
        # Supprimer uniquement les logs de trace/diagnostic évidents
        /console\.log.*\[TRACE-UNIQUE\]/d
        /console\.log.*\[DIAGNOSTIC\]/d
        /console\.log.*Bouton.*cliqué/d
        /console\.log.*showModal.*template/d
        /console\.log.*template avant bouton/d
        /console\.log.*mount, route id/d
    ' "$file"
    
    # Compter après
    local logs_after=$(grep -c "console\.log\|console\.warn" "$file" 2>/dev/null || echo "0")
    local removed=$((logs_before - logs_after))
    
    if [ "$removed" -gt 0 ]; then
        echo "   ✅ $removed logs évidents supprimés ($logs_before → $logs_after)"
        ((LOGS_REMOVED += removed))
        ((FILES_CLEANED++))
    else
        echo "   ℹ️  Aucun log évident à supprimer"
    fi
    
    # Nettoyer le fichier tmp
    rm -f "$file.tmp" 2>/dev/null || true
}

# Fichiers spécifiques avec logs évidents de debug
TARGET_FILES=(
    "src/pages/ProgrammateursPage.js"
    "src/pages/contratTemplatesEditPage.js"
    "src/pages/ContratGenerationPage.js"
)

echo "🎯 Nettoyage sélectif des logs de debug évidents..."

for file in "${TARGET_FILES[@]}"; do
    if [ -f "$file" ]; then
        clean_obvious_logs "$file"
    fi
done

# Test de compilation rapide
echo "🧪 Test de compilation..."
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Compilation OK - nettoyage sûr!"
    # Supprimer les sauvegardes
    find src -name "*.backup" -delete 2>/dev/null || true
else
    echo "   ⚠️  Problème de compilation - restauration..."
    # Restaurer
    find src -name "*.backup" | while read -r backup; do
        mv "$backup" "${backup%.backup}"
    done
fi

echo ""
echo "✅ NETTOYAGE SÉCURISÉ TERMINÉ"
echo "============================="
echo "📊 Résumé:"
echo "   ✅ $FILES_CLEANED fichiers nettoyés"
echo "   ✅ $LOGS_REMOVED logs évidents supprimés"
echo "   ✅ Approche conservative utilisée"
echo ""
echo "💡 Seuls les logs de debug les plus évidents ont été supprimés" 