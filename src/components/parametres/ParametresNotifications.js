import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useParametres } from '@/context/ParametresContext';

const ParametresNotifications = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState(parametres.notifications || {
    email: true,
    concerts: true,
    contrats: true,
    artistes: true,
    programmateurs: true,
    lieux: true,
    notification_push: false
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (parametres.notifications) {
      setLocalState(parametres.notifications);
    }
  }, [parametres.notifications]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setLocalState(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sauvegarderParametres('notifications', localState);
    if (success) {
      setSuccess('Préférences de notifications mises à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Notifications</h3>
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="notification-email"
              label="Notifications par email"
              name="email"
              checked={localState.email}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Recevoir les notifications importantes par email
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="notification-push"
              label="Notifications push"
              name="notification_push"
              checked={localState.notification_push}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Recevoir les notifications push dans le navigateur
            </Form.Text>
          </Form.Group>

          <h5 className="mt-4 mb-3">Types de notifications</h5>

          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="notification-concerts"
              label="Nouveaux concerts"
              name="concerts"
              checked={localState.concerts}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="notification-contrats"
              label="Mise à jour des contrats"
              name="contrats"
              checked={localState.contrats}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="notification-artistes"
              label="Nouveaux artistes"
              name="artistes"
              checked={localState.artistes}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="notification-programmateurs"
              label="Nouveaux programmateurs"
              name="programmateurs"
              checked={localState.programmateurs}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check 
              type="switch"
              id="notification-lieux"
              label="Nouveaux lieux"
              name="lieux"
              checked={localState.lieux}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary">
              Enregistrer les préférences
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresNotifications;