import React from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import Card from '@/components/ui/Card';
import styles from './StructureSignataireSection.module.css';

/**
 * Section component for structure's contract signatory information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.signataire - Signatory data
 * @param {Function} props.handleSignataireChange - Change handler for signatory fields
 * @param {Object} props.errors - Validation errors (optional)
 * @returns {JSX.Element} - Rendered component
 */
const StructureSignataireSection = ({ signataire, handleSignataireChange, errors = {} }) => {
  return (
    <Card
      title="Informations du signataire du contrat"
      icon={<i className="bi bi-person-check"></i>}
      className={styles.structureFormCard}
      isEditing={true}
    >
      <Alert variant="info" className={styles.helpAlert}>
        <i className="bi bi-info-circle me-2"></i>
        Ces informations seront utilisées pour générer le contrat. Merci de renseigner le représentant légal ou la personne habilitée à signer pour la structure.
      </Alert>
      
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              Prénom <span className={styles.required}>*</span>
            </Form.Label>
            <Form.Control
              className={styles.formControl}
              type="text"
              name="prenom"
              value={signataire.prenom}
              onChange={handleSignataireChange}
              required
              isInvalid={!!errors.prenom}
            />
            <Form.Control.Feedback type="invalid">
              {errors.prenom || 'Le prénom est requis'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              Nom <span className={styles.required}>*</span>
            </Form.Label>
            <Form.Control
              className={styles.formControl}
              type="text"
              name="nom"
              value={signataire.nom}
              onChange={handleSignataireChange}
              required
              isInvalid={!!errors.nom}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nom || 'Le nom est requis'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          Fonction / Qualité <span className={styles.required}>*</span>
        </Form.Label>
        <Form.Control
          className={styles.formControl}
          type="text"
          name="fonction"
          value={signataire.fonction}
          onChange={handleSignataireChange}
          placeholder="Ex: Directeur, Président, Responsable..."
          required
          isInvalid={!!errors.fonction}
        />
        <Form.Control.Feedback type="invalid">
          {errors.fonction || 'La fonction est requise'}
        </Form.Control.Feedback>
      </Form.Group>
      
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Email (facultatif)</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="email"
              name="email"
              value={signataire.email}
              onChange={handleSignataireChange}
              placeholder="Email du signataire"
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Téléphone (facultatif)</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="tel"
              name="telephone"
              value={signataire.telephone}
              onChange={handleSignataireChange}
              placeholder="Téléphone du signataire"
            />
          </Form.Group>
        </Col>
      </Row>
    </Card>
  );
};

export default StructureSignataireSection;