// src/hooks/programmateurs/useProgrammateurSearch.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useEntitySearch } from '@/hooks/common/useEntitySearch';

/**
 * Hook personnalisé pour la recherche et la gestion des programmateurs
 * Version consolidée qui combine les fonctionnalités de recherche générale et
 * la recherche spécifique aux lieux
 * 
 * @param {Object} options - Options de configuration
 * @param {Function} options.onSelect - Callback appelé quand un programmateur est sélectionné (optionnel)
 * @param {string} options.lieuId - ID du lieu pour charger le programmateur associé (optionnel)
 * @param {boolean} options.useGenericSearch - Utiliser la recherche générique au lieu de la recherche spécifique
 * @returns {Object} - État et fonctions pour gérer la recherche et la sélection de programmateurs
 */
const useProgrammateurSearch = (options = {}) => {
  const { 
    onSelect = null, 
    lieuId = null,
    useGenericSearch = false
  } = typeof options === 'string' ? { lieuId: options } : options;
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [programmateur, setProgrammateur] = useState(null);
  const [loadingProgrammateur, setLoadingProgrammateur] = useState(false);
  const [selectedProgrammateur, setSelectedProgrammateur] = useState(null);

  // Pour la compatibilité avec l'ancienne implémentation qui prenait directement lieuId comme paramètre
  const actualLieuId = typeof options === 'string' ? options : lieuId;

  // Utiliser le hook générique si spécifié
  const genericSearch = useEntitySearch({
    entityType: 'programmateurs',
    searchField: 'nom',
    additionalSearchFields: ['structure', 'email'],
    maxResults: 10,
    onSelect: (entity) => {
      handleSelectProgrammateur(entity);
      if (onSelect) onSelect(entity);
    }
  });

  // Load programmateur associated with the venue
  useEffect(() => {
    if (!actualLieuId) return;
    
    const fetchProgrammateur = async () => {
      try {
        // Charger le lieu pour obtenir l'ID du programmateur associé
        setLoadingProgrammateur(true);
        const lieuDoc = await getDoc(doc(db, 'lieux', actualLieuId));
        
        if (lieuDoc.exists() && lieuDoc.data().programmateurId) {
          const programmateurId = lieuDoc.data().programmateurId;
          
          // Charger le programmateur
          const programmateurDoc = await getDoc(doc(db, 'programmateurs', programmateurId));
          
          if (programmateurDoc.exists()) {
            const programmateurData = {
              id: programmateurDoc.id,
              ...programmateurDoc.data()
            };
            setProgrammateur(programmateurData);
            
            // En mode édition, définir également le programmateur sélectionné
            setSelectedProgrammateur(programmateurData);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du programmateur:', error);
      } finally {
        setLoadingProgrammateur(false);
      }
    };

    fetchProgrammateur();
  }, [actualLieuId]);

  // Search for programmateurs when search term changes - version spécifique
  useEffect(() => {
    if (useGenericSearch) return; // N'utiliser cette recherche que si useGenericSearch est false
    
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
  }, [searchTerm, useGenericSearch]);

  /**
   * Select a programmateur 
   */
  const handleSelectProgrammateur = (programmateur) => {
    setSelectedProgrammateur(programmateur);
    setSearchTerm('');
    setSearchResults([]);
    if (onSelect) onSelect(programmateur);
  };

  /**
   * Remove selected programmateur
   */
  const handleRemoveProgrammateur = () => {
    setSelectedProgrammateur(null);
  };

  /**
   * Create new programmateur
   */
  const handleCreateProgrammateur = (returnTo = null) => {
    const navigationOptions = returnTo ? { state: { returnTo } } : {};
    navigate('/programmateurs/nouveau', navigationOptions);
  };

  // Si useGenericSearch est true, utiliser les résultats de la recherche générique
  if (useGenericSearch) {
    return {
      ...genericSearch,
      programmateur,
      loadingProgrammateur,
      selectedProgrammateur,
      handleSelectProgrammateur,
      handleRemoveProgrammateur,
      handleCreateProgrammateur
    };
  }

  // Sinon, utiliser la version spécifique
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