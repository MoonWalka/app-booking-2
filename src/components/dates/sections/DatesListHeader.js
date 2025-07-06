import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DatesListHeader.module.css';

const DatesListHeader = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des dates</h2>
      <button
        className={styles.addButton}
        onClick={() => navigate('/dates/nouveau')}
      >
        <i className="bi bi-plus-lg"></i>
        Ajouter un date
      </button>
    </div>
  );
};

export default DatesListHeader;