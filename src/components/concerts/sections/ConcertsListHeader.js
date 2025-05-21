import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ConcertsListHeader.module.css';

const ConcertsListHeader = () => {
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.sectionTitle}>Liste des concerts</h2>
      <Link to="/concerts/nouveau" className={styles.addButton}>
        <i className="bi bi-plus-lg me-2"></i>
        Ajouter un concert
      </Link>
    </div>
  );
};

export default ConcertsListHeader;