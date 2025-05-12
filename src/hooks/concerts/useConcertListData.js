import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook to fetch concerts, form data, and contracts
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
  const isInitialRenderRef = useRef(true); // Déplacé ici au niveau supérieur du hook

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
      // Récupérer les concerts
      const concertsRef = collection(db, 'concerts');
      const q = query(concertsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);

      const concertsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Enrichir chaque concert avec les données de lieu et programmateur
      const enrichedConcerts = await Promise.all(
        concertsData.map(async (concert) => {
          const enriched = { ...concert };
          if (concert.lieuId) {
            const lieuRef = doc(db, 'lieux', concert.lieuId);
            const lieuSnap = await getDoc(lieuRef);
            if (lieuSnap.exists()) {
              const lieu = lieuSnap.data();
              enriched.lieuNom = lieu.nom || '';
              enriched.lieuVille = lieu.ville || '';
              enriched.lieuCodePostal = lieu.codePostal || '';
            }
          }
          if (concert.programmateurId) {
            const progRef = doc(db, 'programmateurs', concert.programmateurId);
            const progSnap = await getDoc(progRef);
            if (progSnap.exists()) {
              const prog = progSnap.data();
              enriched.programmateurNom = prog.nom || prog.raisonSociale || '';
            }
          }
          return enriched;
        })
      );
      console.log(`${enrichedConcerts.length} concerts enrichis chargés`);
      setConcerts(enrichedConcerts);

      // Récupérer les ID des concerts qui ont des formulaires associés
      const formsRef = collection(db, 'formLinks');
      const formsSnapshot = await getDocs(formsRef);
      
      // Créer un Set pour stocker les IDs des concerts avec formulaires
      const concertsWithFormsSet = new Set();
      
      formsSnapshot.forEach(doc => {
        const formData = doc.data();
        if (formData.concertId) {
          concertsWithFormsSet.add(formData.concertId);
        }
      });
      
      // Récupérer les soumissions de formulaires
      const formSubmissionsRef = collection(db, 'formSubmissions');
      const submissionsSnapshot = await getDocs(formSubmissionsRef);
      
      // Set pour stocker les IDs des concerts avec formulaires non validés
      const concertsWithUnvalidatedFormsSet = new Set();
      
      submissionsSnapshot.forEach(doc => {
        const formData = doc.data();
        if (formData.concertId) {
          concertsWithFormsSet.add(formData.concertId); // Ajouter aux formulaires existants
          
          // Si le formulaire est soumis mais pas encore validé, l'ajouter aux non validés
          if (formData.status !== 'validated') {
            concertsWithUnvalidatedFormsSet.add(formData.concertId);
          }
        }
      });
      
      setConcertsWithForms(Array.from(concertsWithFormsSet));
      setUnvalidatedForms(Array.from(concertsWithUnvalidatedFormsSet));
      
      // Récupérer les contrats
      const contratsRef = collection(db, 'contrats');
      const contratsSnapshot = await getDocs(contratsRef);
      
      const contratsData = {};
      
      contratsSnapshot.forEach(doc => {
        const contratData = doc.data();
        if (contratData.concertId) {
          contratsData[contratData.concertId] = {
            id: doc.id,
            ...contratData
          };
        }
      });
      
      setConcertsWithContracts(contratsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les concerts. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  }, []);

  // Un seul useEffect pour gérer à la fois le premier chargement, les événements et l'intervalle
  useEffect(() => {
    let isMounted = true;
    
    // Effet initial pour charger les données
    fetchConcertsAndForms();
    
    // Fonction de gestionnaire d'événements avec debounce intégré
    const handleConcertDataChange = (event) => {
      if (!isMounted) return;
      
      // Ignorer les événements concertDataRefreshed pour éviter les boucles infinies
      if (event.type === 'concertDataRefreshed') {
        console.log('Événement concertDataRefreshed ignoré pour éviter les boucles infinies');
        return;
      }
      
      console.log(`Événement reçu: ${event.type}`, event.detail);
      
      // Actualiser lastUpdate seulement si suffisamment de temps s'est écoulé
      const now = Date.now();
      if (now - lastFetchRef.current >= minTimeBetweenFetches) {
        setLastUpdate(now);
      } else {
        console.log('Événement ignoré - trop récent depuis le dernier fetch');
      }
    };
    
    // Enregistrer les écouteurs d'événements
    window.addEventListener('concertUpdated', handleConcertDataChange);
    window.addEventListener('concertDeleted', handleConcertDataChange);
    // Nous conservons l'écouteur mais filtrons dans le handler pour maintenir la compatibilité
    window.addEventListener('concertDataRefreshed', handleConcertDataChange);
    
    // Intervalle de rafraîchissement (toutes les 5 minutes au lieu de 60 secondes)
    const refreshInterval = setInterval(() => {
      if (isMounted) {
        console.log('Rafraîchissement automatique des données de concert');
        fetchConcertsAndForms();
      }
    }, 300000); // 5 minutes
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      
      // Nettoyer les écouteurs d'événements
      window.removeEventListener('concertUpdated', handleConcertDataChange);
      window.removeEventListener('concertDeleted', handleConcertDataChange);
      window.removeEventListener('concertDataRefreshed', handleConcertDataChange);
    };
  }, [fetchConcertsAndForms]);

  // Effet séparé pour les mises à jour manuelles via lastUpdate
  useEffect(() => {
    // Ignorer l'effet initial
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    
    // Ne lancer le fetch que pour les mises à jour manuelles
    console.log(`Rafraîchissement des données à ${new Date(lastUpdate).toLocaleTimeString()}`);
    fetchConcertsAndForms();
  }, [lastUpdate, fetchConcertsAndForms]);

  // Fonction pour forcer le rechargement des données
  const refreshData = () => {
    console.log('Rafraîchissement manuel des données de concert');
    setLastUpdate(Date.now());
  };

  // Helper functions for form and contract status
  const hasForm = (concertId) => {
    return concertsWithForms.includes(concertId) || 
           concerts.find(c => c.id === concertId)?.formId !== undefined;
  };

  const hasUnvalidatedForm = (concertId) => {
    return unvalidatedForms.includes(concertId);
  };

  const hasContract = (concertId) => {
    return concertsWithContracts[concertId] !== undefined;
  };

  const getContractStatus = (concertId) => {
    if (!hasContract(concertId)) return null;
    return concertsWithContracts[concertId].status || 'generated';
  };

  return {
    concerts,
    loading,
    error,
    concertsWithForms,
    unvalidatedForms,
    concertsWithContracts,
    hasForm,
    hasUnvalidatedForm,
    hasContract,
    getContractStatus,
    refreshData
  };
};

export default useConcertListData;