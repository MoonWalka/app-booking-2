import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import styles from './ContactFormActions.module.css';

/**
 * ContactFormActions - Boutons d'action pour le formulaire de contact
 * Gère les boutons de sauvegarde, suppression et annulation
 */
const ContactFormActions = ({ 
  isSubmitting, 
  isSaving,
  isEditMode,
  handleCancel, 
  handleDelete,
  confirmDelete
}) => {
  return (
    <div className={styles.formActions}>
      <div className={styles.leftActions}>
        {isEditMode && (
          <Button 
            variant="outline-danger" 
            onClick={handleDelete}
            className={styles.deleteButton}
            disabled={isSubmitting}
          >
            <i className="bi bi-trash"></i> Supprimer
          </Button>
        )}
      </div>
      
      <div className={styles.rightActions}>
        <Button 
          variant="outline-secondary" 
          onClick={handleCancel}
          className={styles.cancelButton}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        
        <Button 
          variant="primary" 
          type="submit"
          className={styles.saveButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className={styles.spinner}
              />
              <span>{isSaving ? 'Enregistrement...' : 'Traitement...'}</span>
            </>
          ) : (
            <>
              <i className="bi bi-check-lg"></i> Enregistrer
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContactFormActions;
