import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter, getCountFromServer, db } from '@/services/firebase-service';

/**
 * Hook pour gérer une liste générique d'entités depuis Firestore
 * Version optimisée avec une meilleure gestion du cache et des requêtes
 * 
 * @param {Object} options Configuration du hook
 * @returns {Object} États et fonctions pour gérer la liste d'entités
 */
const useGenericEntityList = ({
  collectionName,
  pageSize = 20,
  defaultOrderBy = null,
  defaultOrderDirection = 'asc',
  searchFields = {},
  transformData = null,
  customQuery = null,
  initialFilters = [],
  autoLoad = true,
  selectedFields = []
}) => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const lastVisibleRef = useRef(null);
  const filterRef = useRef(initialFilters);
  const cacheRef = useRef({
    entities: {},
    queries: {},
    searchResults: {}
  });
  const loadedIdsRef = useRef(new Set());

  // Mémoriser les options de requête actuelles
  const currentQueryOptionsRef = useRef({
    orderField: defaultOrderBy,
    orderDirection: defaultOrderDirection,
    filters: initialFilters
  });

  // Construit la requête Firestore en fonction de la configuration
  const buildQuery = useCallback((isFirstPage = false) => {
    const queryFilters = [];
    
    // Ajouter les filtres personnalisés
    if (filterRef.current && filterRef.current.length > 0) {
      filterRef.current.forEach(filter => {
        queryFilters.push(where(filter.field, filter.operator, filter.value));
      });
    }
    
    // Tri par défaut
    if (currentQueryOptionsRef.current.orderField) {
      queryFilters.push(orderBy(currentQueryOptionsRef.current.orderField, currentQueryOptionsRef.current.orderDirection));
    }
    
    // Limiter le nombre de résultats
    queryFilters.push(limit(pageSize));
    
    // Pagination
    if (!isFirstPage && lastVisibleRef.current) {
      queryFilters.push(startAfter(lastVisibleRef.current));
    }
    
    // Utiliser une requête personnalisée si fournie
    if (customQuery) {
      return customQuery(queryFilters, isFirstPage);
    }
    
    return query(collection(db, collectionName), ...queryFilters);
  }, [collectionName, customQuery, pageSize]);

  // Charge les données depuis Firestore
  const loadEntities = useCallback(async (resetPagination = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Générer une clé de cache pour cette requête
      const cacheKey = JSON.stringify({
        collection: collectionName,
        filters: filterRef.current,
        orderField: currentQueryOptionsRef.current.orderField,
        orderDirection: currentQueryOptionsRef.current.orderDirection
      });
      
      // Réinitialiser la pagination si demandé
      if (resetPagination) {
        lastVisibleRef.current = null;
        if (resetPagination === true) {
          setEntities([]);
          loadedIdsRef.current.clear();
        }
      }
      
      // Construire et exécuter la requête
      const q = buildQuery(resetPagination);
      
      // Vérifier si nous avons des résultats en cache pour cette requête exacte
      if (resetPagination && cacheRef.current.queries[cacheKey]) {
        const cachedResults = cacheRef.current.queries[cacheKey];
        if (cachedResults.timestamp && (Date.now() - cachedResults.timestamp) < 60000) { // Cache valide pendant 1 minute
          setEntities(cachedResults.data);
          lastVisibleRef.current = cachedResults.lastVisible;
          setHasMore(cachedResults.hasMore);
          setLoading(false);
          return;
        }
      }
      
      // Compter le total si c'est la première page
      if (resetPagination) {
        try {
          const countQuery = query(collection(db, collectionName));
          const countSnapshot = await getCountFromServer(countQuery);
          setTotalCount(countSnapshot.data().count);
        } catch (countError) {
          console.warn('Erreur lors du comptage des entités:', countError);
        }
      }
      
      // Exécuter la requête principale
      const snapshot = await getDocs(q);
      
      // Mettre à jour le dernier document visible pour la pagination
      if (!snapshot.empty) {
        lastVisibleRef.current = snapshot.docs[snapshot.docs.length - 1];
      }
      
      // Convertir les données
      const newData = snapshot.docs
        .filter(doc => !loadedIdsRef.current.has(doc.id)) // Éviter les doublons
        .map(doc => {
          const data = { id: doc.id, ...doc.data() };
          
          // Filtrer les champs si nécessaire
          let filteredData = data;
          if (selectedFields && selectedFields.length > 0) {
            filteredData = { id: data.id };
            selectedFields.forEach(field => {
              if (data[field] !== undefined) {
                filteredData[field] = data[field];
              }
            });
          }
          
          // Transformer les données si une fonction est fournie
          const processedData = transformData ? transformData(filteredData) : filteredData;
          
          // Mettre en cache par ID
          cacheRef.current.entities[doc.id] = processedData;
          
          // Marquer comme chargé
          loadedIdsRef.current.add(doc.id);
          
          return processedData;
        });
      
      // Déterminer s'il y a d'autres pages
      setHasMore(newData.length === pageSize);
      
      // Mettre à jour les entités
      setEntities(prevEntities => {
        const mergedEntities = resetPagination ? newData : [...prevEntities, ...newData];
        
        // Mettre à jour le cache pour cette requête
        cacheRef.current.queries[cacheKey] = {
          data: mergedEntities,
          lastVisible: lastVisibleRef.current,
          hasMore: newData.length === pageSize,
          timestamp: Date.now()
        };
        
        return mergedEntities;
      });
    } catch (err) {
      console.error('Erreur lors du chargement des entités:', err);
      setError(`Une erreur est survenue: ${err.message}`);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, collectionName, loading, pageSize, selectedFields, transformData]);
  
  // Fonction pour exécuter une recherche
  const performSearch = useCallback(async (searchText) => {
    if (!searchText || searchText.length < 2) {
      // Pas de recherche avec moins de deux caractères
      return loadEntities(true);
    }
    
    // Vérifier le cache de recherche
    const cacheKey = `${searchText}_${collectionName}`;
    if (cacheRef.current.searchResults[cacheKey] && 
        (Date.now() - cacheRef.current.searchResults[cacheKey].timestamp) < 30000) { // Cache valide 30 secondes
      setEntities(cacheRef.current.searchResults[cacheKey].data);
      setSearchLoading(false);
      return;
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
      const allResults = Array.from(
        new Map(
          searchResults.flat().map(item => [item.id, item])
        ).values()
      );
      
      // Transformer les résultats si nécessaire
      const transformedResults = transformData 
        ? allResults.map(transformData) 
        : allResults;
      
      // Mettre en cache les résultats de recherche
      cacheRef.current.searchResults[cacheKey] = {
        data: transformedResults,
        timestamp: Date.now()
      };
      
      setEntities(transformedResults);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError(`Erreur lors de la recherche: ${err.message}`);
    } finally {
      setSearchLoading(false);
    }
  }, [collectionName, loadEntities, pageSize, searchFields, transformData]);
  
  // Fonction pour mettre à jour les filtres
  const updateFilters = useCallback((filters) => {
    filterRef.current = filters;
    loadEntities(true);
  }, [loadEntities]);
  
  // Fonction pour changer le tri
  const changeSort = useCallback((field, direction = 'asc') => {
    currentQueryOptionsRef.current.orderField = field;
    currentQueryOptionsRef.current.orderDirection = direction;
    loadEntities(true);
  }, [loadEntities]);
  
  // Charger les entités au montage
  useEffect(() => {
    if (autoLoad) {
      loadEntities(true);
    }
  }, [autoLoad, loadEntities]);

  return {
    entities,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore: () => loadEntities(false),
    refresh: () => loadEntities(true),
    search: performSearch,
    searchLoading,
    updateFilters,
    changeSort,
    clearCache: () => {
      cacheRef.current = { entities: {}, queries: {}, searchResults: {} };
    }
  };
};

export default useGenericEntityList;