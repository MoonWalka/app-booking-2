// src/hooks/search/useSearchAndFilter.js
import { useState, useEffect, useRef } from 'react';

/**
 * Hook générique pour gérer la recherche, le filtrage et le tri des collections d'éléments
 * @param {Object} options - Options de configuration
 * @param {Array} options.items - Collection d'éléments à filtrer
 * @param {Array<string>} options.searchFields - Champs sur lesquels effectuer la recherche
 * @param {Object} options.filters - Définition des filtres disponibles
 * @param {string} options.defaultFilter - Filtre par défaut
 * @param {string} options.defaultSortField - Champ de tri par défaut
 * @param {string} options.defaultSortDirection - Direction de tri par défaut ('asc' ou 'desc')
 * @param {Function} options.onCreateItem - Callback pour créer un nouvel élément (optionnel)
 * @param {Function} options.customFilterFunction - Fonction personnalisée de filtrage (optionnelle)
 * @returns {Object} États et fonctions pour gérer la recherche et le filtrage
 */
export const useSearchAndFilter = (options) => {
  const {
    items = [],
    searchFields = ['nom'],
    filters = {
      tous: () => true
    },
    defaultFilter = 'tous',
    defaultSortField = 'nom',
    defaultSortDirection = 'asc',
    onCreateItem = null,
    customFilterFunction = null
  } = options;

  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(defaultFilter);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortBy, setSortBy] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const searchInputRef = useRef(null);

  // Handler pour les clics en dehors du dropdown
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

  // Handler pour les changements de recherche
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  // Handler pour les changements de tri
  const handleSortChange = (field) => {
    if (field === sortBy) {
      // Si même champ, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si nouveau champ, définir le champ et la direction par défaut
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Handler pour la création d'un nouvel élément
  const handleCreateItem = () => {
    if (onCreateItem) {
      onCreateItem(searchTerm);
    }
  };

  // Filtre les éléments selon le terme de recherche et le filtre sélectionné
  const filteredItems = items.filter(item => {
    // Appliquer la recherche textuelle
    const matchesSearch = searchTerm.length === 0 || searchFields.some(field => {
      const fieldValue = field.split('.').reduce((obj, key) => obj && obj[key], item);
      return fieldValue && String(fieldValue).toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Appliquer le filtre sélectionné
    const filterFunction = filters[filter] || filters.tous;
    const matchesFilter = filterFunction(item);

    // Appliquer un filtre personnalisé si fourni
    const passesCustomFilter = customFilterFunction ? customFilterFunction(item, searchTerm, filter) : true;

    return matchesSearch && matchesFilter && passesCustomFilter;
  });

  // Trier les éléments filtrés
  const sortedItems = [...filteredItems].sort((a, b) => {
    // Récupérer les valeurs à comparer
    const fieldA = sortBy.split('.').reduce((obj, key) => obj && obj[key], a);
    const fieldB = sortBy.split('.').reduce((obj, key) => obj && obj[key], b);
    
    // Gérer les valeurs null ou undefined
    if (!fieldA && !fieldB) return 0;
    if (!fieldA) return sortDirection === 'asc' ? -1 : 1;
    if (!fieldB) return sortDirection === 'asc' ? 1 : -1;
    
    // Comparer selon le type
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB, undefined, { sensitivity: 'base' })
        : fieldB.localeCompare(fieldA, undefined, { sensitivity: 'base' });
    }
    
    // Pour les nombres et autres types
    return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
  });

  // Détermine s'il n'y a pas de résultats correspondant à la recherche
  const noResults = searchTerm.length > 0 && sortedItems.length === 0;

  return {
    // États
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
    
    // Références
    searchInputRef,
    
    // Handlers
    handleSearchChange,
    handleSortChange,
    handleCreateItem,
    
    // Données filtrées et triées
    filteredItems: sortedItems,
    noResults,
    
    // Métadonnées
    totalItems: items.length,
    filteredCount: sortedItems.length,
    availableFilters: Object.keys(filters)
  };
};

export default useSearchAndFilter;