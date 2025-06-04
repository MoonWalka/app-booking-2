// src/hooks/programmateurs/useConcertSearch.js
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc, arrayUnion, serverTimestamp } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';
import { useEntitySearch } from '@/hooks/common';

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

  // NOUVEAU: Fonction pour dissocier un concert du programmateur - Finalisation intelligente
  const handleRemoveConcert = async (concertId, concertTitre = null) => {
    try {
      if (!programmateur || !concertId) return false;
      
      // Vérifier si le concert est effectivement associé
      const associatedConcert = (programmateur.concertsAssocies || []).find(c => c.id === concertId);
      
      if (!associatedConcert) {
        console.warn(`Concert ${concertId} n'est pas associé au programmateur ${programmateur.id}`);
        return false;
      }
      
      // Demander confirmation
      const concertName = concertTitre || associatedConcert.titre || `Concert du ${associatedConcert.date}`;
      const confirmMessage = `Êtes-vous sûr de vouloir dissocier le concert "${concertName}" du programmateur ${programmateur.nom} ?\n\nCette action retirera la liaison entre les deux entités.`;
      
      if (!window.confirm(confirmMessage)) {
        return false;
      }
      
      // Filtrer les concerts associés pour retirer celui sélectionné
      const updatedConcerts = (programmateur.concertsAssocies || []).filter(c => c.id !== concertId);
      
      // Mettre à jour le programmateur dans Firestore
      await updateDoc(doc(db, 'programmateurs', programmateur.id), {
        concertsAssocies: updatedConcerts,
        updatedAt: serverTimestamp()
      });
      
      // Retirer la référence du programmateur dans le concert
      await updateDoc(doc(db, 'concerts', concertId), {
        programmateurId: null,
        programmateurNom: null,
        updatedAt: serverTimestamp()
      });
      
      // Utiliser la fonction handleRemove du hook useEntitySearch
      if (handleRemove && typeof handleRemove === 'function') {
        handleRemove();
      }
      
      // Afficher une confirmation
      alert(`Le concert "${concertName}" a été dissocié du programmateur.`);
      
      return true;
      
    } catch (error) {
      console.error('Erreur lors de la dissociation du concert:', error);
      alert(`Une erreur est survenue lors de la dissociation du concert : ${error.message}`);
      return false;
    }
  };

  // NOUVEAU: Fonction pour dissocier tous les concerts d'un programmateur
  const handleRemoveAllConcerts = async () => {
    try {
      if (!programmateur || !programmateur.concertsAssocies || programmateur.concertsAssocies.length === 0) {
        alert('Aucun concert à dissocier.');
        return false;
      }
      
      const concertCount = programmateur.concertsAssocies.length;
      const confirmMessage = `Êtes-vous sûr de vouloir dissocier TOUS les ${concertCount} concerts du programmateur ${programmateur.nom} ?\n\nCette action retirera toutes les liaisons entre le programmateur et ses concerts.`;
      
      if (!window.confirm(confirmMessage)) {
        return false;
      }
      
      // Dissocier tous les concerts en parallèle
      const dissociationPromises = programmateur.concertsAssocies.map(async (concert) => {
        try {
          await updateDoc(doc(db, 'concerts', concert.id), {
            programmateurId: null,
            programmateurNom: null,
            updatedAt: serverTimestamp()
          });
          return concert.id;
        } catch (error) {
          console.error(`Erreur lors de la dissociation du concert ${concert.id}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(dissociationPromises);
      const successCount = results.filter(result => result !== null).length;
      
      // Mettre à jour le programmateur pour retirer tous les concerts
      await updateDoc(doc(db, 'programmateurs', programmateur.id), {
        concertsAssocies: [],
        updatedAt: serverTimestamp()
      });
      
      alert(`${successCount}/${concertCount} concerts ont été dissociés avec succès.`);
      
      return true;
      
    } catch (error) {
      console.error('Erreur lors de la dissociation de tous les concerts:', error);
      alert(`Une erreur est survenue lors de la dissociation : ${error.message}`);
      return false;
    }
  };

  // NOUVEAU: Fonction pour obtenir les statistiques des associations
  const getAssociationStats = () => {
    if (!programmateur) return null;
    
    const concerts = programmateur.concertsAssocies || [];
    const now = new Date();
    
    return {
      total: concerts.length,
      upcoming: concerts.filter(c => c.date && new Date(c.date) > now).length,
      past: concerts.filter(c => c.date && new Date(c.date) <= now).length,
      withoutDate: concerts.filter(c => !c.date).length,
      withLocation: concerts.filter(c => c.lieu).length,
      withoutLocation: concerts.filter(c => !c.lieu).length
    };
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
    handleCreateConcert,
    handleRemoveConcert,
    handleRemoveAllConcerts,
    getAssociationStats
  };
};

export default useConcertSearch;