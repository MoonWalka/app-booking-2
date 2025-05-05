#!/bin/bash
# Script pour migrer les hooks originaux vers des wrappers autour de leurs versions migrées

HOOKS_DIR="../src/hooks"
ENTITY_TYPES=("programmateurs" "lieux" "artistes" "concerts" "structures" "contrats")

echo "🔄 Démarrage de la migration des hooks..."
echo "📂 Répertoire des hooks : $HOOKS_DIR"

# Fonction pour générer un wrapper
create_wrapper() {
  local entity_type=$1
  local hook_name=$2
  local migrated_hook_name=$3
  local singular_entity=${entity_type%?}  # Retire le "s" final pour avoir le singulier
  
  cat > "$HOOKS_DIR/$entity_type/$hook_name.js" << EOF
/**
 * @deprecated Ce hook est déprécié et sera supprimé dans une future version.
 * Veuillez utiliser le hook migré vers les hooks génériques à la place:
 * import { ${hook_name}V2 } from '@/hooks/${entity_type}';
 * 
 * Hook pour gérer les détails d'un $singular_entity
 * @param {string} id - ID du $singular_entity
 * @returns {Object} - Données et fonctions pour la gestion du $singular_entity
 */
import $migrated_hook_name from './$migrated_hook_name';
import { useEffect } from 'react';

const $hook_name = (id) => {
  // Afficher un avertissement de dépréciation
  useEffect(() => {
    console.warn(
      'Avertissement: $hook_name est déprécié. ' +
      'Veuillez utiliser ${hook_name}V2 depuis @/hooks/$entity_type à la place.'
    );
  }, []);
  
  // Utiliser la version migrée qui est basée sur useGenericEntityDetails
  const migratedHook = $migrated_hook_name(id);
  
  // Adapter l'API pour être compatible avec les composants existants
  return {
    // Propriétés de la version originale
    $singular_entity: migratedHook.entity,
    loading: migratedHook.isLoading,
    error: migratedHook.error,
    isEditing: migratedHook.isEditing,
    formData: migratedHook.formData,
    isSubmitting: migratedHook.isSubmitting,
    
    // Fonctions de la version originale
    toggleEditMode: migratedHook.toggleEditMode,
    setFormData: migratedHook.updateFormData,
    handleChange: (e) => {
      const { name, value } = e.target;
      
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        migratedHook.updateFormData(prevState => ({
          ...prevState,
          [section]: {
            ...prevState[section],
            [field]: value
          }
        }));
      } else {
        migratedHook.updateFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      }
    },
    handleSubmit: migratedHook.saveEntity,
    handleDelete: migratedHook.deleteEntity,
    formatValue: migratedHook.formatValue
  };
};

export default $hook_name;
EOF
  
  echo "✅ Hook $hook_name transformé en wrapper autour de $migrated_hook_name"
}

# Fonction pour mettre à jour le fichier index.js
update_index_file() {
  local entity_type=$1
  local hook_name=$2
  local migrated_hook_name=$3
  local index_file="$HOOKS_DIR/$entity_type/index.js"
  
  # Vérifier si le fichier index.js existe
  if [ ! -f "$index_file" ]; then
    echo "⚠️ Le fichier $index_file n'existe pas. Création..."
    echo "// src/hooks/$entity_type/index.js" > "$index_file"
  fi
  
  # Vérifier si l'exportation du hook original existe
  if ! grep -q "export.*$hook_name" "$index_file"; then
    echo "⚠️ Le hook $hook_name n'est pas exporté dans $index_file."
    return 1
  fi
  
  # Vérifier si les exportations migrées existent déjà
  if grep -q "export.*$migrated_hook_name" "$index_file"; then
    echo "ℹ️ Le hook $migrated_hook_name est déjà exporté dans $index_file."
    return 0
  fi
  
  # Ajouter les exportations
  cat >> "$index_file" << EOF

// Export de la version migrée avec son nom original
export { default as $migrated_hook_name } from './$migrated_hook_name';

/**
 * @recommended La version migrée du hook $hook_name basée sur les hooks génériques.
 * À utiliser dans les nouveaux développements.
 */
export { default as ${hook_name}V2 } from './$migrated_hook_name';
EOF
  
  echo "✅ Fichier $index_file mis à jour pour exporter les versions migrées"
}

# Pour chaque type d'entité
for entity_type in "${ENTITY_TYPES[@]}"; do
  echo "🔍 Analyse du dossier $entity_type..."
  
  # Vérifier si le dossier existe
  if [ ! -d "$HOOKS_DIR/$entity_type" ]; then
    echo "⚠️ Le dossier $HOOKS_DIR/$entity_type n'existe pas. Passage au suivant."
    continue
  fi
  
  # Rechercher les hooks migrés
  for migrated_file in $(find "$HOOKS_DIR/$entity_type" -name "*Migrated.js"); do
    # Extraire le nom du fichier sans chemin ni extension
    migrated_basename=$(basename "$migrated_file" .js)
    original_basename=${migrated_basename/Migrated/}
    original_file="${migrated_file/Migrated/}"
    
    echo "🔄 Hook migré trouvé: $migrated_basename => original: $original_basename"
    
    # Vérifier si le hook original existe
    if [ -f "$original_file" ]; then
      echo "✅ Le hook original $original_basename existe."
      
      # Sauvegarder le hook original
      cp "$original_file" "${original_file}.backup"
      echo "📦 Sauvegarde du hook original dans ${original_file}.backup"
      
      # Créer le wrapper
      create_wrapper "$entity_type" "$original_basename" "$migrated_basename"
      
      # Mettre à jour le fichier index.js
      update_index_file "$entity_type" "$original_basename" "$migrated_basename"
    else
      echo "❌ Le hook original $original_basename n'existe pas."
    fi
  done
done

echo "📝 Mise à jour du document de plan de restructuration..."
sed -i "" "s/🔄 Implémenter la stratégie de wrapper pour les autres hooks (en cours)/✅ Implémentation de la stratégie de wrapper pour tous les hooks (terminé)/g" "../docs/hooks/PLAN_RESTRUCTURATION_HOOKS.md"

echo "✅ Migration terminée!"
echo "N'oubliez pas de tester les hooks migrés pour vous assurer que tout fonctionne correctement."