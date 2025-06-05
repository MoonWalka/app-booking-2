// src/components/common/layout/DesktopLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Button from '@ui/Button';
import { useAuth } from '@/context/AuthContext.js';
import { useResponsive } from '@/hooks/common';
import { OrganizationSelector } from '@/components/organization';
import { APP_NAME } from '@/config.js';
import { mapTerm } from '@/utils/terminologyMapping';
import layoutStyles from '@/components/layout/Layout.module.css';
import sidebarStyles from '@/components/layout/Sidebar.module.css';
import UnifiedDebugDashboard from '@/components/debug/UnifiedDebugDashboard';

function DesktopLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  
  // État pour suivre si une transition est en cours
  const [isTransitioning, setIsTransitioning] = useState(false);
  // État pour la sidebar mobile (hamburger menu)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // État pour le dashboard de debug
  const [showDebug, setShowDebug] = useState(false);
  
  // Effet pour gérer les transitions entre les routes
  useEffect(() => {
    // Marquer le début de la transition
    setIsTransitioning(true);
    
    // Réinitialiser après la transition (court délai)
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // 300ms est généralement suffisant pour une transition fluide
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Navigation items pour réutilisation
  const navItems = [
    { to: "/", icon: "bi-speedometer2", label: "Dashboard", end: true },
    { to: "/concerts", icon: "bi-calendar-event", label: "Concerts" },
    { to: "/contacts", icon: "bi-person-badge", label: mapTerm("Contacts") },
    { to: "/lieux", icon: "bi-geo-alt", label: "Lieux" },
    { to: "/structures", icon: "bi-building", label: "Structures" },
    { to: "/contrats", icon: "bi-file-earmark-text", label: "Contrats" },
    { to: "/artistes", icon: "bi-music-note-beamed", label: "Artistes" },
    { to: "/parametres", icon: "bi-gear", label: "Paramètres" }
  ];

  // Fonction pour fermer la sidebar mobile au clic sur un lien
  const handleMobileNavClick = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  if (isMobile) {
    return (
      <div className={layoutStyles.layoutContainer}>
        {/* Header mobile avec bouton hamburger */}
        <header className={layoutStyles.mobileHeader}>
          <button 
            className={layoutStyles.hamburgerButton}
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Menu"
          >
            <i className="bi bi-list"></i>
          </button>
          <h4 className={layoutStyles.mobileTitle}>{APP_NAME}</h4>
          <div className={layoutStyles.mobileUserAction}>
            <Button 
              onClick={handleLogout} 
              variant="outline-primary"
              size="sm"
            >
              <i className="bi bi-box-arrow-right"></i>
            </Button>
          </div>
        </header>

        {/* Overlay pour fermer la sidebar */}
        {isMobileSidebarOpen && (
          <div 
            className={layoutStyles.mobileOverlay}
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar mobile (slide-in from left) */}
        <nav className={`${sidebarStyles.sidebar} ${sidebarStyles.mobileSidebar} ${
          isMobileSidebarOpen ? sidebarStyles.mobileOpen : ''
        }`}>
          <div className={sidebarStyles.sidebarHeader}>
            <h3>{APP_NAME}</h3>
          </div>
          
          
          <div className={sidebarStyles.sidebarContent}>
            <ul className={sidebarStyles.navLinks}>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink 
                    to={item.to} 
                    end={item.end}
                    className={({ isActive }) => isActive ? sidebarStyles.active : ''}
                    onClick={handleMobileNavClick}
                  >
                    <i className={`bi ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
            
            {/* Section Debug Mobile */}
            <div className={sidebarStyles.debugSection}>
              <button 
                className={sidebarStyles.debugButton}
                onClick={() => setShowDebug(!showDebug)}
                title="Outils de debug et tests"
              >
                <i className="bi bi-bug"></i>
                Debug & Tests
              </button>
            </div>
          </div>
          
          <div className={sidebarStyles.sidebarFooter}>
            {currentUser && (
              <div className={sidebarStyles.userInfo}>
                {/* Sélecteur d'organisation remplacé par un nom d'utilisateur cliquable */}
                <div className={sidebarStyles.userProfile}>
                  <OrganizationSelector />
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Navigation Mobile - Supprimée pour utiliser les boutons flottants */}

        {/* Contenu principal mobile */}
        <main className={`${layoutStyles.content} ${layoutStyles.mobileContent} ${
          isTransitioning ? "router-transition-active" : ""
        }`}>
          {children || <Outlet />}
        </main>
        
        {/* Dashboard de debug mobile */}
        {showDebug && <UnifiedDebugDashboard />}
      </div>
    );
  }

  // Layout Desktop (inchangé)
  return (
    <div className={layoutStyles.layoutContainer}>
      <nav className={sidebarStyles.sidebar}>
        <div className={sidebarStyles.sidebarHeader}>
          <h3>{APP_NAME}</h3>
        </div>
        
        
        <div className={sidebarStyles.sidebarContent}>
          <ul className={sidebarStyles.navLinks}>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink 
                  to={item.to} 
                  end={item.end}
                  className={({ isActive }) => isActive ? sidebarStyles.active : ''}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          
          {/* Section Debug Desktop */}
          <div className={sidebarStyles.debugSection}>
            <button 
              className={sidebarStyles.debugButton}
              onClick={() => setShowDebug(!showDebug)}
              title="Outils de debug et tests"
            >
              <i className="bi bi-bug"></i>
              Debug & Tests
            </button>
          </div>
        </div>
        <div className={sidebarStyles.sidebarFooter}>
          {currentUser && (
            <div className={sidebarStyles.userInfo}>
              {/* Sélecteur d'organisation remplacé par un nom d'utilisateur cliquable */}
              <div className={sidebarStyles.userProfile}>
                <OrganizationSelector />
              </div>
              
              <Button 
                onClick={handleLogout} 
                variant="outline-light"
                size="sm"
                className="mt-2 w-100"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </nav>
      <main className={`${layoutStyles.content} ${isTransitioning ? "router-transition-active" : ""}`}>
        {children || <Outlet />}
      </main>
      
      {/* Dashboard de debug desktop */}
      {showDebug && <UnifiedDebugDashboard />}
    </div>
  );
}

export default DesktopLayout;