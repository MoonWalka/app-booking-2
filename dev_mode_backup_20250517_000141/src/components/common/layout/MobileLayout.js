// src/components/common/layout/MobileLayout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { APP_NAME } from '../../../config.js';
// Import redondant supprimé - les styles sont déjà chargés dans App.js

function MobileLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="mobile-layout-container">
      <header className="mobile-header">
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className={`bi ${menuOpen ? 'bi-x' : 'bi-list'}`}></i>
        </button>
        <div className="app-title">{APP_NAME}</div>
        {currentUser && (
          <button className="user-menu" onClick={() => navigate('/profile')}>
            <i className="bi bi-person-circle"></i>
          </button>
        )}
      </header>

      {/* Overlay qui apparaît derrière le menu */}
      {menuOpen && (
        /* Correction : ajout accessibilité (role/button + tabIndex) */
        <div 
          className="menu-overlay" 
          onClick={closeMenu} 
          role="button" 
          tabIndex={0}
        ></div>
      )}

      {/* Menu latéral */}
      <nav className={`mobile-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>{APP_NAME}</h3>
        </div>
        <div className="sidebar-content">
          <ul className="nav-links">
            <li>
              <NavLink to="/" end onClick={closeMenu}>
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/concerts" onClick={closeMenu}>
                <i className="bi bi-calendar-event"></i>
                <span>Concerts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/programmateurs" onClick={closeMenu}>
                <i className="bi bi-person-badge"></i>
                <span>Programmateurs</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/lieux" onClick={closeMenu}>
                <i className="bi bi-geo-alt"></i>
                <span>Lieux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/structures" onClick={closeMenu}>
                <i className="bi bi-building"></i>
                <span>Structures</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/contrats" onClick={closeMenu}>
                <i className="bi bi-file-earmark-text"></i>
                <span>Contrats</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/artistes" onClick={closeMenu}>
                <i className="bi bi-music-note-beamed"></i>
                <span>Artistes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/parametres" onClick={closeMenu}>
                <i className="bi bi-gear"></i>
                <span>Paramètres</span>
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="sidebar-footer">
          {currentUser && (
            <div className="user-info">
              <div className="user-email">{currentUser.email}</div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline-light">
                <i className="bi bi-box-arrow-right me-2"></i>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="mobile-content">
        <Outlet />
      </main>

      {/* Navigation du bas */}
      <nav className="bottom-navbar">
        <NavLink to="/" end>
          <i className="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/concerts">
          <i className="bi bi-calendar-event"></i>
          <span>Concerts</span>
        </NavLink>
        <NavLink to="/programmateurs">
          <i className="bi bi-person-badge"></i>
          <span>Prog.</span>
        </NavLink>
        <NavLink to="/artistes">
          <i className="bi bi-music-note-beamed"></i>
          <span>Artistes</span>
        </NavLink>
        <NavLink to="/lieux">
          <i className="bi bi-geo-alt"></i>
          <span>Lieux</span>
        </NavLink>
        <NavLink to="/structures">
          <i className="bi bi-building"></i>
          <span>Struct.</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default MobileLayout;