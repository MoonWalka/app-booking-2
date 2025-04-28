import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import '@/styles/index.css';

/**
 * Composant responsive pour afficher et insérer une variable de contrat
 * Adapte son interface selon la taille de l'écran (mobile/desktop)
 */
const ContratVariable = ({ name, description, onInsert }) => {
  // TODO: Réactiver le mode mobile plus tard.
  // const isMobile = useIsMobile();
  const isMobile = false; // Force l'utilisation de la version desktop
  
  // Version mobile (simple)
  if (isMobile) {
    return (
      /* Correction : ajout accessibilité (role/button + tabIndex) */
      <div 
        className="variable-item" 
        onClick={() => onInsert(name)} 
        role="button" 
        tabIndex={0}
      >
        <div className="variable-name">{`{${name}}`}</div>
        <div className="variable-description">{description}</div>
      </div>
    );
  }
  
  // Version desktop (plus sophistiquée avec bouton et icône)
  return (
    <div className="variable-item">
      <button 
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={() => onInsert(name)}
      >
        <div>
          <span className="variable-name">{`{${name}}`}</span>
          <small className="variable-description">{description}</small>
        </div>
        <i className="bi bi-plus-circle-dotted"></i>
      </button>
    </div>
  );
};

export default ContratVariable;
