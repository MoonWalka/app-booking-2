// src/components/contrats/sections/ContratVariablesCard.js
import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import styles from './ContratVariablesCard.module.css';

/**
 * Component for displaying contract variables in a collapsible card
 */
const ContratVariablesCard = ({ contrat }) => {
  const [showVariables, setShowVariables] = useState(false);
  
  const handleCopyVariables = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(contrat?.variables, null, 2));
    alert('Variables copiées dans le presse-papier');
  };

  return (
    <Card className={styles.contractVariablesCard}>
      <Card.Header 
        className="d-flex align-items-center cursor-pointer"
        onClick={() => setShowVariables(!showVariables)}
      >
        <i className="bi bi-braces me-2 text-primary"></i>
        <h5 className="mb-0">Variables du contrat</h5>
        <div className="ms-auto d-flex align-items-center">
          {showVariables && (
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="me-2"
              onClick={handleCopyVariables}
            >
              <i className="bi bi-clipboard me-1"></i> Copier
            </Button>
          )}
          <i className={`bi bi-chevron-${showVariables ? 'up' : 'down'} transition-icon`}></i>
        </div>
      </Card.Header>
      
      <div className={`collapse ${showVariables ? 'show' : ''}`}>
        <Card.Body>
          <div className="mb-2 text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            Ces variables ont été utilisées pour générer le contrat à partir du modèle.
          </div>
          {contrat?.variables ? (
            <div className={styles.variablesContainer}>
              {Object.entries(contrat.variables).map(([key, value]) => (
                <div key={key} className={styles.variableItem}>
                  <div className={styles.variableName}>
                    <code>{'{' + key + '}'}</code>
                  </div>
                  <div className={styles.variableValue}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-muted">
              <i className="bi bi-exclamation-circle fs-4 d-block mb-2"></i>
              Aucune variable disponible pour ce contrat
            </div>
          )}
        </Card.Body>
      </div>
    </Card>
  );
};

export default ContratVariablesCard;