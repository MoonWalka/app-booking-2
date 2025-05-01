import React from 'react';
import { Card } from 'react-bootstrap';
import styles from './EntrepriseHeader.module.css';

/**
 * Header component for Enterprise settings page
 * @param {Object} props - Component props
 * @param {string} props.success - Success message to display
 */
const EntrepriseHeader = ({ success }) => {
  return (
    <>
      <h3 className="mb-3">Company Information</h3>
      <p className="text-muted">This information will appear in the headers and footers of generated contracts.</p>
      
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}
    </>
  );
};

export default EntrepriseHeader;