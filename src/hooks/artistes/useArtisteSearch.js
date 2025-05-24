// src/hooks/artistes/useArtisteSearch.js
import { useNavigate } from 'react-router-dom';
import { useGenericEntitySearch } from '@/hooks/common';
import { useMemo } from 'react';

/**
 * Hook spécifique pour la recherche et le filtrage des artistes
 * Utilise le hook générique useGenericEntitySearch
 * 
 * @param {Array} artistes - Liste des artistes à filtrer en mode client (optionnel)
 * @param {Object} options - Options supplémentaires pour la recherche
 * @returns {Object} - États et fonctions pour gérer la recherche et le filtrage des artistes
 */
const useArtisteSearch = (artistes = [], options = {}) => {
  const navigate = useNavigate();
  
  // NOUVEAU: Définir les filtres spécifiques aux artistes avec useMemo pour optimisation
  const artisteFilters = useMemo(() => ({
    tous: () => true,
    avecConcerts: (artiste) => artiste.concertsAssocies?.length > 0,
    sansConcerts: (artiste) => !artiste.concertsAssocies || artiste.concertsAssocies.length === 0,
    actifs: (artiste) => artiste.statut === 'actif',
    inactifs: (artiste) => artiste.statut === 'inactif',
    // NOUVEAU: Filtres avancés pour une recherche plus riche
    parGenre: (artiste, genre) => artiste.style?.toLowerCase().includes(genre?.toLowerCase()),
    recents: (artiste) => {
      if (!artiste.dateCreation) return false;
      const dateCreation = artiste.dateCreation.toDate ? artiste.dateCreation.toDate() : new Date(artiste.dateCreation);
      const unMoisEnMs = 30 * 24 * 60 * 60 * 1000;
      return (Date.now() - dateCreation.getTime()) < unMoisEnMs;
    },
    populaires: (artiste) => (artiste.concertsAssocies?.length || 0) > 5
  }), []); // Mémoïsé sans dépendances car les fonctions sont stables
  
  // Déterminer le mode de recherche en fonction de la présence d'artistes en paramètre
  const searchMode = artistes && artistes.length > 0 ? 'client' : 'server';
  
  // Configuration pour useGenericEntitySearch
  const searchConfig = {
    entityType: 'artistes',
    searchConfig: {
      searchFields: ['nom', 'style', 'email', 'telephone'],
      searchMode: searchMode,
      minTermLength: 2,
      maxResults: options.maxResults || 20,
      debounceTime: 300
    },
    filterConfig: {
      filters: artisteFilters,
      defaultFilter: 'tous',
      sortOptions: [
        { id: 'nom-asc', field: 'nom', direction: 'asc', label: 'Nom (A-Z)' },
        { id: 'nom-desc', field: 'nom', direction: 'desc', label: 'Nom (Z-A)' },
        { id: 'dateCreation-desc', field: 'dateCreation', direction: 'desc', label: 'Plus récents' },
        { id: 'dateCreation-asc', field: 'dateCreation', direction: 'asc', label: 'Plus anciens' }
      ],
      defaultSortOption: 'nom-asc'
    },
    selectionConfig: {
      initialSelection: options.initialSelection || null,
      allowMultiple: options.allowMultiple || false,
      onSelect: options.onSelect || null,
      onRemove: options.onRemove || null,
      onCreateNew: (searchTerm) => {
        // Navigation vers le formulaire de création d'artiste avec le nom pré-rempli
        navigate(`/artistes/nouveau?nom=${encodeURIComponent(searchTerm)}`);
      }
    },
    uiConfig: {
      dropdownRef: options.dropdownRef || null,
      showCreateOption: options.showCreateOption !== false,
      createOptionLabel: 'Créer un nouvel artiste',
      noResultsMessage: 'Aucun artiste trouvé',
      loadingMessage: 'Recherche en cours...'
    }
  };
  
  // Si des artistes sont fournis en mode client, les utiliser comme source de données
  if (searchMode === 'client') {
    searchConfig.searchConfig.customQuery = async () => artistes;
  }
  
  // Utiliser le hook générique
  const genericSearch = useGenericEntitySearch(searchConfig);
  
  // Calculer les statistiques des artistes
  const artistesStats = useMemo(() => {
    const sourceArtistes = searchMode === 'client' ? artistes : genericSearch.results;
    return {
      total: sourceArtistes.length,
      avecConcerts: sourceArtistes.filter(artisteFilters.avecConcerts).length,
      sansConcerts: sourceArtistes.filter(artisteFilters.sansConcerts).length,
      actifs: sourceArtistes.filter(artisteFilters.actifs).length,
      inactifs: sourceArtistes.filter(artisteFilters.inactifs).length
    };
  }, [searchMode, artistes, genericSearch.results, artisteFilters]);
  
  // Pour la compatibilité avec l'API existante de useSearchAndFilter
  const compatibilityAPI = {
    filter: genericSearch.activeFilter,
    setFilter: genericSearch.setActiveFilter,
    sortBy: genericSearch.activeSortOption?.split('-')?.[0] || 'nom',
    setSortBy: (field) => {
      const direction = genericSearch.activeSortOption?.split('-')?.[1] || 'asc';
      genericSearch.setActiveSortOption(`${field}-${direction}`);
    },
    sortDirection: genericSearch.activeSortOption?.split('-')?.[1] || 'asc',
    setSortDirection: (direction) => {
      const field = genericSearch.activeSortOption?.split('-')?.[0] || 'nom';
      genericSearch.setActiveSortOption(`${field}-${direction}`);
    },
    filteredArtistes: genericSearch.filteredResults,
    searchInputRef: genericSearch.dropdownRef,
    handleSearchChange: (e) => genericSearch.setSearchTerm(e.target.value),
    handleSortChange: (field, direction) => {
      genericSearch.setActiveSortOption(`${field}-${direction}`);
    },
    handleCreateArtiste: genericSearch.handleCreateNew,
    showDropdown: genericSearch.showResults,
    setShowDropdown: genericSearch.setShowResults
  };
  
  return {
    ...genericSearch,
    ...compatibilityAPI,
    artistesStats
  };
};

export default useArtisteSearch;