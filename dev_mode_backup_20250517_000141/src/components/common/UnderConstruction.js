// src/components/common/UnderConstruction.js
import React from 'react';

/**
 * Composant indiquant que la version mobile est en cours de construction
 * Utilisé comme placeholder pour tous les composants mobiles pas encore implémentés
 */
const UnderConstruction = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      height: '100%',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    icon: {
      fontSize: '3rem',
      color: '#6c757d',
      marginBottom: '1rem'
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#495057'
    },
    text: {
      fontSize: '1rem',
      color: '#6c757d',
      marginBottom: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>
        <i className="bi bi-tools"></i>
      </div>
      <h3 style={styles.heading}>Version mobile en construction</h3>
      <p style={styles.text}>
        Nous travaillons actuellement sur la version mobile de cette fonctionnalité.
        Veuillez utiliser la version desktop pour le moment.
      </p>
    </div>
  );
};

export default UnderConstruction;