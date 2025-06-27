import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import { useParametres } from '@/context/ParametresContext';
import './UnitesManager.css';

const UnitesManager = () => {
    const { parametres, sauvegarderParametres } = useParametres();
    const [unitesList, setUnitesList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [currentUnite, setCurrentUnite] = useState({
        id: null,
        nom: '',
        pluriel: '',
        categorie: ''
    });

    // Catégories d'unités
    const categories = [
        { value: 'temps', label: 'Temps' },
        { value: 'quantite', label: 'Quantité' },
        { value: 'distance', label: 'Distance' },
        { value: 'service', label: 'Service' },
        { value: 'autre', label: 'Autre' }
    ];

    // Chargement initial des données depuis les paramètres
    useEffect(() => {
        if (parametres?.unites && Array.isArray(parametres.unites)) {
            setUnitesList(parametres.unites);
        } else if (parametres?.unites) {
            console.error('parametres.unites n\'est pas un array:', parametres.unites);
        }
    }, [parametres?.unites]);

    const loadUnitesList = async () => {
        // Rafraîchir depuis les paramètres
        if (parametres?.unites && Array.isArray(parametres.unites)) {
            setUnitesList(parametres.unites);
        }
    };

    const handleShowModal = (unite = null) => {
        if (unite) {
            setCurrentUnite({ ...unite });
            setIsEditing(true);
        } else {
            setCurrentUnite({
                id: null,
                nom: '',
                pluriel: '',
                categorie: ''
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentUnite({
            id: null,
            nom: '',
            pluriel: '',
            categorie: ''
        });
    };

    const handleSave = async () => {
        if (!currentUnite.nom || !currentUnite.categorie) {
            showSuccessMessage('Le nom et la catégorie sont obligatoires', 'danger');
            return;
        }

        setSaving(true);
        try {
            // Si pas de pluriel fourni, on utilise le singulier
            const unite = {
                ...currentUnite,
                pluriel: currentUnite.pluriel || currentUnite.nom
            };

            let updatedUnitesList;
            
            if (isEditing) {
                // Mise à jour d'une unité existante
                updatedUnitesList = unitesList.map(item => 
                    item.id === unite.id ? unite : item
                );
            } else {
                // Ajout d'une nouvelle unité
                const newUnite = {
                    ...unite,
                    id: Date.now() // Utiliser timestamp comme ID unique
                };
                updatedUnitesList = [...unitesList, newUnite];
            }
            
            // Sauvegarder dans Firebase via ParametresContext
            await sauvegarderParametres('unites', updatedUnitesList);
            
            // Mettre à jour l'état local
            setUnitesList(updatedUnitesList);
            
            showSuccessMessage(
                isEditing ? 'Unité modifiée avec succès' : 'Unité ajoutée avec succès',
                'success'
            );
            handleCloseModal();
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showSuccessMessage('Erreur lors de la sauvegarde des unités', 'danger');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (unite) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'unité "${unite.nom}" ?`)) {
            setSaving(true);
            try {
                const updatedUnitesList = unitesList.filter(item => item.id !== unite.id);
                
                // Sauvegarder dans Firebase
                await sauvegarderParametres('unites', updatedUnitesList);
                
                // Mettre à jour l'état local
                setUnitesList(updatedUnitesList);
                
                showSuccessMessage('Unité supprimée avec succès', 'success');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                showSuccessMessage('Erreur lors de la suppression de l\'unité', 'danger');
            } finally {
                setSaving(false);
            }
        }
    };

    const showSuccessMessage = (message, type = 'success') => {
        setAlertMessage({ text: message, type });
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentUnite(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getCategoryLabel = (value) => {
        const category = categories.find(cat => cat.value === value);
        return category ? category.label : value;
    };

    const getCategoryVariant = (value) => {
        const variants = {
            temps: 'primary',
            quantite: 'success',
            distance: 'warning',
            service: 'info',
            autre: 'secondary'
        };
        return variants[value] || 'secondary';
    };

    return (
        <div className="unites-manager">
            {showAlert && (
                <Alert 
                    variant={alertMessage.type || 'success'} 
                    dismissible 
                    onClose={() => setShowAlert(false)}
                >
                    {alertMessage.text || alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">Gestion des unités</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> Nouvelle unité
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadUnitesList}
                                className="d-flex align-items-center"
                                disabled={saving}
                            >
                                <FaSync className={saving ? 'fa-spin' : ''} />
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Nom (singulier)</th>
                                <th>Nom (pluriel)</th>
                                <th>Catégorie</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unitesList.map(unite => (
                                <tr key={unite.id}>
                                    <td>{unite.nom}</td>
                                    <td>{unite.pluriel}</td>
                                    <td>
                                        <Badge bg={getCategoryVariant(unite.categorie)}>
                                            {getCategoryLabel(unite.categorie)}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(unite)}
                                            className="text-warning p-1"
                                            disabled={saving}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(unite)}
                                            className="text-danger p-1 ms-2"
                                            disabled={saving}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {unitesList.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            Aucune unité trouvée
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? "Modifier l'unité" : 'Nouvelle unité'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom (singulier)</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={currentUnite.nom}
                                onChange={handleInputChange}
                                placeholder="Ex: heure, jour, personne..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nom (pluriel)</Form.Label>
                            <Form.Control
                                type="text"
                                name="pluriel"
                                value={currentUnite.pluriel}
                                onChange={handleInputChange}
                                placeholder="Ex: heures, jours, personnes..."
                            />
                            <Form.Text className="text-muted">
                                Si vide, le singulier sera utilisé
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Catégorie</Form.Label>
                            <Form.Select
                                name="categorie"
                                value={currentUnite.categorie}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
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
                        disabled={!currentUnite.nom || !currentUnite.categorie || saving}
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UnitesManager;