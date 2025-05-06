// src/hooks/concerts/useConcertDetailsMigrated.js
import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import du hook générique
import { useGenericEntityDetails } from '@/hooks/common';

// Import des hooks personnalisés spécifiques aux concerts
import useConcertStatus from '@/hooks/concerts/useConcertStatus';
import useConcertFormsManagement from '@/hooks/concerts/useConcertFormsManagement';
import useConcertAssociations from '@/hooks/concerts/useConcertAssociations';

// Import des utilitaires
import { formatDate, formatMontant, isDatePassed, copyToClipboard, getCacheKey } from '@/utils/formatters';

/**
 * Hook de détails de concert basé sur useGenericEntityDetails
 * Conserve la compatibilité avec l'API existante tout en tirant parti du hook générique
 * 
 * @param {string} id - ID du concert
 * @param {object} locationParam - Objet location de React Router (optionnel)
 * @returns {object} - API du hook
 */
const useConcertDetailsMigrated = (id, locationParam) => {
  const navigate = useNavigate();
  const locationData = useLocation();
  const location = locationParam || locationData;
  
  // États spécifiques au concert qui ne sont pas gérés par le hook générique
  const [cacheKey, setCacheKey] = useState(getCacheKey(id));
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);
  const [initialStructureId, setInitialStructureId] = useState(null);
  
  // Hooks personnalisés spécifiques aux concerts
  const concertForms = useConcertFormsManagement(id);
  const concertStatus = useConcertStatus();
  const concertAssociations = useConcertAssociations();
  
  // Configuration pour les entités liées
  const relatedEntities = [
    {
      name: 'lieu',
      collection: 'lieux',
      idField: 'lieuId',
      nameField: 'lieuNom',
      type: 'one-to-one'
    },
    {
      name: 'programmateur',
      collection: 'programmateurs',
      idField: 'programmateurId',
      nameField: 'programmateurNom',
      type: 'one-to-one'
    },
    {
      name: 'artiste',
      collection: 'artistes',
      idField: 'artisteId',
      nameField: 'artisteNom',
      type: 'one-to-one'
    },
    {
      name: 'structure',
      collection: 'structures',
      idField: 'structureId',
      nameField: 'structureNom',
      type: 'one-to-one'
    }
  ];
  
  // Fonction pour transformer les données du concert
  const transformConcertData = (data) => {
    // Stocker les IDs initiaux pour la gestion des relations bidirectionnelles
    if (data.programmateurId) {
      setInitialProgrammateurId(data.programmateurId);
    }
    
    if (data.artisteId) {
      setInitialArtisteId(data.artisteId);
    }
    
    if (data.structureId) {
      setInitialStructureId(data.structureId);
    }
    
    return data;
  };
  
  // Fonction pour valider le formulaire de concert
  const validateConcertForm = (formData) => {
    const errors = {};
    
    if (!formData.date) errors.date = 'La date est obligatoire';
    if (!formData.montant) errors.montant = 'Le montant est obligatoire';
    if (!formData.lieuId) errors.lieuId = 'Le lieu est obligatoire';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Fonction pour formater les valeurs d'affichage
  const formatConcertValue = (field, value) => {
    if (field === 'date') return formatDate(value);
    if (field === 'montant') return formatMontant(value);
    return value;
  };
  
  // Callbacks pour les événements de sauvegarde et suppression
  const handleSaveSuccess = (id, data) => {
    console.log('Concert mis à jour avec succès:', id, data);
    
    // Mettre à jour les IDs initiaux pour la prochaine édition
    setInitialProgrammateurId(data.programmateurId || null);
    setInitialArtisteId(data.artisteId || null);
    setInitialStructureId(data.structureId || null);
    
    // Émettre un événement personnalisé pour notifier les autres composants
    try {
      const event = new CustomEvent('concertUpdated', { 
        detail: { 
          id, 
          status: data.statut,
          data: data
        } 
      });
      window.dispatchEvent(event);
      console.log('Événement concertUpdated émis pour concert', id);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de mise à jour', e);
    }
    
    // Charger les données du formulaire si nécessaire
    concertForms.fetchFormData(data);
  };
  
  const handleDeleteSuccess = (id) => {
    // Notifier les autres composants
    try {
      const event = new CustomEvent('concertDeleted', { detail: { id } });
      window.dispatchEvent(event);
      console.log('Événement concertDeleted émis pour concert', id);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de suppression', e);
    }
    
    navigate('/concerts');
  };
  
  // Vérification de permission pour la suppression
  const checkDeletePermission = async (concertData) => {
    // Ajouter des vérifications spécifiques aux concerts ici si nécessaire
    // Par exemple, vérifier si un concert passé peut être supprimé
    
    return { allowed: true };
  };
  
  // Utilisation de useGenericEntityDetails
  const genericDetails = useGenericEntityDetails({
    entityType: 'concert',
    collectionName: 'concerts',
    id,
    relatedEntities,
    transformData: transformConcertData,
    validateForm: validateConcertForm,
    formatValue: formatConcertValue,
    checkDeletePermission,
    onSaveSuccess: handleSaveSuccess,
    onDeleteSuccess: handleDeleteSuccess,
    navigate,
    returnPath: '/concerts',
    editPath: '/concerts/:id/edit',
    // Options avancées
    useDeleteModal: true
  });
  
  // Fonction pour gérer les mises à jour des relations bidirectionnelles
  const handleBidirectionalUpdates = useCallback(async () => {
    const { entity, relatedData } = genericDetails;
    
    if (!entity) return;
    
    // Mise à jour des relations bidirectionnelles
    if (relatedData.programmateur?.id || initialProgrammateurId) {
      await concertAssociations.updateProgrammateurAssociation(
        id,
        entity,
        relatedData.programmateur?.id || null,
        initialProgrammateurId,
        relatedData.lieu
      );
    }
    
    if (relatedData.artiste?.id || initialArtisteId) {
      await concertAssociations.updateArtisteAssociation(
        id,
        entity,
        relatedData.artiste?.id || null,
        initialArtisteId,
        relatedData.lieu
      );
    }
    
    if (relatedData.structure?.id || initialStructureId) {
      await concertAssociations.updateStructureAssociation(
        id,
        entity,
        relatedData.structure?.id || null,
        initialStructureId,
        relatedData.lieu
      );
    }
  }, [id, genericDetails.entity, genericDetails.relatedData, initialProgrammateurId, initialArtisteId, initialStructureId, concertAssociations]);
  
  // Extension de handleSubmit pour gérer les relations bidirectionnelles
  const handleSubmitWithRelations = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // D'abord soumettre le formulaire via le hook générique
    await genericDetails.handleSubmit(e);
    
    // Puis gérer les relations bidirectionnelles
    await handleBidirectionalUpdates();
  };
  
  // Fonction pour forcer le rafraîchissement des données
  const refreshConcert = useCallback(async () => {
    // Mise à jour du cacheKey pour éviter la mise en cache
    setCacheKey(getCacheKey(id));
    
    // Utiliser la méthode refresh du hook générique
    await genericDetails.refresh();
    
    // Actualiser les données de formulaire
    if (genericDetails.entity) {
      await concertForms.fetchFormData(genericDetails.entity);
    }
    
    // Émettre un événement personnalisé pour informer d'autres composants
    try {
      const event = new CustomEvent('concertDataRefreshed', { 
        detail: { id, timestamp: Date.now() } 
      });
      window.dispatchEvent(event);
      console.log('Événement concertDataRefreshed émis pour concert', id);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de rafraîchissement', e);
    }
  }, [id, genericDetails.refresh, genericDetails.entity, concertForms]);
  
  // Fonction pour obtenir les informations sur le statut et les actions requises
  const getStatusInfo = useCallback(() => {
    if (!genericDetails.entity) return { message: '', actionNeeded: false };
    
    const isPastDate = isDatePassed(genericDetails.entity.date);
    const { formData: formDataConcert, formDataStatus } = concertForms;
    
    switch (genericDetails.entity.statut) {
      case 'contact':
        if (!formDataConcert) return { message: 'Formulaire à envoyer', actionNeeded: true, action: 'form' };
        if (formDataConcert && (!formDataConcert.programmateurData && (!formDataConcert.data || Object.keys(formDataConcert.data).length === 0))) 
          return { message: 'Formulaire envoyé, en attente de réponse', actionNeeded: false };
        if (formDataConcert && (formDataConcert.programmateurData || (formDataConcert.data && Object.keys(formDataConcert.data).length > 0)) && formDataConcert.status !== 'validated') 
          return { message: 'Formulaire à valider', actionNeeded: true, action: 'validate_form' };
        if (formDataConcert && formDataConcert.status === 'validated')
          return { message: 'Contrat à préparer', actionNeeded: true, action: 'prepare_contract' };
        return { message: 'Contact établi', actionNeeded: false };
        
      case 'preaccord':
        if (formDataConcert && formDataConcert.status === 'validated')
          return { message: 'Contrat à envoyer', actionNeeded: true, action: 'send_contract' };
        return { message: 'Contrat à préparer', actionNeeded: true, action: 'contract' };
        
      case 'contrat':
        return { message: 'Facture acompte à envoyer', actionNeeded: true, action: 'invoice' };
        
      case 'acompte':
        return { message: 'En attente du concert', actionNeeded: false };
        
      case 'solde':
        if (isPastDate) return { message: 'Concert terminé', actionNeeded: false };
        return { message: 'Facture solde envoyée', actionNeeded: false };
        
      default:
        return { message: 'Statut non défini', actionNeeded: false };
    }
  }, [genericDetails.entity, concertForms]);
  
  // Vérifier si on doit afficher le générateur de formulaire
  useState(() => {
    if (location) {
      const queryParams = new URLSearchParams(location.search || '');
      const shouldOpenFormGenerator = queryParams.get('openFormGenerator') === 'true';
      
      if (shouldOpenFormGenerator) {
        concertForms.setShowFormGenerator(true);
      }
    }
  }, [location, concertForms]);
  
  // Adapter l'API pour maintenir la compatibilité avec l'ancien hook
  return {
    // Données principales du hook générique
    concert: genericDetails.entity,
    lieu: genericDetails.relatedData.lieu,
    programmateur: genericDetails.relatedData.programmateur,
    artiste: genericDetails.relatedData.artiste,
    structure: genericDetails.relatedData.structure,
    loading: genericDetails.loading,
    isSubmitting: genericDetails.isSubmitting,
    error: genericDetails.error,
    
    // Données du formulaire
    formState: genericDetails.formData,
    isEditMode: genericDetails.isEditing,
    
    // Données des formulaires spécifiques aux concerts
    formData: concertForms.formData,
    formDataStatus: concertForms.formDataStatus,
    showFormGenerator: concertForms.showFormGenerator,
    setShowFormGenerator: concertForms.setShowFormGenerator,
    generatedFormLink: concertForms.generatedFormLink,
    setGeneratedFormLink: concertForms.setGeneratedFormLink,
    
    // Fonctions de gestion génériques
    handleChange: genericDetails.handleChange,
    toggleEditMode: genericDetails.toggleEditMode,
    handleDelete: genericDetails.handleDelete,
    handleSubmit: handleSubmitWithRelations, // Version étendue avec gestion des relations
    validateForm: validateConcertForm,
    
    // Fonctions spécifiques aux concerts
    handleFormGenerated: concertForms.handleFormGenerated,
    validateProgrammatorForm: concertForms.validateForm,
    refreshConcert,
    getStatusInfo,
    
    // Fonctions utilitaires
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    
    // Fonctions pour la gestion des entités liées
    setLieu: (lieu) => genericDetails.setRelatedEntity('lieu', lieu),
    setProgrammateur: (prog) => genericDetails.setRelatedEntity('programmateur', prog),
    setArtiste: (artiste) => genericDetails.setRelatedEntity('artiste', artiste),
    setStructure: (structure) => genericDetails.setRelatedEntity('structure', structure),
    
    // Recherche d'entités (compatibilité avec l'ancien hook)
    // Note: ces objets sont des stubs pour maintenir la compatibilité d'API
    // Une meilleure approche serait d'utiliser useGenericEntitySearch pour ces fonctionnalités
    lieuSearch: {
      selectedEntity: genericDetails.relatedData.lieu,
      setSelectedEntity: (lieu) => genericDetails.setRelatedEntity('lieu', lieu)
    },
    programmateurSearch: {
      selectedEntity: genericDetails.relatedData.programmateur,
      setSelectedEntity: (prog) => genericDetails.setRelatedEntity('programmateur', prog)
    },
    artisteSearch: {
      selectedEntity: genericDetails.relatedData.artiste,
      setSelectedEntity: (artiste) => genericDetails.setRelatedEntity('artiste', artiste)
    },
    structureSearch: {
      selectedEntity: genericDetails.relatedData.structure,
      setSelectedEntity: (structure) => genericDetails.setRelatedEntity('structure', structure)
    }
  };
};

export default useConcertDetailsMigrated;