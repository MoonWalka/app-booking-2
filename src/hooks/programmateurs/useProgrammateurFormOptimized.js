/**
 * Hook optimisé pour le formulaire de programmateur basé sur useGenericEntityForm
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce hook représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 */

import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGenericEntityForm } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook optimisé pour gérer les formulaires de programmateurs
 * Utilise directement useGenericEntityForm comme recommandé
 * 
 * @param {string} programmateurId - ID du programmateur ou 'nouveau' pour un nouveau programmateur
 * @returns {Object} - États et fonctions pour gérer le formulaire
 */
export const useProgrammateurFormOptimized = (programmateurId) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const actualProgrammateurId = programmateurId || id;
  const isNewProgrammateur = !actualProgrammateurId || actualProgrammateurId === 'nouveau';
  
  debugLog(`Initialisation du formulaire de programmateur optimisé: ${isNewProgrammateur ? 'nouveau programmateur' : `programmateur ${actualProgrammateurId}`}`, 'info', 'useProgrammateurFormOptimized');
  
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
      errors,
      message: Object.keys(errors).length > 0 ? 'Veuillez corriger les erreurs du formulaire.' : null
    };
  };

  // Fonction de transformation des données avant sauvegarde
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
      concertsAssocies: data.concertsAssocies || [],
      // Ajout de la date de mise à jour
      updatedAt: new Date()
    };
    
    debugLog('Données transformées avant sauvegarde', 'debug', 'useProgrammateurFormOptimized', transformedData);
    return transformedData;
  };
  
  // Callbacks pour les opérations réussies ou en erreur
  const onSuccessCallback = useCallback((savedId, savedData) => {
    const message = isNewProgrammateur
      ? `Le programmateur ${savedData.contact?.nom || ''} a été créé avec succès`
      : `Le programmateur ${savedData.contact?.nom || ''} a été mis à jour avec succès`;
    
    showSuccessToast(message);
    navigate(`/programmateurs/${savedId}`);
    
    // Si une structure a été créée en même temps, on pourrait gérer ici la sauvegarde de la structure
    // et la mise à jour de la relation entre la structure et le programmateur
  }, [isNewProgrammateur, navigate]);

  const onErrorCallback = useCallback((error) => {
    const message = isNewProgrammateur
      ? `Erreur lors de la création du programmateur: ${error.message}`
      : `Erreur lors de la sauvegarde du programmateur: ${error.message}`;
    
    showErrorToast(message);
  }, [isNewProgrammateur]);
  
  // Utilisation directe du hook générique avec configuration spécifique aux programmateurs
  const formHook = useGenericEntityForm({
    entityType: 'programmateurs',
    entityId: isNewProgrammateur ? null : actualProgrammateurId,
    collectionName: 'programmateurs',
    initialData: {
      // Valeurs par défaut pour un nouveau programmateur
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
    },
    validateForm: validateProgrammateurForm,
    transformData: transformProgrammateurData,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    relatedEntities: [
      { 
        name: 'structure',
        collection: 'structures',
        idField: 'structureId',
        nameField: 'structureNom'
      }
    ]
  });
  
  // Extension du hook avec des fonctionnalités spécifiques aux programmateurs
  
  // Fonction pour sélectionner/désélectionner la structure
  const handleSelectStructure = useCallback((structure) => {
    if (structure) {
      formHook.updateFormData(prev => ({
        ...prev,
        structureId: structure.id,
        structureNom: structure.raisonSociale || structure.nom
      }));
      
      // Charger les détails de la structure dans les données liées
      formHook.loadRelatedEntity('structure', structure.id);
    } else {
      formHook.updateFormData(prev => ({
        ...prev,
        structureId: '',
        structureNom: ''
      }));
    }
  }, [formHook]);
  
  // Fonction pour gérer le toggle des sections (interface utilisateur)
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
  
  // Fonction pour gérer l'annulation du formulaire
  const handleCancel = useCallback(() => {
    debugLog('Annulation du formulaire programmateur', 'info', 'useProgrammateurFormOptimized');
    
    // Si c'est un nouveau programmateur, rediriger vers la liste
    if (isNewProgrammateur) {
      navigate('/programmateurs');
    } else {
      // Si c'est un programmateur existant, rediriger vers sa vue détails
      navigate(`/programmateurs/${actualProgrammateurId}`);
    }
  }, [navigate, isNewProgrammateur, actualProgrammateurId]);
  
  // Fonctions pour mettre à jour des objets imbriqués
  const updateContact = useCallback((field, value) => {
    formHook.updateFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  }, [formHook]);
  
  const updateStructure = useCallback((field, value) => {
    formHook.updateFormData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        [field]: value
      }
    }));
  }, [formHook]);
  
  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques aux programmateurs
    isNewProgrammateur,
    handleSelectStructure,
    sectionsVisibility,
    toggleSection,
    updateContact,
    updateStructure,
    handleCancel, // Ajout de la fonction handleCancel
    // Raccourcis pour une meilleure DX
    programmateur: formHook.formData,
    contact: formHook.formData?.contact || {},
    structure: formHook.relatedData?.structure,
    selectedStructure: formHook.relatedData?.structure
  };
};

export default useProgrammateurFormOptimized;