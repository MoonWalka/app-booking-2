import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProgrammateursListHeader.module.css';

const ProgrammateursListHeader = () => {
  
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des programmateurs</h2>
      <Link 
        to="/programmateurs/nouveau" 
        className={styles.addButton}
      >
        <i className="bi bi-plus-lg"></i>
        Ajouter un programmateur
      </Link>
    </div>
  );
};

export default ProgrammateursListHeader; 