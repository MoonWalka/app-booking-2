// src/hooks/concerts/useConcertListData.optimized.js
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
} from '@/firebaseInit';
import logger from '@/services/loggerService';
import cacheService from '@/services/cacheService';

/**
 * Hook to fetch concerts, form data, and contracts
 * Version optimisée avec pagination pour améliorer les performances
 */
export const useConcertListData = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [concertsWithForms, setConcertsWithForms] = useState([]);
  const [unvalidatedForms, setUnvalidatedForms] = useState([]);
  const [concertsWithContracts, setConcertsWithContracts] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [hasMore, setHasMore] = useState(true);
  
  // Référence au dernier document pour la pagination
  const lastVisibleRef = useRef(null);
  const pageSize = 10; // Nombre d'éléments par page

  const lastFetchRef = useRef(0);
  const isInitialRenderRef = useRef(true);
  const cacheRef = useRef({
    concerts: {},
    lieux: {},
    programmateurs: {}
  });

  const minTimeBetweenFetches = 10000; // 10 secondes minimum entre deux fetch

  const fetchConcertsAndForms = useCallback(async (loadMore = false) => {
    // Éviter les rechargements trop fréquents sauf pour le chargement de plus d'éléments
    const now = Date.now();
    if (!loadMore && now - lastFetchRef.current < minTimeBetweenFetches) {
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
  }, []);
  
  // Fonction utilitaire pour récupérer des entités par lot en utilisant le service de cache
  const fetchEntitiesBatch = async (collectionName, ids) => {
    if (!ids || ids.length === 0) return [];
    
    // Filtrer les IDs déjà en cache
    const cachedEntities = [];
    const idsToFetch = [];
    
    for (const id of ids) {
      // Essayer d'utiliser le cacheService au lieu du cache local
      const cacheKey = `entity_${collectionName}_${id}`;
      const cachedItem = cacheService.get(cacheKey);
      
      if (cachedItem) {
        cachedEntities.push(cachedItem);
      } else {
        idsToFetch.push(id);
      }
    }
    
    // Si tous les éléments sont en cache, retourner directement
    if (idsToFetch.length === 0) {
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
        
        // Mettre en cache avec le cacheService
        results.forEach(item => {
          if (item && item.id) {
            const cacheKey = `entity_${collectionName}_${item.id}`;
            const cacheTTL = cacheService.CACHE_DURATIONS?.[collectionName] || cacheService.CACHE_DURATIONS?.default;
            cacheService.set(cacheKey, item, cacheTTL);
          }
        });
        
        batchResults.push(...results);
      }
      
      // Log de performance
      const endTime = performance.now();
      logger.performance(`Requête batch ${collectionName}`, endTime - startTime, { count: idsToFetch.length });
      
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
            
            // Mettre en cache
            const cacheKey = `entity_${collectionName}_${id}`;
            const cacheTTL = cacheService.CACHE_DURATIONS?.[collectionName] || cacheService.CACHE_DURATIONS?.default;
            cacheService.set(cacheKey, data, cacheTTL);
          }
        } catch (e) {
          // Silencieux pour éviter de remplir la console d'erreurs
        }
      }
      
      return [...cachedEntities, ...results];
    }
  };

  // Effet initial pour charger les données
  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      fetchConcertsAndForms();
    }
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
    hasForm,
    hasUnvalidatedForm,
    hasContract,
    getContractStatus
  };
};

// Ajout de l'export par défaut pour la compatibilité avec index.js
export default useConcertListData;
