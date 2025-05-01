import React from 'react';
import styles from './FormContentWrapper.module.css';

/**
 * Wrapper component for form content sections
 * Provides consistent styling for form content blocks
 */
const FormContentWrapper = ({ 
  title, 
  subtitle,
  children, 
  className = ''
}) => {
  return (
    <div className={`${styles.formContainer} card ${className}`}>
      <div className="card-header">
        <h3>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default FormContentWrapper;