import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ContactSalleSection.module.css';

/**
 * ContactSalleSection - Section pour les informations de salle
 * Gère les données techniques et spécifications de la salle
 */
const ContactSalleSection = ({ 
  formData, 
  handleChange, 
  errors,
  showCardWrapper = true 
}) => {

  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      {/* Nom de la salle */}
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          <i className="bi bi-building me-2"></i>
          Salle (nom)
        </Form.Label>
        <Form.Control
          type="text"
          name="salleNom"
          value={formData.salleNom || ''}
          onChange={handleChange}
          placeholder="Nom de la salle, théâtre, auditorium..."
          isInvalid={!!errors.salleNom}
        />
        <Form.Control.Feedback type="invalid">
          {errors.salleNom}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Nom officiel de la salle de spectacle ou lieu de représentation.
        </Form.Text>
      </Form.Group>

      {/* Adresse et Suite Adresse */}
      <Row>
        <Col md={8}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-geo-alt me-2"></i>
              Adresse
            </Form.Label>
            <Form.Control
              type="text"
              name="salleAdresse"
              value={formData.salleAdresse || ''}
              onChange={handleChange}
              placeholder="Numéro et nom de rue"
              isInvalid={!!errors.salleAdresse}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleAdresse}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              Suite Adresse
            </Form.Label>
            <Form.Control
              type="text"
              name="salleSuiteAdresse"
              value={formData.salleSuiteAdresse || ''}
              onChange={handleChange}
              placeholder="Bâtiment, aile, niveau..."
              isInvalid={!!errors.salleSuiteAdresse}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleSuiteAdresse}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Code postal, Ville, Département */}
      <Row>
        <Col md={3}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-mailbox me-2"></i>
              Code postal
            </Form.Label>
            <Form.Control
              type="text"
              name="salleCodePostal"
              value={formData.salleCodePostal || ''}
              onChange={handleChange}
              placeholder="75001"
              maxLength={5}
              isInvalid={!!errors.salleCodePostal}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleCodePostal}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-building me-2"></i>
              Ville
            </Form.Label>
            <Form.Control
              type="text"
              name="salleVille"
              value={formData.salleVille || ''}
              onChange={handleChange}
              placeholder="Paris"
              isInvalid={!!errors.salleVille}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleVille}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-map me-2"></i>
              Département
            </Form.Label>
            <Form.Control
              type="text"
              name="salleDepartement"
              value={formData.salleDepartement || ''}
              onChange={handleChange}
              placeholder="Paris (75)"
              isInvalid={!!errors.salleDepartement}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleDepartement}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Région et Pays */}
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-geo-alt-fill me-2"></i>
              Région
            </Form.Label>
            <Form.Control
              type="text"
              name="salleRegion"
              value={formData.salleRegion || ''}
              onChange={handleChange}
              placeholder="Île-de-France"
              isInvalid={!!errors.salleRegion}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleRegion}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-globe me-2"></i>
              Pays
            </Form.Label>
            <Form.Control
              type="text"
              name="sallePays"
              value={formData.sallePays || 'France'}
              onChange={handleChange}
              placeholder="France"
              isInvalid={!!errors.sallePays}
            />
            <Form.Control.Feedback type="invalid">
              {errors.sallePays}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Téléphone */}
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          <i className="bi bi-telephone me-2"></i>
          Téléphone
        </Form.Label>
        <Form.Control
          type="tel"
          name="salleTelephone"
          value={formData.salleTelephone || ''}
          onChange={handleChange}
          placeholder="01 23 45 67 89"
          isInvalid={!!errors.salleTelephone}
        />
        <Form.Control.Feedback type="invalid">
          {errors.salleTelephone}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Jauges */}
      <Row>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-people me-2"></i>
              Jauge 1
            </Form.Label>
            <Form.Control
              type="number"
              name="salleJauge1"
              value={formData.salleJauge1 || ''}
              onChange={handleChange}
              placeholder="500"
              min="0"
              isInvalid={!!errors.salleJauge1}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleJauge1}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Capacité d'accueil principale
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-people me-2"></i>
              Jauge 2
            </Form.Label>
            <Form.Control
              type="number"
              name="salleJauge2"
              value={formData.salleJauge2 || ''}
              onChange={handleChange}
              placeholder="300"
              min="0"
              isInvalid={!!errors.salleJauge2}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleJauge2}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Configuration alternative
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-people me-2"></i>
              Jauge 3
            </Form.Label>
            <Form.Control
              type="number"
              name="salleJauge3"
              value={formData.salleJauge3 || ''}
              onChange={handleChange}
              placeholder="150"
              min="0"
              isInvalid={!!errors.salleJauge3}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleJauge3}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Configuration réduite
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Dimensions techniques */}
      <Row>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-arrows-expand me-2"></i>
              Ouverture
            </Form.Label>
            <Form.Control
              type="text"
              name="salleOuverture"
              value={formData.salleOuverture || ''}
              onChange={handleChange}
              placeholder="12m x 8m"
              isInvalid={!!errors.salleOuverture}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleOuverture}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Dimensions de l'ouverture de scène
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-arrows-vertical me-2"></i>
              Profondeur
            </Form.Label>
            <Form.Control
              type="text"
              name="salleProfondeur"
              value={formData.salleProfondeur || ''}
              onChange={handleChange}
              placeholder="15m"
              isInvalid={!!errors.salleProfondeur}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleProfondeur}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Profondeur de scène
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-arrow-up me-2"></i>
              Hauteur
            </Form.Label>
            <Form.Control
              type="text"
              name="salleHauteur"
              value={formData.salleHauteur || ''}
              onChange={handleChange}
              placeholder="6m"
              isInvalid={!!errors.salleHauteur}
            />
            <Form.Control.Feedback type="invalid">
              {errors.salleHauteur}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Hauteur sous gril
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Section informations */}
      <div className={styles.salleInfo}>
        <div className={styles.infoCard}>
          <i className="bi bi-building-gear"></i>
          <div className={styles.infoContent}>
            <strong>Spécifications techniques de la salle</strong>
            <p>
              Cette section contient toutes les informations techniques de la salle : 
              localisation, capacités d'accueil selon différentes configurations 
              et dimensions techniques pour la préparation des spectacles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Version sans carte (pour usage dans des wrappers)
  if (!showCardWrapper) {
    return formContent;
  }

  // Version avec carte (pour usage standalone)
  return (
    <Card
      title="Salle"
      icon={<i className="bi bi-building-gear"></i>}
      variant="warning"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default ContactSalleSection;