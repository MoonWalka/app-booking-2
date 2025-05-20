import React from 'react';
import Button from '@components/ui/Button';
import styles from './EntrepriseSubmitActions.module.css';

/**
 * Component for form submission actions
 * 
 * @param {Object} props - Component props
 * @param {Function} props.handleSubmit - Form submission handler
 * @param {boolean} props.loading - Whether the form is currently submitting
 */
const EntrepriseSubmitActions = ({ handleSubmit, loading }) => {
  return (
    <div className={styles.actionBar}>
      <Button 
        type="submit"
        variant="primary"
        className={styles.saveButton}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Saving...
          </>
        ) : (
          <>
            <i className="bi bi-check-circle me-2"></i>
            Save Company Information
          </>
        )}
      </Button>
    </div>
  );
};

export default EntrepriseSubmitActions;