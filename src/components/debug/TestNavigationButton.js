// src/components/debug/TestNavigationButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Bouton de test pour vérifier la navigation
 */
function TestNavigationButton() {
  const navigate = useNavigate();

  const testNavigation = () => {
    console.log('[TestNavigationButton] Test de navigation vers /contacts');
    navigate('/contacts');
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '20px',
      zIndex: 9999
    }}>
      <button
        onClick={testNavigation}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Test Navigation
      </button>
    </div>
  );
}

export default TestNavigationButton;