// src/hooks/dates/useDateDetails.js
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, db } from '@/services/firebase-service';

// Import du hook générique
import { useGenericEntityDetails } from '@/hooks/common';

// Import des hooks personnalisés spécifiques aux dates
import useDateStatus from '@/hooks/dates/useDateStatus';
import useDateFormsManagement from '@/hooks/dates/useDateFormsManagement';
import useDateAssociations from '@/hooks/dates/useDateAssociations';

// Import des utilitaires
import { formatDate, formatMontant, isDatePassed, copyToClipboard, getCacheKey } from '@/utils/formatters';
import { debugLog } from '@/utils/logUtils';

/**
 * Hook pour gérer les détails et l'édition d'un date
 * Version ultra-optimisée anti-boucles infinies
 * 
 * @param {string} id - ID du date
 * @param {object} locationParam - Paramètre de location (optionnel)
 * @returns {object} - API du hook
 */
const useDateDetails = (id, locationParam) => {
  
  // 🔒 PROTECTION ANTI-BOUCLES: Références et compteurs stables
  const renderCountRef = useRef(0);
  const lastPropsHashRef = useRef('');
  const stableRefsRef = useRef({});
  
  const navigate = useNavigate();
  const locationData = useLocation();
  const location = locationParam || locationData;
  
  // 🔒 STABILISATION: Props hash pour détecter les vrais changements
  const propsHash = useMemo(() => {
    return JSON.stringify({
      id,
      pathname: location?.pathname,
      isEditMode: location?.pathname?.includes('/edit')
    });
  }, [id, location?.pathname]);

  // 🔒 PROTECTION: Détecter et logger seulement les vrais changements
  useEffect(() => {
    renderCountRef.current++;
    
    if (propsHash !== lastPropsHashRef.current) {
      debugLog(`[useDateDetails] Retour du hook pour date ${id}:`, 'info', 'useDateDetails');
      debugLog(`  - date: ${stableRefsRef.current.date ? 'PRÉSENT' : 'NULL'}`, 'debug', 'useDateDetails');
      debugLog(`  - lieu: ${stableRefsRef.current.lieu ? 'PRÉSENT' : 'NULL'}`, 'debug', 'useDateDetails');
      debugLog(`  - contact: ${stableRefsRef.current.contact ? 'PRÉSENT' : 'NULL'}`, 'debug', 'useDateDetails');
      debugLog(`  - loading: ${stableRefsRef.current.loading}`, 'debug', 'useDateDetails');
      debugLog(`  - genericDetails: ${stableRefsRef.current.genericDetails ? 'PRÉSENT' : 'NULL'}`, 'debug', 'useDateDetails');
      
      lastPropsHashRef.current = propsHash;
    }
  }, [propsHash, id]);
  
  // Détecter le mode édition basé sur l'URL de manière stable
  const isEditMode = useMemo(() => {
    return location?.pathname?.includes('/edit') || false;
  }, [location?.pathname]);
  
  debugLog(`[DateView][${id}] RENDU EN MODE ${isEditMode ? 'ÉDITION' : 'VISUALISATION'}.`, 'info', 'DateView');
  
  // 🔒 STABILISATION: États spécifiques avec valeurs par défaut stables
  const [cacheKey, setCacheKey] = useState(() => getCacheKey(id));
  const [initialContactIds, setInitialContactIds] = useState([]); // Changé en array pour multi-contacts
  const [initialArtisteId, setInitialArtisteId] = useState(null);
  const [initialStructureId, setInitialStructureId] = useState(null);
  const [initialLieuId, setInitialLieuId] = useState(null);
  
  // Guard pour éviter la double exécution des effets en StrictMode
  const bidirectionalUpdatesRef = useRef(false);
  
  // 🔒 STABILISATION: Hooks secondaires avec configurations stables
  const dateForms = useDateFormsManagement(id);
  const dateStatus = useDateStatus();
  const dateAssociations = useDateAssociations();
  
  // Configuration pour les entités liées - Stabilisée avec useMemo
  // 🏗️ NIVEAU 4 (Date) - FEUILLE de l'arbre : AUCUNE relation chargée pour éviter boucles
  const relatedEntities = useMemo(() => [
    {
      name: 'lieu',
      collection: 'lieux',
      idField: 'lieuId',  // Champ principal
      alternativeIdFields: ['lieu'], // Champs alternatifs pour compatibilité
      nameField: 'lieuNom',
      type: 'one-to-one',
      essential: true, // Le lieu est essentiel pour l'affichage du date
      loadRelated: false // 🚫 SÉCURITÉ MAXIMALE: Empêche le lieu de charger ses relations
    },
    {
      name: 'contacts',  // Changé au pluriel
      collection: 'contacts',
      idField: 'contactIds',  // Changé au pluriel pour multi-contacts
      alternativeIdFields: ['contactId', 'contact'], // Rétrocompatibilité
      nameField: 'contactNom',
      type: 'one-to-many',  // Changé pour multi-contacts
      essential: true,
      loadRelated: false,
      // Fonction pour gérer la rétrocompatibilité
      normalizeIds: (data) => {
        if (data.contactIds && Array.isArray(data.contactIds)) {
          return data.contactIds;
        } else if (data.contactId) {
          return [data.contactId];
        }
        return [];
      }
    },
    {
      name: 'artiste',
      collection: 'artistes',
      idField: 'artisteId',
      alternativeIdFields: ['artiste'], // Champs alternatifs pour compatibilité
      nameField: 'artisteNom',
      type: 'one-to-one',
      essential: false, // L'artiste peut être chargé à la demande
      loadRelated: false // 🚫 SÉCURITÉ MAXIMALE: Empêche l'artiste de charger ses relations
    },
    {
      name: 'structure',
      collection: 'structures',
      idField: 'structureId',
      alternativeIdFields: ['structure'], // Champs alternatifs pour compatibilité
      nameField: 'structureNom',
      type: 'custom', // CHANGEMENT: Type custom pour charger via le contact
      essential: true, // La structure est essentielle pour debug
      loadRelated: false // 🚫 SÉCURITÉ MAXIMALE: Empêche la structure de charger ses relations
    }
  ], []); // Pas de dépendances car la configuration est statique
  
  // ✅ CORRECTION MAJEURE: Stabiliser toutes les fonctions avec useRef
  const transformDateDataRef = useRef();
  const validateDateFormRef = useRef();
  const formatDateValueRef = useRef();
  const handleSaveSuccessRef = useRef();
  const handleDeleteSuccessRef = useRef();
  
  // Mettre à jour les références sans déclencher de re-renders
  transformDateDataRef.current = useCallback((data) => {
    // Stocker les IDs initiaux pour la gestion des relations bidirectionnelles
    // Gérer la rétrocompatibilité pour les contacts
    if (data.contactIds && Array.isArray(data.contactIds)) {
      setInitialContactIds(data.contactIds);
    } else if (data.contactId) {
      setInitialContactIds([data.contactId]);
    } else {
      setInitialContactIds([]);
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
  
  validateDateFormRef.current = useCallback((formData) => {
    const errors = {};
    
    if (!formData.date) errors.date = 'La date est obligatoire';
    if (!formData.montant) errors.montant = 'Le montant est obligatoire';
    if (!formData.lieuId) errors.lieuId = 'Le lieu est obligatoire';
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);
  
  formatDateValueRef.current = useCallback((field, value) => {
    if (field === 'date') return formatDate(value);
    if (field === 'montant') return formatMontant(value);
    return value;
  }, []);
  
  // ✅ CORRECTION: Stabiliser les callbacks de succès - SANS dépendances instables
  handleSaveSuccessRef.current = useCallback((data) => {
    // Mettre à jour les IDs initiaux pour la prochaine édition
    // Gérer la rétrocompatibilité pour les contacts
    if (data.contactIds && Array.isArray(data.contactIds)) {
      setInitialContactIds(data.contactIds);
    } else if (data.contactId) {
      setInitialContactIds([data.contactId]);
    } else {
      setInitialContactIds([]);
    }
    setInitialArtisteId(data.artisteId || null);
    setInitialStructureId(data.structureId || null);
    setInitialLieuId(data.lieuId || null);
    
    // Émettre un événement personnalisé pour notifier les autres composants
    try {
      const event = new CustomEvent('dateUpdated', { 
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
    
    // Charger les données du formulaire si nécessaire - Utiliser setTimeout pour éviter les boucles
    setTimeout(() => {
      if (dateForms?.fetchFormData) {
        dateForms.fetchFormData(data);
      }
    }, 0);
  }, [id, dateForms]); // Dépendance dateForms requise pour fetchFormData
  
  handleDeleteSuccessRef.current = useCallback(() => {
    // Notifier les autres composants
    try {
      const event = new CustomEvent('dateDeleted', { detail: { id } });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('Impossible de déclencher l\'événement de suppression', e);
    }
    navigate('/dates');
  }, [id, navigate]);
  
  // ✅ FINAL: Créer les customQueries avec la vraie logique de structure
  const customQueriesRef = useRef({
    structure: async (dateData) => {
      console.log('🏢 Structure customQuery appelée avec dateData:', dateData);
      debugLog('[useDateDetails] customQuery structure appelée', 'info', 'useDateDetails');
      
      // D'abord vérifier si le date a directement un structureId
      if (dateData.structureId) {
        try {
          const { doc, getDoc, db } = await import('@/services/firebase-service');
          const structureDoc = await getDoc(doc(db, 'structures', dateData.structureId));
          if (structureDoc.exists()) {
            const result = { id: structureDoc.id, ...structureDoc.data() };
            console.log('🏢 Structure trouvée directement:', result);
            return result;
          }
        } catch (err) {
          console.error('Erreur lors du chargement direct de la structure:', err);
        }
      }
      
      // Sinon, charger via le contact
      const contactId = dateData.contactId;
      if (!contactId) {
        console.log('🏢 Pas de contact, pas de structure');
        debugLog('[useDateDetails] Pas de contact, pas de structure', 'info', 'useDateDetails');
        return null;
      }
      
      try {
        const { doc, getDoc, db } = await import('@/services/firebase-service');
        const contactDoc = await getDoc(doc(db, 'contacts', contactId));
        
        if (!contactDoc.exists()) {
          console.log('🏢 Contact non trouvé');
          debugLog('[useDateDetails] Contact non trouvé', 'warn', 'useDateDetails');
          return null;
        }
        
        const contactData = contactDoc.data();
        if (!contactData.structureId) {
          console.log('🏢 Contact sans structure');
          debugLog('[useDateDetails] Contact sans structure', 'info', 'useDateDetails');
          return null;
        }
        
        // Charger la structure du contact
        const structureDoc = await getDoc(doc(db, 'structures', contactData.structureId));
        if (structureDoc.exists()) {
          const result = { id: structureDoc.id, ...structureDoc.data() };
          console.log('🏢 Structure trouvée via contact:', result);
          debugLog('[useDateDetails] Structure trouvée via contact', 'info', 'useDateDetails');
          return result;
        }
        
        console.log('🏢 Structure du contact non trouvée');
        return null;
      } catch (err) {
        console.error('🏢 Erreur lors du chargement de la structure via contact:', err);
        return null;
      }
    },
    test: async (dateData) => {
      console.log('🧪 TEST customQuery appelée avec:', dateData);
      return { id: 'test', nom: 'Test Structure' };
    }
  });
  
  const customQueriesTest = customQueriesRef.current;
  
  console.log('[DEBUG useDateDetails] CustomQueries définies en dehors useMemo:', customQueriesTest);
  console.log('[DEBUG useDateDetails] CustomQueries keys en dehors useMemo:', Object.keys(customQueriesTest));
  
  // DEBUG: Forcer l'affichage dans la console avec un titre distinctif
  console.log('🔍🔍🔍 DIAGNOSTIC useDateDetails HOOK 🔍🔍🔍');
  console.log('CustomQueries disponibles:', Object.keys(customQueriesTest));
  console.log('CustomQueries objet:', customQueriesTest);

  // ✅ CORRECTION: Configuration ultra-stable avec références
  const genericDetailsConfig = useMemo(() => {
    console.log('[DEBUG useDateDetails] DEBUT useMemo, customQueriesTest:', customQueriesTest);
    
    const config = {
      entityType: 'date',
      collectionName: 'dates',
      id,
      initialMode: isEditMode ? 'edit' : 'view',
      relatedEntities,
      autoLoadRelated: true,
      transformData: (data) => transformDateDataRef.current(data),
      validateFormFn: (formData) => validateDateFormRef.current(formData),
      formatValue: (field, value) => formatDateValueRef.current(field, value),
      checkDeletePermission: async () => true,
      onSaveSuccess: (data) => handleSaveSuccessRef.current(data),
      onDeleteSuccess: () => handleDeleteSuccessRef.current(),
      navigate,
      returnPath: '/dates',
      editPath: `/dates/${id}/edit`,
      useDeleteModal: true,
      disableCache: false,
      realtime: false,
      // TEST: Utiliser les customQueries définies en dehors du useMemo
      customQueries: customQueriesTest
    };
    
    // DEBUG: Vérifier la configuration avant de la retourner
    console.log('📋📋📋 CONFIG FINALE useDateDetails 📋📋📋');
    console.log('Config entière:', config);
    console.log('Config.customQueries:', config.customQueries);
    console.log('Config.customQueries keys:', Object.keys(config.customQueries || {}));
    console.log('Type de config.customQueries:', typeof config.customQueries);
    console.log('Config.customQueries === customQueriesTest:', config.customQueries === customQueriesTest);
    
    return config;
  }, [id, isEditMode, relatedEntities, navigate, customQueriesTest]); // Dépendances réduites et stables

  // DEBUG: Vérifier l'objet de configuration juste avant l'appel
  console.log('[DEBUG useDateDetails] AVANT appel useGenericEntityDetails:', {
    config: genericDetailsConfig,
    customQueries: genericDetailsConfig?.customQueries,
    customQueriesKeys: genericDetailsConfig?.customQueries ? Object.keys(genericDetailsConfig.customQueries) : 'undefined'
  });
  
  const genericDetails = useGenericEntityDetails(genericDetailsConfig);
  
  // Log de debug pour vérifier que l'entité est correctement chargée
  useEffect(() => {
    if (genericDetails && genericDetails.entity) {
      debugLog(`[useDateDetails] Entité chargée: ${genericDetails.entity.id}`, 'debug', 'useDateDetails');
    } else if (!genericDetails?.loading) {
      debugLog(`[useDateDetails] Entité non disponible après chargement`, 'warn', 'useDateDetails');
    }
  }, [genericDetails]);
  
  // Fonction pour gérer les mises à jour des relations bidirectionnelles - STABILISÉE
  const handleBidirectionalUpdatesRef = useRef();
  handleBidirectionalUpdatesRef.current = useCallback(async () => {
    // Utiliser les références stables au lieu des props directes
    const stableDetails = stableGenericDetailsRef.current;
    const stableAssociations = stableDateAssociationsRef.current;
    
    if (!stableDetails?.entity || !stableAssociations) return;
    
    const { entity } = stableDetails;
    const relatedData = genericDetails?.relatedData || {};
    
    try {
      
      // Créer un tableau de promesses pour exécuter les mises à jour en parallèle
      const updatePromises = [];
      
      // Mise à jour des relations bidirectionnelles pour les contacts (multi-contacts)
      const currentContactIds = relatedData.contacts?.map(c => c.id) || [];
      const hasContactChanges = currentContactIds.length > 0 || initialContactIds.length > 0;
      
      if (hasContactChanges) {
        // Pour chaque contact à retirer
        const contactsToRemove = initialContactIds.filter(id => !currentContactIds.includes(id));
        for (const contactId of contactsToRemove) {
          updatePromises.push(
            stableAssociations.updateContactAssociation(
              id,
              entity,
              null, // Retirer l'association
              contactId,
              relatedData.lieu
            )
          );
        }
        
        // Pour chaque contact à ajouter
        const contactsToAdd = currentContactIds.filter(id => !initialContactIds.includes(id));
        for (const contactId of contactsToAdd) {
          updatePromises.push(
            stableAssociations.updateContactAssociation(
              id,
              entity,
              contactId, // Ajouter l'association
              null,
              relatedData.lieu
            )
          );
        }
      }
      
      if (relatedData.artiste?.id || initialArtisteId) {
        updatePromises.push(
          stableAssociations.updateArtisteAssociation(
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
          stableAssociations.updateStructureAssociation(
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
          stableAssociations.updateLieuAssociation(
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
      console.error("[useDateDetails] Erreur lors des mises à jour bidirectionnelles:", error);
      throw error; // Propager l'erreur pour la gestion en amont
    }
  }, [id, initialContactIds, initialArtisteId, initialStructureId, initialLieuId, genericDetails?.relatedData]); // Dépendances réduites
  
  const handleBidirectionalUpdates = useCallback(async () => {
    return handleBidirectionalUpdatesRef.current();
  }, []);
  
  // Fonction pour récupérer les entités nécessaires aux relations bidirectionnelles - STABILISÉE
  const fetchRelatedEntitiesRef = useRef();
  fetchRelatedEntitiesRef.current = useCallback(async () => {
    const stableDetails = stableGenericDetailsRef.current;
    if (!stableDetails?.entity) return null;
    
    const relatedData = genericDetails?.relatedData || {};
  
    // Charger toutes les entités nécessaires en parallèle
    const promises = [];
    const results = {};
  
    // Contacts (multi-contacts)
    const contactIds = relatedData.contacts?.map(c => c.id) || initialContactIds || [];
    if (contactIds.length > 0) {
      promises.push(
        (async () => {
          try {
            const contactPromises = contactIds.map(async (contactId) => {
              const docRef = doc(db, 'contacts', contactId);
              const docSnap = await getDoc(docRef);
              return docSnap.exists() ? { id: contactId, ...docSnap.data() } : null;
            });
            const contacts = (await Promise.all(contactPromises)).filter(Boolean);
            results.contacts = contacts;
            results.contact = contacts[0] || null; // Rétrocompatibilité
          } catch (error) {
            console.error("Erreur lors du chargement des contacts:", error);
            results.contacts = [];
            results.contact = null;
          }
        })()
      );
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
  }, [initialContactIds, initialArtisteId, initialStructureId, initialLieuId, genericDetails?.relatedData]); // Dépendances réduites
  

  
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
  const stableDateAssociationsRef = useRef();
  
  // Stocker les références stables - OPTIMISÉ pour éviter les re-renders
  useEffect(() => {
    // Vérifier si les données ont réellement changé avant de mettre à jour
    const hasEntityChanged = genericDetails?.entity?.id !== stableGenericDetailsRef.current?.entity?.id;
    const hasLoadingChanged = genericDetails?.loading !== stableGenericDetailsRef.current?.loading;
    
    if ((hasEntityChanged || hasLoadingChanged) && genericDetails && genericDetails.entity && !genericDetails.loading) {
      stableGenericDetailsRef.current = {
        entity: genericDetails.entity,
        loading: genericDetails.loading
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genericDetails?.entity?.id, genericDetails?.loading]); // Dépendances spécifiques et stables

  useEffect(() => {
    if (dateAssociations) {
      stableDateAssociationsRef.current = dateAssociations;
    }
  }, [dateAssociations]);

  // DÉSACTIVÉ TEMPORAIREMENT : Cet effet cause des boucles infinies
  // Les mises à jour bidirectionnelles doivent être gérées uniquement lors des actions utilisateur
  /*
  useEffect(() => {
    // Guard contre l'exécution en double en StrictMode
    if (bidirectionalUpdatesRef.current) return;
    
    // Vérifier que l'entité est chargée et que tous les hooks dépendants sont prêts
    const stableGenericDetails = stableGenericDetailsRef.current;
    const stableDateAssocs = stableDateAssociationsRef.current;
    
    if (stableGenericDetails && stableGenericDetails.entity && !stableGenericDetails.loading && stableDateAssocs) {
      // console.log("[useDateDetails] useEffect pour relations bidirectionnelles déclenché");
      
      // Créer une fonction asynchrone à l'intérieur de l'effet
      const updateBidirectionalRelations = async () => {
        try {
          // Attendre que toutes les entités soient chargées
          const entitiesLoaded = await fetchRelatedEntitiesRef.current();
          
          // Vérifier que les entités sont bien chargées avant de procéder
          if (entitiesLoaded && Object.keys(entitiesLoaded).length > 0) {
            // Effectuer les mises à jour bidirectionnelles
            await handleBidirectionalUpdatesRef.current();
            
            // Marquer comme déjà exécuté pour éviter les doubles appels
            bidirectionalUpdatesRef.current = true;
          }
        } catch (error) {
          console.error("[useDateDetails] Erreur lors de la mise à jour des relations bidirectionnelles:", error);
        }
      };
      
      // Exécuter la fonction asynchrone
      updateBidirectionalRelations();
    }
  }, [id]); // Dépendances ultra-réduites et stables
  */
  
  // Réinitialiser le guard si l'ID change
  useEffect(() => {
    bidirectionalUpdatesRef.current = false;
  }, [id]);
  
  // NOUVEAU: Fonction de refresh avec cache intelligent - Finalisation intelligente
  const refreshDate = useCallback(async () => {
    
    // Invalider le cache actuel
    const newCacheKey = getCacheKey(id, Date.now());
    setCacheKey(newCacheKey);
    
    // NOUVEAU: Notifier le système de cache du changement
    try {
      const cacheEvent = new CustomEvent('dateCacheRefresh', {
        detail: {
          dateId: id,
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
      if (event.detail?.dateId === id && event.detail?.source !== 'self') {
        refreshDate();
      }
    };
    
    window.addEventListener('dateCacheInvalidation', handleCacheInvalidation);
    return () => window.removeEventListener('dateCacheInvalidation', handleCacheInvalidation);
  }, [id, refreshDate]);
  
  // Fonction pour obtenir les informations sur le statut et les actions requises
  const getStatusInfo = useCallback(() => {
    if (!genericDetails || !genericDetails.entity) return { message: '', actionNeeded: false };
    
    const isPastDate = isDatePassed(genericDetails.entity.date);
    const { formData: formDataDate, formDataStatus } = dateForms || {};
    
    // NOUVEAU: Utiliser formDataStatus pour enrichir les informations
    const formStatusInfo = formDataStatus ? {
      isComplete: formDataStatus.completionRate === 100,
      hasErrors: formDataStatus.validationErrors?.length > 0,
      lastUpdate: formDataStatus.lastUpdate
    } : null;
    
    switch (genericDetails.entity.statut) {
      case 'contact':
        if (!formDataDate) return { 
          message: 'Formulaire à envoyer', 
          actionNeeded: true, 
          action: 'form',
          formStatus: formStatusInfo
        };
        if (formDataDate && (!formDataDate.contactData && (!formDataDate.data || Object.keys(formDataDate.data).length === 0))) 
          return { 
            message: 'Formulaire envoyé, en attente de réponse', 
            actionNeeded: false,
            formStatus: formStatusInfo
          };
        if (formDataDate && (formDataDate.contactData || (formDataDate.data && Object.keys(formDataDate.data).length > 0)) && formDataDate.status !== 'validated') 
          return { 
            message: 'Formulaire à valider', 
            actionNeeded: true, 
            action: 'validate_form',
            formStatus: formStatusInfo
          };
        if (formDataDate && formDataDate.status === 'validated')
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
        if (formDataDate && formDataDate.status === 'validated')
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
          message: 'En attente du date', 
          actionNeeded: false,
          formStatus: formStatusInfo
        };
        
      case 'solde':
        if (isPastDate) return { 
          message: 'Date terminé', 
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
  }, [genericDetails, dateForms]);
  
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
    if (location && dateForms && dateForms.setShowFormGenerator) {
      const queryParams = new URLSearchParams(location.search || '');
      const shouldOpenFormGenerator = queryParams.get('openFormGenerator') === 'true';
      if (shouldOpenFormGenerator) {
        dateForms.setShowFormGenerator(true);
      }
    }
  }, [location, dateForms]);

  // Ajout log pour la suppression
  const handleDeleteClick = useCallback(() => {
    if (genericDetails.handleDelete) {
      genericDetails.handleDelete();
    } else {
      debugLog('[useDateDetails] genericDetails.handleDelete est undefined', 'warn', 'useDateDetails');
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
            action: 'prepare_date',
            priority: 'medium',
            description: 'Préparer les détails du date',
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
    const dateDate = new Date(entity.date);
    const daysUntilDate = Math.ceil((dateDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDate <= 7 && entity.statut !== 'solde') {
      recommendations.push({
        type: 'urgency',
        priority: 'high',
        message: `Date dans ${daysUntilDate} jours - Finaliser rapidement`,
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
    const { formData: formDataDate, formDataStatus } = dateForms || {};
    
    // NOUVEAU: Utiliser dateStatus pour des informations avancées
    const statusAnalysis = dateStatus ? {
      currentPhase: dateStatus.getCurrentPhase?.(genericDetails.entity.statut),
      progress: dateStatus.getProgress?.(genericDetails.entity.statut),
      timeline: dateStatus.getTimeline?.(genericDetails.entity),
      risks: dateStatus.getRisks?.(genericDetails.entity, isPastDate)
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
      nextSteps: generateNextSteps(genericDetails.entity, formDataDate, formDataStatus, isPastDate),
      recommendations: generateRecommendations(genericDetails.entity, formAnalysis, statusAnalysis)
    };
  }, [genericDetails, dateForms, dateStatus, getStatusInfo, generateNextSteps, generateRecommendations]);

  // 🔒 MISE À JOUR: Références stables pour le diagnostic
  const returnData = useMemo(() => {
    const date = genericDetails?.entity || null;
    const lieu = genericDetails?.relatedData?.lieu || null;
    const contacts = genericDetails?.relatedData?.contacts || [];
    const contact = contacts[0] || genericDetails?.relatedData?.contact || null; // Rétrocompatibilité
    const loading = genericDetails?.loading || genericDetails?.isLoading || false;
    
    // Mettre à jour les références stables pour le diagnostic
    stableRefsRef.current = {
      date,
      lieu,
      contacts,
      contact,
      loading,
      genericDetails: !!genericDetails
    };

    return {
      // Données principales du hook générique
      date,
      lieu,
      contacts,           // Array de contacts pour multi-contacts
      contact,            // Premier contact pour rétrocompatibilité
      artiste: genericDetails?.relatedData?.artiste || null,
      structure: genericDetails?.relatedData?.structure || null,
      loading,
      isLoading: genericDetails?.loading || false, 
      isSubmitting: genericDetails?.isSubmitting || false,
      error: genericDetails?.error || null,
      
      // Données du formulaire
      formData: genericDetails?.formData || {},
      isEditMode: isEditMode,
      
      // Données des formulaires spécifiques aux dates
      dateFormData: dateForms?.formData || null,
      formDataStatus: dateForms?.formDataStatus || null,
      showFormGenerator: dateForms?.showFormGenerator || false,
      setShowFormGenerator: dateForms?.setShowFormGenerator || (() => {}),
      generatedFormLink: dateForms?.generatedFormLink || '',
      setGeneratedFormLink: dateForms?.setGeneratedFormLink || (() => {}),
      
      // Fonctions de gestion génériques
      handleChange: genericDetails?.handleChange || (() => {}),
      handleSave: genericDetails?.handleSubmit || (() => {}),
      handleDelete: genericDetails?.handleDelete || (() => {}),
      handleSubmit: handleSubmitWithRelations,
      validateForm: (formData) => validateDateFormRef.current(formData),
      handleCancel,
      
      // Fonctions spécifiques aux dates
      handleFormGenerated: dateForms?.handleFormGenerated || (() => {}),
      validateProgrammatorForm: dateForms?.validateForm || (() => {}),
      refreshDate,
      getStatusInfo,
      
      // Fonctions utilitaires
      copyToClipboard,
      formatDate,
      formatMontant,
      isDatePassed,
      
      // Fonctions pour la gestion des entités liées
      setLieu: (lieu) => genericDetails?.setRelatedEntity('lieu', lieu),
      setContacts: (contacts) => genericDetails?.setRelatedEntity('contacts', contacts), // Multi-contacts
      setContact: (prog) => genericDetails?.setRelatedEntity('contacts', prog ? [prog] : []), // Rétrocompatibilité
      setArtiste: (artiste) => genericDetails?.setRelatedEntity('artiste', artiste),
      setStructure: (structure) => genericDetails?.setRelatedEntity('structure', structure),
      
      // Recherche d'entités (compatibilité avec les anciens hooks)
      lieuSearch: {
        selectedEntity: genericDetails?.relatedData?.lieu || null,
        setSelectedEntity: (lieu) => genericDetails?.setRelatedEntity('lieu', lieu),
        setSearchTerm: () => {} // Stub pour compatibilité
      },
      contactSearch: {
        selectedEntity: genericDetails?.relatedData?.contact || contacts[0] || null, // Rétrocompatibilité
        setSelectedEntity: (prog) => genericDetails?.setRelatedEntity('contacts', prog ? [prog] : []),
        setSearchTerm: () => {} // Stub pour compatibilité
      },
      contactsSearch: { // Nouveau pour multi-contacts
        selectedEntities: contacts,
        setSelectedEntities: (contacts) => genericDetails?.setRelatedEntity('contacts', contacts),
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
      
      // Fonctions avancées de gestion des statuts
      getAdvancedStatusInfo,
      generateNextSteps,
      generateRecommendations,
      
      // Données de statut enrichies
      statusAnalysis: dateStatus,
      formStatusDetails: dateForms?.formDataStatus || null,
    };
  }, [
    genericDetails,
    isEditMode,
    dateForms,
    handleSubmitWithRelations,
    handleCancel,
    refreshDate,
    getStatusInfo,
    handleDeleteClick,
    getAdvancedStatusInfo,
    generateNextSteps,
    generateRecommendations,
    dateStatus
  ]);

  return returnData;
};

export default useDateDetails;