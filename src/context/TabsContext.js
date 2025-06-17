import React, { createContext, useContext, useState, useCallback } from 'react';

const TabsContext = createContext();

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};

export const TabsProvider = ({ children }) => {
  const [tabs, setTabs] = useState([
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/',
      component: 'DashboardPage',
      isActive: true,
      closable: false,
      icon: 'bi-speedometer2'
    }
  ]);

  const [activeTabId, setActiveTabId] = useState('dashboard');

  // Ouvrir un nouvel onglet ou activer un existant
  const openTab = useCallback((tabConfig) => {
    const { id, title, path, component, params = {}, icon = 'bi-file-earmark', closable = true } = tabConfig;
    
    // Vérifier si l'onglet existe déjà
    const existingTab = tabs.find(tab => tab.id === id);
    
    if (existingTab) {
      // Activer l'onglet existant
      setActiveTabId(id);
      setTabs(prevTabs => 
        prevTabs.map(tab => ({
          ...tab,
          isActive: tab.id === id
        }))
      );
    } else {
      // Créer un nouvel onglet
      const newTab = {
        id,
        title,
        path,
        component,
        params,
        icon,
        closable,
        isActive: true,
        createdAt: Date.now()
      };
      
      setTabs(prevTabs => [
        ...prevTabs.map(tab => ({ ...tab, isActive: false })),
        newTab
      ]);
      setActiveTabId(id);
    }
  }, [tabs]);

  // Fermer un onglet
  const closeTab = useCallback((tabId) => {
    if (tabs.length <= 1) return; // Ne pas fermer le dernier onglet
    
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.closable) return; // Ne pas fermer un onglet non-fermable
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const isActiveTab = activeTabId === tabId;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // Si on ferme l'onglet actif, activer le précédent ou le suivant
    if (isActiveTab && newTabs.length > 0) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      const newActiveTabId = newTabs[newActiveIndex]?.id;
      setActiveTabId(newActiveTabId);
      setTabs(prevTabs => 
        prevTabs.map(tab => ({
          ...tab,
          isActive: tab.id === newActiveTabId
        }))
      );
    }
  }, [tabs, activeTabId]);

  // Activer un onglet
  const activateTab = useCallback((tabId) => {
    setActiveTabId(tabId);
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    );
  }, []);

  // Fermer tous les onglets sauf le dashboard et l'actuel
  const closeOtherTabs = useCallback((keepTabId) => {
    setTabs(prevTabs => 
      prevTabs.filter(tab => 
        !tab.closable || tab.id === keepTabId
      )
    );
  }, []);

  // Fermer tous les onglets fermables
  const closeAllTabs = useCallback(() => {
    const nonClosableTabs = tabs.filter(tab => !tab.closable);
    setTabs(nonClosableTabs);
    
    if (nonClosableTabs.length > 0) {
      const dashboardTab = nonClosableTabs[0];
      setActiveTabId(dashboardTab.id);
      setTabs(prevTabs => 
        prevTabs.map(tab => ({
          ...tab,
          isActive: tab.id === dashboardTab.id
        }))
      );
    }
  }, [tabs]);

  // Obtenir l'onglet actif
  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId);
  }, [tabs, activeTabId]);

  // Helpers pour créer des onglets rapidement
  const openContactTab = useCallback((contactId, contactName) => {
    openTab({
      id: `contact-${contactId}`,
      title: contactName,
      path: `/contacts/${contactId}`,
      component: 'ContactDetailsPage',
      params: { contactId },
      icon: 'bi-person'
    });
  }, [openTab]);

  const openLieuTab = useCallback((lieuId, lieuName) => {
    openTab({
      id: `lieu-${lieuId}`,
      title: `Lieu - ${lieuName}`,
      path: `/lieux/${lieuId}`,
      component: 'LieuDetailsPage',
      params: { lieuId },
      icon: 'bi-geo-alt'
    });
  }, [openTab]);

  const openConcertTab = useCallback((concertId, concertTitle) => {
    openTab({
      id: `concert-${concertId}`,
      title: `Concert - ${concertTitle}`,
      path: `/concerts/${concertId}`,
      component: 'ConcertDetailsPage',
      params: { concertId },
      icon: 'bi-calendar-event'
    });
  }, [openTab]);

  const openStructureTab = useCallback((structureId, structureName) => {
    openTab({
      id: `structure-${structureId}`,
      title: structureName,
      path: `/structures/${structureId}`,
      component: 'StructureDetailsPage',
      params: { structureId },
      icon: 'bi-building'
    });
  }, [openTab]);

  // Helper pour ouvrir les pages principales
  const openContactsListTab = useCallback(() => {
    openTab({
      id: 'contacts-list',
      title: 'Contacts',
      path: '/contacts',
      component: 'ContactsPage',
      icon: 'bi-people'
    });
  }, [openTab]);

  const openConcertsListTab = useCallback(() => {
    openTab({
      id: 'concerts-list',
      title: 'Concerts',
      path: '/concerts',
      component: 'ConcertsPage',
      icon: 'bi-calendar-event'
    });
  }, [openTab]);

  const openLieuxListTab = useCallback(() => {
    openTab({
      id: 'lieux-list',
      title: 'Lieux',
      path: '/lieux',
      component: 'LieuxPage',
      icon: 'bi-geo-alt'
    });
  }, [openTab]);

  const openStructuresListTab = useCallback(() => {
    openTab({
      id: 'structures-list',
      title: 'Structures',
      path: '/structures',
      component: 'StructuresPage',
      icon: 'bi-building'
    });
  }, [openTab]);

  const openDebugToolsTab = useCallback(() => {
    openTab({
      id: 'debug-tools',
      title: 'Debug Tools',
      path: '/debug-tools',
      component: 'DebugToolsPage',
      icon: 'bi-bug'
    });
  }, [openTab]);

  const value = {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    activateTab,
    closeOtherTabs,
    closeAllTabs,
    getActiveTab,
    // Helpers spécialisés
    openContactTab,
    openLieuTab,
    openConcertTab,
    openStructureTab,
    openContactsListTab,
    openConcertsListTab,
    openLieuxListTab,
    openStructuresListTab,
    openDebugToolsTab
  };

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};

export default TabsContext;