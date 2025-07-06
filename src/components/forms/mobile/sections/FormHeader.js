import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './FormHeader.module.css';

/**
 * En-tête du formulaire de validation pour mobile
 * Affiche le titre et le bouton de retour
 */
const FormHeader = ({ dateId, isValidated, navigate }) => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>
          Validation des informations {isValidated && '(Validé)'}
        </h1>
        <Button 
          variant="outline-secondary" 
          size="sm"
          className={styles.backButton}
          onClick={() => navigate(`/dates/${dateId}`)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Retour au concert
        </Button>
      </div>
    </div>
  );
};

export default FormHeader;