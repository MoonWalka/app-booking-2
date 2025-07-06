import React, { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button } from 'react-bootstrap';
import RechercheLayout from '@/components/recherches/RechercheLayout';

/**
 * Page affichant les dossiers de recherche enregistrés
 */
const DossiersEnregistresPage = () => {
  const [selectedDossier, setSelectedDossier] = useState(null);

  // Données d'exemple pour les dossiers
  const dossiers = [
    {
      id: 'dossier-20062025',
      nom: 'Dossier du 20/06/2025 01:12',
      description: 'Recherche de contacts dans la région parisienne',
      dateCreation: '2025-06-20',
      totalContacts: 1,
      tags: ['Paris', 'Structures'],
      items: [
        { id: 'tous-1', label: 'Tous', count: 1 },
        { id: 'non-localises-0', label: 'Contacts non localisés', count: 0 }
      ]
    }
  ];

  return (
    <RechercheLayout>
      <div className="p-4">
        <Row>
          <Col md={4}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <i className="bi bi-folder2-open me-2"></i>
              Dossiers enregistrés
            </h4>
          </div>

          <ListGroup>
            {dossiers.map(dossier => (
              <ListGroup.Item
                key={dossier.id}
                action
                active={selectedDossier?.id === dossier.id}
                onClick={() => setSelectedDossier(dossier)}
                className="d-flex justify-content-between align-items-start"
              >
                <div>
                  <div className="fw-bold">{dossier.nom}</div>
                  <small className="text-muted">{dossier.description}</small>
                  <div className="mt-1">
                    {dossier.tags.map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge bg="primary" pill>
                  {dossier.totalContacts}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col md={8}>
          {selectedDossier ? (
            <Card>
              <Card.Header>
                <h5>{selectedDossier.nom}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{selectedDossier.description}</p>
                
                <div className="mb-3">
                  <strong>Date de création:</strong> {selectedDossier.dateCreation}
                </div>

                <div className="mb-3">
                  <strong>Contenu du dossier:</strong>
                </div>

                <ListGroup>
                  {selectedDossier.items.map(item => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                      <span>{item.label}</span>
                      <Badge bg="info">{item.count}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>

                <div className="mt-4 d-flex gap-2">
                  <Button variant="primary">
                    <i className="bi bi-eye me-2"></i>
                    Voir les contacts
                  </Button>
                  <Button variant="outline-secondary">
                    <i className="bi bi-pencil me-2"></i>
                    Modifier
                  </Button>
                  <Button variant="outline-danger">
                    <i className="bi bi-trash me-2"></i>
                    Supprimer
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body className="text-center text-muted py-5">
                <i className="bi bi-folder2 display-1"></i>
                <p className="mt-3">Sélectionnez un dossier pour voir son contenu</p>
              </Card.Body>
            </Card>
          )}
          </Col>
        </Row>
      </div>
    </RechercheLayout>
  );
};

export default DossiersEnregistresPage;