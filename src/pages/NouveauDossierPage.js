import React from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import RechercheLayout from '@/components/recherches/RechercheLayout';

/**
 * Page pour créer un nouveau dossier de recherche
 */
const NouveauDossierPage = () => {
  return (
    <RechercheLayout>
      <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-folder-plus me-2"></i>
              Nouveau dossier
            </h2>
          </div>

          <Card>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du dossier</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Entrez le nom du dossier"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    placeholder="Description du dossier (optionnel)"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tags</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Ajoutez des tags séparés par des virgules"
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="primary">
                    <i className="bi bi-check-circle me-2"></i>
                    Créer le dossier
                  </Button>
                  <Button variant="outline-secondary">
                    Annuler
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
      </div>
    </RechercheLayout>
  );
};

export default NouveauDossierPage;