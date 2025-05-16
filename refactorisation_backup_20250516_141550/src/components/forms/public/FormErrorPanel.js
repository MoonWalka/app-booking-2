import React from 'react';
import styles from './FormErrorPanel.module.css';

/**
 * Component to display error states in forms
 */
const FormErrorPanel = ({ type, message, actionButton }) => {
  // Map of types to alert classes and titles
  const typeConfig = {
    error: { 
      className: 'alert-danger',
      title: 'Erreur'
    },
    warning: {
      className: 'alert-warning',
      title: 'Attention'
    },
    info: {
      className: 'alert-info',
      title: 'Information'
    },
    success: {
      className: 'alert-success',
      title: 'Succès'
    },
  };
  
  // Get configuration based on type (default to error if type not found)
  const config = typeConfig[type] || typeConfig.error;
  
  return (
    <div className={`alert ${config.className} ${styles.errorPanel}`}>
      <h3>{config.title}</h3>
      <p>{message}</p>
      {actionButton && (
        <div className={styles.actionContainer}>
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default FormErrorPanel;