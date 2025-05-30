// src/components/contrats/sections/ContratVariablesCard.js
import React, { useState } from 'react';
import styles from '@/pages/ContratDetailsPage.module.css';

/**
 * Component for displaying contract variables in a collapsible card
 */
const ContratVariablesCard = ({ contrat }) => {
  const [showVariables, setShowVariables] = useState(false);
  
  const toggleVariables = () => {
    setShowVariables(!showVariables);
  };

  // Formatter les noms de variables pour l'affichage
  const formatVariableName = (key) => {
    return `{{${key.toUpperCase()}}}`;
  };

  // Formatter les valeurs pour l'affichage
  const formatVariableValue = (value) => {
    if (value === null || value === undefined) return 'Non défini';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className={styles.infoCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-code-square"></i>
        <h3>Variables du contrat</h3>
        <button 
          className={styles.variablesToggle} 
          onClick={toggleVariables}
          type="button"
        >
          <i className={`bi bi-chevron-${showVariables ? 'up' : 'down'}`}></i>
          <span>{showVariables ? 'Masquer' : 'Afficher'} les variables</span>
        </button>
      </div>
      
      <div className={`${styles.variablesContent} ${showVariables ? styles.show : ''}`}>
        {contrat?.variables && Object.keys(contrat.variables).length > 0 ? (
          Object.entries(contrat.variables)
            .sort(([a], [b]) => a.localeCompare(b)) // Trier par ordre alphabétique
            .map(([key, value]) => (
              <div key={key} className={styles.variableItem}>
                <span className={styles.variableName}>
                  {formatVariableName(key)}
                </span>
                <span className={styles.variableValue}>
                  {formatVariableValue(value)}
                </span>
              </div>
            ))
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--tc-space-4)', color: 'var(--tc-text-muted)' }}>
            <i className="bi bi-exclamation-circle" style={{ fontSize: '2rem', display: 'block', marginBottom: 'var(--tc-space-2)' }}></i>
            Aucune variable disponible pour ce contrat
          </div>
        )}
      </div>
    </div>
  );
};

export default ContratVariablesCard;