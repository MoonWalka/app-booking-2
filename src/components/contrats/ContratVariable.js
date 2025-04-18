import React from 'react';

const ContratVariable = ({ name, description, onInsert }) => {
  return (
    <div className="variable-item" onClick={() => onInsert(name)}>
      <div className="variable-name">{`{${name}}`}</div>
      <div className="variable-description">{description}</div>
    </div>
  );
};

export default ContratVariable;
