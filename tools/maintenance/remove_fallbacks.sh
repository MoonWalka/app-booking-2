#!/bin/bash

# Script pour supprimer les fallbacks codés en dur dans les fichiers CSS
# Date: 19 mai 2025
# Description: Ce script automatise la suppression des valeurs de secours (fallbacks)
#              codées en dur dans les variables CSS

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer pour exécuter ce script."
    exit 1
fi

# Vérifier si le module glob est installé
if ! node -e "require('glob')" &> /dev/null; then
    echo "⚠️ Module glob non trouvé. Installation..."
    npm install glob --save-dev
fi

# Configuration
SCRIPT_PATH="./remove_css_fallbacks.js"

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction d'aide
function show_help {
    echo -e "${GREEN}Suppression des fallbacks CSS${NC}"
    echo "--------------------------------"
    echo "Ce script supprime les valeurs de secours (fallbacks) codées en dur dans les variables CSS."
    echo "Exemple: var(--tc-color-primary, #333) -> var(--tc-color-primary)"
    echo ""
    echo "Usage:"
    echo "  $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help       Affiche cette aide"
    echo "  -d, --dry-run    Simule les modifications sans écrire dans les fichiers"
    echo "  -v, --verbose    Affiche les détails des modifications"
    echo "  -p, --path=PATH  Chemin du répertoire à traiter (par défaut: src/)"
    echo ""
    echo "Exemples:"
    echo "  $0 --dry-run             # Simulation sans modification"
    echo "  $0 --path=components/ui  # Traite uniquement les composants UI"
    echo "  $0 --verbose             # Affiche tous les détails"
}

# Traitement des arguments
DRY_RUN=""
VERBOSE=""
PATH_ARG=""

for arg in "$@"; do
    case $arg in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        -v|--verbose)
            VERBOSE="--verbose"
            shift
            ;;
        -p=*|--path=*)
            PATH_ARG="--path=${arg#*=}"
            shift
            ;;
        *)
            echo -e "${RED}Option non reconnue: $arg${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Vérifier que le script existe
if [ ! -f "$SCRIPT_PATH" ]; then
    echo -e "${RED}❌ Le script $SCRIPT_PATH n'existe pas.${NC}"
    exit 1
fi

# Exécuter le script Node.js
echo -e "${GREEN}⚙️ Suppression des fallbacks CSS...${NC}"
node $SCRIPT_PATH $DRY_RUN $VERBOSE $PATH_ARG

# Ajouter l'élément à la checklist automatiquement
if [ -z "$DRY_RUN" ]; then
    echo -e "${YELLOW}📝 Mise à jour de la checklist dans le fichier audit CSS.md...${NC}"
    sed -i '' 's/- \[ \] \*\*3.2\*\* Supprimer les fallbacks codés en dur dans les fichiers CSS/- \[x\] **3.2** Supprimer les fallbacks codés en dur dans les fichiers CSS/' ./docs/manus\ docs/audit\ css.md
    echo -e "${GREEN}✅ Checklist mise à jour!${NC}"
fi
