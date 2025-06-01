// src/components/common/DownloadModal.js
import React from 'react';
import { Modal } from 'react-bootstrap';
import styles from './DownloadModal.module.css';

/**
 * Modal de téléchargement avec spinner et message de patientage
 */
const DownloadModal = ({ 
  show, 
  title = "Téléchargement en cours", 
  message = "Veuillez patienter pendant le téléchargement du contrat..." 
}) => {
  return (
    <Modal 
      show={show} 
      centered 
      backdrop="static" 
      keyboard={false}
      className={styles.downloadModal}
    >
      <Modal.Body className={styles.modalBody}>
        <div className={styles.content}>
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          </div>
          
          <div className={styles.textContainer}>
            <h5 className={styles.title}>{title}</h5>
            <p className={styles.message}>{message}</p>
            
            <div className={styles.progressInfo}>
              <small className="text-muted">
                <i className="bi bi-download me-2"></i>
                Génération et préparation du fichier PDF...
              </small>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DownloadModal;