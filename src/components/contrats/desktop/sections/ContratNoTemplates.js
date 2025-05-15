// src/components/contrats/desktop/sections/ContratNoTemplates.js
import React from 'react';
import styles from './ContratNoTemplates.module.css';

const ContratNoTemplates = () => {
  return (
    <div className={styles.noTemplatesContainer}>
      <h5 className="mb-3">Génération de contrat</h5>
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Aucun modèle de contrat n'est disponible. Veuillez créer un modèle dans les paramètres.
      </div>
    </div>
  );
};

export default ContratNoTemplates;