import React from 'react';
import styles from './ConcertSearchBar.module.css';

const ConcertSearchBar = ({ searchTerm, setSearchTerm }) => {
  const handleFilterClick = () => {
    console.log('Filtrer les concerts');
    // Ici, vous pourriez ouvrir un modal ou un panneau de filtres avancés
    alert('Fonctionnalité de filtrage avancé à venir');
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchBox}>
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Rechercher un concert..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <button 
        className={styles.filterButton}
        onClick={handleFilterClick}
        aria-label="Filtrer les concerts"
      >
        <i className="bi bi-funnel"></i> Filtrer
      </button>
    </div>
  );
};

export default ConcertSearchBar;
