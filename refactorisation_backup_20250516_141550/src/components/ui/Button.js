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
 * @param {ReactNode} [props.icon] - Icône à afficher dans le bouton
 * @param {string} [props.iconPosition='left'] - Position de l'icône ('left' ou 'right')
 * @param {boolean} [props.iconOnly=false] - Si le bouton ne contient qu'une icône
 * @param {string} [props.tooltip=''] - Texte de l'infobulle à afficher (pour les boutons avec icône uniquement)
 */
const Button = ({
  variant = 'primary',
  size = '',
  className = '',
  children,
  onClick,
  type = 'button',
  disabled = false,
  icon = null,
  iconPosition = 'left',
  iconOnly = false,
  tooltip = '',
  ...rest
}) => {
  // Déterminer les classes CSS à appliquer
  const buttonClasses = [
    styles.btn,
    styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    size ? styles[`btn${size.charAt(0).toUpperCase() + size.slice(1)}`] : '',
    iconOnly ? styles.iconOnly : '',
    className
  ].filter(Boolean).join(' ');

  // Préparer le contenu du bouton avec l'icône si nécessaire
  const buttonContent = iconOnly ? (
    icon
  ) : icon ? (
    <span className={styles.buttonContent}>
      {iconPosition === 'left' && (
        <span className={styles.iconWrapper}>
          {icon}
        </span>
      )}
      <span className={styles.textContent}>{children}</span>
      {iconPosition === 'right' && (
        <span className={styles.iconWrapper}>
          {icon}
        </span>
      )}
    </span>
  ) : (
    children
  );

  // Si une infobulle est fournie et que c'est un bouton avec icône uniquement
  if (tooltip && iconOnly) {
    // Importer dynamiquement react-bootstrap pour éviter les problèmes de dépendances
    const { OverlayTrigger, Tooltip } = require('react-bootstrap');
    
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{tooltip}</Tooltip>}
      >
        <button
          type={type}
          className={buttonClasses}
          onClick={onClick}
          disabled={disabled}
          {...rest}
        >
          {buttonContent}
        </button>
      </OverlayTrigger>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {buttonContent}
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
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  iconOnly: PropTypes.bool,
  tooltip: PropTypes.string
};

export default Button;