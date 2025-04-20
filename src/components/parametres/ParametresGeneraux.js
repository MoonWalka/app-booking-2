import React, { useState, useEffect } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useParametres } from '../../contexts/ParametresContext';

const ParametresGeneraux = () => {
  const { parametres, sauvegarderParametres, loading } = useParametres();
  const [localState, setLocalState] = useState(parametres.generaux || {
    langue: 'fr',
    formatDate: 'dd/mm/yyyy',
    nomApplication: 'TourCraft'
  });

  useEffect(() => {
    if (parametres.generaux) {
      setLocalState(parametres.generaux);
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
      alert('Paramètres généraux sauvegardés avec succès');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-3">Paramètres généraux</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom de l'application</Form.Label>
            <Form.Control
              type="text"
              name="nomApplication"
              value={localState.nomApplication}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Langue</Form.Label>
            <Form.Select
              name="langue"
              value={localState.langue}
              onChange={handleChange}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Format de date</Form.Label>
            <Form.Select
              name="formatDate"
              value={localState.formatDate}
              onChange={handleChange}
            >
              <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
              <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
              <option value="yyyy-mm-dd">AAAA-MM-JJ</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
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