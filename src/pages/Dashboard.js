import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2>Tableau de bord</h2>
      
      <p>Bienvenue, Utilisateur Test !</p>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Concerts à venir</h3>
          <div className="stat-value">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Contrats en attente</h3>
          <div className="stat-value">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Programmateurs</h3>
          <div className="stat-value">0</div>
        </div>
        
        <div className="stat-card">
          <h3>Lieux</h3>
          <div className="stat-value">0</div>
        </div>
      </div>
      
      <div className="info-panel">
        <p>Cette page est en construction. Les fonctionnalités seront implémentées progressivement.</p>
      </div>
    </div>
  );
};

export default Dashboard;
