import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import TagsInput from '@components/ui/TagsInput';
import { getTagLabels } from '@/config/tagsConfig';
import styles from './ContactQualificationSection.module.css';

/**
 * ContactQualificationSection - Section de qualification du contact
 * Gère les tags, date de création et dernière modification
 */
const ContactQualificationSection = forwardRef(({ 
  formData, 
  handleChange, 
  errors,
  showCardWrapper = true,
  isEditing = false 
}, ref) => {
  const tagsInputRef = useRef();
  // Tags disponibles depuis la configuration centralisée
  const availableTags = getTagLabels();
  
  // Gestion des tags
  const handleTagsChange = (newTags) => {
    handleChange({
      target: {
        name: 'tags',
        value: newTags
      }
    });
  };

  // Exposer la méthode pour ouvrir la modal de tags
  useImperativeHandle(ref, () => ({
    openTagsModal: () => {
      if (tagsInputRef.current) {
        tagsInputRef.current.openModal();
      }
    }
  }));

  // Formater les dates pour l'affichage
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      {/* Section Tags */}
      <TagsInput
        ref={tagsInputRef}
        tags={formData.tags || []}
        availableTags={availableTags}
        onChange={handleTagsChange}
        label="Tags"
        placeholder="Ajouter un tag..."
      />

      {/* Section Tags, Client, Source */}
      <Row>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-person-check me-2"></i>
              Client
            </Form.Label>
            <Form.Check
              type="checkbox"
              name="client"
              checked={formData.client || false}
              onChange={(e) => handleChange({
                target: {
                  name: 'client',
                  value: e.target.checked
                }
              })}
              label="Marquer comme client"
              className={styles.clientCheckbox}
            />
            <Form.Text className="text-muted">
              Cochez si c'est un client actuel ou potentiel.
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-signpost me-2"></i>
              Source
            </Form.Label>
            <Form.Control
              type="text"
              name="source"
              value={formData.source || ''}
              onChange={handleChange}
              placeholder="Ex: Recommandation, Site web, Réseau professionnel, Salon..."
              isInvalid={!!errors.source}
            />
            <Form.Control.Feedback type="invalid">
              {errors.source}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Indiquez d'où provient ce contact (recommandation, prospection, événement, etc.).
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
      
      {/* Section Dates - Affichage seulement */}
      <Row className={styles.datesSection}>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-calendar-plus me-2"></i>
              Date de création
            </Form.Label>
            <div className={styles.dateDisplay}>
              {isEditing && formData.createdAt ? (
                formatDate(formData.createdAt)
              ) : (
                <span className={styles.autoGenerated}>
                  Générée automatiquement à la sauvegarde
                </span>
              )}
            </div>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-pencil-square me-2"></i>
              Dernière modification
            </Form.Label>
            <div className={styles.dateDisplay}>
              {isEditing && formData.updatedAt ? (
                formatDate(formData.updatedAt)
              ) : (
                <span className={styles.autoGenerated}>
                  Mise à jour automatique à chaque sauvegarde
                </span>
              )}
            </div>
          </Form.Group>
        </Col>
      </Row>
      
      {/* Section informations de qualification */}
      <div className={styles.qualificationInfo}>
        <div className={styles.infoCard}>
          <i className="bi bi-info-circle"></i>
          <div className={styles.infoContent}>
            <strong>Qualification du contact</strong>
            <p>
              Cette section contient les informations de qualification et de traçabilité 
              du contact. Les dates sont gérées automatiquement par le système.
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
      title="Qualification"
      icon={<i className="bi bi-award"></i>}
      variant="success"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
});

export default ContactQualificationSection;