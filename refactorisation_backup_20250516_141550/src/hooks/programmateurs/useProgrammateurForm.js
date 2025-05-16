import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGenericEntityForm } from '@/hooks/common/useGenericEntityForm';

/**
 * Hook pour la gestion des formulaires de programmateurs
 * Implémentation basée sur useGenericEntityForm
 * 
 * @param {string} programmateurId - ID du programmateur ou 'nouveau' pour un nouveau programmateur
 * @returns {Object} États et fonctions pour gérer le formulaire de programmateur
 */
const useProgrammateurForm = (programmateurId) => {
  const { id } = useParams();
  const actualProgrammateurId = programmateurId || id;
  
  // Configuration des entités liées à un programmateur
  const relatedEntities = [
    { 
      name: 'structure',
      collection: 'structures',
      idField: 'structureId',
      nameField: 'structureNom'
    }
  ];

  // Données initiales du formulaire
  const initialData = {
    contact: {
      nom: '',
      prenom: '',
      fonction: '',
      email: '',
      telephone: ''
    },
    structure: {
      raisonSociale: '',
      type: '',
      adresse: '',
      codePostal: '',
      ville: '',
      pays: 'France',
      siret: '',
      tva: ''
    },
    structureId: '',
    concertsAssocies: []
  };

  // Fonction de validation spécifique aux programmateurs
  const validateProgrammateurForm = (data) => {
    const errors = {};
    
    if (!data.contact?.nom) {
      errors['contact.nom'] = 'Le nom du contact est obligatoire';
    }
    
    if (!data.contact?.email) {
      errors['contact.email'] = 'L\'email du contact est obligatoire';
    } else if (!/^\S+@\S+\.\S+$/.test(data.contact.email)) {
      errors['contact.email'] = 'Format d\'email invalide';
    }
    
    // Validation de la structure si nécessaire
    if (!data.structureId && !data.structure?.raisonSociale) {
      errors['structure.raisonSociale'] = 'La raison sociale est requise si aucune structure n\'est sélectionnée';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Transformation des données avant sauvegarde
  const transformProgrammateurData = (data) => {
    // S'assurer que les objets imbriqués existent toujours
    const transformedData = {
      ...data,
      contact: data.contact || {
        nom: '',
        prenom: '',
        fonction: '',
        email: '',
        telephone: ''
      },
      structure: data.structure || {
        raisonSociale: '',
        type: '',
        adresse: '',
        codePostal: '',
        ville: '',
        pays: 'France',
        siret: '',
        tva: ''
      },
      concertsAssocies: data.concertsAssocies || []
    };
    
    return transformedData;
  };

  // Callback après sauvegarde réussie
  const onProgrammateurSaveSuccess = (savedId, savedData) => {
    console.log(`Programmateur ${savedId} enregistré avec succès`, savedData);
    
    // Si une structure a été créée en même temps, on pourrait gérer ici la sauvegarde de la structure
    // et la mise à jour de la relation entre la structure et le programmateur
    // Code pour gérer la création/liaison de structure si nécessaire...
  };

  // Utiliser le hook générique avec la configuration spécifique aux programmateurs
  const genericFormHook = useGenericEntityForm({
    entityType: 'programmateurs',
    entityId: actualProgrammateurId,
    initialData,
    collectionName: 'programmateurs',
    validateForm: validateProgrammateurForm,
    transformData: transformProgrammateurData,
    onSuccess: onProgrammateurSaveSuccess,
    relatedEntities
  });

  // Pour faciliter l'accès à la structure liée
  const selectedStructure = genericFormHook.relatedData.structure || null;

  // Fonction spécifique pour sélectionner/désélectionner la structure
  const handleSelectStructure = useCallback((structure) => {
    genericFormHook.handleSelectRelatedEntity('structure', structure);
  }, [genericFormHook.handleSelectRelatedEntity]);

  // Fonction pour gérer le toggle des sections
  const [sectionsVisibility, setSectionsVisibility] = useState({
    contactVisible: true,
    legalVisible: true,
    structureVisible: true,
    lieuxVisible: true,
    concertsVisible: true
  });

  const toggleSection = useCallback((sectionName) => {
    setSectionsVisibility(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  }, []);

  return {
    ...genericFormHook,
    // Ajouter les propriétés spécifiques aux programmateurs pour maintenir la compatibilité
    programmateur: genericFormHook.formData,
    setProgrammateur: genericFormHook.setFormData,
    formData: genericFormHook.formData, // Alias pour la compatibilité
    selectedStructure,
    handleSelectStructure,
    sectionsVisibility,
    toggleSection,
    // Pour compatibilité avec l'ancien code qui utilise validateForm comme fonction
    validateForm: () => validateProgrammateurForm(genericFormHook.formData).isValid
  };
};

export default useProgrammateurForm;
