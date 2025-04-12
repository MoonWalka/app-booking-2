import React from 'react';

const LieuxPage = () => {
  return (
    <div className="lieux-container">
      <h1>Gestion des Lieux</h1>
      <div className="lieux-content">
        <div className="lieux-actions">
          <button className="action-button" disabled>Ajouter un lieu</button>
          <div className="search-box">
            <input type="text" placeholder="Rechercher un lieu..." disabled />
            <button disabled>🔍</button>
          </div>
        </div>
        
        <div className="lieux-list">
          <p className="construction-message">
            La liste des lieux est en cours de construction. Cette fonctionnalité sera implémentée prochainement.
          </p>
          <div className="placeholder-list">
            <div className="placeholder-item">
              <div className="placeholder-name">Salle de Concert Exemple #1</div>
              <div className="placeholder-details">
                <span>Adresse: 123 Rue de la Musique, 75001 Paris</span>
                <span>Capacité: 500 personnes</span>
              </div>
            </div>
            <div className="placeholder-item">
              <div className="placeholder-name">Théâtre Exemple #2</div>
              <div className="placeholder-details">
                <span>Adresse: 45 Avenue des Arts, 69002 Lyon</span>
                <span>Capacité: 300 personnes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LieuxPage;
