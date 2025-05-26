import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * DeleteProgrammateurModal - Modal de confirmation de suppression
 */
const DeleteProgrammateurModal = ({
  show,
  onClose,
  onConfirm,
  programmateur,
  isDeleting,
  hasAssociatedConcerts
}) => {
  const programmateurName = programmateur?.nom && programmateur?.prenom 
    ? `${programmateur.prenom} ${programmateur.nom}`
    : 'ce programmateur';

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmer la suppression</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Êtes-vous sûr de vouloir supprimer <strong>{programmateurName}</strong> ?
        </p>
        {hasAssociatedConcerts && (
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Ce programmateur a des concerts associés. La suppression affectera ces relations.
          </div>
        )}
        <p className="text-muted">
          Cette action est irréversible.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Suppression...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-2"></i>
              Supprimer
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteProgrammateurModal; 