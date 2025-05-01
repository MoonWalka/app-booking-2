import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import styles from './StructureInfoSection.module.css';

/**
 * StructureInfoSection - Section contenant les informations sur la structure du programmateur
 */
const StructureInfoSection = ({ 
  formik, 
  touched, 
  errors, 
  isReadOnly = false 
}) => {
  return (
    <div className={styles.structureInfoSection}>
      <h4 className={styles.sectionTitle}>Informations sur la structure</h4>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureName">Raison sociale *</Form.Label>
            <Form.Control
              id="structureName"
              name="structure.nom"
              type="text"
              value={formik.values.structure.nom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={touched?.structure?.nom && errors?.structure?.nom}
              disabled={isReadOnly}
              placeholder="Nom de la structure"
              className={styles.formInput}
            />
            <Form.Control.Feedback type="invalid">
              {errors?.structure?.nom}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureType">Type de structure</Form.Label>
            <Form.Select
              id="structureType"
              name="structure.type"
              value={formik.values.structure.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly}
              className={styles.formInput}
            >
              <option value="">Sélectionner un type</option>
              <option value="association">Association</option>
              <option value="sarl">SARL</option>
              <option value="eurl">EURL</option>
              <option value="sas">SAS</option>
              <option value="collectivite">Collectivité territoriale</option>
              <option value="autre">Autre</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureAddress">Adresse</Form.Label>
            <Form.Control
              id="structureAddress"
              name="structure.adresse"
              type="text"
              value={formik.values.structure.adresse}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly}
              placeholder="Adresse de la structure"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structurePostalCode">Code postal</Form.Label>
            <Form.Control
              id="structurePostalCode"
              name="structure.codePostal"
              type="text"
              value={formik.values.structure.codePostal}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly}
              placeholder="Code postal"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
        
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureCity">Ville</Form.Label>
            <Form.Control
              id="structureCity"
              name="structure.ville"
              type="text"
              value={formik.values.structure.ville}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly}
              placeholder="Ville"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureSiret">SIRET</Form.Label>
            <Form.Control
              id="structureSiret"
              name="structure.siret"
              type="text"
              value={formik.values.structure.siret}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly}
              placeholder="Numéro SIRET"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureApe">Code APE</Form.Label>
            <Form.Control
              id="structureApe"
              name="structure.ape"
              type="text"
              value={formik.values.structure.ape}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isReadOnly}
              placeholder="Code APE/NAF"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default StructureInfoSection;
