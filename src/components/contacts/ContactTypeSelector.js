import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import styles from './ContactTypeSelector.module.css';

/**
 * ContactTypeSelector - Composant de sélection du type de contact
 * Permet de choisir entre créer une Structure ou une Personne
 */
const ContactTypeSelector = () => {
  const navigate = useNavigate();

  const handleSelectType = (type) => {
    navigate(`/contacts/nouveau/${type}`);
  };

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <i className="bi bi-person-plus me-3"></i>
          Ajouter un contact
        </h2>
        <p className={styles.subtitle}>
          Choisissez le type de contact que vous souhaitez créer
        </p>
      </div>

      <Row className={styles.optionsRow}>
        <Col md={6}>
          <Card 
            className={`${styles.optionCard} ${styles.structureCard}`}
            onClick={() => handleSelectType('structure')}
          >
            <Card.Body className={styles.cardBody}>
              <div className={styles.iconContainer}>
                <i className="bi bi-building"></i>
              </div>
              <h4 className={styles.cardTitle}>Structure</h4>
              <p className={styles.cardDescription}>
                Créer un contact pour une organisation, entreprise, festival, 
                salle de spectacle ou toute autre structure.
              </p>
              <div className={styles.cardFeatures}>
                <div className={styles.feature}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Informations d'entreprise</span>
                </div>
                <div className={styles.feature}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Données techniques de salle</span>
                </div>
                <div className={styles.feature}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Gestion des festivals</span>
                </div>
              </div>
              <div className={styles.cardAction}>
                <span>Créer une structure</span>
                <i className="bi bi-arrow-right"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card 
            className={`${styles.optionCard} ${styles.personneCard}`}
            onClick={() => handleSelectType('personne')}
          >
            <Card.Body className={styles.cardBody}>
              <div className={styles.iconContainer}>
                <i className="bi bi-person-circle"></i>
              </div>
              <h4 className={styles.cardTitle}>Personne</h4>
              <p className={styles.cardDescription}>
                Créer un contact pour une personne physique : 
                programmateur, directeur, technicien, artiste...
              </p>
              <div className={styles.cardFeatures}>
                <div className={styles.feature}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Informations personnelles</span>
                </div>
                <div className={styles.feature}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Contacts directs</span>
                </div>
                <div className={styles.feature}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Association à des structures</span>
                </div>
              </div>
              <div className={styles.cardAction}>
                <span>Créer une personne</span>
                <i className="bi bi-arrow-right"></i>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <i className="bi bi-info-circle"></i>
          <div className={styles.infoContent}>
            <strong>Information</strong>
            <p>
              Vous pourrez toujours compléter ou modifier les informations plus tard. 
              Il est également possible d'associer des personnes à des structures après leur création.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ContactTypeSelector;