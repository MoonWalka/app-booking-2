import React from 'react';
import { Button } from 'react-bootstrap';
import { getBadgeClass, getTypeLabel } from '../utils';
import styles from './StructureHeader.module.css';

/**
 * Header component for structure details page
 * 
 * @param {Object} props - Component props
 * @param {Object} props.structure - Structure data
 * @param {Function} props.onEdit - Function to handle edit button click
 * @param {Function} props.onDelete - Function to handle delete button click
 * @param {Function} props.navigateToList - Function to navigate back to structures list
 */
const StructureHeader = ({ structure, onEdit, onDelete, navigateToList }) => {
  if (!structure) return null;
  
  return (
    <div className={styles.detailsHeader}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbLink} onClick={navigateToList}>
          <i className="bi bi-building me-1"></i>
          Structures
        </span>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{structure.nom || structure.raisonSociale}</span>
      </div>
      
      <div className={styles.headerTitle}>
        <h2>
          <i className="bi bi-building me-2"></i>
          {structure.nom || structure.raisonSociale}
        </h2>
        {structure.type && (
          <span className={`${styles.headerBadge} ${getBadgeClass(structure.type)}`}>
            {getTypeLabel(structure.type)}
          </span>
        )}
      </div>
      
      <div className={styles.headerActions}>
        <Button
          variant="outline-primary"
          className={`${styles.actionButton} ${styles.primaryOutlineButton}`}
          onClick={onEdit}
        >
          <i className="bi bi-pencil me-1"></i>
          Modifier
        </Button>
        <Button
          variant="outline-danger"
          className={`${styles.actionButton} ${styles.dangerOutlineButton}`}
          onClick={onDelete}
        >
          <i className="bi bi-trash me-1"></i>
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default StructureHeader;