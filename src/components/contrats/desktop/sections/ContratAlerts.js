// src/components/contrats/desktop/sections/ContratAlerts.js
import React from 'react';
import Alert from '@/components/ui/Alert';
import styles from './ContratAlerts.module.css';

const ContratAlerts = ({
  showErrorAlert,
  errorMessage,
  showSuccessAlert,
  resetAlerts
}) => {
  // S'assurer que errorMessage est toujours une chaîne
  const safeErrorMessage = typeof errorMessage === 'string' 
    ? errorMessage 
    : errorMessage?.message || errorMessage?.toString() || 'Une erreur est survenue';

  return (
    <div className={styles.alertsContainer}>
      {showErrorAlert && (
        <Alert 
          variant="danger" 
          dismissible 
          onDismiss={resetAlerts}
          icon={<i className="bi bi-exclamation-triangle-fill"></i>}
        >
          {safeErrorMessage}
        </Alert>
      )}
      
      {showSuccessAlert && (
        <Alert 
          variant="success" 
          dismissible 
          onDismiss={resetAlerts}
          icon={<i className="bi bi-check-circle-fill"></i>}
        >
          Contrat généré et sauvegardé avec succès !
        </Alert>
      )}
    </div>
  );
};

export default ContratAlerts;