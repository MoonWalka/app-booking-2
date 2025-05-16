import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './DeleteLieuModal.module.css';

/**
 * Confirmation modal for deleting a venue
 */
const DeleteLieuModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  lieu, 
  isDeleting, 
  hasAssociatedConcerts 
}) => {
  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false}>
      <div className={styles.modalHeader}>
        <h5 className={styles.modalTitle}>
          <i className={`bi bi-exclamation-triangle-fill ${styles.warningIcon}`}></i>
          Supprimer ce lieu
        </h5>
      </div>
      <div className={styles.modalBody}>
        <p>Êtes-vous sûr de vouloir supprimer définitivement le lieu <strong>{lieu?.nom}</strong> ?</p>
        <p>Cette action ne peut pas être annulée.</p>
        
        {hasAssociatedConcerts && (
          <div className={styles.concertsWarning}>
            <p className="mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Attention :</strong> Ce lieu a des concerts associés. 
              La suppression du lieu n'entraîne pas la suppression des concerts, 
              mais les concerts associés perdront leur référence de lieu.
            </p>
          </div>
        )}
      </div>
      <div className={styles.modalFooter}>
        <Button 
          variant="outline-secondary" 
          onClick={onClose}
          disabled={isDeleting}
        >
          Annuler
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
          disabled={isDeleting}
          className={styles.deleteBtn}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Suppression en cours...
            </>
          ) : (
            <>
              <i className="bi bi-trash"></i>
              Supprimer définitivement
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteLieuModal;