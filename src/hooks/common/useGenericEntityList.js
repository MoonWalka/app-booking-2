import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db } from '@/firebaseInit';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  Timestamp,
  startAt,
  endAt,
  getCountFromServer
} from 'firebase/firestore';

/**
 * Hook générique pour la gestion des listes d'entités dans l'application TourCraft
 * Centralise les fonctionnalités de chargement, filtrage, recherche, tri et pagination
 * 
 * @param {Object} config - Configuration du hook
 * @returns {Object} États et fonctions pour gérer la liste d'entités
 */
const useGenericEntityList = ({
  // Configuration de base
  collectionName,           // Nom de la collection Firestore (obligatoire)
  idField = 'id',           // Nom du champ identifiant (défaut: 'id')
  transformItem = item => item, // Fonction pour transformer chaque élément (défaut: identité)
  
  // Configuration du filtrage
  filterConfig = {},        // Configuration des filtres disponibles
  initialFilters = {},      // Filtres initiaux appliqués
  customQueryBuilder = null, // Constructeur de requête personnalisé
  customFiltering = null,   // Fonction de filtrage personnalisée pour la pagination côté client
  
  // Configuration de la recherche
  searchFields = [],        // Champs sur lesquels effectuer la recherche
  initialSearchTerm = '',   // Terme de recherche initial
  searchDebounceTime = 300, // Délai de debounce pour la recherche
  searchMinLength = 2,      // Longueur minimale pour déclencher une recherche
  
  // Configuration du tri
  initialSortField = null,  // Champ de tri initial
  initialSortDirection = 'asc', // Direction initiale du tri
  disableSort = false,      // Désactiver le tri
  
  // Configuration de la pagination
  pageSize = 20,            // Taille de la page
  paginationMode = 'server', // Mode de pagination: 'server' ou 'client'
  
  // Options avancées
  realtime = false,         // Récupération en temps réel des mises à jour
  cacheResults = false,     // Mise en cache des résultats pour éviter des requêtes inutiles
  showLoadingFeedback = true, // Afficher un état de chargement
  
  // Données pré-chargées (pour la pagination côté client)
  initialItems = [],        // Éléments pré-chargés
  
  // Callbacks
  onError = null,           // Appelé en cas d'erreur
  onItemsChange = null,     // Appelé quand la liste change
  onLoadStart = null,       // Appelé au début du chargement
  onLoadEnd = null          // Appelé à la fin du chargement
}) => {
  // États pour les données
  const [items, setItems] = useState(initialItems);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filters, setFilters] = useState(initialFilters);
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDocument, setLastDocument] = useState(null);
  
  // Référence pour le listener Firestore en temps réel
  const unsubscribeRef = useRef(null);
  const cacheRef = useRef({});
  
  // Construire la requête Firestore
  const buildQuery = useCallback(() => {
    let baseQuery = collection(db, collectionName);
    
    // Si un constructeur de requête personnalisé est fourni, l'utiliser
    if (customQueryBuilder) {
      return customQueryBuilder(baseQuery, filters, searchTerm);
    }
    
    // Construire la requête standard
    let constraints = [];
    
    // Appliquer les filtres configurés
    Object.entries(filters).forEach(([filterName, filterValue]) => {
      if (filterValue === '' || filterValue === null || filterValue === undefined) return;
      
      const config = filterConfig[filterName];
      if (!config) return;
      
      switch (config.type) {
        case 'equals':
          constraints.push(where(filterName, config.firestoreOperator || '==', filterValue));
          break;
          
        case 'range':
          if (filterValue.start !== undefined && filterValue.start !== null) {
            constraints.push(where(filterName, config.firestoreOperator?.start || '>=', filterValue.start));
          }
          if (filterValue.end !== undefined && filterValue.end !== null) {
            constraints.push(where(filterName, config.firestoreOperator?.end || '<=', filterValue.end));
          }
          break;
          
        case 'date-range':
          if (filterValue.start) {
            const startDate = filterValue.start instanceof Date ? filterValue.start : new Date(filterValue.start);
            constraints.push(where(filterName, config.firestoreOperator?.start || '>=', startDate));
          }
          if (filterValue.end) {
            const endDate = filterValue.end instanceof Date ? filterValue.end : new Date(filterValue.end);
            constraints.push(where(filterName, config.firestoreOperator?.end || '<=', endDate));
          }
          break;
          
        case 'contains':
          if (Array.isArray(filterValue)) {
            constraints.push(where(filterName, 'array-contains-any', filterValue));
          } else {
            constraints.push(where(filterName, 'array-contains', filterValue));
          }
          break;
          
        case 'in':
          if (Array.isArray(filterValue) && filterValue.length > 0) {
            constraints.push(where(filterName, 'in', filterValue));
          }
          break;
      }
    });
    
    // Ajouter la recherche si nécessaire
    if (searchTerm && searchTerm.length >= searchMinLength && searchFields.length > 0) {
      // Note: Firestore ne permet pas de faire une requête OR sur plusieurs champs
      // Pour une recherche avancée, il faudrait implémenter un index spécifique ou utiliser Algolia
      
      // Solution simple pour la recherche sur un champ
      const searchField = searchFields[0]; // On utilise le premier champ pour la recherche
      const searchTermLower = searchTerm.toLowerCase();
      
      constraints.push(where(searchField, '>=', searchTermLower));
      constraints.push(where(searchField, '<=', searchTermLower + '\uf8ff'));
    }
    
    // Ajouter le tri si nécessaire
    if (sortField && !disableSort) {
      constraints.push(orderBy(sortField, sortDirection));
    }
    
    // Ajouter la pagination si nécessaire
    if (paginationMode === 'server') {
      constraints.push(limit(pageSize));
      
      if (lastDocument) {
        constraints.push(startAfter(lastDocument));
      }
    }
    
    // Construire et retourner la requête finale
    return query(baseQuery, ...constraints);
  }, [collectionName, filters, filterConfig, searchTerm, searchFields, searchMinLength, sortField, sortDirection, lastDocument, pageSize, paginationMode, disableSort, customQueryBuilder]);
  
  // Fonction pour charger les données
  const fetchItems = useCallback(async (isLoadMore = false) => {
    try {
      // Si on charge plus de données, ne pas réinitialiser l'état de chargement
      if (!isLoadMore) {
        setLoading(true);
        setError(null);
        if (onLoadStart) onLoadStart();
      }
      
      // Vérifier si les résultats sont en cache
      const cacheKey = JSON.stringify({ filters, searchTerm, sortField, sortDirection, currentPage });
      if (cacheResults && cacheRef.current[cacheKey]) {
        const cachedData = cacheRef.current[cacheKey];
        if (!isLoadMore) {
          setItems(cachedData.items);
          setLastDocument(cachedData.lastDocument);
          setHasMore(cachedData.hasMore);
          setTotalItems(cachedData.totalItems);
          setLoading(false);
          if (onLoadEnd) onLoadEnd(cachedData.items);
        }
        return;
      }
      
      // Construire la requête
      const q = buildQuery();
      
      // Récupérer les données
      const snapshot = await getDocs(q);
      
      // Traiter les résultats
      const fetchedItems = snapshot.docs.map(doc => ({
        [idField]: doc.id,
        ...doc.data(),
      }));
      
      // Transformer les éléments
      const transformedItems = fetchedItems.map(transformItem);
      
      // Mettre à jour l'état
      if (isLoadMore) {
        setItems(prev => [...prev, ...transformedItems]);
      } else {
        setItems(transformedItems);
      }
      
      // Mettre à jour le dernier document pour la pagination
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastDocument(lastDoc);
      
      // Vérifier s'il y a plus de données
      setHasMore(transformedItems.length === pageSize);
      
      // Récupérer le nombre total d'éléments (uniquement si nécessaire)
      if (!isLoadMore && paginationMode === 'server') {
        try {
          // Créer une requête sans limite pour compter
          const countQuery = query(collection(db, collectionName));
          const countSnapshot = await getCountFromServer(countQuery);
          setTotalItems(countSnapshot.data().count);
        } catch (countError) {
          console.error('Erreur lors du comptage des éléments:', countError);
          // Ne pas définir d'erreur, car le chargement principal a réussi
        }
      }
      
      // Mettre en cache les résultats si nécessaire
      if (cacheResults) {
        cacheRef.current[cacheKey] = {
          items: transformedItems,
          lastDocument: lastDoc,
          hasMore: transformedItems.length === pageSize,
          totalItems: totalItems
        };
      }
      
      // Appeler le callback onItemsChange si fourni
      if (onItemsChange) onItemsChange(transformedItems);
      
      // Terminer le chargement
      setLoading(false);
      if (onLoadEnd) onLoadEnd(transformedItems);
      
    } catch (err) {
      console.error('Erreur lors du chargement des éléments:', err);
      
      setError(err);
      setLoading(false);
      
      if (onError) onError(err);
    }
  }, [collectionName, filters, searchTerm, sortField, sortDirection, currentPage, pageSize, idField, transformItem, buildQuery, cacheResults, paginationMode, totalItems, onItemsChange, onLoadStart, onLoadEnd, onError]);
  
  // Fonction pour mettre en place l'écoute en temps réel
  const setupRealtimeListener = useCallback(() => {
    if (!realtime) return;
    
    // Annuler l'ancien listener s'il existe
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    setLoading(true);
    if (onLoadStart) onLoadStart();
    
    try {
      // Construire la requête
      const q = buildQuery();
      
      // Mettre en place le listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          // Traiter les résultats
          const fetchedItems = snapshot.docs.map(doc => ({
            [idField]: doc.id,
            ...doc.data(),
          }));
          
          // Transformer les éléments
          const transformedItems = fetchedItems.map(transformItem);
          
          // Mettre à jour l'état
          setItems(transformedItems);
          
          // Mettre à jour le dernier document pour la pagination
          const lastDoc = snapshot.docs[snapshot.docs.length - 1];
          setLastDocument(lastDoc);
          
          // Vérifier s'il y a plus de données
          setHasMore(transformedItems.length === pageSize);
          
          // Appeler le callback onItemsChange si fourni
          if (onItemsChange) onItemsChange(transformedItems);
          
          // Terminer le chargement
          setLoading(false);
          if (onLoadEnd) onLoadEnd(transformedItems);
        },
        (err) => {
          console.error('Erreur lors de l\'écoute en temps réel:', err);
          
          setError(err);
          setLoading(false);
          
          if (onError) onError(err);
        }
      );
      
      // Stocker la fonction d'annulation
      unsubscribeRef.current = unsubscribe;
      
    } catch (err) {
      console.error('Erreur lors de la mise en place de l\'écoute en temps réel:', err);
      
      setError(err);
      setLoading(false);
      
      if (onError) onError(err);
    }
  }, [realtime, buildQuery, idField, transformItem, pageSize, onItemsChange, onLoadStart, onLoadEnd, onError]);
  
  // Chargement initial des données ou mise en place de l'écoute en temps réel
  useEffect(() => {
    // Si des éléments initiaux sont fournis et la pagination est côté client, les utiliser
    if (initialItems.length > 0 && paginationMode === 'client') {
      setItems(initialItems.map(transformItem));
      setTotalItems(initialItems.length);
      setLoading(false);
      if (onLoadEnd) onLoadEnd(initialItems.map(transformItem));
      return;
    }
    
    if (realtime) {
      setupRealtimeListener();
    } else {
      fetchItems();
    }
    
    // Nettoyer le listener lors du démontage
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [filters, searchTerm, sortField, sortDirection, currentPage, realtime, fetchItems, setupRealtimeListener, paginationMode, initialItems, transformItem, onLoadEnd]);
  
  // Fonction pour filtrer les éléments (pagination côté client)
  const filteredItems = useMemo(() => {
    // Si la pagination est côté serveur, retourner les éléments tels quels
    if (paginationMode === 'server') return items;
    
    // Si une fonction de filtrage personnalisée est fournie, l'utiliser
    if (customFiltering) {
      return customFiltering(items, { filters, searchTerm });
    }
    
    // Filtrage par défaut
    return items.filter(item => {
      // Appliquer les filtres
      for (const [filterName, filterValue] of Object.entries(filters)) {
        if (filterValue === '' || filterValue === null || filterValue === undefined) continue;
        
        const config = filterConfig[filterName];
        if (!config) continue;
        
        const itemValue = item[filterName];
        
        switch (config.type) {
          case 'equals':
            if (itemValue !== filterValue) return false;
            break;
            
          case 'range':
            if (filterValue.start !== undefined && itemValue < filterValue.start) return false;
            if (filterValue.end !== undefined && itemValue > filterValue.end) return false;
            break;
            
          case 'date-range':
            const itemDate = itemValue instanceof Date ? itemValue : new Date(itemValue);
            if (filterValue.start) {
              const startDate = filterValue.start instanceof Date ? filterValue.start : new Date(filterValue.start);
              if (itemDate < startDate) return false;
            }
            if (filterValue.end) {
              const endDate = filterValue.end instanceof Date ? filterValue.end : new Date(filterValue.end);
              if (itemDate > endDate) return false;
            }
            break;
            
          case 'contains':
            if (!Array.isArray(itemValue)) return false;
            if (Array.isArray(filterValue)) {
              if (!filterValue.some(value => itemValue.includes(value))) return false;
            } else {
              if (!itemValue.includes(filterValue)) return false;
            }
            break;
            
          case 'in':
            if (Array.isArray(filterValue) && filterValue.length > 0) {
              if (!filterValue.includes(itemValue)) return false;
            }
            break;
        }
      }
      
      // Appliquer la recherche
      if (searchTerm && searchTerm.length >= searchMinLength && searchFields.length > 0) {
        const searchTermLower = searchTerm.toLowerCase();
        return searchFields.some(field => {
          const fieldValue = item[field];
          return fieldValue && fieldValue.toString().toLowerCase().includes(searchTermLower);
        });
      }
      
      return true;
    });
  }, [items, filters, searchTerm, filterConfig, searchFields, searchMinLength, paginationMode, customFiltering]);
  
  // Fonction pour trier les éléments (pagination côté client)
  const sortedItems = useMemo(() => {
    if (paginationMode === 'server' || !sortField || disableSort) return filteredItems;
    
    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredItems, sortField, sortDirection, paginationMode, disableSort]);
  
  // Fonction pour paginer les éléments (pagination côté client)
  const paginatedItems = useMemo(() => {
    if (paginationMode === 'server') return sortedItems;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, currentPage, pageSize, paginationMode]);
  
  // Fonction pour définir un filtre
  const setFilter = useCallback((filterName, filterValue) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: filterValue
    }));
    
    // Réinitialiser la pagination
    setCurrentPage(1);
    setLastDocument(null);
  }, []);
  
  // Fonction pour réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilters({});
    
    // Réinitialiser la pagination
    setCurrentPage(1);
    setLastDocument(null);
  }, []);
  
  // Fonction pour définir plusieurs filtres à la fois
  const setMultipleFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    
    // Réinitialiser la pagination
    setCurrentPage(1);
    setLastDocument(null);
  }, []);
  
  // Fonction pour définir le tri
  const setSort = useCallback((field, direction = 'asc') => {
    setSortField(field);
    setSortDirection(direction);
    
    // Réinitialiser la pagination
    if (paginationMode === 'server') {
      setCurrentPage(1);
      setLastDocument(null);
    }
  }, [paginationMode]);
  
  // Fonction pour inverser la direction du tri
  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    
    // Réinitialiser la pagination
    if (paginationMode === 'server') {
      setCurrentPage(1);
      setLastDocument(null);
    }
  }, [paginationMode]);
  
  // Fonction pour charger la page suivante
  const loadMore = useCallback(() => {
    if (!hasMore) return;
    
    if (paginationMode === 'server') {
      // Appeler fetchItems avec isLoadMore = true
      fetchItems(true);
    } else {
      // Incrémenter la page
      setCurrentPage(prevPage => prevPage + 1);
    }
  }, [hasMore, paginationMode, fetchItems]);
  
  // Fonction pour aller à une page spécifique (pagination côté client)
  const goToPage = useCallback((pageNumber) => {
    if (pageNumber < 1 || pageNumber > Math.ceil(sortedItems.length / pageSize)) return;
    
    setCurrentPage(pageNumber);
  }, [sortedItems, pageSize]);
  
  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    // Réinitialiser la pagination
    setCurrentPage(1);
    setLastDocument(null);
    
    // Recharger les données
    if (realtime && unsubscribeRef.current) {
      // Pour le mode temps réel, réinitialiser le listener
      unsubscribeRef.current();
      setupRealtimeListener();
    } else {
      fetchItems();
    }
  }, [realtime, setupRealtimeListener, fetchItems]);
  
  // Calculer le nombre total de pages (pour la pagination côté client)
  const totalPages = useMemo(() => {
    if (paginationMode === 'server') {
      return Math.ceil(totalItems / pageSize);
    } else {
      return Math.ceil(sortedItems.length / pageSize);
    }
  }, [paginationMode, totalItems, sortedItems, pageSize]);
  
  // Calculer les métadonnées de pagination
  const pagination = useMemo(() => {
    return {
      currentPage,
      pageSize,
      totalItems: paginationMode === 'server' ? totalItems : sortedItems.length,
      totalPages,
      hasMore,
      loadMore,
      goToPage
    };
  }, [currentPage, pageSize, paginationMode, totalItems, sortedItems, totalPages, hasMore, loadMore, goToPage]);
  
  // Exposer l'API du hook
  return {
    // Données principales
    items: paginationMode === 'server' ? items : paginatedItems,
    allItems: items,
    filteredItems: sortedItems,
    totalItems: paginationMode === 'server' ? totalItems : sortedItems.length,
    
    // États
    loading: showLoadingFeedback ? loading : false,
    error,
    
    // Recherche
    searchTerm,
    setSearchTerm: (term) => {
      setSearchTerm(term);
      // Réinitialiser la pagination
      setCurrentPage(1);
      setLastDocument(null);
    },
    
    // Filtrage
    filters,
    setFilter,
    resetFilters,
    setMultipleFilters,
    
    // Tri
    sortField,
    sortDirection,
    setSort,
    toggleSortDirection,
    
    // Pagination
    pagination,
    loadMore,
    hasMore,
    goToPage,
    
    // Rafraîchir
    refresh
  };
};

export default useGenericEntityList;