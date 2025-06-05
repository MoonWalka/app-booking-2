import React from 'react';
import styles from './Badge.module.css';

/**
 * Composant Badge harmonisé avec la maquette TourCraft
 * @param {string} variant - Type de badge: 'blue', 'green', 'yellow', 'red', 'gray', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'
 * @param {string} children - Contenu du badge
 * @param {string} className - Classes CSS supplémentaires
 */
const Badge = ({ variant = 'blue', children, className = '' }) => {
  // Mapper les variants Bootstrap aux variants TourCraft
  const variantMap = {
    'primary': 'blue',
    'secondary': 'gray',
    'success': 'green',
    'warning': 'yellow',
    'danger': 'red',
    'info': 'blue'
  };

  const mappedVariant = variantMap[variant] || variant;

  return (
    <span className={`${styles.badge} ${styles[mappedVariant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
