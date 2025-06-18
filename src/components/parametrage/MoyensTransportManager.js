import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash, FaBus, FaTrain, FaPlane, FaCar, FaTaxi, FaSubway } from 'react-icons/fa';
import './MoyensTransportManager.css';

const MoyensTransportManager = () => {
    const [transportsList, setTransportsList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentTransport, setCurrentTransport] = useState({
        id: null,
        libelle: '',
        libelleAnglais: ''
    });

    // Map des icônes pour chaque type de transport
    const transportIcons = {
        'Bus': FaBus,
        'Metro': FaSubway,
        'Taxi': FaTaxi,
        'Train': FaTrain,
        'Avion': FaPlane,
        'Tram': FaSubway,
        'Tour-Bus': FaBus,
        'Véhicule perso': FaCar,
        'Véhicule de loc': FaCar
    };

    // Chargement initial des données
    useEffect(() => {
        loadTransportsList();
    }, []);

    const loadTransportsList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            { id: 1, libelle: 'Bus', libelleAnglais: 'Bus' },
            { id: 2, libelle: 'Metro', libelleAnglais: 'Subway' },
            { id: 3, libelle: 'Taxi', libelleAnglais: 'Taxi' },
            { id: 4, libelle: 'Train', libelleAnglais: 'Train' },
            { id: 5, libelle: 'Avion', libelleAnglais: 'Plane' },
            { id: 6, libelle: 'Tram', libelleAnglais: 'Tram' },
            { id: 7, libelle: 'Tour-Bus', libelleAnglais: 'Tour Bus' },
            { id: 8, libelle: 'Véhicule perso', libelleAnglais: 'Personal vehicle' },
            { id: 9, libelle: 'Véhicule de loc', libelleAnglais: 'Rental vehicle' }
        ];
        setTransportsList(mockData);
    };

    const handleShowModal = (transport = null) => {
        if (transport) {
            setCurrentTransport({ ...transport });
            setIsEditing(true);
        } else {
            setCurrentTransport({
                id: null,
                libelle: '',
                libelleAnglais: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentTransport({
            id: null,
            libelle: '',
            libelleAnglais: ''
        });
    };

    const handleSave = () => {
        if (!currentTransport.libelle.trim()) {
            return;
        }

        if (isEditing) {
            setTransportsList(transportsList.map(item => 
                item.id === currentTransport.id ? currentTransport : item
            ));
            showSuccessMessage('Moyen de transport modifié avec succès');
        } else {
            const newTransport = {
                ...currentTransport,
                id: Math.max(...transportsList.map(t => t.id), 0) + 1
            };
            setTransportsList([...transportsList, newTransport]);
            showSuccessMessage('Moyen de transport ajouté avec succès');
        }
        handleCloseModal();
    };

    const handleDelete = (transport) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le moyen de transport "${transport.libelle}" ?`)) {
            setTransportsList(transportsList.filter(item => item.id !== transport.id));
            showSuccessMessage('Moyen de transport supprimé avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentTransport(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const renderTransportIcon = (libelle) => {
        const IconComponent = transportIcons[libelle];
        return IconComponent ? <IconComponent className="me-2 text-primary" /> : null;
    };

    return (
        <div className="moyens-transport-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Gestion des moyens de transport</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouveau moyen de transport
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadTransportsList}
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
                                <th>Libellé</th>
                                <th>Libellé anglais</th>
                                <th className="text-center" style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transportsList.map(transport => (
                                <tr key={transport.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            {renderTransportIcon(transport.libelle)}
                                            <span>{transport.libelle}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {transport.libelleAnglais ? (
                                            <span className="text-muted fst-italic">
                                                {transport.libelleAnglais}
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(transport)}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(transport)}
                                            className="text-danger p-1 ms-2"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {transportsList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucun moyen de transport trouvé
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? 'Modifier le moyen de transport' : 'Nouveau moyen de transport'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Libellé</Form.Label>
                            <Form.Control
                                type="text"
                                name="libelle"
                                value={currentTransport.libelle}
                                onChange={handleInputChange}
                                placeholder="Ex: Bus, Train, Avion..."
                                required
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Libellé anglais</Form.Label>
                            <Form.Control
                                type="text"
                                name="libelleAnglais"
                                value={currentTransport.libelleAnglais}
                                onChange={handleInputChange}
                                placeholder="Ex: Bus, Train, Plane..."
                            />
                            <Form.Text className="text-muted">
                                Optionnel - Traduction anglaise du libellé
                            </Form.Text>
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
                        disabled={!currentTransport.libelle.trim()}
                    >
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MoyensTransportManager;