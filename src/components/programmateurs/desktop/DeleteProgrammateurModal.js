import React, { useState } from 'react';
import Button from '@ui/Button';
import styles from './DeleteProgrammateurModal.module.css';
import { useDeleteProgrammateur } from '../../contexts/DeleteProgrammateurContext';

const DeleteProgrammateurModal = ({ programmateur, handleDelete }) => {
  const {
    showDeleteModal,
    isDeleting,
    handleConfirmDelete,
    handleCancelDelete
  } = useDeleteProgrammateur({ id: programmateur.id, onDeleteSuccess: handleDelete });
  
  const openModal = () => {
    showDeleteModal();
  };
  
  const closeModal = () => {
    handleCancelDelete();
  };
  
  const confirmDelete = async () => {
    handleConfirmDelete();
  };
  
  // Modal is mounted but only shown when showModal is true
  return (
    <>
      {showDeleteModal && (
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
              <Button 
                type="button" 
                variant="secondary"
                onClick={closeModal}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button 
                type="button" 
                variant="danger"
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
              </Button>
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
