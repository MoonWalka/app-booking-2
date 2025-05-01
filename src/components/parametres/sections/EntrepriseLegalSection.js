import React from 'react';
import { Form } from 'react-bootstrap';
import styles from './EntrepriseLegalSection.module.css';

/**
 * Component for legal mentions/information
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleChange - Function to handle input changes
 */
const EntrepriseLegalSection = ({ formData, handleChange }) => {
  return (
    <div className="mt-4">
      <h5 className={styles.sectionTitle}>Legal Information</h5>
      
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>SIRET</Form.Label>
            <Form.Control
              type="text"
              name="siret"
              value={formData.siret || ''}
              onChange={handleChange}
              maxLength={14}
            />
            <Form.Text className="text-muted">
              Company identification number (14 digits)
            </Form.Text>
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>APE Code</Form.Label>
            <Form.Control
              type="text"
              name="codeAPE"
              value={formData.codeAPE || ''}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Business activity code
            </Form.Text>
          </Form.Group>
        </div>
      </div>
      
      <Form.Group className="mb-3">
        <Form.Label>Legal Notices</Form.Label>
        <Form.Control
          as="textarea"
          name="mentionsLegales"
          value={formData.mentionsLegales || ''}
          onChange={handleChange}
          rows={4}
          className={styles.legalTextarea}
        />
        <Form.Text className="text-muted">
          This text will appear in the footer of your documents and contracts
        </Form.Text>
      </Form.Group>
    </div>
  );
};

export default EntrepriseLegalSection;