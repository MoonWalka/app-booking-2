#!/bin/bash

# Script pour renommer les hooks qui n'ont qu'une version "Optimized" vers leur nom final
# useArtisteFormOptimized → useArtisteForm
# useContratFormOptimized → useContratForm

set -e

echo "🎯 RENOMMAGE DES HOOKS SIMPLES (Optimized → Nom Final)"
echo "======================================================"
echo ""
echo "📋 HOOKS À RENOMMER:"
echo "1. useArtisteFormOptimized → useArtisteForm"
echo "2. useContratFormOptimized → useContratForm"
echo ""

# Vérifier qu'on est dans un dépôt Git et que tout est committé
if ! git status --porcelain | grep -q .; then
    echo "✅ Dépôt Git propre, on peut continuer"
else
    echo "❌ ERREUR: Des changements non commités détectés !"
    exit 1
fi

read -p "🤔 Continuer avec le renommage ? (oui/non): " confirm
if [ "$confirm" != "oui" ]; then
    echo "❌ Renommage annulé"
    exit 0
fi

echo ""
echo "🚀 DÉBUT DU RENOMMAGE..."

# 1. useArtisteFormOptimized → useArtisteForm
echo "📝 1. Renommage useArtisteFormOptimized → useArtisteForm..."
find src/ -name "*.js" -o -name "*.jsx" | while read -r file; do
    if [ -f "$file" ] && grep -q "useArtisteFormOptimized" "$file" 2>/dev/null; then
        echo "    📝 Mise à jour: $file"
        sed -i.bak "s/useArtisteFormOptimized/useArtisteForm/g" "$file"
        rm -f "$file.bak"
    fi
done

# Renommer le fichier
if [ -f "src/hooks/artistes/useArtisteFormOptimized.js" ]; then
    mv "src/hooks/artistes/useArtisteFormOptimized.js" "src/hooks/artistes/useArtisteForm.js"
    echo "  ✅ Fichier useArtisteFormOptimized.js → useArtisteForm.js"
fi

# 2. useContratFormOptimized → useContratForm
echo "📝 2. Renommage useContratFormOptimized → useContratForm..."
find src/ -name "*.js" -o -name "*.jsx" | while read -r file; do
    if [ -f "$file" ] && grep -q "useContratFormOptimized" "$file" 2>/dev/null; then
        echo "    📝 Mise à jour: $file"
        sed -i.bak "s/useContratFormOptimized/useContratForm/g" "$file"
        rm -f "$file.bak"
    fi
done

# Renommer le fichier
if [ -f "src/hooks/contrats/useContratFormOptimized.js" ]; then
    mv "src/hooks/contrats/useContratFormOptimized.js" "src/hooks/contrats/useContratForm.js"
    echo "  ✅ Fichier useContratFormOptimized.js → useContratForm.js"
fi

# 3. Nettoyer les exports dans les index.js
echo "📤 3. Nettoyage des exports..."

# Index artistes
ARTISTES_INDEX="src/hooks/artistes/index.js"
if [ -f "$ARTISTES_INDEX" ]; then
    sed -i.bak "/export { default as useArtisteFormOptimized } from/d" "$ARTISTES_INDEX"
    # Ajouter l'export normal s'il n'existe pas
    if ! grep -q "export { default as useArtisteForm }" "$ARTISTES_INDEX"; then
        echo "export { default as useArtisteForm } from './useArtisteForm';" >> "$ARTISTES_INDEX"
    fi
    rm -f "$ARTISTES_INDEX.bak"
    echo "  ✅ Index artistes nettoyé"
fi

# Index contrats
CONTRATS_INDEX="src/hooks/contrats/index.js"
if [ -f "$CONTRATS_INDEX" ]; then
    sed -i.bak "/export { default as useContratFormOptimized } from/d" "$CONTRATS_INDEX"
    # Ajouter l'export normal s'il n'existe pas
    if ! grep -q "export { default as useContratForm }" "$CONTRATS_INDEX"; then
        echo "export { default as useContratForm } from './useContratForm';" >> "$CONTRATS_INDEX"
    fi
    rm -f "$CONTRATS_INDEX.bak"
    echo "  ✅ Index contrats nettoyé"
fi

# 4. Test de compilation
echo "🧪 4. Test de compilation..."
if npm run build --silent 2>/dev/null; then
    echo "  ✅ Compilation réussie !"
else
    echo "  ❌ ERREUR DE COMPILATION !"
    echo "     Restauration depuis Git..."
    git checkout HEAD -- src/
    echo "  🔄 Fichiers restaurés"
    echo "  ❌ Renommage échoué"
    exit 1
fi

echo ""
echo "💾 COMMIT DU RENOMMAGE..."
git add -A
git commit -m "✨ Renommage hooks simples - Optimized vers nom final

✅ RENOMMAGES RÉUSSIS:
- useArtisteFormOptimized → useArtisteForm (1 usage)
- useContratFormOptimized → useContratForm (1 usage)
- Exports nettoyés et mis à jour
- Tests de compilation validés"

echo ""
echo "🎉 RENOMMAGE TERMINÉ AVEC SUCCÈS !"
echo "=================================="
echo "  ✅ useArtisteForm et useContratForm = Noms finaux"
echo "  📤 Exports nettoyés"
echo "  ✅ Compilation vérifiée"
echo "  ✅ Changements commités"
echo ""
echo "🏆 RÉSULTAT: 2 hooks de plus avec leurs noms finaux !" 