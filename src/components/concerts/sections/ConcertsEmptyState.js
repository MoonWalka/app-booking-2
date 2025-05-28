import React from 'react';
import styles from './ConcertsEmptyState.module.css';

const ConcertsEmptyState = ({ hasSearchQuery, hasFilters }) => {
  return (
    <div className={styles.modernAlert}>
      <i className="bi bi-info-circle me-3 fs-4"></i>
      <div>
        {hasSearchQuery || hasFilters ?
          "Aucun concert ne correspond à votre recherche ou aux filtres sélectionnés." :
          "Aucun concert n'a été ajouté."
        }
      </div>
    </div>
  );
};

export default ConcertsEmptyState; 