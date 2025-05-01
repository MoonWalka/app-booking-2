import { useState, useEffect } from 'react';

/**
 * Custom hook to manage filtering, sorting, and searching of lieux
 * @param {Array} lieux - The array of lieux to filter
 * @returns {Object} Filtered lieux and filter state
 */
const useLieuxFilters = (lieux = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('nom-asc');
  const [filterType, setFilterType] = useState('tous');
  const [filteredLieux, setFilteredLieux] = useState([]);
  
  // Apply filters and sorting when any dependency changes
  useEffect(() => {
    const applyFiltersAndSort = () => {
      // Step 1: Filter by search term
      let result = lieux;
      
      if (searchTerm.trim() !== '') {
        const searchTermLower = searchTerm.toLowerCase();
        result = result.filter(lieu => 
          lieu.nom?.toLowerCase().includes(searchTermLower) || 
          lieu.ville?.toLowerCase().includes(searchTermLower) ||
          lieu.adresse?.toLowerCase().includes(searchTermLower) ||
          lieu.codePostal?.toLowerCase().includes(searchTermLower)
        );
      }
      
      // Step 2: Filter by venue type
      if (filterType !== 'tous') {
        if (filterType === 'avec-concerts') {
          result = result.filter(lieu => lieu.concertsAssocies && lieu.concertsAssocies.length > 0);
        } else if (filterType === 'sans-concerts') {
          result = result.filter(lieu => !lieu.concertsAssocies || lieu.concertsAssocies.length === 0);
        } else {
          // Filter by venue type (festival, salle, bar, plateau)
          result = result.filter(lieu => lieu.type === filterType);
        }
      }
      
      // Step 3: Sort results
      const [field, direction] = sortOption.split('-');
      result = [...result].sort((a, b) => {
        let comparison = 0;
        
        // Handle sorting by different fields
        if (field === 'nom') {
          comparison = (a.nom || '').localeCompare(b.nom || '');
        } else if (field === 'ville') {
          comparison = (a.ville || '').localeCompare(b.ville || '');
        } else if (field === 'jauge') {
          const jaugeA = a.jauge || 0;
          const jaugeB = b.jauge || 0;
          comparison = jaugeA - jaugeB;
        } else if (field === 'concerts') {
          const concertsA = (a.concertsAssocies?.length || 0);
          const concertsB = (b.concertsAssocies?.length || 0);
          comparison = concertsA - concertsB;
        }
        
        // Reverse sort if descending
        return direction === 'desc' ? -comparison : comparison;
      });
      
      setFilteredLieux(result);
    };

    // Apply filters with a slight delay
    const delayDebounceFn = setTimeout(() => {
      applyFiltersAndSort();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, sortOption, filterType, lieux]);

  return {
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption,
    filterType,
    setFilterType,
    filteredLieux
  };
};

export default useLieuxFilters;