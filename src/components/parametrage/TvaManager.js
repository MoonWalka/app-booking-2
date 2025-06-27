import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash } from 'react-icons/fa';
import { useParametres } from '@/context/ParametresContext';
import './TvaManager.css';

const TvaManager = () => {
    const { parametres, sauvegarderParametres } = useParametres();
    const [tvaList, setTvaList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [saving, setSaving] = useState(false);
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

    // Chargement initial des données depuis les paramètres
    useEffect(() => {
        if (parametres?.tva) {
            if (Array.isArray(parametres.tva)) {
                // Adapter la structure des données pour le composant
                const adaptedTva = parametres.tva.map(tva => ({
                    ...tva,
                    profil: tva.profil || 'Standard',
                    compte: tva.compte || ''
                }));
                setTvaList(adaptedTva);
            } else {
                console.error('⚠️ parametres.tva n\'est pas un tableau:', parametres.tva);
                console.log('ℹ️ Le ParametresContext devrait automatiquement migrer ces données');
                // Si c'est un objet, essayer de le convertir localement (en attendant la migration automatique)
                if (typeof parametres.tva === 'object') {
                    const convertedTva = Object.keys(parametres.tva)
                        .filter(key => !isNaN(parseInt(key)))
                        .map(key => ({
                            ...parametres.tva[key],
                            profil: parametres.tva[key]?.profil || 'Standard',
                            compte: parametres.tva[key]?.compte || ''
                        }))
                        .filter(item => item && item.libelle && item.taux);
                    
                    if (convertedTva.length > 0) {
                        console.log('✅ Conversion locale réussie, en attente de migration permanente');
                        setTvaList(convertedTva);
                    }
                }
            }
        }
    }, [parametres?.tva]);

    const loadTvaList = async () => {
        // Rafraîchir depuis les paramètres
        if (parametres?.tva && Array.isArray(parametres.tva)) {
            const adaptedTva = parametres.tva.map(tva => ({
                ...tva,
                profil: tva.profil || 'Standard',
                compte: tva.compte || ''
            }));
            setTvaList(adaptedTva);
        }
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

    const handleSave = async () => {
        if (!currentTva.libelle || !currentTva.taux) {
            showSuccessMessage('Le libellé et le taux sont obligatoires', 'danger');
            return;
        }

        setSaving(true);
        try {
            let updatedTvaList;
            
            if (isEditing) {
                // Mise à jour d'un taux existant
                updatedTvaList = tvaList.map(item => 
                    item.id === currentTva.id ? { ...currentTva, taux: parseFloat(currentTva.taux) } : item
                );
            } else {
                // Ajout d'un nouveau taux
                const newTva = {
                    ...currentTva,
                    id: Date.now(), // Utiliser timestamp comme ID unique
                    taux: parseFloat(currentTva.taux)
                };
                updatedTvaList = [...tvaList, newTva];
            }
            
            // Sauvegarder dans Firebase via ParametresContext
            await sauvegarderParametres('tva', updatedTvaList);
            
            // Mettre à jour l'état local
            setTvaList(updatedTvaList);
            
            showSuccessMessage(
                isEditing ? 'Taux de TVA modifié avec succès' : 'Taux de TVA ajouté avec succès',
                'success'
            );
            handleCloseModal();
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showSuccessMessage('Erreur lors de la sauvegarde des taux TVA', 'danger');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (tva) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le taux "${tva.libelle}" ?`)) {
            setSaving(true);
            try {
                const updatedTvaList = tvaList.filter(item => item.id !== tva.id);
                
                // Sauvegarder dans Firebase
                await sauvegarderParametres('tva', updatedTvaList);
                
                // Mettre à jour l'état local
                setTvaList(updatedTvaList);
                
                showSuccessMessage('Taux de TVA supprimé avec succès', 'success');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                showSuccessMessage('Erreur lors de la suppression du taux TVA', 'danger');
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
        setCurrentTva(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="tva-manager">
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
                                            disabled={saving}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(tva)}
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
                            <Form.Label>Compte (optionnel)</Form.Label>
                            <Form.Select
                                name="compte"
                                value={currentTva.compte}
                                onChange={handleInputChange}
                            >
                                <option value="">Aucun compte</option>
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
                        disabled={!currentTva.libelle || !currentTva.taux || saving}
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TvaManager;