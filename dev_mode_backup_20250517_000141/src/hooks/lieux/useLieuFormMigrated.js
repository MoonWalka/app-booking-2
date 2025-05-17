// src/hooks/lieux/useLieuFormMigrated.js
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGenericEntityForm } from '@/hooks/common/useGenericEntityForm';

/**
 * Hook migré pour la gestion des formulaires de lieux
 * Utilise useGenericEntityForm comme base
 * 
 * @param {string} lieuId - ID du lieu ou 'nouveau' pour un nouveau lieu
 * @returns {Object} États et fonctions pour gérer le formulaire de lieu
 */
const useLieuFormMigrated = (lieuId) => {
  const { id } = useParams();
  const actualLieuId = lieuId || id;
  
  // Configuration des entités liées à un lieu
  const relatedEntities = [
    { 
      name: 'programmateur',
      collection: 'programmateurs',
      idField: 'programmateurId',
      nameField: 'programmateurNom'
    }
  ];

  // Données initiales du formulaire
  const initialData = {
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    capacite: '',
    type: '',
    contact: {
      nom: '',
      telephone: '',
      email: ''
    },
    programmateurId: null,
    programmateurNom: null,
    latitude: null,
    longitude: null,
    display_name: ''
  };

  // Fonction de validation spécifique aux lieux
  const validateLieuForm = (data) => {
    const errors = {};
    
    if (!data.nom) {
      errors.nom = 'Le nom du lieu est obligatoire';
    }
    
    if (!data.adresse) {
      errors.adresse = 'L\'adresse du lieu est obligatoire';
    }
    
    if (!data.codePostal) {
      errors.codePostal = 'Le code postal est obligatoire';
    }
    
    if (!data.ville) {
      errors.ville = 'La ville est obligatoire';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Transformation des données avant sauvegarde
  const transformLieuData = (data) => {
    // Assurez-vous que contact existe toujours
    const transformedData = {
      ...data,
      contact: data.contact || {
        nom: '',
        telephone: '',
        email: ''
      }
    };
    
    return transformedData;
  };

  // Callback après sauvegarde réussie
  const onLieuSaveSuccess = (savedId, savedData) => {
    console.log(`Lieu ${savedId} enregistré avec succès`, savedData);
    // Logique supplémentaire si nécessaire...
  };

  // Utiliser le hook générique avec la configuration spécifique aux lieux
  const genericFormHook = useGenericEntityForm({
    entityType: 'lieux',
    entityId: actualLieuId,
    initialData,
    collectionName: 'lieux',
    validateForm: validateLieuForm,
    transformData: transformLieuData,
    onSuccess: onLieuSaveSuccess,
    relatedEntities
  });

  // Pour faciliter l'accès au programmateur lié spécifique aux lieux
  const selectedProgrammateur = genericFormHook.relatedData.programmateur || null;

  // Fonction spécifique pour sélectionner/désélectionner le programmateur
  const handleSelectProgrammateur = useCallback((programmateur) => {
    genericFormHook.handleSelectRelatedEntity('programmateur', programmateur);
  }, [genericFormHook.handleSelectRelatedEntity]);

  return {
    ...genericFormHook,
    // Ajouter les propriétés spécifiques aux lieux pour maintenir la compatibilité avec le code existant
    lieu: genericFormHook.formData,
    setLieu: genericFormHook.setFormData,
    selectedProgrammateur,
    handleSelectProgrammateur,
    // Pour compatibilité avec l'ancien code qui utilise validateForm comme fonction
    validateForm: () => validateLieuForm(genericFormHook.formData).isValid
  };
};

export default useLieuFormMigrated;