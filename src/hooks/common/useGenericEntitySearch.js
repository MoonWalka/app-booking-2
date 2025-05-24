import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/firebaseInit';
import { collection, query, where, getDocs, limit } from '@/firebaseInit';
import useDebounce from './useDebounce';

/**
 * Hook générique pour la recherche d'entités dans Firestore
 * 
 * @param {Object} config Configuration du hook
 * @param {string} config.collectionName Nom de la collection Firestore à rechercher
 * @param {string[]} config.searchFields Champs sur lesquels effectuer la recherche
 * @param {number} config.debounceTime Délai de debounce en ms (défaut: 300)
 * @param {string} config.initialSearchTerm Terme de recherche initial (défaut: '')
 * @param {number} config.limit Limite du nombre de résultats (défaut: 10)
 * @param {Function} config.transformResult Fonction de transformation des résultats
 * @param {Function} config.customFilter Fonction de filtrage personnalisée
 * @param {boolean} config.useLocalSearch Si true, la recherche est effectuée localement (défaut: false)
 * @param {boolean} config.preloadData Si true, précharge toutes les données au chargement (pour la recherche locale, défaut: false)
 * @param {Function} config.sortResults Fonction de tri des résultats
 * @param {Function} config.searchCondition Condition pour déclencher la recherche (défaut: term => term.length >= 2)
 */
const useGenericEntitySearch = ({
  collectionName,
  searchFields,
  debounceTime = 300,
  initialSearchTerm = '',
  limit: resultLimit = 10,
  transformResult = (result) => result,
  customFilter = null,
  useLocalSearch = false,
  preloadData = false,
  sortResults = null,
  searchCondition = (term) => term.length >= 2
}) => {
  // États
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allData, setAllData] = useState([]);
  
  // Stocker les configurations dans des refs pour éviter une recréation à chaque rendu
  const configRef = useRef({
    collectionName,
    searchFields,
    useLocalSearch,
    preloadData,
    customFilter,
    transformResult,
    searchCondition,
    sortResults,
    resultLimit
  });
  
  // Mettre à jour les refs si les configurations changent
  useEffect(() => {
    configRef.current = {
      collectionName,
      searchFields,
      useLocalSearch,
      preloadData,
      customFilter,
      transformResult,
      searchCondition,
      sortResults,
      resultLimit
    };
  }, [
    collectionName, searchFields, useLocalSearch, preloadData,
    customFilter, transformResult, searchCondition, sortResults, resultLimit
  ]);
  
  // Terme de recherche avec debounce
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);

  // Préchargement de toutes les données si nécessaire
  useEffect(() => {
    if (useLocalSearch && preloadData) {
      const fetchAllData = async () => {
        try {
          setIsSearching(true);
          const q = query(collection(db, collectionName));
          const querySnapshot = await getDocs(q);
          const fetchedData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAllData(fetchedData);
        } catch (err) {
          console.error("Erreur lors du préchargement des données:", err);
          setError(err);
        } finally {
          setIsSearching(false);
        }
      };

      fetchAllData();
    }
  }, [collectionName, useLocalSearch, preloadData]);

  // Fonction pour récupérer toute la collection (pour recherche locale)
  const fetchCollection = async () => {
    const q = query(collection(db, configRef.current.collectionName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  // Fonction pour rechercher dans Firestore
  const searchFirestore = async (term) => {
    const { collectionName, searchFields, resultLimit } = configRef.current;
    
    const queries = searchFields.map(field => {
      // Création d'une requête pour chaque champ de recherche
      return query(
        collection(db, collectionName),
        // Recherche de termes qui commencent par le terme de recherche (permet l'autocomplétion)
        // Note: où le champ >= term et < term + '\uf8ff'
        where(field, ">=", term.toLowerCase()),
        where(field, "<=", term.toLowerCase() + '\uf8ff'),
        limit(resultLimit)
      );
    });
    
    // Exécution des requêtes en parallèle
    const queryResults = await Promise.all(queries.map(q => getDocs(q)));
    
    // Fusion des résultats et suppression des doublons
    const uniqueResults = new Map();
    queryResults.forEach(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
        if (!uniqueResults.has(doc.id)) {
          uniqueResults.set(doc.id, {
            id: doc.id,
            ...doc.data()
          });
        }
      });
    });
    
    return Array.from(uniqueResults.values());
  };
  
  // Fonction utilitaire pour accéder aux propriétés imbriquées
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    const pathArray = path.split('.');
    let value = obj;
    for (const key of pathArray) {
      value = value?.[key];
      if (value === undefined) break;
    }
    return value;
  };

  // Fonction de recherche stabilisée qui utilise configRef
  const performSearch = useCallback(async (term) => {
    const config = configRef.current;
    
    if (!term || !config.searchCondition(term)) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      let searchResults = [];
      
      if (config.useLocalSearch) {
        // Recherche locale
        const data = config.preloadData ? allData : await fetchCollection();
        searchResults = data.filter(item => 
          config.searchFields.some(field => {
            const fieldValue = getNestedValue(item, field);
            return fieldValue && String(fieldValue).toLowerCase().includes(term.toLowerCase());
          })
        );
      } else {
        // Recherche via Firestore
        searchResults = await searchFirestore(term);
      }
      
      // Application du filtre personnalisé si fourni
      if (config.customFilter) {
        searchResults = searchResults.filter(config.customFilter);
      }
      
      // Application de la transformation si fournie
      searchResults = searchResults.map(config.transformResult);
      
      // Tri des résultats si une fonction de tri est fournie
      if (config.sortResults) {
        searchResults.sort(config.sortResults);
      }
      
      // Limitation du nombre de résultats
      searchResults = searchResults.slice(0, config.resultLimit);
      
      setResults(searchResults);
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      setError(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [allData]); // Uniquement dépendant de allData, les autres dépendances sont dans configRef
  
  // Effectuer la recherche lorsque le terme de recherche avec debounce change
  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  // Gérer le changement d'entrée
  const handleInputChange = useCallback((e) => {
    const value = e.target.value || '';
    setSearchTerm(value);
    setShowDropdown(true);
  }, []);
  
  // Gérer le focus sur l'input
  const handleInputFocus = useCallback(() => {
    setShowDropdown(true);
    // Si le terme de recherche est déjà valide, relancer la recherche
    if (configRef.current.searchCondition(searchTerm)) {
      performSearch(searchTerm);
    }
  }, [searchTerm, performSearch]);

  // Gérer le clic sur un résultat
  const handleResultClick = useCallback((entity) => {
    setSelectedEntity(entity);
    setShowDropdown(false);
    setSearchTerm('');
  }, []);
  
  // Vérifier si une sélection est valide
  const isValidSelection = useCallback(() => {
    return selectedEntity !== null;
  }, [selectedEntity]);
  
  // Effacer la sélection
  const clearSelection = useCallback(() => {
    setSelectedEntity(null);
  }, []);
  
  // Forcer une nouvelle recherche
  const refreshSearch = useCallback(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);
  
  // Effacer la recherche
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setShowDropdown(false);
  }, []);
  
  // Exposer l'API du hook
  return {
    // État principal
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    error,
    selectedEntity,
    setSelectedEntity,
    
    // État du dropdown
    showDropdown,
    setShowDropdown,
    
    // Fonctions
    refreshSearch,
    clearSearch,
    handleInputChange,
    handleResultClick,
    handleInputFocus,
    isValidSelection,
    clearSelection,
    
    // Aliases pour compatibilité avec hooks existants
    searchResults: results,
    isLoading: isSearching
  };
};

export default useGenericEntitySearch;