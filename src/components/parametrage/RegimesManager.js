import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import './RegimesManager.css';

const RegimesManager = () => {
    const [regimesList, setRegimesList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentRegime, setCurrentRegime] = useState({
        id: null,
        libelle: '',
        code: ''
    });

    // Chargement initial des données
    useEffect(() => {
        loadRegimesList();
    }, []);

    const loadRegimesList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            { id: 1, libelle: 'Bénévole', code: 'BEN' },
            { id: 2, libelle: 'Général', code: 'GEN' },
            { id: 3, libelle: 'Intermittent', code: 'INT' },
            { id: 4, libelle: 'Prestataire', code: 'PRE' },
            { id: 5, libelle: 'Stagiaire', code: 'STA' }
        ];
        setRegimesList(mockData);
    };

    const handleShowModal = (regime = null) => {
        if (regime) {
            setCurrentRegime({ ...regime });
            setIsEditing(true);
        } else {
            setCurrentRegime({
                id: null,
                libelle: '',
                code: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentRegime({
            id: null,
            libelle: '',
            code: ''
        });
    };

    const handleSave = () => {
        if (!currentRegime.libelle.trim() || !currentRegime.code.trim()) {
            return;
        }

        if (isEditing) {
            setRegimesList(regimesList.map(item => 
                item.id === currentRegime.id ? currentRegime : item
            ));
            showSuccessMessage('Régime modifié avec succès');
        } else {
            const newRegime = {
                ...currentRegime,
                id: Math.max(...regimesList.map(r => r.id), 0) + 1,
                code: currentRegime.code.toUpperCase()
            };
            setRegimesList([...regimesList, newRegime]);
            showSuccessMessage('Régime ajouté avec succès');
        }
        handleCloseModal();
    };

    const handleDelete = (regime) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le régime "${regime.libelle}" ?`)) {
            setRegimesList(regimesList.filter(item => item.id !== regime.id));
            showSuccessMessage('Régime supprimé avec succès');
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentRegime(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getRegimeVariant = (code) => {
        const variants = {
            'BEN': 'info',
            'GEN': 'primary',
            'INT': 'success',
            'PRE': 'warning',
            'STA': 'secondary'
        };
        return variants[code] || 'secondary';
    };

    return (
        <div className="regimes-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Gestion des régimes</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouveau régime
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadRegimesList}
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
                                <th>Code</th>
                                <th className="text-center" style={{ width: '120px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regimesList.map(regime => (
                                <tr key={regime.id}>
                                    <td>{regime.libelle}</td>
                                    <td>
                                        <Badge bg={getRegimeVariant(regime.code)}>
                                            {regime.code}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(regime)}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(regime)}
                                            className="text-danger p-1 ms-2"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {regimesList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucun régime trouvé
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? 'Modifier le régime' : 'Nouveau régime'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Libellé</Form.Label>
                            <Form.Control
                                type="text"
                                name="libelle"
                                value={currentRegime.libelle}
                                onChange={handleInputChange}
                                placeholder="Ex: Bénévole, Intermittent..."
                                required
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Code</Form.Label>
                            <Form.Control
                                type="text"
                                name="code"
                                value={currentRegime.code}
                                onChange={handleInputChange}
                                placeholder="Ex: BEN, INT..."
                                maxLength={3}
                                required
                                style={{ textTransform: 'uppercase' }}
                            />
                            <Form.Text className="text-muted">
                                Code court de 3 lettres maximum
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
                        disabled={!currentRegime.libelle.trim() || !currentRegime.code.trim()}
                    >
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RegimesManager;