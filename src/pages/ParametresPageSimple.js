import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

/**
 * Version simplifiée de ParametresPage pour tester sans boucles infinies
 * Cette version n'utilise pas de hooks complexes ni de contexte
 */
const ParametresPageSimple = () => {
  const [activeTab, setActiveTab] = useState('entreprise');

  const renderContent = () => {
    switch (activeTab) {
      case 'entreprise':
        return (
          <div>
            <h3>Paramètres Entreprise</h3>
            <p>Version simplifiée - Pas de boucle infinie</p>
          </div>
        );
      case 'generaux':
        return (
          <div>
            <h3>Paramètres Généraux</h3>
            <p>Version simplifiée - Pas de boucle infinie</p>
          </div>
        );
      default:
        return (
          <div>
            <h3>Paramètres</h3>
            <p>Version simplifiée - Pas de boucle infinie</p>
          </div>
        );
    }
  };

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Paramètres (Version Simplifiée)</h2>
      <Row>
        <Col md={3}>
          <div className="list-group">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'entreprise' ? 'active' : ''}`}
              onClick={() => setActiveTab('entreprise')}
            >
              Entreprise
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'generaux' ? 'active' : ''}`}
              onClick={() => setActiveTab('generaux')}
            >
              Paramètres généraux
            </button>
          </div>
        </Col>
        <Col md={9}>
          {renderContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default ParametresPageSimple; 