// src/hooks/programmateurs/useConcertSearch.js
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

/**
 * Hook personnalisé pour la recherche et l'association de concerts à un programmateur
 * @param {Object} programmateur - Objet programmateur auquel associer des concerts
 * @returns {Object} - État et fonctions pour gérer la recherche et l'association de concerts
 */
const useConcertSearch = (programmateur) => {
  const navigate = useNavigate();
  const [showConcertSearch, setShowConcertSearch] = useState(false);
  const concertSearchRef = useRef(null);

  // Fonction de filtrage pour exclure les concerts déjà associés au programmateur
  const filterConcerts = (concerts) => {
    if (!programmateur || !programmateur.concertsAssocies) {
      return concerts;
    }
    const currentConcertIds = new Set(programmateur.concertsAssocies.map(c => c.id));
    return concerts.filter(concert => !currentConcertIds.has(concert.id));
  };

  // Utilisation du hook générique useEntitySearch pour la recherche de concerts
  const { 
    searchTerm: concertSearchTerm, 
    setSearchTerm: setConcertSearchTerm, 
    results: concertResults, 
    isSearching: isSearchingConcerts, 
    showResults: showConcertResults,
    setShowResults: setShowConcertResults,
    dropdownRef: entityDropdownRef,
    handleRemove
  } = useEntitySearch({
    entityType: 'concerts',
    searchField: 'titre',
    additionalSearchFields: ['lieuNom', 'date'],
    maxResults: 10,
    filterResults: filterConcerts
  });

  // Effet pour gérer les clics en dehors du menu déroulant
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
  }, [setShowConcertResults]);

  // Fonction pour sélectionner un concert et l'associer au programmateur
  const handleSelectConcert = async (concert) => {
    try {
      if (!programmateur) return;
      
      // Vérifier si le concert est déjà associé
      const concertAlreadyAssociated = (programmateur.concertsAssocies || []).some(c => c.id === concert.id);
      
      if (!concertAlreadyAssociated) {
        // Créer la référence du concert à ajouter
        const concertReference = {
          id: concert.id,
          titre: concert.titre || `Concert du ${concert.date}`,
          date: concert.date || null,
          lieu: concert.lieuNom || null
        };
        
        // Mettre à jour le programmateur dans Firestore
        await updateDoc(doc(db, 'programmateurs', programmateur.id), {
          concertsAssocies: arrayUnion(concertReference),
          updatedAt: serverTimestamp()
        });
        
        // Mettre à jour le concert avec le programmateur
        await updateDoc(doc(db, 'concerts', concert.id), {
          programmateurId: programmateur.id,
          programmateurNom: programmateur.nom,
          updatedAt: serverTimestamp()
        });
        
        // Réinitialiser la recherche
        setConcertSearchTerm('');
        setShowConcertResults(false);
        
        // Afficher une confirmation
        alert(`Le concert "${concertReference.titre}" a été associé au programmateur.`);
        
        return concertReference;
      }
    } catch (error) {
      console.error('Erreur lors de l\'association du concert:', error);
      alert('Une erreur est survenue lors de l\'association du concert.');
      return null;
    }
  };

  // Fonction pour créer un nouveau concert
  const handleCreateConcert = () => {
    navigate('/concerts/nouveau');
  };

  // Fonction pour basculer l'affichage de la recherche de concerts
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
    concertSearchRef: concertSearchRef || entityDropdownRef, // Utiliser entityDropdownRef comme fallback
    setConcertSearchTerm,
    setShowConcertResults,
    toggleConcertSearch,
    handleSelectConcert,
    handleCreateConcert
  };
};

export default useConcertSearch;