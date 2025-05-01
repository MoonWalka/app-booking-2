import { useState, useEffect } from 'react';
import firebase from '@/firebaseInit';

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

  useEffect(() => {
    const fetchConcertsAndForms = async () => {
      try {
        // Récupérer les concerts
        const concertsRef = firebase.collection(firebase.db, 'concerts');
        const q = firebase.query(concertsRef, firebase.orderBy('date', 'desc'));
        const querySnapshot = await firebase.getDocs(q);

        const concertsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setConcerts(concertsData);

        // Récupérer les ID des concerts qui ont des formulaires associés
        const formsRef = firebase.collection(firebase.db, 'formLinks');
        const formsSnapshot = await firebase.getDocs(formsRef);
        
        // Créer un Set pour stocker les IDs des concerts avec formulaires
        const concertsWithFormsSet = new Set();
        
        formsSnapshot.forEach(doc => {
          const formData = doc.data();
          if (formData.concertId) {
            concertsWithFormsSet.add(formData.concertId);
          }
        });
        
        // Récupérer les soumissions de formulaires
        const formSubmissionsRef = firebase.collection(firebase.db, 'formSubmissions');
        const submissionsSnapshot = await firebase.getDocs(formSubmissionsRef);
        
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
        const contratsRef = firebase.collection(firebase.db, 'contrats');
        const contratsSnapshot = await firebase.getDocs(contratsRef);
        
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
    };

    fetchConcertsAndForms();
  }, []);

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
    getContractStatus
  };
};

export default useConcertListData;