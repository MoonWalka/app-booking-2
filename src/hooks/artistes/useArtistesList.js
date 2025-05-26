/**
 * Hook optimisé pour la liste des artistes basé sur useGenericEntityList
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGenericEntityList } from '@/hooks/generics';
import { collection, getDocs, query } from '@/services/firebase-service';
import { db } from '@/services/firebase-service';

/**
 * Hook optimisé pour gérer une liste d'artistes avec pagination et filtres
 * @param {Object} options - Options de configuration
 * @param {number} [options.pageSize=20] - Nombre d'artistes par page
 * @param {string} [options.sortField='nom'] - Champ de tri
 * @param {string} [options.sortDirection='asc'] - Direction de tri ('asc' ou 'desc')
 * @returns {Object} API pour gérer la liste d'artistes
 */
export const useArtistesList = ({
  pageSize = 20,
  sortField = 'nom',
  sortDirection = 'asc',
  initialFilters = []
} = {}) => {
  // États locaux
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  // Références stables
  const statsRef = useRef(stats);
  const isCalculatingRef = useRef(false);
  const entityListRef = useRef(null);
  const searchTermRef = useRef(searchTerm);
  const filtersRef = useRef(filters);

  // Mise à jour des refs
  useEffect(() => {
    statsRef.current = stats;
    searchTermRef.current = searchTerm;
    filtersRef.current = filters;
  }, [stats, searchTerm, filters]);

  // Hook générique avec configuration stable
  const entityList = useGenericEntityList('artistes', {
    pageSize,
    defaultSort: { field: sortField, direction: sortDirection },
    defaultFilters: {},
    enableSelection: false,
    enableFilters: true,
    enableSearch: true,
    searchFields: ['nom', 'genre', 'tags'],
    transformItem: (data) => ({
      ...data,
      hasConcerts: !!(data.concertsAssocies && data.concertsAssocies.length > 0)
    })
  }, {
    paginationType: 'pages',
    enableVirtualization: false,
    enableCache: true,
    enableRealTime: false,
    enableBulkActions: false,
    autoRefresh: false
  });

  // DEBUG: Ajouter des logs pour voir ce qui se passe
  useEffect(() => {
    // console.log('🔍 [useArtistesList] entityList state:', {
    //   items: entityList.items,
    //   loading: entityList.loading,
    //   error: entityList.error,
    //   itemsLength: entityList.items?.length || 0
    // });
  }, [entityList.items, entityList.loading, entityList.error]);

  // Stocker la référence stable
  entityListRef.current = entityList;

  // Fonction de calcul des stats avec guard
  const calculateStats = useCallback(async () => {
    if (isCalculatingRef.current) return;
    
    try {
      isCalculatingRef.current = true;
      const artistesQuery = query(collection(db, 'artistes'));
      const snapshot = await getDocs(artistesQuery);
      
      let avecConcerts = 0;
      let sansConcerts = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.concertsAssocies && data.concertsAssocies.length > 0) {
          avecConcerts++;
        } else {
          sansConcerts++;
        }
      });
      
      setStats(prevStats => {
        // Ne mettre à jour que si les valeurs ont changé
        if (prevStats.total === snapshot.size && 
            prevStats.avecConcerts === avecConcerts && 
            prevStats.sansConcerts === sansConcerts) {
          return prevStats;
        }
        return {
          total: snapshot.size,
          avecConcerts,
          sansConcerts
        };
      });
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
    } finally {
      isCalculatingRef.current = false;
    }
  }, []); // Dépendances vides car utilise des refs

  // Effet pour le calcul initial des stats
  useEffect(() => {
    calculateStats();
  }, [calculateStats]); // Ajout de la dépendance manquante

  // Rafraîchissement avec stats
  const refreshWithStats = useCallback(async () => {
    if (!entityListRef.current) return;
    
    await entityListRef.current.refresh();
    await calculateStats();
  }, [calculateStats]); // Ajout de la dépendance manquante

  // ================== Gestion des filtres ==================
  // Déclaration anticipée pour éviter no-use-before-define
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Filtres spécifiques aux artistes
  const filterByGenre = useCallback((genre) => {
    if (!entityListRef.current) return;
    if (!genre) {
      entityListRef.current.setFilter('genre', null);
      setFilter('genre', null); // mettre à jour l'état local pour l'UI
    } else {
      entityListRef.current.setFilter('genre', genre);
      setFilter('genre', genre);
    }
  }, [setFilter]);

  const filterByHasConcerts = useCallback((hasConcerts = true) => {
    if (!entityListRef.current) return;
    entityListRef.current.setFilter('hasConcerts', hasConcerts);
    setFilter('hasConcerts', hasConcerts);
  }, [setFilter]);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  // Alias stables pour la compatibilité
  const setSortBy = useCallback((field) => {
    if (entityListRef.current?.setSortField) {
      entityListRef.current.setSortField(field);
    }
  }, []);

  const setSortDirection = useCallback((direction) => {
    if (entityListRef.current?.setSortDirection) {
      entityListRef.current.setSortDirection(direction);
    }
  }, []);

  const setArtistes = useCallback((updater) => {
    if (!entityListRef.current?.setItems) return;
    
    if (typeof updater === 'function') {
      entityListRef.current.setItems(prevItems => updater(prevItems));
    } else {
      entityListRef.current.setItems(updater);
    }
  }, []);

  // Effet pour déclencher la recherche lorsque searchTerm change
  useEffect(() => {
    if (!entityListRef.current) return;
    if (searchTerm && entityListRef.current.search) {
      entityListRef.current.search(searchTerm);
    } else if (!searchTerm && entityListRef.current.clearSearch) {
      entityListRef.current.clearSearch();
    }
  }, [searchTerm]);

  // Effet pour mettre à jour les stats quand la liste change
  useEffect(() => {
    if (entityList.items) {
      calculateStats();
    }
  }, [entityList.items, calculateStats]);

  // DEBUG: Test direct de la base de données
  useEffect(() => {
    const testDirectQuery = async () => {
      try {
        // console.log('🔍 [useArtistesList] Test direct de la base de données...');
        // const artistesQuery = query(collection(db, 'artistes'));
        // const snapshot = await getDocs(artistesQuery);
        // console.log('🔍 [useArtistesList] Résultat direct:', {
        //   size: snapshot.size,
        //   empty: snapshot.empty,
        //   docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // });
      } catch (error) {
        console.error('❌ [useArtistesList] Erreur test direct:', error);
      }
    };
    
    testDirectQuery();
  }, []); // Une seule fois au montage

  // DEBUG: Logs pour useGenericEntityList
  useEffect(() => {
    // console.log('🔍 [useArtistesList] Configuration entityList:', {
    //   entityType: 'artistes',
    //   pageSize,
    //   sortField,
    //   sortDirection,
    //   enableFilters: true,
    //   enableSearch: true,
    //   searchFields: ['nom', 'genre', 'tags']
    // });
  }, [pageSize, sortField, sortDirection]);

  // DEBUG: Logs pour les données de entityList
  useEffect(() => {
    // console.log('🔍 [useArtistesList] entityList détaillé:', {
    //   items: entityList.items,
    //   loading: entityList.loading,
    //   error: entityList.error,
    //   data: entityList.data,
    //   fetchedItems: entityList.fetchedItems,
    //   allItems: entityList.allItems,
    //   finalItems: entityList.finalItems
    // });
  }, [entityList]);

  return {
    ...entityList,
    artistes: entityList.items || [],
    stats,
    refreshWithStats,
    filterByGenre,
    filterByHasConcerts,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    sortBy: entityList.sortField || sortField,
    setSortBy,
    sortDirection: entityList.sortDirection || sortDirection,
    setSortDirection,
    hasMore: entityList.hasMore || false,
    loadMoreArtistes: entityList.loadMore || (() => {}),
    setArtistes
  };
};

export default useArtistesList;