import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import FormPageHeader from './FormPageHeader';
import FormContentWrapper from './FormContentWrapper';
import styles from './PreContratForm.module.css';

/**
 * Formulaire de pré-contrat public
 */
function PreContratForm({ 
  concertId, 
  token, 
  concertData, 
  formLinkData, 
  existingSubmission, 
  onSubmissionComplete 
}) {

  return (
    <Container fluid className={styles.container}>
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          {/* Header du formulaire */}
          <FormPageHeader
            title="Formulaire de Pré-contrat"
            subtitle="Merci de remplir ce formulaire pour finaliser votre pré-contrat"
            concertInfo={concertData}
          />

          {/* Contenu principal */}
          <FormContentWrapper>
            <Card className={styles.constructionCard}>
              <Card.Body className="text-center py-5">
                <div className={styles.constructionIcon}>
                  <i className="bi bi-tools fs-1 text-primary"></i>
                </div>
                <h3 className="mt-3 mb-3 text-primary">
                  Formulaire en construction
                </h3>
                <p className="text-muted mb-4">
                  Le formulaire de pré-contrat est actuellement en cours de développement.
                  <br />
                  Il sera bientôt disponible avec toutes les fonctionnalités nécessaires.
                </p>
                <div className={styles.infoBox}>
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    En attendant, vous pouvez nous contacter directement pour toute question.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </FormContentWrapper>
        </Col>
      </Row>
    </Container>
  );
}

export default PreContratForm;