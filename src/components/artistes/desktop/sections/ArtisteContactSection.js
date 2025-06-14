import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ArtisteContactSection.module.css';

/**
 * ArtisteContactSection - Section de coordonnées pour le formulaire d'artiste
 * Gère les informations de contact comme l'email, téléphone, site web et réseaux sociaux
 */
const ArtisteContactSection = ({ 
  formData, 
  handleChange, 
  errors = {},
  showCardWrapper = true 
}) => {
  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              isInvalid={!!errors.email}
              placeholder="contact@artiste.com"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Pour les contacts professionnels et les réservations.
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Téléphone</Form.Label>
            <Form.Control
              type="tel"
              name="telephone"
              value={formData.telephone || ''}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>Site web</Form.Label>
        <Form.Control
          type="url"
          name="siteWeb"
          value={formData.siteWeb || ''}
          onChange={handleChange}
          placeholder="https://www.monsite.com"
        />
        <Form.Text className="text-muted">
          Site officiel, Bandcamp, SoundCloud...
        </Form.Text>
      </Form.Group>
      
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Instagram</Form.Label>
            <Form.Control
              type="text"
              name="instagram"
              value={formData.instagram || ''}
              onChange={handleChange}
              placeholder="@nom_artiste"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Facebook</Form.Label>
            <Form.Control
              type="text"
              name="facebook"
              value={formData.facebook || ''}
              onChange={handleChange}
              placeholder="Nom de la page Facebook"
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
      title="Coordonnées de contact"
      icon={<i className="bi bi-telephone"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default ArtisteContactSection;