// src/hooks/dates/useDateListData.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  limit, 
  startAfter,
  where, 
  db 
} from '@/services/firebase-service';
import logger from '@/services/loggerService';
import cacheService from '@/services/cacheService';
import { useEntreprise } from '@/context/EntrepriseContext';

/**
 * Hook to fetch dates, form data, and contracts
 * Version optimisée avec pagination pour améliorer les performances
 */
export const useDateListData = () => {
  console.time('⏱️ Initialisation états useDateListData');
  
  // Mesurer le temps d'initialisation du hook
  const hookStartTime = performance.now();
  logger.log('🔄 Initialisation du hook useDateListData');
  
  // Organisation context
  const { currentEntreprise } = useEntreprise();
  
  // DEBUG: Log l'organisation
  console.log('[useDateListData] currentEntreprise:', currentEntreprise);
  
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [datesWithForms, setDatesWithForms] = useState([]);
  const [unvalidatedForms, setUnvalidatedForms] = useState([]);
  const [datesWithContracts, setDatesWithContracts] = useState({});
  const [datesWithFactures, setDatesWithFactures] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [hasMore, setHasMore] = useState(true);
  
  console.timeEnd('⏱️ Initialisation états useDateListData');
  
  // Référence au dernier document pour la pagination
  const lastVisibleRef = useRef(null);
  const pageSize = 10; // Nombre d'éléments par page

  const lastFetchRef = useRef(0);
  const isInitialRenderRef = useRef(true);
  // NOUVEAU: Cache local hybride finalisé - Système de cache intelligent multi-niveaux
  const cacheRef = useRef({
    dates: {},
    lieux: {},
    contacts: {},
    // NOUVEAU: Métadonnées de cache
    timestamps: {},
    hitCounts: {},
    performance: {}
  });

  const minTimeBetweenFetches = 10000; // 10 secondes minimum entre deux fetch

  // NOUVEAU: Fonction de gestion du cache hybride - Finalisation intelligente
  const getCachedEntity = useCallback((collectionName, id) => {
    // Vérifier d'abord le cache local (plus rapide)
    const localCacheKey = `${collectionName}_${id}`;
    const localCached = cacheRef.current[collectionName]?.[id];
    
    if (localCached && localCached.timestamp && Date.now() - localCached.timestamp < 300000) { // 5 min
      // Augmenter le compteur de hits
      cacheRef.current.hitCounts[localCacheKey] = (cacheRef.current.hitCounts[localCacheKey] || 0) + 1;
      logger.log(`[CACHE LOCAL] Hit pour ${localCacheKey} (${cacheRef.current.hitCounts[localCacheKey]} hits)`);
      return localCached.data;
    }
    
    // Sinon, essayer le cache service
    const serviceCacheKey = `entity_${collectionName}_${id}`;
    return cacheService.get(serviceCacheKey);
  }, []);

  // NOUVEAU: Fonction pour mettre à jour le cache hybride
  const setCachedEntity = useCallback((collectionName, id, data) => {
    // Mettre à jour le cache local
    if (!cacheRef.current[collectionName]) {
      cacheRef.current[collectionName] = {};
    }
    
    cacheRef.current[collectionName][id] = {
      data,
      timestamp: Date.now()
    };
    
    // Mettre à jour aussi le cache service
    const serviceCacheKey = `entity_${collectionName}_${id}`;
    const cacheTTL = cacheService.CACHE_DURATIONS?.[collectionName] || cacheService.CACHE_DURATIONS?.default;
    cacheService.set(serviceCacheKey, data, cacheTTL);
    
    // Log de performance
    const cacheKey = `${collectionName}_${id}`;
    cacheRef.current.timestamps[cacheKey] = Date.now();
    logger.log(`[CACHE HYBRIDE] Stockage ${cacheKey}`);
  }, []);

  // NOUVEAU: Fonction pour obtenir les statistiques de cache
  const getCacheStats = useCallback(() => {
    const totalEntries = Object.keys(cacheRef.current.timestamps).length;
    const hitCounts = Object.values(cacheRef.current.hitCounts).reduce((sum, count) => sum + count, 0);
    
    return {
      totalEntries,
      totalHits: hitCounts,
      collections: {
        dates: Object.keys(cacheRef.current.dates || {}).length,
        lieux: Object.keys(cacheRef.current.lieux || {}).length,
        contacts: Object.keys(cacheRef.current.contacts || {}).length
      },
      performance: cacheRef.current.performance
    };
  }, []);

  // NOUVEAU: Fonction pour vider le cache avec sélectivité
  const clearCache = useCallback((collectionName = null) => {
    if (collectionName) {
      // Vider seulement une collection
      cacheRef.current[collectionName] = {};
      logger.log(`[CACHE] Vidage du cache ${collectionName}`);
    } else {
      // Vider tout le cache
      cacheRef.current = {
        dates: {},
        lieux: {},
        contacts: {},
        timestamps: {},
        hitCounts: {},
        performance: {}
      };
      logger.log(`[CACHE] Vidage complet du cache`);
    }
  }, []);

  // NOUVEAU: Fonction utilitaire pour récupérer des entités par lot en utilisant le cache hybride
  const fetchEntitiesBatch = useCallback(async (collectionName, ids) => {
    if (!ids || ids.length === 0) return [];
    
    // NOUVEAU: Filtrer les IDs en utilisant le cache hybride
    const cachedEntities = [];
    const idsToFetch = [];
    
    for (const id of ids) {
      const cachedItem = getCachedEntity(collectionName, id);
      
      if (cachedItem) {
        cachedEntities.push(cachedItem);
      } else {
        idsToFetch.push(id);
      }
    }
    
    // Si tous les éléments sont en cache, retourner directement
    if (idsToFetch.length === 0) {
      logger.log(`[CACHE HYBRIDE] Tous les ${collectionName} trouvés en cache (${cachedEntities.length} items)`);
      return cachedEntities;
    }
    
    // Mesure de performance
    const startTime = performance.now();
    logger.startLoading(`batch ${collectionName} (${idsToFetch.length} items)`);
    
    try {
      // Firestore limite les requêtes 'in' à 10 éléments max
      const batchSize = 10;
      const batchResults = [];
      
      // Traiter les IDs par lots de 10
      for (let i = 0; i < idsToFetch.length; i += batchSize) {
        const batchIds = idsToFetch.slice(i, i + batchSize);
        
        // Utiliser "__name__" comme identifiant de document pour where...in
        const batchQuery = query(
          collection(db, collectionName),
          where('__name__', 'in', batchIds)
        );
        
        const querySnapshot = await getDocs(batchQuery);
        
        // Traiter les résultats du lot
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // NOUVEAU: Mettre en cache avec le système hybride
        results.forEach(item => {
          if (item && item.id) {
            setCachedEntity(collectionName, item.id, item);
          }
        });
        
        batchResults.push(...results);
      }
      
      // Log de performance avec statistiques de cache
      const endTime = performance.now();
      const fetchTime = endTime - startTime;
      logger.performance(`Requête batch ${collectionName}`, fetchTime, { 
        count: idsToFetch.length,
        cached: cachedEntities.length,
        fetched: batchResults.length
      });
      
      // NOUVEAU: Stocker les métriques de performance dans le cache
      cacheRef.current.performance[`${collectionName}_batch_${Date.now()}`] = {
        fetchTime,
        itemsCount: idsToFetch.length,
        cacheHitRate: cachedEntities.length / (cachedEntities.length + idsToFetch.length)
      };
      
      return [...cachedEntities, ...batchResults];
    } catch (error) {
      logger.error(`Erreur lors du chargement batch des ${collectionName}:`, error);
      
      // En cas d'erreur avec la méthode batch, on revient à la méthode document par document
      const results = [];
      for (const id of idsToFetch) {
        try {
          const docSnap = await getDoc(doc(db, collectionName, id));
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() };
            results.push(data);
            
            // NOUVEAU: Mettre en cache avec le système hybride
            setCachedEntity(collectionName, id, data);
          }
        } catch (e) {
          // Silencieux pour éviter de remplir la console d'erreurs
        }
      }
      
      return [...cachedEntities, ...results];
    }
  }, [getCachedEntity, setCachedEntity]);

  const fetchDatesAndForms = useCallback(async (loadMore = false, force = false) => {
    // Éviter les rechargements trop fréquents sauf pour le chargement de plus d'éléments ou si force=true
    const now = Date.now();
    if (!loadMore && !force && now - lastFetchRef.current < minTimeBetweenFetches) {
      logger.log('Ignorer le rechargement - trop récent');
      return;
    }
    
    lastFetchRef.current = now;
    
    try {
      // Marquer le début du chargement pour les mesures de performance
      const startLoadingTime = logger.mark('datesLoading');
      
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        // Réinitialiser l'état de pagination lors d'un chargement complet
        lastVisibleRef.current = null;
        setHasMore(true);
      }
      
      logger.startLoading(`dates (${loadMore ? 'page suivante' : 'première page'})`);
      
      // Récupérer les dates avec seulement les champs nécessaires
      const datesRef = collection(db, 'dates');
      
      // Vérifier qu'on a une organisation
      if (!currentEntreprise?.id) {
        logger.warn('Pas d\'organisation courante - impossible de charger les dates');
        console.error('[useDateListData] PAS D\'ORGANISATION ! currentEntreprise:', currentEntreprise);
        setError('Aucune organisation sélectionnée');
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      
      // TEMPORAIRE: Requête simplifiée sans index
      let q = query(
        datesRef, 
        where('organizationId', '==', currentEntreprise.id),
        limit(pageSize)
      );
      
      // Ajouter la pagination si nécessaire
      if (loadMore && lastVisibleRef.current) {
        // TEMPORAIRE: Pagination simplifiée sans index
        q = query(
          datesRef, 
          where('organizationId', '==', currentEntreprise.id),
          startAfter(lastVisibleRef.current), 
          limit(pageSize)
        );
      } else if (loadMore && !lastVisibleRef.current) {
        logger.warn('Impossible de charger plus - pas de référence au dernier document');
        setLoadingMore(false);
        return;
      }
      
      const querySnapshot = await getDocs(q);

      // Mise à jour de la référence au dernier document pour la pagination suivante
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      lastVisibleRef.current = lastDoc || null;
      
      // Si aucun date n'est retourné ou moins que la taille de page, il n'y a plus de données à charger
      if (querySnapshot.docs.length === 0 || querySnapshot.docs.length < pageSize) {
        setHasMore(false);
      }

      const datesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Collecter les IDs uniques pour les lieux et contacts
      const lieuxIds = [...new Set(datesData.filter(c => c.lieuId).map(c => c.lieuId))];
      const contactIds = [...new Set(datesData.filter(c => c.contactId).map(c => c.contactId))];
      
      // Charger les lieux et contacts en batch (en parallèle)
      const [lieuxData, contactsData] = await Promise.all([
        fetchEntitiesBatch('lieux', lieuxIds),
        fetchEntitiesBatch('contacts', contactIds)
      ]);
      
      // Enrichir chaque date avec les données de lieu et contact
      const enrichedDates = datesData.map(date => {
        const enriched = { ...date };
        
        // Ajouter les données du lieu s'il existe
        if (date.lieuId) {
          const lieu = lieuxData.find(l => l.id === date.lieuId);
          if (lieu) enriched.lieu = lieu;
        }
        
        // Ajouter les données du contact s'il existe
        if (date.contactId) {
          const prog = contactsData.find(p => p.id === date.contactId);
          if (prog) enriched.contact = prog;
        }
        
        return enriched;
      });
      
      setDates(prevDates => loadMore ? [...prevDates, ...enrichedDates] : enrichedDates);
      
      // N'effectuer les requêtes pour les formulaires et contrats que si on a des dates
      if (datesData.length > 0) {
        try {
          const formsStartTime = performance.now();
          logger.startLoading('formulaires et contrats');
          
          // Obtenir la liste des IDs de dates
          const dateIds = datesData.map(date => date.id);
          
          // 1. Récupération des formulaires UNIQUEMENT pour les dates actuels
          const formsRef = collection(db, 'formulaires');
          const formsQuery = query(
            formsRef, 
            where('organizationId', '==', currentEntreprise.id),
            where('dateId', 'in', dateIds)
          );
          const formsSnapshot = await getDocs(formsQuery);
          
          const formsData = formsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Identifier les dates avec formulaires
          const datesWithFormsIds = [];
          const unvalidatedFormsIds = [];
          
          formsData.forEach(form => {
            if (form.dateId) {
              datesWithFormsIds.push(form.dateId);
              
              // Si le formulaire n'est pas validé
              if (form.statut === 'en_attente' || form.statut === 'non_valide') {
                unvalidatedFormsIds.push(form.dateId);
              }
            }
          });
          
          setDatesWithForms(datesWithFormsIds);
          setUnvalidatedForms(unvalidatedFormsIds);
          
          // 2. Récupération des contrats UNIQUEMENT pour les dates actuels
          const contractsRef = collection(db, 'contrats');
          const contractsQuery = query(
            contractsRef, 
            where('organizationId', '==', currentEntreprise.id),
            where('dateId', 'in', dateIds)
          );
          const contractsSnapshot = await getDocs(contractsQuery);
          
          const contractsMap = {};
          
          contractsSnapshot.docs.forEach(doc => {
            const contract = { id: doc.id, ...doc.data() };
            if (contract.dateId) {
              contractsMap[contract.dateId] = contract;
            }
          });
          
          setDatesWithContracts(contractsMap);
          
          // 3. Récupération des factures UNIQUEMENT pour les dates actuels
          const facturesRef = collection(db, 'organizations', currentEntreprise.id, 'factures');
          const facturesQuery = query(
            facturesRef, 
            where('dateId', 'in', dateIds)
          );
          const facturesSnapshot = await getDocs(facturesQuery);
          
          const facturesMap = {};
          
          facturesSnapshot.docs.forEach(doc => {
            const facture = { id: doc.id, ...doc.data() };
            if (facture.dateId) {
              facturesMap[facture.dateId] = facture;
            }
          });
          
          setDatesWithFactures(facturesMap);
          
          // Log de performance pour le chargement des formulaires, contrats et factures
          const formsEndTime = performance.now();
          logger.performance("Requête formulaires, contrats et factures", formsEndTime - formsStartTime);
          
        } catch (err) {
          logger.error('Erreur lors du chargement des formulaires et contrats:', err);
          // Ne pas bloquer le chargement des dates en cas d'erreur sur les formulaires/contrats
        }
      } else {
        // Pas de dates, donc pas de formulaires, contrats ni factures
        setDatesWithForms([]);
        setUnvalidatedForms([]);
        setDatesWithContracts({});
        setDatesWithFactures({});
      }
      
      // Mettre à jour la dernière date de mise à jour
      setLastUpdate(Date.now());
      
      // Mesurer le temps total de chargement
      logger.endLoading(`dates (${loadMore ? 'page suivante' : 'première page'})`, performance.now() - startLoadingTime);
      
    } catch (err) {
      logger.error('Erreur lors du chargement des données des dates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchEntitiesBatch, currentEntreprise?.id]);

  // Effet initial pour charger les données - STABILISATION DES DÉPENDANCES
  const stableFetchRef = useRef();
  
  // Stocker une référence stable de fetchDatesAndForms
  useEffect(() => {
    stableFetchRef.current = fetchDatesAndForms;
  }, [fetchDatesAndForms]);

  useEffect(() => {
    if (isInitialRenderRef.current) {
      console.time('⏱️ Premier chargement des dates');
      logger.log('🔄 Effet initial - déclenchement du premier chargement');
      isInitialRenderRef.current = false;
      
      // Utiliser la référence stable pour éviter la boucle infinie
      const stableFetch = stableFetchRef.current;
      if (stableFetch) {
        // Utiliser Promise pour pouvoir mesurer le temps total
        stableFetch()
          .then(() => {
            console.timeEnd('⏱️ Premier chargement des dates');
            logger.performance('Temps total initialisation hook', performance.now() - hookStartTime);
          })
          .catch(err => {
            console.timeEnd('⏱️ Premier chargement des dates');
            logger.error('Erreur dans le chargement initial', err);
          });
      }
    }
  }, [hookStartTime]); // Dépendances réduites et stables

  // Effet pour écouter les événements de mise à jour de date
  useEffect(() => {
    const handleDateUpdate = (event) => {
      logger.log('🔄 Événement de mise à jour de date détecté, rafraîchissement forcé');
      fetchDatesAndForms(false, true); // Force le rafraîchissement
    };

    // Écouter les événements personnalisés de mise à jour de date
    window.addEventListener('dateDataRefreshed', handleDateUpdate);
    window.addEventListener('dateUpdated', handleDateUpdate);
    window.addEventListener('dateStatusChanged', handleDateUpdate);

    return () => {
      window.removeEventListener('dateDataRefreshed', handleDateUpdate);
      window.removeEventListener('dateUpdated', handleDateUpdate);
      window.removeEventListener('dateStatusChanged', handleDateUpdate);
    };
  }, [fetchDatesAndForms]);

  // Fonction pour vérifier si un date a un formulaire associé
  const hasForm = useCallback((dateId) => {
    const date = dates.find(c => c.id === dateId);
    return datesWithForms.includes(dateId) || 
           date?.formId !== undefined ||
           date?.hasFormSubmission === true ||
           date?.lastFormSubmissionId !== undefined;
  }, [dates, datesWithForms]);

  // Fonction pour vérifier si un date a un formulaire non validé
  const hasUnvalidatedForm = useCallback((dateId) => {
    return unvalidatedForms.includes(dateId);
  }, [unvalidatedForms]);

  // Fonction pour vérifier si un date a un contrat associé
  const hasContract = useCallback((dateId) => {
    return datesWithContracts[dateId] !== undefined;
  }, [datesWithContracts]);

  // Fonction pour obtenir le statut d'un contrat
  const getContractStatus = useCallback((dateId) => {
    const contract = datesWithContracts[dateId];
    return contract ? contract.status : null;
  }, [datesWithContracts]);

  // Fonction pour obtenir les données complètes d'un contrat
  const getContractData = useCallback((dateId) => {
    return datesWithContracts[dateId] || null;
  }, [datesWithContracts]);

  // Fonction pour vérifier si un date a une facture associée
  const hasFacture = useCallback((dateId) => {
    return datesWithFactures[dateId] !== undefined;
  }, [datesWithFactures]);

  // Fonction pour obtenir le statut d'une facture
  const getFactureStatus = useCallback((dateId) => {
    const facture = datesWithFactures[dateId];
    return facture ? facture.status : null;
  }, [datesWithFactures]);

  // Fonction pour obtenir les données complètes d'une facture
  const getFactureData = useCallback((dateId) => {
    return datesWithFactures[dateId] || null;
  }, [datesWithFactures]);

  return {
    dates,
    loading,
    loadingMore,
    error,
    datesWithForms,
    unvalidatedForms,
    datesWithContracts,
    datesWithFactures,
    lastUpdate,
    hasMore,
    loadMore: () => {
      if (!loading && !loadingMore && hasMore) {
        fetchDatesAndForms(true);
      }
    },
    refreshData: () => fetchDatesAndForms(false),
    forceRefresh: () => fetchDatesAndForms(false, true),
    hasForm,
    hasUnvalidatedForm,
    hasContract,
    getContractStatus,
    getContractData, // Nouvelle fonction pour obtenir les données du contrat
    hasFacture,
    getFactureStatus,
    getFactureData, // Nouvelle fonction pour obtenir les données de la facture
    // NOUVEAU: Fonctions du cache hybride
    getCacheStats,
    clearCache,
    getCachedEntity,
    setCachedEntity
  };
};

// Ajout de l'export par défaut pour la compatibilité avec index.js
export default useDateListData;
