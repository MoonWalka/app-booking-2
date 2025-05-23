import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import styles from './LieuxListEmptyState.module.css';

/**
 * Component to display when no lieux are found
 */
const LieuxListEmptyState = ({ hasSearchQuery, hasFilters }) => {
  const navigate = useNavigate();
  
  return (
    <div className={styles.modernAlert}>
      <i className="bi bi-info-circle me-3 fs-4"></i>
      <div>
        {hasSearchQuery || hasFilters ? 
          "Aucun lieu ne correspond à votre recherche ou aux filtres sélectionnés." : 
          <>
            Aucun lieu n'a été ajouté.{' '}
            <Button 
              variant="link"
              className="p-0 d-inline"
              onClick={() => navigate('/lieux/nouveau')}
            >
              Cliquez ici
            </Button>
            {' '}pour ajouter votre premier lieu.
          </>
        }
      </div>
    </div>
  );
};

export default LieuxListEmptyState;