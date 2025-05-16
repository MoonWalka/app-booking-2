import React, { useState } from 'react';
import styles from './DeleteProgrammateurModal.module.css';

const DeleteProgrammateurModal = ({ programmateur, handleDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const openModal = () => {
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDelete();
      // Navigate will be handled in the handleDelete function
    } catch (error) {
      console.error('Error in delete confirmation:', error);
      setIsDeleting(false);
      closeModal();
    }
  };
  
  // Modal is mounted but only shown when showModal is true
  return (
    <>
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className="modal-title">Confirmer la suppression</h5>
              <button type="button" className={styles.closeButton} onClick={closeModal}>
                <span>&times;</span>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.alertDanger}>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Cette action est irréversible !
              </div>
              <p>
                Êtes-vous sûr de vouloir supprimer définitivement le programmateur 
                <strong> {programmateur?.nom}</strong> ?
              </p>
              {programmateur?.concertsAssocies?.length > 0 && (
                <div className={styles.alertWarning}>
                  <i className="bi bi-info-circle-fill me-2"></i>
                  <span>
                    Ce programmateur est associé à {programmateur.concertsAssocies.length} concert(s).
                    La suppression n'affectera pas les concerts associés, mais le lien entre eux sera perdu.
                  </span>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={closeModal}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Suppression...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* This component doesn't render anything visible by default, 
          it's only activated when the delete button is pressed elsewhere */}
    </>
  );
};

export default DeleteProgrammateurModal;
