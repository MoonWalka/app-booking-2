import React from 'react';
import { useResponsive } from '@/hooks/common';
import styles from './ContratVariable.module.css';

/**
 * Composant responsive pour afficher et insérer une variable de contrat
 * Adapte son interface selon la taille de l'écran (mobile/desktop)
 */
const ContratVariable = ({ name, description, onInsert }) => {
  // TODO: Réactiver le mode mobile plus tard.
  // const { isMobile } = useResponsive();
  const isMobile = false; // Force l'utilisation de la version desktop
  
  // Version mobile (simple)
  if (isMobile) {
    return (
      /* Correction : ajout accessibilité (role/button + tabIndex) */
      <div 
        className={styles.mobileVariableItem} 
        onClick={() => onInsert(name)} 
        role="button" 
        tabIndex={0}
      >
        <div className={styles.variableName}>{`{${name}}`}</div>
        <div className={styles.variableDescription}>{description}</div>
      </div>
    );
  }
  
  // Version desktop (plus sophistiquée avec bouton et icône)
  return (
    <div className={styles.variableItem}>
      <button 
        type="button"
        className="tc-btn tc-btn-sm tc-btn-outline-secondary"
        onClick={() => onInsert(name)}
      >
        <div>
          <span className={styles.variableName}>{`{${name}}`}</span>
          <small className={styles.variableDescription}>{description}</small>
        </div>
        <i className="bi bi-plus-circle-dotted"></i>
      </button>
    </div>
  );
};

export default ContratVariable;
