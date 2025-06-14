import React from 'react';
import { Form } from 'react-bootstrap';
import styles from './StructureNotesSection.module.css';

/**
 * Section component for structure notes
 * Supports both display and edit modes
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data containing notes
 * @param {Function} props.handleChange - Change handler for form fields
 * @param {boolean} props.isEditing - Whether in edit mode (default true)
 */
const StructureNotesSection = ({ formData, handleChange, isEditing = true }) => {
  return (
    <div className={styles.formSection}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <i className="bi bi-pencil-square section-icon"></i>
          <h3 className={styles.sectionTitle}>Notes</h3>
        </div>
        <div className={styles.sectionBody}>
          {isEditing ? (
            <div className={styles.formGroup}>
              <Form.Control
                as="textarea"
                className={styles.formControl}
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows="4"
                placeholder="Notes internes..."
              />
            </div>
          ) : (
            <div className={styles.notesContent}>
              {formData.notes ? (
                formData.notes.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))
              ) : (
                <p className={styles.emptyNotes}>Aucune note</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StructureNotesSection;