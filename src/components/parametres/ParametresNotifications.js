import React, { useState, useEffect } from 'react';
import { Form, Card, Alert } from 'react-bootstrap';
import Button from '@/components/ui/Button';
import styles from './ParametresNotifications.module.css';
import { useParametres } from '@/context/ParametresContext';

const ParametresNotifications = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState(parametres.notifications || {
    email: true,
    dates: true,
    contrats: true,
    artistes: true,
    contacts: true,
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
        {success && <Alert variant="success" className={styles.successMessage}>{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <div className={styles.notificationSection}>
            <Form.Group className={styles.notificationGroup}>
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

            <Form.Group className={styles.notificationGroup}>
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
          </div>

          <h5 className={styles.notificationTypeTitle}>Types de notifications</h5>

          <Form.Group className={styles.notificationGroup}>
            <Form.Check 
              type="switch"
              id="notification-dates"
              label="Nouvelles dates"
              name="dates"
              checked={localState.dates}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className={styles.notificationGroup}>
            <Form.Check 
              type="switch"
              id="notification-contrats"
              label="Mise à jour des contrats"
              name="contrats"
              checked={localState.contrats}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className={styles.notificationGroup}>
            <Form.Check 
              type="switch"
              id="notification-artistes"
              label="Nouveaux artistes"
              name="artistes"
              checked={localState.artistes}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className={styles.notificationGroup}>
            <Form.Check 
              type="switch"
              id="notification-contacts"
              label="Nouveaux contacts"
              name="contacts"
              checked={localState.contacts}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className={styles.notificationGroup}>
            <Form.Check 
              type="switch"
              id="notification-lieux"
              label="Nouveaux lieux"
              name="lieux"
              checked={localState.lieux}
              onChange={handleChange}
            />
          </Form.Group>

          <div className={styles.formActions}>
            <Button 
              type="submit" 
              variant="primary"
              icon={<i className="bi bi-save"></i>}
            >
              Enregistrer les préférences
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresNotifications;