import React from 'react';

const ConcertsPage = () => {
  return (
    <div className="concerts-container">
      <h1>Gestion des Concerts</h1>
      <div className="concerts-content">
        <div className="concerts-filters">
          <h3>Filtres</h3>
          <div className="filter-group">
            <label>Statut:</label>
            <select disabled>
              <option>Tous</option>
              <option>Contact établi</option>
              <option>Pré-accord</option>
              <option>Contrat signé</option>
              <option>Acompte facturé</option>
              <option>Solde facturé</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Période:</label>
            <select disabled>
              <option>Tous</option>
              <option>À venir</option>
              <option>Passés</option>
              <option>Ce mois</option>
              <option>Ce trimestre</option>
            </select>
          </div>
        </div>
        
        <div className="concerts-list">
          <p className="construction-message">
            La liste des concerts est en cours de construction. Cette fonctionnalité sera implémentée prochainement.
          </p>
          <div className="placeholder-list">
            <div className="placeholder-item">Concert exemple #1 - En attente</div>
            <div className="placeholder-item">Concert exemple #2 - Confirmé</div>
            <div className="placeholder-item">Concert exemple #3 - Annulé</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertsPage;
