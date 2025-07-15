import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

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
  
  // État pour persister les onglets du bas actifs par entité
  const [bottomTabsState, setBottomTabsState] = useState({});

  // Ouvrir un nouvel onglet ou activer un existant
  const openTab = useCallback((tabConfig) => {
    console.log('[TabsContext] === DÉBUT openTab ===');
    console.log('[TabsContext] Configuration reçue:', tabConfig);
    
    const { id, title, path, component, params = {}, icon = 'bi-file-earmark', closable = true } = tabConfig;
    
    setTabs(prevTabs => {
      console.log('[TabsContext] Tabs actuels:', prevTabs.map(t => ({ id: t.id, title: t.title })));
      
      // Vérifier si l'onglet existe déjà
      const existingTab = prevTabs.find(tab => tab.id === id);
      
      if (existingTab) {
        console.log('[TabsContext] Onglet existant trouvé, activation:', id);
        // Si l'onglet est déjà actif, ne rien faire
        if (existingTab.isActive) {
          console.log('[TabsContext] Onglet déjà actif, pas de changement');
          return prevTabs;
        }
        // Activer l'onglet existant
        console.log('[TabsContext] 🔀 CHANGEMENT D\'ONGLET - ancien:', activeTabId, '→ nouveau:', id);
        setActiveTabId(id);
        return prevTabs.map(tab => ({
          ...tab,
          isActive: tab.id === id
        }));
      } else {
        console.log('[TabsContext] Création d\'un nouvel onglet:', id);
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
        
        console.log('[TabsContext] Nouvel onglet créé:', newTab);
        setActiveTabId(id);
        
        const updatedTabs = [
          ...prevTabs.map(tab => ({ ...tab, isActive: false })),
          newTab
        ];
        console.log('[TabsContext] Tabs après ajout:', updatedTabs.map(t => ({ id: t.id, title: t.title, isActive: t.isActive })));
        return updatedTabs;
      }
    });
    
    console.log('[TabsContext] === FIN openTab ===');
  }, []); // Supprimer tabs des dépendances - utiliser prevTabs dans setter

  // Fermer un onglet
  const closeTab = useCallback((tabId) => {
    setTabs(prevTabs => {
      if (prevTabs.length <= 1) return prevTabs; // Ne pas fermer le dernier onglet
      
      const tab = prevTabs.find(t => t.id === tabId);
      if (!tab?.closable) return prevTabs; // Ne pas fermer un onglet non-fermable
      
      const tabIndex = prevTabs.findIndex(tab => tab.id === tabId);
      const isActiveTab = activeTabId === tabId;
      
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // Si on ferme l'onglet actif, activer le précédent ou le suivant
      if (isActiveTab && newTabs.length > 0) {
        const newActiveIndex = Math.max(0, tabIndex - 1);
        const newActiveTabId = newTabs[newActiveIndex]?.id;
        setActiveTabId(newActiveTabId);
        return newTabs.map(tab => ({
          ...tab,
          isActive: tab.id === newActiveTabId
        }));
      }
      
      return newTabs;
    });
  }, [activeTabId]); // Supprimer tabs des dépendances

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
    setTabs(prevTabs => {
      const nonClosableTabs = prevTabs.filter(tab => !tab.closable);
      
      if (nonClosableTabs.length > 0) {
        const dashboardTab = nonClosableTabs[0];
        setActiveTabId(dashboardTab.id);
        return nonClosableTabs.map(tab => ({
          ...tab,
          isActive: tab.id === dashboardTab.id
        }));
      }
      
      return nonClosableTabs;
    });
  }, []); // Supprimer tabs des dépendances

  // Obtenir l'onglet actif
  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId);
  }, [tabs, activeTabId]); // Cette fonction peut garder tabs car elle ne modifie pas l'état

  // Helpers pour créer des onglets rapidement
  const openContactTab = useCallback((contactId, contactName, viewType = null) => {
    const tabId = viewType ? `contact-${contactId}-${viewType}` : `contact-${contactId}`;
    const tabParams = viewType ? { contactId, viewType } : { contactId };
    
    openTab({
      id: tabId,
      title: contactName,
      path: `/contacts/${contactId}`,
      component: 'ContactDetailsPage',
      params: tabParams,
      icon: 'bi-person'
    });
  }, [openTab]);

  const openContactEditTab = useCallback((contactId, contactName) => {
    openTab({
      id: `contact-edit-${contactId}`,
      title: `Éditer - ${contactName}`,
      path: `/contacts/${contactId}/edit`,
      component: 'ContactsPage',
      params: { contactId },
      icon: 'bi-pencil'
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

  const openDateTab = useCallback((dateId, dateTitle) => {
    console.log('[TabsContext] openDateTab appelé - ouverture DateDetailsPage');
    openTab({
      id: `date-details-${dateId}`,
      title: dateTitle || 'Détails de la date',
      path: `/dates/${dateId}`,
      component: 'DateDetailsPage',
      params: { id: dateId },
      icon: 'bi-calendar-check'
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

  const openDatesListTab = useCallback(() => {
    console.log('[TabsContext] openDatesListTab appelé');
    const tabConfig = {
      id: 'dates-list',
      title: 'Liste des dates',
      path: '/dates',
      component: 'DatesPage',
      icon: 'bi-calendar-event'
    };
    console.log('[TabsContext] Ouverture onglet avec config:', tabConfig);
    openTab(tabConfig);
  }, [openTab]);

  const openPublicationsListTab = useCallback(() => {
    openTab({
      id: 'publications-list',
      title: 'Publications',
      path: '/publications',
      component: 'PublicationsPage',
      icon: 'bi-newspaper'
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

  const openTachesTab = useCallback(() => {
    openTab({
      id: 'taches',
      title: 'Tâches',
      path: '/taches',
      component: 'TachesPage',
      icon: 'bi-check2-square'
    });
  }, [openTab]);

  const openDateCreationTab = useCallback((prefilledData = {}) => {
    const tabId = prefilledData.structureId ? `date-creation-${prefilledData.structureId}` : 'date-creation';
    const tabTitle = prefilledData.structureName ? `Nouvelle Date - ${prefilledData.structureName}` : 'Nouvelle Date';
    
    openTab({
      id: tabId,
      title: tabTitle,
      path: '/booking/nouvelle-date',
      component: 'DateCreationPage',
      params: { prefilledData },
      icon: 'bi-calendar-plus'
    });
  }, [openTab]);

  const openDateDetailsTab = useCallback((dateId, dateTitle) => {
    console.log('[TabsContext] openDateDetailsTab appelé - dateId:', dateId);
    openTab({
      id: `date-details-${dateId}`,
      title: dateTitle || 'Détails de la date',
      path: `/dates/${dateId}`,
      component: 'DateDetailsPage',
      params: { id: dateId },
      icon: 'bi-calendar-check'
    });
  }, [openTab]);

  const openPreContratTab = useCallback((dateId, dateTitle) => {
    openTab({
      id: `precontrat-${dateId}`,
      title: `Pré-contrat - ${dateTitle}`,
      path: `/precontrats/generate/${dateId}`,
      component: 'PreContratGenerationPage',
      params: { dateId },
      icon: 'bi-file-earmark-text'
    });
  }, [openTab]);

  const openContratTab = useCallback((dateId, dateTitle, isRedige = false) => {
    console.log('[TabsContext] openContratTab appelé - dateId:', dateId, 'isRedige:', isRedige);
    
    if (isRedige) {
      // Si le contrat est rédigé, ouvrir directement la page de rédaction/aperçu
      console.log('[TabsContext] Ouverture en mode aperçu (contrat rédigé)');
      openTab({
        id: `contrat-redaction-${dateId}`,
        title: `Aperçu contrat - ${dateTitle}`,
        path: `/contrats/${dateId}/redaction`,
        component: 'ContratRedactionPage',
        params: { 
          originalDateId: dateId,
          contratId: dateId,
          readOnly: true // Indiquer qu'on est en mode lecture seule
        },
        icon: 'bi-file-earmark-check-fill'
      });
    } else {
      // Sinon, ouvrir le formulaire de génération
      console.log('[TabsContext] Ouverture en mode formulaire (contrat non rédigé)');
      openTab({
        id: `contrat-${dateId}`,
        title: `Contrat - ${dateTitle}`,
        path: `/contrats/generate/${dateId}`,
        component: 'ContratGenerationNewPage',
        params: { dateId },
        icon: 'bi-file-earmark-check'
      });
    }
  }, [openTab]);

  const openDevisTab = useCallback((devisId, devisTitle) => {
    console.log('[TabsContext] openDevisTab appelé - devisId:', devisId);
    openTab({
      id: `devis-${devisId}`,
      title: devisTitle || 'Devis',
      path: `/devis/${devisId}`,
      component: 'DevisPage',
      params: { devisId },
      icon: 'bi-file-earmark-text'
    });
  }, [openTab]);

  const openNewDevisTab = useCallback((dateId, structureId, title) => {
    console.log('[TabsContext] openNewDevisTab appelé - dateId:', dateId, 'structureId:', structureId);
    const tabId = dateId ? `nouveau-devis-${dateId}` : 'nouveau-devis';
    openTab({
      id: tabId,
      title: title || 'Nouveau Devis',
      path: `/devis/nouveau${dateId ? `?dateId=${dateId}&structureId=${structureId}` : ''}`,
      component: 'DevisPage',
      params: { dateId, structureId },
      icon: 'bi-file-earmark-plus'
    });
  }, [openTab]);

  // Fonctions pour gérer l'état des onglets du bas
  const setBottomTabForEntity = useCallback((entityId, tabId) => {
    setBottomTabsState(prev => ({
      ...prev,
      [entityId]: tabId
    }));
  }, []);

  const getBottomTabForEntity = useCallback((entityId, defaultTab = 'historique') => {
    return bottomTabsState[entityId] || defaultTab;
  }, [bottomTabsState]);

  // MÉMOÏSATION CRITIQUE : Éviter que tous les consommateurs se re-render
  const value = useMemo(() => ({
    tabs,
    activeTabId,
    openTab,
    closeTab,
    activateTab,
    closeOtherTabs,
    closeAllTabs,
    getActiveTab,
    // Gestion des onglets du bas
    setBottomTabForEntity,
    getBottomTabForEntity,
    // Helpers spécialisés
    openContactTab,
    openContactEditTab,
    openLieuTab,
    openDateTab,
    openStructureTab,
    openContactsListTab,
    openDatesListTab,
    openPublicationsListTab,
    openLieuxListTab,
    openStructuresListTab,
    openDebugToolsTab,
    openTachesTab,
    openDateCreationTab,
    openDateDetailsTab,
    openPreContratTab,
    openContratTab,
    openDevisTab,
    openNewDevisTab
  }), [
    tabs,
    activeTabId,
    openTab,
    closeTab,
    activateTab,
    closeOtherTabs,
    closeAllTabs,
    getActiveTab,
    setBottomTabForEntity,
    getBottomTabForEntity,
    openContactTab,
    openContactEditTab,
    openLieuTab,
    openDateTab,
    openStructureTab,
    openContactsListTab,
    openDatesListTab,
    openPublicationsListTab,
    openLieuxListTab,
    openStructuresListTab,
    openDebugToolsTab,
    openTachesTab,
    openDateCreationTab,
    openDateDetailsTab,
    openPreContratTab,
    openContratTab,
    openDevisTab,
    openNewDevisTab
  ]);

  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
};

export default TabsContext;