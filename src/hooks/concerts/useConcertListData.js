import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, getDocs, doc, getDoc, limit, where } from 'firebase/firestore';
import { db } from '@/firebaseInit';

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
      
      // Mettre à jour la dernière date de mise à jour
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('Erreur lors du chargement des données des concerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fonction utilitaire pour récupérer des entités par lot
  const fetchEntitiesBatch = async (collectionName, ids, fields) => {
    if (!ids || ids.length === 0) return [];
    
    try {
      // Filtrer les IDs déjà en cache
      const cachedEntities = [];
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
      
      // Utiliser une requête par lots de 10 IDs (limite Firestore)
      const results = [];
      
      // Récupérer par lots de 10 IDs maximum
      for (let i = 0; i < idsToFetch.length; i += 10) {
        const batch = idsToFetch.slice(i, i + 10);
        const q = query(collection(db, collectionName), where('__name__', 'in', batch));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          results.push(data);
          cacheRef.current[collectionName][doc.id] = data;
        });
      }
      
      return [...cachedEntities, ...results];
    } catch (error) {
      console.error(`Erreur lors du chargement des ${collectionName} par lots:`, error);
      return [];
    }
  };

  // Effet initial pour charger les données
  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      fetchConcertsAndForms();
    }
  }, [fetchConcertsAndForms]);

  return {
    concerts,
    loading,
    error,
    concertsWithForms,
    unvalidatedForms,
    concertsWithContracts,
    lastUpdate,
    refreshData: fetchConcertsAndForms
  };
};

// Ajout de l'export par défaut pour la compatibilité avec index.js
export default useConcertListData;