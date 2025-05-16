import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './DeleteConcertModalMobile.module.css';

/**
 * Modal de confirmation de suppression d'un concert pour mobile
 */
const DeleteConcertModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  concertNom,
  isDeleting 
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onClose}
      centered
      className={styles.deleteModal}
    >
      <Modal.Header closeButton>
        <Modal.Title className={styles.modalTitle}>Confirmer la suppression</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.warningIcon}>
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <p className={styles.confirmMessage}>
          Êtes-vous sûr de vouloir supprimer le concert
          <span className={styles.concertName}>{concertNom}</span> ?
          <br />
          <small className={styles.warningNote}>Cette action ne peut pas être annulée.</small>
        </p>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button 
          variant="outline-secondary" 
          onClick={onClose}
          disabled={isDeleting}
          className={styles.cancelButton}
        >
          Annuler
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
          disabled={isDeleting}
          className={styles.confirmButton}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Suppression...
            </>
          ) : "Supprimer"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConcertModal;