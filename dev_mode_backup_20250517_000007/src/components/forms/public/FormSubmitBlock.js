import React from 'react';
import styles from './FormSubmitBlock.module.css';

/**
 * Component to display form submission actions and completion status
 */
const FormSubmitBlock = ({ 
  isSubmitting, 
  isCompleted, 
  onEditRequest, 
  footer 
}) => {
  if (isCompleted) {
    return (
      <div className={`alert alert-success ${styles.completedBlock}`}>
        <h3>Formulaire complété</h3>
        <p>Nous avons bien reçu vos informations. Merci pour votre participation.</p>
        {onEditRequest && (
          <button 
            className="tc-btn-primary mt-3"
            onClick={onEditRequest}
          >
            <i className="bi bi-pencil-square me-2"></i>
            Modifier vos informations
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className={styles.submitBlock}>
      <div className={styles.submitActions}>
        <button 
          type="submit" 
          className="tc-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Envoi en cours...
            </>
          ) : (
            'Envoyer le formulaire'
          )}
        </button>
      </div>
      
      {footer && <div className={styles.formFooter}>{footer}</div>}
    </div>
  );
};

export default FormSubmitBlock;