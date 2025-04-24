import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

const StructuresPage = () => {
  return (
    <Container fluid>
      <h1 className="mt-4 mb-4">Structures</h1>
      
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="text-center p-5">
              <div className="mb-4">
                <i className="bi bi-building display-1 text-muted"></i>
              </div>
              
              <h2 className="mb-3">Fonctionnalité en cours de développement</h2>
              
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                Cette section permettra bientôt de gérer les structures (entités signataires des contrats) 
                avec des relations bidirectionnelles vers les autres entités comme les concerts, 
                lieux, programmateurs et artistes.
              </Alert>
              
              <p className="text-muted mt-4">
                Revenez bientôt pour découvrir cette nouvelle fonctionnalité !
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StructuresPage;