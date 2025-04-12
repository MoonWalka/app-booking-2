import React from 'react';

const ContratsPage = () => {
  return (
    <div className="contrats-container">
      <h1>Gestion des Contrats</h1>
      <div className="contrats-content">
        <div className="contrats-actions">
          <button className="action-button" disabled>Générer un nouveau contrat</button>
          <div className="search-box">
            <input type="text" placeholder="Rechercher un contrat..." disabled />
            <button disabled>🔍</button>
          </div>
        </div>
        
        <div className="contrats-list">
          <p className="construction-message">
            La gestion des contrats est en cours de construction. Cette fonctionnalité sera implémentée prochainement.
          </p>
          <div className="placeholder-list">
            <div className="placeholder-item">
              <div className="placeholder-name">Contrat #2023-001</div>
              <div className="placeholder-details">
                <span>Concert: Festival d'été 2023</span>
                <span>Statut: Signé</span>
                <span>Montant: 1500€</span>
              </div>
            </div>
            <div className="placeholder-item">
              <div className="placeholder-name">Contrat #2023-002</div>
              <div className="placeholder-details">
                <span>Concert: Tournée automne 2023</span>
                <span>Statut: En attente de signature</span>
                <span>Montant: 2200€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContratsPage;
