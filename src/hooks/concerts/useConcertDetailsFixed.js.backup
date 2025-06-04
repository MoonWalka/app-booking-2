// src/hooks/concerts/useConcertDetailsFixed.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import du hook générique
import { useGenericEntityDetails } from '@/hooks/common';

// Import des hooks personnalisés spécifiques aux concerts
import useConcertStatus from '@/hooks/concerts/useConcertStatus';
import useConcertFormsManagement from '@/hooks/concerts/useConcertFormsManagement';
import useConcertAssociations from '@/hooks/concerts/useConcertAssociations';

// Import des utilitaires
import { formatDate, formatMontant, isDatePassed, copyToClipboard, getCacheKey } from '@/utils/formatters';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook pour gérer les détails et l'édition d'un concert
 * Version CORRIGÉE sans boucles infinies
 * 
 * @param {string} id - ID du concert
 * @param {object} locationParam - Paramètre de location (optionnel)
 * @returns {object} - API du hook
 */
const useConcertDetailsFixed = (id, locationParam) => {
  
  // 🔒 PROTECTION ANTI-BOUCLES: États et références stables
  const navigate = useNavigate();
  const locationData = useLocation();
  const location = locationParam || locationData;
  
  // État pour suivre le chargement initial
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [relatedEntitiesLoaded, setRelatedEntitiesLoaded] = useState(false);
  
  // Détecter le mode édition basé sur l'URL
  const isEditMode = useMemo(() => {
    return location?.pathname?.includes('/edit') || false;
  }, [location?.pathname]);
  
  // États spécifiques
  const [cacheKey] = useState(() => getCacheKey(id));
  
  // Configuration pour les entités liées - Stabilisée avec useMemo
  const relatedEntities = useMemo(() => [
    {
      name: 'lieu',
      collection: 'lieux',
      idField: 'lieuId',
      alternativeIdFields: ['lieu'],
      nameField: 'lieuNom',
      type: 'one-to-one',
      essential: true
    },
    {
      name: 'programmateur',
      collection: 'programmateurs',
      idField: 'programmateurId',
      alternativeIdFields: ['programmateur'],
      nameField: 'programmateurNom',
      type: 'one-to-one',
      essential: true
    },
    {
      name: 'artiste',
      collection: 'artistes',
      idField: 'artisteId',
      alternativeIdFields: ['artiste'],
      nameField: 'artisteNom',
      type: 'one-to-one',
      essential: true
    },
    {
      name: 'structure',
      collection: 'structures',
      idField: 'structureId',
      alternativeIdFields: ['structure'],
      nameField: 'structureNom',
      type: 'custom', // Type custom pour charger via le programmateur
      essential: true // La structure est essentielle pour debug
    }
  ], []);
  
  // DEBUG: Log de diagnostic pour useConcertDetailsFixed
  console.log('🔍🔍🔍 DIAGNOSTIC useConcertDetailsFixed HOOK 🔍🔍🔍');
  console.log('Hook useConcertDetailsFixed appelé pour ID:', id);
  console.log('isEditMode:', isEditMode);
  
  // Configuration pour useGenericEntityDetails
  const genericDetailsConfig = useMemo(() => {
    const config = {
      entityType: 'concert',
      collectionName: 'concerts',
      id,
      relatedEntities,
      additionalData: {},
      isEditMode,
      autoLoadRelated: true,
      cacheKey,
      onError: (error) => {
        console.error('[useConcertDetailsFixed] Erreur:', error);
      },
      // Ajouter les customQueries pour la structure
      customQueries: {
        structure: async (concertData) => {
          console.log('🏢 Structure customQuery appelée avec concertData:', concertData);
          debugLog('[useConcertDetailsFixed] customQuery structure appelée', 'info', 'useConcertDetailsFixed');
          
          // D'abord vérifier si le concert a directement un structureId
          if (concertData.structureId) {
            try {
              const { doc, getDoc, db } = await import('@/services/firebase-service');
              const structureDoc = await getDoc(doc(db, 'structures', concertData.structureId));
              if (structureDoc.exists()) {
                const result = { id: structureDoc.id, ...structureDoc.data() };
                console.log('🏢 Structure trouvée directement:', result);
                return result;
              }
            } catch (err) {
              console.error('Erreur lors du chargement direct de la structure:', err);
            }
          }
          
          // Sinon, charger via le programmateur
          const programmateurId = concertData.programmateurId;
          if (!programmateurId) {
            console.log('🏢 Pas de programmateur, pas de structure');
            debugLog('[useConcertDetailsFixed] Pas de programmateur, pas de structure', 'info', 'useConcertDetailsFixed');
            return null;
          }
          
          try {
            const { doc, getDoc, db } = await import('@/services/firebase-service');
            const programmateurDoc = await getDoc(doc(db, 'programmateurs', programmateurId));
            
            if (!programmateurDoc.exists()) {
              console.log('🏢 Programmateur non trouvé');
              debugLog('[useConcertDetailsFixed] Programmateur non trouvé', 'warn', 'useConcertDetailsFixed');
              return null;
            }
            
            const programmateurData = programmateurDoc.data();
            if (!programmateurData.structureId) {
              console.log('🏢 Programmateur sans structure');
              debugLog('[useConcertDetailsFixed] Programmateur sans structure', 'info', 'useConcertDetailsFixed');
              return null;
            }
            
            // Charger la structure du programmateur
            const structureDoc = await getDoc(doc(db, 'structures', programmateurData.structureId));
            if (structureDoc.exists()) {
              const result = { id: structureDoc.id, ...structureDoc.data() };
              console.log('🏢 Structure trouvée via programmateur:', result);
              debugLog('[useConcertDetailsFixed] Structure trouvée via programmateur', 'info', 'useConcertDetailsFixed');
              return result;
            }
            
            console.log('🏢 Structure du programmateur non trouvée');
            return null;
          } catch (err) {
            console.error('🏢 Erreur lors du chargement de la structure via programmateur:', err);
            return null;
          }
        }
      }
    };
    
    // DEBUG: Vérifier la configuration avant de la retourner
    console.log('📋📋📋 CONFIG FINALE useConcertDetailsFixed 📋📋📋');
    console.log('Config.customQueries:', config.customQueries);
    console.log('Config.customQueries keys:', Object.keys(config.customQueries || {}));
    console.log('Type de config.customQueries:', typeof config.customQueries);
    
    return config;
  }, [id, relatedEntities, isEditMode, cacheKey]);
  
  // Hook générique avec configuration stable
  const genericDetails = useGenericEntityDetails(genericDetailsConfig);
  
  // Hooks secondaires
  const concertForms = useConcertFormsManagement(id);
  const concertStatus = useConcertStatus();
  const concertAssociations = useConcertAssociations();
  
  // Fonction pour charger les entités liées une seule fois
  const loadRelatedEntities = useCallback(async () => {
    if (relatedEntitiesLoaded || !genericDetails.entity || genericDetails.loading) {
      return;
    }
    
    try {
      debugLog('[useConcertDetailsFixed] Chargement des entités liées', 'info');
      
      // Charger toutes les entités liées
      if (genericDetails.loadAllRelatedEntities) {
        await genericDetails.loadAllRelatedEntities(genericDetails.entity);
      }
      
      setRelatedEntitiesLoaded(true);
    } catch (error) {
      console.error('[useConcertDetailsFixed] Erreur chargement entités:', error);
    }
  }, [genericDetails, relatedEntitiesLoaded]);
  
  // Effet pour charger les entités liées (exécuté une seule fois)
  useEffect(() => {
    if (!isInitialLoadComplete && genericDetails.entity && !genericDetails.loading) {
      loadRelatedEntities();
      setIsInitialLoadComplete(true);
    }
  }, [isInitialLoadComplete, genericDetails.entity, genericDetails.loading, loadRelatedEntities]);
  
  // Mise à jour des associations bidirectionnelles (une seule fois après le chargement)
  useEffect(() => {
    if (
      isInitialLoadComplete && 
      relatedEntitiesLoaded && 
      genericDetails.entity &&
      concertAssociations?.handleBidirectionalUpdates
    ) {
      debugLog('[useConcertDetailsFixed] Mise à jour bidirectionnelle', 'info');
      
      const updateBidirectional = async () => {
        try {
          await concertAssociations.handleBidirectionalUpdates({
            concert: genericDetails.entity,
            lieu: genericDetails.relatedData?.lieu,
            programmateur: genericDetails.relatedData?.programmateur,
            artiste: genericDetails.relatedData?.artiste,
            structure: genericDetails.relatedData?.structure
          });
        } catch (error) {
          console.error('[useConcertDetailsFixed] Erreur mise à jour bidirectionnelle:', error);
        }
      };
      
      updateBidirectional();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isInitialLoadComplete,
    relatedEntitiesLoaded,
    genericDetails.entity?.id, // Utiliser l'ID pour éviter les comparaisons d'objets
    concertAssociations
  ]);
  
  // Gestion du formulaire
  const {
    showFormGenerator = false,
    setShowFormGenerator = () => {},
    generatedFormLink = '',
    setGeneratedFormLink = () => {},
    handleFormGenerated = () => {}
  } = concertForms || {};
  
  // Gestion de la suppression
  const handleDelete = useCallback(async () => {
    if (!genericDetails?.handleDelete) return false;
    
    try {
      const result = await genericDetails.handleDelete();
      if (result) {
        navigate('/concerts');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[useConcertDetailsFixed] Erreur suppression:', error);
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genericDetails?.handleDelete, navigate]);
  
  // API stabilisée du hook
  const stableApi = useMemo(() => ({
    // Données principales
    concert: genericDetails.entity,
    lieu: genericDetails.relatedData?.lieu,
    programmateur: genericDetails.relatedData?.programmateur,
    artiste: genericDetails.relatedData?.artiste,
    structure: genericDetails.relatedData?.structure,
    
    // États
    loading: genericDetails.loading,
    error: genericDetails.error,
    isSubmitting: genericDetails.isSubmitting,
    isEditMode,
    
    // Formulaires
    formData: genericDetails.formData,
    formDataStatus: concertForms?.formDataStatus,
    showFormGenerator,
    generatedFormLink,
    setShowFormGenerator,
    setGeneratedFormLink,
    handleFormGenerated,
    
    // Actions
    handleChange: genericDetails.handleChange,
    handleSave: genericDetails.handleSave,
    handleDelete,
    setLieu: genericDetails.setLieu,
    setProgrammateur: genericDetails.setProgrammateur,
    setArtiste: genericDetails.setArtiste,
    setStructure: genericDetails.setStructure,
    
    // Utilitaires
    formatDate,
    formatMontant,
    isDatePassed,
    copyToClipboard,
    
    // Statut du concert
    ...concertStatus,
    
    // Associations
    ...concertAssociations
  }), [
    genericDetails,
    concertForms,
    concertStatus,
    concertAssociations,
    isEditMode,
    showFormGenerator,
    generatedFormLink,
    setShowFormGenerator,
    setGeneratedFormLink,
    handleFormGenerated,
    handleDelete
  ]);
  
  return stableApi;
};

export default useConcertDetailsFixed;