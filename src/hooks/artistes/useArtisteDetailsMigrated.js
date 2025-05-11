// src/hooks/artistes/useArtisteDetailsMigrated.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { useGenericEntityDetails } from '@/hooks/common';
import { validateArtisteForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook migré pour la gestion des détails d'un artiste
 * Utilise useGenericEntityDetails comme base tout en préservant les fonctionnalités spécifiques
 * 
 * @param {string} id - ID de l'artiste
 * @returns {Object} États et méthodes pour gérer un artiste
 */
const useArtisteDetailsMigrated = (id) => {
  const navigate = useNavigate();
  
  // Configuration des entités liées pour useGenericEntityDetails
  const relatedEntities = [
    { 
      name: 'structure', 
      collection: 'structures', 
      idField: 'structureId',
      type: 'one-to-one'
    },
    { 
      name: 'manager', 
      collection: 'managers', 
      idField: 'managerId',
      type: 'one-to-one'
    }
  ];

  // Fonction de transformation des données
  const transformData = useCallback((data) => {
    // Assurer que les tableaux sont toujours initialisés
    return {
      ...data,
      genresMusique: data.genresMusique || [],
      membres: data.membres || [],
      reseauxSociaux: data.reseauxSociaux || [],
      typesSpectacle: data.typesSpectacle || [],
      documents: data.documents || []
    };
  }, []);

  // Instanciation du hook générique avec notre configuration
  const genericHook = useGenericEntityDetails({
    entityType: 'Artiste',
    collectionName: 'artistes',
    id,
    relatedEntities,
    transformData,
    validateFormFn: validateArtisteForm,
    onSaveSuccess: () => showSuccessToast('Artiste enregistré avec succès'),
    onSaveError: (err) => showErrorToast(`Erreur lors de l'enregistrement: ${err.message}`),
    onDeleteSuccess: () => {
      showSuccessToast('Artiste supprimé avec succès');
      navigate('/artistes');
    },
    onDeleteError: (err) => showErrorToast(`Erreur lors de la suppression: ${err.message}`),
    navigate,
    returnPath: '/artistes',
    editPath: '/artistes/:id/edit',
    realtime: true // Utiliser les écouteurs temps réel pour les mises à jour
  });

  // Extraire les propriétés et méthodes dont nous avons besoin
  const { formData, updateFormData = () => {}, ...restHook } = genericHook;

  // Fonction pour mettre à jour la structure associée
  const handleStructureChange = useCallback((structure) => {
    updateFormData({
      structureId: structure?.id || null,
      structure
    });
  }, [updateFormData]);

  // Fonction pour mettre à jour le manager associé
  const handleManagerChange = useCallback((manager) => {
    updateFormData({
      managerId: manager?.id || null,
      manager
    });
  }, [updateFormData]);

  // Fonction pour ajouter un genre de musique
  const addGenreMusique = useCallback((genre) => {
    if (!genre || formData.genresMusique.includes(genre)) return;
    
    updateFormData({
      genresMusique: [...formData.genresMusique, genre]
    });
  }, [formData.genresMusique, updateFormData]);

  // Fonction pour supprimer un genre de musique
  const removeGenreMusique = useCallback((genre) => {
    updateFormData({
      genresMusique: formData.genresMusique.filter(g => g !== genre)
    });
  }, [formData.genresMusique, updateFormData]);

  // Fonction pour ajouter un type de spectacle
  const addTypeSpectacle = useCallback((type) => {
    if (!type || formData.typesSpectacle.includes(type)) return;
    
    updateFormData({
      typesSpectacle: [...formData.typesSpectacle, type]
    });
  }, [formData.typesSpectacle, updateFormData]);

  // Fonction pour supprimer un type de spectacle
  const removeTypeSpectacle = useCallback((type) => {
    updateFormData({
      typesSpectacle: formData.typesSpectacle.filter(t => t !== type)
    });
  }, [formData.typesSpectacle, updateFormData]);

  // Fonction pour ajouter un membre
  const addMembre = useCallback((membre) => {
    if (!membre.nom || !membre.role) return;
    
    const newMembre = {
      ...membre,
      id: uuidv4()
    };
    
    updateFormData({
      membres: [...formData.membres, newMembre]
    });
  }, [formData.membres, updateFormData]);

  // Fonction pour mettre à jour un membre
  const updateMembre = useCallback((membreId, updatedData) => {
    updateFormData({
      membres: formData.membres.map(membre => 
        membre.id === membreId 
          ? { ...membre, ...updatedData } 
          : membre
      )
    });
  }, [formData.membres, updateFormData]);

  // Fonction pour supprimer un membre
  const removeMembre = useCallback((membreId) => {
    updateFormData({
      membres: formData.membres.filter(membre => membre.id !== membreId)
    });
  }, [formData.membres, updateFormData]);

  // Fonction pour ajouter un réseau social
  const addReseauSocial = useCallback((reseau) => {
    if (!reseau.type || !reseau.url) return;
    
    const newReseau = {
      ...reseau,
      id: uuidv4()
    };
    
    updateFormData({
      reseauxSociaux: [...formData.reseauxSociaux, newReseau]
    });
  }, [formData.reseauxSociaux, updateFormData]);

  // Fonction pour mettre à jour un réseau social
  const updateReseauSocial = useCallback((reseauId, updatedData) => {
    updateFormData({
      reseauxSociaux: formData.reseauxSociaux.map(reseau => 
        reseau.id === reseauId 
          ? { ...reseau, ...updatedData } 
          : reseau
      )
    });
  }, [formData.reseauxSociaux, updateFormData]);

  // Fonction pour supprimer un réseau social
  const removeReseauSocial = useCallback((reseauId) => {
    updateFormData({
      reseauxSociaux: formData.reseauxSociaux.filter(reseau => reseau.id !== reseauId)
    });
  }, [formData.reseauxSociaux, updateFormData]);

  // Fonction pour ajouter un document
  const addDocument = useCallback((document) => {
    if (!document.type || !document.url) return;
    
    const newDocument = {
      ...document,
      id: uuidv4(),
      uploadedAt: new Date().toISOString()
    };
    
    updateFormData({
      documents: [...formData.documents, newDocument]
    });
  }, [formData.documents, updateFormData]);

  // Fonction pour supprimer un document
  const removeDocument = useCallback((documentId) => {
    updateFormData({
      documents: formData.documents.filter(doc => doc.id !== documentId)
    });
  }, [formData.documents, updateFormData]);

  // Retourner l'API combinée du hook
  return {
    ...restHook,
    formData,
    
    // API spécifique aux artistes
    handleStructureChange,
    handleManagerChange,
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
    removeDocument
  };
};

export default useArtisteDetailsMigrated;