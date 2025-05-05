// src/hooks/lieux/useLieuDetailsMigrated.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useGenericEntityDetails } from '@/hooks/common';
import { validateLieuForm } from '@/utils/validation';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook migré pour la gestion des détails d'un lieu
 * Utilise useGenericEntityDetails comme base
 * 
 * @param {string} id - ID du lieu à afficher/éditer
 * @returns {Object} API pour gérer les détails d'un lieu
 */
const useLieuDetailsMigrated = (id) => {
  const navigate = useNavigate();

  // Fonction pour formater les champs date
  const formatFields = {
    createdAt: (value) => value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-',
    updatedAt: (value) => value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-',
    dateOuverture: (value) => value ? format(new Date(value), 'PPP', { locale: fr }) : '-',
  };

  // Fonction pour transformer les données après chargement
  const transformData = (data) => {
    return {
      ...data,
      // Ajouter des champs calculés ici si besoin
      displayName: data.nom ? `${data.nom} (${data.ville || 'Ville non spécifiée'})` : 'Lieu sans nom',
      capaciteFormatee: data.capacite ? `${data.capacite} personnes` : 'Capacité non spécifiée',
    };
  };

  // Callbacks pour les opérations réussies ou en erreur
  const onSaveSuccess = useCallback((data) => {
    showSuccessToast(`Le lieu ${data.nom || ''} a été mis à jour avec succès`);
  }, []);

  const onSaveError = useCallback((error) => {
    showErrorToast(`Erreur lors de la sauvegarde du lieu: ${error.message}`);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    showSuccessToast(`Le lieu a été supprimé avec succès`);
    navigate('/lieux');
  }, [navigate]);

  const onDeleteError = useCallback((error) => {
    showErrorToast(`Erreur lors de la suppression du lieu: ${error.message}`);
  }, []);

  // Utiliser le hook générique avec la configuration appropriée
  const genericDetails = useGenericEntityDetails({
    // Configuration de base
    entityType: 'lieu',
    collectionName: 'lieux',
    id,
    
    // Configuration des entités liées
    relatedEntities: [
      { 
        name: 'programmateur', 
        idField: 'programmateurId', 
        collection: 'programmateurs' 
      }
    ],
    
    // Transformateurs et validations
    transformData,
    validateFormFn: validateLieuForm,
    formatValue: (field, value) => formatFields[field] ? formatFields[field](value) : value,
    
    // Callbacks
    onSaveSuccess,
    onSaveError,
    onDeleteSuccess,
    onDeleteError,
    
    // Navigation
    navigate,
    returnPath: '/lieux',
    editPath: '/lieux/:id/edit',
  });

  // Fonctionnalités spécifiques aux lieux
  
  // Gérer le changement de programmateur
  const handleProgrammateurChange = useCallback((newProgrammateur) => {
    if (newProgrammateur) {
      genericDetails.updateFormData({
        ...genericDetails.formData,
        programmateurId: newProgrammateur.id,
        programmateur: {
          id: newProgrammateur.id,
          nom: newProgrammateur.nom,
          prenom: newProgrammateur.prenom
        }
      });
    } else {
      genericDetails.updateFormData({
        ...genericDetails.formData,
        programmateurId: null,
        programmateur: null
      });
    }
  }, [genericDetails]);

  // Fonction pour mettre à jour les coordonnées géographiques
  const updateCoordinates = useCallback((lat, lng) => {
    genericDetails.handleChange({
      target: {
        name: 'coordinates',
        value: { lat, lng }
      }
    });
  }, [genericDetails]);

  return {
    // Toutes les fonctionnalités du hook générique
    ...genericDetails,
    
    // Fonctionnalités spécifiques
    handleProgrammateurChange,
    updateCoordinates
  };
};

export default useLieuDetailsMigrated;