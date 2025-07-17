#\!/bin/bash
echo "Nettoyage complet du projet..."

# 1. Nettoyer tous les caches
rm -rf node_modules/.cache
rm -rf .eslintcache
rm -rf build

# 2. Vérifier que les fichiers de debug problématiques n'existent plus
echo "Vérification des fichiers supprimés..."
for file in "src/components/debug/FestivalsDebugger.js" "src/components/debug/LieuMapDebug.js" "src/components/debug/SystemAuditTool.js" "src/components/debug/ArtisteSearchDebug.js"; do
  if [ -f "$file" ]; then
    echo "❌ $file existe encore"
  else
    echo "✅ $file correctement supprimé"
  fi
done

# 3. Rebuild
echo "Reconstruction du projet..."
npm run build

echo "Nettoyage terminé \!"
