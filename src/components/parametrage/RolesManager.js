import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import './RolesManager.css';

const RolesManager = () => {
    const [rolesList, setRolesList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentRole, setCurrentRole] = useState({
        id: null,
        nom: ''
    });

    // Chargement initial des données
    useEffect(() => {
        loadRolesList();
    }, []);

    const loadRolesList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            { id: 1, nom: 'Chargé de production' },
            { id: 2, nom: 'Régisseur' },
            { id: 3, nom: 'Ingénieur son' },
            { id: 4, nom: 'Ingénieur lumière' },
            { id: 5, nom: 'Responsable accueil' },
            { id: 6, nom: 'Assistant technique' },
            { id: 7, nom: 'Directeur artistique' }
        ];
        setRolesList(mockData);
    };

    const handleShowModal = (role = null) => {
        if (role) {
            setCurrentRole({ ...role });
            setIsEditing(true);
        } else {
            setCurrentRole({
                id: null,
                nom: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentRole({
            id: null,
            nom: ''
        });
    };

    const handleSave = () => {
        if (!currentRole.nom.trim()) {
            return;
        }

        if (isEditing) {
            setRolesList(rolesList.map(item => 
                item.id === currentRole.id ? currentRole : item
            ));
            showSuccessMessage('Rôle modifié avec succès');
        } else {
            const newRole = {
                ...currentRole,
                id: Math.max(...rolesList.map(r => r.id), 0) + 1
            };
            setRolesList([...rolesList, newRole]);
            showSuccessMessage('Rôle ajouté avec succès');
        }
        handleCloseModal();
    };

    const handleDelete = (role) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`)) {
            setRolesList(rolesList.filter(item => item.id !== role.id));
            showSuccessMessage('Rôle supprimé avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentRole(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="roles-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Gestion des rôles</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouveau rôle
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadRolesList}
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
                            {rolesList.map(role => (
                                <tr key={role.id}>
                                    <td>{role.nom}</td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(role)}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(role)}
                                            className="text-danger p-1 ms-2"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {rolesList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucun rôle trouvé
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? 'Modifier le rôle' : 'Nouveau rôle'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={currentRole.nom}
                                onChange={handleInputChange}
                                placeholder="Ex: Chargé de production, Régisseur..."
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
                        disabled={!currentRole.nom.trim()}
                    >
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RolesManager;