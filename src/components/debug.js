import React from 'react';
import '../styles/components/buttons.css'; // 🔧 chemin direct pour forcer le style

const TestButtons = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bouton de test</h2>
      
      <button className="tc-btn-outline-primary btn-sm" style={{ marginRight: '1rem' }}>
        Test tc-btn-outline-primary
      </button>

      <button className="btn btn-outline-primary btn-sm">
        Test Bootstrap
      </button>
    </div>
  );
};

export default TestButtons;