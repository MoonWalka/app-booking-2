// src/hooks/artistes/useArtisteSearchOptimized.js
import { useNavigate } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { useGenericEntitySearch } from '@/hooks/common';

/**
 * Hook optimisé pour la recherche et le filtrage des artistes
 * Version améliorée avec une meilleure organisation et gestion du cache
 * 
 * @param {Object} options - Options de configuration pour la recherche
 * @returns {Object} États et fonctions pour gérer la recherche et le filtrage des artistes
 */
const useArtisteSearchOptimized = (options = {}) => {
  const navigate = useNavigate();
  const {
    // Source de données (client ou server)
    initialArtistes = [],
    
    // Options de recherche
    maxResults = 20,
    minSearchLength = 2,
    debounceTime = 300,
    
    // Options UI
    showCreateOption = true,
    createOptionLabel = 'Créer un nouvel artiste',
    noResultsMessage = 'Aucun artiste trouvé',
    loadingMessage = 'Recherche en cours...',
    dropdownRef = null,
    
    // Callbacks
    onSelect = null,
    onRemove = null,
    
    // Navigation
    createPath = '/artistes/nouveau',
    
    // Mode de sélection
    allowMultiple = false,
    initialSelection = null
  } = options;
  
  // Déterminer le mode de recherche (client ou server)
  const searchMode = initialArtistes.length > 0 ? 'client' : 'server';
  
  // Définir les filtres spécifiques aux artistes
  const artisteFilters = {
    tous: () => true,
    avecConcerts: (artiste) => artiste.concertsAssocies?.length > 0,
    sansConcerts: (artiste) => !artiste.concertsAssocies || artiste.concertsAssocies.length === 0,
    actifs: (artiste) => artiste.statut === 'actif',
    inactifs: (artiste) => artiste.statut === 'inactif',
    enTournee: (artiste) => artiste.enTournee === true,
    horsTournee: (artiste) => artiste.enTournee !== true,
    avecManager: (artiste) => !!artiste.managerId,
    sansManager: (artiste) => !artiste.managerId
  };
  
  // Options de tri améliorées
  const sortOptions = [
    { id: 'nom-asc', field: 'nom', direction: 'asc', label: 'Nom (A-Z)' },
    { id: 'nom-desc', field: 'nom', direction: 'desc', label: 'Nom (Z-A)' },
    { id: 'dateCreation-desc', field: 'dateCreation', direction: 'desc', label: 'Plus récents' },
    { id: 'dateCreation-asc', field: 'dateCreation', direction: 'asc', label: 'Plus anciens' },
    { id: 'popularite-desc', field: 'popularite', direction: 'desc', label: 'Plus populaires' },
    { id: 'popularite-asc', field: 'popularite', direction: 'asc', label: 'Moins populaires' }
  ];
  
  // Configuration pour useGenericEntitySearch
  const searchConfig = {
    entityType: 'artistes',
    searchConfig: {
      searchFields: ['nom', 'style', 'email', 'telephone', 'description', 'origine'],
      searchMode,
      minTermLength: minSearchLength,
      maxResults,
      debounceTime,
      cacheResults: false // Désactivation du cache pour éviter les données obsolètes
    },
    filterConfig: {
      filters: artisteFilters,
      defaultFilter: 'tous',
      sortOptions,
      defaultSortOption: 'nom-asc'
    },
    selectionConfig: {
      initialSelection,
      allowMultiple,
      onSelect,
      onRemove,
      onCreateNew: (searchTerm) => {
        // Navigation vers le formulaire de création d'artiste avec le nom pré-rempli
        if (createPath) {
          navigate(`${createPath}?nom=${encodeURIComponent(searchTerm)}`);
        }
      }
    },
    uiConfig: {
      dropdownRef,
      showCreateOption,
      createOptionLabel,
      noResultsMessage,
      loadingMessage
    }
  };
  
  // Si des artistes sont fournis en mode client, les utiliser comme source de données
  if (searchMode === 'client') {
    searchConfig.searchConfig.customQuery = async () => initialArtistes;
  }
  
  // Utiliser le hook générique avec notre configuration
  const genericSearch = useGenericEntitySearch(searchConfig);
  
  // Calculer les statistiques des artistes de manière optimisée
  const artistesStats = useMemo(() => {
    const sourceArtistes = searchMode === 'client' ? initialArtistes : genericSearch.results;
    if (!Array.isArray(sourceArtistes) || sourceArtistes.length === 0) {
      return {
        total: 0,
        avecConcerts: 0,
        sansConcerts: 0,
        actifs: 0,
        inactifs: 0,
        enTournee: 0,
        horsTournee: 0,
        avecManager: 0,
        sansManager: 0
      };
    }
    
    // Calcul en une seule boucle pour plus d'efficacité
    return sourceArtistes.reduce((stats, artiste) => {
      stats.total++;
      
      if (artisteFilters.avecConcerts(artiste)) stats.avecConcerts++;
      else stats.sansConcerts++;
      
      if (artisteFilters.actifs(artiste)) stats.actifs++;
      else stats.inactifs++;
      
      if (artisteFilters.enTournee(artiste)) stats.enTournee++;
      else stats.horsTournee++;
      
      if (artisteFilters.avecManager(artiste)) stats.avecManager++;
      else stats.sansManager++;
      
      return stats;
    }, {
      total: 0,
      avecConcerts: 0,
      sansConcerts: 0,
      actifs: 0,
      inactifs: 0,
      enTournee: 0,
      horsTournee: 0,
      avecManager: 0,
      sansManager: 0
    });
  }, [searchMode, initialArtistes, genericSearch.results, artisteFilters]);
  
  // Fonction de tri améliorée pour plus de flexibilité
  const sortArtistes = useCallback((artistes, field, direction) => {
    if (!artistes || !Array.isArray(artistes)) return [];
    
    const sortedArtistes = [...artistes];
    const directionModifier = direction === 'asc' ? 1 : -1;
    
    return sortedArtistes.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Traitement spécial selon le type de champ
      if (field === 'nom' || field === 'style' || field === 'origine') {
        aValue = (aValue || '').toLowerCase();
        bValue = (bValue || '').toLowerCase();
        return directionModifier * aValue.localeCompare(bValue);
      }
      
      // Pour les dates
      if (field === 'dateCreation' || field === 'updatedAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      // Pour les nombres
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return directionModifier * (aValue - bValue);
      }
      
      // Cas par défaut
      if (aValue < bValue) return -1 * directionModifier;
      if (aValue > bValue) return 1 * directionModifier;
      return 0;
    });
  }, []);
  
  // API simplifiée pour une meilleure expérience développeur
  return {
    // États principaux
    searchTerm: genericSearch.searchTerm,
    setSearchTerm: genericSearch.setSearchTerm,
    results: genericSearch.results,
    filteredResults: genericSearch.filteredResults,
    loading: genericSearch.isLoading,
    error: genericSearch.error,
    
    // Sélection et manipulation
    selectedItems: genericSearch.selectedItems,
    handleSelect: genericSearch.handleSelect,
    handleRemove: genericSearch.handleRemove,
    handleCreateNew: genericSearch.handleCreateNew,
    
    // Interface utilisateur
    showResults: genericSearch.showResults,
    setShowResults: genericSearch.setShowResults,
    
    // Filtrage et tri
    filter: genericSearch.activeFilter,
    setFilter: genericSearch.setActiveFilter,
    availableFilters: Object.keys(artisteFilters),
    sortOption: genericSearch.activeSortOption,
    setSortOption: genericSearch.setActiveSortOption,
    availableSortOptions: sortOptions,
    
    // Fonctions utilitaires
    reset: genericSearch.reset,
    refresh: genericSearch.refreshResults,
    sortArtistes,
    
    // Statistiques
    artistesStats,
    
    // Alias pour une meilleure compatibilité avec les anciens composants
    artistes: genericSearch.results,
    filteredArtistes: genericSearch.filteredResults,
    isSearching: genericSearch.isLoading
  };
};

export default useArtisteSearchOptimized;