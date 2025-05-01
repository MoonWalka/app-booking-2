import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import styles from './LieuInfoSection.module.css';

/**
 * LieuInfoSection - Section d'informations sur le lieu associé au programmateur
 * Permet de gérer les informations de base sur la salle (jauge, adresse, etc.)
 */
const LieuInfoSection = ({ 
  formData, 
  handleChange, 
  errors, 
  lieuxOptions,
  setShowLieuModal
}) => {
  return (
    <div className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <i className="bi bi-geo-alt"></i>
        </div>
        <h3>Informations sur le lieu</h3>
        <Button 
          variant="link" 
          className={styles.addButton}
          onClick={() => setShowLieuModal(true)}
        >
          <i className="bi bi-plus-circle"></i> Ajouter un lieu
        </Button>
      </div>
      
      <div className={styles.cardBody}>
        <Form.Group className={styles.formGroup}>
          <Form.Label className={styles.formLabel}>
            Lieu associé
          </Form.Label>
          <Form.Select
            name="lieuId"
            value={formData.lieuId || ''}
            onChange={handleChange}
            isInvalid={errors.lieuId}
          >
            <option value="">Sélectionner un lieu</option>
            {lieuxOptions.map(lieu => (
              <option key={lieu.id} value={lieu.id}>
                {lieu.nom} - {lieu.ville}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.lieuId}
          </Form.Control.Feedback>
        </Form.Group>
        
        {formData.lieuId && (
          <>
            <div className={styles.lieuSection}>
              <h4 className={styles.sectionTitle}>Informations complémentaires sur le lieu</h4>
              
              <Row>
                <Col md={6}>
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>
                      Site web
                    </Form.Label>
                    <Form.Control
                      type="url"
                      name="lieu.siteWeb"
                      value={formData.lieu?.siteWeb || ''}
                      onChange={handleChange}
                      placeholder="https://www.example.com"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>
                      Jauge
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="lieu.jauge"
                      value={formData.lieu?.jauge || ''}
                      onChange={handleChange}
                      placeholder="Ex: 500"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>
                      Type de lieu
                    </Form.Label>
                    <Form.Select
                      name="lieu.type"
                      value={formData.lieu?.type || ''}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="Salle de concert">Salle de concert</option>
                      <option value="Théâtre">Théâtre</option>
                      <option value="MJC">MJC</option>
                      <option value="Centre culturel">Centre culturel</option>
                      <option value="Café-concert">Café-concert</option>
                      <option value="Festival">Festival</option>
                      <option value="Plein air">Plein air</option>
                      <option value="Autre">Autre</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>
                      Accueil handicap
                    </Form.Label>
                    <Form.Select
                      name="lieu.accessibilite"
                      value={formData.lieu?.accessibilite || ''}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Oui">Oui</option>
                      <option value="Partiel">Partiel</option>
                      <option value="Non">Non</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  Notes sur le lieu
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="lieu.notes"
                  value={formData.lieu?.notes || ''}
                  onChange={handleChange}
                  placeholder="Informations complémentaires sur le lieu"
                />
              </Form.Group>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LieuInfoSection;
