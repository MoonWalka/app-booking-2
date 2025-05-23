#!/bin/bash

# Script spécialisé pour migrer useContratDetails vers useContratDetailsMigrated
# Cas spécial où la version "Migrated" est en fait la version moderne

set -e

echo "🔄 MIGRATION SPÉCIALE: useContratDetails → useContratDetailsMigrated"
echo "=================================================================="
echo ""

# Vérifier qu'on est dans un dépôt Git et que tout est committé
if ! git status --porcelain | grep -q .; then
    echo "✅ Dépôt Git propre, on peut continuer"
else
    echo "❌ ERREUR: Des changements non commités détectés !"
    echo "   Faites 'git add -A && git commit -m \"snapshot\"' d'abord"
    exit 1
fi

echo "🔍 ANALYSE DES USAGES EXTERNES..."
# Compter les usages externes de useContratDetails
external_imports=$(grep -r "import.*useContratDetails" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null | wc -l)
external_usages=$(grep -r "useContratDetails" src/ --include="*.js" --include="*.jsx" --exclude-dir="hooks/contrats" 2>/dev/null | grep -v "import" | grep -v "export" | wc -l)

echo "  📊 useContratDetails: $external_imports imports externes, $external_usages usages externes"

if [ "$external_imports" -eq 0 ] && [ "$external_usages" -eq 0 ]; then
    echo "  ✅ Aucun usage externe détecté, migration sûre"
else
    echo "  ⚠️  Usages externes détectés, migration avec remplacement"
fi

echo ""
read -p "🤔 Continuer avec la migration ? (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
    echo "❌ Migration annulée"
    exit 0
fi

echo ""
echo "🚀 DÉBUT DE LA MIGRATION SPÉCIALE..."

# Étape 1: Remplacer les imports/usages externes
if [ "$external_imports" -gt 0 ] || [ "$external_usages" -gt 0 ]; then
    echo "📥 1. Remplacement des références externes..."
    
    find src/ -name "*.js" -o -name "*.jsx" | grep -v "hooks/contrats" | while read -r file; do
        if [ -f "$file" ]; then
            if grep -q "useContratDetails" "$file" 2>/dev/null; then
                echo "    📝 Mise à jour: $file"
                
                # Remplacer les imports
                sed -i.bak "s/import { *useContratDetails *} from ['\"][^'\"]*['\"]/import { useContratDetailsMigrated } from '@\/hooks\/contrats'/g" "$file"
                sed -i.bak "s/import useContratDetails from ['\"][^'\"]*['\"]/import useContratDetailsMigrated from '@\/hooks\/contrats'/g" "$file"
                
                # Remplacer les usages dans le code
                sed -i.bak "s/const { *useContratDetails *} *= *use/const { useContratDetailsMigrated } = use/g" "$file"
                sed -i.bak "s/const useContratDetails *= *use/const useContratDetailsMigrated = use/g" "$file"
                sed -i.bak "s/= *useContratDetails(/= useContratDetailsMigrated(/g" "$file"
                
                # Nettoyer les fichiers .bak
                rm -f "$file.bak"
            fi
        fi
    done
else
    echo "📥 1. Aucun remplacement externe nécessaire"
fi

# Étape 2: Renommer useContratDetailsMigrated en useContratDetails
echo "🔄 2. Renommage de useContratDetailsMigrated → useContratDetails..."
mv "src/hooks/contrats/useContratDetailsMigrated.js" "src/hooks/contrats/useContratDetails.js.new"

# Étape 3: Supprimer l'ancien useContratDetails
echo "🗑️ 3. Suppression de l'ancien useContratDetails..."
rm "src/hooks/contrats/useContratDetails.js"

# Étape 4: Renommer le nouveau fichier
echo "📝 4. Finalisation du renommage..."
mv "src/hooks/contrats/useContratDetails.js.new" "src/hooks/contrats/useContratDetails.js"

# Étape 5: Mettre à jour le nom de la fonction dans le nouveau fichier
echo "🔧 5. Mise à jour du nom de fonction..."
sed -i.bak "s/const useContratDetailsMigrated = /const useContratDetails = /g" "src/hooks/contrats/useContratDetails.js"
sed -i.bak "s/export default useContratDetailsMigrated/export default useContratDetails/g" "src/hooks/contrats/useContratDetails.js"
rm -f "src/hooks/contrats/useContratDetails.js.bak"

# Étape 6: Mettre à jour index.js
echo "📤 6. Mise à jour des exports..."
INDEX_FILE="src/hooks/contrats/index.js"
if [ -f "$INDEX_FILE" ]; then
    # Supprimer tous les exports qui pointent vers useContratDetailsMigrated
    sed -i.bak "/export { default as useContratDetailsMigrated } from/d" "$INDEX_FILE"
    sed -i.bak "/export { default as useContratDetailsV2 } from.*useContratDetailsMigrated/d" "$INDEX_FILE"
    rm -f "$INDEX_FILE.bak"
fi

# Étape 7: Test de compilation
echo "🧪 7. Test de compilation..."
if npm run build --silent 2>/dev/null; then
    echo "  ✅ Compilation réussie !"
else
    echo "  ❌ ERREUR DE COMPILATION !"
    echo "     Restauration depuis la sauvegarde..."
    git checkout HEAD -- src/
    echo "  🔄 Fichiers restaurés"
    echo "  ❌ Migration échouée"
    exit 1
fi

echo ""
echo "💾 COMMIT DE LA MIGRATION..."
git add -A
git commit -m "🔄 Migration spéciale useContratDetails

- Consolidation: useContratDetailsMigrated → useContratDetails
- useContratDetailsMigrated était la version moderne avec useGenericEntityDetails
- Suppression de l'ancien wrapper useContratDetails
- Remplacement des références externes
- Tests de compilation validés"

echo ""
echo "🎉 MIGRATION SPÉCIALE TERMINÉE AVEC SUCCÈS !"
echo "============================================="
echo "  ✅ useContratDetails consolidé (version moderne)"
echo "  🗑️ Ancien wrapper supprimé"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités" 