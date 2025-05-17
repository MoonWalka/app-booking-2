// src/hooks/structures/useStructureDetailsMigrated.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenericEntityDetails } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook migré pour la gestion des détails d'une structure
 * Utilise useGenericEntityDetails comme base tout en préservant les fonctionnalités spécifiques
 * 
 * @param {string} id - ID de la structure
 * @returns {Object} États et méthodes pour gérer une structure
 */
const useStructureDetailsMigrated = (id) => {
  const navigate = useNavigate();
  
  // Configuration des entités liées pour useGenericEntityDetails
  const relatedEntities = [
    { 
      name: 'programmateurs', 
      collection: 'programmateurs', 
      idField: 'programmateursAssocies',
      type: 'one-to-many'
    }
  ];

  // Fonction de transformation des données
  const transformData = useCallback((data) => {
    // S'assurer que les tableaux sont toujours initialisés
    return {
      ...data,
      programmateursAssocies: data.programmateursAssocies || []
    };
  }, []);

  // Callbacks après opérations
  const onSaveSuccess = useCallback(() => {
    showSuccessToast(`La structure a été enregistrée avec succès`);
  }, []);

  const onSaveError = useCallback((error) => {
    showErrorToast(`Erreur lors de l'enregistrement de la structure: ${error.message}`);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    showSuccessToast(`La structure a été supprimée avec succès`);
    navigate('/structures');
  }, [navigate]);

  const onDeleteError = useCallback((error) => {
    showErrorToast(`Erreur lors de la suppression de la structure: ${error.message}`);
  }, []);

  // Vérification de la permission de suppression
  const checkDeletePermission = useCallback(async (structureId) => {
    // Vérifier si la structure peut être supprimée en fonction des programmateurs associés
    return true; // Pour l'instant, on autorise toujours la suppression
  }, []);

  // Formatage des valeurs pour l'affichage
  const formatFields = {
    createdAt: (value) => value ? new Date(value).toLocaleDateString() : 'Non spécifié',
    updatedAt: (value) => value ? new Date(value).toLocaleDateString() : 'Non spécifié'
  };

  // Utiliser le hook générique avec la configuration appropriée
  const genericDetails = useGenericEntityDetails({
    // Configuration de base
    entityType: 'structure',
    collectionName: 'structures',
    id,
    
    // Configuration des entités liées
    relatedEntities,
    
    // Transformateurs et validations
    transformData,
    formatValue: (field, value) => formatFields[field] ? formatFields[field](value) : value,
    checkDeletePermission,
    
    // Callbacks
    onSaveSuccess,
    onSaveError,
    onDeleteSuccess,
    onDeleteError,
    
    // Navigation
    navigate,
    returnPath: '/structures',
    editPath: '/structures/:id/edit',
  });

  // Fonction pour formater une valeur (pour compatibilité API)
  const formatValue = useCallback((value) => {
    if (value === undefined || value === null || value === '') {
      return 'Non spécifié';
    }
    return value;
  }, []);

  return {
    // Toutes les fonctionnalités du hook générique
    ...genericDetails,
    
    // Ajout de fonctionnalités spécifiques aux structures
    structure: genericDetails.entity,
    programmateurs: genericDetails.relatedData.programmateurs || [],
    loadingProgrammateurs: genericDetails.loadingRelated.programmateurs || false,
    
    // Conservation de formatValue pour compatibilité API
    formatValue
  };
};

export default useStructureDetailsMigrated;