import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import styles from './ParametresGeneraux.module.css';
import { useParametres } from '@/context/ParametresContext';

const ParametresGeneraux = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState(parametres.generaux || {
    langue: 'fr'
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (parametres.generaux) {
      // Filtrer pour exclure formatDate si déjà présent
      const { formatDate, ...rest } = parametres.generaux;
      setLocalState(rest);
    }
  }, [parametres.generaux]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sauvegarderParametres('generaux', localState);
    if (success) {
      setSuccess('Paramètres généraux sauvegardés avec succès');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Paramètres généraux</h3>
        
        {success && (
          <Alert variant="success" className={styles.successAlert}>
            {success}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className={styles.formSection}>
            <Form.Label>Langue</Form.Label>
            <Form.Select
              name="langue"
              value={localState.langue}
              onChange={handleChange}
              className={styles.languageSelect}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </Form.Select>
            <Form.Text className="text-muted">
              La langue utilisée dans l'interface de l'application.
            </Form.Text>
          </Form.Group>

          <div className={styles.submitButton}>
            <Button type="submit" variant="primary">
              Enregistrer les modifications
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ParametresGeneraux;
