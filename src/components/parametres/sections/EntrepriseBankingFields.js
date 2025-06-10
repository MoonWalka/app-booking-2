import React from 'react';
import styles from './EntrepriseBankingFields.module.css';

/**
 * Component for banking information fields
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @param {Function} props.handleChange - Function to handle input changes
 */
const EntrepriseBankingFields = ({ formData, handleChange }) => {
  return (
    <div className={styles.bankingFieldsContainer}>
      <h3 className={styles.sectionTitle}>Informations bancaires</h3>
      
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>IBAN</label>
        <input
          type="text"
          name="iban"
          value={formData.iban || ''}
          onChange={handleChange}
          placeholder="FR76 1234 5678 9012 3456 7890 123"
          className={styles.fieldInput}
        />
        <small className={styles.fieldHelp}>
          International Bank Account Number
        </small>
      </div>
      
      <div className={styles.fieldsRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>BIC</label>
          <input
            type="text"
            name="bic"
            value={formData.bic || ''}
            onChange={handleChange}
            placeholder="BNPAFRPP"
            className={styles.fieldInput}
          />
          <small className={styles.fieldHelp}>
            Bank Identifier Code
          </small>
        </div>
        
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Nom de la banque</label>
          <input
            type="text"
            name="banque"
            value={formData.banque || ''}
            onChange={handleChange}
            placeholder="BNP Paribas"
            className={styles.fieldInput}
          />
        </div>
      </div>
    </div>
  );
};

export default EntrepriseBankingFields;