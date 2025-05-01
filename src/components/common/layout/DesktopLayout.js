// src/components/common/layout/DesktopLayout.js
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.js';
import { APP_NAME } from '@/config.js';
import layoutStyles from '@/components/layout/Layout.module.css';
import sidebarStyles from '@/components/layout/Sidebar.module.css';

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
    <div className={layoutStyles.layoutContainer}>
      <nav className={sidebarStyles.sidebar}>
        <div className={sidebarStyles.sidebarHeader}>
          <h3>{APP_NAME}</h3>
        </div>
        <div className={sidebarStyles.sidebarContent}>
          <ul className={sidebarStyles.navLinks}>
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? sidebarStyles.active : ''}>
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/concerts" className={({ isActive }) => isActive ? sidebarStyles.active : ''}>
                <i className="bi bi-calendar-event"></i>
                <span>Concerts</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/programmateurs" className={({ isActive }) => isActive ? sidebarStyles.active : ''}>
                <i className="bi bi-person-badge"></i>
                <span>Programmateurs</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/lieux" className={({ isActive }) => isActive ? sidebarStyles.active : ''}>
                <i className="bi bi-geo-alt"></i>
                <span>Lieux</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/structures" className={({ isActive }) => isActive ? sidebarStyles.active : ''}>
                <i className="bi bi-building"></i>
                <span>Structures</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/contrats" className={({ isActive }) => isActive ? sidebarStyles.active : ''}>
                <i className="bi bi-file-earmark-text"></i>
                <span>Contrats</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/artistes" className={({ isActive }) => isActive ? sidebarStyles.active : ''}>
                <i className="bi bi-music-note-beamed"></i>
                <span>Artistes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/parametres" className={({ isActive }) => isActive ? sidebarStyles.active : ''}>
                <i className="bi bi-gear"></i>
                <span>Paramètres</span>
              </NavLink>
            </li>
            {/* Autres liens de navigation */}
          </ul>
        </div>
        <div className={sidebarStyles.sidebarFooter}>
          {currentUser && (
            <div className={sidebarStyles.userInfo}>
              <div className={sidebarStyles.userEmail}>{currentUser.email}</div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline-light">
                <i className="bi bi-box-arrow-right me-2"></i>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className={layoutStyles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default DesktopLayout;