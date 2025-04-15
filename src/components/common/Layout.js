import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Layout() {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Label Musical</h2>
          <p>Gestion des concerts et artistes</p>
        </div>
        
        {currentUser && (
          <nav className="sidebar-nav">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <span role="img" aria-label="dashboard">📊</span> Tableau de bord
            </Link>
            <Link to="/concerts" className={location.pathname.includes('/concerts') ? 'active' : ''}>
              <span role="img" aria-label="concerts">🎵</span> Concerts
            </Link>
            <Link to="/programmateurs" className={location.pathname.includes('/programmateurs') ? 'active' : ''}>
              <span role="img" aria-label="programmers">👥</span> Programmateurs
            </Link>
            <Link to="/lieux" className={location.pathname.includes('/lieux') ? 'active' : ''}>
              <span role="img" aria-label="venues">📍</span> Lieux
            </Link>
            <Link to="/contrats" className={location.pathname.includes('/contrats') ? 'active' : ''}>
              <span role="img" aria-label="contracts">📄</span> Contrats
            </Link>
          </nav>
        )}
      </div>
      
      <div className="main-content">
        <header className="main-header">
          <h1>Gestion des concerts</h1>
          {currentUser && (
            <div className="user-info">
              Utilisateur Test
            </div>
          )}
        </header>
        
        <main>
          <Outlet /> {/* Utilisez Outlet au lieu de children */}
        </main>
      </div>
    </div>
  );
}

export default Layout;
