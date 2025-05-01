import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

/**
 * Modal component for structure deletion confirmation
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when cancelling
 * @param {Function} props.onConfirm - Function to call when confirming deletion
 * @param {boolean} props.isDeleting - Whether deletion is in progress
 * @param {Object} props.structure - Structure data
 */
const StructureDeleteModal = ({ show, onClose, onConfirm, isDeleting, structure }) => {
  if (!structure) return null;
  
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmer la suppression</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Êtes-vous sûr de vouloir supprimer cette structure ?</p>
        {structure.programmateursAssocies?.length > 0 && (
          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Cette structure est associée à {structure.programmateursAssocies.length} programmateur(s).
            La suppression retirera ces associations.
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
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
              Supprimer
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StructureDeleteModal;