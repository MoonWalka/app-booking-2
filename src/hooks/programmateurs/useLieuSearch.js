import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useNavigate } from 'react-router-dom';

const useLieuSearch = (programmateur) => {
  const navigate = useNavigate();
  const [showConcertSearch, setShowConcertSearch] = useState(false);
  const [concertSearchTerm, setConcertSearchTerm] = useState('');
  const [concertResults, setConcertResults] = useState([]);
  const [showConcertResults, setShowConcertResults] = useState(false);
  const [isSearchingConcerts, setIsSearchingConcerts] = useState(false);
  const concertSearchRef = useRef(null);
  const concertSearchTimeoutRef = useRef(null);

  // Handle clicks outside of the search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (concertSearchRef.current && !concertSearchRef.current.contains(event.target)) {
        setShowConcertResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search term changes with debounce
  useEffect(() => {
    if (concertSearchTimeoutRef.current) {
      clearTimeout(concertSearchTimeoutRef.current);
    }
    
    if (concertSearchTerm.length >= 2) {
      concertSearchTimeoutRef.current = setTimeout(() => {
        searchConcerts(concertSearchTerm);
      }, 300);
    } else {
      setConcertResults([]);
    }
    
    return () => {
      if (concertSearchTimeoutRef.current) {
        clearTimeout(concertSearchTimeoutRef.current);
      }
    };
  }, [concertSearchTerm]);

  // Function to search concerts
  const searchConcerts = async (term) => {
    try {
      setIsSearchingConcerts(true);
      const termLower = term.toLowerCase();
      
      // Query by title or date
      const concertsRef = collection(db, 'concerts');
      let concertsQuery;
      
      // If term is a date in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(term)) {
        concertsQuery = query(
          concertsRef,
          where('date', '==', term),
          limit(10)
        );
      } else {
        // Otherwise general search
        concertsQuery = query(
          concertsRef,
          orderBy('date', 'desc'),
          limit(20)
        );
      }
      
      const concertsSnapshot = await getDocs(concertsQuery);
      let concertsData = concertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter results locally if couldn't do a precise where
      if (!/^\d{4}-\d{2}-\d{2}$/.test(term)) {
        concertsData = concertsData.filter(concert => 
          (concert.titre && concert.titre.toLowerCase().includes(termLower)) ||
          (concert.lieuNom && concert.lieuNom.toLowerCase().includes(termLower)) ||
          (concert.date && concert.date.includes(termLower))
        );
      }
      
      // Filter to exclude already associated concerts
      if (programmateur && programmateur.concertsAssocies) {
        const currentConcertIds = new Set(programmateur.concertsAssocies.map(c => c.id));
        concertsData = concertsData.filter(concert => !currentConcertIds.has(concert.id));
      }
      
      setConcertResults(concertsData);
      setShowConcertResults(true);
    } catch (error) {
      console.error('Erreur lors de la recherche de concerts:', error);
    } finally {
      setIsSearchingConcerts(false);
    }
  };

  // Function to select a concert
  const handleSelectConcert = async (concert) => {
    try {
      if (!programmateur) return;
      
      // Check if concert is already associated
      const concertAlreadyAssociated = (programmateur.concertsAssocies || []).some(c => c.id === concert.id);
      
      if (!concertAlreadyAssociated) {
        // Create concert reference object to add
        const concertReference = {
          id: concert.id,
          titre: concert.titre || `Concert du ${concert.date}`,
          date: concert.date || null,
          lieu: concert.lieuNom || null
        };
        
        // Update programmateur in Firestore
        await updateDoc(doc(db, 'programmateurs', programmateur.id), {
          concertsAssocies: arrayUnion(concertReference),
          updatedAt: serverTimestamp()
        });
        
        // Update the concert with the programmateur
        await updateDoc(doc(db, 'concerts', concert.id), {
          programmateurId: programmateur.id,
          programmateurNom: programmateur.nom,
          updatedAt: serverTimestamp()
        });
        
        // Reset search
        setConcertSearchTerm('');
        setShowConcertResults(false);
        
        // Show confirmation
        alert(`Le concert "${concertReference.titre}" a été associé au programmateur.`);
        
        return concertReference;
      }
    } catch (error) {
      console.error('Erreur lors de l\'association du concert:', error);
      alert('Une erreur est survenue lors de l\'association du concert.');
      return null;
    }
  };

  // Function to create a new concert
  const handleCreateConcert = () => {
    navigate('/concerts/nouveau');
  };

  // Function to toggle concert search visibility
  const toggleConcertSearch = () => {
    setShowConcertSearch(!showConcertSearch);
    setConcertSearchTerm('');
    setShowConcertResults(false);
  };

  return {
    showConcertSearch,
    concertSearchTerm,
    concertResults,
    showConcertResults,
    isSearchingConcerts,
    concertSearchRef,
    setConcertSearchTerm,
    setShowConcertResults,
    toggleConcertSearch,
    handleSelectConcert,
    handleCreateConcert
  };
};

export default useLieuSearch;
