import React from 'react';

const ProgrammateursPage = () => {
  return (
    <div className="programmateurs-container">
      <h1>Gestion des Programmateurs</h1>
      <div className="programmateurs-content">
        <div className="programmateurs-actions">
          <button className="action-button" disabled>Ajouter un programmateur</button>
          <div className="search-box">
            <input type="text" placeholder="Rechercher un programmateur..." disabled />
            <button disabled>🔍</button>
          </div>
        </div>
        
        <div className="programmateurs-list">
          <p className="construction-message">
            La liste des programmateurs est en cours de construction. Cette fonctionnalité sera implémentée prochainement.
          </p>
          <div className="placeholder-list">
            <div className="placeholder-item">
              <div className="placeholder-name">Programmateur Exemple #1</div>
              <div className="placeholder-details">
                <span>SIRET: 123 456 789 00012</span>
                <span>Email: contact@exemple1.com</span>
              </div>
            </div>
            <div className="placeholder-item">
              <div className="placeholder-name">Programmateur Exemple #2</div>
              <div className="placeholder-details">
                <span>SIRET: 987 654 321 00021</span>
                <span>Email: contact@exemple2.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammateursPage;
