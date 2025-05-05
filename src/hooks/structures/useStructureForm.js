import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityForm } from '@/hooks/common/useGenericEntityForm';

/**
 * Hook pour la gestion des formulaires de structures
 * Version migrée basée sur useGenericEntityForm
 * 
 * @param {string} structureId - ID de la structure ou undefined pour une nouvelle structure
 * @returns {Object} États et fonctions pour gérer le formulaire de structure
 */
const useStructureForm = (structureId) => {
  const navigate = useNavigate();
  
  // Données initiales du formulaire
  const initialData = {
    nom: '',
    raisonSociale: '',
    type: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    siret: '',
    tva: '',
    telephone: '',
    email: '',
    siteWeb: '',
    notes: '',
    contact: {
      nom: '',
      telephone: '',
      email: '',
      fonction: ''
    }
  };

  // Fonction de validation spécifique aux structures
  const validateStructureForm = (data) => {
    const errors = {};
    
    if (!data.nom) {
      errors.nom = 'Le nom de la structure est obligatoire';
    }
    
    if (!data.raisonSociale) {
      errors.raisonSociale = 'La raison sociale est obligatoire';
    }
    
    // Validation conditionnelle du SIRET (si présent, doit avoir le bon format)
    if (data.siret && !/^\d{14}$/.test(data.siret.replace(/\s/g, ''))) {
      errors.siret = 'Le numéro SIRET doit contenir 14 chiffres';
    }
    
    // Validation conditionnelle de l'email (si présent, doit avoir le bon format)
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Transformation des données avant sauvegarde
  const transformStructureData = (data) => {
    // S'assurer que le champ contact existe toujours
    const transformedData = {
      ...data,
      contact: data.contact || {
        nom: '',
        telephone: '',
        email: '',
        fonction: ''
      }
    };
    
    return transformedData;
  };

  // Callback après sauvegarde réussie
  const onStructureSaveSuccess = (savedId, savedData) => {
    console.log(`Structure ${savedId} enregistrée avec succès`, savedData);
    navigate(`/structures/${savedId}`);
  };

  // Utiliser le hook générique avec la configuration spécifique aux structures
  const genericFormHook = useGenericEntityForm({
    entityType: 'structures',
    entityId: structureId,
    initialData,
    collectionName: 'structures',
    validateForm: validateStructureForm,
    transformData: transformStructureData,
    onSuccess: onStructureSaveSuccess,
    relatedEntities: [] // Les structures n'ont pas d'entités liées gérées dans ce formulaire
  });

  // Fonction pour annuler et retourner à la liste ou au détail
  const handleCancel = useCallback(() => {
    navigate(structureId ? `/structures/${structureId}` : '/structures');
  }, [navigate, structureId]);

  return {
    ...genericFormHook,
    // Ajouter les propriétés spécifiques pour maintenir la compatibilité
    id: structureId,
    isEditMode: !!structureId,
    validated: !!genericFormHook.formErrors && Object.keys(genericFormHook.formErrors).length > 0,
    setValidated: () => {}, // Fonction vide pour compatibilité API
    submitting: genericFormHook.submitting,
    handleCancel,
    // Pour compatibilité avec l'ancien code qui utilise validateForm comme fonction recevant un formulaire DOM
    validateForm: (form) => {
      if (form) {
        const isValid = form.checkValidity();
        if (!isValid) {
          return false;
        }
      }
      return validateStructureForm(genericFormHook.formData).isValid;
    }
  };
};

export default useStructureForm;