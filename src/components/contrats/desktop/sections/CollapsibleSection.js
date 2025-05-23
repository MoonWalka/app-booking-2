import React from 'react';
import Button from '@ui/Button';
import styles from './CollapsibleSection.module.css';

/**
 * Composant de section repliable réutilisable
 */
const CollapsibleSection = ({ title, isCollapsed, toggleCollapse, children }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <Button 
          variant="outline-secondary"
          size="sm"
          type="button"
          onClick={toggleCollapse}
        >
          <i className={`bi bi-chevron-${isCollapsed ? 'up' : 'down'}`}></i>
        </Button>
      </div>
      {!isCollapsed && (
        <div className={styles.cardBody}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;