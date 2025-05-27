#!/bin/bash

echo "🧪 Test des corrections appliquées..."

# Vérifier que les corrections ont été appliquées
echo "🔍 Vérification des corrections dans useArtistesList.js..."
if grep -q "console.count.*useArtistesList render" src/hooks/artistes/useArtistesList.js; then
    echo "✅ Compteur de renders ajouté"
else
    echo "❌ Compteur de renders manquant"
fi

if grep -q "eslint-disable-next-line react-hooks/exhaustive-deps" src/hooks/artistes/useArtistesList.js; then
    echo "✅ Corrections useEffect appliquées"
else
    echo "❌ Corrections useEffect manquantes"
fi

echo "🔍 Vérification des corrections dans ArtistesList.js..."
if grep -q "console.count.*ArtistesList render" src/components/artistes/desktop/ArtistesList.js; then
    echo "✅ Compteur de renders ajouté"
else
    echo "❌ Compteur de renders manquant"
fi

if grep -q "useMemo" src/components/artistes/desktop/ArtistesList.js; then
    echo "✅ useMemo importé"
else
    echo "❌ useMemo manquant dans les imports"
fi

if grep -q "const deleteCallback = useCallback" src/components/artistes/desktop/ArtistesList.js; then
    echo "✅ Callback de suppression stabilisé"
else
    echo "❌ Callback de suppression non stabilisé"
fi

echo "🔍 Vérification du fichier de diagnostic..."
if [ -f "src/utils/debug/renderTracker.js" ]; then
    echo "✅ Fichier de diagnostic créé"
else
    echo "❌ Fichier de diagnostic manquant"
fi

echo "🎯 Test terminé. Lancez 'npm start' pour tester l'application."
