#!/bin/bash

echo "=== Restauration de l'environnement avant le script M1 ==="

# Restaurer craco.config.js
if [ -f "craco.config.js.m1fix.bak" ]; then
  cp craco.config.js.m1fix.bak craco.config.js
  echo "✅ craco.config.js restauré"
elif [ -f "craco.config.js.bak" ]; then
  cp craco.config.js.bak craco.config.js
  echo "✅ craco.config.js restauré depuis .bak"
else
  echo "❌ Aucune sauvegarde de craco.config.js trouvée"
fi

# Restaurer package.json
if [ -f "package.json.m1fix.bak" ]; then
  cp package.json.m1fix.bak package.json
  echo "✅ package.json restauré"
elif [ -f "package.json.bak" ]; then
  cp package.json.bak package.json
  echo "✅ package.json restauré depuis .bak"
else
  echo "❌ Aucune sauvegarde de package.json trouvée"
fi

# Restaurer firebase.js si nécessaire
if [ -f "src/firebase.js.m1fix.bak" ]; then
  cp src/firebase.js.m1fix.bak src/firebase.js
  echo "✅ firebase.js restauré"
elif [ -f "src/firebase.js.bak" ]; then
  cp src/firebase.js.bak src/firebase.js
  echo "✅ firebase.js restauré depuis .bak"
fi

# Réinstaller craco
echo "Réinstallation de craco..."
npm install --save-dev @craco/craco

echo "=== Environnement restauré ==="
echo "Vous pouvez maintenant essayer à nouveau 'npm run build'"
