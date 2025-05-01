import React from 'react';
import styles from './LieuFormHeader.module.css';

const LieuFormHeader = ({ id, lieuNom, navigate }) => {
  const isNewLieu = id === 'nouveau';

  return (
    <div className={styles.formHeaderContainer}>
      <h2 className={styles.modernTitle}>
        {isNewLieu ? 'Créer un nouveau lieu' : 'Modifier le lieu'}
      </h2>
      <div className={styles.breadcrumbContainer}>
        <span 
          className={styles.breadcrumbItem} 
          onClick={() => navigate('/lieux')} 
          role="button" 
          tabIndex={0}
        >
          Lieux
        </span>
        <i className="bi bi-chevron-right"></i>
        <span className={`${styles.breadcrumbItem} ${styles.active}`}>
          {isNewLieu ? 'Nouveau lieu' : lieuNom}
        </span>
      </div>
    </div>
  );
};

export default LieuFormHeader;
