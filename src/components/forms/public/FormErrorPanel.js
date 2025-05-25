import React from 'react';
import styles from './FormErrorPanel.module.css';

/**
 * Component to display error states in forms
 * Migré vers les standards CSS TourCraft - Suppression des classes Bootstrap alert
 */
const FormErrorPanel = ({ type = 'error', message, actionButton }) => {
  // Map of types to CSS classes and titles (utilise CSS Modules au lieu de Bootstrap)
  const typeConfig = {
    error: { 
      className: styles.alertError,
      title: 'Erreur'
    },
    warning: {
      className: styles.alertWarning,
      title: 'Attention'
    },
    info: {
      className: styles.alertInfo,
      title: 'Information'
    },
    success: {
      className: styles.alertSuccess,
      title: 'Succès'
    },
  };
  
  // Get configuration based on type (default to error if type not found)
  const config = typeConfig[type] || typeConfig.error;
  
  return (
    <div className={`${styles.errorPanel} ${config.className}`}>
      <div className={styles.alertHeader}>
        <h3 className={styles.alertTitle}>{config.title}</h3>
      </div>
      <div className={styles.alertContent}>
        <p className={styles.alertMessage}>{message}</p>
        {actionButton && (
          <div className={styles.actionContainer}>
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormErrorPanel;