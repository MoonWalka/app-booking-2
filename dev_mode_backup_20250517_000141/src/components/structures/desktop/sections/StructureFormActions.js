import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './StructureFormActions.module.css';

/**
 * Component for structure form action buttons
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isEditMode - Whether the form is in edit mode
 * @param {boolean} props.submitting - Whether the form is submitting
 * @param {Function} props.handleCancel - Cancel handler
 * @returns {JSX.Element} - Rendered component
 */
const StructureFormActions = ({ isEditMode, submitting, handleCancel }) => {
  return (
    <div className={styles.formActions}>
      <Button
        variant="outline-secondary"
        className={styles.cancelButton}
        onClick={handleCancel}
        disabled={submitting}
      >
        <i className="bi bi-x-circle"></i>
        Annuler
      </Button>
      <Button 
        variant="primary" 
        type="submit"
        className={styles.submitButton}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <span className={styles.spinner} role="status" aria-hidden="true"></span>
            Enregistrement...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle"></i>
            {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
          </>
        )}
      </Button>
    </div>
  );
};

export default StructureFormActions;