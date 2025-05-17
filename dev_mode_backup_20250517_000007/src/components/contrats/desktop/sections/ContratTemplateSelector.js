// src/components/contrats/desktop/sections/ContratTemplateSelector.js
import React from 'react';
import { Form } from 'react-bootstrap';
import styles from './ContratTemplateSelector.module.css';

const ContratTemplateSelector = ({ 
  templates, 
  selectedTemplateId, 
  handleTemplateChange,
  disabled
}) => {
  return (
    <Form className={styles.selectorContainer}>
      <Form.Group className="mb-3">
        <Form.Label>Sélectionnez un modèle de contrat:</Form.Label>
        <Form.Select
          value={selectedTemplateId}
          onChange={handleTemplateChange}
          disabled={disabled}
        >
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name} {template.isDefault ? '(par défaut)' : ''}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </Form>
  );
};

export default ContratTemplateSelector;