import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { useEntreprise } from '@/context/EntrepriseContext';
import { fonctionsService } from '@/services/fonctionsService';
import './QualificationsManager.css';

const QualificationsManager = ({ type, title, buttonLabel }) => {
    const [itemsList, setItemsList] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentEntreprise } = useEntreprise();
    const [currentItem, setCurrentItem] = useState({
        id: null,
        nom: '',
        code: '',
        actif: true
    });

    // Données d'exemple selon le type
    const getMockData = () => {
        switch (type) {
            case 'pays':
                return [
                    { id: 1, nom: 'France', code: 'FR', actif: true, utilisations: 245 },
                    { id: 2, nom: 'Belgique', code: 'BE', actif: true, utilisations: 67 },
                    { id: 3, nom: 'Suisse', code: 'CH', actif: true, utilisations: 34 },
                    { id: 4, nom: 'Canada', code: 'CA', actif: true, utilisations: 23 },
                    { id: 5, nom: 'Allemagne', code: 'DE', actif: true, utilisations: 45 },
                    { id: 6, nom: 'Espagne', code: 'ES', actif: true, utilisations: 29 },
                    { id: 7, nom: 'Italie', code: 'IT', actif: true, utilisations: 31 },
                    { id: 8, nom: 'Royaume-Uni', code: 'GB', actif: true, utilisations: 18 },
                    { id: 9, nom: 'Portugal', code: 'PT', actif: true, utilisations: 12 },
                    { id: 10, nom: 'Pays-Bas', code: 'NL', actif: true, utilisations: 15 }
                ];
            case 'fonctions':
                return [
                    { id: 1, nom: 'Directeur', code: 'DIR', actif: true, utilisations: 89 },
                    { id: 2, nom: 'Manager', code: 'MGR', actif: true, utilisations: 156 },
                    { id: 3, nom: 'Responsable communication', code: 'COM', actif: true, utilisations: 78 },
                    { id: 4, nom: 'Chargé de production', code: 'PROD', actif: true, utilisations: 134 },
                    { id: 5, nom: 'Assistant', code: 'ASS', actif: true, utilisations: 92 },
                    { id: 6, nom: 'Programmateur', code: 'PROG', actif: true, utilisations: 67 },
                    { id: 7, nom: 'Régisseur', code: 'REG', actif: true, utilisations: 45 },
                    { id: 8, nom: 'Technicien', code: 'TECH', actif: true, utilisations: 38 },
                    { id: 9, nom: 'Comptable', code: 'COMP', actif: true, utilisations: 23 },
                    { id: 10, nom: 'Attaché de presse', code: 'PRESS', actif: true, utilisations: 34 }
                ];
            case 'sources':
                return [
                    { id: 1, nom: 'Site web', code: 'WEB', actif: true, utilisations: 178 },
                    { id: 2, nom: 'Recommandation', code: 'RECO', actif: true, utilisations: 145 },
                    { id: 3, nom: 'Réseau social', code: 'SOCIAL', actif: true, utilisations: 123 },
                    { id: 4, nom: 'Événement', code: 'EVENT', actif: true, utilisations: 89 },
                    { id: 5, nom: 'Partenaire', code: 'PART', actif: true, utilisations: 67 },
                    { id: 6, nom: 'Publicité', code: 'PUB', actif: true, utilisations: 45 },
                    { id: 7, nom: 'Email marketing', code: 'EMAIL', actif: true, utilisations: 56 },
                    { id: 8, nom: 'Presse', code: 'PRESSE', actif: true, utilisations: 34 },
                    { id: 9, nom: 'Salon professionnel', code: 'SALON', actif: true, utilisations: 28 },
                    { id: 10, nom: 'Démarchage téléphonique', code: 'TEL', actif: true, utilisations: 12 }
                ];
            default:
                return [];
        }
    };

    // Chargement initial des données
    useEffect(() => {
        loadItemsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, currentEntreprise?.id]);

    // Initialiser les fonctions par défaut si nécessaire
    // Désactivé temporairement pour éviter la boucle infinie
    /*
    useEffect(() => {
        const initFonctions = async () => {
            if (type === 'fonctions' && currentEntreprise?.id && itemsList.length === 0 && !loading) {
                try {
                    // Vérifier d'abord s'il n'y a vraiment aucune fonction
                    const existingFonctions = await fonctionsService.getAllFonctions(currentEntreprise.id);
                    if (existingFonctions.length === 0) {
                        await fonctionsService.initializeDefaultFonctions(currentEntreprise.id);
                        await loadItemsList();
                    }
                } catch (error) {
                    console.error('Erreur lors de l\'initialisation des fonctions:', error);
                }
            }
        };
        initFonctions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, currentEntreprise?.id]);
    */

    // Filtrage des éléments
    useEffect(() => {
        if (searchTerm) {
            setFilteredItems(itemsList.filter(item => 
                item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.code.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        } else {
            setFilteredItems(itemsList);
        }
    }, [itemsList, searchTerm]);

    const loadItemsList = async () => {
        if (type === 'fonctions' && currentEntreprise?.id) {
            setLoading(true);
            try {
                const fonctions = await fonctionsService.getAllFonctions(currentEntreprise.id);
                setItemsList(fonctions);
            } catch (error) {
                console.error('Erreur lors du chargement des fonctions:', error);
                showSuccessMessage('Erreur lors du chargement des fonctions');
            } finally {
                setLoading(false);
            }
        } else {
            // Utiliser les données mockées pour les autres types
            const mockData = getMockData();
            setItemsList(mockData);
        }
    };

    const handleShowModal = (item = null) => {
        if (item) {
            setCurrentItem({ ...item });
            setIsEditing(true);
        } else {
            setCurrentItem({
                id: null,
                nom: '',
                code: '',
                actif: true
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentItem({
            id: null,
            nom: '',
            code: '',
            actif: true
        });
    };

    const handleSave = async () => {
        if (!currentItem.nom.trim() || !currentItem.code.trim()) {
            return;
        }

        if (type === 'fonctions' && currentEntreprise?.id) {
            try {
                // Vérifier l'unicité du code
                const codeExists = await fonctionsService.checkCodeExists(
                    currentEntreprise.id, 
                    currentItem.code, 
                    isEditing ? currentItem.id : null
                );

                if (codeExists) {
                    alert('Ce code existe déjà. Veuillez choisir un code différent.');
                    return;
                }

                if (isEditing) {
                    await fonctionsService.updateFonction(currentItem.id, {
                        nom: currentItem.nom,
                        code: currentItem.code,
                        actif: currentItem.actif
                    });
                    showSuccessMessage(`Fonction modifiée avec succès`);
                } else {
                    await fonctionsService.createFonction({
                        ...currentItem,
                        entrepriseId: currentEntreprise.id
                    });
                    showSuccessMessage(`Fonction ajoutée avec succès`);
                }
                await loadItemsList();
                handleCloseModal();
            } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
                alert('Erreur lors de la sauvegarde de la fonction');
            }
        } else {
            // Logique mockée pour les autres types
            const codeExists = itemsList.some(item => 
                item.code.toLowerCase() === currentItem.code.toLowerCase() && 
                item.id !== currentItem.id
            );

            if (codeExists) {
                alert('Ce code existe déjà. Veuillez choisir un code différent.');
                return;
            }

            if (isEditing) {
                setItemsList(itemsList.map(item => 
                    item.id === currentItem.id ? currentItem : item
                ));
                showSuccessMessage(`${title.slice(0, -1)} modifié${title.endsWith('s') ? 'e' : ''} avec succès`);
            } else {
                const newItem = {
                    ...currentItem,
                    id: Math.max(...itemsList.map(i => i.id), 0) + 1,
                    utilisations: 0
                };
                setItemsList([...itemsList, newItem]);
                showSuccessMessage(`${title.slice(0, -1)} ajouté${title.endsWith('s') ? 'e' : ''} avec succès`);
            }
            handleCloseModal();
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.nom}" ?`)) {
            if (type === 'fonctions' && currentEntreprise?.id) {
                try {
                    await fonctionsService.deleteFonction(item.id);
                    showSuccessMessage(`Fonction supprimée avec succès`);
                    await loadItemsList();
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    alert(error.message || 'Erreur lors de la suppression de la fonction');
                }
            } else {
                setItemsList(itemsList.filter(i => i.id !== item.id));
                showSuccessMessage(`${title.slice(0, -1)} supprimé${title.endsWith('s') ? 'e' : ''} avec succès`);
            }
        }
    };

    const toggleActif = async (item) => {
        if (type === 'fonctions' && currentEntreprise?.id) {
            try {
                await fonctionsService.toggleFonctionStatus(item.id, !item.actif);
                showSuccessMessage(`Fonction ${!item.actif ? 'activée' : 'désactivée'} avec succès`);
                await loadItemsList();
            } catch (error) {
                console.error('Erreur lors du changement de statut:', error);
                alert('Erreur lors du changement de statut de la fonction');
            }
        } else {
            const updatedItem = { ...item, actif: !item.actif };
            setItemsList(itemsList.map(i => i.id === item.id ? updatedItem : i));
            showSuccessMessage(`${title.slice(0, -1)} ${updatedItem.actif ? 'activé' : 'désactivé'}${title.endsWith('s') ? 'e' : ''} avec succès`);
        }
    };

    const showSuccessMessage = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentItem(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getCodeBadgeVariant = (actif) => {
        return actif ? 'primary' : 'secondary';
    };

    return (
        <div className="qualifications-manager">
            {showAlert && (
                <Alert variant="success" dismissible onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">{title}</h3>
                        <div className="d-flex gap-2">
                            <Button 
                                variant="success" 
                                onClick={() => handleShowModal()}
                                className="d-flex align-items-center gap-2"
                            >
                                <FaPlus /> {buttonLabel}
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={loadItemsList}
                                className="d-flex align-items-center"
                            >
                                <FaSync />
                            </Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder={`Rechercher dans ${title.toLowerCase()}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    ) : (
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Code</th>
                                <th className="text-center">Statut</th>
                                <th className="text-center">Utilisations</th>
                                <th className="text-center" style={{ width: '150px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id} className={!item.actif ? 'text-muted' : ''}>
                                    <td>{item.nom}</td>
                                    <td>
                                        <Badge bg={getCodeBadgeVariant(item.actif)}>
                                            {item.code}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => toggleActif(item)}
                                            className={`p-1 ${item.actif ? 'text-success' : 'text-secondary'}`}
                                        >
                                            <i className={`bi ${item.actif ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i>
                                        </Button>
                                    </td>
                                    <td className="text-center">
                                        <Badge bg="light" text="dark">{item.utilisations}</Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleShowModal(item)}
                                            className="text-warning p-1"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button 
                                            variant="link" 
                                            size="sm"
                                            onClick={() => handleDelete(item)}
                                            className="text-danger p-1 ms-2"
                                            disabled={item.utilisations > 0}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    )}
                    {!loading && filteredItems.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            {searchTerm ? (
                                `Aucun résultat pour "${searchTerm}"`
                            ) : (
                                <>
                                    <p>Aucun élément trouvé</p>
                                    {type === 'fonctions' && currentEntreprise?.id && (
                                        <Button 
                                            variant="primary" 
                                            className="mt-3"
                                            onClick={async () => {
                                                try {
                                                    await fonctionsService.initializeDefaultFonctions(currentEntreprise.id);
                                                    await loadItemsList();
                                                    showSuccessMessage('Fonctions par défaut initialisées avec succès');
                                                } catch (error) {
                                                    console.error('Erreur lors de l\'initialisation:', error);
                                                    alert('Erreur lors de l\'initialisation des fonctions par défaut');
                                                }
                                            }}
                                        >
                                            <i className="bi bi-magic me-2"></i>
                                            Initialiser les fonctions par défaut
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? `Modifier` : `Ajouter`} - {title.slice(0, -1)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom *</Form.Label>
                            <Form.Control
                                type="text"
                                name="nom"
                                value={currentItem.nom}
                                onChange={handleInputChange}
                                placeholder={`Nom ${title.slice(0, -1).toLowerCase()}...`}
                                required
                                autoFocus
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Code *</Form.Label>
                            <Form.Control
                                type="text"
                                name="code"
                                value={currentItem.code}
                                onChange={handleInputChange}
                                placeholder="Code court (ex: FR, DIR, WEB...)"
                                required
                                style={{ textTransform: 'uppercase' }}
                                onInput={(e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                }}
                            />
                            <Form.Text className="text-muted">
                                Code unique pour identifier l'élément
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="actif"
                                label="Actif"
                                checked={currentItem.actif}
                                onChange={handleInputChange}
                            />
                            <Form.Text className="text-muted">
                                Les éléments inactifs ne sont plus proposés dans les formulaires
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
                        disabled={!currentItem.nom.trim() || !currentItem.code.trim()}
                    >
                        {isEditing ? 'Modifier' : 'Ajouter'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default QualificationsManager;