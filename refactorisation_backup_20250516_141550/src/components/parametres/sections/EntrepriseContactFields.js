import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import styles from './EntrepriseContactFields.module.css';

/**
 * Component for contact information fields
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleChange - Function to handle input changes
 */
const EntrepriseContactFields = ({ formData, handleChange }) => {
  return (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              name="telephone"
              value={formData.telephone || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-3">
        <Form.Label>Website</Form.Label>
        <Form.Control
          type="text"
          name="siteWeb"
          value={formData.siteWeb || ''}
          onChange={handleChange}
        />
      </Form.Group>
    </>
  );
};

export default EntrepriseContactFields;