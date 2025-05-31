import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ButtonMigrated.module.css';

/**
 * Composant Button migré vers le nouveau système de design unifié
 * Plus aucune dépendance à react-bootstrap
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.variant='primary'] - Variante du bouton (primary, secondary, danger, success, warning, info, light, dark, link)
 * @param {string} [props.size='md'] - Taille du bouton (sm, md, lg)
 * @param {string} [props.className=''] - Classes CSS additionnelles
 * @param {ReactNode} props.children - Contenu du bouton
 * @param {Function} [props.onClick] - Fonction appelée au clic
 * @param {string} [props.type='button'] - Type du bouton (button, submit, reset)
 * @param {boolean} [props.disabled=false] - Si le bouton est désactivé
 * @param {ReactNode} [props.icon] - Icône à afficher dans le bouton
 * @param {ReactNode} [props.iconStart] - Alias pour icon (compatibilité)
 * @param {string} [props.iconPosition='left'] - Position de l'icône ('left' ou 'right')
 * @param {boolean} [props.iconOnly=false] - Si le bouton ne contient qu'une icône
 * @param {string} [props.tooltip=''] - Texte de l'infobulle (implémenté sans react-bootstrap)
 * @param {boolean} [props.fullWidth=false] - Si le bouton prend toute la largeur
 * @param {boolean} [props.loading=false] - État de chargement
 * @param {string} [props.as='button'] - Type d'élément HTML à rendre
 * @param {string} [props.href] - URL si as='a'
 */
const ButtonMigrated = ({
  variant = 'primary',
  size = 'md',
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
  fullWidth = false,
  loading = false,
  as = 'button',
  href,
  ...rest
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // Utiliser iconStart comme alias de icon s'il est fourni
  const finalIcon = iconStart || icon;
  
  // Exclure iconStart des props DOM
  const { iconStart: excludedIconStart, ...domProps } = rest;

  // Gestion du positionnement du tooltip
  useEffect(() => {
    if (showTooltip && tooltipRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Centrer le tooltip au-dessus du bouton
      const left = buttonRect.left + (buttonRect.width - tooltipRect.width) / 2;
      const top = buttonRect.top - tooltipRect.height - 8;
      
      tooltipRef.current.style.left = `${left}px`;
      tooltipRef.current.style.top = `${top}px`;
    }
  }, [showTooltip]);

  // Classes CSS
  const buttonClasses = [
    styles.button,
    styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
    iconOnly && styles.buttonIconOnly,
    fullWidth && styles.buttonFullWidth,
    loading && styles.buttonLoading,
    disabled && styles.buttonDisabled,
    className
  ].filter(Boolean).join(' ');

  // Contenu du bouton
  const buttonContent = (
    <>
      {loading && (
        <span className={styles.spinner}>
          <span className={styles.spinnerBorder}></span>
        </span>
      )}
      {!loading && finalIcon && iconPosition === 'left' && (
        <span className={styles.icon}>{finalIcon}</span>
      )}
      {!iconOnly && children && (
        <span className={styles.text}>{children}</span>
      )}
      {!loading && finalIcon && iconPosition === 'right' && (
        <span className={styles.icon}>{finalIcon}</span>
      )}
      {iconOnly && !loading && finalIcon}
    </>
  );

  // Props communes
  const commonProps = {
    ref: buttonRef,
    className: buttonClasses,
    onClick: disabled || loading ? undefined : onClick,
    disabled: disabled || loading,
    onMouseEnter: tooltip ? () => setShowTooltip(true) : undefined,
    onMouseLeave: tooltip ? () => setShowTooltip(false) : undefined,
    'aria-label': iconOnly && tooltip ? tooltip : undefined,
    ...domProps
  };

  // Rendu conditionnel selon le type d'élément
  const Element = as === 'a' ? 'a' : 'button';
  
  const elementProps = as === 'a' 
    ? { ...commonProps, href: disabled ? undefined : href }
    : { ...commonProps, type };

  return (
    <>
      <Element {...elementProps}>
        {buttonContent}
      </Element>
      
      {/* Tooltip personnalisé sans dépendance */}
      {tooltip && showTooltip && (
        <div 
          ref={tooltipRef}
          className={styles.tooltip}
          role="tooltip"
        >
          {tooltip}
          <div className={styles.tooltipArrow}></div>
        </div>
      )}
    </>
  );
};

ButtonMigrated.propTypes = {
  variant: PropTypes.oneOf([
    'primary', 'secondary', 'success', 'danger', 
    'warning', 'info', 'light', 'dark', 'link',
    'outline-primary', 'outline-secondary', 'outline-success',
    'outline-danger', 'outline-warning', 'outline-info',
    'outline-light', 'outline-dark'
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconStart: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  iconOnly: PropTypes.bool,
  tooltip: PropTypes.string,
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  as: PropTypes.oneOf(['button', 'a']),
  href: PropTypes.string
};

export default ButtonMigrated;