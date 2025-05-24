import React from 'react';
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
    <div className={styles.contactFieldsContainer}>
      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Phone</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone || ''}
            onChange={handleChange}
            className={styles.fieldInput}
          />
        </div>
        
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className={styles.fieldInput}
          />
        </div>
      </div>
      
      <div className={`${styles.fieldGroup} ${styles.fullWidthField}`}>
        <label className={styles.fieldLabel}>Website</label>
        <input
          type="text"
          name="siteWeb"
          value={formData.siteWeb || ''}
          onChange={handleChange}
          className={styles.fieldInput}
        />
      </div>
    </div>
  );
};

export default EntrepriseContactFields;