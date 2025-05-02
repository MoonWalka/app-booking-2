import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './ActionBarMobile.module.css';

/**
 * Barre d'actions fixe en bas de l'écran pour mobile
 * Contient les boutons d'édition, sauvegarde, annulation et suppression
 */
const ActionBarMobile = ({
  isEditMode,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  isSubmitting,
  canSave
}) => {
  return (
    <div className={styles.actionBarContainer}>
      {isEditMode ? (
        // Mode édition: boutons Annuler et Sauvegarder
        <div className={styles.actionButtonGroup}>
          <Button
            variant="outline-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={isSubmitting || !canSave}
            className={styles.saveButton}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sauvegarde...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i>
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      ) : (
        // Mode affichage: boutons Éditer et Supprimer
        <div className={styles.actionButtonGroup}>
          <Button
            variant="danger"
            onClick={onDelete}
            className={styles.deleteButton}
          >
            <i className="bi bi-trash me-1"></i>
            Supprimer
          </Button>
          <Button
            variant="primary"
            onClick={onEdit}
            className={styles.editButton}
          >
            <i className="bi bi-pencil me-1"></i>
            Modifier
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionBarMobile;