import React from 'react';
import { Form } from 'react-bootstrap';
import styles from '../ProgrammateursList.module.css';

const ProgrammateursListSearchFilter = ({ searchTerm, setSearchTerm, filteredCount, totalCount, filterStructure, setFilterStructure, sortOption, setSortOption, structures }) => {
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
    <div className={styles.searchFilterRow}>
      <div className={styles.searchCol}>
        <div className={styles.searchBox}>
          <i className={`bi bi-search ${styles.searchIcon}`}></i>
          <Form.Control
            ref={searchInputRef}
            className={styles.searchInput}
            placeholder="Rechercher un programmateur..."
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
      </div>
      <div className={styles.filtersCol}>
        <Form.Select
          value={filterStructure}
          onChange={e => setFilterStructure(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Toutes les structures</option>
          {structures && structures.map(s => (
            <option key={s.id} value={s.id}>{s.nom}</option>
          ))}
        </Form.Select>
        <Form.Select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="nom-asc">Nom A-Z</option>
          <option value="nom-desc">Nom Z-A</option>
        </Form.Select>
      </div>
    </div>
  );
};

export default ProgrammateursListSearchFilter; 