import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConcertsListHeader.module.css';
import Button from '@/components/ui/Button';

const ConcertsListHeader = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des concerts</h2>
      <button
        className={styles.addButton}
        onClick={() => navigate('/concerts/nouveau')}
      >
        <i className="bi bi-plus-lg"></i>
        Ajouter un concert
      </button>
    </div>
  );
};

export default ConcertsListHeader;