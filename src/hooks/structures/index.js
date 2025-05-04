// src/hooks/structures/index.js
// Exporte tous les hooks liés aux structures

// Importer les hooks existants
import useStructureDetails from './useStructureDetails';
import useStructureForm from './useStructureForm';
import useStructureValidation from './useStructureValidation';
import useDeleteStructure from './useDeleteStructure';

// Import des hooks génériques nécessaires
import { useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Hook de recherche de structures
 * Permet de rechercher des structures par nom, ville, SIRET, etc.
 * @returns {Object} Fonctions et états pour la recherche de structures
 */
const useStructureSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Rechercher des structures par nom, ville, SIRET, etc.
   */
  const search = async () => {
    // Ne pas lancer de recherche si le terme est trop court
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      // Recherche dans la collection structures
      const structuresRef = collection(db, 'structures');
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      
      // Recherche par nom
      const nameQuery = query(
        structuresRef,
        where('nomLowerCase', '>=', normalizedSearchTerm),
        where('nomLowerCase', '<=', normalizedSearchTerm + '\uf8ff'),
        limit(5)
      );
      
      // Recherche par ville
      const villeQuery = query(
        structuresRef,
        where('villeLowerCase', '>=', normalizedSearchTerm),
        where('villeLowerCase', '<=', normalizedSearchTerm + '\uf8ff'),
        limit(5)
      );
      
      // Recherche par SIRET (si le terme est numérique)
      const siretQuery = /^\d+$/.test(searchTerm)
        ? query(
            structuresRef,
            where('siret', '>=', searchTerm),
            where('siret', '<=', searchTerm + '\uf8ff'),
            limit(5)
          )
        : null;
      
      // Exécution des requêtes
      const [nameResults, villeResults, siretResults] = await Promise.all([
        getDocs(nameQuery),
        getDocs(villeQuery),
        siretQuery ? getDocs(siretQuery) : { docs: [] }
      ]);
      
      // Fusion des résultats sans doublons (par ID)
      const resultsMap = new Map();
      
      // Ajouter les résultats de la recherche par nom
      nameResults.docs.forEach(doc => {
        const data = doc.data();
        resultsMap.set(doc.id, { id: doc.id, ...data });
      });
      
      // Ajouter les résultats de la recherche par ville
      villeResults.docs.forEach(doc => {
        const data = doc.data();
        resultsMap.set(doc.id, { id: doc.id, ...data });
      });
      
      // Ajouter les résultats de la recherche par SIRET
      if (siretQuery) {
        siretResults.docs.forEach(doc => {
          const data = doc.data();
          resultsMap.set(doc.id, { id: doc.id, ...data });
        });
      }
      
      // Convertir la Map en tableau
      const combinedResults = Array.from(resultsMap.values());
      
      // Trier par pertinence (à implémenter selon les besoins)
      const sortedResults = combinedResults;
      
      setSearchResults(sortedResults);
    } catch (err) {
      console.error('Erreur lors de la recherche des structures:', err);
      setError('Une erreur est survenue lors de la recherche des structures');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    error,
    search
  };
};

// Exporter tous les hooks individuellement
export {
  useStructureDetails,
  useStructureForm,
  useStructureValidation,
  useDeleteStructure,
  useStructureSearch
};