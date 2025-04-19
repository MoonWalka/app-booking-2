#!/bin/bash

# Script pour créer la structure de fichiers et dossiers pour l'adaptabilité mobile

# Définir les couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour créer un dossier si il n'existe pas déjà
create_dir() {
  if [ ! -d "$1" ]; then
    mkdir -p "$1"
    echo -e "${GREEN}Dossier créé: $1${NC}"
  else
    echo -e "${YELLOW}Le dossier existe déjà: $1${NC}"
  fi
}

# Fonction pour créer un fichier vide si il n'existe pas déjà
create_file() {
  if [ ! -f "$1" ]; then
    touch "$1"
    echo -e "${BLUE}Fichier créé: $1${NC}"
  else
    echo -e "${YELLOW}Le fichier existe déjà: $1${NC}"
  fi
}

echo "=== Création de la structure pour l'adaptabilité mobile ==="

# 1. Création des hooks de base
echo "1. Création des hooks de base..."
create_dir "src/hooks"
create_file "src/hooks/useIsMobile.js"
create_file "src/hooks/useResponsiveComponent.js"

# 2. Création des styles CSS pour mobile
echo "2. Création des styles CSS pour mobile..."
create_file "src/style/mobileLayout.css"
create_file "src/style/stepNavigation.css"
create_file "src/style/artistesListMobile.css"
create_file "src/style/concertsListMobile.css"
create_file "src/style/lieuxListMobile.css"
create_file "src/style/programmateursListMobile.css"
create_file "src/style/formsResponsive.css"

# 3. Création de la structure pour le Layout
echo "3. Création de la structure pour le Layout..."
create_dir "src/components/common/layout"
create_file "src/components/common/layout/DesktopLayout.js"
create_file "src/components/common/layout/MobileLayout.js"

# 4. Création de la navigation par étapes
echo "4. Création de la navigation par étapes..."
create_dir "src/components/common/steps"
create_file "src/components/common/steps/StepNavigation.js"
create_file "src/components/common/steps/StepProgress.js"

# 5. Création de la structure pour les Artistes
echo "5. Création de la structure pour les Artistes..."
create_dir "src/components/artistes/desktop"
create_dir "src/components/artistes/mobile"
create_file "src/components/artistes/desktop/ArtistesList.js"
create_file "src/components/artistes/mobile/ArtistesList.js"
create_file "src/components/artistes/desktop/ArtisteDetail.js"
create_file "src/components/artistes/mobile/ArtisteDetail.js"
create_file "src/components/artistes/desktop/ArtisteForm.js"
create_file "src/components/artistes/mobile/ArtisteForm.js"

# 6. Création de la structure pour les Concerts
echo "6. Création de la structure pour les Concerts..."
create_dir "src/components/concerts/desktop"
create_dir "src/components/concerts/mobile"
create_file "src/components/concerts/desktop/ConcertsList.js"
create_file "src/components/concerts/mobile/ConcertsList.js"
create_file "src/components/concerts/desktop/ConcertDetails.js"
create_file "src/components/concerts/mobile/ConcertDetails.js"
create_file "src/components/concerts/desktop/ConcertForm.js"
create_file "src/components/concerts/mobile/ConcertForm.js"

# 7. Création de la structure pour les Lieux
echo "7. Création de la structure pour les Lieux..."
create_dir "src/components/lieux/desktop"
create_dir "src/components/lieux/mobile"
create_file "src/components/lieux/desktop/LieuxList.js"
create_file "src/components/lieux/mobile/LieuxList.js"
create_file "src/components/lieux/desktop/LieuDetails.js"
create_file "src/components/lieux/mobile/LieuDetails.js"

# 8. Création de la structure pour les Programmateurs
echo "8. Création de la structure pour les Programmateurs..."
create_dir "src/components/programmateurs/desktop"
create_dir "src/components/programmateurs/mobile"
create_file "src/components/programmateurs/desktop/ProgrammateursList.js"
create_file "src/components/programmateurs/mobile/ProgrammateursList.js"
create_file "src/components/programmateurs/desktop/ProgrammateurDetails.js"
create_file "src/components/programmateurs/mobile/ProgrammateurDetails.js"

# 9. Création de la structure pour les formulaires
echo "9. Création de la structure pour les formulaires..."
create_dir "src/components/forms/desktop"
create_dir "src/components/forms/mobile"
create_file "src/components/forms/desktop/LieuForm.js"
create_file "src/components/forms/mobile/LieuForm.js"
create_file "src/components/forms/desktop/ProgrammateurForm.js"
create_file "src/components/forms/mobile/ProgrammateurForm.js"
create_file "src/components/forms/desktop/FormValidationInterface.js"
create_file "src/components/forms/mobile/FormValidationInterface.js"

# 10. Adaptation des composants principaux pour utiliser les composants responsifs
echo "10. Adaptation des composants principaux..."
create_file "src/components/artistes/ArtistesList.jsx.new"
create_file "src/components/artistes/ArtisteDetail.jsx.new"
create_file "src/components/artistes/ArtisteForm.jsx.new"
create_file "src/components/concerts/ConcertsList.js.new"
create_file "src/components/concerts/ConcertDetails.js.new"
create_file "src/components/concerts/ConcertForm.js.new"
create_file "src/components/lieux/LieuxList.js.new"
create_file "src/components/lieux/LieuDetails.js.new"
create_file "src/components/programmateurs/ProgrammateursList.js.new"
create_file "src/components/programmateurs/ProgrammateurDetails.js.new"
create_file "src/components/forms/LieuForm.js.new"
create_file "src/components/forms/ProgrammateurForm.js.new"
create_file "src/components/forms/FormValidationInterface.js.new"
create_file "src/components/common/Layout.js.new"

echo "===== Création de la structure terminée ====="
echo "Vous pouvez maintenant intégrer le code dans les fichiers créés."
echo "Pour copier les fichiers .new sur leurs versions originales, utilisez la commande:"
echo "  find src -name \"*.new\" -exec bash -c 'mv \"{}\" \"\${0%.new}\"' {} \\;"
