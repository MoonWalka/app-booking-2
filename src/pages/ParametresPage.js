import React, { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import ParametresEntreprise from '../components/parametres/ParametresEntreprise';
import ParametresGeneraux from '../components/parametres/ParametresGeneraux';
import ParametresCompte from '../components/parametres/ParametresCompte';
import ParametresNotifications from '../components/parametres/ParametresNotifications';
import ParametresApparence from '../components/parametres/ParametresApparence';
import ParametresExport from '../components/parametres/ParametresExport';
import '../components/parametres/Parametres.css';

const ParametresPage = () => {
  const [activeTab, setActiveTab] = useState('entreprise');

  const renderActiveComponent = () => {
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
                onClick={() => setActiveTab('entreprise')}
              >
                Entreprise
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'generaux'}
                onClick={() => setActiveTab('generaux')}
              >
                Paramètres généraux
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'compte'}
                onClick={() => setActiveTab('compte')}
              >
                Compte utilisateur
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'apparence'}
                onClick={() => setActiveTab('apparence')}
              >
                Apparence
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'export'}
                onClick={() => setActiveTab('export')}
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