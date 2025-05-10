/**
 * Hook optimisé pour les filtres et la recherche de lieux
 * basé sur useGenericEntityList
 * 
 * Cette implémentation suit l'approche RECOMMANDÉE pour les nouveaux développements
 * en utilisant directement les hooks génériques.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGenericEntityList } from '@/hooks/common';

/**
 * Hook optimisé pour le filtrage et la recherche de lieux
 * 
 * @param {Object} options - Options de configuration
 * @param {number} [options.pageSize=50] - Nombre de lieux par page
 * @param {string} [options.initialSortField='nom'] - Champ de tri initial
 * @param {string} [options.initialSortDirection='asc'] - Direction de tri initiale
 * @returns {Object} API pour le filtrage et la recherche de lieux
 */
export const useLieuxFiltersOptimized = ({
  pageSize = 50,
  initialSortField = 'nom',
  initialSortDirection = 'asc'
} = {}) => {
  // États pour les filtres spécifiques aux lieux
  const [filterType, setFilterType] = useState('tous');
  const [filterRegion, setFilterRegion] = useState('toutes');
  const [filterVille, setFilterVille] = useState('toutes');
  const [types, setTypes] = useState(['tous']);
  const [regions, setRegions] = useState(['toutes']);
  const [villes, setVilles] = useState(['toutes']);
  
  // Utilisation du hook générique pour les listes
  const entityList = useGenericEntityList({
    collectionName: 'lieux',
    pageSize,
    sortByField: initialSortField,
    sortDirection: initialSortDirection,
    // Transformation des données pour ajouter des champs utiles
    transformData: (data) => ({
      ...data,
      // Ajouter des champs normalisés pour les filtres
      region: data.region || 'Non spécifiée',
      type: data.type || 'Non spécifié',
      // S'assurer que les propriétés essentielles existent
      ville: data.ville || 'Non spécifiée',
      // Formater l'adresse complète pour l'affichage
      adresseComplete: data.adresse ? 
        `${data.adresse}, ${data.codePostal || ''} ${data.ville || ''}, ${data.pays || 'France'}` : 
        'Adresse non spécifiée'
    })
  });
  
  // Extraire les valeurs uniques pour les options de filtres
  useEffect(() => {
    if (entityList.entities.length > 0) {
      // Extraire les types uniques
      const uniqueTypes = ['tous', ...new Set(
        entityList.entities
          .filter(lieu => lieu.type)
          .map(lieu => lieu.type)
      )];
      setTypes(uniqueTypes);
      
      // Extraire les régions uniques
      const uniqueRegions = ['toutes', ...new Set(
        entityList.entities
          .filter(lieu => lieu.region)
          .map(lieu => lieu.region)
      )];
      setRegions(uniqueRegions);
      
      // Extraire les villes uniques
      const uniqueVilles = ['toutes', ...new Set(
        entityList.entities
          .filter(lieu => lieu.ville)
          .map(lieu => lieu.ville)
      )];
      setVilles(uniqueVilles);
    }
  }, [entityList.entities]);
  
  // Appliquer les filtres via le hook générique
  useEffect(() => {
    // Réinitialiser les filtres existants
    entityList.filters.forEach(filter => {
      entityList.removeFilter(filter.field);
    });
    
    // Ajouter le filtre de type si nécessaire
    if (filterType !== 'tous') {
      entityList.applyFilter({
        field: 'type',
        operator: '==',
        value: filterType
      });
    }
    
    // Ajouter le filtre de région si nécessaire
    if (filterRegion !== 'toutes') {
      entityList.applyFilter({
        field: 'region',
        operator: '==',
        value: filterRegion
      });
    }
    
    // Ajouter le filtre de ville si nécessaire
    if (filterVille !== 'toutes') {
      entityList.applyFilter({
        field: 'ville',
        operator: '==',
        value: filterVille
      });
    }
  }, [filterType, filterRegion, filterVille, entityList.applyFilter, entityList.removeFilter]);
  
  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilterType('tous');
    setFilterRegion('toutes');
    setFilterVille('toutes');
    entityList.setSearch('');
    // Les filtres seront supprimés via l'effet ci-dessus
  }, [entityList]);
  
  // Préparer les options de tri
  const sortOptions = useMemo(() => [
    { value: 'nom_asc', label: 'Nom (A-Z)' },
    { value: 'nom_desc', label: 'Nom (Z-A)' },
    { value: 'ville_asc', label: 'Ville (A-Z)' },
    { value: 'ville_desc', label: 'Ville (Z-A)' },
    { value: 'capacite_asc', label: 'Capacité (croissante)' },
    { value: 'capacite_desc', label: 'Capacité (décroissante)' }
  ], []);
  
  // État pour l'option de tri actuelle
  const [sortOption, setSortOptionInternal] = useState(`${initialSortField}_${initialSortDirection}`);
  
  // Gérer le changement d'option de tri
  const setSortOption = useCallback((option) => {
    setSortOptionInternal(option);
    const [field, direction] = option.split('_');
    entityList.setSorting(field, direction);
  }, [entityList]);

  return {
    // Renommer entities en lieux pour une meilleure DX
    lieux: entityList.entities,
    filteredLieux: entityList.entities, // Pour compatibilité
    
    // Propriétés du hook générique
    loading: entityList.loading,
    error: entityList.error,
    refresh: entityList.refresh,
    loadMore: entityList.loadMore,
    hasMore: entityList.hasMore,
    
    // Filtres spécifiques aux lieux
    filterType,
    setFilterType,
    filterRegion,
    setFilterRegion,
    filterVille,
    setFilterVille,
    
    // Listes d'options pour les filtres
    types,
    regions,
    villes,
    
    // Recherche (provenant du hook générique)
    searchTerm: entityList.search,
    setSearchTerm: entityList.setSearch,
    
    // Options de tri
    sortOption,
    setSortOption,
    sortOptions,
    
    // Actions
    resetFilters,
    
    // États dérivés
    isEmpty: entityList.isEmpty,
    isFiltered: filterType !== 'tous' || filterRegion !== 'toutes' || filterVille !== 'toutes' || entityList.search !== '',
  };
};

export default useLieuxFiltersOptimized;