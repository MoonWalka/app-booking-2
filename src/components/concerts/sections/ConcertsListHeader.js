import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ConcertsListHeader.module.css';
import Button from '@/components/ui/Button';

const ConcertsListHeader = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.headerContainer}>
      <h2 className={styles.headerTitle}>Liste des concerts</h2>
      <Button
        variant="primary"
        size="lg"
        onClick={() => navigate('/concerts/nouveau')}
        icon={<i className="bi bi-plus-lg"></i>}
        iconPosition="left"
        className={styles.addButton}
      >
        Ajouter un concert
      </Button>
    </div>
  );
};

export default ConcertsListHeader;