import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTabs } from '@/context/TabsContext';
import styles from './TabManager.module.css';

// Import des pages/composants
import DashboardPage from '@/pages/DashboardPage';
import ContactsPage from '@/pages/ContactsPage';
import DatesPage from '@/pages/DatesPage';
import PublicationsPage from '@/pages/PublicationsPage';
import ContratsPage from '@/pages/ContratsPage';
import ContratDetailsPage from '@/pages/ContratDetailsPage';
import FacturesPage from '@/pages/FacturesPage';
import FactureGeneratorPage from '@/pages/FactureGeneratorPage';
// FactureDetailsPage remplacé par FactureGeneratorPage
import DevisPage from '@/pages/DevisPage';
import BookingParametragePage from '@/pages/BookingParametragePage';
import ProjetsPage from '@/pages/ProjetsPage';
import SallesPage from '@/pages/SallesPage';
import TableauDeBordPage from '@/pages/TableauDeBordPage';
import DebugToolsPage from '@/pages/DebugToolsPage';
import DateCreationPage from '@/pages/DateCreationPage';
import DateDetailsPage from '@/pages/DateDetailsPage';
import TachesPage from '@/pages/TachesPage';
import CollaborationParametragePage from '@/pages/CollaborationParametragePage';
import AdminParametragePage from '@/pages/AdminParametragePage';
import ContactParametragePage from '@/pages/ContactParametragePage';
import PreContratGenerationPage from '@/pages/PreContratGenerationPage';
import ConfirmationPage from '@/pages/ConfirmationPage';
import ContratGenerationNewPage from '@/pages/ContratGenerationNewPage';
import ContratRedactionPage from '@/pages/ContratRedactionPage';
import MesRecherchesPage from '@/pages/MesRecherchesPage';
import MesSelectionsPage from '@/pages/MesSelectionsPage';
import ContactTagsPage from '@/pages/ContactTagsPage';
import FestivalsDatesPage from '@/pages/FestivalsDatesPage';

// Import des composants de liste pour affichage direct dans les onglets
// import DatesList from '@/components/dates/DatesList'; // Plus utilisé
import ContactsList from '@/components/contacts/desktop/ContactsList'; // Liste unifiée contacts + structures
import ContactsListFiltered from '@/components/contacts/ContactsListFiltered'; // Liste filtrée par tag
import ArtistesList from '@/components/artistes/ArtistesList';

// Import des composants de détails
import ContactViewTabs from '@/components/contacts/ContactViewTabs';
// import StructureViewTabs from '@/components/structures/StructureViewTabs'; // Plus utilisé - maintenant tout est des contacts
// DateDetails retiré car DateDetailsPage est utilisé
// ContratGeneratorNew retiré car non utilisé

