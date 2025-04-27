// src/components/common/Spinner.js
import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

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
    containerClass = 'spinner-fullpage-container';
  } else if (contentOnly) {
    containerClass = 'spinner-content-container position-relative';
  } else {
    containerClass = 'spinner-container';
  }

  const overlayClass = transparent ? "spinner-overlay spinner-overlay-transparent" : "spinner-overlay";

  return (
    <div className={`${containerClass} ${className}`}>
      <div className={contentOnly ? "position-relative" : overlayClass}>
        <BootstrapSpinner 
          animation="border" 
          variant={variant} 
          size={size}
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