import React from 'react';
import styles from './Badge.module.css';

/**
 * Composant Badge harmonisé avec la maquette TourCraft
 * @param {string} variant - Type de badge: 'blue', 'green', 'yellow', 'red', 'gray'
 * @param {string} children - Contenu du badge
 * @param {string} className - Classes CSS supplémentaires
 */
const Badge = ({ variant = 'blue', children, className = '' }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