const TabManagerProduction = () => {
  const { 
    tabs, 
    activateTab, 
    closeTab, 
    closeOtherTabs
    // openTab
  } = useTabs();

  // États pour la navigation des onglets
  const [scrollOffset, setScrollOffset] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsWrapperRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Fonction pour calculer si on peut faire défiler
  const updateScrollState = useCallback(() => {
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
  }, [scrollOffset]);

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
  }, [tabs, scrollOffset, updateScrollState]);

  // Effet pour écouter les changements de taille de fenêtre et recalculer
  useEffect(() => {
    const handleResize = () => {
      // Reset du scroll en cas de redimensionnement
      setScrollOffset(0);
      setTimeout(() => updateScrollState(), 0);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScrollState]);

  // Effet pour forcer une mise à jour initiale
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollState();
    }, 100); // Délai pour s'assurer que tout est rendu
    return () => clearTimeout(timer);
  }, [updateScrollState]);

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
  }, [updateScrollState]);

  // Debug: Fonction pour forcer la mise à jour (temporaire)
  // const forceUpdate = () => {
  //   console.log('🔄 Force update navigation');
  //   updateScrollState();
  // };

  // Debug: Fonction pour créer des onglets de test
  // const createTestTabs = () => {
  //   for (let i = 1; i <= 10; i++) {
  //     openTab({
  //       id: `test-tab-${i}`,
  //       title: `Test Onglet ${i} avec nom très long pour forcer débordement`,
  //       path: `/test-${i}`,
  //       component: 'TestPage',
  //       icon: 'bi-file-earmark',
  //       closable: true
  //     });
  //   }
  // };

  const renderTabContent = useCallback((tab) => {
    if (!tab) {
      return <div className={styles.tabContent}>Aucun onglet actif</div>;
    }

    // NE PAS créer de fonction ici ! Retourner directement le JSX
    switch (tab.component) {
        case 'DashboardPage':
          return <DashboardPage />;
        case 'ContactsPage':
          // Rendre le composant ContactsPage complet pour gérer les sous-routes
          console.log('[TabManager] Rendu ContactsPage pour tab:', tab);
          console.log('[TabManager] tab.path:', tab.path);
          return <ContactsPage tabPath={tab.path} />;
        case 'ContactsListFiltered':
          // Afficher la liste filtrée des contacts par tag
          return <ContactsListFiltered 
            filterTag={tab.params?.filterTag}
            filterType={tab.params?.filterType}
            usageCount={tab.params?.usageCount}
          />;
        case 'ContactDetailsPage':
          // Afficher les détails d'un contact avec le nouveau layout
          console.log('[DEBUG TabManager] tab pour ContactDetailsPage:', tab);
          console.log('[DEBUG TabManager] contactId passé:', tab.params?.contactId);
          console.log('[DEBUG TabManager] viewType passé:', tab.params?.viewType);
          return <ContactViewTabs 
            key={tab.id}
            id={tab.params?.contactId} 
            viewType={tab.params?.viewType} 
          />;
        case 'DatesPage': // Rétrocompatibilité avec les anciens onglets
          // Afficher directement la liste des dates
          return <DatesPage />;
        case 'PublicationsPage':
          // Afficher directement la liste des publications
          return <PublicationsPage />;
        case 'StructuresPage':
          // Afficher la liste unifiée des contacts (structures + personnes)
          return <ContactsList />;
        case 'StructureDetailsPage':
          // Afficher les détails d'une structure (maintenant c'est un contact de type structure)
          return <ContactViewTabs 
            key={tab.id}
            id={tab.params?.structureId} 
          />;
        // Note: ContactDetailsPage est déjà géré plus haut dans le switch
        case 'ArtistesPage':
          // Afficher directement la liste des artistes
          return <ArtistesList />;
        case 'ContratsPage':
          return <ContratsPage />;
        case 'ContratDetailsPage':
          console.log('[TabManager] Rendu ContratDetailsPage avec tab:', tab);
          console.log('[TabManager] contratId passé:', tab.params?.contratId);
          return <ContratDetailsPage />;
        case 'FacturesPage':
          return <FacturesPage />;
        case 'FactureGeneratorPage':
          console.log('[TabManager] Rendu FactureGeneratorPage avec tab:', tab);
          console.log('[TabManager] dateId passé:', tab.params?.dateId);
          console.log('[TabManager] contratId passé:', tab.params?.contratId);
          return <FactureGeneratorPage />;
        case 'FactureDetailsPage':
          console.log('[TabManager] Rendu FactureGeneratorPage (remplace FactureDetailsPage) avec tab:', tab);
          console.log('[TabManager] factureId passé:', tab.params?.factureId);
          console.log('[TabManager] dateId passé:', tab.params?.dateId);
          console.log('[TabManager] contratId passé:', tab.params?.contratId);
          return <FactureGeneratorPage 
            factureId={tab.params?.factureId}
            dateId={tab.params?.dateId}
            contratId={tab.params?.contratId}
          />;
        case 'DevisPage':
          console.log('[TabManager] Rendu DevisPage avec tab:', tab);
          console.log('[TabManager] devisId passé:', tab.params?.devisId);
          console.log('[TabManager] dateId passé:', tab.params?.dateId);
          console.log('[TabManager] structureId passé:', tab.params?.structureId);
          return <DevisPage 
            devisId={tab.params?.devisId}
            dateId={tab.params?.dateId}
            structureId={tab.params?.structureId}
          />;
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
        case 'DateCreationPage':
          return <DateCreationPage />;
        case 'DateDetailsPage':
          console.log('[TabManager] Rendu DateDetailsPage avec tab:', tab);
          console.log('[TabManager] dateId passé:', tab.params?.id);
          return <DateDetailsPage params={tab.params} />;
        case 'TachesPage':
          return <TachesPage />;
        case 'CollaborationParametragePage':
          return <CollaborationParametragePage />;
        case 'AdminParametragePage':
          return <AdminParametragePage />;
        case 'ContactParametragePage':
          return <ContactParametragePage />;
        case 'PreContratGenerationPage':
          console.log('[TabManager] Rendu PreContratGenerationPage avec tab:', tab);
          console.log('[TabManager] dateId passé:', tab.params?.dateId);
          return <PreContratGenerationPage dateId={tab.params?.dateId} />;
        case 'ConfirmationPage':
          return <ConfirmationPage dateId={tab.params?.dateId} />;
        case 'ContratGenerationNewPage':
          console.log('[TabManager] Rendu ContratGenerationNewPage avec tab:', tab);
          console.log('[TabManager] dateId passé:', tab.params?.dateId);
          return <ContratGenerationNewPage dateId={tab.params?.dateId} />;
        case 'ContratRedactionPage':
          console.log('[TabManager] Rendu ContratRedactionPage avec tab:', tab);
          console.log('[TabManager] contratId passé:', tab.params?.id);
          return <ContratRedactionPage />;
        case 'MesRecherchesPage':
          return <MesRecherchesPage />;
        case 'MesSelectionsPage':
          return <MesSelectionsPage />;
        case 'ContactTagsPage':
          return <ContactTagsPage />;
        case 'FestivalsDatesPage':
          return <FestivalsDatesPage />;
        default:
          return (
            <div className={styles.tabContent}>
              <h2>Composant non trouvé</h2>
              <p>Le composant "{tab.component}" n'est pas défini.</p>
              <pre>{JSON.stringify(tab, null, 2)}</pre>
            </div>
          );
    }
  }, []);

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

      {/* Contenu de tous les onglets (cachés sauf l'actif) */}
      <div className={styles.tabContainer}>
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            style={{ display: tab.isActive ? 'block' : 'none' }}
            className={styles.tabContent}
          >
            {renderTabContent(tab)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabManagerProduction;