// src/components/concerts/mobile/ConcertsList.js  
import React from 'react';

/**
 * Version mobile de la liste des concerts
 * TEMPORAIRE: Test simple pour identifier si elle se charge
 */
const ConcertsList = () => {
  console.log('🔥 Version mobile ConcertsList chargée!');
  return (
    <div style={{padding: '20px', backgroundColor: '#ffe6e6', border: '2px solid red'}}>
      <h2>🔥 DEBUG: Version mobile des concerts</h2>
      <p>Si vous voyez ce message en rouge, c'est que la version mobile se charge.</p>
      <p>Le problème est donc ailleurs dans ListWithFilters.</p>
    </div>
  );
};

export default ConcertsList;