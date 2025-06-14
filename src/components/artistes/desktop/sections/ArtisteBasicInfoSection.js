import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import styles from './ArtisteBasicInfoSection.module.css';
import Card from '@/components/ui/Card';

/**
 * Section component for artist's basic information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data
 * @param {Function} props.handleChange - Change handler
 * @param {Object} props.errors - Validation errors object
 * @returns {JSX.Element} - Rendered component
 */
const ArtisteBasicInfoSection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card
      title="Informations de base"
      icon={<i className="bi bi-music-note"></i>}
      className={styles.artisteFormCard}
      isEditing={true}
    >
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Nom de l'artiste</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Nom de scène ou d'artiste"
              isInvalid={!!errors.nom}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nom || 'Le nom est requis'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Genre musical</Form.Label>
            <Form.Select
              className={styles.formSelect}
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              required
              isInvalid={!!errors.genre}
            >
              <option value="">Sélectionner un genre</option>
              <option value="rock">Rock</option>
              <option value="pop">Pop</option>
              <option value="jazz">Jazz</option>
              <option value="classique">Classique</option>
              <option value="folk">Folk</option>
              <option value="blues">Blues</option>
              <option value="reggae">Reggae</option>
              <option value="metal">Metal</option>
              <option value="electro">Électro</option>
              <option value="rap">Rap</option>
              <option value="chanson">Chanson</option>
              <option value="world">World Music</option>
              <option value="autre">Autre</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.genre || 'Le genre musical est requis'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Description</Form.Label>
            <Form.Control
              as="textarea"
              className={styles.formControl}
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Décrivez l'artiste, son style, son parcours..."
            />
          </Form.Group>
        </Col>
      </Row>
    </Card>
  );
};

export default ArtisteBasicInfoSection;