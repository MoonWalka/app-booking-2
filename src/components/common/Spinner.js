// src/components/common/Spinner.js
import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import styles from '../../components/ui/Spinner.module.css';

/**
 * Composant Spinner unifié pour toute l'application
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.variant='primary'] - Variante de couleur Bootstrap
 * @param {string} [props.size=''] - Taille du spinner (sm ou vide pour taille normale)
 * @param {string} [props.message='Chargement...'] - Message à afficher sous le spinner
 * @param {boolean} [props.fullPage=false] - Si true, centre le spinner au milieu de la page
 * @param {boolean} [props.contentOnly=false] - Si true, affiche le spinner dans la zone de contenu principal sans recouvrir la sidebar
 * @param {boolean} [props.inline=false] - Si true, affiche le spinner en ligne (pour les boutons)
 * @param {boolean} [props.transparent=false] - Si true, utilise un fond transparent pour le spinner
 * @param {string} [props.className=''] - Classes CSS additionnelles
 */
const Spinner = ({ 
  variant = 'primary', 
  size = '', 
  message = 'Chargement...', 
  fullPage = false,
  contentOnly = false,
  inline = false,
  transparent = false,
  className = ''
}) => {
  if (inline) {
    return (
      <BootstrapSpinner 
        as="span" 
        animation="border" 
        size={size || 'sm'} 
        role="status" 
        aria-hidden="true" 
        variant={variant}
        className={className}
      />
    );
  }
  
  let containerClass;
  if (fullPage) {
    containerClass = styles.spinnerContainer;
  } else if (contentOnly) {
    containerClass = `${styles.spinnerContainer} position-relative`;
  } else {
    containerClass = styles.spinnerContainer;
  }

  const spinnerClass = size === 'sm' ? styles.spinnerSmall : styles.spinner;

  return (
    <div className={`${containerClass} ${className}`}>
      <div className={contentOnly ? "position-relative" : ""}>
        <div 
          className={spinnerClass}
          role="status" 
        />
        {message && <p className="spinner-message">{message}</p>}
      </div>
    </div>
  );
};

Spinner.propTypes = {
  variant: PropTypes.string,
  size: PropTypes.string,
  message: PropTypes.string,
  fullPage: PropTypes.bool,
  contentOnly: PropTypes.bool,
  inline: PropTypes.bool,
  transparent: PropTypes.bool,
  className: PropTypes.string
};

export default Spinner;