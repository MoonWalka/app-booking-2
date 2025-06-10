import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import useGenericEntityForm from '@/hooks/generics/forms/useGenericEntityForm';
import useContactSearch from '@/hooks/contacts/useContactSearch';
import { showSuccessToast } from '@/utils/toasts';
import { updateBidirectionalRelation } from '@/services/bidirectionalRelationsService';

/**
 * Hook optimisé pour les formulaires de lieux utilisant directement le hook générique
 * Cette approche est recommandée pour tous les nouveaux développements
 * 
 * @param {string} lieuId - ID du lieu ou 'nouveau' pour un nouveau lieu
 * @returns {Object} - États et fonctions pour gérer le formulaire de lieu
 */
export const useLieuForm = (lieuId) => {
  const navigate = useNavigate();
  
  // Référence pour stocker les anciens contactIds
  const previousContactIdsRef = useRef([]);
  const isFirstLoadRef = useRef(true);
  
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
      contactId: null,
      contactIds: [], // Pour la gestion bidirectionnelle des contacts
      latitude: null,
      longitude: null,
      actif: true
    },
    validateForm: validateLieuForm,
    transformData: transformLieuData,
    onSuccess: async (savedData, action) => {
      // Actions spécifiques après sauvegarde
      console.log(`[useLieuForm] onSuccess appelé:`, {
        savedData,
        action,
        contactIds: savedData?.contactIds,
        previousContactIds: previousContactIdsRef.current
      });
      
      // Si c'est un chargement initial, stocker les contactIds pour référence future
      if (action === 'getById' || action === 'load') {
        if (savedData && savedData.contactIds) {
          previousContactIdsRef.current = savedData.contactIds || [];
        }
        return;
      }
      
      const savedId = savedData?.id;
      if (!savedId) {
        console.error('[useLieuForm] Pas d\'ID dans les données sauvegardées');
        return;
      }
      
      // Message de succès
      const message = action === 'create' 
        ? `Le lieu ${savedData.nom || ''} a été créé avec succès`
        : `Le lieu ${savedData.nom || ''} a été mis à jour avec succès`;
      showSuccessToast(message);
      
      // Gérer les relations bidirectionnelles pour les contacts
      if (savedData.contactIds || previousContactIdsRef.current.length > 0) {
        try {
          console.log('[useLieuForm] Gestion des relations bidirectionnelles lieu-contacts');
          
          const currentContactIds = savedData.contactIds || [];
          const previousContactIds = previousContactIdsRef.current || [];
          
          // Trouver les contacts supprimés
          const removedContacts = previousContactIds.filter(id => !currentContactIds.includes(id));
          
          // Trouver les nouveaux contacts
          const addedContacts = currentContactIds.filter(id => !previousContactIds.includes(id));
          
          // Supprimer les relations avec les contacts supprimés
          for (const contactId of removedContacts) {
            console.log('[useLieuForm] Suppression de la relation avec le contact:', contactId);
            await updateBidirectionalRelation({
              sourceType: 'lieu',
              sourceId: savedId,
              targetType: 'contact',
              targetId: contactId,
              relationName: 'contacts',
              action: 'remove'
            });
          }
          
          // Ajouter les relations avec les nouveaux contacts
          for (const contactId of addedContacts) {
            console.log('[useLieuForm] Ajout de la relation avec le contact:', contactId);
            await updateBidirectionalRelation({
              sourceType: 'lieu',
              sourceId: savedId,
              targetType: 'contact',
              targetId: contactId,
              relationName: 'contacts',
              action: 'add'
            });
          }
          
          // Mettre à jour la référence pour les prochaines modifications
          previousContactIdsRef.current = currentContactIds;
          
        } catch (error) {
          console.error('[useLieuForm] Erreur lors de la mise à jour des relations bidirectionnelles:', error);
          // Ne pas bloquer le flux principal si la mise à jour échoue
        }
      }
      
      // Redirection vers la liste des lieux
      navigate('/lieux');
    },
    relatedEntities: [
      {
        name: 'contact',
        collection: 'contacts',
        idField: 'contactId'
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
  const contactSearch = useContactSearch(formHook.formData, formHook.setFormData);
  
  // Capturer les contactIds existants lors du premier chargement
  useEffect(() => {
    if (isFirstLoadRef.current && formHook.formData && formHook.formData.contactIds) {
      console.log('[useLieuForm] Capture des contactIds existants:', formHook.formData.contactIds);
      previousContactIdsRef.current = formHook.formData.contactIds || [];
      isFirstLoadRef.current = false;
    }
  }, [formHook.formData]);

  // Retourner le hook générique enrichi de fonctionnalités spécifiques
  return {
    ...formHook, // Toutes les fonctionnalités du hook générique
    // Propriétés et méthodes spécifiques aux lieux
    addEquipement,
    removeEquipement,
    // Raccourcis pour une meilleure DX
    lieu: formHook.formData,
    contact: formHook.relatedData?.contact,
    contactSearch, // toujours présent
    // Alias pour la compatibilité
    submitting: formHook.isSubmitting,
    addressSearch: {} // Pour éviter les erreurs avec l'ancienne section adresse
  };
};

export default useLieuForm;