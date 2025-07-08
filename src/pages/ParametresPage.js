import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
// Suppression des imports de l'ancien système
// import ParametresEntreprise from '../components/parametres/ParametresEntreprise';
// import ParametresCompte from '../components/parametres/ParametresCompte';
import ParametresGeneraux from '../components/parametres/ParametresGeneraux';
import ParametresNotifications from '../components/parametres/ParametresNotifications';
import ParametresEmail from '../components/parametres/ParametresEmail';
import ParametresApparence from '../components/parametres/ParametresApparence';
import ParametresExport from '../components/parametres/ParametresExport';
import ParametresEntreprises from '../components/parametres/ParametresEntreprises';
import ParametresFactures from '../components/parametres/ParametresFactures';
import SyncManager from '../components/parametres/sync/SyncManager';
// import EntrepriseIdTest from '../components/debug/EntrepriseIdTest'; // Supprimé
import TabNavigation from '../components/common/TabNavigation';
import '@styles/index.css';

// Import des vraies pages de modèles de contrats
import ContratTemplatesPage from './contratTemplatesPage';
import ContratTemplatesEditPage from './contratTemplatesEditPage';
// Import des pages de modèles de factures
import FactureTemplatesPage from './factureTemplatesPage';
import FactureTemplatesEditPage from './factureTemplatesEditPage';

const ParametresPage = () => {
  const [activeTab, setActiveTab] = useState('generaux');
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer l'onglet actif en fonction de l'URL (sans déclencher de navigation)
  useEffect(() => {
    const path = location.pathname;
    // Vérifier aussi les paramètres URL pour forcer un onglet (utile pour l'inventaire)
    const urlParams = new URLSearchParams(location.search);
    const forceTab = urlParams.get('tab');
    
    let newActiveTab = 'generaux'; // valeur par défaut
    
    // Si un tab est forcé via URL param, l'utiliser en priorité
    if (forceTab) {
      newActiveTab = forceTab;
    } else if (path.includes('/parametres/contrats')) {
      newActiveTab = 'contrats';
    } else if (path.includes('/parametres/factures-modeles')) {
      newActiveTab = 'factures-modeles';
    } else if (path.includes('/parametres/factures')) {
      newActiveTab = 'factures';
    } else if (path.includes('/parametres/notifications')) {
      newActiveTab = 'notifications';
    } else if (path.includes('/parametres/email')) {
      newActiveTab = 'email';
    } else if (path.includes('/parametres/apparence')) {
      newActiveTab = 'apparence';
    } else if (path.includes('/parametres/export')) {
      newActiveTab = 'export';
    } else if (path.includes('/parametres/entreprises')) {
      newActiveTab = 'organisations';
    } else if (path.includes('/parametres/sync')) {
      newActiveTab = 'sync';
    } else if (path.includes('/parametres/debug')) {
      newActiveTab = 'debug';
    } else if (path.includes('/parametres/test-entrepriseid')) {
      newActiveTab = 'test-entrepriseid';
    } else if (path.includes('/parametres/generaux')) {
      newActiveTab = 'generaux';
    } else if (path.includes('/parametres/entreprise') || path.includes('/parametres/compte')) {
      // Redirection vers le nouveau système
      navigate('/collaboration/parametrage');
      return;
    }
    
    // Ne mettre à jour que si l'onglet a vraiment changé
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }
  }, [location.pathname, location.search, activeTab, navigate]);

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
        navigate('/parametres/entreprises');
        break;
      case 'sync':
        navigate('/parametres/sync');
        break;
      case 'debug':
        navigate('/parametres/debug');
        break;
      case 'test-entrepriseid':
        navigate('/parametres/test-entrepriseid');
        break;
      case 'generaux':
        navigate('/parametres/generaux');
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
      case 'generaux':
        return <ParametresGeneraux />;
      case 'notifications':
        return <ParametresNotifications />;
      case 'email':
        return <ParametresEmail />;
      case 'apparence':
        return <ParametresApparence />;
      case 'export':
        return <ParametresExport />;
      case 'organisations':
        return <ParametresEntreprises />;
      case 'sync':
        return <SyncManager />;
      case 'debug':
        return <div className="alert alert-info">
          <h5>🔍 Panneau de debug déplacé</h5>
          <p>Le panneau de debug OrganizationId est maintenant disponible via le bouton flottant en bas à droite de l'écran (mode développement uniquement).</p>
        </div>;
      case 'test-entrepriseid':
        return <div className="alert alert-info">
          <h5>🔍 Fonctionnalité temporairement indisponible</h5>
          <p>Le test OrganizationId est temporairement désactivé.</p>
        </div>;
      case 'contrats':
        return <ContratTemplatesPage />;
      case 'factures':
        return <ParametresFactures />;
      case 'factures-modeles':
        return <FactureTemplatesPage />;
      default:
        return <ParametresGeneraux />;
    }
  };

  // Stabilisation de la liste des onglets avec useMemo
  const tabList = useMemo(() => [
    { label: 'Paramètres généraux', key: 'generaux' },
    { label: 'Organisations', key: 'organisations' },
    { label: 'Notifications', key: 'notifications' },
    { label: 'Configuration Email', key: 'email' },
    { label: 'Apparence', key: 'apparence' },
    { label: 'Modèles de contrats', key: 'contrats' },
    { label: 'Paramètres de factures', key: 'factures' },
    { label: 'Modèles de factures', key: 'factures-modeles' },
    { label: 'Export et sauvegarde', key: 'export' },
    { label: 'Synchronisation des données', key: 'sync' },
    { label: '🔧 Debug EntrepriseId', key: 'debug' },
    // { label: '🧪 Test EntrepriseId', key: 'test-entrepriseid' } // Temporairement désactivé
  ], []);
  
  const tabIndex = useMemo(() => tabList.findIndex(tab => tab.key === activeTab), [tabList, activeTab]);

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Paramètres</h2>
      
      {/* Message d'information sur la migration */}
      <Alert variant="info" className="mb-4">
        <h5>🔄 Migration vers le nouveau système</h5>
        <p>
          Les paramètres <strong>Entreprise</strong> et <strong>Compte utilisateur</strong> ont été déplacés vers 
          <strong> Collaboration > Paramétrage</strong> pour une meilleure organisation.
        </p>
        <p className="mb-0">
          <a href="/collaboration/parametrage" className="btn btn-primary btn-sm">
            <i className="bi bi-arrow-right me-2"></i>
            Accéder au nouveau paramétrage
          </a>
        </p>
      </Alert>
      
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
