#!/bin/bash

# Script de migration CORRIGÉ d'un seul hook
# Migre les références et supprime les versions obsolètes sans créer de doublons

set -e  # Arrêter en cas d'erreur

if [ $# -ne 3 ]; then
    echo "❌ Usage: $0 <hook_base_name> <domain> <target_version>"
    echo "   Exemple: $0 useArtisteSearch artistes useArtisteSearch"
    exit 1
fi

HOOK_BASE="$1"
DOMAIN="$2" 
TARGET_VERSION="$3"

echo "🔄 MIGRATION SÉCURISÉE DU HOOK: $HOOK_BASE"
echo "=========================================="
echo "📂 Domaine: $DOMAIN"
echo "🎯 Version cible: $TARGET_VERSION"
echo ""

# Vérifier qu'on est dans un dépôt Git et que tout est committé
if ! git status --porcelain | grep -q .; then
    echo "✅ Dépôt Git propre, on peut continuer"
else
    echo "❌ ERREUR: Des changements non commités détectés !"
    echo "   Faites 'git add -A && git commit -m \"snapshot\"' d'abord"
    exit 1
fi

# Trouver toutes les versions de ce hook
TARGET_FILE="src/hooks/$DOMAIN/$TARGET_VERSION.js"
VERSIONS_TO_MIGRATE=()

for variant in "Migrated" "Optimized" "Complete"; do
    VERSION_FILE="src/hooks/$DOMAIN/${HOOK_BASE}${variant}.js"
    if [ -f "$VERSION_FILE" ] && [ "$VERSION_FILE" != "$TARGET_FILE" ]; then
        VERSIONS_TO_MIGRATE+=("$VERSION_FILE")
    fi
done

if [ ${#VERSIONS_TO_MIGRATE[@]} -eq 0 ]; then
    echo "✅ Aucune migration nécessaire pour $HOOK_BASE"
    exit 0
fi

echo "🔍 VERSIONS À MIGRER:"
for version in "${VERSIONS_TO_MIGRATE[@]}"; do
    version_name=$(basename "$version" .js)
    import_count=$(grep -r "import.*$version_name" src/ 2>/dev/null | grep -v "$version" | wc -l)
    usage_count=$(grep -r "$version_name" src/ 2>/dev/null | grep -v "$version" | grep -v "import" | grep -v "export" | wc -l)
    echo "  📄 $version ($import_count imports directs, $usage_count usages)"
done

echo ""
read -p "🤔 Continuer avec la migration ? (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
    echo "❌ Migration annulée"
    exit 0
fi

echo ""
echo "🚀 DÉBUT DE LA MIGRATION..."

# Étape 1: Remplacer les imports et usages directs
echo "📥 1. Remplacement des imports et usages..."
for version_file in "${VERSIONS_TO_MIGRATE[@]}"; do
    version_name=$(basename "$version_file" .js)
    
    echo "  🔄 Migration: $version_name → $TARGET_VERSION"
    
    # Remplacer les imports COMPLETS (pas partiels pour éviter les doublons)
    find src/ -name "*.js" -o -name "*.jsx" | while read -r file; do
        if [ -f "$file" ]; then
            # Remplacer les imports exacts
            sed -i.bak "s/import { *$version_name *} from ['\"][^'\"]*['\"]/import { $TARGET_VERSION } from '@\/hooks\/$DOMAIN'/g" "$file"
            sed -i.bak "s/import $version_name from ['\"][^'\"]*['\"]/import $TARGET_VERSION from '@\/hooks\/$DOMAIN'/g" "$file"
            
            # Remplacer les usages dans le code (mais pas dans les noms de fichiers ou commentaires)
            sed -i.bak "s/const { *$version_name *} *= *use/const { $TARGET_VERSION } = use/g" "$file"
            sed -i.bak "s/const $version_name *= *use/const $TARGET_VERSION = use/g" "$file"
            sed -i.bak "s/= *$version_name(/= $TARGET_VERSION(/g" "$file"
            
            # Nettoyer les fichiers .bak
            rm -f "$file.bak"
        fi
    done
done

# Étape 2: Nettoyer les exports dans index.js
echo "📤 2. Nettoyage des exports dans index.js..."
INDEX_FILE="src/hooks/$DOMAIN/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Sauvegarder l'index original
    cp "$INDEX_FILE" "$INDEX_FILE.backup"
    
    # Supprimer SEULEMENT les exports des versions obsolètes (pas la version cible)
    for version_file in "${VERSIONS_TO_MIGRATE[@]}"; do
        version_name=$(basename "$version_file" .js)
        # Supprimer les lignes qui exportent EXACTEMENT cette version
        sed -i.bak "/export { default as $version_name } from/d" "$INDEX_FILE"
    done
    
    # Nettoyer le fichier .bak
    rm -f "$INDEX_FILE.bak"
fi

# Étape 3: Test de compilation
echo "🧪 3. Test de compilation..."
if npm run build --silent 2>/dev/null; then
    echo "  ✅ Compilation réussie !"
else
    echo "  ❌ ERREUR DE COMPILATION !"
    echo "     Restauration depuis la sauvegarde..."
    
    # Restaurer depuis Git
    git checkout HEAD -- src/
    
    echo "  🔄 Fichiers restaurés"
    echo "  ❌ Migration échouée - vérifiez manuellement les conflits"
    exit 1
fi

# Étape 4: Supprimer les fichiers obsolètes
echo "🗑️ 4. Suppression des versions obsolètes..."
for version_file in "${VERSIONS_TO_MIGRATE[@]}"; do
    echo "  🗑️ Suppression: $version_file"
    rm "$version_file"
done

# Nettoyer la sauvegarde de l'index si tout va bien
if [ -f "$INDEX_FILE.backup" ]; then
    rm "$INDEX_FILE.backup"
fi

# Étape 5: Test final
echo "🔬 5. Test final de compilation..."
if npm run build --silent 2>/dev/null; then
    echo "  ✅ Test final réussi !"
else
    echo "  ❌ ERREUR CRITIQUE après suppression !"
    echo "     Restauration d'urgence..."
    git checkout HEAD -- src/
    exit 1
fi

echo ""
echo "💾 COMMIT DE LA MIGRATION..."
git add -A
git commit -m "🔄 Migration du hook $HOOK_BASE vers $TARGET_VERSION

- Consolidation des versions alternatives vers $TARGET_VERSION
- Mise à jour des imports et exports  
- Suppression des versions: $(printf '%s\n' "${VERSIONS_TO_MIGRATE[@]}" | xargs -I {} basename {} .js | tr '\n' ' ')
- Tests de compilation validés"

echo ""
echo "🎉 MIGRATION TERMINÉE AVEC SUCCÈS !"
echo "==================================="
echo "  ✅ Hook $HOOK_BASE consolidé vers $TARGET_VERSION"
echo "  🗑️ ${#VERSIONS_TO_MIGRATE[@]} versions supprimées"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités" 