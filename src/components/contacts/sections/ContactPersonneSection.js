import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ContactPersonneSection.module.css';

/**
 * ContactPersonneSection - Section réutilisable pour les informations de personne
 * Utilisable pour Personne 1, 2 et 3 selon les spécifications
 */
const ContactPersonneSection = ({ 
  personneNumber = 1,
  formData, 
  handleChange, 
  errors,
  showCardWrapper = true 
}) => {
  
  // Générer les noms de champs basés sur le numéro de personne
  const getFieldName = (fieldBase) => {
    return personneNumber === 1 ? fieldBase : `${fieldBase}${personneNumber}`;
  };

  // Options de civilité
  const civiliteOptions = [
    { value: '', label: 'Sélectionner...' },
    { value: 'M.', label: 'Monsieur' },
    { value: 'Mme', label: 'Madame' },
    { value: 'Mlle', label: 'Mademoiselle' },
    { value: 'Dr', label: 'Docteur' },
    { value: 'Pr', label: 'Professeur' }
  ];

  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      {/* Civilité, Prénom, Nom */}
      <Row>
        <Col md={2}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-person-badge me-2"></i>
              Civilité
            </Form.Label>
            <Form.Select
              name={getFieldName('civilite')}
              value={formData[getFieldName('civilite')] || ''}
              onChange={handleChange}
              isInvalid={!!errors[getFieldName('civilite')]}
            >
              {civiliteOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('civilite')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-person me-2"></i>
              Prénom
            </Form.Label>
            <Form.Control
              type="text"
              name={getFieldName('prenom')}
              value={formData[getFieldName('prenom')] || ''}
              onChange={handleChange}
              placeholder="Prénom de la personne"
              isInvalid={!!errors[getFieldName('prenom')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('prenom')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-person me-2"></i>
              Nom
            </Form.Label>
            <Form.Control
              type="text"
              name={getFieldName('nom')}
              value={formData[getFieldName('nom')] || ''}
              onChange={handleChange}
              placeholder="Nom de famille"
              isInvalid={!!errors[getFieldName('nom')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('nom')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Prénom Nom (calculé) et Fonction */}
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-person-lines-fill me-2"></i>
              Prénom Nom
            </Form.Label>
            <Form.Control
              type="text"
              name={getFieldName('prenomNom')}
              value={formData[getFieldName('prenomNom')] || `${formData[getFieldName('prenom')] || ''} ${formData[getFieldName('nom')] || ''}`.trim()}
              onChange={handleChange}
              placeholder="Nom complet"
              className={styles.calculatedField}
              isInvalid={!!errors[getFieldName('prenomNom')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('prenomNom')]}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Se remplit automatiquement avec Prénom + Nom
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-briefcase me-2"></i>
              Fonction
            </Form.Label>
            <Form.Control
              type="text"
              name={getFieldName('fonction')}
              value={formData[getFieldName('fonction')] || ''}
              onChange={handleChange}
              placeholder="Directeur, Programmateur, Assistant..."
              isInvalid={!!errors[getFieldName('fonction')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('fonction')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Téléphones */}
      <Row>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-telephone me-2"></i>
              Tél. direct
            </Form.Label>
            <Form.Control
              type="tel"
              name={getFieldName('telDirect')}
              value={formData[getFieldName('telDirect')] || ''}
              onChange={handleChange}
              placeholder="01 23 45 67 89"
              isInvalid={!!errors[getFieldName('telDirect')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('telDirect')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-house-door me-2"></i>
              Tél. perso
            </Form.Label>
            <Form.Control
              type="tel"
              name={getFieldName('telPerso')}
              value={formData[getFieldName('telPerso')] || ''}
              onChange={handleChange}
              placeholder="01 23 45 67 89"
              isInvalid={!!errors[getFieldName('telPerso')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('telPerso')]}
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
              name={getFieldName('mobile')}
              value={formData[getFieldName('mobile')] || ''}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
              isInvalid={!!errors[getFieldName('mobile')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('mobile')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Emails et Fax */}
      <Row>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-envelope me-2"></i>
              Mail direct
            </Form.Label>
            <Form.Control
              type="email"
              name={getFieldName('mailDirect')}
              value={formData[getFieldName('mailDirect')] || ''}
              onChange={handleChange}
              placeholder="prenom.nom@entreprise.com"
              isInvalid={!!errors[getFieldName('mailDirect')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('mailDirect')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-house-door me-2"></i>
              Mail perso
            </Form.Label>
            <Form.Control
              type="email"
              name={getFieldName('mailPerso')}
              value={formData[getFieldName('mailPerso')] || ''}
              onChange={handleChange}
              placeholder="prenom.nom@gmail.com"
              isInvalid={!!errors[getFieldName('mailPerso')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('mailPerso')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-printer me-2"></i>
              Fax
            </Form.Label>
            <Form.Control
              type="tel"
              name={getFieldName('fax')}
              value={formData[getFieldName('fax')] || ''}
              onChange={handleChange}
              placeholder="01 23 45 67 89"
              isInvalid={!!errors[getFieldName('fax')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('fax')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Site personnel */}
      <Form.Group className={styles.formGroup}>
        <Form.Label className={styles.formLabel}>
          <i className="bi bi-globe2 me-2"></i>
          Site
        </Form.Label>
        <Form.Control
          type="url"
          name={getFieldName('site')}
          value={formData[getFieldName('site')] || ''}
          onChange={handleChange}
          placeholder="https://www.site-personnel.com"
          isInvalid={!!errors[getFieldName('site')]}
        />
        <Form.Control.Feedback type="invalid">
          {errors[getFieldName('site')]}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Adresse personnelle */}
      <Row>
        <Col md={8}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-geo-alt me-2"></i>
              Adresse
            </Form.Label>
            <Form.Control
              type="text"
              name={getFieldName('adresse')}
              value={formData[getFieldName('adresse')] || ''}
              onChange={handleChange}
              placeholder="Numéro et nom de rue"
              isInvalid={!!errors[getFieldName('adresse')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('adresse')]}
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
              name={getFieldName('suiteAdresse1')}
              value={formData[getFieldName('suiteAdresse1')] || ''}
              onChange={handleChange}
              placeholder="Bâtiment, étage..."
              isInvalid={!!errors[getFieldName('suiteAdresse1')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('suiteAdresse1')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Code postal, Ville, Région */}
      <Row>
        <Col md={3}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-mailbox me-2"></i>
              Code postal
            </Form.Label>
            <Form.Control
              type="text"
              name={getFieldName('codePostal')}
              value={formData[getFieldName('codePostal')] || ''}
              onChange={handleChange}
              placeholder="75001"
              maxLength={5}
              isInvalid={!!errors[getFieldName('codePostal')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('codePostal')]}
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
              name={getFieldName('ville')}
              value={formData[getFieldName('ville')] || ''}
              onChange={handleChange}
              placeholder="Paris"
              isInvalid={!!errors[getFieldName('ville')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('ville')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-geo-alt-fill me-2"></i>
              Région
            </Form.Label>
            <Form.Control
              type="text"
              name={getFieldName('region')}
              value={formData[getFieldName('region')] || ''}
              onChange={handleChange}
              placeholder="Île-de-France"
              isInvalid={!!errors[getFieldName('region')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('region')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Province et Pays */}
      <Row>
        <Col md={6}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <i className="bi bi-map me-2"></i>
              Province
            </Form.Label>
            <Form.Control
              type="text"
              name={getFieldName('province')}
              value={formData[getFieldName('province')] || ''}
              onChange={handleChange}
              placeholder="Province (pour l'international)"
              isInvalid={!!errors[getFieldName('province')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('province')]}
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
              name={getFieldName('pays')}
              value={formData[getFieldName('pays')] || 'France'}
              onChange={handleChange}
              placeholder="France"
              isInvalid={!!errors[getFieldName('pays')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('pays')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

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
              name={getFieldName('commentaires1')}
              value={formData[getFieldName('commentaires1')] || ''}
              onChange={handleChange}
              placeholder="Commentaires généraux..."
              isInvalid={!!errors[getFieldName('commentaires1')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('commentaires1')]}
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
              name={getFieldName('commentaires2')}
              value={formData[getFieldName('commentaires2')] || ''}
              onChange={handleChange}
              placeholder="Commentaires personnels..."
              isInvalid={!!errors[getFieldName('commentaires2')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('commentaires2')]}
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
              name={getFieldName('commentaires3')}
              value={formData[getFieldName('commentaires3')] || ''}
              onChange={handleChange}
              placeholder="Commentaires professionnels..."
              isInvalid={!!errors[getFieldName('commentaires3')]}
            />
            <Form.Control.Feedback type="invalid">
              {errors[getFieldName('commentaires3')]}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Section informations */}
      <div className={styles.personneInfo}>
        <div className={styles.infoCard}>
          <i className="bi bi-person-circle"></i>
          <div className={styles.infoContent}>
            <strong>Informations de la personne {personneNumber}</strong>
            <p>
              Cette section contient toutes les informations personnelles et professionnelles 
              de la personne : contacts directs, adresse personnelle et commentaires organisés.
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
      title={`Personne ${personneNumber}`}
      icon={<i className="bi bi-person-circle"></i>}
      variant="info"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default ContactPersonneSection;