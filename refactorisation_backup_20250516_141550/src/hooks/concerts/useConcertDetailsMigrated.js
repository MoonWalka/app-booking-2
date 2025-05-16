// src/hooks/concerts/useConcertDetailsMigrated.js
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

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
 * Version améliorée pour bénéficier des corrections de stabilité du hook générique
 * 
 * @param {string} id - ID du concert
 * @param {object} locationParam - Objet location de React Router (optionnel)
 * @returns {object} - API du hook
 */
const useConcertDetailsMigrated = (id, locationParam) => {
  console.log(`[useConcertDetailsV2] init: id=${id}, location=${locationParam?.pathname || 'n/a'}`);
  console.log("[useConcertDetailsMigrated] Hook appelé. ID:", id, "Type ID:", typeof id);
  
  const navigate = useNavigate();
  const locationData = useLocation();
  const location = locationParam || locationData;
  
  // États spécifiques au concert qui ne sont pas gérés par le hook générique
  const [cacheKey, setCacheKey] = useState(getCacheKey(id));
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);
  const [initialStructureId, setInitialStructureId] = useState(null);
  const [initialLieuId, setInitialLieuId] = useState(null);
  
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
  
  console.log("[useConcertDetailsMigrated] Configuration des entités liées:", relatedEntities);
  
  // Fonction pour transformer les données du concert
  const transformConcertData = useCallback((data) => {
    console.log("[useConcertDetailsMigrated] transformConcertData appelé avec:", data);
    
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
    
    if (data.lieuId) {
      setInitialLieuId(data.lieuId);
    }
    
    return data;
  }, []);
  
  // Fonction pour valider le formulaire de concert
  const validateConcertForm = useCallback((formData) => {
    const errors = {};
    
    if (!formData.date) errors.date = 'La date est obligatoire';
    if (!formData.montant) errors.montant = 'Le montant est obligatoire';
    if (!formData.lieuId) errors.lieuId = 'Le lieu est obligatoire';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);
  
  // Fonction pour formater les valeurs d'affichage
  const formatConcertValue = useCallback((field, value) => {
    if (field === 'date') return formatDate(value);
    if (field === 'montant') return formatMontant(value);
    return value;
  }, []);
  
  // Callbacks pour les événements de sauvegarde et suppression
  const handleSaveSuccess = useCallback((data) => {
    console.log("[useConcertDetailsMigrated] handleSaveSuccess appelé avec:", data);
    
    // Mettre à jour les IDs initiaux pour la prochaine édition
    setInitialProgrammateurId(data.programmateurId || null);
    setInitialArtisteId(data.artisteId || null);
    setInitialStructureId(data.structureId || null);
    setInitialLieuId(data.lieuId || null);
    
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
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de mise à jour', e);
    }
    
    // Charger les données du formulaire si nécessaire
    concertForms.fetchFormData(data);
  }, [id, concertForms]);
  
  const handleDeleteSuccess = useCallback(() => {
    console.log("[useConcertDetailsMigrated] handleDeleteSuccess appelé");
    
    // Notifier les autres composants
    try {
      const event = new CustomEvent('concertDeleted', { detail: { id } });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de suppression', e);
    }
    
    navigate('/concerts');
  }, [id, navigate]);
  
  // Vérification de permission pour la suppression
  const checkDeletePermission = useCallback(async () => {
    // Ajouter des vérifications spécifiques aux concerts ici si nécessaire
    return true;
  }, []);
  
  // Utilisation de useGenericEntityDetails avec les améliorations
  const genericDetails = useGenericEntityDetails({
    entityType: 'concert',
    collectionName: 'concerts',
    id,
    initialMode: 'view',  // assurer mode consultation par défaut
    relatedEntities,
    autoLoadRelated: true, // Activer le chargement automatique des entités liées
    transformData: transformConcertData,
    validateFormFn: validateConcertForm,
    formatValue: formatConcertValue,
    checkDeletePermission,
    onSaveSuccess: handleSaveSuccess,
    onDeleteSuccess: handleDeleteSuccess,
    navigate,
    returnPath: '/concerts',
    // editPath non nécessaire ici pour éviter forçage du mode édition
    // Options avancées
    useDeleteModal: true,
    // Utilisation de la nouvelle option pour gérer le cache
    disableCache: false
  });
  
  console.log('[useConcertDetailsV2] after useGenericEntityDetails:', {
    loading: genericDetails.loading,
    entity: genericDetails.entity,
    error: genericDetails.error
  });
  console.log("[useConcertDetailsMigrated] État retourné par useGenericEntityDetails:", {
    entité: genericDetails.entity,
    chargement: genericDetails.loading,
    erreur: genericDetails.error,
    isEditing: genericDetails.isEditing,
    id: genericDetails.id
  });
  
  // Fonction pour récupérer les entités nécessaires aux relations bidirectionnelles
  const fetchRelatedEntities = useCallback(async () => {
    if (!genericDetails.entity || !id) {
      return false;
    }
    
    const relatedData = genericDetails.relatedData || {};
    const entityData = genericDetails.entity;
    const results = {};
    const promises = [];
    
    // Programmateur
    if (relatedData.programmateur?.id || initialProgrammateurId) {
      const programmateurId = relatedData.programmateur?.id || initialProgrammateurId;
      if (programmateurId) {
        promises.push(
          (async () => {
            try {
              const docRef = doc(db, 'programmateurs', programmateurId);
              const docSnap = await getDoc(docRef);
              results.programmateur = docSnap.exists() ? { id: programmateurId, ...docSnap.data() } : null;
            } catch (error) {
              console.error("Erreur lors du chargement du programmateur:", error);
              results.programmateur = null;
            }
          })()
        );
      }
    }
  
    // Artiste
    if (relatedData.artiste?.id || initialArtisteId) {
      const artisteId = relatedData.artiste?.id || initialArtisteId;
      if (artisteId) {
        promises.push(
          (async () => {
            try {
              const docRef = doc(db, 'artistes', artisteId);
              const docSnap = await getDoc(docRef);
              results.artiste = docSnap.exists() ? { id: artisteId, ...docSnap.data() } : null;
            } catch (error) {
              console.error("Erreur lors du chargement de l'artiste:", error);
              results.artiste = null;
            }
          })()
        );
      }
    }
  
    // Structure
    if (relatedData.structure?.id || initialStructureId) {
      const structureId = relatedData.structure?.id || initialStructureId;
      if (structureId) {
        promises.push(
          (async () => {
            try {
              const docRef = doc(db, 'structures', structureId);
              const docSnap = await getDoc(docRef);
              results.structure = docSnap.exists() ? { id: structureId, ...docSnap.data() } : null;
            } catch (error) {
              console.error("Erreur lors du chargement de la structure:", error);
              results.structure = null;
            }
          })()
        );
      }
    }
  
    // Lieu
    if (relatedData.lieu?.id || initialLieuId) {
      const lieuId = relatedData.lieu?.id || initialLieuId;
      if (lieuId) {
        promises.push(
          (async () => {
            try {
              const docRef = doc(db, 'lieux', lieuId);
              const docSnap = await getDoc(docRef);
              results.lieu = docSnap.exists() ? { id: lieuId, ...docSnap.data() } : null;
            } catch (error) {
              console.error("Erreur lors du chargement du lieu:", error);
              results.lieu = null;
            }
          })()
        );
      }
    }
  
    // Attendre que toutes les promesses se terminent
    await Promise.all(promises);
    return results;
  }, [id, genericDetails, initialProgrammateurId, initialArtisteId, initialStructureId, initialLieuId]);
  
  // Fonction pour gérer les mises à jour des relations bidirectionnelles
  const handleBidirectionalUpdates = useCallback(async () => {
    // Définir explicitement entityData et relationData à partir de genericDetails
    const entityData = genericDetails.entity;
    const relationData = genericDetails.relatedData;
    
    if (!entityData || !id) return;
    
    try {
      console.log("[useConcertDetailsMigrated] Démarrage des mises à jour bidirectionnelles");
      
      // Créer un tableau de promesses pour exécuter les mises à jour en parallèle
      const updatePromises = [];
      
      // Mise à jour des relations bidirectionnelles pour le programmateur
      if (relationData?.programmateur?.id || initialProgrammateurId) {
        updatePromises.push(
          concertAssociations.updateProgrammateurAssociation(
            id,
            entityData,
            relationData?.programmateur?.id || null,
            initialProgrammateurId,
            relationData?.lieu
          )
        );
      }
      
      // Mise à jour des relations bidirectionnelles pour l'artiste
      if (relationData?.artiste?.id || initialArtisteId) {
        updatePromises.push(
          concertAssociations.updateArtisteAssociation(
            id,
            entityData,
            relationData?.artiste?.id || null,
            initialArtisteId,
            relationData?.lieu
          )
        );
      }
      
      // Mise à jour des relations bidirectionnelles pour la structure
      if (relationData?.structure?.id || initialStructureId) {
        updatePromises.push(
          concertAssociations.updateStructureAssociation(
            id,
            entityData,
            relationData?.structure?.id || null,
            initialStructureId,
            relationData?.lieu
          )
        );
      }
      
      // Mise à jour des relations bidirectionnelles pour le lieu
      if (relationData?.lieu?.id || initialLieuId) {
        updatePromises.push(
          concertAssociations.updateLieuAssociation(
            id,
            entityData,
            relationData?.lieu?.id || null,
            initialLieuId
          )
        );
      }
      
      // Attendre que toutes les mises à jour soient terminées
      await Promise.all(updatePromises);
      console.log("[useConcertDetailsMigrated] Mises à jour bidirectionnelles terminées avec succès");
    } catch (error) {
      console.error("[useConcertDetailsMigrated] Erreur lors des mises à jour bidirectionnelles:", error);
      throw error; // Propager l'erreur pour la gestion en amont
    }
  }, [id, genericDetails, initialProgrammateurId, initialArtisteId, initialStructureId, initialLieuId, concertAssociations]);
  
  // Extension de handleSubmit pour gérer les relations bidirectionnelles
  const handleSubmitWithRelations = useCallback(async (e) => {
    console.log("[useConcertDetailsMigrated] handleSubmitWithRelations appelé");
    
    if (e && e.preventDefault) e.preventDefault();
    
    // D'abord soumettre le formulaire via le hook générique
    await genericDetails.handleSubmit(e);
    
    // Puis gérer les relations bidirectionnelles
    await handleBidirectionalUpdates();
  }, [genericDetails.handleSubmit, handleBidirectionalUpdates]);

  // Override toggleEditMode to navigate on entering edit
  const wrappedToggleEditMode = useCallback(() => {
    if (genericDetails.isEditing) {
      genericDetails.toggleEditMode();
    } else {
      navigate(`/concerts/${id}/edit`);
    }
  }, [genericDetails, id, navigate]);

  // Effet pour mettre à jour les relations bidirectionnelles au chargement initial
  useEffect(() => {
    // Vérifier que l'entité est chargée et que tous les hooks dépendants sont prêts
    if (genericDetails.entity && !genericDetails.loading && concertAssociations) {
      console.log("[useConcertDetailsMigrated] useEffect pour relations bidirectionnelles déclenché");
      
      // Créer une fonction asynchrone à l'intérieur de l'effet
      const updateBidirectionalRelations = async () => {
        try {
          console.log("[useConcertDetailsMigrated] Démarrage de la mise à jour des relations bidirectionnelles");
          // Attendre que toutes les entités soient chargées
          const entitiesLoaded = await fetchRelatedEntities();
          console.log("[useConcertDetailsMigrated] Entités chargées pour les relations bidirectionnelles:", entitiesLoaded);
          
          // Effectuer les mises à jour bidirectionnelles
          await handleBidirectionalUpdates();
          console.log("[useConcertDetailsMigrated] Mise à jour des relations bidirectionnelles terminée avec succès");
        } catch (error) {
          console.error("[useConcertDetailsMigrated] Erreur lors de la mise à jour des relations bidirectionnelles:", error);
        }
      };
      
      // Exécuter la fonction asynchrone
      updateBidirectionalRelations();
    }
  }, [genericDetails.entity, genericDetails.loading, handleBidirectionalUpdates, concertAssociations, fetchRelatedEntities]);
  
  // Fonction pour forcer le rafraîchissement des données
  const refreshConcert = useCallback(async () => {
    console.log("[useConcertDetailsMigrated] refreshConcert appelé");
    
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
  useEffect(() => {
    if (location) {
      const queryParams = new URLSearchParams(location.search || '');
      const shouldOpenFormGenerator = queryParams.get('openFormGenerator') === 'true';
      if (shouldOpenFormGenerator) {
        concertForms.setShowFormGenerator(true);
      }
    }
  }, [location, concertForms.setShowFormGenerator]);

  const returnValues = {
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
    toggleEditMode: wrappedToggleEditMode,
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
    lieuSearch: {
      selectedEntity: genericDetails.relatedData.lieu,
      setSelectedEntity: (lieu) => genericDetails.setRelatedEntity('lieu', lieu),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    programmateurSearch: {
      selectedEntity: genericDetails.relatedData.programmateur,
      setSelectedEntity: (prog) => genericDetails.setRelatedEntity('programmateur', prog),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    artisteSearch: {
      selectedEntity: genericDetails.relatedData.artiste,
      setSelectedEntity: (artiste) => genericDetails.setRelatedEntity('artiste', artiste),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    structureSearch: {
      selectedEntity: genericDetails.relatedData.structure,
      setSelectedEntity: (structure) => genericDetails.setRelatedEntity('structure', structure),
      setSearchTerm: () => {} // Stub pour compatibilité
    }
  };

  console.log("[useConcertDetailsMigrated] Retourne: (résumé)", {
    concert: returnValues.concert?.id,
    isEditMode: returnValues.isEditMode,
    loading: returnValues.loading,
    relatedData: {
      lieu: returnValues.lieu?.id,
      programmateur: returnValues.programmateur?.id, 
      artiste: returnValues.artiste?.id,
      structure: returnValues.structure?.id
    }
  });
  
  return returnValues;
};

export default useConcertDetailsMigrated;