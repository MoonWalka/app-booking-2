import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Custom hook for programmateur search functionality
 */
const useProgrammateurSearch = (lieuId) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [programmateur, setProgrammateur] = useState(null);
  const [loadingProgrammateur, setLoadingProgrammateur] = useState(false);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);

  // Load programmateur associated with the venue
  useEffect(() => {
    const fetchProgrammateur = async () => {
      if (!lieuId) return;
      
      try {
        // Charger le lieu pour obtenir l'ID du programmateur associé
        const lieuDoc = await getDoc(doc(db, 'lieux', lieuId));
        
        if (lieuDoc.exists() && lieuDoc.data().programmateurId) {
          setLoadingProgrammateur(true);
          const programmateurId = lieuDoc.data().programmateurId;
          
          // Charger le programmateur
          const programmateurDoc = await getDoc(doc(db, 'programmateurs', programmateurId));
          
          if (programmateurDoc.exists()) {
            setProgrammateur({
              id: programmateurDoc.id,
              ...programmateurDoc.data()
            });
            
            // En mode édition, définir également le programmateur sélectionné
            setSelectedProgrammateur({
              id: programmateurDoc.id,
              ...programmateurDoc.data()
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du programmateur:', error);
      } finally {
        setLoadingProgrammateur(false);
      }
    };

    fetchProgrammateur();
  }, [lieuId]);

  // Search for programmateurs when search term changes
  useEffect(() => {
    const searchProgrammateurs = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      
      try {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Recherche par nom
        const programmateurRef = collection(db, 'programmateurs');
        const q = query(programmateurRef);
        const querySnapshot = await getDocs(q);
        
        const results = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.nom && data.nom.toLowerCase().includes(searchTermLower)) {
            results.push({
              id: doc.id,
              ...data,
            });
          }
        });

        setSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche de programmateurs:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => {
      searchProgrammateurs();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  /**
   * Select a programmateur 
   */
  const handleSelectProgrammateur = (programmateur) => {
    setSelectedProgrammateur(programmateur);
    setSearchTerm('');
    setSearchResults([]);
  };

  /**
   * Remove selected programmateur
   */
  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
  };

  /**
   * Create new programmateur (will be implemented in the main component)
   */
  const handleCreateProgrammateur = () => {
    // Cette fonction sera implémentée au niveau du composant principal
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    programmateur,
    loadingProgrammateur,
    selectedProgrammateur,
    handleSelectProgrammateur,
    handleRemoveProgrammateur,
    handleCreateProgrammateur
  };
};

export default useProgrammateurSearch;