import React from 'react';
import PropTypes from 'prop-types';
import styles from './FormField.module.css';

/**
 * Composant FormField standardisé TourCraft
 * Remplace les classes Bootstrap form-control, form-label, etc.
 * Suit les standards CSS TourCraft avec variables --tc-*
 * 
 * @param {Object} props - Props du composant
 * @returns {React.ReactElement} Le composant FormField rendu
 */
const FormField = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  id,
  name,
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}) => {
  const fieldId = id || name || `field-${Math.random().toString(36).substr(2, 9)}`;
  
  const fieldClasses = [
    styles.formField,
    styles[`formField--${size}`],
    styles[`formField--${variant}`],
    error ? styles['formField--error'] : '',
    disabled ? styles['formField--disabled'] : '',
    className
  ].filter(Boolean).join(' ');

  const renderInput = () => {
    const inputProps = {
      id: fieldId,
      name: name || fieldId,
      value,
      onChange,
      placeholder,
      required,
      disabled,
      className: fieldClasses,
      ...props
    };

    switch (type) {
      case 'textarea':
        return <textarea {...inputProps} />;
      case 'select':
        return (
          <select {...inputProps}>
            {props.children}
          </select>
        );
      default:
        return <input type={type} {...inputProps} />;
    }
  };

  return (
    <div className={styles.formFieldContainer}>
      {label && (
        <label htmlFor={fieldId} className={styles.formLabel}>
          {label}
          {required && <span className={styles.requiredIndicator}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {renderInput()}
        {error && (
          <div className={styles.errorMessage}>
            <i className="bi bi-exclamation-circle"></i>
            {error}
          </div>
        )}
      </div>
      
      {helpText && !error && (
        <div className={styles.helpText}>
          {helpText}
        </div>
      )}
    </div>
  );
};

FormField.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'textarea', 'select']),
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'outline', 'filled']),
  children: PropTypes.node
};

export default FormField; 