/**
 * Hook optimisé pour le formulaire d'artiste basé sur useGenericEntityForm
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce hook représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { debugLog } from '@/utils/logUtils';

/**
 * Validation des données du formulaire d'artiste
 */
const validateArtisteForm = (data) => {
  const errors = {};
  
  // Validation des champs requis
  if (!data.nom || !data.nom.trim()) {
    errors.nom = "Le nom de l'artiste est obligatoire";
  }
  
  // Validation de l'email si fourni
  if (data.contacts?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contacts.email)) {
    errors.email = "Format d'email invalide";
  }
  
  // Validation du site web si fourni
  if (data.contacts?.siteWeb && !data.contacts.siteWeb.startsWith('http')) {
    errors.siteWeb = "Le site web doit commencer par http:// ou https://";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    message: Object.keys(errors).length > 0 ? 'Veuillez corriger les erreurs du formulaire.' : null
  };
};

/**
 * Hook optimisé pour gérer les formulaires d'artistes
 * Utilise directement useGenericEntityForm comme recommandé
 * 
 * @param {string} artisteId - ID de l'artiste ou 'nouveau' pour un nouvel artiste
 * @returns {Object} - États et fonctions pour gérer le formulaire
 */
export const useArtisteForm = (artisteId) => {
  const navigate = useNavigate();
  const isNewArtiste = !artisteId || artisteId === 'nouveau';
  
  debugLog(`Initialisation du formulaire d'artiste optimisé: ${isNewArtiste ? 'nouvel artiste' : `artiste ${artisteId}`}`, 'info', 'useArtisteForm');
  
  // Gestion des membres du groupe comme état local
  const [membres, setMembres] = useState([]);
  
  // Fonction de transformation des données avant sauvegarde
  const transformArtisteData = (data) => {
    // Transformations spécifiques aux artistes avant sauvegarde
    const transformedData = {
      ...data,
      // Normalisation du nom
      nom: data.nom ? data.nom.trim() : '',
      // Ajout des membres depuis l'état local
      membres: membres,
      // Ajout de la date de mise à jour
      updatedAt: new Date()
    };
    
    debugLog('Données transformées avant sauvegarde', 'debug', 'useArtisteForm', transformedData);
    return transformedData;
  };
  
  // Callbacks pour les opérations réussies ou en erreur
  const onSuccessCallback = useCallback((savedId, savedData) => {
    const message = isNewArtiste
      ? `L'artiste ${savedData.nom || ''} a été créé avec succès`
      : `L'artiste ${savedData.nom || ''} a été mis à jour avec succès`;
    
    showSuccessToast(message);
    navigate(`/artistes/${savedId}`);
  }, [isNewArtiste, navigate]);

  const onErrorCallback = useCallback((error) => {
    const message = isNewArtiste
      ? `Erreur lors de la création de l'artiste: ${error.message}`
      : `Erreur lors de la sauvegarde de l'artiste: ${error.message}`;
    
    showErrorToast(message);
  }, [isNewArtiste]);
  
  // Utilisation directe du hook générique avec configuration spécifique aux artistes
  const formHook = useGenericEntityForm({
    entityType: 'artistes',
    entityId: isNewArtiste ? null : artisteId,
    collectionName: 'artistes',
    initialData: {
      // Valeurs par défaut pour un nouvel artiste
      nom: '',
      genre: '',
      description: '',
      contacts: {
        email: '',
        telephone: '',
        siteWeb: '',
        instagram: '',
        facebook: ''
      },
      membres: [],
      actif: true
    },
    validateForm: validateArtisteForm,
    transformData: transformArtisteData,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    relatedEntities: [] // Aucune entité liée pour les artistes dans ce cas
  });
  
  // Extension du hook avec des fonctionnalités spécifiques aux artistes
  
  // Initialise les membres si disponibles dans formData
  useCallback(() => {
    if (formHook.formData?.membres && formHook.formData.membres.length > 0) {
      setMembres(formHook.formData.membres);
    }
  }, [formHook.formData, setMembres]);
  
  // Gestion des membres du groupe
  const ajouterMembre = useCallback((nom) => {
    if (!nom || !nom.trim()) return;
    
    const nouveauMembre = nom.trim();
    setMembres(prev => [...prev, nouveauMembre]);
  }, []);
  
  const supprimerMembre = useCallback((index) => {
    setMembres(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Gestion des contacts
  const updateContact = useCallback((field, value) => {
    formHook.updateFormData(prev => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        [field]: value
      }
    }));
  }, [formHook]);
  
  // Naviguer entre les étapes du formulaire
  const [etapeActuelle, setEtapeActuelle] = useState(0);
  const etapes = ['info-base', 'contacts', 'membres'];
  
  const goToNextStep = useCallback(() => {
    if (etapeActuelle < etapes.length - 1) {
      setEtapeActuelle(prev => prev + 1);
    }
  }, [etapeActuelle, etapes.length]);
  
  const goToPreviousStep = useCallback(() => {
    if (etapeActuelle > 0) {
      setEtapeActuelle(prev => prev - 1);
    }
  }, [etapeActuelle]);
  
  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques aux artistes
    isNewArtiste,
    // Gestion des membres
    membres,
    ajouterMembre,
    supprimerMembre,
    // Gestion des contacts
    updateContact,
    // Gestion des étapes
    etapeActuelle,
    setEtapeActuelle,
    etapes,
    goToNextStep,
    goToPreviousStep,
    // Raccourcis pour une meilleure DX
    artiste: formHook.formData,
    contacts: formHook.formData?.contacts || {}
  };
};

export default useArtisteForm;