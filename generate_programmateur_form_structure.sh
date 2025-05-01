#!/bin/bash

# Script pour générer la structure de refactorisation de ProgrammateurForm
# Similaire à l'architecture utilisée pour ConcertForm

echo "🚀 Création de la structure pour la refactorisation de ProgrammateurForm..."

# Variables principales
BASE_DIR="src"
HOOKS_DIR="$BASE_DIR/hooks/programmateurs"
COMPONENTS_DIR="$BASE_DIR/components/programmateurs/sections"

# Création des répertoires s'ils n'existent pas déjà
mkdir -p $HOOKS_DIR
mkdir -p $COMPONENTS_DIR

echo "📁 Répertoires créés: $HOOKS_DIR et $COMPONENTS_DIR"

# Liste des composants à créer
declare -a COMPONENTS=(
  "ProgrammateurFormHeader" 
  "ProgrammateurFormActions" 
  "ContactInfoSection" 
  "StructureInfoSection" 
  "CompanySearchSection" 
  "LieuInfoSection" 
  "DeleteConfirmModal"
)

# Liste des hooks à créer
declare -a HOOKS=(
  "useProgrammateurForm"
  "useCompanySearch"
  "useFormSubmission"
)

# Vérifier si SearchDropdown et SelectedEntityCard existent déjà (réutilisation)
if [ ! -f "$BASE_DIR/components/concerts/sections/SearchDropdown.js" ]; then
  COMPONENTS+=("SearchDropdown")
  echo "⚠️ SearchDropdown n'existe pas encore, il sera créé"
else
  echo "✅ SearchDropdown existe déjà et sera réutilisé"
fi

if [ ! -f "$BASE_DIR/components/concerts/sections/SelectedEntityCard.js" ]; then
  COMPONENTS+=("SelectedEntityCard")
  echo "⚠️ SelectedEntityCard n'existe pas encore, il sera créé"
else
  echo "✅ SelectedEntityCard existe déjà et sera réutilisé"
fi

# Vérifier si le hook d'adresse existe déjà (réutilisation)
if [ ! -f "$BASE_DIR/hooks/common/useAddressSearch.js" ]; then
  HOOKS+=("useAddressSearch")
  echo "⚠️ useAddressSearch n'existe pas encore dans hooks/common, il sera créé"
else
  echo "✅ useAddressSearch existe déjà et sera réutilisé"
fi

# Création des fichiers de composants avec modèles de base
echo "📝 Création des fichiers de composants..."
for component in "${COMPONENTS[@]}"; do
  # Vérifier si le composant existe déjà
  if [ -f "$COMPONENTS_DIR/$component.js" ]; then
    echo "⚠️ Le composant $component existe déjà. Création ignorée."
    continue
  fi
  
  echo "import React from 'react';
import styles from './$component.module.css';

/**
 * $component - Description du composant
 */
const $component = (props) => {
  return (
    <div className={styles.container}>
      {/* À compléter */}
    </div>
  );
};

export default $component;" > "$COMPONENTS_DIR/$component.js"
  
  # Créer aussi le fichier CSS module associé
  echo "/* Styles pour $component */
.container {
  /* Styles de base */
}
" > "$COMPONENTS_DIR/$component.module.css"
  
  echo "✅ Composant $component créé avec son fichier CSS module"
done

# Création des fichiers de hooks personnalisés avec modèles de base
echo "📝 Création des hooks personnalisés..."
for hook in "${HOOKS[@]}"; do
  # Vérifier si le hook existe déjà
  if [ -f "$HOOKS_DIR/$hook.js" ]; then
    echo "⚠️ Le hook $hook existe déjà. Création ignorée."
    continue
  fi
  
  echo "import { useState, useEffect, useRef } from 'react';

/**
 * $hook - Description du hook
 */
const $hook = (/* paramètres */) => {
  // État et logique du hook
  
  return {
    // Valeurs et fonctions à retourner
  };
};

export default $hook;" > "$HOOKS_DIR/$hook.js"
  
  echo "✅ Hook $hook créé"
done

echo "🎉 Structure de base créée avec succès!"
echo "📌 Prochaine étape: Compléter le code des composants et hooks selon les besoins de refactorisation"