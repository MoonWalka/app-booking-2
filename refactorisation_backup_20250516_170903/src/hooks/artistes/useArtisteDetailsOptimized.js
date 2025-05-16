// src/hooks/artistes/useArtisteDetailsOptimized.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { useGenericEntityDetails } from '@/hooks/common';
import { validateArtisteForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'un artiste
 * Version améliorée avec une meilleure organisation et détection d'erreurs
 * 
 * @param {string} id - ID de l'artiste
 * @returns {Object} États et méthodes pour gérer un artiste
 */
const useArtisteDetailsOptimized = (id) => {
  const navigate = useNavigate();
  
  // Configuration de base pour le hook générique
  const detailsHook = useGenericEntityDetails({
    // Configuration générale
    entityType: 'artiste',
    collectionName: 'artistes',
    id,
    
    // Transformation des données
    transformData: (data) => {
      if (!data) return null;
      
      // S'assurer que les tableaux et objets sont toujours initialisés
      return {
        ...data,
        genresMusique: data.genresMusique || [],
        membres: data.membres || [],
        reseauxSociaux: data.reseauxSociaux || [],
        typesSpectacle: data.typesSpectacle || [],
        documents: data.documents || [],
        contacts: data.contacts || {}
      };
    },
    
    // Formatage des valeurs pour l'affichage
    formatValue: (field, value) => {
      switch (field) {
        case 'createdAt':
        case 'updatedAt':
          return value ? new Date(value).toLocaleDateString() : 'Non spécifié';
        case 'dateCreation':
        case 'dateDerniereActivite':
          return value ? new Date(value).toLocaleDateString() : 'Non spécifiée';
        default:
          return value !== undefined && value !== null && value !== '' 
            ? value 
            : 'Non spécifié';
      }
    },
    
    // Configuration des entités liées
    relatedEntities: [
      { 
        name: 'structure', 
        collection: 'structures', 
        idField: 'structureId',
        type: 'one-to-one',
        essential: true // La structure est essentielle pour l'affichage de l'artiste
      },
      { 
        name: 'manager', 
        collection: 'managers', 
        idField: 'managerId',
        type: 'one-to-one',
        essential: false // Le manager peut être chargé à la demande
      },
      {
        name: 'concerts',
        collection: 'concerts',
        idField: 'artisteId',
        type: 'one-to-many',
        isReference: true,
        essential: false // Les concerts peuvent être chargés à la demande
      }
    ],
    
    // Callbacks pour les opérations
    onSaveSuccess: () => {
      showSuccessToast('Artiste enregistré avec succès');
    },
    onSaveError: (error) => {
      console.error(`[useArtisteDetailsOptimized] Erreur de sauvegarde:`, error);
      showErrorToast(`Erreur lors de l'enregistrement de l'artiste: ${error.message}`);
    },
    onDeleteSuccess: () => {
      showSuccessToast('Artiste supprimé avec succès');
      navigate('/artistes');
    },
    onDeleteError: (error) => {
      console.error(`[useArtisteDetailsOptimized] Erreur de suppression:`, error);
      showErrorToast(`Erreur lors de la suppression de l'artiste: ${error.message}`);
    },
    
    // Validation
    validateFormFn: validateArtisteForm,
    
    // Navigation
    navigate,
    returnPath: '/artistes',
    
    // Options avancées
    cacheEnabled: false, // Désactiver le cache pour éviter les problèmes de données obsolètes
    realtime: false,     // Chargement ponctuel plutôt qu'en temps réel
    useDeleteModal: true // Utiliser un modal pour confirmer la suppression
  });

  // Raccourcis pour les données et les fonctions
  const { formData, updateFormData } = detailsHook;

  // === Fonctions pour gérer les genres de musique ===
  const addGenreMusique = useCallback((genre) => {
    if (!genre || !genre.trim() || (formData?.genresMusique || []).includes(genre)) return;
    
    updateFormData({
      genresMusique: [...(formData?.genresMusique || []), genre]
    });
  }, [formData?.genresMusique, updateFormData]);

  const removeGenreMusique = useCallback((genre) => {
    if (!formData?.genresMusique) return;
    
    updateFormData({
      genresMusique: formData.genresMusique.filter(g => g !== genre)
    });
  }, [formData?.genresMusique, updateFormData]);

  // === Fonctions pour gérer les types de spectacle ===
  const addTypeSpectacle = useCallback((type) => {
    if (!type || !type.trim() || (formData?.typesSpectacle || []).includes(type)) return;
    
    updateFormData({
      typesSpectacle: [...(formData?.typesSpectacle || []), type]
    });
  }, [formData?.typesSpectacle, updateFormData]);

  const removeTypeSpectacle = useCallback((type) => {
    if (!formData?.typesSpectacle) return;
    
    updateFormData({
      typesSpectacle: formData.typesSpectacle.filter(t => t !== type)
    });
  }, [formData?.typesSpectacle, updateFormData]);

  // === Fonctions pour gérer les membres ===
  const addMembre = useCallback((membre) => {
    if (!membre?.nom || !membre?.role) return;
    
    const newMembre = {
      ...membre,
      id: uuidv4()
    };
    
    updateFormData({
      membres: [...(formData?.membres || []), newMembre]
    });
  }, [formData?.membres, updateFormData]);

  const updateMembre = useCallback((membreId, updatedData) => {
    if (!formData?.membres) return;
    
    updateFormData({
      membres: formData.membres.map(membre => 
        membre.id === membreId 
          ? { ...membre, ...updatedData } 
          : membre
      )
    });
  }, [formData?.membres, updateFormData]);

  const removeMembre = useCallback((membreId) => {
    if (!formData?.membres) return;
    
    updateFormData({
      membres: formData.membres.filter(m => m.id !== membreId)
    });
  }, [formData?.membres, updateFormData]);

  // === Fonctions pour gérer les réseaux sociaux ===
  const addReseauSocial = useCallback((reseau) => {
    if (!reseau?.type || !reseau?.url) return;
    
    const newReseau = {
      ...reseau,
      id: uuidv4()
    };
    
    updateFormData({
      reseauxSociaux: [...(formData?.reseauxSociaux || []), newReseau]
    });
  }, [formData?.reseauxSociaux, updateFormData]);

  const updateReseauSocial = useCallback((reseauId, updatedData) => {
    if (!formData?.reseauxSociaux) return;
    
    updateFormData({
      reseauxSociaux: formData.reseauxSociaux.map(reseau => 
        reseau.id === reseauId 
          ? { ...reseau, ...updatedData } 
          : reseau
      )
    });
  }, [formData?.reseauxSociaux, updateFormData]);

  const removeReseauSocial = useCallback((reseauId) => {
    if (!formData?.reseauxSociaux) return;
    
    updateFormData({
      reseauxSociaux: formData.reseauxSociaux.filter(r => r.id !== reseauId)
    });
  }, [formData?.reseauxSociaux, updateFormData]);

  // === Fonctions pour gérer les documents ===
  const addDocument = useCallback((document) => {
    if (!document?.type || !document?.url) return;
    
    const newDocument = {
      ...document,
      id: uuidv4(),
      uploadedAt: new Date().toISOString()
    };
    
    updateFormData({
      documents: [...(formData?.documents || []), newDocument]
    });
  }, [formData?.documents, updateFormData]);

  const removeDocument = useCallback((documentId) => {
    if (!formData?.documents) return;
    
    updateFormData({
      documents: formData.documents.filter(d => d.id !== documentId)
    });
  }, [formData?.documents, updateFormData]);

  // === Fonctions pour gérer les entités liées ===
  const handleStructureChange = useCallback((structure) => {
    updateFormData({
      structureId: structure?.id || null,
      structure: structure || null
    });
  }, [updateFormData]);

  const handleManagerChange = useCallback((manager) => {
    updateFormData({
      managerId: manager?.id || null,
      manager: manager || null
    });
  }, [updateFormData]);

  return {
    // Base du hook générique
    ...detailsHook,
    
    // Renommage des propriétés pour l'API publique
    artiste: detailsHook.entity,
    isSubmitting: detailsHook.isSaving,
    hasChanges: detailsHook.isDirty,
    
    // Fonctionnalités spécifiques aux artistes
    addGenreMusique,
    removeGenreMusique,
    addTypeSpectacle,
    removeTypeSpectacle,
    addMembre,
    updateMembre,
    removeMembre,
    addReseauSocial,
    updateReseauSocial,
    removeReseauSocial,
    addDocument,
    removeDocument,
    handleStructureChange,
    handleManagerChange,
    
    // Accès simplifié aux entités liées
    structure: detailsHook.relatedData?.structure || null,
    loadingStructure: detailsHook.loadingRelated?.structure || false,
    manager: detailsHook.relatedData?.manager || null,
    loadingManager: detailsHook.loadingRelated?.manager || false,
    concerts: detailsHook.relatedData?.concerts || [],
    loadingConcerts: detailsHook.loadingRelated?.concerts || false
  };
};

export default useArtisteDetailsOptimized;