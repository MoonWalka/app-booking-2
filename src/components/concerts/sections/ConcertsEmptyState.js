import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConcertsEmptyState.module.css';

const ConcertsEmptyState = ({ hasSearchQuery, hasFilters }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.modernAlert}>
      <i className="bi bi-info-circle me-3 fs-4"></i>
      <div>
        {hasSearchQuery || hasFilters ?
          "Aucun concert ne correspond à votre recherche ou aux filtres sélectionnés." :
          <>
            Aucun concert n'a été ajouté.{' '}
            <button
              className={styles.actionButton}
              onClick={() => navigate('/concerts/nouveau')}
            >
              <i className="bi bi-plus-lg"></i> Ajouter un concert
            </button>
          </>
        }
      </div>
    </div>
  );
};

export default ConcertsEmptyState; 