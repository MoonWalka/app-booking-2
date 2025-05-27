import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useParametres } from '@/context/ParametresContext';

/**
 * Version simplifiée du composant ParametresNotifications
 */
export const ParametresNotificationsSimple = () => {
  const { parametres, sauvegarderParametres, loading: contextLoading } = useParametres();
  const [localState, setLocalState] = useState({
    email: true,
    concerts: true,
    contrats: true,
    artistes: true,
    programmateurs: true,
    lieux: true,
    notification_push: false
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    
    try {
      const success = await sauvegarderParametres('notifications', localState);
      if (success) {
        setSuccess('Préférences de notifications mises à jour avec succès');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3>Notifications (Version Simplifiée)</h3>
        
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Check
            type="checkbox"
            name="email"
            label="Notifications par email"
            checked={localState.email}
            onChange={handleChange}
            className="mb-3"
          />
          
          <Form.Check
            type="checkbox"
            name="concerts"
            label="Notifications concerts"
            checked={localState.concerts}
            onChange={handleChange}
            className="mb-3"
          />
          
          <Form.Check
            type="checkbox"
            name="contrats"
            label="Notifications contrats"
            checked={localState.contrats}
            onChange={handleChange}
            className="mb-3"
          />

          <div className="d-flex justify-content-end">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

/**
 * Version simplifiée du composant ParametresApparence
 */
export const ParametresApparenceSimple = () => {
  const { parametres, sauvegarderParametres, loading: contextLoading } = useParametres();
  const [localState, setLocalState] = useState({
    theme: 'light',
    couleurPrincipale: '#1e3a5f',
    taillePolicePx: 16,
    animations: true,
    compactMode: false,
    menuPosition: 'left'
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    
    try {
      const success = await sauvegarderParametres('apparence', localState);
      if (success) {
        setSuccess('Paramètres d\'apparence mis à jour avec succès');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3>Apparence (Version Simplifiée)</h3>
        
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
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

          <Form.Group className="mb-3">
            <Form.Label>Couleur principale</Form.Label>
            <Form.Control
              type="color"
              name="couleurPrincipale"
              value={localState.couleurPrincipale}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            name="animations"
            label="Activer les animations"
            checked={localState.animations}
            onChange={handleChange}
            className="mb-3"
          />

          <div className="d-flex justify-content-end">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

/**
 * Version simplifiée du composant ParametresExport
 */
export const ParametresExportSimple = () => {
  const { parametres, sauvegarderParametres, loading: contextLoading } = useParametres();
  const [localState, setLocalState] = useState({
    formatParDefaut: 'json',
    sauvegardeAuto: true,
    frequenceSauvegarde: 'daily'
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parametres.export) {
      setLocalState(parametres.export);
    }
  }, [parametres.export]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocalState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await sauvegarderParametres('export', localState);
      if (success) {
        setSuccess('Préférences d\'export mises à jour avec succès');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3>Export et sauvegarde (Version Simplifiée)</h3>
        
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Format par défaut</Form.Label>
            <Form.Select
              name="formatParDefaut"
              value={localState.formatParDefaut}
              onChange={handleChange}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="checkbox"
            name="sauvegardeAuto"
            label="Sauvegarde automatique"
            checked={localState.sauvegardeAuto}
            onChange={handleChange}
            className="mb-3"
          />

          <div className="d-flex justify-content-end">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

/**
 * Version simplifiée du composant SyncManager
 */
export const SyncManagerSimple = () => {
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    
    try {
      // Simulation de synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess('Synchronisation terminée avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <h3>Synchronisation des données (Version Simplifiée)</h3>
        
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        <p>Synchronisez vos données avec le serveur.</p>

        <div className="d-flex justify-content-end">
          <Button 
            variant="primary" 
            disabled={loading}
            onClick={handleSync}
          >
            {loading ? 'Synchronisation...' : 'Synchroniser'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}; 