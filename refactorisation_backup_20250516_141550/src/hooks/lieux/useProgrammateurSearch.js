import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, limit, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook to handle programmateur search and selection
 */
export const useProgrammateurSearch = (lieu, setLieu) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load initial programmateur if a venue has one
  useEffect(() => {
    const loadProgrammateur = async () => {
      if (lieu.programmateurId) {
        try {
          const programmateurDoc = await getDoc(doc(db, 'programmateurs', lieu.programmateurId));
          if (programmateurDoc.exists()) {
            setSelectedProgrammateur({
              id: programmateurDoc.id,
              ...programmateurDoc.data()
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du programmateur:', error);
        }
      }
    };

    if (lieu.programmateurId) {
      loadProgrammateur();
    }
  }, [lieu.programmateurId]);

  // Effect for programmateur search
  useEffect(() => {
    // Clear previous timeout if a new search is initiated
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Only search if term has at least 2 characters
    if (searchTerm.length >= 2) {
      setIsSearching(true);
      
      // Add delay to avoid too many requests
      searchTimeoutRef.current = setTimeout(() => {
        searchProgrammateurs(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for programmateurs in Firebase
  const searchProgrammateurs = async (term) => {
    try {
      // Create query to find programmateurs whose name contains the term
      const q = query(
        collection(db, 'programmateurs'),
        where('nom', '>=', term),
        where('nom', '<=', term + '\uf8ff'),
        orderBy('nom'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche de programmateurs:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Create a new programmateur
  const handleCreateProgrammateur = async () => {
    try {
      // Check if a programmateur name has been entered
      if (!searchTerm.trim()) {
        alert('Veuillez saisir un nom de programmateur avant de créer un nouveau programmateur.');
        return;
      }
      
      // Create a new programmateur directly with the name entered in the search
      const newProgRef = doc(collection(db, 'programmateurs'));
      const progData = {
        nom: searchTerm.trim(),
        nomLowercase: searchTerm.trim().toLowerCase(),
        structure: '',
        email: '',
        telephone: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(newProgRef, progData);
      
      // Create a programmateur object with ID and data
      const newProg = { 
        id: newProgRef.id,
        ...progData
      };
      
      // Automatically select the new programmateur
      handleSelectProgrammateur(newProg);
      
      // Show a confirmation message
      alert(`Le programmateur "${progData.nom}" a été créé avec succès. Vous pourrez compléter ses détails plus tard.`);
      
    } catch (error) {
      console.error('Erreur lors de la création du programmateur:', error);
      alert('Une erreur est survenue lors de la création du programmateur.');
    }
  };

  // Select a programmateur
  const handleSelectProgrammateur = (programmateur) => {
    setSelectedProgrammateur(programmateur);
    setSearchTerm('');
    setSearchResults([]);
    
    // Update lieu with the selected programmateur (just the ID and name)
    setLieu(prev => ({
      ...prev,
      programmateurId: programmateur.id,
      programmateurNom: programmateur.nom
    }));
  };
  
  // Remove the selected programmateur
  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
    setLieu(prev => ({
      ...prev,
      programmateurId: null,
      programmateurNom: null
    }));
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedProgrammateur,
    dropdownRef,
    handleSelectProgrammateur,
    handleRemoveProgrammateur,
    handleCreateProgrammateur
  };
};

export default useProgrammateurSearch;
