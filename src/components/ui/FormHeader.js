import React from 'react';
import PropTypes from 'prop-types';
import styles from './FormHeader.module.css';

/**
 * Composant FormHeader - Header standardisé avec gradient bleu pour les formulaires
 * Style inspiré du formulaire contact maquette
 */
const FormHeader = ({
  title,
  icon,
  subtitle,
  actions = [],
  className = '',
  isLoading = false,
  rounded = false,
  roundedTop = false,
  ...props
}) => {
  const headerClasses = [
    styles.formHeader,
    rounded && styles.rounded,
    roundedTop && styles.roundedTop,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses} {...props}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.headerTitle}>
            {icon && <span className={styles.headerIcon}>{icon}</span>}
            {title}
          </h1>
          {subtitle && (
            <p className={styles.headerSubtitle}>{subtitle}</p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className={styles.headerActions}>
            {actions.map((action, index) => (
              <React.Fragment key={index}>
                {action}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
};

FormHeader.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  subtitle: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.node),
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  rounded: PropTypes.bool,
  roundedTop: PropTypes.bool
};

export default FormHeader;