import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import ParametresEntreprise from '../components/parametres/ParametresEntrepriseRobuste';
import ParametresGeneraux from '../components/parametres/ParametresGenerauxSimple';
import ParametresCompte from '../components/parametres/ParametresCompteSimple';
import {
  ParametresNotificationsSimple as ParametresNotifications,
  ParametresApparenceSimple as ParametresApparence,
  ParametresExportSimple as ParametresExport,
  SyncManagerSimple as SyncManager
} from '../components/parametres/ParametresSimples';
import TabNavigation from '../components/common/TabNavigation';
import '@styles/index.css';

// import ContratTemplatesPage from '@pages/contratTemplatesPage'; // Ajustez le chemin selon votre structure
// import ContratTemplatesEditPage from '@pages/contratTemplatesEditPage'; // Ajustez le chemin selon votre structure

// Composants simplifiés temporaires pour les contrats
const ContratTemplatesPage = () => (
  <div>
    <h3>Modèles de contrats (Version Simplifiée)</h3>
    <p>Gestion des modèles de contrats - Fonctionnalité en cours de développement.</p>
  </div>
);

const ContratTemplatesEditPage = () => (
  <div>
    <h3>Édition de modèle de contrat (Version Simplifiée)</h3>
    <p>Édition de modèle de contrat - Fonctionnalité en cours de développement.</p>
  </div>
);

const ParametresPage = () => {
  const [activeTab, setActiveTab] = useState('entreprise');
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer l'onglet actif en fonction de l'URL (sans déclencher de navigation)
  useEffect(() => {
    const path = location.pathname;
    let newActiveTab = 'entreprise'; // valeur par défaut
    
    if (path.includes('/parametres/contrats')) {
      newActiveTab = 'contrats';
    } else if (path.includes('/parametres/compte')) {
      newActiveTab = 'compte';
    } else if (path.includes('/parametres/notifications')) {
      newActiveTab = 'notifications';
    } else if (path.includes('/parametres/apparence')) {
      newActiveTab = 'apparence';
    } else if (path.includes('/parametres/export')) {
      newActiveTab = 'export';
    } else if (path.includes('/parametres/sync')) {
      newActiveTab = 'sync';
    } else if (path.includes('/parametres/generaux')) {
      newActiveTab = 'generaux';
    } else if (path.includes('/parametres/entreprise') || path === '/parametres') {
      newActiveTab = 'entreprise';
    }
    
    // Ne mettre à jour que si l'onglet a vraiment changé
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }
  }, [location.pathname, activeTab]);

  // Gestionnaire pour le changement d'onglet (navigation uniquement) - Stabilisé avec useCallback
  const handleTabChange = useCallback((tab) => {
    // Ne naviguer que si l'onglet est différent de l'actuel
    if (tab === activeTab) return;
    
    // Naviguer vers la bonne route en fonction de l'onglet sélectionné
    switch(tab) {
      case 'contrats':
        navigate('/parametres/contrats');
        break;
      case 'compte':
        navigate('/parametres/compte');
        break;
      case 'notifications':
        navigate('/parametres/notifications');
        break;
      case 'apparence':
        navigate('/parametres/apparence');
        break;
      case 'export':
        navigate('/parametres/export');
        break;
      case 'sync':
        navigate('/parametres/sync');
        break;
      case 'generaux':
        navigate('/parametres/generaux');
        break;
      case 'entreprise':
        navigate('/parametres/entreprise');
        break;
      default:
        navigate('/parametres');
        break;
    }
  }, [activeTab, navigate]);

  const renderActiveComponent = () => {
    // Si l'URL contient un ID de contrat, c'est l'édition d'un modèle de contrat
    if (location.pathname.match(/\/parametres\/contrats\/[^/]+$/)) {
      return <ContratTemplatesEditPage />;
    }
    
    // Sinon, rendu en fonction de l'onglet actif
    switch (activeTab) {
      case 'entreprise':
        return <ParametresEntreprise />;
      case 'generaux':
        return <ParametresGeneraux />;
      case 'compte':
        return <ParametresCompte />;
      case 'notifications':
        return <ParametresNotifications />;
      case 'apparence':
        return <ParametresApparence />;
      case 'export':
        return <ParametresExport />;
      case 'sync':
        return <SyncManager />;
      case 'contrats':
        return <ContratTemplatesPage />;
      default:
        return <ParametresEntreprise />;
    }
  };

  // Stabilisation de la liste des onglets avec useMemo
  const tabList = useMemo(() => [
    { label: 'Entreprise', key: 'entreprise' },
    { label: 'Paramètres généraux', key: 'generaux' },
    { label: 'Compte utilisateur', key: 'compte' },
    { label: 'Notifications', key: 'notifications' },
    { label: 'Apparence', key: 'apparence' },
    { label: 'Modèles de contrats', key: 'contrats' },
    { label: 'Export et sauvegarde', key: 'export' },
    { label: 'Synchronisation des données', key: 'sync' }
  ], []);
  
  const tabIndex = useMemo(() => tabList.findIndex(tab => tab.key === activeTab), [tabList, activeTab]);

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Paramètres</h2>
      <Row>
        <Col md={3}>
          <TabNavigation
            tabs={tabList.map(tab => ({
              label: tab.label,
              content: null
            }))}
            activeTab={tabIndex}
            onTabChange={idx => handleTabChange(tabList[idx].key)}
            vertical={true}
          />
        </Col>
        <Col md={9}>
          {renderActiveComponent()}
        </Col>
      </Row>
    </Container>
  );
};

export default ParametresPage;
