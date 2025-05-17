import React from 'react';
import styles from './FormPageHeader.module.css';

/**
 * Header component for form pages
 */
const FormPageHeader = ({ title, subtitle }) => {
  return (
    <div className={styles.header}>
      <h1>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

export default FormPageHeader;