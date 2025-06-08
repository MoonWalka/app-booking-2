import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import ParametresEntreprise from '../components/parametres/ParametresEntreprise';
import ParametresGeneraux from '../components/parametres/ParametresGeneraux';
import ParametresCompte from '../components/parametres/ParametresCompte';
import ParametresNotifications from '../components/parametres/ParametresNotifications';
import ParametresEmail from '../components/parametres/ParametresEmail';
import ParametresApparence from '../components/parametres/ParametresApparence';
import ParametresExport from '../components/parametres/ParametresExport';
import ParametresOrganisations from '../components/parametres/ParametresOrganisations';
import ParametresFactures from '../components/parametres/ParametresFactures';
import SyncManager from '../components/parametres/sync/SyncManager';
import TabNavigation from '../components/common/TabNavigation';
import '@styles/index.css';

// Import des vraies pages de modèles de contrats
import ContratTemplatesPage from './contratTemplatesPage';
import ContratTemplatesEditPage from './contratTemplatesEditPage';
// Import des pages de modèles de factures
import FactureTemplatesPage from './factureTemplatesPage';
import FactureTemplatesEditPage from './factureTemplatesEditPage';

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
    } else if (path.includes('/parametres/factures-modeles')) {
      newActiveTab = 'factures-modeles';
    } else if (path.includes('/parametres/factures')) {
      newActiveTab = 'factures';
    } else if (path.includes('/parametres/compte')) {
      newActiveTab = 'compte';
    } else if (path.includes('/parametres/notifications')) {
      newActiveTab = 'notifications';
    } else if (path.includes('/parametres/email')) {
      newActiveTab = 'email';
    } else if (path.includes('/parametres/apparence')) {
      newActiveTab = 'apparence';
    } else if (path.includes('/parametres/export')) {
      newActiveTab = 'export';
    } else if (path.includes('/parametres/organisations')) {
      newActiveTab = 'organisations';
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
      case 'factures':
        navigate('/parametres/factures');
        break;
      case 'factures-modeles':
        navigate('/parametres/factures-modeles');
        break;
      case 'compte':
        navigate('/parametres/compte');
        break;
      case 'notifications':
        navigate('/parametres/notifications');
        break;
      case 'email':
        navigate('/parametres/email');
        break;
      case 'apparence':
        navigate('/parametres/apparence');
        break;
      case 'export':
        navigate('/parametres/export');
        break;
      case 'organisations':
        navigate('/parametres/organisations');
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
    
    // Si l'URL contient un ID de facture, c'est l'édition d'un modèle de facture
    if (location.pathname.match(/\/parametres\/factures-modeles\/[^/]+$/)) {
      return <FactureTemplatesEditPage />;
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
      case 'email':
        return <ParametresEmail />;
      case 'apparence':
        return <ParametresApparence />;
      case 'export':
        return <ParametresExport />;
      case 'organisations':
        return <ParametresOrganisations />;
      case 'sync':
        return <SyncManager />;
      case 'contrats':
        return <ContratTemplatesPage />;
      case 'factures':
        return <ParametresFactures />;
      case 'factures-modeles':
        return <FactureTemplatesPage />;
      default:
        return <ParametresEntreprise />;
    }
  };

  // Stabilisation de la liste des onglets avec useMemo
  const tabList = useMemo(() => [
    { label: 'Entreprise', key: 'entreprise' },
    { label: 'Paramètres généraux', key: 'generaux' },
    { label: 'Compte utilisateur', key: 'compte' },
    { label: 'Organisations', key: 'organisations' },
    { label: 'Notifications', key: 'notifications' },
    { label: 'Configuration Email', key: 'email' },
    { label: 'Apparence', key: 'apparence' },
    { label: 'Modèles de contrats', key: 'contrats' },
    { label: 'Paramètres de factures', key: 'factures' },
    { label: 'Modèles de factures', key: 'factures-modeles' },
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
