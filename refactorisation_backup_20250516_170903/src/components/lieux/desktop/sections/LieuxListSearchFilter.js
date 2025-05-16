import React, { useRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import styles from './LieuxListSearchFilter.module.css';

/**
 * Component for search, filtering, and sorting functionality in LieuxList
 */
const LieuxListSearchFilter = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  sortOption,
  setSortOption,
  filteredCount,
  totalCount
}) => {
  // Reference for the focus of the search bar
  const searchInputRef = useRef(null);

  return (
    <div className={styles.searchFilterContainer}>
      <div className={styles.searchBar}>
        <div className="input-group">
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            ref={searchInputRef}
            type="text"
            className={`form-control ${styles.searchInput}`}
            placeholder="Rechercher un lieu par nom, ville, adresse... (Ctrl+F)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          />
          {searchTerm && (
            <button 
              className={`btn btn-outline-secondary ${styles.clearSearch}`} 
              onClick={() => setSearchTerm('')}
              aria-label="Effacer la recherche"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
        {searchTerm && (
          <div className={styles.resultsCount}>
            {filteredCount} résultat{filteredCount !== 1 ? 's' : ''} trouvé{filteredCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      <div className="d-flex gap-2">
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="filter-dropdown" className={styles.modernFilterBtn}>
            <i className="bi bi-funnel me-2"></i>
            {filterType === 'tous' ? 'Tous les lieux' : 
             filterType === 'avec-concerts' ? 'Avec concerts' :
             filterType === 'sans-concerts' ? 'Sans concerts' :
             filterType === 'festival' ? 'Festivals' :
             filterType === 'salle' ? 'Salles' :
             filterType === 'bar' ? 'Bars' :
             filterType === 'plateau' ? 'Plateaux' : 'Filtrer'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setFilterType('tous')} active={filterType === 'tous'}>
              Tous les lieux
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setFilterType('avec-concerts')} active={filterType === 'avec-concerts'}>
              Avec concerts
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterType('sans-concerts')} active={filterType === 'sans-concerts'}>
              Sans concerts
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setFilterType('festival')} active={filterType === 'festival'}>
              Festivals
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterType('salle')} active={filterType === 'salle'}>
              Salles
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterType('bar')} active={filterType === 'bar'}>
              Bars
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setFilterType('plateau')} active={filterType === 'plateau'}>
              Plateaux
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="sort-dropdown" className={styles.modernSortBtn}>
            <i className="bi bi-sort-alpha-down me-2"></i>
            {sortOption === 'nom-asc' ? 'Nom (A-Z)' :
             sortOption === 'nom-desc' ? 'Nom (Z-A)' :
             sortOption === 'ville-asc' ? 'Ville (A-Z)' :
             sortOption === 'ville-desc' ? 'Ville (Z-A)' :
             sortOption === 'jauge-asc' ? 'Jauge (croissant)' :
             sortOption === 'jauge-desc' ? 'Jauge (décroissant)' :
             sortOption === 'concerts-asc' ? 'Nb. concerts (croissant)' :
             sortOption === 'concerts-desc' ? 'Nb. concerts (décroissant)' : 'Trier par'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setSortOption('nom-asc')} active={sortOption === 'nom-asc'}>
              Nom (A-Z)
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortOption('nom-desc')} active={sortOption === 'nom-desc'}>
              Nom (Z-A)
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setSortOption('ville-asc')} active={sortOption === 'ville-asc'}>
              Ville (A-Z)
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortOption('ville-desc')} active={sortOption === 'ville-desc'}>
              Ville (Z-A)
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setSortOption('jauge-asc')} active={sortOption === 'jauge-asc'}>
              Jauge (croissant)
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortOption('jauge-desc')} active={sortOption === 'jauge-desc'}>
              Jauge (décroissant)
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setSortOption('concerts-asc')} active={sortOption === 'concerts-asc'}>
              Nb. concerts (croissant)
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortOption('concerts-desc')} active={sortOption === 'concerts-desc'}>
              Nb. concerts (décroissant)
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default LieuxListSearchFilter;