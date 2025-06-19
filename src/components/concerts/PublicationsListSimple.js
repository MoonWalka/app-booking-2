// src/components/concerts/PublicationsListSimple.js
import React from 'react';

/**
 * Version simplifiée pour tester
 */
function PublicationsListSimple() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Publications - Test</h1>
      <p>Si vous voyez ce message, le composant Publications fonctionne !</p>
      <table style={{ width: '100%', border: '1px solid #ccc' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Public</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Comm</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Coll.</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Artiste</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Projet</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Libellé</th>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Tout public</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Promo</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>TC</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Artiste Test</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Tournée 2024</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Concert exceptionnel</td>
            <td style={{ padding: '8px', border: '1px solid #ccc' }}>
              <button>Modifier</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PublicationsListSimple;