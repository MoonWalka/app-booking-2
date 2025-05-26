// src/hooks/concerts/useConcertListData.js
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

/**
 * Hook to fetch concerts, form data, and contracts
 * Version optimisée avec pagination pour améliorer les performances
 */
export const useConcertListData = () => {
  console.time('⏱️ Initialisation états useConcertListData');
  
  // Mesurer le temps d'initialisation du hook
  const hookStartTime = performance.now();
  logger.log('🔄 Initialisation du hook useConcertListData');
  
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [concertsWithForms, setConcertsWithForms] = useState([]);
  const [unvalidatedForms, setUnvalidatedForms] = useState([]);
  const [concertsWithContracts, setConcertsWithContracts] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [hasMore, setHasMore] = useState(true);
  
  console.timeEnd('⏱️ Initialisation états useConcertListData');
  
  // Référence au dernier document pour la pagination
  const lastVisibleRef = useRef(null);
  const pageSize = 10; // Nombre d'éléments par page

  const lastFetchRef = useRef(0);
  const isInitialRenderRef = useRef(true);
  // NOUVEAU: Cache local hybride finalisé - Système de cache intelligent multi-niveaux
  const cacheRef = useRef({
    concerts: {},
    lieux: {},
    programmateurs: {},
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
        concerts: Object.keys(cacheRef.current.concerts || {}).length,
        lieux: Object.keys(cacheRef.current.lieux || {}).length,
        programmateurs: Object.keys(cacheRef.current.programmateurs || {}).length
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
        concerts: {},
        lieux: {},
        programmateurs: {},
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

  const fetchConcertsAndForms = useCallback(async (loadMore = false, force = false) => {
    // Éviter les rechargements trop fréquents sauf pour le chargement de plus d'éléments ou si force=true
    const now = Date.now();
    if (!loadMore && !force && now - lastFetchRef.current < minTimeBetweenFetches) {
      logger.log('Ignorer le rechargement - trop récent');
      return;
    }
    
    lastFetchRef.current = now;
    
    try {
      // Marquer le début du chargement pour les mesures de performance
      const startLoadingTime = logger.mark('concertsLoading');
      
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        // Réinitialiser l'état de pagination lors d'un chargement complet
        lastVisibleRef.current = null;
        setHasMore(true);
      }
      
      logger.startLoading(`concerts (${loadMore ? 'page suivante' : 'première page'})`);
      
      // Récupérer les concerts avec seulement les champs nécessaires
      const concertsRef = collection(db, 'concerts');
      let q = query(concertsRef, orderBy('date', 'desc'), limit(pageSize));
      
      // Ajouter la pagination si nécessaire
      if (loadMore && lastVisibleRef.current) {
        q = query(concertsRef, orderBy('date', 'desc'), startAfter(lastVisibleRef.current), limit(pageSize));
      } else if (loadMore && !lastVisibleRef.current) {
        logger.warn('Impossible de charger plus - pas de référence au dernier document');
        setLoadingMore(false);
        return;
      }
      
      const querySnapshot = await getDocs(q);

      // Mise à jour de la référence au dernier document pour la pagination suivante
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      lastVisibleRef.current = lastDoc || null;
      
      // Si aucun concert n'est retourné ou moins que la taille de page, il n'y a plus de données à charger
      if (querySnapshot.docs.length === 0 || querySnapshot.docs.length < pageSize) {
        setHasMore(false);
      }

      const concertsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Collecter les IDs uniques pour les lieux et programmateurs
      const lieuxIds = [...new Set(concertsData.filter(c => c.lieuId).map(c => c.lieuId))];
      const programmateurIds = [...new Set(concertsData.filter(c => c.programmateurId).map(c => c.programmateurId))];
      
      // Charger les lieux et programmateurs en batch (en parallèle)
      const [lieuxData, programmateursData] = await Promise.all([
        fetchEntitiesBatch('lieux', lieuxIds),
        fetchEntitiesBatch('programmateurs', programmateurIds)
      ]);
      
      // Enrichir chaque concert avec les données de lieu et programmateur
      const enrichedConcerts = concertsData.map(concert => {
        const enriched = { ...concert };
        
        // Ajouter les données du lieu s'il existe
        if (concert.lieuId) {
          const lieu = lieuxData.find(l => l.id === concert.lieuId);
          if (lieu) enriched.lieu = lieu;
        }
        
        // Ajouter les données du programmateur s'il existe
        if (concert.programmateurId) {
          const prog = programmateursData.find(p => p.id === concert.programmateurId);
          if (prog) enriched.programmateur = prog;
        }
        
        return enriched;
      });
      
      setConcerts(prevConcerts => loadMore ? [...prevConcerts, ...enrichedConcerts] : enrichedConcerts);
      
      // N'effectuer les requêtes pour les formulaires et contrats que si on a des concerts
      if (concertsData.length > 0) {
        try {
          const formsStartTime = performance.now();
          logger.startLoading('formulaires et contrats');
          
          // Obtenir la liste des IDs de concerts
          const concertIds = concertsData.map(concert => concert.id);
          
          // 1. Récupération des formulaires UNIQUEMENT pour les concerts actuels
          const formsRef = collection(db, 'formulaires');
          const formsQuery = query(formsRef, where('concertId', 'in', concertIds));
          const formsSnapshot = await getDocs(formsQuery);
          
          const formsData = formsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Identifier les concerts avec formulaires
          const concertsWithFormsIds = [];
          const unvalidatedFormsIds = [];
          
          formsData.forEach(form => {
            if (form.concertId) {
              concertsWithFormsIds.push(form.concertId);
              
              // Si le formulaire n'est pas validé
              if (form.statut === 'en_attente' || form.statut === 'non_valide') {
                unvalidatedFormsIds.push(form.concertId);
              }
            }
          });
          
          setConcertsWithForms(concertsWithFormsIds);
          setUnvalidatedForms(unvalidatedFormsIds);
          
          // 2. Récupération des contrats UNIQUEMENT pour les concerts actuels
          const contractsRef = collection(db, 'contrats');
          const contractsQuery = query(contractsRef, where('concertId', 'in', concertIds));
          const contractsSnapshot = await getDocs(contractsQuery);
          
          const contractsMap = {};
          
          contractsSnapshot.docs.forEach(doc => {
            const contract = { id: doc.id, ...doc.data() };
            if (contract.concertId) {
              contractsMap[contract.concertId] = contract;
            }
          });
          
          setConcertsWithContracts(contractsMap);
          
          // Log de performance pour le chargement des formulaires et contrats
          const formsEndTime = performance.now();
          logger.performance("Requête formulaires et contrats", formsEndTime - formsStartTime);
          
        } catch (err) {
          logger.error('Erreur lors du chargement des formulaires et contrats:', err);
          // Ne pas bloquer le chargement des concerts en cas d'erreur sur les formulaires/contrats
        }
      } else {
        // Pas de concerts, donc pas de formulaires ni de contrats
        setConcertsWithForms([]);
        setUnvalidatedForms([]);
        setConcertsWithContracts({});
      }
      
      // Mettre à jour la dernière date de mise à jour
      setLastUpdate(Date.now());
      
      // Mesurer le temps total de chargement
      logger.endLoading(`concerts (${loadMore ? 'page suivante' : 'première page'})`, performance.now() - startLoadingTime);
      
    } catch (err) {
      logger.error('Erreur lors du chargement des données des concerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchEntitiesBatch]);

  // Effet initial pour charger les données - STABILISATION DES DÉPENDANCES
  const stableFetchRef = useRef();
  
  // Stocker une référence stable de fetchConcertsAndForms
  useEffect(() => {
    stableFetchRef.current = fetchConcertsAndForms;
  }, [fetchConcertsAndForms]);

  useEffect(() => {
    if (isInitialRenderRef.current) {
      console.time('⏱️ Premier chargement des concerts');
      logger.log('🔄 Effet initial - déclenchement du premier chargement');
      isInitialRenderRef.current = false;
      
      // Utiliser la référence stable pour éviter la boucle infinie
      const stableFetch = stableFetchRef.current;
      if (stableFetch) {
        // Utiliser Promise pour pouvoir mesurer le temps total
        stableFetch()
          .then(() => {
            console.timeEnd('⏱️ Premier chargement des concerts');
            logger.performance('Temps total initialisation hook', performance.now() - hookStartTime);
          })
          .catch(err => {
            console.timeEnd('⏱️ Premier chargement des concerts');
            logger.error('Erreur dans le chargement initial', err);
          });
      }
    }
  }, [hookStartTime]); // Dépendances réduites et stables

  // Effet pour écouter les événements de mise à jour de concert
  useEffect(() => {
    const handleConcertUpdate = (event) => {
      logger.log('🔄 Événement de mise à jour de concert détecté, rafraîchissement forcé');
      fetchConcertsAndForms(false, true); // Force le rafraîchissement
    };

    // Écouter les événements personnalisés de mise à jour de concert
    window.addEventListener('concertDataRefreshed', handleConcertUpdate);
    window.addEventListener('concertUpdated', handleConcertUpdate);
    window.addEventListener('concertStatusChanged', handleConcertUpdate);

    return () => {
      window.removeEventListener('concertDataRefreshed', handleConcertUpdate);
      window.removeEventListener('concertUpdated', handleConcertUpdate);
      window.removeEventListener('concertStatusChanged', handleConcertUpdate);
    };
  }, [fetchConcertsAndForms]);

  // Fonction pour vérifier si un concert a un formulaire associé
  const hasForm = useCallback((concertId) => {
    return concertsWithForms.includes(concertId) || 
           concerts.find(c => c.id === concertId)?.formId !== undefined;
  }, [concerts, concertsWithForms]);

  // Fonction pour vérifier si un concert a un formulaire non validé
  const hasUnvalidatedForm = useCallback((concertId) => {
    return unvalidatedForms.includes(concertId);
  }, [unvalidatedForms]);

  // Fonction pour vérifier si un concert a un contrat associé
  const hasContract = useCallback((concertId) => {
    return concertsWithContracts[concertId] !== undefined;
  }, [concertsWithContracts]);

  // Fonction pour obtenir le statut d'un contrat
  const getContractStatus = useCallback((concertId) => {
    const contract = concertsWithContracts[concertId];
    return contract ? contract.status : null;
  }, [concertsWithContracts]);

  return {
    concerts,
    loading,
    loadingMore,
    error,
    concertsWithForms,
    unvalidatedForms,
    concertsWithContracts,
    lastUpdate,
    hasMore,
    loadMore: () => {
      if (!loading && !loadingMore && hasMore) {
        fetchConcertsAndForms(true);
      }
    },
    refreshData: () => fetchConcertsAndForms(false),
    forceRefresh: () => fetchConcertsAndForms(false, true),
    hasForm,
    hasUnvalidatedForm,
    hasContract,
    getContractStatus,
    // NOUVEAU: Fonctions du cache hybride
    getCacheStats,
    clearCache,
    getCachedEntity,
    setCachedEntity
  };
};

// Ajout de l'export par défaut pour la compatibilité avec index.js
export default useConcertListData;
