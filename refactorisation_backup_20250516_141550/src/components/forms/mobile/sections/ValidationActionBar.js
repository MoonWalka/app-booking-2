import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './ValidationActionBar.module.css';

/**
 * Barre d'action fixée en bas de l'écran sur mobile
 * avec bouton de validation
 */
const ValidationActionBar = ({ onValidate, isValidating }) => {
  return (
    <div className={styles.actionBarContainer}>
      <Button
        variant="primary"
        onClick={onValidate}
        disabled={isValidating}
        className={styles.validateButton}
      >
        {isValidating ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Validation en cours...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle-fill me-2"></i>
            Valider toutes les informations
          </>
        )}
      </Button>
    </div>
  );
};

export default ValidationActionBar;