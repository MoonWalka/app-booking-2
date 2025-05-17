import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LieuxListHeader.module.css';

/**
 * Header component for the LieuxList with title and "Add Lieu" button
 */
const LieuxListHeader = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.headerContainer}>
      <h2 className="fs-4 fw-bold text-primary mb-0">Liste des lieux</h2>
      <button 
        className={`btn btn-primary d-flex align-items-center gap-2 ${styles.addButton}`}
        onClick={() => navigate('/lieux/nouveau')}
      >
        <i className="bi bi-plus-lg"></i>
        Ajouter un lieu
      </button>
    </div>
  );
};

export default LieuxListHeader;