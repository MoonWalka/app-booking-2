import React, { useState, useRef, useEffect } from 'react';
import { useTabs } from '@/context/TabsContext';
import styles from './TabManager.module.css';

// Import des pages/composants
import DashboardPage from '@/pages/DashboardPage';
import ContactsPage from '@/pages/ContactsPage';
import ContratsPage from '@/pages/ContratsPage';
import FacturesPage from '@/pages/FacturesPage';
import ParametresPage from '@/pages/ParametresPage';
import BookingParametragePage from '@/pages/BookingParametragePage';
import ProjetsPage from '@/pages/ProjetsPage';
import SallesPage from '@/pages/SallesPage';
import TableauDeBordPage from '@/pages/TableauDeBordPage';
import DebugToolsPage from '@/pages/DebugToolsPage';

// Import des composants de liste pour affichage direct dans les onglets
import ConcertsList from '@/components/concerts/ConcertsList';
import LieuxList from '@/components/lieux/LieuxList';
import ContactsList from '@/components/contacts/ContactsList'; // Liste unifiée contacts + structures
import ArtistesList from '@/components/artistes/ArtistesList';

// Import des composants de détails
import ContactViewTabs from '@/components/contacts/ContactViewTabs';
import LieuView from '@/components/lieux/desktop/LieuView';
// import StructureViewTabs from '@/components/structures/StructureViewTabs'; // Plus utilisé - maintenant tout est des contacts
import ConcertDetails from '@/components/concerts/ConcertDetails';

