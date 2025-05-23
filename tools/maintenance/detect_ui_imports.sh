#!/bin/zsh

# Script pour détecter les importations '@ui/' problématiques dans le code source
# Créé le 20 mai 2025 pour le projet TourCraft

echo "🔍 Recherche des importations '@ui/' dans les fichiers JavaScript et TypeScript..."

# Rechercher les importations @ui/
FOUND_FILES=$(grep -l "from '@ui/" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -r ./src)

if [ -z "$FOUND_FILES" ]; then
  echo "✅ Aucune importation '@ui/' trouvée dans le code."
  exit 0
fi

# Afficher les fichiers problématiques
echo "\n⚠️  Les fichiers suivants contiennent des importations '@ui/' qui doivent être corrigées:"
echo "=================================================================="

for FILE in $FOUND_FILES; do
  echo "\n📄 $FILE"
  echo "   Importations problématiques:"
  grep "from '@ui/" $FILE | sed 's/^/   - /'
done

echo "\n📝 RECOMMANDATION:"
echo "   Veuillez consulter le guide docs/GUIDE_IMPORTS_UI.md pour les conventions d'importation."
echo "   Remplacez les importations '@ui/' par '@components/ui/' ou utilisez react-bootstrap."

exit 1
