import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Alert, Badge, InputGroup, Row, Col } from 'react-bootstrap';
import { FaPlus, FaSync, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import './MessagesTachesManager.css';

const MessagesTachesManager = ({ type, title, buttonLabel }) => {
    const [itemsList, setItemsList] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentItem, setCurrentItem] = useState({
        id: null,
        nom: '',
        sujet: '',
        contenu: '',
        type: 'general',
        actif: true
    });

    // Données d'exemple selon le type
    const getMockData = () => {
        switch (type) {
            case 'modeles-email':
                return [
                    { 
                        id: 1, 
                        nom: 'Confirmation de réservation', 
                        sujet: 'Confirmation de votre réservation - {date}',
                        contenu: 'Bonjour {nom},\n\nNous confirmons votre réservation pour le {date} à {heure}.\n\nCordialement,\nL\'équipe TourCraft',
                        type: 'booking',
                        actif: true,
                        utilisations: 245,
                        derniereModif: '2024-01-15'
                    },
                    { 
                        id: 2, 
                        nom: 'Rappel de rendez-vous', 
                        sujet: 'Rappel - Rendez-vous demain à {heure}',
                        contenu: 'Bonjour {nom},\n\nCeci est un rappel pour votre rendez-vous demain à {heure}.\n\nÀ bientôt,\nL\'équipe TourCraft',
                        type: 'rappel',
                        actif: true,
                        utilisations: 123,
                        derniereModif: '2024-01-14'
                    },
                    { 
                        id: 3, 
                        nom: 'Proposition commerciale', 
                        sujet: 'Proposition pour {projet}',
                        contenu: 'Bonjour {nom},\n\nVeuillez trouver ci-joint notre proposition pour {projet}.\n\nCordialement,\n{signature}',
                        type: 'commercial',
                        actif: true,
                        utilisations: 89,
                        derniereModif: '2024-01-12'
                    }
                ];
            case 'formules-types':
                return [
                    { 
                        id: 1, 
                        nom: 'Salutation formelle', 
                        contenu: 'Bonjour {titre} {nom},',
                        type: 'salutation',
                        actif: true,
                        utilisations: 567
                    },
                    { 
                        id: 2, 
                        nom: 'Salutation amicale', 
                        contenu: 'Salut {prenom} !',
                        type: 'salutation',
                        actif: true,
                        utilisations: 234
                    },
                    { 
                        id: 3, 
                        nom: 'Formule de politesse standard', 
                        contenu: 'Cordialement,\nL\'équipe {entreprise}',
                        type: 'politesse',
                        actif: true,
                        utilisations: 789
                    },
                    { 
                        id: 4, 
                        nom: 'Formule de politesse chaleureuse', 
                        contenu: 'Bien à vous,\n{prenom} de l\'équipe {entreprise}',
                        type: 'politesse',
                        actif: true,
                        utilisations: 345
                    },
                    { 
                        id: 5, 
                        nom: 'Demande de confirmation', 
                        contenu: 'Pourriez-vous confirmer votre présence avant le {date_limite} ?',
                        type: 'demande',
                        actif: true,
                        utilisations: 156
                    }
                ];
            case 'signatures':
                return [
                    { 
                        id: 1, 
                        nom: 'Signature standard - Directeur', 
                        contenu: 'Jean Dupont\nDirecteur\nTourCraft\n📧 jean.dupont@tourcraft.com\n📱 +33 1 23 45 67 89\n🌐 www.tourcraft.com',
                        type: 'direction',
                        actif: true,
                        utilisations: 134
                    },
                    { 
                        id: 2, 
                        nom: 'Signature booking', 
                        contenu: 'Marie Martin\nResponsable Booking\nTourCraft\n📧 booking@tourcraft.com\n📱 +33 1 23 45 67 90',
                        type: 'booking',
                        actif: true,
                        utilisations: 98
                    },
                    { 
                        id: 3, 
                        nom: 'Signature communication', 
                        contenu: 'Pierre Durand\nChargé de communication\nTourCraft\n📧 communication@tourcraft.com\n🔗 LinkedIn: pierre-durand-tourcraft',
                        type: 'communication',
                        actif: false,
                        utilisations: 45
                    }
                ];
            default:
                return [];
        }
    };

    // Chargement initial des données
    useEffect(() => {
        loadItemsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    // Filtrage des éléments
    useEffect(() => {
        if (searchTerm) {
            setFilteredItems(itemsList.filter(item => 
                item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.sujet && item.sujet.toLowerCase().includes(searchTerm.toLowerCase())) ||
                item.contenu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        } else {
            setFilteredItems(itemsList);
        }
    }, [itemsList, searchTerm]);

    const loadItemsList = () => {
        const mockData = getMockData();
        setItemsList(mockData);
    };

    const handleShowModal = (item = null) => {
        if (item) {
            setCurrentItem({ ...item });
            setIsEditing(true);
        } else {
            setCurrentItem({
                id: null,
                nom: '',
                sujet: type === 'modeles-email' ? '' : undefined,
                contenu: '',
                type: 'general',
                actif: true
            });
            setIsEditing(false);
        }
        setShowModal(true);
    };

    const handleShowPreview = (item) => {
        setPreviewItem(item);
        setShowPreviewModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentItem({
            id: null,
            nom: '',
            sujet: type === 'modeles-email' ? '' : undefined,
            contenu: '',
            type: 'general',
            actif: true
        });
    };

    const handleSave = () => {
        if (!currentItem.nom.trim() || !currentItem.contenu.trim()) {
            return;
        }

        if (type === 'modeles-email' && !currentItem.sujet.trim()) {
            return;
        }

        if (isEditing) {
            const updatedItem = { ...currentItem, derniereModif: new Date().toISOString().split('T')[0] };
            setItemsList(itemsList.map(item => 
                item.id === currentItem.id ? updatedItem : item
            ));
            showSuccessMessage(`${title.slice(0, -1)} modifié${title.endsWith('s') ? 'e' : ''} avec succès`);
        } else {
            const newItem = {
                ...currentItem,
                id: Math.max(...itemsList.map(i => i.id), 0) + 1,
                utilisations: 0,
                derniereModif: type === 'modeles-email' ? new Date().toISOString().split('T')[0] : undefined
            };
            setItemsList([...itemsList, newItem]);
            showSuccessMessage(`${title.slice(0, -1)} ajouté${title.endsWith('s') ? 'e' : ''} avec succès`);
        }
        handleCloseModal();
    };

    const handleDelete = (item) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.nom}" ?`)) {
            setItemsList(itemsList.filter(i => i.id !== item.id));
            showSuccessMessage(`${title.slice(0, -1)} supprimé${title.endsWith('s') ? 'e' : ''} avec succès`);
        }
    };

    const toggleActif = (item) => {
        const updatedItem = { ...item, actif: !item.actif };
        setItemsList(itemsList.map(i => i.id === item.id ? updatedItem : i));
        showSuccessMessage(`${title.slice(0, -1)} ${updatedItem.actif ? 'activé' : 'désactivé'}${title.endsWith('s') ? 'e' : ''} avec succès`);
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

    const getTypeBadgeVariant = (itemType) => {
        switch (itemType) {
            case 'booking': return 'primary';
            case 'commercial': return 'success';
            case 'communication': return 'info';
            case 'direction': return 'warning';
            case 'rappel': return 'secondary';
            case 'salutation': return 'primary';
            case 'politesse': return 'success';
            case 'demande': return 'info';
            default: return 'secondary';
        }
    };

    const getTypeOptions = () => {
        switch (type) {
            case 'modeles-email':
                return [
                    { value: 'general', label: 'Général' },
                    { value: 'booking', label: 'Booking' },
                    { value: 'commercial', label: 'Commercial' },
                    { value: 'communication', label: 'Communication' },
                    { value: 'rappel', label: 'Rappel' }
                ];
            case 'formules-types':
                return [
                    { value: 'salutation', label: 'Salutation' },
                    { value: 'politesse', label: 'Formule de politesse' },
                    { value: 'demande', label: 'Demande' },
                    { value: 'general', label: 'Général' }
                ];
            case 'signatures':
                return [
                    { value: 'direction', label: 'Direction' },
                    { value: 'booking', label: 'Booking' },
                    { value: 'communication', label: 'Communication' },
                    { value: 'administration', label: 'Administration' },
                    { value: 'general', label: 'Général' }
                ];
            default:
                return [{ value: 'general', label: 'Général' }];
        }
    };

    const renderTable = () => {
        const commonColumns = (
            <>
                <th>Nom</th>
                {type === 'modeles-email' && <th>Sujet</th>}
                <th>Contenu</th>
                <th className="text-center">Type</th>
                <th className="text-center">Statut</th>
                <th className="text-center">Utilisations</th>
                {type === 'modeles-email' && <th className="text-center">Dernière modif.</th>}
                <th className="text-center" style={{ width: '150px' }}>Actions</th>
            </>
        );

        return (
            <Table responsive hover>
                <thead>
                    <tr>{commonColumns}</tr>
                </thead>
                <tbody>
                    {filteredItems.map(item => (
                        <tr key={item.id} className={!item.actif ? 'text-muted' : ''}>
                            <td>{item.nom}</td>
                            {type === 'modeles-email' && (
                                <td>
                                    <div className="text-truncate" style={{ maxWidth: '200px' }} title={item.sujet}>
                                        {item.sujet}
                                    </div>
                                </td>
                            )}
                            <td>
                                <div className="text-truncate" style={{ maxWidth: '250px' }} title={item.contenu}>
                                    {item.contenu}
                                </div>
                            </td>
                            <td className="text-center">
                                <Badge bg={getTypeBadgeVariant(item.type)}>
                                    {getTypeOptions().find(opt => opt.value === item.type)?.label || item.type}
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
                            {type === 'modeles-email' && (
                                <td className="text-center">
                                    <small className="text-muted">{item.derniereModif}</small>
                                </td>
                            )}
                            <td className="text-center">
                                <Button 
                                    variant="link" 
                                    size="sm"
                                    onClick={() => handleShowPreview(item)}
                                    className="text-info p-1"
                                    title="Prévisualiser"
                                >
                                    <FaEye />
                                </Button>
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
                                    className="text-danger p-1"
                                >
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    };

    const renderModalContent = () => (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Nom *</Form.Label>
                <Form.Control
                    type="text"
                    name="nom"
                    value={currentItem.nom}
                    onChange={handleInputChange}
                    placeholder="Nom descriptif..."
                    required
                    autoFocus
                />
            </Form.Group>

            {type === 'modeles-email' && (
                <Form.Group className="mb-3">
                    <Form.Label>Sujet *</Form.Label>
                    <Form.Control
                        type="text"
                        name="sujet"
                        value={currentItem.sujet}
                        onChange={handleInputChange}
                        placeholder="Sujet de l'email (vous pouvez utiliser des variables comme {nom}, {date}...)"
                        required
                    />
                    <Form.Text className="text-muted">
                        Variables disponibles : {'{nom}'}, {'{prenom}'}, {'{entreprise}'}, {'{date}'}, {'{heure}'}...
                    </Form.Text>
                </Form.Group>
            )}

            <Form.Group className="mb-3">
                <Form.Label>Contenu *</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={type === 'modeles-email' ? 8 : 5}
                    name="contenu"
                    value={currentItem.contenu}
                    onChange={handleInputChange}
                    placeholder="Contenu du modèle/formule/signature..."
                    required
                />
                <Form.Text className="text-muted">
                    Variables disponibles : {'{nom}'}, {'{prenom}'}, {'{entreprise}'}, {'{date}'}, {'{signature}'}...
                </Form.Text>
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                            name="type"
                            value={currentItem.type}
                            onChange={handleInputChange}
                        >
                            {getTypeOptions().map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <div className="pt-4">
                            <Form.Check
                                type="checkbox"
                                name="actif"
                                label="Actif"
                                checked={currentItem.actif}
                                onChange={handleInputChange}
                            />
                        </div>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );

    return (
        <div className="messages-taches-manager">
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

                    {renderTable()}

                    {filteredItems.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : `Aucun élément trouvé`}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de création/édition */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {isEditing ? `Modifier` : `Ajouter`} - {title.slice(0, -1)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {renderModalContent()}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annuler
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSave}
                        disabled={!currentItem.nom.trim() || !currentItem.contenu.trim() || 
                                 (type === 'modeles-email' && !currentItem.sujet.trim())}
                    >
                        {isEditing ? 'Modifier' : 'Ajouter'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de prévisualisation */}
            <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Prévisualisation - {previewItem?.nom}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {previewItem && (
                        <div>
                            {type === 'modeles-email' && (
                                <div className="mb-3">
                                    <strong>Sujet :</strong>
                                    <div className="bg-light p-2 rounded mt-1">
                                        {previewItem.sujet}
                                    </div>
                                </div>
                            )}
                            <div>
                                <strong>Contenu :</strong>
                                <div className="bg-light p-3 rounded mt-1" style={{ whiteSpace: 'pre-line' }}>
                                    {previewItem.contenu}
                                </div>
                            </div>
                            <div className="mt-3">
                                <Badge bg={getTypeBadgeVariant(previewItem.type)} className="me-2">
                                    {getTypeOptions().find(opt => opt.value === previewItem.type)?.label || previewItem.type}
                                </Badge>
                                <Badge bg={previewItem.actif ? 'success' : 'secondary'}>
                                    {previewItem.actif ? 'Actif' : 'Inactif'}
                                </Badge>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MessagesTachesManager;