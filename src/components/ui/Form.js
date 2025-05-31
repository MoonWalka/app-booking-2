import React from 'react';
import PropTypes from 'prop-types';
import styles from './Form.module.css';

/**
 * Composants de formulaire standardisés TourCraft
 * Remplacement des composants Bootstrap Form
 */

// Form principal
export const Form = ({ 
  className = '', 
  children, 
  onSubmit,
  ...props 
}) => {
  const formClass = [
    styles.form,
    className
  ].filter(Boolean).join(' ');

  return (
    <form className={formClass} onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
};

Form.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onSubmit: PropTypes.func
};

// Form Group
export const FormGroup = ({ 
  className = '', 
  children, 
  ...props 
}) => {
  const groupClass = [
    styles.formGroup,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClass} {...props}>
      {children}
    </div>
  );
};

FormGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

// Form Control
export const FormControl = ({ 
  className = '', 
  type = 'text',
  ...props 
}) => {
  const controlClass = [
    styles.formControl,
    className
  ].filter(Boolean).join(' ');

  if (type === 'textarea') {
    return <textarea className={controlClass} {...props} />;
  }

  return <input className={controlClass} type={type} {...props} />;
};

FormControl.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string
};

// Form Label
export const FormLabel = ({ 
  className = '', 
  children, 
  ...props 
}) => {
  const labelClass = [
    styles.formLabel,
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={labelClass} {...props}>
      {children}
    </label>
  );
};

FormLabel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

// Form Text (aide)
export const FormText = ({ 
  className = '', 
  children, 
  muted = false,
  ...props 
}) => {
  const textClass = [
    styles.formText,
    muted ? styles.textMuted : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <small className={textClass} {...props}>
      {children}
    </small>
  );
};

FormText.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  muted: PropTypes.bool
};

// Exports par défaut pour compatibilité
export default Form;

// Ajout des sous-composants à Form
Form.Group = FormGroup;
Form.Control = FormControl;
Form.Label = FormLabel;
Form.Text = FormText;