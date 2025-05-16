import React from 'react';
import styles from './ValidationActionBar.module.css';

const ValidationActionBar = ({ onValidate, isValidating }) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button 
          onClick={onValidate} 
          className={styles.validateButton}
          disabled={isValidating}
        >
          {isValidating ? (
            <>
              <span className={styles.spinner} role="status" aria-hidden="true"></span>
              Validation en cours...
            </>
          ) : (
            <>
              <i className={`bi bi-check-circle ${styles.icon}`}></i>
              Valider et enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ValidationActionBar;
