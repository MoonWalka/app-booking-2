import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import './TvaManager.css';

const TvaManager = () => {
    const [tvaList, setTvaList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentTva, setCurrentTva] = useState({
        id: null,
        libelle: '',
        profil: '',
        taux: '',
        compte: ''
    });

    // Simulation de données pour les comptes
    const compteOptions = [
        { label: 'Compte 701', value: '701' },
        { label: 'Compte 702', value: '702' },
        { label: 'Compte 703', value: '703' },
        { label: 'Compte 704', value: '704' }
    ];

    // Chargement initial des données
    useEffect(() => {
        loadTvaList();
    }, []);

    const loadTvaList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            { id: 1, libelle: 'Billetterie', profil: 'Standard', taux: 2.1, compte: '701' },
            { id: 2, libelle: 'Réduit', profil: 'Spécial', taux: 5.5, compte: '702' },
            { id: 3, libelle: 'Normal', profil: 'Standard', taux: 20, compte: '703' }
        ];
        setTvaList(mockData);
    };

    const handleShowModal = (tva = null) => {
        if (tva) {
            setCurrentTva({ ...tva });
            setIsEditing(true);
        } else {
            setCurrentTva({
                id: null,
                libelle: '',
                profil: '',
                taux: '',
                compte: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentTva({
            id: null,
            libelle: '',
            profil: '',
            taux: '',
            compte: ''
        });
    };

    const handleSave = () => {
        if (!currentTva.libelle || !currentTva.taux || !currentTva.compte) {
            return;
        }

        if (isEditing) {
            // Mise à jour d'un taux existant
            setTvaList(tvaList.map(item => 
                item.id === currentTva.id ? { ...currentTva, taux: parseFloat(currentTva.taux) } : item
            ));
            showSuccessMessage('Taux de TVA modifié avec succès');
        } else {
            // Ajout d'un nouveau taux
            const newTva = {
                ...currentTva,
                id: Math.max(...tvaList.map(t => t.id), 0) + 1,
                taux: parseFloat(currentTva.taux)
            };
            setTvaList([...tvaList, newTva]);
            showSuccessMessage('Taux de TVA ajouté avec succès');
        }
        handleCloseModal();
    };

    const handleDelete = (tva) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le taux "${tva.libelle}" ?`)) {
            setTvaList(tvaList.filter(item => item.id !== tva.id));
            showSuccessMessage('Taux de TVA supprimé avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentTva(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="tva-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Gestion des taux de TVA</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouveau taux de TVA
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadTvaList}
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
                                <th>Intitulé</th>
                                <th>Profil</th>
                                <th>Taux</th>
                                <th>Compte</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tvaList.map(tva => (
                                <tr key={tva.id}>
                                    <td>{tva.libelle}</td>
                                    <td>{tva.profil}</td>
                                    <td>{tva.taux} %</td>
                                    <td>{tva.compte}</td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(tva)}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(tva)}
                                            className="text-danger p-1 ms-2"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {tvaList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucun taux de TVA trouvé
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? 'Modifier le taux de TVA' : 'Nouveau taux de TVA'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Libellé</Form.Label>
                            <Form.Control
                                type="text"
                                name="libelle"
                                value={currentTva.libelle}
                                onChange={handleInputChange}
                                placeholder="Ex: Billetterie, Réduit, Normal..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Profil</Form.Label>
                            <Form.Control
                                type="text"
                                name="profil"
                                value={currentTva.profil}
                                onChange={handleInputChange}
                                placeholder="Ex: Standard, Spécial..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Taux (%)</Form.Label>
                            <Form.Control
                                type="number"
                                name="taux"
                                value={currentTva.taux}
                                onChange={handleInputChange}
                                placeholder="Ex: 20"
                                step="0.1"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Compte</Form.Label>
                            <Form.Select
                                name="compte"
                                value={currentTva.compte}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Sélectionner un compte</option>
                                {compteOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
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
                        disabled={!currentTva.libelle || !currentTva.taux || !currentTva.compte}
                    >
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TvaManager;