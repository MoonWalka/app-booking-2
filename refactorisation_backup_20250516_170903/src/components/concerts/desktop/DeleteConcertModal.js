import React from 'react';
import styles from './DeleteConcertModal.module.css';

/**
 * Modal de confirmation pour la suppression d'un concert
 */
const DeleteConcertModal = ({ show, concertNom, onClose, onConfirm, isDeleting }) => {
  if (!show) return null;
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalConfirm}>
        <div className={styles.modalHeader}>
          <h5>Confirmation de suppression</h5>
        </div>
        <div className={styles.modalBody}>
          <p>Êtes-vous sûr de vouloir supprimer le concert <strong>{concertNom}</strong> ? Cette action est irréversible.</p>
        </div>
        <div className={styles.modalFooter}>
          <button 
            className="tc-btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Annuler
          </button>
          <button 
            className="tc-btn-danger" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Suppression...
              </>
            ) : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConcertModal;