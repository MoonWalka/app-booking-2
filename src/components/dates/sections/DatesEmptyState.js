import React from 'react';
import styles from './DatesEmptyState.module.css';

const DatesEmptyState = ({ hasSearchQuery, hasFilters }) => {
  return (
    <div className={styles.modernAlert}>
      <i className="bi bi-info-circle me-3 fs-4"></i>
      <div>
        {hasSearchQuery || hasFilters ?
          "Aucun date ne correspond à votre recherche ou aux filtres sélectionnés." :
          "Aucun date n'a été ajouté."
        }
      </div>
    </div>
  );
};

export default DatesEmptyState; 