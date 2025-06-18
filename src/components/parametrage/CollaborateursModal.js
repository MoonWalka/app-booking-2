import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, ListGroup, Form } from 'react-bootstrap';
import { FaArrowRight, FaArrowLeft, FaUser, FaUsers } from 'react-icons/fa';

const CollaborateursModal = ({ show, onHide, groupe, onSaveCollaborateurs }) => {
    const [collaborateursDisponibles, setCollaborateursDisponibles] = useState([]);
    const [collaborateursSelectionnes, setCollaborateursSelectionnes] = useState([]);
    const [searchDisponibles, setSearchDisponibles] = useState('');
    const [searchSelectionnes, setSearchSelectionnes] = useState('');

    // Simulation de données des collaborateurs
    const mockCollaborateurs = [
        { id: 1, nom: 'Martin', prenom: 'Jean', email: 'jean.martin@example.com', role: 'Admin' },
        { id: 2, nom: 'Dupont', prenom: 'Marie', email: 'marie.dupont@example.com', role: 'Utilisateur' },
        { id: 3, nom: 'Bernard', prenom: 'Paul', email: 'paul.bernard@example.com', role: 'Invité' },
        { id: 4, nom: 'Moreau', prenom: 'Sophie', email: 'sophie.moreau@example.com', role: 'Stagiaire' },
        { id: 5, nom: 'Petit', prenom: 'Lucas', email: 'lucas.petit@example.com', role: 'Utilisateur' },
        { id: 6, nom: 'Durand', prenom: 'Emma', email: 'emma.durand@example.com', role: 'Test' }
    ];

    useEffect(() => {
        if (show && groupe) {
            // Charger les collaborateurs déjà affectés au groupe
            const affectes = groupe.collaborateurs || [];
            const disponibles = mockCollaborateurs.filter(
                collab => !affectes.some(aff => aff.id === collab.id)
            );
            
            setCollaborateursDisponibles(disponibles);
            setCollaborateursSelectionnes(affectes);
        }
    }, [show, groupe]);

    const moveToSelected = (collaborateur) => {
        setCollaborateursDisponibles(prev => 
            prev.filter(c => c.id !== collaborateur.id)
        );
        setCollaborateursSelectionnes(prev => [...prev, collaborateur]);
    };

    const moveToAvailable = (collaborateur) => {
        setCollaborateursSelectionnes(prev => 
            prev.filter(c => c.id !== collaborateur.id)
        );
        setCollaborateursDisponibles(prev => [...prev, collaborateur]);
    };

    const handleSave = () => {
        onSaveCollaborateurs(groupe.id, collaborateursSelectionnes);
        onHide();
    };

    const filterCollaborateurs = (collaborateurs, searchTerm) => {
        if (!searchTerm) return collaborateurs;
        return collaborateurs.filter(collab => 
            collab.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collab.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collab.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const renderCollaborateurItem = (collaborateur, isSelected = false) => (
        <ListGroup.Item 
            key={collaborateur.id}
            className="d-flex justify-content-between align-items-center p-2"
            style={{ cursor: 'pointer' }}
            onClick={() => isSelected ? moveToAvailable(collaborateur) : moveToSelected(collaborateur)}
        >
            <div className="d-flex align-items-center">
                <FaUser className="me-2 text-muted" />
                <div>
                    <div className="fw-bold">
                        {collaborateur.prenom} {collaborateur.nom}
                    </div>
                    <small className="text-muted">{collaborateur.email}</small>
                    <div>
                        <small className="badge bg-secondary">{collaborateur.role}</small>
                    </div>
                </div>
            </div>
            <Button
                variant="link"
                size="sm"
                className={isSelected ? "text-danger" : "text-success"}
                onClick={(e) => {
                    e.stopPropagation();
                    isSelected ? moveToAvailable(collaborateur) : moveToSelected(collaborateur);
                }}
            >
                {isSelected ? <FaArrowLeft /> : <FaArrowRight />}
            </Button>
        </ListGroup.Item>
    );

    if (!groupe) return null;

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaUsers className="me-2" />
                    Gérer les collaborateurs - {groupe.nom}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={6}>
                        <Card>
                            <Card.Header className="bg-light">
                                <h6 className="mb-0">
                                    Collaborateurs disponibles ({filterCollaborateurs(collaborateursDisponibles, searchDisponibles).length})
                                </h6>
                            </Card.Header>
                            <Card.Body className="p-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchDisponibles}
                                    onChange={(e) => setSearchDisponibles(e.target.value)}
                                    className="mb-3"
                                />
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <ListGroup variant="flush">
                                        {filterCollaborateurs(collaborateursDisponibles, searchDisponibles).map(collab => 
                                            renderCollaborateurItem(collab, false)
                                        )}
                                        {filterCollaborateurs(collaborateursDisponibles, searchDisponibles).length === 0 && (
                                            <ListGroup.Item className="text-center text-muted py-4">
                                                Aucun collaborateur disponible
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card>
                            <Card.Header className="bg-primary text-white">
                                <h6 className="mb-0">
                                    Collaborateurs sélectionnés ({filterCollaborateurs(collaborateursSelectionnes, searchSelectionnes).length})
                                </h6>
                            </Card.Header>
                            <Card.Body className="p-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchSelectionnes}
                                    onChange={(e) => setSearchSelectionnes(e.target.value)}
                                    className="mb-3"
                                />
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <ListGroup variant="flush">
                                        {filterCollaborateurs(collaborateursSelectionnes, searchSelectionnes).map(collab => 
                                            renderCollaborateurItem(collab, true)
                                        )}
                                        {filterCollaborateurs(collaborateursSelectionnes, searchSelectionnes).length === 0 && (
                                            <ListGroup.Item className="text-center text-muted py-4">
                                                Aucun collaborateur sélectionné
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">
                        <strong>Instructions :</strong> Cliquez sur un collaborateur ou utilisez les flèches pour le déplacer entre les listes.
                        Les collaborateurs sélectionnés auront accès aux permissions définies pour ce groupe.
                    </small>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Annuler
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Enregistrer les modifications
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CollaborateursModal;