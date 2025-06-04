import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './StructureInfoSection.module.css';

/**
 * StructureInfoSection - Section contenant les informations sur la structure du contact
 */
const StructureInfoSection = ({ 
  formik = null, // Support Formik (rétrocompatibilité)
  formData = null, // Support hook useContactForm
  handleChange = null, // Handler pour useContactForm
  touched = {}, 
  errors = {}, 
  isReadOnly = false,
  showCardWrapper = true // Nouvelle prop pour la flexibilité
}) => {
  // Déterminer le mode (Formik vs Hook)
  const isFormikMode = formik && formik.values;
  
  // Valeurs selon le mode
  const values = isFormikMode 
    ? (formik.values || { structure: {}, structureId: '' })
    : (formData || { structure: {}, structureId: '' });
    
  // Handler selon le mode  
  const onChange = isFormikMode 
    ? (formik.handleChange || (() => {}))
    : (handleChange || (() => {}));
    
  const onBlur = isFormikMode 
    ? (formik.handleBlur || (() => {}))
    : (() => {});

  // Accéder aux valeurs de structure de manière sécurisée
  const structureValues = values.structure || {};
  const touchedStructure = touched?.structure || {};
  const errorsStructure = errors?.structure || {};

  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureRaisonSociale">Raison sociale *</Form.Label>
            <Form.Control
              id="structureRaisonSociale"
              name="structure.raisonSociale"
              type="text"
              value={structureValues.raisonSociale || ''}
              onChange={onChange}
              onBlur={onBlur}
              isInvalid={touchedStructure.raisonSociale && errorsStructure.raisonSociale}
              disabled={isReadOnly}
              placeholder="Nom de la structure"
              className={styles.formInput}
            />
            <Form.Control.Feedback type="invalid">
              {errorsStructure.raisonSociale}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureType">Type de structure</Form.Label>
            <Form.Select
              id="structureType"
              name="structure.type"
              value={structureValues.type || ''}
              onChange={onChange}
              onBlur={onBlur}
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
            <Form.Label htmlFor="structureAdresse">Adresse</Form.Label>
            <Form.Control
              id="structureAdresse"
              name="structure.adresse"
              type="text"
              value={structureValues.adresse || ''}
              onChange={onChange}
              onBlur={onBlur}
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
            <Form.Label htmlFor="structureCodePostal">Code postal</Form.Label>
            <Form.Control
              id="structureCodePostal"
              name="structure.codePostal"
              type="text"
              value={structureValues.codePostal || ''}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isReadOnly}
              placeholder="Code postal"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
        
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureVille">Ville</Form.Label>
            <Form.Control
              id="structureVille"
              name="structure.ville"
              type="text"
              value={structureValues.ville || ''}
              onChange={onChange}
              onBlur={onBlur}
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
              value={structureValues.siret || ''}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isReadOnly}
              placeholder="Numéro SIRET"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureTva">TVA Intracommunautaire</Form.Label>
            <Form.Control
              id="structureTva"
              name="structure.tva"
              type="text"
              value={structureValues.tva || ''}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isReadOnly}
              placeholder="Numéro de TVA"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="structureNumeroIntracommunautaire">N° TVA Intracommunautaire</Form.Label>
            <Form.Control
              id="structureNumeroIntracommunautaire"
              name="structure.numeroIntracommunautaire"
              type="text"
              value={structureValues.numeroIntracommunautaire || ''}
              onChange={onChange}
              onBlur={onBlur}
              disabled={isReadOnly}
              placeholder="Ex: FR12345678901"
              className={styles.formInput}
            />
          </Form.Group>
        </Col>
      </Row>
      
      {/* Champ caché pour stocker l'ID de structure */}
      <input 
        type="hidden" 
        name="structureId" 
        value={(values.structureId || '')}
      />
    </div>
  );

  // Version sans carte (pour usage dans des wrappers)
  if (!showCardWrapper) {
    return (
      <div className={styles.structureInfoSection}>
        <h4 className={styles.sectionTitle}>Informations sur la structure</h4>
        {formContent}
      </div>
    );
  }

  // Version avec carte (pour usage standalone)
  return (
    <Card
      title="Informations sur la structure"
      icon={<i className="bi bi-building"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default StructureInfoSection;
