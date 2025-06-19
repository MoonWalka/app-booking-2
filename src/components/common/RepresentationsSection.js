import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import styles from './RepresentationsSection.module.css';

/**
 * Composant commun pour la section Représentations
 * Utilisé dans PreContratGenerator et ContratGeneratorNew
 */
const RepresentationsSection = ({ data, onChange, readOnly = false }) => {
  const [editingField, setEditingField] = useState(null);

  const handleFieldClick = (fieldName) => {
    if (!readOnly) {
      setEditingField(fieldName);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    onChange(fieldName, value);
  };

  const handleFieldBlur = () => {
    setEditingField(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setEditingField(null);
    }
  };

  const renderField = (label, fieldName, value, type = 'text') => {
    const isEditing = editingField === fieldName;
    
    return (
      <div className={styles.summaryField}>
        <span className={styles.summaryLabel}>{label}</span>
        {isEditing ? (
          <Form.Control
            type={type}
            value={value || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            onBlur={handleFieldBlur}
            onKeyPress={handleKeyPress}
            className={styles.inlineInput}
            autoFocus
          />
        ) : (
          <span 
            className={`${styles.summaryValue} ${!readOnly ? styles.clickable : ''}`}
            onClick={() => handleFieldClick(fieldName)}
          >
            {type === 'date' && value 
              ? new Date(value).toLocaleDateString('fr-FR')
              : value || '●'}
          </span>
        )}
      </div>
    );
  };

  const renderSelectField = (label, fieldName, value, options) => {
    const isEditing = editingField === fieldName;
    
    return (
      <div className={styles.summaryField}>
        <span className={styles.summaryLabel}>{label}</span>
        {isEditing ? (
          <Form.Select
            value={value ? 'Oui' : 'Non'}
            onChange={(e) => {
              handleFieldChange(fieldName, e.target.value === 'Oui');
              setEditingField(null);
            }}
            onBlur={handleFieldBlur}
            className={styles.inlineInput}
            autoFocus
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Form.Select>
        ) : (
          <span 
            className={`${styles.summaryValue} ${!readOnly ? styles.clickable : ''}`}
            onClick={() => handleFieldClick(fieldName)}
          >
            {value ? 'Oui' : 'Non'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.representationsTable}>
      <Row>
        <Col md={6}>
          {renderField('Début :', 'debut', data.debut, 'date')}
          {renderField('Fin :', 'fin', data.fin, 'date')}
          {renderField('Représentation :', 'representation', data.representation)}
          {renderField('Invitations :', 'invitations', data.invitations, 'number')}
          {renderField('Nb. admins :', 'nbAdmins', data.nbAdmins, 'number')}
          {renderField('Salle :', 'salle', data.salle)}
        </Col>
        <Col md={6}>
          {renderField('Horaire début :', 'horaireDebut', data.horaireDebut, 'time')}
          {renderField('Horaire fin :', 'horaireFin', data.horaireFin, 'time')}
          {renderSelectField('Payant :', 'payant', data.payant, ['Oui', 'Non'])}
          {renderField('Nb. représentations :', 'nbRepresentations', data.nbRepresentations, 'number')}
          {renderField('Capacité :', 'capacite', data.capacite, 'number')}
          {renderField('Type :', 'type', data.type)}
        </Col>
      </Row>
    </div>
  );
};

export default RepresentationsSection;