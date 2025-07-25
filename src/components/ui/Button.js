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
  iconStart = null,
  iconPosition = 'left',
  iconOnly = false,
  tooltip = '',
  ...rest
}) => {
  // ✅ CORRECTION: Utiliser iconStart comme alias de icon s'il est fourni
  const finalIcon = iconStart || icon;
  
  // ✅ CORRECTION: Exclure iconStart des props DOM
  const { iconStart: excludedIconStart, ...domProps } = rest;

  // Fonction pour convertir correctement les noms de variantes contenant des tirets en noms de classes CSS
  const getVariantClassName = (variant) => {
    if (variant.includes('-')) {
      // Pour les variantes comme "outline-warning", "outline-info", etc.
      const parts = variant.split('-');
      return `btn${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`;
    }
    // Pour les variantes simples comme "primary", "secondary", etc.
    return `btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`;
  };

  // Déterminer les classes CSS à appliquer
  const buttonClasses = [
    styles.btn,
    styles[getVariantClassName(variant)],
    size ? styles[`btn${size.charAt(0).toUpperCase() + size.slice(1)}`] : '',
    iconOnly ? styles.iconOnly : '',
    className
  ].filter(Boolean).join(' ');

  // Préparer le contenu du bouton avec l'icône si nécessaire
  const buttonContent = iconOnly ? (
    finalIcon
  ) : finalIcon ? (
    <span className={styles.buttonContent}>
      {iconPosition === 'left' && (
        <span className={styles.iconWrapper}>
          {finalIcon}
        </span>
      )}
      <span className={styles.textContent}>{children}</span>
      {iconPosition === 'right' && (
        <span className={styles.iconWrapper}>
          {finalIcon}
        </span>
      )}
    </span>
  ) : (
    children
  );

  // Si une infobulle est fournie et que c'est un bouton avec icône uniquement
  if (tooltip && iconOnly) {
    return (
      <div className={styles.tooltipWrapper} title={tooltip}>
        <button
          type={type}
          className={buttonClasses}
          onClick={(e) => {
            if (onClick) onClick(e);
          }}
          disabled={disabled}
          {...domProps}
        >
          {buttonContent}
        </button>
      </div>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      disabled={disabled}
      {...domProps}
    >
      {buttonContent}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconStart: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  iconOnly: PropTypes.bool,
  tooltip: PropTypes.string
};

export default Button;