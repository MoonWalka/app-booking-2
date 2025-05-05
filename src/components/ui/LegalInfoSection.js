import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';
import styles from './LegalInfoSection.module.css';

/**
 * Composant générique pour afficher/éditer des informations légales
 * Ce composant remplace ProgrammateurLegalSection et EntrepriseLegalSection
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.data - Données à afficher/éditer
 * @param {Function} props.onChange - Fonction appelée lors du changement des données
 * @param {boolean} props.isEditing - Mode édition (true) ou visualisation (false)
 * @param {Function} props.formatValue - Fonction pour formater les valeurs en mode visualisation
 * @param {Object} props.fieldMapping - Mapping des champs (nom standard -> chemin dans data)
 * @param {Object} props.labels - Labels personnalisés pour les champs
 * @param {Object} props.errors - Erreurs de validation par champ
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.notificationVisible - Afficher une notification de succès
 * @param {string} props.notificationText - Texte de la notification
 */
const LegalInfoSection = ({ 
  data = {},
  onChange = () => {},
  isEditing = false,
  formatValue = val => val || 'Non spécifié',
  fieldMapping = {
    companyName: 'raisonSociale',
    type: 'type',
    address: 'adresse',
    zipCode: 'codePostal',
    city: 'ville',
    country: 'pays',
    siret: 'siret',
    vat: 'tva'
  },
  labels = {
    companyName: 'Raison sociale',
    type: 'Type de structure',
    address: 'Adresse',
    zipCode: 'Code postal',
    city: 'Ville',
    country: 'Pays',
    siret: 'SIRET',
    vat: 'TVA Intracommunautaire'
  },
  errors = {},
  className = '',
  notificationVisible = false,
  notificationText = 'Informations enregistrées avec succès',
  title = 'Informations légales',
  icon = 'bi-building'
}) => {
  // Helper pour accéder aux données avec un chemin (ex: "structure.raisonSociale")
  const getNestedValue = (obj, path) => {
    if (!path) return undefined;
    const pathParts = path.split('.');
    let value = obj;
    
    for (const part of pathParts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }
    
    return value;
  };
  
  // Helper pour gérer les changements dans les champs du formulaire
  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value }});
  };
  
  // Options pour les types de structure
  const structureTypes = [
    { value: '', label: 'Sélectionner un type' },
    { value: 'association', label: 'Association' },
    { value: 'sarl', label: 'SARL' },
    { value: 'eurl', label: 'EURL' },
    { value: 'sas', label: 'SAS' },
    { value: 'collectivite', label: 'Collectivité territoriale' },
    { value: 'autre', label: 'Autre' }
  ];
  
  return (
    <div className={`${styles.legalInfoSection} ${className}`}>
      {/* En-tête de section avec titre et icône */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitle}>
          <i className={`bi ${icon} ${styles.headerIcon}`}></i>
          <h5 className="mb-0">{title}</h5>
        </div>
      </div>
      
      {/* Notification de succès */}
      {notificationVisible && (
        <div className="alert alert-success mb-3" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {notificationText}
        </div>
      )}
      
      <div className={styles.sectionContent}>
        {isEditing ? (
          // Mode édition
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor={`input-${fieldMapping.companyName}`}>
                    {labels.companyName}
                  </Form.Label>
                  <Form.Control
                    id={`input-${fieldMapping.companyName}`}
                    name={fieldMapping.companyName}
                    type="text"
                    value={getNestedValue(data, fieldMapping.companyName) || ''}
                    onChange={handleNestedChange}
                    placeholder={labels.companyName}
                    isInvalid={!!errors[fieldMapping.companyName]}
                  />
                  {errors[fieldMapping.companyName] && (
                    <Form.Control.Feedback type="invalid">
                      {errors[fieldMapping.companyName]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor={`input-${fieldMapping.type}`}>
                    {labels.type}
                  </Form.Label>
                  <Form.Select
                    id={`input-${fieldMapping.type}`}
                    name={fieldMapping.type}
                    value={getNestedValue(data, fieldMapping.type) || ''}
                    onChange={handleNestedChange}
                    isInvalid={!!errors[fieldMapping.type]}
                  >
                    {structureTypes.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  {errors[fieldMapping.type] && (
                    <Form.Control.Feedback type="invalid">
                      {errors[fieldMapping.type]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label htmlFor={`input-${fieldMapping.address}`}>
                {labels.address}
              </Form.Label>
              <Form.Control
                id={`input-${fieldMapping.address}`}
                name={fieldMapping.address}
                type="text"
                value={getNestedValue(data, fieldMapping.address) || ''}
                onChange={handleNestedChange}
                placeholder={labels.address}
                isInvalid={!!errors[fieldMapping.address]}
              />
              {errors[fieldMapping.address] && (
                <Form.Control.Feedback type="invalid">
                  {errors[fieldMapping.address]}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label htmlFor={`input-${fieldMapping.zipCode}`}>
                    {labels.zipCode}
                  </Form.Label>
                  <Form.Control
                    id={`input-${fieldMapping.zipCode}`}
                    name={fieldMapping.zipCode}
                    type="text"
                    value={getNestedValue(data, fieldMapping.zipCode) || ''}
                    onChange={handleNestedChange}
                    placeholder={labels.zipCode}
                    isInvalid={!!errors[fieldMapping.zipCode]}
                  />
                  {errors[fieldMapping.zipCode] && (
                    <Form.Control.Feedback type="invalid">
                      {errors[fieldMapping.zipCode]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group>
                  <Form.Label htmlFor={`input-${fieldMapping.city}`}>
                    {labels.city}
                  </Form.Label>
                  <Form.Control
                    id={`input-${fieldMapping.city}`}
                    name={fieldMapping.city}
                    type="text"
                    value={getNestedValue(data, fieldMapping.city) || ''}
                    onChange={handleNestedChange}
                    placeholder={labels.city}
                    isInvalid={!!errors[fieldMapping.city]}
                  />
                  {errors[fieldMapping.city] && (
                    <Form.Control.Feedback type="invalid">
                      {errors[fieldMapping.city]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor={`input-${fieldMapping.country}`}>
                    {labels.country}
                  </Form.Label>
                  <Form.Control
                    id={`input-${fieldMapping.country}`}
                    name={fieldMapping.country}
                    type="text"
                    value={getNestedValue(data, fieldMapping.country) || 'France'}
                    onChange={handleNestedChange}
                    placeholder={labels.country}
                    isInvalid={!!errors[fieldMapping.country]}
                  />
                  {errors[fieldMapping.country] && (
                    <Form.Control.Feedback type="invalid">
                      {errors[fieldMapping.country]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor={`input-${fieldMapping.siret}`}>
                    {labels.siret}
                  </Form.Label>
                  <Form.Control
                    id={`input-${fieldMapping.siret}`}
                    name={fieldMapping.siret}
                    type="text"
                    value={getNestedValue(data, fieldMapping.siret) || ''}
                    onChange={handleNestedChange}
                    placeholder={labels.siret}
                    isInvalid={!!errors[fieldMapping.siret]}
                  />
                  {errors[fieldMapping.siret] && (
                    <Form.Control.Feedback type="invalid">
                      {errors[fieldMapping.siret]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label htmlFor={`input-${fieldMapping.vat}`}>
                    {labels.vat}
                  </Form.Label>
                  <Form.Control
                    id={`input-${fieldMapping.vat}`}
                    name={fieldMapping.vat}
                    type="text"
                    value={getNestedValue(data, fieldMapping.vat) || ''}
                    onChange={handleNestedChange}
                    placeholder={labels.vat}
                    isInvalid={!!errors[fieldMapping.vat]}
                  />
                  {errors[fieldMapping.vat] && (
                    <Form.Control.Feedback type="invalid">
                      {errors[fieldMapping.vat]}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        ) : (
          // Mode visualisation
          <div className={styles.infoGrid}>
            {getNestedValue(data, fieldMapping.companyName) && (
              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>{labels.companyName}</div>
                <div className={styles.infoValue}>
                  {formatValue(getNestedValue(data, fieldMapping.companyName))}
                </div>
              </div>
            )}
            
            {getNestedValue(data, fieldMapping.type) && (
              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>{labels.type}</div>
                <div className={styles.infoValue}>
                  {formatValue(getNestedValue(data, fieldMapping.type))}
                </div>
              </div>
            )}
            
            {getNestedValue(data, fieldMapping.address) && (
              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>{labels.address}</div>
                <div className={styles.infoValue}>
                  {formatValue(getNestedValue(data, fieldMapping.address))}
                </div>
              </div>
            )}
            
            {(getNestedValue(data, fieldMapping.zipCode) || getNestedValue(data, fieldMapping.city)) && (
              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>{`${labels.zipCode} / ${labels.city}`}</div>
                <div className={styles.infoValue}>
                  {formatValue(getNestedValue(data, fieldMapping.zipCode))} {formatValue(getNestedValue(data, fieldMapping.city))}
                </div>
              </div>
            )}
            
            {getNestedValue(data, fieldMapping.country) && (
              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>{labels.country}</div>
                <div className={styles.infoValue}>
                  {formatValue(getNestedValue(data, fieldMapping.country))}
                </div>
              </div>
            )}
            
            {getNestedValue(data, fieldMapping.siret) && (
              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>{labels.siret}</div>
                <div className={styles.infoValue}>
                  {formatValue(getNestedValue(data, fieldMapping.siret))}
                </div>
              </div>
            )}
            
            {getNestedValue(data, fieldMapping.vat) && (
              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>{labels.vat}</div>
                <div className={styles.infoValue}>
                  {formatValue(getNestedValue(data, fieldMapping.vat))}
                </div>
              </div>
            )}
            
            {/* Message si aucune donnée n'est disponible */}
            {!getNestedValue(data, fieldMapping.companyName) && 
             !getNestedValue(data, fieldMapping.siret) && 
             !getNestedValue(data, fieldMapping.address) && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Aucune information légale disponible
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

LegalInfoSection.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func,
  isEditing: PropTypes.bool,
  formatValue: PropTypes.func,
  fieldMapping: PropTypes.object,
  labels: PropTypes.object,
  errors: PropTypes.object,
  className: PropTypes.string,
  notificationVisible: PropTypes.bool,
  notificationText: PropTypes.string,
  title: PropTypes.string,
  icon: PropTypes.string
};

export default LegalInfoSection;