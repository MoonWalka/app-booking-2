import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import './MentionsManager.css';

const MentionsManager = () => {
    const [mentionsList, setMentionsList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [currentMention, setCurrentMention] = useState({
        id: null,
        texte: '',
        langue: 'Français',
        type: '',
        actif: true
    });

    // Types de mentions
    const typesMentions = [
        { value: 'signature', label: 'Signature' },
        { value: 'conditions_vente', label: 'Conditions particulières de vente' },
        { value: 'modalites_paiement', label: 'Modalités de paiement' },
        { value: 'info_complementaires', label: 'Informations complémentaires' },
        { value: 'autre', label: 'Autre' }
    ];

    // Langues disponibles
    const langues = ['Français', 'Anglais', 'Espagnol', 'Allemand'];

    // Chargement initial des données
    useEffect(() => {
        loadMentionsList();
    }, []);

    const loadMentionsList = () => {
        // Simulation de données pour l'exemple
        const mockData = [
            { 
                id: 1, 
                texte: 'Signature du client précédée de la mention « Lu et approuvé, bon pour accord »', 
                langue: 'Français',
                type: 'signature',
                actif: true
            },
            { 
                id: 2, 
                texte: 'Paiement à réception de la facture', 
                langue: 'Français',
                type: 'conditions_vente',
                actif: true
            },
            { 
                id: 3, 
                texte: 'TVA non applicable selon l\'article 293 B', 
                langue: 'Français',
                type: 'modalites_paiement',
                actif: true
            },
            { 
                id: 4, 
                texte: 'Hébergement à la charge de l\'organisateur', 
                langue: 'Français',
                type: 'info_complementaires',
                actif: true
            }
        ];
        setMentionsList(mockData);
    };

    const handleShowModal = (mention = null) => {
        if (mention) {
            setCurrentMention({ ...mention });
            setIsEditing(true);
        } else {
            setCurrentMention({
                id: null,
                texte: '',
                langue: 'Français',
                type: '',
                actif: true
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentMention({
            id: null,
            texte: '',
            langue: 'Français',
            type: '',
            actif: true
        });
    };

    const handleSave = () => {
        if (!currentMention.texte || !currentMention.type) {
            return;
        }

        if (isEditing) {
            setMentionsList(mentionsList.map(item => 
                item.id === currentMention.id ? currentMention : item
            ));
            showSuccessMessage('Mention modifiée avec succès');
        } else {
            const newMention = {
                ...currentMention,
                id: Math.max(...mentionsList.map(m => m.id), 0) + 1
            };
            setMentionsList([...mentionsList, newMention]);
            showSuccessMessage('Mention ajoutée avec succès');
        }
        handleCloseModal();
    };

    const handleDelete = (mention) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette mention ?`)) {
            setMentionsList(mentionsList.filter(item => item.id !== mention.id));
            showSuccessMessage('Mention supprimée avec succès');
        }
    };

    const toggleActif = (mention) => {
        setMentionsList(mentionsList.map(item => 
            item.id === mention.id ? { ...item, actif: !item.actif } : item
        ));
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentMention(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getTypeLabel = (value) => {
        const type = typesMentions.find(t => t.value === value);
        return type ? type.label : value;
    };

    const getTypeVariant = (value) => {
        const variants = {
            signature: 'primary',
            conditions_vente: 'success',
            modalites_paiement: 'warning',
            info_complementaires: 'info',
            autre: 'secondary'
        };
        return variants[value] || 'secondary';
    };

    return (
        <div className="mentions-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Gestion des mentions</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouvelle mention
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadMentionsList}
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
                                <th style={{ width: '40%' }}>Texte</th>
                                <th>Type</th>
                                <th>Langue</th>
                                <th className="text-center">État</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mentionsList.map(mention => (
                                <tr key={mention.id}>
                                    <td className="text-wrap">
                                        <small>{mention.texte}</small>
                                    </td>
                                    <td>
                                        <Badge bg={getTypeVariant(mention.type)}>
                                            {getTypeLabel(mention.type)}
                                        </Badge>
                                    </td>
                                    <td>{mention.langue}</td>
                                    <td className="text-center">
                                        <Form.Check 
                                            type="switch"
                                            checked={mention.actif}
                                            onChange={() => toggleActif(mention)}
                                            label=""
                                        />
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(mention)}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(mention)}
                                            className="text-danger p-1 ms-2"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {mentionsList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucune mention trouvée
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? 'Modifier la mention' : 'Nouvelle mention'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Texte de la mention</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="texte"
                                value={currentMention.texte}
                                onChange={handleInputChange}
                                placeholder="Entrez le texte de la mention..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={currentMention.type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Sélectionner un type</option>
                                {typesMentions.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Langue</Form.Label>
                            <Form.Select
                                name="langue"
                                value={currentMention.langue}
                                onChange={handleInputChange}
                            >
                                {langues.map(langue => (
                                    <option key={langue} value={langue}>
                                        {langue}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="actif"
                                label="Mention active"
                                checked={currentMention.actif}
                                onChange={handleInputChange}
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
                        disabled={!currentMention.texte || !currentMention.type}
                    >
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MentionsManager;