import React from 'react';
import styles from './FormPageHeader.module.css';

/**
 * Header component for form pages
 */
const FormPageHeader = ({ title, subtitle, concertInfo }) => {
  return (
    <div className={styles.header}>
      <h1>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      {concertInfo && (
        <div className={styles.concertInfo}>
          <p className={styles.concertName}>
            {concertInfo.titre || concertInfo.nom || 'Concert'}
          </p>
          {concertInfo.dateDebut && (
            <p className={styles.concertDate}>
              {new Date(concertInfo.dateDebut).toLocaleDateString('fr-FR', {
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