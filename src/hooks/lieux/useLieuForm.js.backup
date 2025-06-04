import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';
import useProgrammateurSearch from '@/hooks/programmateurs/useProgrammateurSearch';

/**
 * Hook optimisé pour les formulaires de lieux utilisant directement le hook générique
 * Cette approche est recommandée pour tous les nouveaux développements
 * 
 * @param {string} lieuId - ID du lieu ou 'nouveau' pour un nouveau lieu
 * @returns {Object} - États et fonctions pour gérer le formulaire de lieu
 */
export const useLieuForm = (lieuId) => {
  // Configuration spécifique pour les lieux
  const validateLieuForm = (data) => {
    const errors = {};
    
    // Validation spécifique aux lieux
    if (!data.nom) errors.nom = 'Le nom du lieu est requis';
    if (!data.adresse) errors.adresse = 'L\'adresse est requise';
    if (data.capacite !== undefined && (isNaN(data.capacite) || data.capacite < 0)) {
      errors.capacite = 'La capacité doit être un nombre positif';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      message: Object.keys(errors).length > 0 ? 'Veuillez corriger les erreurs du formulaire.' : null
    };
  };
  
  const transformLieuData = (data) => {
    // Transformation spécifique aux lieux avant sauvegarde
    return {
      ...data,
      // Conversion en nombre si nécessaire
      capacite: data.capacite !== undefined ? Number(data.capacite) : null,
      // Création de champs normalisés pour la recherche
      nomNormalise: data.nom ? data.nom.toLowerCase().trim() : '',
      villeNormalisee: data.ville ? data.ville.toLowerCase().trim() : '',
      // Toujours inclure un champ updatedBy pour l'audit
      updatedBy: 'system' // Idéalement, utilisez le contexte d'authentification ici
    };
  };
  
  // Utilisation directe du hook générique avec configuration spécifique
  const formHook = useGenericEntityForm({
    entityType: 'lieux', // Pour la navigation après sauvegarde
    entityId: lieuId,
    collectionName: 'lieux',
    initialData: {
      // Valeurs par défaut pour un nouveau lieu
      nom: '',
      adresse: '',
      codePostal: '',
      ville: '',
      pays: 'France',
      capacite: null,
      equipements: [],
      description: '',
      programmateurId: null,
      actif: true
    },
    validateForm: validateLieuForm,
    transformData: transformLieuData,
    onSuccess: (savedId, savedData) => {
      // Actions spécifiques après sauvegarde
      console.log(`Lieu ${savedId} sauvegardé avec succès`);
      // Vous pourriez déclencher d'autres actions ici
    },
    relatedEntities: [
      {
        name: 'programmateur',
        collection: 'programmateurs',
        idField: 'programmateurId'
      }
    ]
  });
  
  // Extension du hook avec des fonctionnalités spécifiques aux lieux
  const addEquipement = (equipement) => {
    if (!formHook.formData.equipements.includes(equipement)) {
      formHook.setFormData(prev => ({
        ...prev,
        equipements: [...prev.equipements, equipement]
      }));
    }
  };

  const removeEquipement = (equipement) => {
    formHook.setFormData(prev => ({
      ...prev,
      equipements: prev.equipements.filter(e => e !== equipement)
    }));
  };

  // Toujours appeler le hook à ce niveau pour respecter les règles de React
  const programmateurSearch = useProgrammateurSearch(formHook.formData, formHook.setFormData);

  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques aux lieux
    addEquipement,
    removeEquipement,
    // Raccourcis pour une meilleure DX
    lieu: formHook.formData,
    programmateur: formHook.relatedData?.programmateur,
    programmateurSearch // toujours présent
  };
};

export default useLieuForm;