import React from 'react';
import PropTypes from 'prop-types';
import styles from './Alert.module.css';

/**
 * Composant Alert standardisé TourCraft
 * Remplace les classes Bootstrap alert-* (danger, warning, info, success)
 * Suit les standards CSS TourCraft avec variables --tc-*
 * 
 * @param {Object} props - Props du composant
 * @returns {React.ReactElement} Le composant Alert rendu
 */
const Alert = ({
  variant = 'info',
  children,
  className = '',
  dismissible = false,
  onDismiss,
  icon,
  title,
  role = 'alert',
  ...props
}) => {
  const alertClasses = [
    styles.alert,
    styles[`alert--${variant}`],
    dismissible ? styles['alert--dismissible'] : '',
    className
  ].filter(Boolean).join(' ');

  // Icônes par défaut selon le variant
  const defaultIcons = {
    success: <i className="bi bi-check-circle-fill"></i>,
    danger: <i className="bi bi-exclamation-triangle-fill"></i>,
    warning: <i className="bi bi-exclamation-triangle-fill"></i>,
    info: <i className="bi bi-info-circle-fill"></i>,
    light: <i className="bi bi-lightbulb"></i>
  };

  const displayIcon = icon !== null ? (icon || defaultIcons[variant]) : null;

  return (
    <div className={alertClasses} role={role} {...props}>
      <div className={styles.alertContent}>
        {displayIcon && (
          <div className={styles.alertIcon}>
            {displayIcon}
          </div>
        )}
        
        <div className={styles.alertBody}>
          {title && (
            <div className={styles.alertTitle}>
              {title}
            </div>
          )}
          
          <div className={styles.alertMessage}>
            {children}
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <button
            type="button"
            className={styles.alertDismiss}
            onClick={onDismiss}
            aria-label="Fermer l'alerte"
          >
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info', 'light']),
  children: PropTypes.node,
  className: PropTypes.string,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  icon: PropTypes.node,
  title: PropTypes.string,
  role: PropTypes.string
};

export default Alert; 