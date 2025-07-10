import React from 'react';
import styles from './FormHeader.module.css';

const FormHeader = ({ dateId, isValidated, navigate }) => {
  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>
            {isValidated ? 'Formulaire validé' : 'Validation du formulaire'}
          </h2>
        </div>
        <div className={styles.actionsWrapper}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(`/dates/${dateId}`)}
          >
            <i className="bi bi-arrow-left"></i>
            Retour à la date
          </button>
        </div>
      </div>
      <hr className={styles.divider} />
    </div>
  );
};

export default FormHeader;
