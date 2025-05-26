// src/components/artistes/desktop/ArtistesList.js
import React, { useState, useCallback, useRef } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import styles from './ArtistesList.module.css';

// MIGRATION: Utilisation des hooks optimisés au lieu des versions V2
import { useArtistesList, useDeleteArtiste } from '@/hooks/artistes';

// Import des composants UI
import ArtistesListHeader from '../sections/ArtistesListHeader';
import ArtistesStatsCards from '../sections/ArtistesStatsCards';
import ArtisteSearchBar from '../sections/ArtisteSearchBar';
import ArtistesTable from '../sections/ArtistesTable';
import ArtistesEmptyState from '../sections/ArtistesEmptyState';
import ArtistesLoadMore from '../sections/ArtistesLoadMore';

/**
 * Composant qui affiche une liste d'artistes avec recherche, filtres et pagination
 * Refactorisé pour utiliser useArtistesList basé sur hooks génériques optimisés
 */
const ArtistesList = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // MIGRATION: Utilisation du hook optimisé
  const {
    artistes,
    loading,
    stats,
    error,
    hasMore,
    loadMoreArtistes,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    setArtistes
  } = useArtistesList({
    pageSize: 20,
    initialSortField: 'nom',
    initialSortDirection: 'asc',
    cacheEnabled: false
  });

  // MIGRATION: Utilisation du hook optimisé pour la suppression
  const { handleDelete } = useDeleteArtiste(useCallback((deletedId) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      setArtistes(prevArtistes => prevArtistes.filter(a => a.id !== deletedId));
    } finally {
      isUpdatingRef.current = false;
    }
  }, [setArtistes]));

  // Navigation vers le formulaire de création d'artiste
  const handleAddClick = useCallback(() => {
    navigate('/artistes/nouveau');
  }, [navigate]);

  // Gestion de la recherche
  const handleSearchChange = useCallback((e) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      setSearchTerm(e.target.value);
      setShowDropdown(!!e.target.value);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [setSearchTerm]);

  // Effacement de la recherche
  const handleClearSearch = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      setSearchTerm('');
      setShowDropdown(false);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [setSearchTerm]);

  // Gestion du changement de filtre
  const handleFilterChange = useCallback((e) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      setFilter('status', e.target.value);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [setFilter]);

  // Gestion du changement de tri
  const handleSortChange = useCallback((value) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      setSortBy(value);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [setSortBy]);

  // Gestion du changement de direction de tri
  const handleSortDirectionToggle = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [sortDirection, setSortDirection]);

  // Réinitialisation de tous les filtres
  const handleResetFilters = useCallback(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    
    try {
      resetFilters();
      setSearchTerm('');
      setShowDropdown(false);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [resetFilters, setSearchTerm]);

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = useCallback(() => {
    return searchTerm || (filters && Object.values(filters).some(f => f && f !== 'all'));
  }, [searchTerm, filters]);

  // Création d'un nouvel artiste depuis la barre de recherche
  const handleCreateArtiste = useCallback(() => {
    navigate('/artistes/nouveau', { state: { initialNom: searchTerm } });
  }, [navigate, searchTerm]);

  // État de chargement
  if (loading && artistes.length === 0) {
    return (
      <Container className={styles.spinnerContainer}>
        <Spinner animation="border" role="status" variant="primary" className="me-2" />
        <span>Chargement des artistes...</span>
      </Container>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          Une erreur est survenue lors du chargement des artistes : {error.message || error}
        </Alert>
      </Container>
    );
  }

  // On peut considérer que tous les artistes sont déjà filtrés par useGenericEntityList
  const filteredArtistes = artistes;
  const noResults = searchTerm && filteredArtistes.length === 0;

  return (
    <Container className={styles.artistesContainer}>
      {/* En-tête avec titre et bouton d'ajout */}
      <ArtistesListHeader onAddClick={handleAddClick} />
      
      {/* Cartes de statistiques */}
      <ArtistesStatsCards stats={stats} />
      
      {/* Barre de recherche et de filtrage */}
      <ArtisteSearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        filter={(filters && filters.status) || ''}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortDirection={sortDirection}
        onSortDirectionToggle={handleSortDirectionToggle}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters()}
        showDropdown={showDropdown}
        searchResults={filteredArtistes}
        noResults={noResults}
        onCreateArtiste={handleCreateArtiste}
        searchInputRef={searchInputRef}
      />
      
      {/* Tableau ou état vide */}
      {filteredArtistes.length > 0 ? (
        <ArtistesTable 
          artistes={filteredArtistes} 
          onDelete={handleDelete}
        />
      ) : (
        <ArtistesEmptyState 
          searchTerm={searchTerm}
          onAddClick={handleAddClick}
        />
      )}
      
      {/* Bouton "Charger plus" (quand il y a plus d'artistes à charger) */}
      {filteredArtistes.length > 0 && hasMore && (
        <ArtistesLoadMore 
          loading={loading} 
          onLoadMore={loadMoreArtistes}
        />
      )}
    </Container>
  );
};

export default ArtistesList;