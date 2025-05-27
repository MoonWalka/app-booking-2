/**
 * Hook optimisé pour la liste des artistes basé sur useGenericEntityList
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 * 
 * CORRECTIONS APPLIQUÉES POUR ÉVITER LES BOUCLES DE RE-RENDERS :
 * - Stabilisation de la fonction transformItem avec useCallback
 * - Configuration stable avec useMemo
 * - Évitement des dépendances circulaires
 * - Utilisation de useRef pour les callbacks
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  // 🧪 DIAGNOSTIC: Compteur de renders
  console.count("🎨 [ARTISTES] useArtistesList render");
  
  // États locaux
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  // Références stables
  const isCalculatingRef = useRef(false);
  const entityListRef = useRef(null);

  // ✅ CORRECTION 1: Fonction de transformation stable
  const transformItem = useCallback((data) => ({
    ...data,
    hasConcerts: !!(data.concertsAssocies && data.concertsAssocies.length > 0)
  }), []); // Pas de dépendances car la logique est statique

  // ✅ CORRECTION 2: Configuration stable avec useMemo
  const listConfig = useMemo(() => ({
    pageSize,
    defaultSort: { field: sortField, direction: sortDirection },
    defaultFilters: {},
    enableSelection: false,
    enableFilters: true,
    enableSearch: true,
    searchFields: ['nom', 'genre', 'tags'],
    transformItem
  }), [pageSize, sortField, sortDirection, transformItem]);

  const options = useMemo(() => ({
    paginationType: 'pages',
    enableVirtualization: false,
    enableCache: true,
    enableRealTime: false,
    enableBulkActions: false,
    autoRefresh: false
  }), []);

  // Hook générique avec configuration stable
  const entityList = useGenericEntityList('artistes', listConfig, options);

  // Stocker la référence stable
  entityListRef.current = entityList;

  // ✅ CORRECTION 3: Fonction de calcul des stats stable
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
      
      const newStats = {
        total: snapshot.size,
        avecConcerts,
        sansConcerts
      };

      // ✅ CORRECTION 4: Éviter les mises à jour inutiles
      setStats(prevStats => {
        if (prevStats.total === newStats.total && 
            prevStats.avecConcerts === newStats.avecConcerts && 
            prevStats.sansConcerts === newStats.sansConcerts) {
          return prevStats;
        }
        return newStats;
      });
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
    } finally {
      isCalculatingRef.current = false;
    }
  }, []); // Pas de dépendances car utilise des refs

  // ✅ CORRECTION 5: Effet pour le calcul initial des stats - une seule fois
  useEffect(() => {
    calculateStats();
  }, [calculateStats]); // Inclure calculateStats dans les dépendances

  // ✅ CORRECTION 6: Rafraîchissement avec stats stable
  const refreshWithStats = useCallback(async () => {
    if (!entityListRef.current) return;
    
    await entityListRef.current.refetch();
    await calculateStats();
  }, [calculateStats]);

  // ✅ CORRECTION 7: Filtres spécifiques aux artistes stables
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filterByGenre = useCallback((genre) => {
    if (!entityListRef.current) return;
    if (!genre) {
      entityListRef.current.setFilter('genre', null);
      setFilter('genre', null);
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
    if (entityListRef.current?.clearFilters) {
      entityListRef.current.clearFilters();
    }
  }, []);

  // ✅ CORRECTION 8: Alias stables pour la compatibilité
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

  // ✅ CORRECTION 9: Effet pour la recherche stable
  useEffect(() => {
    if (!entityListRef.current) return;
    if (searchTerm && entityListRef.current.search) {
      entityListRef.current.search(searchTerm);
    } else if (!searchTerm && entityListRef.current.clearSearch) {
      entityListRef.current.clearSearch();
    }
  }, [searchTerm]);

  // ✅ CORRECTION 10: Supprimer l'effet qui cause la boucle
  // L'effet qui recalculait les stats à chaque changement d'items a été supprimé
  // car il créait une boucle infinie

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