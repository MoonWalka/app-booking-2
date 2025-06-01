import React from 'react';
import Card from '@/components/ui/Card';
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
    <Card
      title="Notes"
      icon={<i className="bi bi-sticky"></i>}
    >
        <div className={styles.notesContent}>
          {notes.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
    </Card>
  );
};

export default StructureNotesSection;