import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard">
      <h2>Tableau de bord</h2>
      
      <div className="welcome-message">
        <h3>Bienvenue, {currentUser?.displayName || 'Utilisateur'} !</h3>
        <p>Gérez vos concerts, programmateurs et contrats depuis cette interface.</p>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">🎵</div>
          <h3>Concerts</h3>
          <p>Créez et gérez vos concerts</p>
          <Link to="/concerts" className="card-link">
            Accéder aux concerts
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Programmateurs</h3>
          <p>Gérez vos contacts programmateurs</p>
          <Link to="/programmateurs" className="card-link">
            Accéder aux programmateurs
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">📍</div>
          <h3>Lieux</h3>
          <p>Gérez les lieux de vos concerts</p>
          <Link to="/lieux" className="card-link">
            Accéder aux lieux
          </Link>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon">📄</div>
          <h3>Contrats</h3>
          <p>Gérez vos contrats et factures</p>
          <Link to="/contrats" className="card-link">
            Accéder aux contrats
          </Link>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Actions rapides</h3>
        <div className="action-buttons">
          <Link to="/concerts/nouveau" className="btn-primary">
            <span>+</span> Nouveau concert
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
