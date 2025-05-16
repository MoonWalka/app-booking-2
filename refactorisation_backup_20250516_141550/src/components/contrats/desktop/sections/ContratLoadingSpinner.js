// src/components/contrats/desktop/sections/ContratLoadingSpinner.js
import React from 'react';
import { Spinner } from 'react-bootstrap';
import styles from './ContratLoadingSpinner.module.css';

const ContratLoadingSpinner = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
      <p className={styles.loadingText}>Chargement des modèles de contrat...</p>
    </div>
  );
};

export default ContratLoadingSpinner;