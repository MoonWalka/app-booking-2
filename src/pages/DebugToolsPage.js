import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import DataStructureFixer from '@/components/debug/DataStructureFixer';
import OrganizationIdDebug from '@/components/debug/OrganizationIdDebug';
import ListDebugger from '@/components/debug/ListDebugger';
import ContactCreationTester from '@/components/debug/ContactCreationTester';
import EntityCreationTester from '@/components/debug/EntityCreationTester';
import LieuMapDebug from '@/components/debug/LieuMapDebug';
import RIBDebugger from '@/components/debug/RIBDebugger';
import RelancesAuditTool from '@/components/debug/RelancesAuditTool';
import ContactEmailDebug from '@/components/debug/ContactEmailDebug';
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
        
        <Tab eventKey="contacts" title="Test Contacts">
          <ContactCreationTester />
        </Tab>
        
        <Tab eventKey="entities" title="Test Entités Complètes">
          <EntityCreationTester />
        </Tab>
        
        <Tab eventKey="lieu-map" title="Debug Cartes Lieux">
          <LieuMapDebug />
        </Tab>
        
        <Tab eventKey="rib" title="Debug RIB">
          <RIBDebugger />
        </Tab>
        
        <Tab eventKey="relances" title="Audit Relances">
          <RelancesAuditTool />
        </Tab>
        
        <Tab eventKey="contact-email" title="Debug Email Contact">
          <ContactEmailDebug />
        </Tab>
      </Tabs>
    </div>
  );
};

export default DebugToolsPage;