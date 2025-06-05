import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db } from '@/services/firebase-service';
import { collection, query, where, getDocs, limit } from '@/services/firebase-service';
import useDebounce from './useDebounce';
import { useOrganization } from '@/context/OrganizationContext';

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
  
  // Organisation context
  const { currentOrganization } = useOrganization();
  
  // 🔧 FIX: Stabiliser les searchFields pour éviter les re-créations
  const stableSearchFields = useMemo(() => searchFields, [searchFields]);
  
  // Références pour stabiliser les fonctions
  const transformResultRef = useRef(transformResult);
  const customFilterRef = useRef(customFilter);
  const sortResultsRef = useRef(sortResults);
  const searchConditionRef = useRef(searchCondition);
  
  // Mettre à jour les références
  transformResultRef.current = transformResult;
  customFilterRef.current = customFilter;
  sortResultsRef.current = sortResults;
  searchConditionRef.current = searchCondition;
  
  // 🔧 FIX: Mémoriser la configuration avec des dépendances stables
  const configRef = useRef({
    collectionName,
    searchFields: stableSearchFields,
    useLocalSearch,
    preloadData,
    resultLimit
  });
  
  // Mettre à jour le ref seulement si les valeurs changent vraiment
  useEffect(() => {
    const hasChanged = 
      configRef.current.collectionName !== collectionName ||
      JSON.stringify(configRef.current.searchFields) !== JSON.stringify(stableSearchFields) ||
      configRef.current.useLocalSearch !== useLocalSearch ||
      configRef.current.preloadData !== preloadData ||
      configRef.current.resultLimit !== resultLimit;
      
    if (hasChanged) {
      configRef.current = {
        collectionName,
        searchFields: stableSearchFields,
        useLocalSearch,
        preloadData,
        resultLimit
      };
    }
  }, [collectionName, stableSearchFields, useLocalSearch, preloadData, resultLimit]);
  
  // Terme de recherche avec debounce
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);

  // 🔧 FIX: Préchargement avec dépendance stable
  useEffect(() => {
    const config = configRef.current;
    if (!config.useLocalSearch || !config.preloadData || allData.length > 0) {
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsSearching(true);
        
        // Vérifier qu'on a une organisation
        if (!currentOrganization?.id) {
          console.warn('⚠️ Pas d\'organisation sélectionnée pour la recherche');
          setAllData([]);
          setIsSearching(false);
          return;
        }
        
        const q = query(
          collection(db, config.collectionName),
          where('organizationId', '==', currentOrganization.id)
        );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allData.length, currentOrganization]); // Dépendance réduite pour éviter les boucles

  // 🔧 FIX: Fonction pour récupérer toute la collection - mémorisée
  const fetchCollection = useCallback(async () => {
    const config = configRef.current;
    
    // Vérifier qu'on a une organisation
    if (!currentOrganization?.id) {
      console.warn('⚠️ Pas d\'organisation sélectionnée pour la recherche');
      return [];
    }
    
    const q = query(
      collection(db, config.collectionName),
      where('organizationId', '==', currentOrganization.id)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }, [currentOrganization]); // Dépend de l'organisation
  
  // 🔧 FIX: Fonction pour rechercher dans Firestore - mémorisée
  const searchFirestore = useCallback(async (term) => {
    const config = configRef.current;
    
    // Vérifier qu'on a une organisation
    if (!currentOrganization?.id) {
      console.warn('⚠️ Pas d\'organisation sélectionnée pour la recherche');
      return [];
    }
    
    const queries = config.searchFields.map(field => {
      return query(
        collection(db, config.collectionName),
        where('organizationId', '==', currentOrganization.id),
        where(field, ">=", term.toLowerCase()),
        where(field, "<=", term.toLowerCase() + '\uf8ff'),
        limit(config.resultLimit)
      );
    });
    
    const queryResults = await Promise.all(queries.map(q => getDocs(q)));
    
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
  }, [currentOrganization]); // Dépend de l'organisation
  
  // Fonction utilitaire pour accéder aux propriétés imbriquées
  const getNestedValue = useCallback((obj, path) => {
    if (!obj || !path) return undefined;
    const pathArray = path.split('.');
    let value = obj;
    for (const key of pathArray) {
      value = value?.[key];
      if (value === undefined) break;
    }
    return value;
  }, []);

  // 🔧 FIX: Fonction de recherche stabilisée avec condition correcte
  const performSearch = useCallback(async (term) => {
    const config = configRef.current;
    
    // 🔧 FIX: Utiliser la fonction searchCondition du ref
    if (!term || !searchConditionRef.current(term)) {
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
      if (customFilterRef.current) {
        searchResults = searchResults.filter(customFilterRef.current);
      }
      
      // Application de la transformation si fournie
      if (transformResultRef.current) {
        searchResults = searchResults.map(transformResultRef.current);
      }
      
      // Tri des résultats si une fonction de tri est fournie
      if (sortResultsRef.current) {
        searchResults.sort(sortResultsRef.current);
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
  }, [
    allData, 
    fetchCollection, 
    searchFirestore, 
    getNestedValue
  ]); // Dépendances réduites - config retiré car on utilise le ref
  
  // 🔧 FIX: Effectuer la recherche seulement quand le terme debounced change
  // Utiliser un ref pour éviter les dépendances instables
  const performSearchRef = useRef(performSearch);
  performSearchRef.current = performSearch;
  
  useEffect(() => {
    performSearchRef.current(debouncedSearchTerm);
  }, [debouncedSearchTerm]); // Dépendance unique et stable

  // Gérer le changement d'entrée
  const handleInputChange = useCallback((e) => {
    const value = e.target.value || '';
    setSearchTerm(value);
    setShowDropdown(true);
  }, []);
  
  // Gérer le focus sur l'input
  const handleInputFocus = useCallback(() => {
    setShowDropdown(true);
    // 🔧 FIX: Utiliser la condition et la fonction du ref
    if (searchTerm && searchConditionRef.current(searchTerm)) {
      performSearchRef.current(searchTerm);
    }
  }, [searchTerm]); // Dépendance réduite

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
    performSearchRef.current(searchTerm);
  }, [searchTerm]);
  
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