import React from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useEntrepriseFormSimple } from '@/hooks/parametres/useEntrepriseFormSimple';

/**
 * Version simplifiée du composant ParametresEntreprise
 * Sans les hooks complexes pour éviter les boucles infinies
 */
const ParametresEntrepriseSimple = () => {
  const {
    formData,
    loading,
    errors,
    success,
    handleFieldChange,
    handleSubmit
  } = useEntrepriseFormSimple();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleFieldChange(name, value);
  };

  return (
    <Card>
      <Card.Body>
        <h3>Informations de l'entreprise (Version Simplifiée)</h3>
        <p>Cette version simplifiée évite les boucles infinies.</p>
        
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}
        
        {errors.general && (
          <Alert variant="danger">
            {errors.general}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Nom de l'entreprise *</Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.nom}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nom}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>SIRET</Form.Label>
                <Form.Control
                  type="text"
                  name="siret"
                  value={formData.siret || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.siret}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.siret}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Adresse *</Form.Label>
            <Form.Control
              type="text"
              name="adresse"
              value={formData.adresse || ''}
              onChange={handleInputChange}
              isInvalid={!!errors.adresse}
            />
            <Form.Control.Feedback type="invalid">
              {errors.adresse}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Code postal *</Form.Label>
                <Form.Control
                  type="text"
                  name="codePostal"
                  value={formData.codePostal || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.codePostal}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.codePostal}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-8">
              <Form.Group className="mb-3">
                <Form.Label>Ville *</Form.Label>
                <Form.Control
                  type="text"
                  name="ville"
                  value={formData.ville || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.ville}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.ville}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="text"
                  name="telephone"
                  value={formData.telephone || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Site web</Form.Label>
            <Form.Control
              type="text"
              name="siteWeb"
              value={formData.siteWeb || ''}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Code APE</Form.Label>
            <Form.Control
              type="text"
              name="codeAPE"
              value={formData.codeAPE || ''}
              onChange={handleInputChange}
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

export default ParametresEntrepriseSimple; 