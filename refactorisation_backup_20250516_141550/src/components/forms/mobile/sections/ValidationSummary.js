import React from 'react';
import { Alert } from 'react-bootstrap';
import styles from './ValidationSummary.module.css';

/**
 * Composant qui affiche un message de validation pour l'interface mobile
 */
const ValidationSummary = () => {
  return (
    <Alert variant="success" className={styles.validationAlert}>
      <div className={styles.alertContent}>
        <i className="bi bi-check-circle-fill me-2"></i>
        <div>
          <h5 className={styles.alertTitle}>Formulaire validé</h5>
          <p className={styles.alertText}>
            Les données ont bien été validées et enregistrées dans les fiches correspondantes.
          </p>
        </div>
      </div>
    </Alert>
  );
};

export default ValidationSummary;