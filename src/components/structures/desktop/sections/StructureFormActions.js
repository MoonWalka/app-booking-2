import React from 'react';
import Button from '../../../ui/Button';
import styles from './StructureFormActions.module.css';

/**
 * Component for structure form action buttons
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isEditMode - Whether the form is in edit mode
 * @param {boolean} props.submitting - Whether the form is submitting
 * @param {Function} props.handleCancel - Cancel handler
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.isDeleting - Whether the form is deleting
 * @returns {JSX.Element} - Rendered component
 */
const StructureFormActions = ({ isEditMode, submitting, handleCancel, onDelete, isDeleting }) => {
  return (
    <div className={styles.formActions}>
      <Button
        variant="outline"
        className={styles.cancelButton}
        onClick={handleCancel}
        disabled={submitting}
      >
        <i className="bi bi-x-circle"></i>
        Annuler
      </Button>
      {isEditMode && onDelete && (
        <Button
          variant="danger"
          className={styles.cancelButton}
          onClick={onDelete}
          disabled={submitting || isDeleting}
        >
          {isDeleting ? (
            <>
              <span className={styles.spinner} role="status" aria-hidden="true"></span>
              Suppression...
            </>
          ) : (
            <>
              <i className="bi bi-trash"></i>
              Supprimer
            </>
          )}
        </Button>
      )}
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