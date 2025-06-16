// src/components/common/layout/DesktopLayout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTabs } from '@/context/TabsContext';
import TabManagerProduction from '@/components/tabs/TabManagerProduction';
import Button from '@ui/Button';
import { useAuth } from '@/context/AuthContext.js';
import { useResponsive } from '@/hooks/common';
import { OrganizationSelector } from '@/components/organization';
import { APP_NAME } from '@/config.js';
import layoutStyles from '@/components/layout/Layout.module.css';
import sidebarStyles from '@/components/layout/Sidebar.module.css';

function DesktopLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const { 
    openContactsListTab,
    openConcertsListTab,
    openLieuxListTab,
    openStructuresListTab,
    openTab
  } = useTabs();
  
  // État pour suivre si une transition est en cours
  const [isTransitioning, setIsTransitioning] = useState(false);
  // État pour la sidebar mobile (hamburger menu)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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

  // Effet pour fermer les panneaux lors du changement de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) { // Breakpoint mobile
        setExpandedMenu(null);
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // État pour gérer l'expansion des menus
  const [expandedMenu, setExpandedMenu] = useState(null);
  // État pour le menu utilisateur
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Navigation adaptée pour le système d'onglets
  const handleNavigation = (item) => {
    // Pour les éléments avec des actions spéciales
    switch (item.to) {
      case '/':
        // Dashboard - activer l'onglet existant
        openTab({
          id: 'dashboard',
          title: 'Dashboard',
          path: '/',
          component: 'DashboardPage',
          icon: 'bi-speedometer2',
          closable: false
        });
        break;
      case '/contacts':
        openContactsListTab();
        break;
      case '/concerts':
        openConcertsListTab();
        break;
      case '/lieux':
        openLieuxListTab();
        break;
      case '/structures':
        openStructuresListTab();
        break;
      case '/artistes':
        openTab({
          id: 'artistes-list',
          title: 'Artistes',
          path: '/artistes',
          component: 'ArtistesPage',
          icon: 'bi-music-note-beamed'
        });
        break;
      case '/contrats':
        openTab({
          id: 'contrats-list',
          title: 'Contrats',
          path: '/contrats',
          component: 'ContratsPage',
          icon: 'bi-file-earmark-text'
        });
        break;
      case '/factures':
        openTab({
          id: 'factures-list',
          title: 'Factures',
          path: '/factures',
          component: 'FacturesPage',
          icon: 'bi-receipt'
        });
        break;
      case '/parametres':
        openTab({
          id: 'parametres',
          title: 'Paramètres',
          path: '/parametres',
          component: 'ParametresPage',
          icon: 'bi-gear'
        });
        break;
      case '/debug-tools':
        openTab({
          id: 'debug-tools',
          title: 'Debug Tools',
          path: '/debug-tools',
          component: 'DebugToolsPage',
          icon: 'bi-bug'
        });
        break;
      case '/tabs-test':
        // Naviguer normalement pour cette page de test
        navigate(item.to);
        break;
      default:
        // Navigation standard pour les autres pages
        navigate(item.to);
    }
  };

  // Nouvelle structure de navigation groupée
  const navigationGroups = [
    { to: "/", icon: "bi-speedometer2", label: "Dashboard", end: true },
    {
      id: "contact",
      icon: "bi-person-badge",
      label: "Contact",
      subItems: [
        { to: "/contacts", icon: "bi-people", label: "Tous les contacts" },
        { to: "/lieux", icon: "bi-geo-alt", label: "Lieux" },
        { to: "/structures", icon: "bi-building", label: "Structures" }
      ]
    },
    {
      id: "booking",
      icon: "bi-calendar-event", 
      label: "Booking",
      subItems: [
        { to: "/concerts", icon: "bi-calendar-event", label: "Concerts" },
        { to: "/contrats", icon: "bi-file-earmark-text", label: "Contrats" },
        { to: "/factures", icon: "bi-receipt", label: "Factures" },
        { to: "/artistes", icon: "bi-music-note-beamed", label: "Artistes" }
      ]
    },
    {
      id: "admin",
      icon: "bi-shield-check",
      label: "Admin", 
      subItems: [
        { to: "/debug-tools", icon: "bi-bug", label: "Debug Tools" },
        { to: "/tabs-test", icon: "bi-window-stack", label: "Test Onglets" }
      ]
    },
    { to: "/parametres", icon: "bi-gear", label: "Paramètres" }
  ];

  // Gérer l'expansion/contraction des menus
  const toggleMenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
    // Fermer le menu utilisateur si un autre menu s'ouvre
    if (menuId && isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  // Gérer l'ouverture/fermeture du menu utilisateur
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    // Fermer les autres menus si le menu utilisateur s'ouvre
    if (!isUserMenuOpen && expandedMenu) {
      setExpandedMenu(null);
    }
  };

  // Calculer le décalage du contenu principal
  const getContentOffset = () => {
    if (isMobile) return 0; // Pas de décalage sur mobile
    
    const sidebarWidth = 70; // var(--tc-sidebar-width-thin)
    const panelWidth = 250; // var(--tc-submenu-width)
    
    if (expandedMenu || isUserMenuOpen) {
      return sidebarWidth + panelWidth;
    }
    return sidebarWidth;
  };


  // Fonction pour rendre un élément de navigation
  const renderNavItem = (item) => {
    // Si l'élément a des sous-éléments (menu expandable)
    if (item.subItems) {
      const isExpanded = expandedMenu === item.id;
      return (
        <li key={item.id} className={sidebarStyles.navGroup}>
          <button 
            className={sidebarStyles.navGroupToggle}
            onClick={() => toggleMenu(item.id)}
            aria-expanded={isExpanded}
            title={item.label}
          >
            <i className={`bi ${item.icon}`}></i>
            {!isMobile && <span className={sidebarStyles.tooltip}>{item.label}</span>}
          </button>
          {isExpanded && (
            <>
              <div 
                className={sidebarStyles.subMenuOverlay}
                onClick={() => setExpandedMenu(null)}
              />
              <div className={sidebarStyles.subMenuPanel}>
                <div className={sidebarStyles.subMenuHeader}>
                  <h4>{item.label}</h4>
                  <button 
                    className={sidebarStyles.closeSubMenu}
                    onClick={() => setExpandedMenu(null)}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
                <ul className={sidebarStyles.subMenu}>
                  {item.subItems.map((subItem) => (
                    <li key={subItem.to}>
                      <button 
                        className={sidebarStyles.navButton}
                        onClick={() => {
                          handleNavigation(subItem);
                          if (isMobile) {
                            handleMobileNavClick();
                          }
                        }}
                      >
                        <i className={`bi ${subItem.icon}`}></i>
                        <span>{subItem.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </li>
      );
    }
    
    // Élément de navigation simple
    return (
      <li key={item.to}>
        <button 
          className={sidebarStyles.navButton}
          onClick={() => {
            handleNavigation(item);
            if (isMobile) {
              handleMobileNavClick();
            }
          }}
          title={item.label}
        >
          <i className={`bi ${item.icon}`}></i>
          {!isMobile && <span className={sidebarStyles.tooltip}>{item.label}</span>}
        </button>
      </li>
    );
  };

  // Fonction pour fermer la sidebar mobile au clic sur un lien
  const handleMobileNavClick = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(false);
      setIsUserMenuOpen(false);
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
          <div className={sidebarStyles.sidebarContent}>
            <ul className={sidebarStyles.navLinks}>
              {navigationGroups.map(renderNavItem)}
            </ul>
            
          </div>
          
          <div className={sidebarStyles.sidebarFooter}>
            {currentUser && (
              <div className={sidebarStyles.footerIcons}>
                {/* Icône utilisateur avec texte pour mobile */}
                <button 
                  className={sidebarStyles.footerIconButton}
                  onClick={toggleUserMenu}
                  title="Profil utilisateur"
                >
                  <i className="bi bi-person-circle"></i>
                  {isMobile && <span>Profil</span>}
                </button>
                
                {/* Icône déconnexion avec texte pour mobile */}
                <button 
                  className={sidebarStyles.footerIconButton}
                  onClick={handleLogout}
                  title="Déconnexion"
                >
                  <i className="bi bi-power"></i>
                  {isMobile && <span>Déconnexion</span>}
                </button>
              </div>
            )}
          </div>

          {/* Panneau utilisateur mobile */}
          {isUserMenuOpen && (
            <>
              <div 
                className={layoutStyles.mobileOverlay}
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className={`${sidebarStyles.userMenuPanel} ${sidebarStyles.mobileUserPanel}`}>
                <div className={sidebarStyles.subMenuHeader}>
                  <h4>Profil & Organisation</h4>
                  <button 
                    className={sidebarStyles.closeSubMenu}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
                <div className={sidebarStyles.userMenuContent}>
                  {/* Informations utilisateur */}
                  <div className={sidebarStyles.userSection}>
                    <div className={sidebarStyles.userProfile}>
                      <i className="bi bi-person-circle" style={{fontSize: '2rem', marginBottom: '0.5rem'}}></i>
                      <div className={sidebarStyles.userDetails}>
                        <p className={sidebarStyles.userEmail}>{currentUser?.email}</p>
                        <small className={sidebarStyles.userRole}>Utilisateur</small>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sélecteur d'organisation */}
                  <div className={sidebarStyles.organizationSection}>
                    <h5>Organisation</h5>
                    <OrganizationSelector />
                  </div>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Bottom Navigation Mobile - Supprimée pour utiliser les boutons flottants */}

        {/* Contenu principal mobile */}
        <main className={`${layoutStyles.content} ${layoutStyles.mobileContent} ${
          isTransitioning ? "router-transition-active" : ""
        }`}>
          <TabManagerProduction />
        </main>
        
      </div>
    );
  }

  // Layout Desktop (inchangé)
  return (
    <div className={layoutStyles.layoutContainer}>
      <nav className={sidebarStyles.sidebar}>
        <div className={sidebarStyles.sidebarContent}>
          <ul className={sidebarStyles.navLinks}>
            {navigationGroups.map(renderNavItem)}
          </ul>
          
        </div>
        <div className={sidebarStyles.sidebarFooter}>
          {currentUser && (
            <div className={sidebarStyles.footerIcons}>
              {/* Icône utilisateur avec tooltip */}
              <button 
                className={sidebarStyles.footerIconButton}
                onClick={toggleUserMenu}
                title="Profil utilisateur"
              >
                <i className="bi bi-person-circle"></i>
                {!isMobile && <span className={sidebarStyles.tooltip}>Profil</span>}
              </button>
              
              {/* Icône déconnexion avec tooltip */}
              <button 
                className={sidebarStyles.footerIconButton}
                onClick={handleLogout}
                title="Déconnexion"
              >
                <i className="bi bi-power"></i>
                {!isMobile && <span className={sidebarStyles.tooltip}>Déconnexion</span>}
              </button>
            </div>
          )}
        </div>

        {/* Panneau utilisateur latéral */}
        {isUserMenuOpen && (
          <>
            <div 
              className={sidebarStyles.subMenuOverlay}
              onClick={() => setIsUserMenuOpen(false)}
            />
            <div className={sidebarStyles.userMenuPanel}>
              <div className={sidebarStyles.subMenuHeader}>
                <h4>Profil & Organisation</h4>
                <button 
                  className={sidebarStyles.closeSubMenu}
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className={sidebarStyles.userMenuContent}>
                {/* Informations utilisateur */}
                <div className={sidebarStyles.userSection}>
                  <div className={sidebarStyles.userProfile}>
                    <i className="bi bi-person-circle" style={{fontSize: '2rem', marginBottom: '0.5rem'}}></i>
                    <div className={sidebarStyles.userDetails}>
                      <p className={sidebarStyles.userEmail}>{currentUser?.email}</p>
                      <small className={sidebarStyles.userRole}>Utilisateur</small>
                    </div>
                  </div>
                </div>
                
                {/* Sélecteur d'organisation */}
                <div className={sidebarStyles.organizationSection}>
                  <h5>Organisation</h5>
                  <OrganizationSelector />
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
      
      {/* Header général sur toute la largeur */}
      <header className={layoutStyles.mainHeader}>
        <div className={layoutStyles.headerContent}>
          <div className={layoutStyles.headerLogo}>
            <h3>{APP_NAME}</h3>
          </div>
          <div className={layoutStyles.headerActions}>
            {/* Actions du header pourront être ajoutées ici */}
          </div>
        </div>
      </header>

      <main 
        className={`${layoutStyles.content} ${isTransitioning ? "router-transition-active" : ""}`}
        style={{ marginLeft: `${getContentOffset()}px` }}
      >
        <TabManagerProduction />
      </main>
      
    </div>
  );
}

export default DesktopLayout;