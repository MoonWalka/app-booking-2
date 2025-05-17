import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  limit, 
  where, 
  db 
} from '@/firebaseInit';

/**
 * Hook to fetch concerts, form data, and contracts
 * Version optimisée pour réduire les requêtes et améliorer les performances
 */
export const useConcertListData = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [concertsWithForms, setConcertsWithForms] = useState([]);
  const [unvalidatedForms, setUnvalidatedForms] = useState([]);
  const [concertsWithContracts, setConcertsWithContracts] = useState({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const lastFetchRef = useRef(0);
  const isInitialRenderRef = useRef(true);
  const cacheRef = useRef({
    concerts: {},
    lieux: {},
    programmateurs: {}
  });

  const minTimeBetweenFetches = 10000; // 10 secondes minimum entre deux fetch

  const fetchConcertsAndForms = useCallback(async () => {
    // Éviter les rechargements trop fréquents
    const now = Date.now();
    if (now - lastFetchRef.current < minTimeBetweenFetches) {
      console.log('Ignorer le rechargement - trop récent');
      return;
    }
    
    lastFetchRef.current = now;
    
    try {
      console.log('Chargement des données des concerts...');
      setLoading(true);
      
      // Récupérer les concerts avec seulement les champs nécessaires
      const concertsRef = collection(db, 'concerts');
      const q = query(concertsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const concertsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Collecter les IDs uniques pour les lieux et programmateurs
      const lieuxIds = [...new Set(concertsData.filter(c => c.lieuId).map(c => c.lieuId))];
      const programmateurIds = [...new Set(concertsData.filter(c => c.programmateurId).map(c => c.programmateurId))];
      
      // Charger les lieux et programmateurs en batch (en parallèle)
      const [lieuxData, programmateursData] = await Promise.all([
        fetchEntitiesBatch('lieux', lieuxIds, ['id', 'nom', 'ville', 'capacite']),
        fetchEntitiesBatch('programmateurs', programmateurIds, ['id', 'nom', 'prenom', 'email'])
      ]);
      
      // Mise en cache des lieux et programmateurs
      lieuxData.forEach(lieu => {
        if (lieu) cacheRef.current.lieux[lieu.id] = lieu;
      });
      
      programmateursData.forEach(prog => {
        if (prog) cacheRef.current.programmateurs[prog.id] = prog;
      });
      
      // Enrichir chaque concert avec les données de lieu et programmateur
      const enrichedConcerts = concertsData.map(concert => {
        const enriched = { ...concert };
        
        // Ajouter les données du lieu s'il existe
        if (concert.lieuId && cacheRef.current.lieux[concert.lieuId]) {
          enriched.lieu = cacheRef.current.lieux[concert.lieuId];
        }
        
        // Ajouter les données du programmateur s'il existe
        if (concert.programmateurId && cacheRef.current.programmateurs[concert.programmateurId]) {
          enriched.programmateur = cacheRef.current.programmateurs[concert.programmateurId];
        }
        
        return enriched;
      });
      
      setConcerts(enrichedConcerts);
      
      // Récupérer les données des formulaires et des contrats
      try {
        console.log('Chargement des formulaires et contrats...');
        
        // 1. Récupération des formulaires
        const formsRef = collection(db, 'formulaires');
        const formsQuery = query(formsRef);
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
        
        // 2. Récupération des contrats
        const contractsRef = collection(db, 'contrats');
        const contractsQuery = query(contractsRef);
        const contractsSnapshot = await getDocs(contractsQuery);
        
        const contractsMap = {};
        
        contractsSnapshot.docs.forEach(doc => {
          const contract = { id: doc.id, ...doc.data() };
          if (contract.concertId) {
            contractsMap[contract.concertId] = contract;
          }
        });
        
        setConcertsWithContracts(contractsMap);
        console.log(`Récupération de ${Object.keys(contractsMap).length} contrats`);
        
      } catch (err) {
        console.error('Erreur lors du chargement des formulaires et contrats:', err);
        // Ne pas bloquer le chargement des concerts en cas d'erreur sur les formulaires/contrats
      }
      
      // Mettre à jour la dernière date de mise à jour
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('Erreur lors du chargement des données des concerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fonction utilitaire pour récupérer des entités par lot - IMPLÉMENTATION ALTERNATIVE SANS WHERE
  const fetchEntitiesBatch = async (collectionName, ids, fields) => {
    if (!ids || ids.length === 0) return [];
    
    // Déclarer cachedEntities en dehors du bloc try pour qu'elle soit accessible dans le bloc catch
    const cachedEntities = [];
    
    try {
      // Filtrer les IDs déjà en cache
      const idsToFetch = [];
      
      ids.forEach(id => {
        if (cacheRef.current[collectionName][id]) {
          cachedEntities.push(cacheRef.current[collectionName][id]);
        } else {
          idsToFetch.push(id);
        }
      });
      
      // Si tous les éléments sont en cache, retourner directement
      if (idsToFetch.length === 0) {
        return cachedEntities;
      }
      
      console.log(`[Debug] Mode sécurisé: Récupération individuelle pour ${collectionName}: ${idsToFetch.length} IDs`);
      
      // MÉTHODE ALTERNATIVE: Récupérer les documents un par un
      // Cette méthode est moins efficace mais plus fiable, surtout en mode développement local
      const results = [];
      
      for (const id of idsToFetch) {
        try {
          console.log(`[Debug] Récupération de ${collectionName}/${id}`);
          const docRef = doc(db, collectionName, id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() };
            results.push(data);
            // Mettre en cache pour les futures utilisations
            cacheRef.current[collectionName][docSnap.id] = data;
          } else {
            console.log(`[Debug] Document ${collectionName}/${id} n'existe pas`);
          }
        } catch (err) {
          console.error(`[Debug] Erreur lors de la récupération de ${collectionName}/${id}:`, err);
        }
      }
      
      return [...cachedEntities, ...results];
    } catch (error) {
      console.error(`[Debug] Erreur générale lors du chargement des ${collectionName}:`, error);
      return cachedEntities; // Retourner au moins les entités en cache en cas d'erreur
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
    error,
    concertsWithForms,
    unvalidatedForms,
    concertsWithContracts,
    lastUpdate,
    refreshData: fetchConcertsAndForms,
    hasForm,
    hasUnvalidatedForm,
    hasContract,
    getContractStatus
  };
};

// Ajout de l'export par défaut pour la compatibilité avec index.js
export default useConcertListData;