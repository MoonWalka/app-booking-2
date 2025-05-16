/**
 * Template pour créer un hook de formulaire optimisé basé sur useGenericEntityForm
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce template représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 * 
 * Instructions:
 * 1. Copiez ce fichier et renommez-le (ex: useEntiteForm.js)
 * 2. Remplacez les occurrences de "entite", "Entite", "ENTITE" par votre type d'entité
 * 3. Personnalisez la validation, la transformation et les fonctions spécifiques
 * 4. Exportez le hook dans le fichier index.js de votre module
 */

import { useGenericEntityForm } from '@/hooks/common';

/**
 * Hook optimisé pour gérer les formulaires d'entité
 * Utilise directement useGenericEntityForm comme recommandé
 * 
 * @param {string} entiteId - ID de l'entité ou 'nouveau' pour une nouvelle entité
 * @returns {Object} - États et fonctions pour gérer le formulaire
 */
export const useEntiteForm = (entiteId) => {
  // Configuration spécifique pour l'entité
  const validateEntiteForm = (data) => {
    const errors = {};
    
    // Validation spécifique à l'entité
    if (!data.nom) errors.nom = 'Le nom est requis';
    // Ajoutez d'autres règles de validation spécifiques ici
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      message: Object.keys(errors).length > 0 ? 'Veuillez corriger les erreurs du formulaire.' : null
    };
  };
  
  const transformEntiteData = (data) => {
    // Transformation spécifique à l'entité avant sauvegarde
    return {
      ...data,
      // Conversions et normalisations spécifiques
      nomNormalise: data.nom ? data.nom.toLowerCase().trim() : '',
      // Ajoutez d'autres transformations spécifiques ici
      updatedAt: new Date()
    };
  };
  
  // Utilisation directe du hook générique avec configuration spécifique
  const formHook = useGenericEntityForm({
    entityType: 'entites', // Pour la navigation après sauvegarde
    entityId: entiteId,
    collectionName: 'entites', // Collection Firestore
    initialData: {
      // Valeurs par défaut pour une nouvelle entité
      nom: '',
      description: '',
      actif: true,
      // Ajoutez d'autres valeurs par défaut spécifiques ici
    },
    validateForm: validateEntiteForm,
    transformData: transformEntiteData,
    onSuccess: (savedId, savedData) => {
      // Actions spécifiques après sauvegarde
      console.log(`Entité ${savedId} sauvegardée avec succès`);
      // Vous pourriez déclencher d'autres actions ici
    },
    relatedEntities: [
      // Exemple d'entité liée (parent)
      {
        name: 'parent',
        collection: 'parents',
        idField: 'parentId'
      }
      // Ajoutez d'autres entités liées ici
    ]
  });
  
  // Extension du hook avec des fonctionnalités spécifiques à l'entité
  const fonctionSpecifique = () => {
    // Logique spécifique à l'entité
    // Exemple: ajout d'un élément à un tableau, calcul spécifique, etc.
  };
  
  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques à l'entité
    fonctionSpecifique,
    // Raccourcis pour une meilleure DX
    entite: formHook.formData,
    parent: formHook.relatedData?.parent
  };
};

export default useEntiteForm;