import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, where } from '@/firebaseInit';
import { db } from '@/firebaseInit';

/**
 * Hook générique pour récupérer et gérer une liste d'entités avec pagination et filtres
 * 
 * @param {Object} options - Options de configuration
 * @param {string} options.collectionName - Nom de la collection Firestore
 * @param {number} [options.pageSize=20] - Nombre d'éléments par page
 * @param {string} [options.sortByField='nom'] - Champ de tri par défaut
 * @param {string} [options.sortDirection='asc'] - Direction de tri ('asc' ou 'desc')
 * @param {Array} [options.initialFilters=[]] - Filtres initiaux à appliquer
 * @param {Object} [options.searchFields] - Champs sur lesquels effectuer des recherches
 * @param {Function} [options.transformData] - Fonction de transformation des données récupérées
 * @returns {Object} API du hook
 */
const useGenericEntityList = ({
  collectionName,
  pageSize = 20,
  sortByField = 'nom',
  sortDirection = 'asc',
  initialFilters = [],
  searchFields = {},
  transformData = (data) => data
}) => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSort, setCurrentSort] = useState({ field: sortByField, direction: sortDirection });
  
  // Fonction pour construire la requête avec les filtres et le tri
  const buildQuery = useCallback((lastDoc = null) => {
    let q = collection(db, collectionName);
    
    // Appliquer tous les filtres actifs
    if (filters && filters.length > 0) {
      const activeFilters = filters.filter(f => f.enabled !== false);
      
      q = query(q, ...activeFilters.map(filter => {
        if (filter.operator === '==') {
          return where(filter.field, '==', filter.value);
        } else if (filter.operator === '!=') {
          return where(filter.field, '!=', filter.value);
        } else if (filter.operator === '>') {
          return where(filter.field, '>', filter.value);
        } else if (filter.operator === '>=') {
          return where(filter.field, '>=', filter.value);
        } else if (filter.operator === '<') {
          return where(filter.field, '<', filter.value);
        } else if (filter.operator === '<=') {
          return where(filter.field, '<=', filter.value);
        } else if (filter.operator === 'array-contains') {
          return where(filter.field, 'array-contains', filter.value);
        } else if (filter.operator === 'array-contains-any') {
          return where(filter.field, 'array-contains-any', filter.value);
        } else if (filter.operator === 'in') {
          return where(filter.field, 'in', filter.value);
        } else if (filter.operator === 'not-in') {
          return where(filter.field, 'not-in', filter.value);
        }
        // Par défaut, on utilise l'égalité
        return where(filter.field, '==', filter.value);
      }));
    }
    
    // Appliquer le tri
    q = query(q, orderBy(currentSort.field, currentSort.direction));
    
    // Appliquer la pagination
    q = query(q, limit(pageSize));
    
    // Si on a un dernier document visible, commencer après lui
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    return q;
  }, [collectionName, filters, currentSort, pageSize]);
  
  // Fonction pour charger les données initiales
  const loadEntities = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      
      if (reset) {
        setEntities([]);
        setLastVisible(null);
      }
      
      const q = buildQuery(reset ? null : lastVisible);
      const querySnapshot = await getDocs(q);
      
      // Vérifier s'il y a plus de résultats
      const hasMoreResults = querySnapshot.docs.length === pageSize;
      setHasMore(hasMoreResults);
      
      // Stocker le dernier document pour la pagination
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc || null);
      
      // Traiter les résultats
      const results = querySnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() };
        return transformData(data);
      });
      
      // Mettre à jour les données
      setEntities(prev => reset ? results : [...prev, ...results]);
      setCurrentPage(reset ? 1 : prev => prev + 1);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des entités:', err);
      setError(`Une erreur est survenue: ${err.message}`);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, lastVisible, pageSize, transformData]);
  
  // Fonction pour exécuter une recherche
  const performSearch = useCallback(async (searchText) => {
    if (!searchText || searchText.length < 2) {
      // Pas de recherche avec moins de deux caractères
      return loadEntities(true);
    }
    
    try {
      setSearchLoading(true);
      setEntities([]);
      
      // Liste des promesses de recherche pour chaque champ de recherche
      const searchPromises = Object.entries(searchFields).map(async ([field, options]) => {
        let searchQuery;
        
        if (options.exact) {
          // Recherche exacte
          searchQuery = query(
            collection(db, collectionName),
            where(field, '==', searchText),
            limit(pageSize)
          );
        } else if (options.prefix) {
          // Recherche par préfixe
          const searchLower = searchText.toLowerCase();
          searchQuery = query(
            collection(db, collectionName),
            where(`${field}LowerCase`, '>=', searchLower),
            where(`${field}LowerCase`, '<=', searchLower + '\uf8ff'),
            limit(pageSize)
          );
        } else if (options.array) {
          // Recherche dans un tableau
          searchQuery = query(
            collection(db, collectionName),
            where(field, 'array-contains', searchText),
            limit(pageSize)
          );
        } else {
          // Recherche générique (exact)
          searchQuery = query(
            collection(db, collectionName),
            where(field, '==', searchText),
            limit(pageSize)
          );
        }
        
        const querySnapshot = await getDocs(searchQuery);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
      
      // Attendre que toutes les recherches soient terminées
      const searchResults = await Promise.all(searchPromises);
      
      // Fusionner et dédupliquer les résultats
      const flatResults = searchResults.flat();
      const uniqueResults = Array.from(
        new Map(flatResults.map(item => [item.id, item])).values()
      );
      
      // Appliquer la transformation et mettre à jour l'état
      const transformedResults = uniqueResults.map(data => transformData(data));
      setEntities(transformedResults);
      setHasMore(false); // Pas de pagination avec la recherche
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError(`Une erreur est survenue lors de la recherche: ${err.message}`);
      setEntities([]);
      setHasMore(false);
    } finally {
      setSearchLoading(false);
    }
  }, [collectionName, searchFields, pageSize, transformData, loadEntities]);
  
  // Charger les données initiales au montage du composant
  useEffect(() => {
    loadEntities(true);
  }, [filters, currentSort.field, currentSort.direction]);
  
  // Effectuer une recherche lorsque le terme change
  useEffect(() => {
    if (search) {
      performSearch(search);
    }
  }, [search, performSearch]);
  
  // Fonction pour charger plus de résultats
  const loadMore = async () => {
    if (!loading && hasMore) {
      await loadEntities(false);
    }
  };
  
  // Fonction pour appliquer un filtre
  const applyFilter = (filter) => {
    // Vérifier si un filtre similaire existe déjà
    const existingFilterIndex = filters.findIndex(f => f.field === filter.field);
    
    let newFilters;
    if (existingFilterIndex >= 0) {
      // Remplacer l'ancien filtre
      newFilters = [...filters];
      newFilters[existingFilterIndex] = filter;
    } else {
      // Ajouter un nouveau filtre
      newFilters = [...filters, filter];
    }
    
    setFilters(newFilters);
    // Le chargement des données sera déclenché par l'effet
  };
  
  // Fonction pour supprimer un filtre
  const removeFilter = (fieldName) => {
    const newFilters = filters.filter(f => f.field !== fieldName);
    setFilters(newFilters);
    // Le chargement des données sera déclenché par l'effet
  };
  
  // Fonction pour désactiver/activer un filtre sans le supprimer
  const toggleFilter = (fieldName, enabled) => {
    const newFilters = filters.map(f => 
      f.field === fieldName ? { ...f, enabled } : f
    );
    setFilters(newFilters);
    // Le chargement des données sera déclenché par l'effet
  };
  
  // Fonction pour changer le tri
  const setSorting = (field, direction = 'asc') => {
    setCurrentSort({ field, direction });
    // Le chargement des données sera déclenché par l'effet
  };
  
  // Fonction pour rafraîchir les données
  const refresh = () => {
    loadEntities(true);
  };
  
  return {
    // État
    entities,
    loading,
    searchLoading,
    error,
    hasMore,
    currentPage,
    filters,
    search,
    currentSort,
    
    // Actions
    loadMore,
    refresh,
    setSearch,
    applyFilter,
    removeFilter,
    toggleFilter,
    setSorting,
    
    // Helpers
    isEmpty: entities.length === 0,
    isFiltered: filters.filter(f => f.enabled !== false).length > 0,
    isSearching: !!search,
    
    // Aliases for tests compatibility
    items: entities,
    setSearchTerm: setSearch,
    setFilter: applyFilter,
    resetFilters: () => { setFilters([]); },
    setSort: setSorting,
    pagination: {
      currentPage,
      totalPages: Math.ceil(entities.length / pageSize),
      goToPage: (page) => {
        const start = (page - 1) * pageSize;
        setEntities(entities.slice(start, start + pageSize));
        setCurrentPage(page);
      }
    }
  };
}

export default useGenericEntityList;