const TabManagerProduction = () => {
  const { 
    tabs, 
    activateTab, 
    closeTab, 
    closeOtherTabs,
    getActiveTab,
    openTab
  } = useTabs();

  // États pour la navigation des onglets
  const [scrollOffset, setScrollOffset] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsWrapperRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Fonction pour calculer si on peut faire défiler
  const updateScrollState = () => {
    if (!tabsWrapperRef.current || !scrollContainerRef.current) return;

    const wrapper = tabsWrapperRef.current;
    const container = scrollContainerRef.current;
    
    // Forcer une mise à jour des dimensions
    const wrapperWidth = wrapper.scrollWidth;
    const containerWidth = container.clientWidth;
    
    // Debug seulement si vraiment nécessaire
    if (process.env.NODE_ENV === 'development' && wrapperWidth > containerWidth) {
      console.log('🔍 Navigation onglets - Débordement détecté:', {
        wrapperWidth,
        containerWidth,
        hasOverflow: true,
        canScrollLeft: scrollOffset > 0,
        canScrollRight: scrollOffset < (wrapperWidth - containerWidth)
      });
    }
    
    const hasOverflow = wrapperWidth > containerWidth;
    const maxOffset = Math.max(0, wrapperWidth - containerWidth);
    
    setCanScrollLeft(scrollOffset > 0 && hasOverflow);
    setCanScrollRight(scrollOffset < maxOffset && hasOverflow);
  };

  // Fonction pour faire défiler vers la gauche
  const scrollLeft = () => {
    const newOffset = Math.max(0, scrollOffset - 200);
    setScrollOffset(newOffset);
  };

  // Fonction pour faire défiler vers la droite
  const scrollRight = () => {
    if (!tabsWrapperRef.current || !scrollContainerRef.current) return;

    const wrapper = tabsWrapperRef.current;
    const container = scrollContainerRef.current;
    const maxOffset = wrapper.scrollWidth - container.clientWidth;
    
    const newOffset = Math.min(maxOffset, scrollOffset + 200);
    setScrollOffset(newOffset);
  };

  // Effet pour mettre à jour l'état de défilement quand les onglets changent
  useEffect(() => {
    // Utiliser un timeout pour s'assurer que le DOM est mis à jour
    const timer = setTimeout(() => {
      updateScrollState();
    }, 0);
    return () => clearTimeout(timer);
  }, [tabs, scrollOffset]);

  // Effet pour écouter les changements de taille de fenêtre et recalculer
  useEffect(() => {
    const handleResize = () => {
      // Reset du scroll en cas de redimensionnement
      setScrollOffset(0);
      setTimeout(() => updateScrollState(), 0);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effet pour forcer une mise à jour initiale
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollState();
    }, 100); // Délai pour s'assurer que tout est rendu
    return () => clearTimeout(timer);
  }, []);

  // Observer pour détecter les changements de taille du container
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(scrollContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Debug: Fonction pour forcer la mise à jour (temporaire)
  const forceUpdate = () => {
    console.log('🔄 Force update navigation');
    updateScrollState();
  };

  // Debug: Fonction pour créer des onglets de test
  const createTestTabs = () => {
    for (let i = 1; i <= 10; i++) {
      openTab({
        id: `test-tab-${i}`,
        title: `Test Onglet ${i} avec nom très long pour forcer débordement`,
        path: `/test-${i}`,
        component: 'TestPage',
        icon: 'bi-file-earmark',
        closable: true
      });
    }
  };

  const renderTabContent = () => {
    const activeTab = getActiveTab();
    
    if (!activeTab) {
      return <div className={styles.tabContent}>Aucun onglet actif</div>;
    }

    const ComponentToRender = () => {
      switch (activeTab.component) {
        case 'DashboardPage':
          return <DashboardPage />;
        case 'ContactsPage':
          // Rendre le composant ContactsPage complet pour gérer les sous-routes
          console.log('[TabManager] Rendu ContactsPage pour activeTab:', activeTab);
          console.log('[TabManager] activeTab.path:', activeTab.path);
          return <ContactsPage tabPath={activeTab.path} />;
        case 'ContactDetailsPage':
          // Afficher les détails d'un contact avec le nouveau layout
          console.log('[DEBUG TabManager] activeTab pour ContactDetailsPage:', activeTab);
          console.log('[DEBUG TabManager] contactId passé:', activeTab.params?.contactId);
          console.log('[DEBUG TabManager] viewType passé:', activeTab.params?.viewType);
          return <ContactViewTabs id={activeTab.params?.contactId} viewType={activeTab.params?.viewType} />;
        case 'ConcertsPage':
          // Afficher directement la liste des concerts
          return <ConcertsList />;
        case 'ConcertDetailsPage':
          // Afficher les détails d'un concert
          return <ConcertDetails id={activeTab.params?.concertId} />;
        case 'LieuxPage':
          // Afficher directement la liste des lieux
          return <LieuxList />;
        case 'LieuDetailsPage':
          // Afficher les détails d'un lieu
          return <LieuView id={activeTab.params?.lieuId} />;
        case 'StructuresPage':
          // Afficher la liste unifiée des contacts (structures + personnes)
          return <ContactsList />;
        case 'StructureDetailsPage':
          // Afficher les détails d'une structure (maintenant c'est un contact de type structure)
          return <ContactViewTabs id={activeTab.params?.structureId} />;
        case 'ArtistesPage':
          // Afficher directement la liste des artistes
          return <ArtistesList />;
        case 'ContratsPage':
          return <ContratsPage />;
        case 'FacturesPage':
          return <FacturesPage />;
        case 'ParametresPage':
          return <ParametresPage />;
        case 'BookingParametragePage':
          return <BookingParametragePage />;
        case 'ProjetsPage':
          console.log('📂 Rendu de ProjetsPage dans TabManager');
          return <ProjetsPage />;
        case 'SallesPage':
          return <SallesPage />;
        case 'TableauDeBordPage':
          return <TableauDeBordPage />;
        case 'DebugToolsPage':
          return <DebugToolsPage />;
        default:
          return (
            <div className={styles.tabContent}>
              <h2>Composant non trouvé</h2>
              <p>Le composant "{activeTab.component}" n'est pas défini.</p>
              <pre>{JSON.stringify(activeTab, null, 2)}</pre>
            </div>
          );
      }
    };

    return <ComponentToRender />;
  };

  const handleTabRightClick = (e, tab) => {
    e.preventDefault();
    if (tab.closable) {
      // Menu contextuel simple pour fermer d'autres onglets
      const shouldCloseOthers = window.confirm('Fermer les autres onglets ?');
      if (shouldCloseOthers) {
        closeOtherTabs(tab.id);
      }
    }
  };

  return (
    <div className={styles.tabManager}>
      {/* Barre d'onglets avec navigation */}
      <div className={styles.tabBar}>
        {/* Bouton de navigation gauche */}
        <button
          className={`${styles.navButton} ${styles.leftNavButton}`}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          title="Onglets précédents"
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {/* Container avec défilement des onglets */}
        <div className={styles.tabScrollContainer} ref={scrollContainerRef}>
          <div 
            className={styles.tabsWrapper} 
            ref={tabsWrapperRef}
            style={{ transform: `translateX(-${scrollOffset}px)` }}
          >
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`${styles.tab} ${tab.isActive ? styles.active : ''}`}
                onClick={() => activateTab(tab.id)}
                onContextMenu={(e) => handleTabRightClick(e, tab)}
                title={tab.title}
              >
                <i className={`bi ${tab.icon} ${styles.tabIcon}`}></i>
                <span className={styles.tabTitle}>{tab.title}</span>
                {tab.closable && (
                  <button
                    className={styles.closeButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    title="Fermer l'onglet"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bouton de navigation droite */}
        <button
          className={`${styles.navButton} ${styles.rightNavButton}`}
          onClick={scrollRight}
          disabled={!canScrollRight}
          title="Onglets suivants"
        >
          <i className="bi bi-chevron-right"></i>
        </button>

      </div>

      {/* Contenu de l'onglet actif */}
      <div className={styles.tabContainer}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabManagerProduction;