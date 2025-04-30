#!/bin/bash
# Étape 1: Extraction et déplacement de ContratPDFWrapper

 # Définir le répertoire racine du projet
PROJECT_DIR="$(pwd)"
SRC_DIR="$PROJECT_DIR/src"

# Créer le nouveau répertoire pour les composants PDF
NEW_PDF_DIR="$SRC_DIR/components/pdf"
echo "Création du répertoire $NEW_PDF_DIR..."
mkdir -p "$NEW_PDF_DIR"

# Définir l'ancien et le nouvel emplacement du fichier
OLD_PATH="$SRC_DIR/components/contrats/ContratPDFWrapper.js"
NEW_PATH="$NEW_PDF_DIR/ContratPDFWrapper.js"

# Vérifier si l'ancien fichier existe
if [ -f "$OLD_PATH" ]; then
  echo "Déplacement de $OLD_PATH vers $NEW_PATH..."
  mv "$OLD_PATH" "$NEW_PATH"
else
  echo "ERREUR: Fichier $OLD_PATH non trouvé. Le déplacement a échoué." >&2
  # Vérifier si le fichier est déjà au nouvel emplacement (au cas où le script est relancé)
  if [ -f "$NEW_PATH" ]; then
    echo "INFO: Le fichier semble déjà être à l'emplacement $NEW_PATH."
  else
    exit 1
  fi
fi

# Créer les fichiers placeholder pour les sous-composants (si non existants)
echo "Création des fichiers placeholder pour les sous-composants..."
touch "$NEW_PDF_DIR/ContratPDFHeader.js"
touch "$NEW_PDF_DIR/ContratPDFBody.js"
touch "$NEW_PDF_DIR/ContratPDFFooter.js"

# Créer le fichier CSS Module (si non existant)
echo "Création du fichier CSS Module..."
CSS_MODULE_PATH="$NEW_PDF_DIR/ContratPDFWrapper.module.css"
touch "$CSS_MODULE_PATH"

# Mettre à jour les chemins d'importation dans les fichiers concernés
# Ancien chemin d'importation (avec alias)
OLD_IMPORT_PATH='@/components/contrats/ContratPDFWrapper.js'
# Nouveau chemin d'importation (avec alias)
NEW_IMPORT_PATH='@/components/pdf/ContratPDFWrapper.js'

FILES_TO_UPDATE=(
  "$SRC_DIR/components/contrats/desktop/ContratGenerator.js"
  "$SRC_DIR/components/contrats/desktop/ContratTemplateEditor.js"
  "$SRC_DIR/pages/ContratDetailsPage.js"
)

echo "Mise à jour des chemins d'importation pour ContratPDFWrapper..."
for file in "${FILES_TO_UPDATE[@]}"; do
  if [ -f "$file" ]; then
    echo " - Mise à jour dans $file"
    # Utiliser sed pour remplacer l'ancien chemin par le nouveau
    # L'option -i modifie le fichier sur place. Créer une sauvegarde avec -i.bak
    sed -i '' "s|$OLD_IMPORT_PATH|$NEW_IMPORT_PATH|g" "$file"
    # Vérifier si le remplacement a eu lieu (optionnel)
    if ! grep -q "$NEW_IMPORT_PATH" "$file"; then
      echo "   ATTENTION: Le remplacement semble avoir échoué dans $file. Vérification manuelle nécessaire."
    fi
  else
    echo "   ATTENTION: Fichier $file non trouvé. Impossible de mettre à jour l'importation."
  fi
done

echo ""
echo "Étape 1 (Structure et Imports) terminée."
echo "NOTE: Ce script a déplacé ContratPDFWrapper.js et mis à jour les imports."
echo "Le découpage interne du composant et l'extraction des styles vers ContratPDFWrapper.module.css doivent être effectués manuellement ou via des scripts ultérieurs."

