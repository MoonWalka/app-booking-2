import React from 'react';
import styles from './ValidationModal.module.css';

const ValidationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmer la validation",
  message = "Êtes-vous sûr de vouloir valider ce formulaire ?",
  confirmText = "Valider",
  isProcessing = false
}) => {
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>{title}</h4>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            disabled={isProcessing}
          >
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isProcessing}
          >
            Annuler
          </button>
          <button 
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className={styles.spinner}></span>
                En cours...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationModal;
