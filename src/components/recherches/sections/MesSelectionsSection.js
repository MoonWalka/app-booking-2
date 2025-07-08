import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, ListGroup, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { AuthContext } from '../../../context/AuthContext';
import { searchService } from '../../../services/searchService';
import { selectionsService } from '../../../services/selectionsService';
import styles from './Sections.module.css';

/**
 * Section Mes sélections pour gérer les recherches sauvegardées
 */
const MesSelectionsSection = ({ onLoadSelection }) => {
  const { currentUser } = useContext(AuthContext);
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectionToDelete, setSelectionToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectionToEdit, setSelectionToEdit] = useState(null);
  const [editName, setEditName] = useState('');

  // Charger les sélections au montage
  useEffect(() => {
    loadSelections();
  }, [currentUser]);

  const loadSelections = async () => {
    if (!currentUser?.uid || !currentUser?.entrepriseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await selectionsService.getUserSelections(
        currentUser.uid,
        currentUser.entrepriseId
      );

      if (result.success) {
        setSelections(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des sélections');
      }
    } catch (err) {
      console.error('Erreur chargement sélections:', err);
      setError('Impossible de charger les sélections');
    } finally {
      setLoading(false);
    }
  };

  // Formater la date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Charger une sélection
  const handleLoadSelection = (selection) => {
    if (onLoadSelection && selection.criteres) {
      onLoadSelection(selection.criteres);
    }
  };

  // Supprimer une sélection
  const handleDeleteSelection = async () => {
    if (!selectionToDelete) return;

    try {
      const result = await selectionsService.deleteSelection(selectionToDelete.id);
      
      if (result.success) {
        // Recharger la liste
        await loadSelections();
        setShowDeleteModal(false);
        setSelectionToDelete(null);
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Impossible de supprimer la sélection');
    }
  };

  // Modifier une sélection
  const handleEditSelection = async () => {
    if (!selectionToEdit || !editName.trim()) return;

    try {
      const result = await selectionsService.updateSelection(selectionToEdit.id, {
        nom: editName
      });
      
      if (result.success) {
        // Recharger la liste
        await loadSelections();
        setShowEditModal(false);
        setSelectionToEdit(null);
        setEditName('');
      } else {
        alert('Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur modification:', error);
      alert('Impossible de modifier la sélection');
    }
  };

  // Ouvrir la modal d'édition
  const openEditModal = (selection) => {
    setSelectionToEdit(selection);
    setEditName(selection.nom || '');
    setShowEditModal(true);
  };

  // Rendre le contenu
  if (loading) {
    return (
      <div className={styles.sectionContent}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement des sélections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.sectionContent}>
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.sectionContent}>
      <h4 className="mb-4">
        <i className="bi bi-bookmark-star me-2"></i>
        Mes sélections
      </h4>

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-list-check me-2"></i>
              Recherches sauvegardées
            </h5>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={loadSelections}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Actualiser
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {selections.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-bookmark fs-1 d-block mb-3"></i>
              <p>Aucune recherche sauvegardée</p>
              <small>Créez une recherche et enregistrez-la pour la retrouver ici</small>
            </div>
          ) : (
            <ListGroup variant="flush">
              {selections.map((selection) => (
                <ListGroup.Item 
                  key={selection.id}
                  className="d-flex justify-content-between align-items-center py-3"
                >
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <h6 className="mb-0 me-3">{selection.nom}</h6>
                      {selection.shared && (
                        <Badge bg="info" className="me-2">
                          <i className="bi bi-share me-1"></i>
                          Partagé
                        </Badge>
                      )}
                      {!selection.isOwner && (
                        <Badge bg="secondary">
                          <i className="bi bi-people me-1"></i>
                          Partagé avec vous
                        </Badge>
                      )}
                    </div>
                    <small className="text-muted d-block">
                      {selection.criteres?.length || 0} critère{(selection.criteres?.length || 0) > 1 ? 's' : ''}
                      {selection.description && ` • ${selection.description}`}
                    </small>
                    <small className="text-muted">
                      Créée le {formatDate(selection.createdAt)}
                    </small>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleLoadSelection(selection)}
                      title="Charger cette recherche"
                    >
                      <i className="bi bi-play-fill"></i>
                    </Button>
                    
                    {selection.isOwner && (
                      <>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => openEditModal(selection)}
                          title="Renommer"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectionToDelete(selection);
                            setShowDeleteModal(true);
                          }}
                          title="Supprimer"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer la recherche "{selectionToDelete?.nom}" ?
          <br />
          Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteSelection}>
            <i className="bi bi-trash me-2"></i>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'édition */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renommer la recherche</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nom de la recherche</Form.Label>
            <Form.Control
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Entrez un nom pour cette recherche"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEditSelection}
            disabled={!editName.trim()}
          >
            <i className="bi bi-check-lg me-2"></i>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MesSelectionsSection;