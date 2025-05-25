/**
 * Hook optimisé pour le formulaire de structure basé sur useGenericEntityForm
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce hook représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';
import { debugLog } from '@/utils/logUtils';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour gérer les formulaires de structures
 * Utilise directement useGenericEntityForm comme recommandé
 * 
 * @param {string} structureId - ID de la structure ou 'nouveau' pour une nouvelle structure
 * @returns {Object} - États et fonctions pour gérer le formulaire
 */
export const useStructureForm = (structureId) => {
  const navigate = useNavigate();
  const isNewStructure = !structureId || structureId === 'nouveau';
  
  debugLog(`Initialisation du formulaire de structure optimisé: ${isNewStructure ? 'nouvelle structure' : `structure ${structureId}`}`, 'info', 'useStructureForm');
  
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
      errors,
      message: Object.keys(errors).length > 0 ? 'Veuillez corriger les erreurs du formulaire.' : null
    };
  };
  
  // Fonction de transformation des données avant sauvegarde
  const transformStructureData = (data) => {
    // Transformations spécifiques aux structures avant sauvegarde
    const transformedData = {
      ...data,
      // Normalisation du nom
      nom: data.nom ? data.nom.trim() : '',
      // Normalisation de la raison sociale
      raisonSociale: data.raisonSociale ? data.raisonSociale.trim() : '',
      // Nettoyage du SIRET (suppression des espaces)
      siret: data.siret ? data.siret.replace(/\s/g, '') : '',
      // S'assurer que contact existe
      contact: data.contact || {
        nom: '',
        telephone: '',
        email: '',
        fonction: ''
      },
      // Ajout de la date de mise à jour
      updatedAt: new Date()
    };
    
    debugLog('Données transformées avant sauvegarde', 'debug', 'useStructureForm', transformedData);
    return transformedData;
  };
  
  // Callbacks pour les opérations réussies ou en erreur
  const onSuccessCallback = useCallback((savedId, savedData) => {
    const message = isNewStructure
      ? `La structure ${savedData.nom || ''} a été créée avec succès`
      : `La structure ${savedData.nom || ''} a été mise à jour avec succès`;
    
    showSuccessToast(message);
    navigate(`/structures/${savedId}`);
  }, [isNewStructure, navigate]);

  const onErrorCallback = useCallback((error) => {
    const message = isNewStructure
      ? `Erreur lors de la création de la structure: ${error.message}`
      : `Erreur lors de la sauvegarde de la structure: ${error.message}`;
    
    showErrorToast(message);
    debugLog(error, 'error', 'useStructureForm');
  }, [isNewStructure]);
  
  // Utilisation directe du hook générique avec configuration spécifique aux structures
  const formHook = useGenericEntityForm({
    entityType: 'structures',
    entityId: isNewStructure ? null : structureId,
    collectionName: 'structures',
    initialData: {
      // Valeurs par défaut pour une nouvelle structure
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
    },
    validateForm: validateStructureForm,
    transformData: transformStructureData,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    // Options supplémentaires
    addCreatedAt: isNewStructure, // Ajouter createdAt seulement pour les nouvelles structures
    relatedEntities: [
      // On pourrait ajouter ici les programmateurs liés ou autres relations
    ]
  });
  
  // Extension du hook avec des fonctionnalités spécifiques aux structures
  
  // Gestion des données de contact
  const updateContactInfo = useCallback((field, value) => {
    formHook.updateFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  }, [formHook]);
  
  // Fonction pour annuler et retourner à la liste ou au détail
  const handleCancel = useCallback(() => {
    navigate(structureId && structureId !== 'nouveau' ? `/structures/${structureId}` : '/structures');
  }, [navigate, structureId]);

  // Validation du formulaire HTML
  const validateHtmlForm = useCallback((form) => {
    if (form) {
      const isValid = form.checkValidity();
      if (!isValid) {
        return false;
      }
    }
    return validateStructureForm(formHook.formData).isValid;
  }, [formHook.formData]);
  
  // Fonction pour formater l'adresse complète
  const getFormattedAddress = useCallback(() => {
    const data = formHook.formData;
    const parts = [];
    
    if (data.adresse) parts.push(data.adresse);
    if (data.codePostal || data.ville) {
      parts.push(`${data.codePostal || ''} ${data.ville || ''}`.trim());
    }
    if (data.pays && data.pays !== 'France') parts.push(data.pays);
    
    return parts.join(', ');
  }, [formHook.formData]);
  
  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques aux structures
    isNewStructure,
    updateContactInfo,
    handleCancel,
    validateHtmlForm,
    getFormattedAddress,
    // Raccourcis pour une meilleure DX
    structure: formHook.formData,
    contact: formHook.formData?.contact || {},
    // Compatibilité avec le code existant
    isEditMode: !isNewStructure,
    validated: !!formHook.formErrors && Object.keys(formHook.formErrors).length > 0
  };
};

export default useStructureForm;