import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import './MetiersManager.css';

const MetiersManager = () => {
    const [metiersList, setMetiersList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentMetier, setCurrentMetier] = useState({
        id: null,
        nom: ''
    });

    // Chargement initial des données
    useEffect(() => {
        loadMetiersList();
    }, []);

    const loadMetiersList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            { id: 1, nom: 'Artiste' },
            { id: 2, nom: 'Technicien' },
            { id: 3, nom: 'Ingénieur son' },
            { id: 4, nom: 'Ingénieur lumière' },
            { id: 5, nom: 'Régisseur général' },
            { id: 6, nom: 'Chargé de production' },
            { id: 7, nom: 'Assistant plateau' }
        ];
        setMetiersList(mockData);
    };

    const handleShowModal = (metier = null) => {
        if (metier) {
            setCurrentMetier({ ...metier });
            setIsEditing(true);
        } else {
            setCurrentMetier({
                id: null,
                nom: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentMetier({
            id: null,
            nom: ''
        });
    };

    const handleSave = () => {
        if (!currentMetier.nom.trim()) {
            return;
        }

        if (isEditing) {
            setMetiersList(metiersList.map(item => 
                item.id === currentMetier.id ? currentMetier : item
            ));
            showSuccessMessage('Métier modifié avec succès');
        } else {
            const newMetier = {
                ...currentMetier,
                id: Math.max(...metiersList.map(m => m.id), 0) + 1
            };
            setMetiersList([...metiersList, newMetier]);
            showSuccessMessage('Métier ajouté avec succès');
        }
        handleCloseModal();
    };

    const handleDelete = (metier) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le métier "${metier.nom}" ?`)) {
            setMetiersList(metiersList.filter(item => item.id !== metier.id));
            showSuccessMessage('Métier supprimé avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentMetier(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="metiers-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Gestion des métiers</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouveau métier
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadMetiersList}
                                className="d-flex align-items-center"
                            >
                                <FaSync />
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th className="text-center" style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metiersList.map(metier => (
                                <tr key={metier.id}>
                                    <td>{metier.nom}</td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(metier)}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(metier)}
                                            className="text-danger p-1 ms-2"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {metiersList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucun métier trouvé
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? 'Modifier le métier' : 'Nouveau métier'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={currentMetier.nom}
                                onChange={handleInputChange}
                                placeholder="Ex: Artiste, Technicien..."
                                required
                                autoFocus
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annuler
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSave}
                        disabled={!currentMetier.nom.trim()}
                    >
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MetiersManager;