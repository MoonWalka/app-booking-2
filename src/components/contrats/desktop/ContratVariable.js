import React from 'react';
import '@styles/index.css';

// Version avec bouton moderne et icône
const ContratVariable = ({ name, description, onInsert }) => {
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

/* Version originale commentée
const ContratVariable = ({ name, description, onInsert }) => {
  return (
    <div className="variable-item" onClick={() => onInsert(name)}>
      <div className="variable-name">{`{${name}}`}</div>
      <div className="variable-description">{description}</div>
    </div>
  );
};
*/

export default ContratVariable;
