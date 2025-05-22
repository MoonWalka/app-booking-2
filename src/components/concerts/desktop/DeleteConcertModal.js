import React from 'react';
import styles from './DeleteConcertModal.module.css';
import Button from '@/components/ui/Button';

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
          <Button 
            className="tc-btn-secondary"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button 
            className="tc-btn-danger"
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Suppression...
              </>
            ) : 'Supprimer définitivement'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConcertModal;