import React from 'react';

/**
 * Composant de test ultra-simple pour diagnostiquer le problème des structures
 */
const StructuresListTest = () => {
  console.log('🧪 StructuresListTest: Composant de test rendu');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Structures - Test</h1>
      <p>Si vous voyez ce message, le problème n'est pas dans le routage mais dans le composant StructuresList lui-même.</p>
      <div style={{ background: '#f0f0f0', padding: '10px', marginTop: '20px' }}>
        <strong>Diagnostic :</strong>
        <ul>
          <li>✅ Route vers /structures fonctionne</li>
          <li>✅ Composant se charge</li>
          <li>❓ Le problème vient probablement d'un hook ou d'un import dans StructuresList</li>
        </ul>
      </div>
    </div>
  );
};

export default StructuresListTest;