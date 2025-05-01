import React from 'react';
import styles from './ConcertSearchBar.module.css';

const ConcertSearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className={styles.searchFilterContainer}>
      <div className={`${styles.searchBar} bg-white rounded-3 shadow-sm`}>
        <div className="input-group border-0">
          <span className="input-group-text bg-transparent border-0">
            <i className="bi bi-search text-primary"></i>
          </span>
          <input
            type="text"
            className={`form-control border-0 py-2 ${styles.searchInput}`}
            placeholder="Rechercher un concert..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="btn border-0 text-secondary" 
              onClick={() => setSearchTerm('')}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConcertSearchBar;