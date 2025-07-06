#\!/bin/bash
echo "=== NETTOYAGE COMPLET DU CACHE IDE ==="

# 1. Arrêter tous les processus node
echo "Arrêt des processus Node..."
pkill -f node || true

# 2. Supprimer TOUS les caches possibles
echo "Suppression des caches..."
rm -rf node_modules/.cache
rm -rf .eslintcache
rm -rf build
rm -rf .next
rm -rf .parcel-cache
rm -rf .vscode/.eslintcache
rm -rf ~/.vscode/Cache
rm -rf ~/Library/Application\ Support/Code/Cache
rm -rf ~/Library/Application\ Support/Code/CachedData

# 3. Si tsconfig existe, forcer la reconstruction
if [ -f "tsconfig.json" ]; then
  echo "Nettoyage TypeScript..."
  rm -rf tsconfig.tsbuildinfo
fi

# 4. Redémarrer ESLint
echo "Redémarrage ESLint..."
npx eslint --init --no-eslintrc 2>/dev/null || true

echo ""
echo "✅ NETTOYAGE TERMINÉ \!"
echo ""
echo "MAINTENANT, FAITES CECI :"
echo "1. Fermez complètement votre IDE (VS Code, WebStorm, etc.)"
echo "2. Rouvrez votre IDE"
echo "3. Si VS Code : Cmd+Shift+P → 'Developer: Reload Window'"
echo ""
