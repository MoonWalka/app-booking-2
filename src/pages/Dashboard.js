import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  // Vérification sécurisée de l'existence de currentUser
  const userName = currentUser ? currentUser.name : 'Utilisateur';

  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>
      <p>Bienvenue, {userName} !</p>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Concerts à venir</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Contrats en attente</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Programmateurs</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Lieux</h3>
          <p className="stat-value">0</p>
        </div>
      </div>
      <div className="dashboard-message">
        <p>Cette page est en construction. Les fonctionnalités seront implémentées progressivement.</p>
      </div>
    </div>
  );
};

export default Dashboard;
