import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import './HorairesManager.css';

const HorairesManager = () => {
    const [horairesList, setHorairesList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentHoraire, setCurrentHoraire] = useState({
        id: null,
        libelle: '',
        libelleAnglais: ''
    });

    // Chargement initial des données
    useEffect(() => {
        loadHorairesList();
    }, []);

    const loadHorairesList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            { id: 1, libelle: 'Déjeuner', libelleAnglais: 'Lunch' },
            { id: 2, libelle: 'Balances', libelleAnglais: 'Sound check' },
            { id: 3, libelle: 'Entrée en scène', libelleAnglais: 'Stage time' },
            { id: 4, libelle: 'Get in', libelleAnglais: 'Get in' },
            { id: 5, libelle: 'Montage', libelleAnglais: 'Set up' },
            { id: 6, libelle: 'Démontage', libelleAnglais: 'Strike' },
            { id: 7, libelle: 'Ouverture des portes', libelleAnglais: 'Doors open' },
            { id: 8, libelle: 'Dîner', libelleAnglais: 'Dinner' },
            { id: 9, libelle: 'Fermeture des portes', libelleAnglais: 'Doors close' },
            { id: 10, libelle: 'Répétition', libelleAnglais: 'Rehearsal' },
            { id: 11, libelle: 'Filage', libelleAnglais: 'Run-through' }
        ];
        setHorairesList(mockData);
    };

    const handleShowModal = (horaire = null) => {
        if (horaire) {
            setCurrentHoraire({ ...horaire });
            setIsEditing(true);
        } else {
            setCurrentHoraire({
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
        setCurrentHoraire({
            id: null,
            libelle: '',
            libelleAnglais: ''
        });
    };

    const handleSave = () => {
        if (!currentHoraire.libelle.trim()) {
            return;
        }

        if (isEditing) {
            setHorairesList(horairesList.map(item => 
                item.id === currentHoraire.id ? currentHoraire : item
            ));
            showSuccessMessage('Horaire modifié avec succès');
        } else {
            const newHoraire = {
                ...currentHoraire,
                id: Math.max(...horairesList.map(h => h.id), 0) + 1
            };
            setHorairesList([...horairesList, newHoraire]);
            showSuccessMessage('Horaire ajouté avec succès');
        }
        handleCloseModal();
    };

    const handleDelete = (horaire) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'horaire "${horaire.libelle}" ?`)) {
            setHorairesList(horairesList.filter(item => item.id !== horaire.id));
            showSuccessMessage('Horaire supprimé avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentHoraire(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="horaires-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Gestion des horaires</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouvel horaire
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadHorairesList}
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
                            {horairesList.map(horaire => (
                                <tr key={horaire.id}>
                                    <td>{horaire.libelle}</td>
                                    <td>
                                        {horaire.libelleAnglais ? (
                                            <span className="text-muted fst-italic">
                                                {horaire.libelleAnglais}
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(horaire)}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(horaire)}
                                            className="text-danger p-1 ms-2"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {horairesList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucun horaire trouvé
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Modifier l'horaire" : 'Nouvel horaire'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Libellé</Form.Label>
                            <Form.Control
                                type="text"
                                name="libelle"
                                value={currentHoraire.libelle}
                                onChange={handleInputChange}
                                placeholder="Ex: Déjeuner, Balances..."
                                required
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Libellé anglais</Form.Label>
                            <Form.Control
                                type="text"
                                name="libelleAnglais"
                                value={currentHoraire.libelleAnglais}
                                onChange={handleInputChange}
                                placeholder="Ex: Lunch, Sound check..."
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
                        disabled={!currentHoraire.libelle.trim()}
                    >
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default HorairesManager;