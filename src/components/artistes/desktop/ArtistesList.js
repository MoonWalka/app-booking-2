// src/components/artistes/desktop/ArtistesList.js
import React, { useState, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './ArtistesList.module.css';

// Import custom hooks
import useArtistesList from '@/hooks/artistes/useArtistesList';
import useSearchAndFilter from '@/hooks/artistes/useSearchAndFilter';
import useHandleDeleteArtist from '@/hooks/artistes/useHandleDeleteArtist';

// Import UI components
import ArtistesListHeader from '../sections/ArtistesListHeader';
import ArtistesStatsCards from '../sections/ArtistesStatsCards';
import ArtisteSearchBar from '../sections/ArtisteSearchBar';
import ArtistesTable from '../sections/ArtistesTable';
import ArtistesEmptyState from '../sections/ArtistesEmptyState';
import ArtistesLoadMore from '../sections/ArtistesLoadMore';

/**
 * Component that displays a list of artists with search, filters, and pagination
 */
const ArtistesList = () => {
  const navigate = useNavigate();
  // State for sorting
  const [sortByField, setSortByField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');

  // Custom hook for fetching and managing artists data
  const {
    artistes,
    loading,
    stats,
    hasMore,
    loadMoreArtistes,
    fetchArtistes,
    setArtistes
  } = useArtistesList(20, sortByField, sortDirection);

  // Custom hook for search and filtering
  const {
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    showDropdown,
    setShowDropdown,
    sortBy,
    setSortBy,
    searchInputRef,
    handleSearchChange,
    handleSortChange,
    handleCreateArtiste,
    filteredArtistes,
    noResults
  } = useSearchAndFilter(artistes);

  // Custom hook for deleting artists
  const { handleDelete } = useHandleDeleteArtist(setArtistes, stats);

  // Effect to fetch artists when sort parameters change
  useEffect(() => {
    if (sortBy !== sortByField || sortDirection !== sortDirection) {
      setSortByField(sortBy);
      setSortDirection(sortDirection);
    }
  }, [sortBy, sortDirection]);

  // Navigate to the new artist form
  const handleAddClick = () => {
    navigate('/artistes/nouveau');
  };

  // Handle clearing the search input
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Loading state
  if (loading && artistes.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary" className="me-2" />
        <span>Chargement des artistes...</span>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header with title and add button */}
      <ArtistesListHeader onAddClick={handleAddClick} />
      
      {/* Statistics cards */}
      <ArtistesStatsCards stats={stats} />
      
      {/* Search and filter bar */}
      <ArtisteSearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        filter={filter}
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
      
      {/* Table or Empty state */}
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
      
      {/* Load more button (when there are more artists to load) */}
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