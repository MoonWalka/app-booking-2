// src/hooks/structures/useStructureFormMigrated.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityForm } from '@/hooks/common';
import { debugLog } from '@/utils/logUtils';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook migré pour la gestion du formulaire de structure
 * Utilise useGenericEntityForm comme base
 * 
 * @param {string} id - ID de la structure à éditer (undefined pour une nouvelle structure)
 * @returns {Object} API pour gérer le formulaire d'une structure
 */
const useStructureFormMigrated = (id) => {
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Données initiales pour une nouvelle structure
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
    
    // Validation du contact si des champs sont remplis
    if (data.contact) {
      if (data.contact.email && !/^\S+@\S+\.\S+$/.test(data.contact.email)) {
        errors['contact.email'] = 'Format d\'email de contact invalide';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Callbacks pour les opérations réussies ou en erreur
  const onSaveSuccess = useCallback((data) => {
    const message = isEditMode
      ? `La structure ${data.nom || ''} a été mise à jour avec succès`
      : `La structure ${data.nom || ''} a été créée avec succès`;
    
    showSuccessToast(message);
    navigate(`/structures/${data.id}`);
  }, [isEditMode, navigate]);

  const onSaveError = useCallback((error) => {
    const message = isEditMode
      ? `Erreur lors de la mise à jour de la structure: ${error.message}`
      : `Erreur lors de la création de la structure: ${error.message}`;
    
    showErrorToast(message);
    debugLog(error, 'error', 'useStructureFormMigrated');
  }, [isEditMode]);

  // Utiliser le hook générique avec la configuration appropriée
  const genericForm = useGenericEntityForm({
    // Configuration de base
    entityType: 'structure',
    collectionName: 'structures',
    id,
    initialFormData: initialData,
    
    // Validation et callbacks
    validateFormFn: validateStructureForm,
    onSaveSuccess,
    onSaveError,
    
    // Navigation
    navigate,
    returnPath: '/structures',
    
    // Options avancées
    addCreatedAt: !isEditMode, // Ajouter createdAt seulement pour les nouvelles structures
    addUpdatedAt: true // Toujours ajouter updatedAt
  });

  // Fonctions spécifiques aux structures
  
  // Gestion des données de contact
  const updateContactInfo = useCallback((field, value) => {
    genericForm.setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  }, [genericForm]);
  
  // Fonction pour annuler et retourner à la liste ou au détail
  const handleCancel = useCallback(() => {
    navigate(id ? `/structures/${id}` : '/structures');
  }, [navigate, id]);

  // Validation du formulaire HTML
  const validateHtmlForm = useCallback((form) => {
    if (form) {
      const isValid = form.checkValidity();
      if (!isValid) {
        return false;
      }
    }
    return validateStructureForm(genericForm.formData).isValid;
  }, [genericForm.formData]);

  return {
    // Toutes les fonctionnalités du hook générique
    ...genericForm,
    
    // Fonctionnalités spécifiques aux structures
    updateContactInfo,
    handleCancel,
    validateHtmlForm,
    
    // Propriétés supplémentaires
    isEditMode,
    validated: !!genericForm.formErrors && Object.keys(genericForm.formErrors).length > 0
  };
};

export default useStructureFormMigrated;