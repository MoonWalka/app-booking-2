import React from 'react';
import styles from './DeleteConfirmModal.module.css';

/**
 * DeleteConfirmModal - Modal de confirmation de suppression d'un concert
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.isSubmitting - Indique si la suppression est en cours
 * @param {Function} props.onCancel - Fonction à appeler pour annuler la suppression
 * @param {Function} props.onConfirm - Fonction à appeler pour confirmer la suppression
 */
const DeleteConfirmModal = ({ isSubmitting, onCancel, onConfirm }) => {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalTitle}>Confirmation de suppression</h5>
          <button 
            type="button" 
            className={styles.closeButton} 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.warningIcon}>
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <p>Êtes-vous sûr de vouloir supprimer ce concert ?</p>
          <p className={styles.warningText}>Cette action est irréversible et supprimera également ce concert des programmateurs et artistes associés.</p>
        </div>
        
        <div className={styles.modalFooter}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Suppression...
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
