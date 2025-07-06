import React, { useState } from 'react';
import styles from './TabManager.module.css';

const TabManager = ({ children }) => {
  const [tabs, setTabs] = useState([
    {
      id: 'dashboard',
      title: 'Dashboard',
      component: 'DashboardContent',
      isActive: true,
      closable: false
    }
  ]);

  const [activeTabId, setActiveTabId] = useState('dashboard');

  const addTab = (newTab) => {
    const existingTab = tabs.find(tab => tab.id === newTab.id);
    
    if (existingTab) {
      // Si l'onglet existe déjà, on l'active
      setActiveTabId(newTab.id);
    } else {
      // Sinon on crée un nouvel onglet
      setTabs(prevTabs => [
        ...prevTabs.map(tab => ({ ...tab, isActive: false })),
        { ...newTab, isActive: true }
      ]);
      setActiveTabId(newTab.id);
    }
  };

  const closeTab = (tabId) => {
    if (tabs.length <= 1) return; // Ne pas fermer le dernier onglet
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const isActiveTab = activeTabId === tabId;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // Si on ferme l'onglet actif, activer le précédent ou le suivant
    if (isActiveTab) {
      const newActiveIndex = Math.max(0, tabIndex - 1);
      setActiveTabId(newTabs[newActiveIndex]?.id);
    }
  };

  const switchTab = (tabId) => {
    setActiveTabId(tabId);
    setTabs(prevTabs => 
      prevTabs.map(tab => ({
        ...tab,
        isActive: tab.id === tabId
      }))
    );
  };

  const renderTabContent = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    
    switch (activeTab?.component) {
      case 'DashboardContent':
        return (
          <div className={styles.tabContent}>
            <h2>🏠 Dashboard</h2>
            <p>Contenu du dashboard - Vue d'ensemble de l'application</p>
            <div className={styles.demoActions}>
              <button 
                className={styles.actionButton}
                onClick={() => addTab({
                  id: 'contacts-' + Date.now(),
                  title: 'Contacts',
                  component: 'ContactsContent',
                  closable: true
                })}
              >
                Ouvrir Contacts
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => addTab({
                  id: 'lieu-' + Date.now(),
                  title: 'Lieu - Salle des Fêtes',
                  component: 'LieuContent',
                  closable: true
                })}
              >
                Ouvrir un Lieu
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => addTab({
                  id: 'concert-' + Date.now(),
                  title: 'Date - Jazz Festival',
                  component: 'DateContent',
                  closable: true
                })}
              >
                Ouvrir un Date
              </button>
            </div>
          </div>
        );
      
      case 'ContactsContent':
        return (
          <div className={styles.tabContent}>
            <h2>👥 Contacts</h2>
            <p>Liste de tous vos contacts</p>
            <div className={styles.mockList}>
              <div className={styles.mockItem}>📧 Jean Dupont - Programmateur</div>
              <div className={styles.mockItem}>📧 Marie Martin - Directrice</div>
              <div className={styles.mockItem}>📧 Paul Durant - Technicien</div>
            </div>
          </div>
        );
      
      case 'LieuContent':
        return (
          <div className={styles.tabContent}>
            <h2>📍 Salle des Fêtes</h2>
            <p>Détails du lieu sélectionné</p>
            <div className={styles.mockDetails}>
              <div><strong>Adresse:</strong> 123 Rue de la Musique, Paris</div>
              <div><strong>Capacité:</strong> 500 personnes</div>
              <div><strong>Contact:</strong> Jean Dupont</div>
            </div>
          </div>
        );
      
      case 'DateContent':
        return (
          <div className={styles.tabContent}>
            <h2>🎵 Jazz Festival</h2>
            <p>Détails du concert</p>
            <div className={styles.mockDetails}>
              <div><strong>Date:</strong> 15 Juillet 2025</div>
              <div><strong>Artiste:</strong> Miles Davis Tribute</div>
              <div><strong>Lieu:</strong> Salle des Fêtes</div>
              <div><strong>Statut:</strong> Confirmé</div>
            </div>
          </div>
        );
      
      default:
        return <div className={styles.tabContent}>Onglet non trouvé</div>;
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
            onClick={() => switchTab(tab.id)}
          >
            <span className={styles.tabTitle}>{tab.title}</span>
            {tab.closable && (
              <button
                className={styles.closeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <div className={styles.addTabButton}>
          <span>+</span>
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className={styles.tabContainer}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabManager;