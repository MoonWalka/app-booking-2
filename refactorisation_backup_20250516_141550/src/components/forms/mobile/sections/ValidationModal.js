import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './ValidationModal.module.css';

/**
 * Modal de confirmation pour la validation des données
 * Version adaptée pour mobile
 */
const ValidationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  isProcessing 
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered className={styles.validationModal}>
      <Modal.Header closeButton>
        <Modal.Title className={styles.modalTitle}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.messageContainer}>
          <i className="bi bi-question-circle-fill me-2"></i>
          <p className={styles.confirmMessage}>{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button 
          variant="outline-secondary" 
          onClick={onClose}
          disabled={isProcessing}
          className={styles.cancelButton}
        >
          Annuler
        </Button>
        <Button 
          variant="primary" 
          onClick={onConfirm}
          disabled={isProcessing}
          className={styles.confirmButton}
        >
          {isProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Validation en cours...
            </>
          ) : (
            'Valider'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ValidationModal;