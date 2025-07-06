import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatusBadge.module.css';

/**
 * Composant StatusBadge unifié pour tous les statuts
 * Remplace les styles inline et harmonise l'affichage
 */
const StatusBadge = ({ 
  status, 
  variant = 'default',
  size = 'sm',
  children 
}) => {
  // Mappage automatique des statuts vers les variantes
  const getVariantFromStatus = (status) => {
    const statusMap = {
      // Dates
      'brouillon': 'secondary',
      'confirme': 'success',
      'annule': 'danger',
      'reporte': 'warning',
      
      // Artistes/Contacts
      'active': 'success',
      'inactive': 'secondary',
      'actif': 'success',
      'inactif': 'secondary',
      
      // Général
      'success': 'success',
      'warning': 'warning',
      'danger': 'danger',
      'error': 'danger',
      'info': 'info',
      'primary': 'primary'
    };
    
    return statusMap[status] || 'default';
  };

  const finalVariant = status ? getVariantFromStatus(status) : variant;
  const displayText = children || (status ? capitalizeFirst(status) : '');

  const className = `${styles.badge} ${styles[finalVariant]} ${styles[size]}`;

  return (
    <span className={className}>
      {displayText}
    </span>
  );
};

// Fonction utilitaire pour capitaliser la première lettre
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

StatusBadge.propTypes = {
  status: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  children: PropTypes.node
};

export default StatusBadge;