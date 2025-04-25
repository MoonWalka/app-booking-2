import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import ParametresEntreprise from '../components/parametres/ParametresEntreprise';
// Imports avec chemins modifiés de la branche refacto-structure-scriptshell - pour implémentation future
// import ParametresGeneraux from '@components/parametres/ParametresGeneraux'; 
 //import ParametresCompte from '@components/parametres/ParametresCompte';
import ParametresGeneraux from '../components/parametres/ParametresGeneraux';
import ParametresCompte from '../components/parametres/ParametresCompte';
import ParametresNotifications from '../components/parametres/ParametresNotifications';
// Imports avec chemins modifiés de la branche refacto-structure-scriptshell - pour implémentation future
// import ParametresApparence from '@components/parametres/ParametresApparence'; 
import ParametresApparence from '../components/parametres/ParametresApparence';
import ParametresExport from '../components/parametres/ParametresExport';
import ContratTemplatesPage from '@pages/contratTemplatesPage'; // Ajustez le chemin selon votre structure
import ContratTemplatesEditPage from '@pages/contratTemplatesEditPage'; // Ajustez le chemin selon votre structure

// Import du style global de la branche refacto-structure-scriptshell - pour implémentation future
import '@styles/index.css';
// Note: Vous devrez vérifier que le dossier @styles existe et contient un fichier index.css,
// sinon créez ce dossier et ce fichier avec les styles appropriés.

const ParametresPage = () => {
  const [activeTab, setActiveTab] = useState('entreprise');
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer l'onglet actif en fonction de l'URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/parametres/contrats')) {
      setActiveTab('contrats');
    } else if (path.includes('/parametres/compte')) {
      setActiveTab('compte');
    } else if (path.includes('/parametres/notifications')) {
      setActiveTab('notifications');
    } else if (path.includes('/parametres/apparence')) {
      setActiveTab('apparence');
    } else if (path.includes('/parametres/export')) {
      setActiveTab('export');
    } else if (path.includes('/parametres/generaux')) {
      setActiveTab('generaux');
    } else if (path.includes('/parametres/entreprise') || path === '/parametres') {
      setActiveTab('entreprise');
    }
  }, [location]);

  // Gestionnaire pour le changement d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
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
  };

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
      case 'contrats':
        return <ContratTemplatesPage />;
      default:
        return <ParametresEntreprise />;
    }
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Paramètres</h2>
      <Row>
        <Col md={3}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'entreprise'}
                onClick={() => handleTabChange('entreprise')}
              >
                Entreprise
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'generaux'}
                onClick={() => handleTabChange('generaux')}
              >
                Paramètres généraux
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'compte'}
                onClick={() => handleTabChange('compte')}
              >
                Compte utilisateur
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'notifications'}
                onClick={() => handleTabChange('notifications')}
              >
                Notifications
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'apparence'}
                onClick={() => handleTabChange('apparence')}
              >
                Apparence
              </Nav.Link>
            </Nav.Item>
            {/* Nouvel onglet pour les modèles de contrats */}
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'contrats'}
                onClick={() => handleTabChange('contrats')}
              >
                Modèles de contrats
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'export'}
                onClick={() => handleTabChange('export')}
              >
                Export et sauvegarde
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col md={9}>
          {renderActiveComponent()}
        </Col>
      </Row>
    </Container>
  );
};

export default ParametresPage;
