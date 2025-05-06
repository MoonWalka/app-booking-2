// src/components/artistes/desktop/ArtistesList.js
import React, { useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './ArtistesList.module.css';

// Import des hooks personnalisés - utilisation de la version migrée
import { useArtistesListV2, useHandleDeleteArtist } from '@/hooks/artistes';

// Import des composants UI
import ArtistesListHeader from '../sections/ArtistesListHeader';
import ArtistesStatsCards from '../sections/ArtistesStatsCards';
import ArtisteSearchBar from '../sections/ArtisteSearchBar';
import ArtistesTable from '../sections/ArtistesTable';
import ArtistesEmptyState from '../sections/ArtistesEmptyState';
import ArtistesLoadMore from '../sections/ArtistesLoadMore';

/**
 * Composant qui affiche une liste d'artistes avec recherche, filtres et pagination
 * Refactorisé pour utiliser useArtistesListV2 basé sur useGenericEntityList
 */
const ArtistesList = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = React.useRef(null);

  // Utilisation du hook migré V2 qui est basé sur useGenericEntityList
  const {
    // Données principales
    artistes,
    loading,
    stats,
    error,
    
    // Pagination
    hasMore,
    loadMoreArtistes,
    
    // Recherche et filtrage
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    
    // Tri
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,

    // Actions
    setArtistes
  } = useArtistesListV2(20, 'nom', 'asc');

  // Hook pour la gestion des suppressions d'artistes
  const { handleDelete } = useHandleDeleteArtist(setArtistes, stats);

  // Navigation vers le formulaire de création d'artiste
  const handleAddClick = () => {
    navigate('/artistes/nouveau');
  };

  // Gestion de la recherche
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(!!e.target.value);
  };

  // Effacement de la recherche
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Gestion du changement de filtre
  const handleFilterChange = (e) => {
    setFilter('status', e.target.value);
  };

  // Gestion du changement de tri
  const handleSortChange = (value) => {
    setSortBy(value);
  };

  // Création d'un nouvel artiste depuis la barre de recherche
  const handleCreateArtiste = () => {
    navigate('/artistes/nouveau', { state: { initialNom: searchTerm } });
  };

  // État de chargement
  if (loading && artistes.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary" className="me-2" />
        <span>Chargement des artistes...</span>
      </Container>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <Container className="py-5 text-center">
        <div className="alert alert-danger" role="alert">
          Une erreur est survenue lors du chargement des artistes : {error.message || error}
        </div>
      </Container>
    );
  }

  // On peut considérer que tous les artistes sont déjà filtrés par useGenericEntityList
  const filteredArtistes = artistes;
  const noResults = searchTerm && filteredArtistes.length === 0;

  return (
    <Container className="py-4">
      {/* En-tête avec titre et bouton d'ajout */}
      <ArtistesListHeader onAddClick={handleAddClick} />
      
      {/* Cartes de statistiques */}
      <ArtistesStatsCards stats={stats} />
      
      {/* Barre de recherche et de filtrage */}
      <ArtisteSearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        filter={filters.status || ''}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortDirection={sortDirection}
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