import React from 'react';
import styles from './StructureNotesSection.module.css';

/**
 * Component for displaying notes about a structure
 * 
 * @param {Object} props - Component props
 * @param {String} props.notes - Structure notes text
 */
const StructureNotesSection = ({ notes }) => {
  if (!notes) return null;
  
  return (
    <div className={styles.detailsCard}>
      <div className={styles.cardHeader}>
        <i className="bi bi-sticky me-2"></i>
        <h3>Notes</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.notesContent}>
          {notes.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StructureNotesSection;