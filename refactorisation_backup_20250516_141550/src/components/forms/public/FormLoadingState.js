import React from 'react';
import styles from './FormLoadingState.module.css';

/**
 * Component to display loading state in forms
 */
const FormLoadingState = ({ message = 'Chargement du formulaire...' }) => {
  return (
    <div className={`${styles.loadingContainer} text-center my-5`}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      <p className="mt-3">{message}</p>
    </div>
  );
};

export default FormLoadingState;