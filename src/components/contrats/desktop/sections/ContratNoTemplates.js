// src/components/contrats/desktop/sections/ContratNoTemplates.js
import React from 'react';
import { Card } from 'react-bootstrap';
import styles from './ContratNoTemplates.module.css';

const ContratNoTemplates = () => {
  return (
    <div className={styles.noTemplatesContainer}>
      <Card.Title>Génération de contrat</Card.Title>
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Aucun modèle de contrat n'est disponible. Veuillez créer un modèle dans les paramètres.
      </div>
    </div>
  );
};

export default ContratNoTemplates;