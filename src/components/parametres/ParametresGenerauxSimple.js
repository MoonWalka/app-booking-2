import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useParametres } from '@/context/ParametresContext';

/**
 * Version simplifiée du composant ParametresGeneraux
 * Sans les hooks complexes pour éviter les boucles infinies
 */
const ParametresGenerauxSimple = () => {
  const { parametres, sauvegarderParametres, loading: contextLoading } = useParametres();
  const [localState, setLocalState] = useState({
    langue: 'fr',
    formatDate: 'dd/mm/yyyy',
    nomApplication: 'TourCraft'
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parametres.generaux) {
      setLocalState({
        langue: parametres.generaux.langue || 'fr',
        formatDate: parametres.generaux.formatDate || 'dd/mm/yyyy',
        nomApplication: parametres.generaux.nomApplication || 'TourCraft'
      });
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
    setLoading(true);
    
    try {
      const success = await sauvegarderParametres('generaux', localState);
      if (success) {
        setSuccess('Paramètres généraux sauvegardés avec succès');
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
        <h3>Paramètres généraux (Version Simplifiée)</h3>
        
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Langue</Form.Label>
            <Form.Select
              name="langue"
              value={localState.langue}
              onChange={handleChange}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Format de date</Form.Label>
            <Form.Select
              name="formatDate"
              value={localState.formatDate}
              onChange={handleChange}
            >
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nom de l'application</Form.Label>
            <Form.Control
              type="text"
              name="nomApplication"
              value={localState.nomApplication}
              onChange={handleChange}
            />
          </Form.Group>

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

export default ParametresGenerauxSimple; 