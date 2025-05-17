import React from 'react';
import styles from './ConcertFormHeader.module.css';

/**
 * ConcertFormHeader - Composant pour l'en-tête du formulaire de concert
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.id - L'identifiant du concert
 * @param {Object} props.formData - Les données du formulaire
 * @param {Function} props.navigate - Fonction de navigation de react-router
 */
const ConcertFormHeader = ({ id, formData, navigate }) => {
  const isNewConcert = id === 'nouveau';
  
  return (
    <div className={styles.formHeader}>
      <h2 className={styles.pageTitle}>
        {isNewConcert ? 'Ajouter un concert' : 'Modifier le concert'}
      </h2>
      
      <div className={styles.breadcrumbContainer}>
        <span 
          className={styles.breadcrumbItem}
          onClick={() => navigate('/concerts')} 
          role="button" 
          tabIndex={0}
        >
          Concerts
        </span>
        <i className={`bi bi-chevron-right ${styles.breadcrumbSeparator}`}></i>
        <span className={`${styles.breadcrumbItem} ${styles.active}`}>
          {isNewConcert ? 'Nouveau concert' : (formData.titre || 'Modifier')}
        </span>
      </div>
    </div>
  );
};

export default ConcertFormHeader;
