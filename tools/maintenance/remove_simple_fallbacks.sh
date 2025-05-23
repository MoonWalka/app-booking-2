#!/bin/bash

# Script pour supprimer les fallbacks CSS simples
# Usage: ./remove_simple_fallbacks.sh [--dry-run]

echo "⚙️ Suppression des fallbacks CSS simples..."

# Vérifier si l'option --dry-run est passée
DRY_RUN=""
if [[ "$*" == *--dry-run* ]]; then
  DRY_RUN="--dry-run"
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé. Veuillez l'installer pour exécuter ce script."
  exit 1
fi

# S'assurer que le module glob est installé
if ! node -e "require('glob')" &> /dev/null; then
  echo "📦 Installation du module glob..."
  npm install glob --no-save
fi

# Exécuter le script de suppression des fallbacks simples
node remove_simple_fallbacks.js --path=src/ $DRY_RUN

# Si ce n'est pas une exécution en mode dry-run, mettre à jour la checklist
if [[ "$DRY_RUN" == "" ]]; then
  echo "📝 Mise à jour de la checklist dans le fichier audit CSS.md..."
  
  # Vérifier si le fichier existe
  if [ -f "docs/manus docs/audit css.md" ]; then
    # Remplacer la ligne dans le fichier
    sed -i '' 's/- \[ \] \*\*3.2\*\* Supprimer les fallbacks codés en dur dans les fichiers CSS/- [x] **3.2** Supprimer les fallbacks codés en dur dans les fichiers CSS/g' "docs/manus docs/audit css.md"
    echo "✅ Checklist mise à jour!"
  else
    echo "⚠️ Fichier audit CSS.md non trouvé."
  fi
fi
