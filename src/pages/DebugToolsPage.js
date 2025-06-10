import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import DataStructureFixer from '@/components/debug/DataStructureFixer';
import OrganizationIdDebug from '@/components/debug/OrganizationIdDebug';
import ListDebugger from '@/components/debug/ListDebugger';
import styles from './DebugToolsPage.module.css';

const DebugToolsPage = () => {
  const [activeTab, setActiveTab] = useState('lists');

  // Temporairement accessible en production pour corriger les problèmes
  // À retirer une fois les corrections appliquées
  /*
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className={styles.container}>
        <div className={styles.notAvailable}>
          <i className="bi bi-lock"></i>
          <h3>Outils de debug non disponibles</h3>
          <p>Cette page n'est accessible qu'en mode développement</p>
        </div>
      </div>
    );
  }
  */

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <i className="bi bi-tools me-2"></i>
          Outils de debug
        </h1>
        <p className={styles.description}>
          Outils de diagnostic et de correction des données
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className={styles.tabs}
      >
        <Tab eventKey="lists" title="Diagnostic des listes">
          <ListDebugger />
        </Tab>
        
        <Tab eventKey="structure" title="Structure des données">
          <DataStructureFixer />
        </Tab>
        
        <Tab eventKey="organization" title="Organisation ID">
          <OrganizationIdDebug />
        </Tab>
      </Tabs>
    </div>
  );
};

export default DebugToolsPage;