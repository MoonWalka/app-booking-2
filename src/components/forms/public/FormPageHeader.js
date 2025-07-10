import React from 'react';
import styles from './FormPageHeader.module.css';

/**
 * Header component for form pages
 */
const FormPageHeader = ({ title, subtitle, dateInfo }) => {
  return (
    <div className={styles.header}>
      <h1>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {dateInfo && (
        <div className={styles.dateInfo}>
          <p className={styles.dateName}>
            {dateInfo.titre || dateInfo.nom || 'Date'}
          </p>
          {dateInfo.dateDebut && (
            <p className={styles.dateDate}>
              {new Date(dateInfo.dateDebut).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FormPageHeader;