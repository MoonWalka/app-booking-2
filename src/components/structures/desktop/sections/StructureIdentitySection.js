import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import styles from './StructureIdentitySection.module.css';
import Card from '@/components/ui/Card';

/**
 * Section component for structure's identity information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data
 * @param {Function} props.handleChange - Change handler
 * @param {Object} props.errors - Validation errors object
 * @returns {JSX.Element} - Rendered component
 */
const StructureIdentitySection = ({ formData, handleChange, errors = {} }) => {
  return (
    <Card
      title="Informations de base"
      icon={<i className="bi bi-info-circle"></i>}
      className={styles.structureFormCard}
      isEditing={true}
    >
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Nom</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Nom commercial ou d'usage"
              isInvalid={!!errors.nom}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nom || 'Le nom est requis'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Raison sociale</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="text"
              name="raisonSociale"
              value={formData.raisonSociale}
              onChange={handleChange}
              placeholder="Dénomination légale"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Type de structure</Form.Label>
            <Form.Select
              className={styles.formSelect}
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              isInvalid={!!errors.type}
            >
              <option value="">Sélectionner un type</option>
              <option value="association">Association</option>
              <option value="entreprise">Entreprise</option>
              <option value="administration">Administration</option>
              <option value="collectivite">Collectivité</option>
              <option value="autre">Autre</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.type || 'Le type de structure est requis'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>SIRET</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="text"
              name="siret"
              value={formData.siret}
              onChange={handleChange}
              placeholder="Numéro SIRET (14 chiffres)"
              pattern="[0-9]{14}"
              isInvalid={!!errors.siret}
            />
            <Form.Control.Feedback type="invalid">
              {errors.siret || 'Le SIRET doit contenir 14 chiffres'}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>TVA Intracommunautaire</Form.Label>
            <Form.Control
              className={styles.formControl}
              type="text"
              name="tva"
              value={formData.tva}
              onChange={handleChange}
              placeholder="N° TVA intracommunautaire"
            />
          </Form.Group>
        </Col>
      </Row>
    </Card>
  );
};

export default StructureIdentitySection;