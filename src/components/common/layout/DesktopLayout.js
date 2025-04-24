// src/components/common/layout/DesktopLayout.js
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { APP_NAME } from '../../../config.js';
import '../../../style/layout.css';

function DesktopLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>{APP_NAME}</h3>
        </div>
        <div className="sidebar-content">
          <ul className="nav-links">
            <li>
              <NavLink to="/" end>
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/concerts">
                <i className="bi bi-calendar-event"></i>
                <span>Concerts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/programmateurs">
                <i className="bi bi-person-badge"></i>
                <span>Programmateurs</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/lieux">
                <i className="bi bi-geo-alt"></i>
                <span>Lieux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/structures">
                <i className="bi bi-building"></i>
                <span>Structures</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/contrats">
                <i className="bi bi-file-earmark-text"></i>
                <span>Contrats</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/artistes">
                <i className="bi bi-music-note-beamed"></i>
                <span>Artistes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/parametres">
                <i className="bi bi-gear"></i>
                <span>Paramètres</span>
              </NavLink>
            </li>
            {/* Autres liens de navigation */}
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
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default DesktopLayout;