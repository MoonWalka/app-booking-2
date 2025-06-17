import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ContactStructureSection.module.css';

/**
 * ContactStructureSection - Section détaillée pour les informations de structure
 * Gère tous les champs liés à la structure selon les spécifications
 */
const ContactStructureSection = ({ 
  formData, 
  handleChange, 
  errors,
  showCardWrapper = true 
}) => {

  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      {/* Raison Sociale */}
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          <i className="bi bi-building me-2"></i>
          Raison Sociale
        </Form.Label>
        <Form.Control
          type="text"
          name="structureRaisonSociale"
          value={formData.structureRaisonSociale || ''}
          onChange={handleChange}
          placeholder="Nom de la structure, entreprise, association..."
          isInvalid={!!errors.structureRaisonSociale}
        />
        <Form.Control.Feedback type="invalid">
          {errors.structureRaisonSociale}
        </Form.Control.Feedback>
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
              name="structureAdresse"
              value={formData.structureAdresse || ''}
              onChange={handleChange}
              placeholder="Numéro et nom de rue"
              isInvalid={!!errors.structureAdresse}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureAdresse}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              Suite Adresse 1
            </Form.Label>
            <Form.Control
              type="text"
              name="structureSuiteAdresse1"
              value={formData.structureSuiteAdresse1 || ''}
              onChange={handleChange}
              placeholder="Bâtiment, étage, appartement..."
              isInvalid={!!errors.structureSuiteAdresse1}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureSuiteAdresse1}
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
              name="structureCodePostal"
              value={formData.structureCodePostal || ''}
              onChange={handleChange}
              placeholder="75001"
              maxLength={5}
              isInvalid={!!errors.structureCodePostal}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureCodePostal}
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
              name="structureVille"
              value={formData.structureVille || ''}
              onChange={handleChange}
              placeholder="Paris"
              isInvalid={!!errors.structureVille}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureVille}
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
              name="structureDepartement"
              value={formData.structureDepartement || ''}
              onChange={handleChange}
              placeholder="Paris (75)"
              isInvalid={!!errors.structureDepartement}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureDepartement}
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
              name="structureRegion"
              value={formData.structureRegion || ''}
              onChange={handleChange}
              placeholder="Île-de-France"
              isInvalid={!!errors.structureRegion}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureRegion}
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
              name="structurePays"
              value={formData.structurePays || 'France'}
              onChange={handleChange}
              placeholder="France"
              isInvalid={!!errors.structurePays}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structurePays}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Site Internet */}
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          <i className="bi bi-globe2 me-2"></i>
          Site Internet
        </Form.Label>
        <Form.Control
          type="url"
          name="structureSiteWeb"
          value={formData.structureSiteWeb || ''}
          onChange={handleChange}
          placeholder="https://www.exemple.com"
          isInvalid={!!errors.structureSiteWeb}
        />
        <Form.Control.Feedback type="invalid">
          {errors.structureSiteWeb}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Téléphones */}
      <Row>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-telephone me-2"></i>
              Téléphone 1
            </Form.Label>
            <Form.Control
              type="tel"
              name="structureTelephone1"
              value={formData.structureTelephone1 || ''}
              onChange={handleChange}
              placeholder="01 23 45 67 89"
              isInvalid={!!errors.structureTelephone1}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureTelephone1}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-telephone me-2"></i>
              Téléphone 2
            </Form.Label>
            <Form.Control
              type="tel"
              name="structureTelephone2"
              value={formData.structureTelephone2 || ''}
              onChange={handleChange}
              placeholder="01 23 45 67 89"
              isInvalid={!!errors.structureTelephone2}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureTelephone2}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-phone me-2"></i>
              Mobile
            </Form.Label>
            <Form.Control
              type="tel"
              name="structureMobile"
              value={formData.structureMobile || ''}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
              isInvalid={!!errors.structureMobile}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureMobile}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Fax et Email */}
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-printer me-2"></i>
              Fax
            </Form.Label>
            <Form.Control
              type="tel"
              name="structureFax"
              value={formData.structureFax || ''}
              onChange={handleChange}
              placeholder="01 23 45 67 89"
              isInvalid={!!errors.structureFax}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureFax}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-envelope me-2"></i>
              Adresse mail
            </Form.Label>
            <Form.Control
              type="email"
              name="structureEmail"
              value={formData.structureEmail || ''}
              onChange={handleChange}
              placeholder="contact@exemple.com"
              isInvalid={!!errors.structureEmail}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureEmail}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Commentaires 1 à 6 */}
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 1
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="structureCommentaires1"
              value={formData.structureCommentaires1 || ''}
              onChange={handleChange}
              placeholder="Commentaires généraux..."
              isInvalid={!!errors.structureCommentaires1}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureCommentaires1}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 2
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="structureCommentaires2"
              value={formData.structureCommentaires2 || ''}
              onChange={handleChange}
              placeholder="Commentaires complémentaires..."
              isInvalid={!!errors.structureCommentaires2}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureCommentaires2}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 3
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="structureCommentaires3"
              value={formData.structureCommentaires3 || ''}
              onChange={handleChange}
              placeholder="Commentaires techniques..."
              isInvalid={!!errors.structureCommentaires3}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureCommentaires3}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 4
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="structureCommentaires4"
              value={formData.structureCommentaires4 || ''}
              onChange={handleChange}
              placeholder="Commentaires administratifs..."
              isInvalid={!!errors.structureCommentaires4}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureCommentaires4}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 5
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="structureCommentaires5"
              value={formData.structureCommentaires5 || ''}
              onChange={handleChange}
              placeholder="Commentaires commerciaux..."
              isInvalid={!!errors.structureCommentaires5}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureCommentaires5}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 6
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="structureCommentaires6"
              value={formData.structureCommentaires6 || ''}
              onChange={handleChange}
              placeholder="Commentaires divers..."
              isInvalid={!!errors.structureCommentaires6}
            />
            <Form.Control.Feedback type="invalid">
              {errors.structureCommentaires6}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Section informations */}
      <div className={styles.structureInfo}>
        <div className={styles.infoCard}>
          <i className="bi bi-building"></i>
          <div className={styles.infoContent}>
            <strong>Informations de structure</strong>
            <p>
              Cette section contient toutes les informations détaillées de la structure : 
              coordonnées complètes, contacts téléphoniques et commentaires organisés par catégorie.
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
      title="Structure"
      icon={<i className="bi bi-building"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default ContactStructureSection;