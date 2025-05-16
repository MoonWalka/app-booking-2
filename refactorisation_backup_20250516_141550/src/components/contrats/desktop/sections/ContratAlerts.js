// src/components/contrats/desktop/sections/ContratAlerts.js
import React from 'react';
import { Alert } from 'react-bootstrap';
import styles from './ContratAlerts.module.css';

const ContratAlerts = ({
  showErrorAlert,
  errorMessage,
  showSuccessAlert,
  resetAlerts
}) => {
  return (
    <div className={styles.alertsContainer}>
      {showErrorAlert && (
        <Alert variant="danger" onClose={resetAlerts} dismissible>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMessage}
        </Alert>
      )}
      
      {showSuccessAlert && (
        <Alert variant="success" onClose={resetAlerts} dismissible>
          <i className="bi bi-check-circle-fill me-2"></i>
          Contrat généré et sauvegardé avec succès !
        </Alert>
      )}
    </div>
  );
};

export default ContratAlerts;