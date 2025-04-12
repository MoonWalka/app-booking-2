// src/components/common/Layout.js
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Vérification sécurisée de l'existence de currentUser avant d'accéder à ses propriétés
  const userName = currentUser ? currentUser.name : 'Utilisateur';
  
  // Log sécurisé placé à l'intérieur du composant
  console.log("Layout - currentUser:", currentUser);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <span className="logo-text">Label Musical</span>
          </Link>
          <div className="sidebar-subtitle">Gestion des concerts et artistes</div>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            Tableau de bord
          </Link>
          <Link to="/concerts" className={`nav-item ${isActive('/concerts') ? 'active' : ''}`}>
            <span className="nav-icon">🎵</span>
            Concerts
          </Link>
          <Link to="/programmateurs" className={`nav-item ${isActive('/programmateurs') ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            Programmateurs
          </Link>
          <Link to="/lieux" className={`nav-item ${isActive('/lieux') ? 'active' : ''}`}>
            <span className="nav-icon">📍</span>
            Lieux
          </Link>
          <Link to="/contrats" className={`nav-item ${isActive('/contrats') ? 'active' : ''}`}>
            <span className="nav-icon">📄</span>
            Contrats
          </Link>
        </nav>
      </aside>
      
      <div className="main-content">
        <header className="main-header">
          <div className="page-title">
            {location.pathname === '/' && 'Tableau de bord'}
            {location.pathname === '/concerts' && 'Gestion des concerts'}
            {location.pathname === '/programmateurs' && 'Gestion des programmateurs'}
            {location.pathname === '/lieux' && 'Gestion des lieux'}
            {location.pathname === '/contrats' && 'Gestion des contrats'}
          </div>
          
          <div className="user-menu">
            {/* Utilisation sécurisée de currentUser */}
            <span className="user-name">{userName}</span>
          </div>
        </header>
        
        <main className="main-container">
          <Outlet />
        </main>
        
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} App Booking - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
