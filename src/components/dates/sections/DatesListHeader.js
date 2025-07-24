import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DatesListHeader.module.css';
import usePermissions from '@/hooks/usePermissions';

const DatesListHeader = () => {
  const navigate = useNavigate();
  const { canCreate } = usePermissions();
  
  return (
    <div className={styles.headerContainer} data-tour="dates-header">
      <h2 className={styles.headerTitle}>Liste des dates</h2>
      {canCreate('dates') && (
        <button
          className={styles.addButton}
          onClick={() => navigate('/dates/nouveau')}
          data-tour="dates-add-button"
        >
          <i className="bi bi-plus-lg"></i>
          Ajouter un date
        </button>
      )}
    </div>
  );
};

export default DatesListHeader;