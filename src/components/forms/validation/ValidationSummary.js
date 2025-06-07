import React from 'react';
import styles from './ValidationSummary.module.css';

const ValidationSummary = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h3 className={styles.title}>Formulaire validé avec succès</h3>
        <p className={styles.message}>
          Les informations validées ont été intégrées à la fiche du contact et du lieu.
        </p>
      </div>
    </div>
  );
};

export default ValidationSummary;
