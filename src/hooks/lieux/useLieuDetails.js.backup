// src/hooks/lieux/useLieuDetails.js
import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useGenericEntityDetails } from '@/hooks/common';
import { showSuccessToast, showErrorToast } from '@/utils/toasts';

/**
 * Hook optimisé pour la gestion des détails d'un lieu
 * Mode lecture seule - l'édition se fait dans LieuForm (comme les concerts)
 * 
 * @param {string} id - ID du lieu à afficher
 * @param {object} locationParam - Objet location de React Router (optionnel)
 * @returns {Object} API pour gérer les détails d'un lieu
 */
const useLieuDetails = (id, locationParam) => {
  const navigate = useNavigate();
  const locationData = useLocation();
  
  // Support du paramètre locationParam optionnel (pour compatibilité future)
  // eslint-disable-next-line no-unused-vars
  const location = locationParam || locationData;
  
  // Mode lecture seule - pas d'édition dans ce composant
  const isEditMode = false;
  
  // Fonction pour formater les dates de manière cohérente
  const formatDate = useCallback((value) => {
    return value ? format(new Date(value), 'PPP à HH:mm', { locale: fr }) : '-';
  }, []);
  
  // Fonction pour transformer les données du lieu
  const transformLieuData = useCallback((data) => {
    if (!data) return null;
    
    return {
      ...data,
      // Champs calculés pour l'affichage
      displayName: data.nom ? `${data.nom} (${data.ville || 'Ville non spécifiée'})` : 'Lieu sans nom',
      capaciteFormatee: data.capacite ? `${data.capacite} personnes` : 'Capacité non spécifiée',
    };
  }, []);
  
  // Fonction pour valider le formulaire de lieu (non utilisée en mode lecture)
  const validateLieuFormData = useCallback((formData) => {
    const errors = {};
    
    if (!formData?.nom) errors.nom = 'Le nom est obligatoire';
    if (!formData?.ville) errors.ville = 'La ville est obligatoire';
    if (!formData?.adresse) errors.adresse = 'L\'adresse est obligatoire';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);
  
  // Fonction pour formater les valeurs d'affichage
  const formatLieuValue = useCallback((field, value) => {
    switch (field) {
      case 'createdAt':
      case 'updatedAt':
      case 'dateOuverture':
        return formatDate(value);
      case 'capacite':
        return value ? `${value} personnes` : 'Non spécifiée';
      default:
        return value;
    }
  }, [formatDate]);
  
  // Configuration de base pour le hook générique - MODE LECTURE SEULE
  const detailsHook = useGenericEntityDetails({
    // Configuration générale
    entityType: 'lieu',
    collectionName: 'lieux',
    id,
    initialMode: 'view', // Toujours en mode vue
    
    // Transformation des données
    transformData: transformLieuData,
    
    // Formatage des valeurs pour l'affichage
    formatValue: formatLieuValue,
    
    // Validation avant sauvegarde (non utilisée)
    validateFormFn: validateLieuFormData,
    
    // Configuration des entités liées
    relatedEntities: [
      { 
        name: 'programmateur', 
        idField: 'programmateurId', 
        collection: 'programmateurs',
        essential: true // Le programmateur est essentiel pour l'affichage du lieu
      }
    ],
    
    // Chargement automatique des entités liées
    autoLoadRelated: true,
    
    // Callbacks pour les opérations
    onSaveSuccess: (data) => {
      showSuccessToast(`Le lieu ${data.nom || ''} a été mis à jour avec succès`);
    },
    onSaveError: (error) => {
      console.error(`[useLieuDetails] Erreur de sauvegarde:`, error);
      showErrorToast(`Erreur lors de la sauvegarde du lieu: ${error.message}`);
    },
    onDeleteSuccess: () => {
      showSuccessToast(`Le lieu a été supprimé avec succès`);
      navigate('/lieux');
    },
    onDeleteError: (error) => {
      console.error(`[useLieuDetails] Erreur de suppression:`, error);
      showErrorToast(`Erreur lors de la suppression du lieu: ${error.message}`);
    },
    
    // Navigation
    navigate,
    returnPath: '/lieux',
    editPath: `/lieux/${id}/edit`, // Navigation vers LieuForm
    
    // Options avancées
    realtime: false, // Chargement ponctuel plutôt qu'en temps réel
    cacheEnabled: true, // Réactiver le cache pour de meilleures performances
    useDeleteModal: true, // Utiliser un modal pour confirmer la suppression
  });
  
  // Callbacks pour les événements de sauvegarde et suppression (comme dans useConcertDetails)
  const handleSaveSuccess = useCallback((data) => {
    // Émettre un événement personnalisé pour notifier les autres composants
    try {
      const event = new CustomEvent('lieuUpdated', { 
        detail: { 
          id, 
          data: data
        } 
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de mise à jour', e);
    }
  }, [id]);
  
  const handleDeleteSuccess = useCallback(() => {
    // Notifier les autres composants
    try {
      const event = new CustomEvent('lieuDeleted', { detail: { id } });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de suppression', e);
    }
    navigate('/lieux');
  }, [id, navigate]);
  
  // Mettre à jour les callbacks dans detailsHook
  const updateDetailsOptions = useCallback(() => {
    if (detailsHook && detailsHook.updateOptions) {
      detailsHook.updateOptions({
        onSaveSuccess: handleSaveSuccess,
        onDeleteSuccess: handleDeleteSuccess
      });
    }
  }, [detailsHook, handleSaveSuccess, handleDeleteSuccess]);

  useEffect(() => {
    updateDetailsOptions();
  }, [updateDetailsOptions]);
  
  // Fonctions de navigation (comme dans useConcertDetails)
  const handleEdit = useCallback(() => {
    navigate(`/lieux/${id}/edit`); // Navigation vers LieuForm
  }, [navigate, id]);
  
  const handleCancel = useCallback(() => {
    navigate(`/lieux/${id}`); // Retour vers la vue
  }, [navigate, id]);
  
  // Pas de handleSave car l'édition se fait dans LieuForm
  const handleSave = useCallback(async (e) => {
    console.warn('[useLieuDetails] handleSave appelé mais l\'édition se fait dans LieuForm');
  }, []);
  
  // Fonctions additionnelles spécifiques aux lieux
  
  // Gestion du programmateur
  const handleProgrammateurChange = useCallback((newProgrammateur) => {
    if (!detailsHook?.setFormData) return;
    
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
    if (!detailsHook?.handleChange) return;
    
    detailsHook.handleChange({
      target: {
        name: 'coordinates',
        value: { lat, lng }
      }
    });
  }, [detailsHook]);
  
  // Fonctions utilitaires pour la gestion d'équipements
  const addEquipement = useCallback((equipement) => {
    if (!detailsHook?.setFormData) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      equipements: [...(prev?.equipements || []), equipement]
    }));
  }, [detailsHook]);
  
  const removeEquipement = useCallback((equipement) => {
    if (!detailsHook?.setFormData) return;
    
    detailsHook.setFormData(prev => ({
      ...prev,
      equipements: (prev?.equipements || []).filter(e => e !== equipement)
    }));
  }, [detailsHook]);
  
  // Fonction pour gérer la suppression
  const handleDeleteClick = useCallback(() => {
    if (detailsHook?.handleDelete) {
      detailsHook.handleDelete();
    }
  }, [detailsHook]);
  
  // Retourner l'API du hook (comme useConcertDetails)
  return {
    // Données principales
    lieu: detailsHook?.entity || null,
    programmateur: detailsHook?.relatedData?.programmateur || null,
    loading: detailsHook?.loading || false,
    isLoading: detailsHook?.loading || false,
    isSubmitting: detailsHook?.isSubmitting || false,
    error: detailsHook?.error || null,
    
    // Données du formulaire
    formData: detailsHook?.formData || {},
    isEditMode,
    isDirty: detailsHook?.isDirty || false,
    hasChanges: detailsHook?.isDirty || false,
    errors: detailsHook?.errors || {},
    
    // États d'opérations
    isDeleting: detailsHook?.isDeleting || false,
    showDeleteModal: detailsHook?.showDeleteModal || false,
    
    // Données liées
    relatedData: detailsHook?.relatedData || {},
    loadingRelated: detailsHook?.loadingRelated || {},
    
    // Actions de base
    handleEdit,
    handleCancel,
    handleSave,
    handleChange: detailsHook?.handleChange || (() => {}),
    handleDeleteClick,
    handleCloseDeleteModal: detailsHook?.handleCancelDelete || (() => {}),
    handleConfirmDelete: detailsHook?.handleConfirmDelete || (() => {}),
    
    // Fonctions spécifiques aux lieux
    handleProgrammateurChange,
    updateCoordinates,
    addEquipement,
    removeEquipement,
    
    // Utilitaires
    formatDate,
    validateForm: validateLieuFormData,
    
    // Compatibilité avec l'ancien système - SUPPRIMÉ
    // Le système des lieux utilise maintenant la navigation vers des formulaires séparés
  };
};

export default useLieuDetails;