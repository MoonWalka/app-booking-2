// src/hooks/lieux/useLieuDetailsOptimized.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useGenericEntityDetails } from '@/hooks/common';
import { validateLieuForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'un lieu
 * Utilisation directe et simplifiée du hook générique useGenericEntityDetails
 * 
 * @param {string} id - ID du lieu à afficher/éditer
 * @returns {Object} API pour gérer les détails d'un lieu
 */
const useLieuDetailsOptimized = (id) => {
  const navigate = useNavigate();
  
  // Fonction pour formater les dates de manière cohérente
  const formatDate = (value) => value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-';
  
  // Configuration de base pour le hook générique
  const detailsHook = useGenericEntityDetails({
    // Configuration générale
    entityType: 'lieu',
    collectionName: 'lieux',
    id,
    
    // Transformation des données
    transformData: (data) => {
      if (!data) return null;
      
      return {
        ...data,
        // Champs calculés pour l'affichage
        displayName: data.nom ? `${data.nom} (${data.ville || 'Ville non spécifiée'})` : 'Lieu sans nom',
        capaciteFormatee: data.capacite ? `${data.capacite} personnes` : 'Capacité non spécifiée',
      };
    },
    
    // Formatage des valeurs pour l'affichage
    formatValue: (field, value) => {
      switch (field) {
        case 'createdAt':
        case 'updatedAt':
        case 'dateOuverture':
          return formatDate(value);
        default:
          return value;
      }
    },
    
    // Validation avant sauvegarde
    validateFormFn: validateLieuForm,
    
    // Configuration des entités liées
    relatedEntities: [
      { 
        name: 'programmateur', 
        idField: 'programmateurId', 
        collection: 'programmateurs',
        essential: true // Le programmateur est essentiel pour l'affichage du lieu
      }
    ],
    
    // Callbacks pour les opérations
    onSaveSuccess: (data) => {
      showSuccessToast(`Le lieu ${data.nom || ''} a été mis à jour avec succès`);
    },
    onSaveError: (error) => {
      console.error(`[useLieuDetailsOptimized] Erreur de sauvegarde:`, error);
      showErrorToast(`Erreur lors de la sauvegarde du lieu: ${error.message}`);
    },
    onDeleteSuccess: () => {
      showSuccessToast(`Le lieu a été supprimé avec succès`);
      navigate('/lieux');
    },
    onDeleteError: (error) => {
      console.error(`[useLieuDetailsOptimized] Erreur de suppression:`, error);
      showErrorToast(`Erreur lors de la suppression du lieu: ${error.message}`);
    },
    
    // Navigation
    navigate,
    returnPath: '/lieux',
    
    // Options avancées
    realtime: false, // Chargement ponctuel plutôt qu'en temps réel
    cacheEnabled: false, // Désactiver le cache pour toujours charger les données fraîches
    useDeleteModal: true, // Utiliser un modal pour confirmer la suppression
  });
  
  // Fonctions additionnelles spécifiques aux lieux
  
  // Gestion du programmateur
  const handleProgrammateurChange = useCallback((newProgrammateur) => {
    if (newProgrammateur) {
      detailsHook.setFormData(prev => ({
        ...prev,
        programmateurId: newProgrammateur.id,
        programmateur: {
          id: newProgrammateur.id,
          nom: newProgrammateur.nom,
          prenom: newProgrammateur.prenom
        }
      }));
    } else {
      detailsHook.setFormData(prev => ({
        ...prev,
        programmateurId: null,
        programmateur: null
      }));
    }
  }, [detailsHook]);
  
  // Mise à jour des coordonnées géographiques
  const updateCoordinates = useCallback((lat, lng) => {
    detailsHook.handleChange({
      target: {
        name: 'coordinates',
        value: { lat, lng }
      }
    });
  }, [detailsHook]);
  
  // Fonctions utilitaires pour la gestion d'équipements
  const addEquipement = useCallback((equipement) => {
    detailsHook.setFormData(prev => ({
      ...prev,
      equipements: [...(prev.equipements || []), equipement]
    }));
  }, [detailsHook]);
  
  const removeEquipement = useCallback((equipement) => {
    detailsHook.setFormData(prev => ({
      ...prev,
      equipements: (prev.equipements || []).filter(e => e !== equipement)
    }));
  }, [detailsHook]);
  
  // Retourner les fonctionnalités combinées
  return {
    // Base du hook générique
    ...detailsHook,
    
    // Fonctionnalités spécifiques aux lieux
    handleProgrammateurChange,
    updateCoordinates,
    addEquipement,
    removeEquipement,
    
    // Raccourcis pour une meilleure expérience développeur
    lieu: detailsHook.entity,
    loading: detailsHook.loading,
    error: detailsHook.error,
    isEditing: detailsHook.isEditing,
    formData: detailsHook.formData,
    hasChanges: detailsHook.isDirty
  };
};

export default useLieuDetailsOptimized;