import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@ui/Button';
import styles from './LieuxListHeader.module.css';

/**
 * Header component for the LieuxList with title and "Add Lieu" button
 */
const LieuxListHeader = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des lieux</h2>
      <Button 
        variant="primary"
        className={`d-flex align-items-center gap-2 ${styles.addButton}`}
        onClick={() => navigate('/lieux/nouveau')}
      >
        <i className="bi bi-plus-lg"></i>
        Ajouter un lieu
      </Button>
    </div>
  );
};

export default LieuxListHeader;