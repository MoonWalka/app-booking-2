// src/hooks/artistes/useArtistesListMigrated.js
import { useCallback, useMemo } from 'react';
import { useGenericEntityList } from '@/hooks/common';

/**
 * Hook migré pour la gestion de la liste des artistes
 * Utilise useGenericEntityList comme base tout en maintenant l'API compatible 
 * avec le hook original useArtistesList
 * 
 * @param {number} pageSize - Nombre d'artistes à charger par page (défaut: 20)
 * @param {string} sortByField - Champ pour le tri (défaut: 'nom')
 * @param {string} sortDirection - Direction du tri ('asc' ou 'desc', défaut: 'asc')
 * @returns {Object} API de gestion de liste d'artistes
 */
const useArtistesListMigrated = (pageSize = 20, sortByField = 'nom', sortDirection = 'asc') => {
  // Filtres spécifiques aux artistes
  const filterConfig = {
    status: { type: 'equals' },
    genre: { type: 'equals' },
    type: { type: 'equals' }
  };

  // Configuration pour le hook générique
  const genericList = useGenericEntityList({
    // Configuration de base
    collectionName: 'artistes',
    idField: 'id',
    pageSize,
    initialSortField: sortByField,
    initialSortDirection: sortDirection,
    
    // Configuration des filtres et recherche
    filterConfig,
    searchFields: ['nom', 'style', 'email', 'telephone', 'tags'],
    
    // Transformation des données
    transformItem: (artiste) => ({
      ...artiste,
      // Ajouter des champs calculés si nécessaire
      hasConcerts: Boolean(artiste.concertsAssocies && artiste.concertsAssocies.length > 0)
    })
  });

  // Calculer des statistiques basées sur les résultats
  const stats = useMemo(() => {
    const allArtistes = genericList.allItems || [];
    return {
      total: allArtistes.length,
      avecConcerts: allArtistes.filter(a => a.concertsAssocies && a.concertsAssocies.length > 0).length,
      sansConcerts: allArtistes.filter(a => !a.concertsAssocies || a.concertsAssocies.length === 0).length
    };
  }, [genericList.allItems]);

  // Fonction pour recharger les artistes
  const fetchArtistes = useCallback((reset = true) => {
    if (reset) {
      genericList.refresh();
    } else {
      genericList.loadMore();
    }
  }, [genericList]);

  // Pour maintenir la compatibilité avec l'API originale
  return {
    // Données principales
    artistes: genericList.items || [],
    allArtistes: genericList.allItems || [],
    loading: genericList.loading,
    error: genericList.error,
    stats,
    
    // Pagination - Ajout d'une vérification de sécurité pour pagination
    hasMore: genericList.pagination?.hasMore ?? false,
    loadMoreArtistes: genericList.loadMore,
    
    // Actions
    fetchArtistes,
    setArtistes: genericList.setItems,
    
    // Recherche et filtrage
    searchTerm: genericList.searchTerm,
    setSearchTerm: genericList.setSearchTerm,
    filters: genericList.filters,
    setFilter: genericList.setFilter,
    resetFilters: genericList.resetFilters,
    
    // Tri
    sortBy: genericList.sortField,
    sortDirection: genericList.sortDirection,
    setSortBy: genericList.setSortField,
    setSortDirection: genericList.setSortDirection,
    
    // Accès complet au hook générique pour des fonctionnalités avancées
    genericList
  };
};

export default useArtistesListMigrated;