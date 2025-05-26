import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ProgrammateurContactSection.module.css';

/**
 * ProgrammateurContactSection - Section d'informations de contact
 * Utilise la même structure que les sections de lieux
 */
const ProgrammateurContactSection = ({
  programmateur,
  isEditMode,
  formData,
  onChange,
  errors
}) => {
  const renderViewMode = () => (
    <div className={styles.viewContent}>
      <Row>
        <Col md={6}>
          <div className={styles.field}>
            <label className={styles.label}>Nom</label>
            <div className={styles.value}>
              {programmateur?.nom || 'Non renseigné'}
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className={styles.field}>
            <label className={styles.label}>Prénom</label>
            <div className={styles.value}>
              {programmateur?.prenom || 'Non renseigné'}
            </div>
          </div>
        </Col>
      </Row>
      
      <div className={styles.field}>
        <label className={styles.label}>Fonction</label>
        <div className={styles.value}>
          {programmateur?.fonction || 'Non renseignée'}
        </div>
      </div>
      
      <Row>
        <Col md={6}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.value}>
              {programmateur?.email || 'Non renseigné'}
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className={styles.field}>
            <label className={styles.label}>Téléphone</label>
            <div className={styles.value}>
              {programmateur?.telephone || 'Non renseigné'}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );

  const renderEditMode = () => (
    <div className={styles.editContent}>
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              Nom <span className={styles.required}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="nom"
              value={formData.nom || ''}
              onChange={onChange}
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
              Prénom <span className={styles.required}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="prenom"
              value={formData.prenom || ''}
              onChange={onChange}
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
          Fonction <span className={styles.optional}>(facultatif)</span>
        </Form.Label>
        <Form.Control
          type="text"
          name="fonction"
          value={formData.fonction || ''}
          onChange={onChange}
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
              value={formData.email || ''}
              onChange={onChange}
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
              value={formData.telephone || ''}
              onChange={onChange}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );

  return (
    <Card
      title="Informations de contact"
      icon={<i className="bi bi-person-vcard"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {isEditMode ? renderEditMode() : renderViewMode()}
    </Card>
  );
};

export default ProgrammateurContactSection; 