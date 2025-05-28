import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FlexContainer from '@/components/ui/FlexContainer';

// Importer les styles de test
import '@styles/index.css';

// Composants UI à tester
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import TCButton from '../../components/ui/Button';
import InfoPanel from '../../components/ui/InfoPanel';
import Spinner from '../../components/ui/Spinner';

const StyleTestPage = () => {
  const [showGrid, setShowGrid] = useState(false);
  const [testModeActive, setTestModeActive] = useState(false);

  const toggleGrid = () => {
    setShowGrid(!showGrid);
    if (!showGrid) {
      document.body.classList.add('show-grid');
    } else {
      document.body.classList.remove('show-grid');
    }
  };

  const toggleTestMode = () => {
    setTestModeActive(!testModeActive);
    if (!testModeActive) {
      document.body.classList.add('test-mode-active');
    } else {
      document.body.classList.remove('test-mode-active');
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Page de test des composants UI</h1>
          <p className="lead">
            Cette page permet de tester l'apparence des composants UI et de vérifier les corrections CSS.
          </p>
          <div className="mb-3">
            <Link to="/" className="tc-btn tc-btn-secondary mr-2">Retour à l'accueil</Link>
            <Button variant="outline-primary" onClick={toggleGrid} className="mx-2">
              {showGrid ? 'Masquer' : 'Afficher'} la grille
            </Button>
            <Button variant="outline-warning" onClick={toggleTestMode} className="mx-2">
              {testModeActive ? 'Désactiver' : 'Activer'} le mode test
            </Button>
          </div>
        </Col>
      </Row>

      <hr className="my-4" />

      <Row className="mb-4">
        <Col lg={6}>
          <h2>Boutons</h2>
          <div className="mb-3">
            <h4>Boutons Bootstrap originaux</h4>
            <Button variant="primary" className="m-1">Primary</Button>
            <Button variant="secondary" className="m-1">Secondary</Button>
            <Button variant="success" className="m-1">Success</Button>
            <Button variant="danger" className="m-1">Danger</Button>
            <Button variant="warning" className="m-1">Warning</Button>
            <Button variant="info" className="m-1">Info</Button>
          </div>
          
          <div className="mb-3">
            <h4>Boutons TourCraft</h4>
            <TCButton variant="primary" className="m-1">Primary</TCButton>
            <TCButton variant="secondary" className="m-1">Secondary</TCButton>
            <TCButton variant="success" className="m-1">Success</TCButton>
            <TCButton variant="danger" className="m-1">Danger</TCButton>
            <TCButton variant="warning" className="m-1">Warning</TCButton>
            <TCButton variant="info" className="m-1">Info</TCButton>
          </div>
        </Col>
        
        <Col lg={6}>
          <h2>Badges</h2>
          <div className="mb-3">
            <h4>Badges Bootstrap originaux</h4>
            <span className="badge badge-primary m-1">Primary</span>
            <span className="badge badge-secondary m-1">Secondary</span>
            <span className="badge badge-success m-1">Success</span>
            <span className="badge badge-danger m-1">Danger</span>
            <span className="badge badge-warning m-1">Warning</span>
            <span className="badge badge-info m-1">Info</span>
          </div>
          
          <div className="mb-3">
            <h4>Badges TourCraft</h4>
            <Badge variant="primary" className="m-1">Primary</Badge>
            <Badge variant="secondary" className="m-1">Secondary</Badge>
            <Badge variant="success" className="m-1">Success</Badge>
            <Badge variant="danger" className="m-1">Danger</Badge>
            <Badge variant="warning" className="m-1">Warning</Badge>
            <Badge variant="info" className="m-1">Info</Badge>
          </div>
        </Col>
      </Row>

      <hr className="my-4" />

      <Row className="mb-4">
        <Col lg={6}>
          <h2>Cards</h2>
          <div className="mb-3">
            <h4>Card Bootstrap original</h4>
            <div className="card">
              <div className="card-header">Header</div>
              <div className="card-body">
                <h5 className="card-title">Card Title</h5>
                <p className="card-text">Contenu de la carte avec Bootstrap standard.</p>
                <Button variant="primary">Action</Button>
              </div>
              <div className="card-footer">Footer</div>
            </div>
          </div>
          
          <div className="mb-3">
            <h4>Card TourCraft</h4>
            <Card>
              <Card.Header>Header</Card.Header>
              <Card.Body>
                <Card.Title>Card Title</Card.Title>
                <Card.Text>Contenu de la carte avec composant TourCraft.</Card.Text>
                <TCButton variant="primary">Action</TCButton>
              </Card.Body>
              <Card.Footer>Footer</Card.Footer>
            </Card>
          </div>
        </Col>
        
        <Col lg={6}>
          <h2>Autres composants</h2>
          
          <div className="mb-3">
            <h4>InfoPanel</h4>
            <InfoPanel type="primary">Ceci est un message d'information primaire.</InfoPanel>
            <InfoPanel type="success">Opération réussie avec succès!</InfoPanel>
            <InfoPanel type="warning">Attention, vérifiez ces informations.</InfoPanel>
            <InfoPanel type="danger">Une erreur critique s'est produite.</InfoPanel>
          </div>
          
          <div className="mb-3">
            <h4>Spinner</h4>
            <FlexContainer align="center">
              <Spinner size="sm" className="mr-2" />
              <Spinner className="mr-2" />
              <Spinner size="lg" />
            </FlexContainer>
          </div>
        </Col>
      </Row>
      
      <hr className="my-4" />
      
      <Row>
        <Col>
          <h2>Variables CSS</h2>
          <div className="row">
            <div className="col-md-4 mb-3">
              <h4>Couleurs primaires</h4>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-primary-color, #0d6efd)', color: 'white', marginBottom: '10px' }}>
                --tc-primary-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-secondary-color, #6c757d)', color: 'white', marginBottom: '10px' }}>
                --tc-secondary-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-success-color, #28a745)', color: 'white', marginBottom: '10px' }}>
                --tc-success-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-danger-color, #dc3545)', color: 'white', marginBottom: '10px' }}>
                --tc-danger-color
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <h4>Couleurs secondaires</h4>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-warning-color, #ffc107)', marginBottom: '10px' }}>
                --tc-warning-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-info-color, #17a2b8)', color: 'white', marginBottom: '10px' }}>
                --tc-info-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-light-color, #f8f9fa)', border: '1px solid #ddd', marginBottom: '10px' }}>
                --tc-light-color
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--tc-dark-color, #343a40)', color: 'white', marginBottom: '10px' }}>
                --tc-dark-color
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <h4>Tailles standard</h4>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: 'var(--tc-spacing-sm, 0.25rem)', backgroundColor: '#ddd', marginBottom: '5px' }}></div>
                --tc-spacing-sm (0.25rem)
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: 'var(--tc-spacing-md, 0.5rem)', backgroundColor: '#ddd', marginBottom: '5px' }}></div>
                --tc-spacing-md (0.5rem)
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: 'var(--tc-spacing-lg, 1rem)', backgroundColor: '#ddd', marginBottom: '5px' }}></div>
                --tc-spacing-lg (1rem)
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ height: 'var(--tc-spacing-xl, 1.5rem)', backgroundColor: '#ddd', marginBottom: '5px' }}></div>
                --tc-spacing-xl (1.5rem)
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StyleTestPage;
