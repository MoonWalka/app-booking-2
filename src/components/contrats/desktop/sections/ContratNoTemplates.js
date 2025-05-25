// src/components/contrats/desktop/sections/ContratNoTemplates.js
import React from 'react';
import Alert from '@/components/ui/Alert';
import styles from './ContratNoTemplates.module.css';

const ContratNoTemplates = () => {
  return (
    <div className={styles.noTemplatesContainer}>
      <h5 className="mb-3">Génération de contrat</h5>
      <Alert variant="warning">
        Aucun modèle de contrat n'est disponible. Veuillez créer un modèle dans les paramètres.
      </Alert>
    </div>
  );
};

export default ContratNoTemplates;