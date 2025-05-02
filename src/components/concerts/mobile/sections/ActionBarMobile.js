import React from 'react';
import Button from '@/components/ui/Button';
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
            icon={<i className="bi bi-x-lg"></i>}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={isSubmitting || !canSave}
            className={styles.saveButton}
            icon={isSubmitting ? null : <i className="bi bi-check-lg"></i>}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder'
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
            icon={<i className="bi bi-trash"></i>}
          >
            Supprimer
          </Button>
          <Button
            variant="primary"
            onClick={onEdit}
            className={styles.editButton}
            icon={<i className="bi bi-pencil"></i>}
          >
            Modifier
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionBarMobile;