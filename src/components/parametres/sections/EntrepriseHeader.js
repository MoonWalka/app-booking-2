import React from 'react';
import styles from './EntrepriseHeader.module.css';

/**
 * Header component for Enterprise settings page
 * @param {Object} props - Component props
 * @param {string} props.success - Success message to display
 */
const EntrepriseHeader = ({ success }) => {
  return (
    <>
      <h3 className={styles.headerTitle}>Company Information</h3>
      <p className={styles.headerDescription}>This information will appear in the headers and footers of generated contracts.</p>
      
      {success && (
        <div className={`alert alert-success ${styles.successAlert}`} role="alert">
          {success}
        </div>
      )}
    </>
  );
};

export default EntrepriseHeader;