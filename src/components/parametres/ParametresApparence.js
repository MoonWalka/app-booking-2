import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useParametres } from '@context/ParametresContext';

const ParametresApparence = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState(parametres.apparence || {
    theme: 'light',
    couleurPrincipale: '#0d6efd',
    taillePolicePx: 16,
    animations: true,
    compactMode: false,
    menuPosition: 'left'
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (parametres.apparence) {
      setLocalState(parametres.apparence);
    }
  }, [parametres.apparence]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sauvegarderParametres('apparence', localState);
    if (success) {
      setSuccess('Préférences d\'apparence mises à jour avec succès');
      // Appliquer les changements immédiatement
      document.documentElement.style.setProperty('--primary-color', localState.couleurPrincipale);
      document.documentElement.style.setProperty('--font-size-base', `${localState.taillePolicePx}px`);
      document.body.setAttribute('data-theme', localState.theme);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleReset = () => {
    const defaultState = {
      theme: 'light',
      couleurPrincipale: '#0d6efd',
      taillePolicePx: 16,
      animations: true,
      compactMode: false,
      menuPosition: 'left'
    };
    setLocalState(defaultState);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Apparence</h3>
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Thème</Form.Label>
                <Form.Select
                  name="theme"
                  value={localState.theme}
                  onChange={handleChange}
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="system">Système</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Couleur principale</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="color"
                    name="couleurPrincipale"
                    value={localState.couleurPrincipale}
                    onChange={handleChange}
                    className="me-2"
                  />
                  <Form.Control
                    type="text"
                    value={localState.couleurPrincipale}
                    onChange={handleChange}
                    name="couleurPrincipale"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    style={{ width: '120px' }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Taille de police (px)</Form.Label>
                <div className="d-flex align-items-center">
                  <Form.Range
                    name="taillePolicePx"
                    value={localState.taillePolicePx}
                    onChange={handleChange}
                    min="12"
                    max="24"
                    step="1"
                    className="me-2"
                  />
                  <span>{localState.taillePolicePx}px</span>
                </div>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Position du menu</Form.Label>
                <Form.Select
                  name="menuPosition"
                  value={localState.menuPosition}
                  onChange={handleChange}
                >
                  <option value="left">Gauche</option>
                  <option value="top">Haut</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="animations"
              label="Animations"
              name="animations"
              checked={localState.animations}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Activer/désactiver les animations de l'interface
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="compactMode"
              label="Mode compact"
              name="compactMode"
              checked={localState.compactMode}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Réduire l'espacement entre les éléments
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              type="button"
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
            <Button type="submit" variant="primary">
              Enregistrer les préférences
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresApparence;