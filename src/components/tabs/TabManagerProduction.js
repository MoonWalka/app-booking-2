import React, { Suspense } from 'react';
import { useTabs } from '@/context/TabsContext';
import FlexContainer from '@/components/ui/FlexContainer';
import styles from './TabManager.module.css';

// Import des pages/composants
import DashboardPage from '@/pages/DashboardPage';
import ContactsPage from '@/pages/ContactsPage';
import ContratsPage from '@/pages/ContratsPage';
import FacturesPage from '@/pages/FacturesPage';
import ParametresPage from '@/pages/ParametresPage';
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
    getActiveTab 
  } = useTabs();

  const renderTabContent = () => {
    const activeTab = getActiveTab();
    
    if (!activeTab) {
      return <div className={styles.tabContent}>Aucun onglet actif</div>;
    }

    const LoadingFallback = () => (
      <FlexContainer justify="center" align="center" className="loading-container tc-min-h-300">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement...</p>
        </div>
      </FlexContainer>
    );

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

    return (
      <Suspense fallback={<LoadingFallback />}>
        <ComponentToRender />
      </Suspense>
    );
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
      {/* Barre d'onglets */}
      <div className={styles.tabBar}>
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

      {/* Contenu de l'onglet actif */}
      <div className={styles.tabContainer}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabManagerProduction;