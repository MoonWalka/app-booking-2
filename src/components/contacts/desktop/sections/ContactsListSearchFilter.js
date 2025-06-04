import React from 'react';
import styles from '../ContactsList.module.css';

const ContactsListSearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredCount, 
  totalCount, 
  filterStructure, 
  setFilterStructure, 
  sortOption, 
  setSortOption, 
  structures,
  showAdvancedFilters,
  setShowAdvancedFilters,
  hasActiveAdvancedFilters,
  handleResetAdvancedFilters,
  activeFiltersCount
}) => {
  const searchInputRef = React.useRef(null);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchBox}>
        <i className={`bi bi-search ${styles.searchIcon}`}></i>
        <input
          ref={searchInputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher un contact..."
          value={searchTerm || ''}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className={styles.clearSearch}
            aria-label="Effacer la recherche"
            onClick={() => setSearchTerm('')}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
      <button
        type="button"
        className={`${styles.toggleButton} ${showAdvancedFilters ? styles.active : ''}`}
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
      >
        <i className="bi bi-funnel"></i>
        Filtres avancés
        {hasActiveAdvancedFilters() && (
          <span className={styles.activeFiltersBadge}>
            {activeFiltersCount}
          </span>
        )}
        <i className={`bi ${showAdvancedFilters ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
      </button>
      {hasActiveAdvancedFilters() && (
        <button
          type="button"
          className={styles.resetFiltersButton}
          onClick={handleResetAdvancedFilters}
          title="Réinitialiser tous les filtres"
        >
          <i className="bi bi-x-circle"></i>
          Réinitialiser
        </button>
      )}
    </div>
  );
};

export default ContactsListSearchFilter; 