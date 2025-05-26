// src/hooks/concerts/useConcertDetails.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, db } from '@/services/firebase-service';

// Import du hook générique
import { useGenericEntityDetails } from '@/hooks/common';

// Import des hooks personnalisés spécifiques aux concerts
import useConcertStatus from '@/hooks/concerts/useConcertStatus';
import useConcertFormsManagement from '@/hooks/concerts/useConcertFormsManagement';
import useConcertAssociations from '@/hooks/concerts/useConcertAssociations';

// Import des utilitaires
import { formatDate, formatMontant, isDatePassed, copyToClipboard, getCacheKey } from '@/utils/formatters';

/**
 * Hook optimisé pour les détails de concert
 * Suit les directives de standardisation et utilise directement useGenericEntityDetails
 * 
 * @param {string} id - ID du concert
 * @param {object} locationParam - Objet location de React Router (optionnel)
 * @returns {object} - API du hook
 */
const useConcertDetails = (id, locationParam) => {
  
  const navigate = useNavigate();
  const locationData = useLocation();
  const location = locationParam || locationData;
  
  // États spécifiques au concert qui ne sont pas gérés par le hook générique
  const [cacheKey, setCacheKey] = useState(getCacheKey(id)); // NOUVEAU: Cache intelligent finalisé
  const [initialProgrammateurId, setInitialProgrammateurId] = useState(null);
  const [initialArtisteId, setInitialArtisteId] = useState(null);
  const [initialStructureId, setInitialStructureId] = useState(null);
  const [initialLieuId, setInitialLieuId] = useState(null);
  
  // Guard pour éviter la double exécution des effets en StrictMode
  const bidirectionalUpdatesRef = useRef(false);
  
  // Hooks personnalisés spécifiques aux concerts
  const concertForms = useConcertFormsManagement(id);
  const concertStatus = useConcertStatus(); // NOUVEAU: Système de statuts avancé finalisé
  const concertAssociations = useConcertAssociations();
  
  // Configuration pour les entités liées
  const relatedEntities = [
    {
      name: 'lieu',
      collection: 'lieux',
      idField: 'lieuId',
      nameField: 'lieuNom',
      type: 'one-to-one',
      essential: true // Le lieu est essentiel pour l'affichage du concert
    },
    {
      name: 'programmateur',
      collection: 'programmateurs',
      idField: 'programmateurId',
      nameField: 'programmateurNom',
      type: 'one-to-one',
      essential: true // Le programmateur est essentiel pour l'affichage du concert
    },
    {
      name: 'artiste',
      collection: 'artistes',
      idField: 'artisteId',
      nameField: 'artisteNom',
      type: 'one-to-one',
      essential: false // L'artiste peut être chargé à la demande
    },
    {
      name: 'structure',
      collection: 'structures',
      idField: 'structureId',
      nameField: 'structureNom',
      type: 'one-to-one',
      essential: false // La structure peut être chargée à la demande
    }
  ];
  
  // Fonction pour transformer les données du concert
  const transformConcertData = useCallback((data) => {
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
  
  // Utilisation de useGenericEntityDetails avec les améliorations
  // debugLog(`🎵 CONCERT_DETAILS: Appel de useGenericEntityDetails avec id: ${id}`, 'info', 'useConcertDetails');
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
    checkDeletePermission: async () => true,
    onSaveSuccess: null, // Sera défini ci-dessous
    onDeleteSuccess: null, // Sera défini ci-dessous
    navigate,
    returnPath: '/concerts',
    editPath: `/concerts/${id}/edit`, // Ajout du chemin d'édition
    // Options avancées
    useDeleteModal: true,
    disableCache: false,
    realtime: false // Explicitement désactiver le mode temps réel
  });
  
  // debugLog(`📊 CONCERT_DETAILS: genericDetails retourné - entity: ${genericDetails?.entity ? 'PRÉSENT' : 'NULL'}, loading: ${genericDetails?.loading}, error: ${genericDetails?.error ? 'PRÉSENT' : 'NULL'}`, 'info', 'useConcertDetails');
  // debugLog(`📊 CONCERT_DETAILS: Détail entity: ${JSON.stringify(genericDetails?.entity)}`, 'debug', 'useConcertDetails');
  
  // Callbacks pour les événements de sauvegarde et suppression
  // Défini après l'initialisation de genericDetails pour pouvoir l'utiliser dans la dépendance
  const handleSaveSuccess = useCallback((data) => {
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
    // Notifier les autres composants
    try {
      const event = new CustomEvent('concertDeleted', { detail: { id } });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de suppression', e);
    }
    navigate('/concerts');
  }, [id, navigate]);
  
  // Mettre à jour les callbacks dans genericDetails - UTILISATION DE SETTER POUR ÉVITER MUTATION
  const updateGenericDetailsOptions = useCallback(() => {
    if (genericDetails && genericDetails.updateOptions) {
      // console.log('[LOG][useConcertDetails] genericDetails initialisé, handleDelete:', typeof genericDetails.handleDelete);
      genericDetails.updateOptions({
        onSaveSuccess: handleSaveSuccess,
        onDeleteSuccess: handleDeleteSuccess
      });
    }
  }, [genericDetails, handleSaveSuccess, handleDeleteSuccess]);

  useEffect(() => {
    updateGenericDetailsOptions();
  }, [updateGenericDetailsOptions]);
  
  // Fonction pour gérer les mises à jour des relations bidirectionnelles
  const handleBidirectionalUpdates = useCallback(async () => {
    const { entity, relatedData } = genericDetails || {};
    
    if (!entity || !genericDetails) return;
    
    try {
      
      // Créer un tableau de promesses pour exécuter les mises à jour en parallèle
      const updatePromises = [];
      
      // Mise à jour des relations bidirectionnelles
      if (relatedData.programmateur?.id || initialProgrammateurId) {
        updatePromises.push(
          concertAssociations.updateProgrammateurAssociation(
            id,
            entity,
            relatedData.programmateur?.id || null,
            initialProgrammateurId,
            relatedData.lieu
          )
        );
      }
      
      if (relatedData.artiste?.id || initialArtisteId) {
        updatePromises.push(
          concertAssociations.updateArtisteAssociation(
            id,
            entity,
            relatedData.artiste?.id || null,
            initialArtisteId,
            relatedData.lieu
          )
        );
      }
      
      if (relatedData.structure?.id || initialStructureId) {
        updatePromises.push(
          concertAssociations.updateStructureAssociation(
            id,
            entity,
            relatedData.structure?.id || null,
            initialStructureId,
            relatedData.lieu
          )
        );
      }
      
      // Ajout de la gestion des relations bidirectionnelles pour les lieux
      if (relatedData.lieu?.id || initialLieuId) {
        updatePromises.push(
          concertAssociations.updateLieuAssociation(
            id, 
            entity,
            relatedData.lieu?.id || null,
            initialLieuId
          )
        );
      }
      
      // Attendre que toutes les mises à jour soient terminées
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("[useConcertDetails] Erreur lors des mises à jour bidirectionnelles:", error);
      throw error; // Propager l'erreur pour la gestion en amont
    }
  }, [id, genericDetails, initialProgrammateurId, initialArtisteId, initialStructureId, initialLieuId, concertAssociations]);
  
  // Fonction pour récupérer les entités nécessaires aux relations bidirectionnelles
  const fetchRelatedEntities = useCallback(async () => {
    const { entity, relatedData } = genericDetails || {};
    if (!entity || !genericDetails) return null;
  
    // Charger toutes les entités nécessaires en parallèle
    const promises = [];
    const results = {};
  
    // Programmateur
    if (relatedData.programmateur?.id || initialProgrammateurId) {
      const progId = relatedData.programmateur?.id || initialProgrammateurId;
      if (progId) {
        promises.push(
          (async () => {
            try {
              const docRef = doc(db, 'programmateurs', progId);
              const docSnap = await getDoc(docRef);
              results.programmateur = docSnap.exists() ? { id: progId, ...docSnap.data() } : null;
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
  }, [genericDetails, initialProgrammateurId, initialArtisteId, initialStructureId, initialLieuId]);
  
  // Extension de handleSubmit pour gérer les relations bidirectionnelles
  const handleSubmitWithRelations = useCallback(async (e) => {
    if (!genericDetails) return;
    
    if (e && e.preventDefault) e.preventDefault();
    
    // D'abord soumettre le formulaire via le hook générique
    await genericDetails.handleSubmit(e);
    
    // Puis gérer les relations bidirectionnelles
    await handleBidirectionalUpdates();
  }, [genericDetails, handleBidirectionalUpdates]);
  
  // Effet pour mettre à jour les relations bidirectionnelles au chargement initial
  // SÉPARATION DES DÉPENDANCES POUR ÉVITER LA BOUCLE INFINIE
  const stableGenericDetailsRef = useRef();
  const stableConcertAssociationsRef = useRef();
  
  // Stocker les références stables
  useEffect(() => {
    if (genericDetails && genericDetails.entity && !genericDetails.loading) {
      stableGenericDetailsRef.current = {
        entity: genericDetails.entity,
        loading: genericDetails.loading
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genericDetails?.entity?.id, genericDetails?.loading]); // Dépendances spécifiques et stables

  useEffect(() => {
    if (concertAssociations) {
      stableConcertAssociationsRef.current = concertAssociations;
    }
  }, [concertAssociations]);

  useEffect(() => {
    // Guard contre l'exécution en double en StrictMode
    if (bidirectionalUpdatesRef.current) return;
    
    // Vérifier que l'entité est chargée et que tous les hooks dépendants sont prêts
    const stableGenericDetails = stableGenericDetailsRef.current;
    const stableConcertAssocs = stableConcertAssociationsRef.current;
    
    if (stableGenericDetails && stableGenericDetails.entity && !stableGenericDetails.loading && stableConcertAssocs) {
      // console.log("[useConcertDetails] useEffect pour relations bidirectionnelles déclenché");
      
      // Créer une fonction asynchrone à l'intérieur de l'effet
      const updateBidirectionalRelations = async () => {
        try {
          // Attendre que toutes les entités soient chargées
          const entitiesLoaded = await fetchRelatedEntities();
          
          // Vérifier que les entités sont bien chargées avant de procéder
          if (entitiesLoaded && Object.keys(entitiesLoaded).length > 0) {
            // Effectuer les mises à jour bidirectionnelles
            await handleBidirectionalUpdates();
            
            // Marquer comme déjà exécuté pour éviter les doubles appels
            bidirectionalUpdatesRef.current = true;
          }
        } catch (error) {
          console.error("[useConcertDetails] Erreur lors de la mise à jour des relations bidirectionnelles:", error);
        }
      };
      
      // Exécuter la fonction asynchrone
      updateBidirectionalRelations();
    }
  }, [id, fetchRelatedEntities, handleBidirectionalUpdates]); // Dépendances réduites et stables
  
  // Réinitialiser le guard si l'ID change
  useEffect(() => {
    bidirectionalUpdatesRef.current = false;
  }, [id]);
  
  // NOUVEAU: Fonction de refresh avec cache intelligent - Finalisation intelligente
  const refreshConcert = useCallback(async () => {
    
    // Invalider le cache actuel
    const newCacheKey = getCacheKey(id, Date.now());
    setCacheKey(newCacheKey);
    
    // NOUVEAU: Notifier le système de cache du changement
    try {
      const cacheEvent = new CustomEvent('concertCacheRefresh', {
        detail: {
          concertId: id,
          oldCacheKey: cacheKey,
          newCacheKey: newCacheKey,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(cacheEvent);
      
    } catch (error) {
      console.warn('[CACHE] Erreur lors de la notification cache:', error);
    }
    
    // NOUVEAU: Forcer le rechargement des données avec nouveau cache
    if (genericDetails && genericDetails.refreshEntity) {
      await genericDetails.refreshEntity();
    }
  }, [id, cacheKey, genericDetails]);
  
  // NOUVEAU: Effet pour gérer l'invalidation automatique du cache
  useEffect(() => {
    const handleCacheInvalidation = (event) => {
      if (event.detail?.concertId === id && event.detail?.source !== 'self') {
        refreshConcert();
      }
    };
    
    window.addEventListener('concertCacheInvalidation', handleCacheInvalidation);
    return () => window.removeEventListener('concertCacheInvalidation', handleCacheInvalidation);
  }, [id, refreshConcert]);
  
  // Fonction pour obtenir les informations sur le statut et les actions requises
  const getStatusInfo = useCallback(() => {
    if (!genericDetails || !genericDetails.entity) return { message: '', actionNeeded: false };
    
    const isPastDate = isDatePassed(genericDetails.entity.date);
    const { formData: formDataConcert, formDataStatus } = concertForms || {};
    
    // NOUVEAU: Utiliser formDataStatus pour enrichir les informations
    const formStatusInfo = formDataStatus ? {
      isComplete: formDataStatus.completionRate === 100,
      hasErrors: formDataStatus.validationErrors?.length > 0,
      lastUpdate: formDataStatus.lastUpdate
    } : null;
    
    switch (genericDetails.entity.statut) {
      case 'contact':
        if (!formDataConcert) return { 
          message: 'Formulaire à envoyer', 
          actionNeeded: true, 
          action: 'form',
          formStatus: formStatusInfo
        };
        if (formDataConcert && (!formDataConcert.programmateurData && (!formDataConcert.data || Object.keys(formDataConcert.data).length === 0))) 
          return { 
            message: 'Formulaire envoyé, en attente de réponse', 
            actionNeeded: false,
            formStatus: formStatusInfo
          };
        if (formDataConcert && (formDataConcert.programmateurData || (formDataConcert.data && Object.keys(formDataConcert.data).length > 0)) && formDataConcert.status !== 'validated') 
          return { 
            message: 'Formulaire à valider', 
            actionNeeded: true, 
            action: 'validate_form',
            formStatus: formStatusInfo
          };
        if (formDataConcert && formDataConcert.status === 'validated')
          return { 
            message: 'Contrat à préparer', 
            actionNeeded: true, 
            action: 'prepare_contract',
            formStatus: formStatusInfo
          };
        return { 
          message: 'Contact établi', 
          actionNeeded: false,
          formStatus: formStatusInfo
        };
        
      case 'preaccord':
        if (formDataConcert && formDataConcert.status === 'validated')
          return { 
            message: 'Contrat à envoyer', 
            actionNeeded: true, 
            action: 'send_contract',
            formStatus: formStatusInfo
          };
        return { 
          message: 'Contrat à préparer', 
          actionNeeded: true, 
          action: 'contract',
          formStatus: formStatusInfo
        };
        
      case 'contrat':
        return { 
          message: 'Facture acompte à envoyer', 
          actionNeeded: true, 
          action: 'invoice',
          formStatus: formStatusInfo
        };
        
      case 'acompte':
        return { 
          message: 'En attente du concert', 
          actionNeeded: false,
          formStatus: formStatusInfo
        };
        
      case 'solde':
        if (isPastDate) return { 
          message: 'Concert terminé', 
          actionNeeded: false,
          formStatus: formStatusInfo
        };
        return { 
          message: 'Facture solde envoyée', 
          actionNeeded: false,
          formStatus: formStatusInfo
        };
        
      default:
        return { 
          message: 'Statut non défini', 
          actionNeeded: false,
          formStatus: formStatusInfo
        };
    }
  }, [genericDetails, concertForms]);
  
  // Fonction pour gérer l'annulation de l'édition
  const handleCancel = useCallback(() => {
    if (!genericDetails) return;
    // Utiliser la méthode handleCancel du hook générique si elle existe
    if (typeof genericDetails.handleCancel === 'function') {
      genericDetails.handleCancel();
    }
    // Réinitialiser les états spécifiques au hook si nécessaire
  }, [genericDetails]);

  // Vérifier si on doit afficher le générateur de formulaire
  useEffect(() => {
    if (location && concertForms && concertForms.setShowFormGenerator) {
      const queryParams = new URLSearchParams(location.search || '');
      const shouldOpenFormGenerator = queryParams.get('openFormGenerator') === 'true';
      if (shouldOpenFormGenerator) {
        concertForms.setShowFormGenerator(true);
      }
    }
  }, [location, concertForms]);

  // Log de debug pour vérifier que l'entité est correctement chargée
  useEffect(() => {
    if (genericDetails && genericDetails.entity) {
      // console.log("[useConcertDetails] Entité chargée:", {
      //   id: genericDetails.entity.id,
      //   titre: genericDetails.entity.titre,
      //   date: genericDetails.entity.date,
      //   isLoading: genericDetails.loading,
      //   isEditing: genericDetails.isEditing
      // });
    } else if (!genericDetails?.loading) {
      // console.warn("[useConcertDetails] Entité non disponible après chargement");
    }
  }, [genericDetails]);

  // Ajout log pour la suppression
  const handleDeleteClick = useCallback(() => {
    if (genericDetails.handleDelete) {
      genericDetails.handleDelete();
    } else {
      // console.warn('[LOG][useConcertDetails] genericDetails.handleDelete est undefined');
    }
  }, [genericDetails]);
  
  // NOUVEAU: Fonction pour générer les prochaines étapes recommandées
  const generateNextSteps = useCallback((entity, formData, formStatus, isPastDate) => {
    const steps = [];
    
    if (!entity) return steps;
    
    switch (entity.statut) {
      case 'contact':
        if (!formData) {
          steps.push({
            action: 'create_form',
            priority: 'high',
            description: 'Créer et envoyer le formulaire de contact',
            estimatedTime: '15 min'
          });
        } else if (formStatus?.completionRate < 100) {
          steps.push({
            action: 'complete_form',
            priority: 'medium',
            description: `Compléter le formulaire (${formStatus.completionRate}% terminé)`,
            estimatedTime: '10 min'
          });
        }
        break;
        
      case 'preaccord':
        steps.push({
          action: 'prepare_contract',
          priority: 'high',
          description: 'Préparer le contrat de prestation',
          estimatedTime: '30 min'
        });
        break;
        
      case 'contrat':
        steps.push({
          action: 'send_invoice',
          priority: 'high',
          description: 'Envoyer la facture d\'acompte',
          estimatedTime: '10 min'
        });
        break;
        
      case 'acompte':
        if (!isPastDate) {
          steps.push({
            action: 'prepare_concert',
            priority: 'medium',
            description: 'Préparer les détails du concert',
            estimatedTime: '20 min'
          });
        }
        break;
        
      default:
        // Aucune action spécifique pour les statuts non reconnus
        break;
    }
    
    return steps;
  }, []);
  
  // NOUVEAU: Fonction pour générer des recommandations intelligentes
  const generateRecommendations = useCallback((entity, formAnalysis, statusAnalysis) => {
    const recommendations = [];
    
    if (!entity) return recommendations;
    
    // Recommandations basées sur l'analyse des formulaires
    if (formAnalysis?.missingFields?.length > 0) {
      recommendations.push({
        type: 'form_completion',
        priority: 'medium',
        message: `${formAnalysis.missingFields.length} champs manquants dans le formulaire`,
        action: 'complete_missing_fields'
      });
    }
    
    // Recommandations basées sur l'analyse des statuts
    if (statusAnalysis?.risks?.length > 0) {
      statusAnalysis.risks.forEach(risk => {
        recommendations.push({
          type: 'risk_mitigation',
          priority: risk.severity || 'medium',
          message: risk.description,
          action: risk.suggestedAction
        });
      });
    }
    
    // Recommandations temporelles
    const concertDate = new Date(entity.date);
    const daysUntilConcert = Math.ceil((concertDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilConcert <= 7 && entity.statut !== 'solde') {
      recommendations.push({
        type: 'urgency',
        priority: 'high',
        message: `Concert dans ${daysUntilConcert} jours - Finaliser rapidement`,
        action: 'expedite_process'
      });
    }
    
    return recommendations;
  }, []);
  
  // NOUVEAU: Fonction avancée pour obtenir les informations détaillées sur le statut
  const getAdvancedStatusInfo = useCallback(() => {
    if (!genericDetails || !genericDetails.entity) return { 
      message: '', 
      actionNeeded: false,
      statusDetails: null,
      formStatus: null,
      nextSteps: []
    };
    
    const isPastDate = isDatePassed(genericDetails.entity.date);
    const { formData: formDataConcert, formDataStatus } = concertForms || {};
    
    // NOUVEAU: Utiliser concertStatus pour des informations avancées
    const statusAnalysis = concertStatus ? {
      currentPhase: concertStatus.getCurrentPhase?.(genericDetails.entity.statut),
      progress: concertStatus.getProgress?.(genericDetails.entity.statut),
      timeline: concertStatus.getTimeline?.(genericDetails.entity),
      risks: concertStatus.getRisks?.(genericDetails.entity, isPastDate)
    } : null;
    
    // NOUVEAU: Analyser formDataStatus pour des détails précis
    const formAnalysis = formDataStatus ? {
      completionRate: formDataStatus.completionRate || 0,
      missingFields: formDataStatus.missingFields || [],
      validationErrors: formDataStatus.validationErrors || [],
      lastUpdate: formDataStatus.lastUpdate,
      submissionStatus: formDataStatus.submissionStatus
    } : null;
    
    const baseInfo = getStatusInfo();
    
    return {
      ...baseInfo,
      statusDetails: statusAnalysis,
      formStatus: formAnalysis,
      nextSteps: generateNextSteps(genericDetails.entity, formDataConcert, formDataStatus, isPastDate),
      recommendations: generateRecommendations(genericDetails.entity, formAnalysis, statusAnalysis)
    };
  }, [genericDetails, concertForms, concertStatus, getStatusInfo, generateNextSteps, generateRecommendations]);

  return {
    // Données principales du hook générique
    concert: genericDetails?.entity || null,
    lieu: genericDetails?.relatedData?.lieu || null,
    programmateur: genericDetails?.relatedData?.programmateur || null,
    artiste: genericDetails?.relatedData?.artiste || null,
    structure: genericDetails?.relatedData?.structure || null,
    loading: genericDetails?.loading || genericDetails?.isLoading || false, // Pour compatibilité
    isLoading: genericDetails?.loading || false, 
    isSubmitting: genericDetails?.isSubmitting || false,
    error: genericDetails?.error || null,
    
    // Données du formulaire
    formData: genericDetails?.formData || {},
    isEditMode: genericDetails?.isEditing || false,
    
    // Données des formulaires spécifiques aux concerts
    concertFormData: concertForms?.formData || null,
    formDataStatus: concertForms?.formDataStatus || null,
    showFormGenerator: concertForms?.showFormGenerator || false,
    setShowFormGenerator: concertForms?.setShowFormGenerator || (() => {}),
    generatedFormLink: concertForms?.generatedFormLink || '',
    setGeneratedFormLink: concertForms?.setGeneratedFormLink || (() => {}),
    
    // Fonctions de gestion génériques
    handleChange: genericDetails?.handleChange || (() => {}),
    handleSave: genericDetails?.handleSubmit || (() => {}),
    handleDelete: genericDetails?.handleDelete || (() => {}),
    handleSubmit: handleSubmitWithRelations,
    validateForm: validateConcertForm,
    handleCancel,
    
    // Fonctions spécifiques aux concerts
    handleFormGenerated: concertForms?.handleFormGenerated || (() => {}),
    validateProgrammatorForm: concertForms?.validateForm || (() => {}),
    refreshConcert,
    getStatusInfo,
    
    // Fonctions utilitaires
    copyToClipboard,
    formatDate,
    formatMontant,
    isDatePassed,
    
    // Fonctions pour la gestion des entités liées
    setLieu: (lieu) => genericDetails?.setRelatedEntity('lieu', lieu),
    setProgrammateur: (prog) => genericDetails?.setRelatedEntity('programmateur', prog),
    setArtiste: (artiste) => genericDetails?.setRelatedEntity('artiste', artiste),
    setStructure: (structure) => genericDetails?.setRelatedEntity('structure', structure),
    
    // Recherche d'entités (compatibilité avec les anciens hooks)
    lieuSearch: {
      selectedEntity: genericDetails?.relatedData?.lieu || null,
      setSelectedEntity: (lieu) => genericDetails?.setRelatedEntity('lieu', lieu),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    programmateurSearch: {
      selectedEntity: genericDetails?.relatedData?.programmateur || null,
      setSelectedEntity: (prog) => genericDetails?.setRelatedEntity('programmateur', prog),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    artisteSearch: {
      selectedEntity: genericDetails?.relatedData?.artiste || null,
      setSelectedEntity: (artiste) => genericDetails?.setRelatedEntity('artiste', artiste),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    structureSearch: {
      selectedEntity: genericDetails?.relatedData?.structure || null,
      setSelectedEntity: (structure) => genericDetails?.setRelatedEntity('structure', structure),
      setSearchTerm: () => {} // Stub pour compatibilité
    },
    handleDeleteClick,
    
    // NOUVEAU: Fonctions avancées de gestion des statuts
    getAdvancedStatusInfo,
    generateNextSteps,
    generateRecommendations,
    
    // NOUVEAU: Données de statut enrichies
    statusAnalysis: concertStatus,
    formStatusDetails: concertForms?.formDataStatus || null,
  };
};

export default useConcertDetails;