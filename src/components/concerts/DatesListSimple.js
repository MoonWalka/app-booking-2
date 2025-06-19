// src/components/concerts/DatesListSimple.js
import React from 'react';

/**
 * Version simplifiée pour tester
 */
function DatesListSimple() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Liste des dates - Test</h1>
      <p>Si vous voyez ce message, le composant fonctionne !</p>
      <table style={{ width: '100%', border: '1px solid #ccc' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Entreprise</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Coll.</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Niv.</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Artiste(s)</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Projet</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Lieu</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>TourCraft</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>TC</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>1</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Artiste Test</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Tournée 2024</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Salle Test</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              <button>Modifier</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default DatesListSimple;