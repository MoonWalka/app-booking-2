/**
 * Hook optimisé pour le formulaire de contact basé sur useGenericEntityForm
 * 
 * ⚠️ NOTE IMPORTANTE - APPROCHE RECOMMANDÉE ⚠️
 * Ce hook représente l'approche RECOMMANDÉE pour les nouveaux développements.
 * Il utilise DIRECTEMENT les hooks génériques plutôt que de passer par des wrappers
 * ou des hooks "Migrated/V2", conformément au plan de dépréciation officiel
 * (PLAN_DEPRECIATION_HOOKS.md) qui prévoit la suppression de tous les hooks 
 * spécifiques d'ici novembre 2025.
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook optimisé pour gérer les formulaires de contacts
 * Utilise directement useGenericEntityForm comme recommandé
 * 
 * @param {string} contactId - ID du contact ou 'nouveau' pour un nouveau contact
 * @returns {Object} - États et fonctions pour gérer le formulaire
 */
export const useContactForm = (contactId) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Détecter le mode "nouveau" via l'URL plutôt que via les paramètres
  const isNewFromUrl = location.pathname.endsWith('/nouveau');
  const actualContactId = contactId || id;
  const isNewContact = isNewFromUrl || !actualContactId || actualContactId === 'nouveau';
  
  // LOGS TEMPORAIREMENT DÉSACTIVÉS POUR ÉVITER LA BOUCLE
  // console.log('[DEBUG][useContactForm] actualContactId:', actualContactId);
  
  // debugLog(`Initialisation du formulaire de contact optimisé: ${isNewContact ? 'nouveau contact' : `contact ${actualContactId}`}`, 'info', 'useContactForm');
  
  // Fonction de validation spécifique aux contacts
  const validateContactForm = useCallback((data) => {
    const errors = {};
    
    if (!data.contact?.nom) {
      errors['contact.nom'] = 'Le nom du contact est obligatoire';
    }
    
    // Email facultatif, mais si fourni, doit être valide
    if (data.contact?.email && !/^\S+@\S+\.\S+$/.test(data.contact.email)) {
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
  }, []);

  // Fonction de transformation des données avant sauvegarde
  const transformContactData = useCallback((data) => {
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
    
    // debugLog('Données transformées avant sauvegarde', 'debug', 'useContactForm', transformedData);
    return transformedData;
  }, []);
  
  // Callbacks pour les opérations réussies ou en erreur
  const onSuccessCallback = useCallback((savedId, savedData) => {
    const message = isNewContact
      ? `Le contact ${savedData.contact?.nom || ''} a été créé avec succès`
      : `Le contact ${savedData.contact?.nom || ''} a été mis à jour avec succès`;
    
    showSuccessToast(message);
    
    // Éviter la boucle infinie : ne pas naviguer si savedId est "nouveau"
    if (savedId && savedId !== 'nouveau') {
      navigate(`/contacts/${savedId}`);
    } else if (isNewContact) {
      // Pour un nouveau contact, rediriger vers la liste
      navigate('/contacts');
    }
    
    // Si une structure a été créée en même temps, on pourrait gérer ici la sauvegarde de la structure
    // et la mise à jour de la relation entre la structure et le contact
  }, [isNewContact, navigate]);

  const onErrorCallback = useCallback((error) => {
    const message = isNewContact
      ? `Erreur lors de la création du contact: ${error.message}`
      : `Erreur lors de la sauvegarde du contact: ${error.message}`;
    
    showErrorToast(message);
  }, [isNewContact]);
  
  // Utilisation directe du hook générique avec configuration spécifique aux contacts
  const formHook = useGenericEntityForm({
    entityType: 'contacts',
    entityId: isNewContact ? null : actualContactId,
    collectionName: 'contacts',
    initialData: useMemo(() => ({
      // Valeurs par défaut pour un nouveau contact
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
    }), []),
    validateForm: validateContactForm,
    transformData: transformContactData,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    relatedEntities: useMemo(() => [
      { 
        name: 'structure',
        collection: 'structures',
        idField: 'structureId',
        nameField: 'structureNom'
      }
    ], [])
  });
  
  // Extension du hook avec des fonctionnalités spécifiques aux contacts
  
  // Fonction pour sélectionner/désélectionner la structure
  const handleSelectStructure = useCallback((structure) => {
    if (structure) {
      formHook.setFormData(prev => ({
        ...prev,
        structureId: structure.id,
        structureNom: structure.nom || structure.raisonSociale
      }));
      
      // TODO: Charger les détails de la structure dans les données liées
      // Note: loadRelatedEntity n'existe pas dans useGenericEntityForm
      // formHook.loadRelatedEntity('structure', structure.id);
    } else {
      formHook.setFormData(prev => ({
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
    debugLog('Annulation du formulaire contact', 'info', 'useContactForm');
    
    // Si c'est un nouveau contact, rediriger vers la liste
    if (isNewContact) {
      navigate('/contacts');
    } else {
      // Si c'est un contact existant, rediriger vers sa vue détails
      navigate(`/contacts/${actualContactId}`);
    }
  }, [navigate, isNewContact, actualContactId]);
  
  // Méthode pour mettre à jour les champs imbriqués du contact
  const updateContact = useCallback((field, value) => {
    formHook.setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  }, [formHook]);
  
  // Méthode pour mettre à jour les champs imbriqués de la structure
  const updateStructure = useCallback((field, value) => {
    formHook.setFormData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        [field]: value
      }
    }));
  }, [formHook]);
  
  // Fonction pour gérer les changements de structure principale (utilisée par useCompanySearch)
  const handleStructureChange = useCallback((company) => {
    if (company) {
      const structureData = {
        raisonSociale: company.nom || company.raisonSociale || '',
        siret: company.siret || '',
        adresse: company.adresse || '',
        codePostal: company.codePostal || '',
        ville: company.ville || '',
        type: company.statutJuridique || ''
      };
      
      formHook.setFormData(prev => ({
        ...prev,
        structureId: company.id || '',
        structure: {
          ...prev.structure,
          ...structureData
        }
      }));
    } else {
      formHook.setFormData(prev => ({
        ...prev,
        structureId: '',
        structure: {
          ...prev.structure,
          raisonSociale: '',
          siret: '',
          adresse: '',
          codePostal: '',
          ville: '',
          type: ''
        }
      }));
    }
  }, [formHook]);
  
  // Enrichir formData avec l'id de l'entité pour exposer contact.id
  const contactDataWithId = { ...formHook.formData, id: formHook.entityId };
  
  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques aux contacts
    isNewContact,
    handleSelectStructure,
    sectionsVisibility,
    toggleSection,
    updateContact,
    updateStructure,
    handleCancel, // Ajout de la fonction handleCancel
    // Raccourcis pour une meilleure DX
    contact: contactDataWithId,
    contactFormData: formHook.formData?.contact || {},
    // TODO: Gérer les entités liées différemment car relatedData n'existe pas dans useGenericEntityForm
    structure: null,
    selectedStructure: null,
    handleStructureChange
  };
};

export default useContactForm;