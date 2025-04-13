import React, { useState } from 'react';

const ConcertsList = ({ onAddConcert }) => {
  const [filter, setFilter] = useState({
    statut: 'Tous',
    periode: 'Tous'
  });

  // Données de démonstration pour les concerts
  const concertsData = [
    {
      id: 1,
      date: '15/05/2025',
      lieu: 'Salle de Concert Exemple #1',
      programmateur: 'Programmateur Exemple #1',
      montant: '1500',
      statut: 'Contact établi'
    },
    {
      id: 2,
      date: '20/06/2025',
      lieu: 'Théâtre Exemple #2',
      programmateur: 'Programmateur Exemple #2',
      montant: '2200',
      statut: 'Pré-accord'
    },
    {
      id: 3,
      date: '10/07/2025',
      lieu: 'Salle de Concert Exemple #1',
      programmateur: 'Programmateur Exemple #1',
      montant: '1800',
      statut: 'Contrat signé'
    }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Contact établi': return 'status-contact';
      case 'Pré-accord': return 'status-preaccord';
      case 'Contrat signé': return 'status-signed';
      case 'Acompte facturé': return 'status-deposit';
      case 'Solde facturé': return 'status-paid';
      default: return '';
    }
  };

  return (
    <div className="concerts-list-container">
      <h2>Gestion des Concerts</h2>
      
      <button onClick={onAddConcert} className="btn-add">
        Ajouter un concert
      </button>
      
      <div className="filters-container">
        <h3>Filtres</h3>
        
        <div className="filter-group">
          <label>Statut:</label>
          <select 
            name="statut" 
            value={filter.statut} 
            onChange={handleFilterChange}
          >
            <option value="Tous">Tous</option>
            <option value="Contact établi">Contact établi</option>
            <option value="Pré-accord">Pré-accord</option>
            <option value="Contrat signé">Contrat signé</option>
            <option value="Acompte facturé">Acompte facturé</option>
            <option value="Solde facturé">Solde facturé</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Période:</label>
          <select 
            name="periode" 
            value={filter.periode} 
            onChange={handleFilterChange}
          >
            <option value="Tous">Tous</option>
            <option value="À venir">À venir</option>
            <option value="Passés">Passés</option>
            <option value="Ce mois">Ce mois</option>
            <option value="Ce trimestre">Ce trimestre</option>
          </select>
        </div>
      </div>
      
      <h3>Liste des concerts</h3>
      
      <div className="concerts-list">
        {concertsData.map(concert => (
          <div key={concert.id} className="concert-item">
            <div className="concert-date">{concert.date}</div>
            
            <div className="concert-details">
              <div><strong>Lieu:</strong> {concert.lieu}</div>
              <div><strong>Programmateur:</strong> {concert.programmateur}</div>
              <div><strong>Montant:</strong> {concert.montant} €</div>
            </div>
            
            <div className="concert-status">
              <span className={getStatusClass(concert.statut)}>
                {concert.statut}
              </span>
            </div>
            
            <div className="concert-actions">
              <button className="btn-details">Détails</button>
              <button className="btn-edit">Modifier</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConcertsList;
