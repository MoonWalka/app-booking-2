import React from 'react';
import { Form } from 'react-bootstrap';
import Card from '@components/ui/Card';
import styles from './ArtisteNotesSection.module.css';

/**
 * Section component for artist notes
 * Supports both display and edit modes
 * 
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data containing notes
 * @param {Function} props.handleChange - Change handler for form fields
 * @param {boolean} props.isEditing - Whether in edit mode (default true)
 * @param {boolean} props.showCardWrapper - Whether to show card wrapper (default true)
 */
const ArtisteNotesSection = ({ 
  formData, 
  handleChange, 
  isEditing = true, 
  showCardWrapper = true 
}) => {
  // Contenu du formulaire réutilisable
  const formContent = (
    <div>
      {isEditing ? (
        <div className={styles.formGroup}>
          <Form.Control
            as="textarea"
            className={styles.formControl}
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows="4"
            placeholder="Notes sur l'artiste, exigences techniques, préférences..."
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
  );

  // Version sans carte (pour usage dans des wrappers)
  if (!showCardWrapper) {
    return formContent;
  }

  // Version avec carte (pour usage standalone)
  return (
    <Card
      title="Notes sur l'artiste"
      icon={<i className="bi bi-journal-text"></i>}
      variant="primary"
      className={styles.sectionCard}
    >
      {formContent}
    </Card>
  );
};

export default ArtisteNotesSection;