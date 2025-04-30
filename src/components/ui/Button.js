import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

/**
 * Composant Button générique personnalisé
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.variant='primary'] - Variante du bouton (primary, secondary, etc.)
 * @param {string} [props.size=''] - Taille du bouton (sm, lg, etc.)
 * @param {string} [props.className=''] - Classes CSS additionnelles
 * @param {ReactNode} props.children - Contenu du bouton
 * @param {Function} [props.onClick] - Fonction appelée au clic
 * @param {string} [props.type='button'] - Type du bouton (button, submit, reset)
 * @param {boolean} [props.disabled=false] - Si le bouton est désactivé
 */
const Button = ({
  variant = 'primary',
  size = '',
  className = '',
  children,
  onClick,
  type = 'button',
  disabled = false,
  ...rest
}) => {
  // Déterminer les classes CSS à appliquer
  const buttonClasses = [
    styles.btn,
    styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    size ? `btn-${size}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool
};

export default Button;