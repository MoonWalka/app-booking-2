import React from 'react';
import styles from './CollapsibleSection.module.css';

/**
 * Composant de section repliable réutilisable
 */
const CollapsibleSection = ({ title, isCollapsed, toggleCollapse, children }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <button 
          className="btn btn-sm btn-outline-secondary"
          type="button"
          onClick={toggleCollapse}
        >
          <i className={`bi bi-chevron-${isCollapsed ? 'up' : 'down'}`}></i>
        </button>
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