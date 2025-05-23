// src/hooks/structures/useStructureDetails.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityDetails } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'une structure
 * Version améliorée avec une meilleure organisation et détection d'erreurs
 * 
 * @param {string} id - ID de la structure
 * @returns {Object} États et méthodes pour gérer une structure
 */
const useStructureDetails = (id) => {
  const navigate = useNavigate();
  
  // Configuration de base pour le hook générique
  const detailsHook = useGenericEntityDetails({
    // Configuration générale
    entityType: 'structure',
    collectionName: 'structures',
    id,
    
    // Transformation des données
    transformData: (data) => {
      if (!data) return null;
      
      // S'assurer que les tableaux sont toujours initialisés
      return {
        ...data,
        programmateursAssocies: data.programmateursAssocies || [],
        lieuxAssocies: data.lieuxAssocies || [],
        artistesAssocies: data.artistesAssocies || []
      };
    },
    
    // Formatage des valeurs pour l'affichage
    formatValue: (field, value) => {
      switch (field) {
        case 'createdAt':
        case 'updatedAt':
          return value ? new Date(value).toLocaleDateString() : 'Non spécifié';
        default:
          return value !== undefined && value !== null && value !== '' ? value : 'Non spécifié';
      }
    },
    
    // Configuration des entités liées
    relatedEntities: [
      { 
        name: 'programmateurs', 
        collection: 'programmateurs', 
        idField: 'programmateursAssocies',
        type: 'one-to-many',
        essential: true // Les programmateurs sont essentiels pour l'affichage de la structure
      },
      {
        name: 'lieux',
        collection: 'lieux',
        idField: 'lieuxAssocies',
        type: 'one-to-many',
        essential: false // Les lieux peuvent être chargés à la demande
      }
    ],
    
    // Callbacks pour les opérations
    onSaveSuccess: () => {
      showSuccessToast(`La structure a été enregistrée avec succès`);
    },
    onSaveError: (error) => {
      console.error(`[useStructureDetails] Erreur de sauvegarde:`, error);
      showErrorToast(`Erreur lors de l'enregistrement de la structure: ${error.message}`);
    },
    onDeleteSuccess: () => {
      showSuccessToast(`La structure a été supprimée avec succès`);
      navigate('/structures');
    },
    onDeleteError: (error) => {
      console.error(`[useStructureDetails] Erreur de suppression:`, error);
      showErrorToast(`Erreur lors de la suppression de la structure: ${error.message}`);
    },
    
    // Navigation
    navigate,
    returnPath: '/structures',
    
    // Options avancées
    cacheEnabled: false, // Désactiver le cache pour éviter les problèmes de données obsolètes
    realtime: false,     // Chargement ponctuel plutôt qu'en temps réel
    useDeleteModal: true // Utiliser un modal pour confirmer la suppression
  });

  // Fonction pour ajouter un programmateur à la structure
  const addProgrammateur = useCallback((programmateur) => {
    if (!programmateur || !programmateur.id) return;
    
    // Vérifier si le programmateur n'est pas déjà associé
    const programmateursAssocies = detailsHook.formData.programmateursAssocies || [];
    if (programmateursAssocies.includes(programmateur.id)) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      programmateursAssocies: [...programmateursAssocies, programmateur.id]
    }));
    
    // Mettre à jour les données liées
    detailsHook.loadRelatedEntity('programmateurs', programmateur.id);
  }, [detailsHook]);

  // Fonction pour retirer un programmateur de la structure
  const removeProgrammateur = useCallback((programmateurId) => {
    if (!programmateurId) return;
    
    const programmateursAssocies = detailsHook.formData.programmateursAssocies || [];
    
    detailsHook.setFormData(prev => ({
      ...prev,
      programmateursAssocies: programmateursAssocies.filter(id => id !== programmateurId)
    }));
  }, [detailsHook]);
  
  // Fonction pour ajouter un lieu à la structure
  const addLieu = useCallback((lieu) => {
    if (!lieu || !lieu.id) return;
    
    // Vérifier si le lieu n'est pas déjà associé
    const lieuxAssocies = detailsHook.formData.lieuxAssocies || [];
    if (lieuxAssocies.includes(lieu.id)) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      lieuxAssocies: [...lieuxAssocies, lieu.id]
    }));
    
    // Mettre à jour les données liées
    detailsHook.loadRelatedEntity('lieux', lieu.id);
  }, [detailsHook]);

  // Fonction pour retirer un lieu de la structure
  const removeLieu = useCallback((lieuId) => {
    if (!lieuId) return;
    
    const lieuxAssocies = detailsHook.formData.lieuxAssocies || [];
    
    detailsHook.setFormData(prev => ({
      ...prev,
      lieuxAssocies: lieuxAssocies.filter(id => id !== lieuId)
    }));
  }, [detailsHook]);

  return {
    // Base du hook générique
    ...detailsHook,
    
    // Fonctionnalités spécifiques aux structures
    addProgrammateur,
    removeProgrammateur,
    addLieu,
    removeLieu,
    
    // Raccourcis pour une meilleure expérience développeur
    structure: detailsHook.entity,
    loading: detailsHook.loading,
    error: detailsHook.error,
    isEditing: detailsHook.isEditing,
    formData: detailsHook.formData,
    hasChanges: detailsHook.isDirty,
    
    // Accès simplifié aux entités liées
    programmateurs: detailsHook.relatedData?.programmateurs || [],
    loadingProgrammateurs: detailsHook.loadingRelated?.programmateurs || false,
    lieux: detailsHook.relatedData?.lieux || [],
    loadingLieux: detailsHook.loadingRelated?.lieux || false
  };
};

export default useStructureDetails;