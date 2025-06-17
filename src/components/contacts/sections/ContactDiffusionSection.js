import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ContactDiffusionSection.module.css';

/**
 * ContactDiffusionSection - Section de diffusion du contact
 * Gère les informations liées aux festivals et diffusion
 */
const ContactDiffusionSection = ({ 
  formData, 
  handleChange, 
  errors,
  showCardWrapper = true 
}) => {

  // Liste des mois pour le sélecteur
  const moisOptions = [
    { value: '', label: 'Sélectionner un mois...' },
    { value: 'janvier', label: 'Janvier' },
    { value: 'fevrier', label: 'Février' },
    { value: 'mars', label: 'Mars' },
    { value: 'avril', label: 'Avril' },
    { value: 'mai', label: 'Mai' },
    { value: 'juin', label: 'Juin' },
    { value: 'juillet', label: 'Juillet' },
    { value: 'aout', label: 'Août' },
    { value: 'septembre', label: 'Septembre' },
    { value: 'octobre', label: 'Octobre' },
    { value: 'novembre', label: 'Novembre' },
    { value: 'decembre', label: 'Décembre' }
  ];

  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      {/* Nom du festival */}
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          <i className="bi bi-award me-2"></i>
          Nom Festival
        </Form.Label>
        <Form.Control
          type="text"
          name="nomFestival"
          value={formData.nomFestival || ''}
          onChange={handleChange}
          placeholder="Ex: Festival des Arts, Jazz Festival..."
          isInvalid={!!errors.nomFestival}
        />
        <Form.Control.Feedback type="invalid">
          {errors.nomFestival}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Nom du festival ou événement principal associé au contact.
        </Form.Text>
      </Form.Group>

      {/* Période festival */}
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-calendar3 me-2"></i>
              Période festival (mois)
            </Form.Label>
            <Form.Select
              name="periodeFestivalMois"
              value={formData.periodeFestivalMois || ''}
              onChange={handleChange}
              isInvalid={!!errors.periodeFestivalMois}
            >
              {moisOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.periodeFestivalMois}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-calendar-range me-2"></i>
              Période festival (complète)
            </Form.Label>
            <Form.Control
              type="text"
              name="periodeFestivalComplete"
              value={formData.periodeFestivalComplete || ''}
              onChange={handleChange}
              placeholder="Ex: 15-20 juillet 2024, Début juin..."
              isInvalid={!!errors.periodeFestivalComplete}
            />
            <Form.Control.Feedback type="invalid">
              {errors.periodeFestivalComplete}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Bouclage */}
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          <i className="bi bi-clock-history me-2"></i>
          Bouclage
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="bouclage"
          value={formData.bouclage || ''}
          onChange={handleChange}
          placeholder="Informations sur le bouclage, deadline, procédures..."
          isInvalid={!!errors.bouclage}
        />
        <Form.Control.Feedback type="invalid">
          {errors.bouclage}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Détails sur les délais, procédures de bouclage et informations temporelles importantes.
        </Form.Text>
      </Form.Group>

      {/* Commentaires 1 à 3 */}
      <Row>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 1
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="diffusionCommentaires1"
              value={formData.diffusionCommentaires1 || ''}
              onChange={handleChange}
              placeholder="Commentaires sur la diffusion..."
              isInvalid={!!errors.diffusionCommentaires1}
            />
            <Form.Control.Feedback type="invalid">
              {errors.diffusionCommentaires1}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 2
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="diffusionCommentaires2"
              value={formData.diffusionCommentaires2 || ''}
              onChange={handleChange}
              placeholder="Commentaires sur les festivals..."
              isInvalid={!!errors.diffusionCommentaires2}
            />
            <Form.Control.Feedback type="invalid">
              {errors.diffusionCommentaires2}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-chat-left-text me-2"></i>
              Commentaires 3
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="diffusionCommentaires3"
              value={formData.diffusionCommentaires3 || ''}
              onChange={handleChange}
              placeholder="Commentaires sur les périodes..."
              isInvalid={!!errors.diffusionCommentaires3}
            />
            <Form.Control.Feedback type="invalid">
              {errors.diffusionCommentaires3}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Section informations */}
      <div className={styles.diffusionInfo}>
        <div className={styles.infoCard}>
          <i className="bi bi-broadcast"></i>
          <div className={styles.infoContent}>
            <strong>Informations de diffusion</strong>
            <p>
              Cette section permet de qualifier les informations liées à la diffusion 
              et aux festivals associés à ce contact. Ces données aident à organiser 
              et planifier les événements.
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
      title="Diffusion"
      icon={<i className="bi bi-broadcast"></i>}
      variant="info"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default ContactDiffusionSection;