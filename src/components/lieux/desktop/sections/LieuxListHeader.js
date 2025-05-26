import React from 'react';
import styles from './LieuxListHeader.module.css';
import { Link } from 'react-router-dom';

/**
 * Header component for the LieuxList with title and "Add Lieu" button
 */
const LieuxListHeader = () => {

  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des lieux</h2>
      <Link 
        to="/lieux/nouveau" 
        className={styles.addButton}
      >
        <i className="bi bi-plus-lg"></i>
        Ajouter un lieu
      </Link>
    </div>
  );
};

export default LieuxListHeader;