/**
 * Hook optimisé pour la liste des artistes basé sur useGenericEntityList
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 */
import { useState, useEffect, useCallback } from 'react';
import { useGenericEntityList } from '@/hooks/common';
import { collection, getDocs, query } from '@/firebaseInit';
import { db } from '@/firebaseInit';

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
  // Statistiques des artistes
  const [stats, setStats] = useState({
    total: 0,
    avecConcerts: 0,
    sansConcerts: 0
  });

  // États de recherche pour la compatibilité
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // Utilisation du hook générique pour les listes
  const entityList = useGenericEntityList({
    collectionName: 'artistes',
    pageSize,
    sortByField: sortField,
    sortDirection,
    initialFilters,
    // Champs de recherche pour les artistes
    searchFields: {
      nom: { prefix: true },
      genre: { exact: true },
      tags: { array: true }
    },
    // Transformation des données pour ajouter des champs calculés si nécessaire
    transformData: (data) => ({
      ...data,
      // Exemple de champ calculé
      hasConcerts: !!(data.concertsAssocies && data.concertsAssocies.length > 0)
    })
  });

  // Fonction pour calculer les statistiques
  const calculateStats = useCallback(async () => {
    try {
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
      
      setStats({
        total: snapshot.size,
        avecConcerts,
        sansConcerts
      });
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
    }
  }, []);

  // Charger les statistiques au montage et lors des rafraîchissements
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Recalculer les statistiques lors d'un rafraîchissement des données
  const refreshWithStats = useCallback(() => {
    entityList.refresh();
    calculateStats();
  }, [entityList, calculateStats]);

  // Filtres spécifiques aux artistes
  const filterByGenre = useCallback((genre) => {
    if (!genre) {
      entityList.removeFilter('genre');
    } else {
      entityList.applyFilter({
        field: 'genre',
        operator: '==',
        value: genre
      });
    }
  }, [entityList]);

  const filterByHasConcerts = useCallback((hasConcerts = true) => {
    entityList.applyFilter({
      field: 'hasConcerts',
      operator: '==',
      value: hasConcerts
    });
  }, [entityList]);

  // Fonctions de compatibilité pour ArtistesList
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  // Alias pour la compatibilité
  const setSortBy = entityList.setSortField || (() => {});
  const setSortDirection = entityList.setSortDirection || (() => {});
  const sortBy = entityList.sortField || sortField;
  const hasMore = entityList.hasMore || false;
  const loadMoreArtistes = entityList.loadMore || (() => {});
  const setArtistes = entityList.setEntities || (() => {});

  return {
    ...entityList,
    // Renommer entities en artistes pour maintenir la compatibilité
    artistes: entityList.entities,
    stats,
    refreshWithStats,
    
    // Ajouter des filtres spécifiques aux artistes
    filterByGenre,
    filterByHasConcerts,
    
    // Propriétés de compatibilité avec ArtistesList
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    hasMore,
    loadMoreArtistes,
    setArtistes
  };
};

export default useArtistesList;