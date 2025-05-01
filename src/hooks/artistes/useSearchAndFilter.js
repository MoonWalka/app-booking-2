// src/hooks/artistes/useSearchAndFilter.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle search, filtering and dropdown functionality
 * @param {Array} artistes - List of artistes to filter
 * @returns {Object} - Search and filter state and handlers
 */
export const useSearchAndFilter = (artistes) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('tous');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Handle dropdown visibility based on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search term changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  // Sort change handler
  const handleSortChange = (field) => {
    if (field === sortBy) {
      // If clicking on same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If new field, set field and default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Handle creating a new artiste from search
  const handleCreateArtiste = () => {
    // Navigate to form with pre-filled name
    navigate(`/artistes/nouveau?nom=${encodeURIComponent(searchTerm)}`);
  };

  // Filter artistes based on search term and filter
  const filteredArtistes = artistes.filter(artiste => {
    // Apply search filter
    const matchesSearch = artiste.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply specific filters
    if (filter === 'tous') return matchesSearch;
    if (filter === 'avecConcerts') return matchesSearch && artiste.concertsAssocies?.length > 0;
    if (filter === 'sansConcerts') return matchesSearch && (!artiste.concertsAssocies || artiste.concertsAssocies.length === 0);
    
    return matchesSearch;
  });

  // Determine if no results match the search
  const noResults = searchTerm.length > 0 && filteredArtistes.length === 0;

  return {
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    showDropdown,
    setShowDropdown,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    searchInputRef,
    handleSearchChange,
    handleSortChange,
    handleCreateArtiste,
    filteredArtistes,
    noResults
  };
};

export default useSearchAndFilter;