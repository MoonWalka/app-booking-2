import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ContactInfoSection.module.css';

/**
 * ContactInfoSection - Section d'informations de contact pour le formulaire de programmateur
 * Gère les informations personnelles comme le nom, prénom, fonction, email et téléphone
 */
const ContactInfoSection = ({ 
  formData, 
  handleChange, 
  errors,
  showCardWrapper = true 
}) => {
  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              Nom <span className={styles.requiredField}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              isInvalid={!!errors.nom}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.nom}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              Prénom <span className={styles.requiredField}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              isInvalid={!!errors.prenom}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.prenom}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          Fonction <span className={styles.optionalText}>(facultatif)</span>
        </Form.Label>
        <Form.Control
          type="text"
          name="fonction"
          value={formData.fonction}
          onChange={handleChange}
          placeholder="Ex: Directeur artistique, Responsable programmation..."
        />
      </Form.Group>
      
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Facultatif, mais recommandé pour les communications futures.
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Téléphone</Form.Label>
            <Form.Control
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );

  // Version sans carte (pour usage dans des wrappers)
  if (!showCardWrapper) {
    return formContent;
  }

  // Version avec carte (pour usage standalone)
  return (
    <Card
      title="Informations de contact"
      icon={<i className="bi bi-person-lines-fill"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default ContactInfoSection;
